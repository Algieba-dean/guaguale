import { Solar } from 'lunar-javascript';

export interface NajiaLine {
  position: number;       // 1-6 (from bottom to top)
  value: number;          // 6, 7, 8, 9
  lineType: 'yang' | 'yin';
  isChanging: boolean;
  beast: string;          // 六神 (青龙, 朱雀, 勾陈, 腾蛇, 白虎, 玄武)
  relation: string;       // 六亲 (兄弟, 子孙, 妻财, 官鬼, 父母)
  branch: string;         // 地支
  element: string;        // 五行
  isShi: boolean;
  isYing: boolean;
  isVoid: boolean;        // 旬空
  isYuePo: boolean;       // 月破
  isRiPo: boolean;        // 日破
  isAnDong: boolean;      // 暗动
}

export interface LiuyaoLayoutResult {
  yearGanzhi: string;
  monthGanzhi: string;
  dayGanzhi: string;
  hourGanzhi: string;
  dayXunKong: string;
  palaceName: string;     // 八卦本宫名 (如 "乾", "坤")
  palaceElement: string;  // 本宫五行 (如 "金", "土")
  isYouhun: boolean;
  isGuihun: boolean;
  shiPosition: number;    // 1-6
  yingPosition: number;   // 1-6
  lines: NajiaLine[];
}

const BINARY_TRIGRAM: Record<string, string> = {
  '111': 'qian', '011': 'dui', '101': 'li', '001': 'zhen',
  '110': 'xun', '010': 'kan', '100': 'gen', '000': 'kun'
};

const TRIGRAM_BINARY: Record<string, string> = {
  qian: '111', dui: '011', li: '101', zhen: '001',
  xun: '110', kan: '010', gen: '100', kun: '000'
};

const TRIGRAM_CHINESE: Record<string, string> = {
  qian: '乾', dui: '兑', li: '离', zhen: '震',
  xun: '巽', kan: '坎', gen: '艮', kun: '坤'
};

const PALACE_WUXING: Record<string, string> = {
  qian: '金', dui: '金',
  zhen: '木', xun: '木',
  kan: '水',
  li: '火',
  kun: '土', gen: '土'
};

const BRANCH_WUXING: Record<string, string> = {
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '申': '金', '酉': '金',
  '亥': '水', '子': '水',
  '辰': '土', '戌': '土', '丑': '土', '未': '土'
};

const NAJIA = {
  qian: { lower: ['子', '寅', '辰'], upper: ['午', '申', '戌'] },
  zhen: { lower: ['子', '寅', '辰'], upper: ['午', '申', '戌'] },
  kan:  { lower: ['寅', '辰', '午'], upper: ['申', '戌', '子'] },
  gen:  { lower: ['辰', '午', '申'], upper: ['戌', '子', '寅'] },
  kun:  { lower: ['未', '巳', '卯'], upper: ['丑', '亥', '酉'] },
  xun:  { lower: ['丑', '亥', '酉'], upper: ['未', '巳', '卯'] },
  li:   { lower: ['卯', '丑', '亥'], upper: ['酉', '未', '巳'] },
  dui:  { lower: ['巳', '卯', '丑'], upper: ['亥', '酉', '未'] }
};

const SHEN_ORDER = ['青龙', '朱雀', '勾陈', '腾蛇', '白虎', '玄武'];
const BEAST_START_INDEX: Record<string, number> = {
  '甲': 0, '乙': 0,
  '丙': 1, '丁': 1,
  '戊': 2,
  '己': 3,
  '庚': 4, '辛': 4,
  '壬': 5, '癸': 5
};

const CLASH_MAP: Record<string, string> = {
  '子': '午', '午': '子',
  '丑': '未', '未': '丑',
  '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰',
  '巳': '亥', '亥': '巳'
};

// Wu Xing generating/overcoming relationships (palace = Self, branch = Other)
function getRelation(selfElement: string, otherElement: string): string {
  if (selfElement === otherElement) return '兄弟';
  
  const relations: Record<string, Record<string, string>> = {
    '木': { '火': '子孙', '土': '妻财', '金': '官鬼', '水': '父母' },
    '火': { '土': '子孙', '金': '妻财', '水': '官鬼', '木': '父母' },
    '土': { '金': '子孙', '水': '妻财', '木': '官鬼', '火': '父母' },
    '金': { '水': '子孙', '木': '妻财', '火': '官鬼', '土': '父母' },
    '水': { '木': '子孙', '火': '妻财', '土': '官鬼', '金': '父母' },
  };
  return relations[selfElement]?.[otherElement] || '未知';
}

function invertTrigram(name: string): string {
  const binary = TRIGRAM_BINARY[name];
  if (!binary) return 'kun';
  const invertedBinary = binary.split('').map(c => c === '1' ? '0' : '1').join('');
  return BINARY_TRIGRAM[invertedBinary] || 'kun';
}

/**
 * Calculate the professional Najia layout details for a given hexagram and timestamp.
 * @param lines Array of 6 line values (6, 7, 8, 9) from bottom to top (index 0 is line 1)
 * @param timestamp Divination timestamp (default is now)
 */
export function calculateLiuyaoLayout(lines: number[], timestamp: number = Date.now(), mainPalaceElement?: string): LiuyaoLayoutResult {
  // 1. Get Ganzhi and Calendar parameters
  const date = new Date(timestamp);
  const solar = Solar.fromYmdHms(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  );
  const lunar = solar.getLunar();
  const bazi = lunar.getBaZi();
  
  const yearGanzhi = bazi[0];
  const monthGanzhi = bazi[1];
  const dayGanzhi = bazi[2];
  const hourGanzhi = bazi[3];
  
  const monthZhi = lunar.getMonthZhi();
  const dayGan = lunar.getDayGan();
  const dayZhi = lunar.getDayZhi();
  const dayXunKong = lunar.getDayXunKong();

  // 2. Identify Trigrams from line binary structure
  // Convert lines (6,7,8,9) to binary characters: yang (7,9) = 1, yin (6,8) = 0
  const binStr = lines.map(v => (v === 7 || v === 9) ? '1' : '0').join('');
  const lowerBin = binStr.slice(0, 3);
  const upperBin = binStr.slice(3, 6);
  
  // Lookups in BINARY_TRIGRAM map top-to-bottom binary keys, so we reverse the bottom-to-top sliced strings
  const lowerLook = lowerBin.split('').reverse().join('');
  const upperLook = upperBin.split('').reverse().join('');
  const lowerTrigram = BINARY_TRIGRAM[lowerLook] || 'kun';
  const upperTrigram = BINARY_TRIGRAM[upperLook] || 'kun';

  // 3. Determine Shi/Ying positions using Xunshi Ge
  const heavenSame = lowerBin[2] === upperBin[2]; // line 3 vs 6
  const manSame = lowerBin[1] === upperBin[1];    // line 2 vs 5
  const earthSame = lowerBin[0] === upperBin[0];  // line 1 vs 4
  
  const samePattern = `${earthSame ? 'S' : 'D'}${manSame ? 'S' : 'D'}${heavenSame ? 'S' : 'D'}`;
  
  let shiPosition = 6;
  let isYouhun = false;
  let isGuihun = false;
  
  switch (samePattern) {
    case 'SSS': shiPosition = 6; break; // 本宫六世
    case 'DDD': shiPosition = 3; break; // 三世异
    case 'DDS': shiPosition = 2; break; // 天同二世
    case 'SSD': shiPosition = 5; break; // 天变五
    case 'SDD': shiPosition = 4; break; // 地同四世
    case 'DSS': shiPosition = 1; break; // 地变初
    case 'DSD': shiPosition = 4; isYouhun = true; break; // 人同游魂
    case 'SDS': shiPosition = 3; isGuihun = true; break; // 人变归
  }
  const yingPosition = ((shiPosition + 2) % 6) + 1;

  // 4. Identify Palace using Rengong Ge
  let palaceTrigram = '';
  if (isGuihun) {
    palaceTrigram = lowerTrigram;
  } else if (shiPosition === 1 || shiPosition === 2 || shiPosition === 3 || shiPosition === 6) {
    palaceTrigram = upperTrigram;
  } else {
    palaceTrigram = invertTrigram(lowerTrigram);
  }
  
  const palaceName = TRIGRAM_CHINESE[palaceTrigram as keyof typeof TRIGRAM_CHINESE] || '坤';
  const palaceElement = PALACE_WUXING[palaceTrigram as keyof typeof PALACE_WUXING] || '土';

  // 5. Build branches (Najia), elements, relations, and beasts for each line
  const lowerBranches = NAJIA[lowerTrigram as keyof typeof NAJIA].lower;
  const upperBranches = NAJIA[upperTrigram as keyof typeof NAJIA].upper;
  const branches = [...lowerBranches, ...upperBranches];

  const beastStartIndex = BEAST_START_INDEX[dayGan] ?? 0;

  const resultLines: NajiaLine[] = lines.map((val, idx) => {
    const pos = idx + 1; // 1-indexed (1 to 6)
    const lineType = (val === 7 || val === 9) ? 'yang' : 'yin';
    const isChanging = (val === 6 || val === 9);
    
    // Branch & Wu Xing element
    const branch = branches[idx];
    const element = BRANCH_WUXING[branch] || '土';
    
    // Six Relations (六亲)
    const relation = getRelation(mainPalaceElement || palaceElement, element);
    
    // Six Beasts (六神)
    const beast = SHEN_ORDER[(beastStartIndex + idx) % 6];
    
    // Shi/Ying status
    const isShi = pos === shiPosition;
    const isYing = pos === yingPosition;
    
    // Void status (旬空)
    const isVoid = dayXunKong.includes(branch);
    
    // Strength / Broken status (月破 / 日破 / 暗动)
    const isYuePo = CLASH_MAP[branch] === monthZhi;
    const clashesDay = CLASH_MAP[branch] === dayZhi;
    
    // Rule for Day clash:
    // If branch is clashed by day:
    // - If it is a changing line, or if it is strong (supported/generated by Month branch element), it is active: 暗动 (An Dong)
    // - Otherwise, it is broken: 日破 (Ri Po)
    const isMonthSupported = getRelation(BRANCH_WUXING[monthZhi] || '土', element) === '父母' || (BRANCH_WUXING[monthZhi] === element);
    const isStrong = isMonthSupported || isChanging;
    
    const isRiPo = clashesDay && !isStrong;
    const isAnDong = clashesDay && isStrong;

    return {
      position: pos,
      value: val,
      lineType,
      isChanging,
      beast,
      relation,
      branch,
      element,
      isShi,
      isYing,
      isVoid,
      isYuePo,
      isRiPo,
      isAnDong
    };
  });

  return {
    yearGanzhi,
    monthGanzhi,
    dayGanzhi,
    hourGanzhi,
    dayXunKong,
    palaceName,
    palaceElement,
    isYouhun,
    isGuihun,
    shiPosition,
    yingPosition,
    lines: resultLines
  };
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Solar } from 'lunar-javascript';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../../components/shared/PageTransition';
import { Button } from '../../components/shared/Button';
import { saveRecord, type DivinationRecord } from '../../utils/storage';
import { v4 as uuidv4 } from 'uuid';
import { AIInterpretation } from '../../components/shared/AIInterpretation';
import { useSEO } from '../../hooks/useSEO';
import { SharePosterModal } from '../../components/shared/SharePosterModal';

interface BirthProfile {
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
  birthHour: string;
}

interface PalaceData {
  branch: string;
  name: string;
  majorStars: string[];
  minorStars: string[];
  luckRange: string;
  desc: string;
  gridClass: string;
  isShenGong?: boolean;
  stem?: string;
  flowingAges?: number[];
}

interface CustomDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  label: string;
  className?: string;
}

function CustomDropdown({ value, onChange, options, label, className = '' }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeItem = listRef.current.querySelector('[data-active="true"]');
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'instant' as ScrollBehavior });
      }
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2.5 sm:px-4 py-3 rounded-2xl border border-border bg-cream/60 text-ink focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold transition-all duration-300 text-xs sm:text-sm font-sans"
      >
        <span className="truncate">{value}{label}</span>
        <svg
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold transition-transform duration-300 flex-shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 mt-2 w-full max-h-60 overflow-y-auto rounded-2xl border border-border bg-cream-light/95 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] py-2"
            ref={listRef}
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                data-active={opt === value}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs sm:text-sm transition-all duration-200 ${
                  opt === value
                    ? 'bg-gold-tint/20 text-gold font-medium border-l-2 border-gold'
                    : 'text-ink hover:bg-gold-tint/10 hover:text-gold'
                }`}
              >
                {opt}{label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ZiweiPage() {
  const navigate = useNavigate();

  useSEO({
    title: '紫微斗数排盘',
    description: '紫微斗数在线天星排盘，依据出生日期与地支时辰快速定位十二宫垣，详尽排布十四主星、吉凶诸曜，支持AI智能全局运势解说。',
    keywords: '紫微斗数, 星盘, 排盘, 十二宫, 命格, 运势, AI命理, 天星排盘'
  });

  const [profile, setProfile] = useState<BirthProfile>({
    name: '',
    gender: 'male',
    birthDate: '1995-05-18',
    birthHour: '子时 (23:00-01:00)',
  });
  const [showChart, setShowChart] = useState(false);
  const [hoveredPalace, setHoveredPalace] = useState<PalaceData | null>(null);
  const [saved, setSaved] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1930 + 1 }, (_, i) => String(currentYear - i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));

  const [birthYear, setBirthYear] = useState('1995');
  const [birthMonth, setBirthMonth] = useState('5');
  const [birthDay, setBirthDay] = useState('18');

  // Compute days dynamically based on selected year and month
  const maxDays = new Date(parseInt(birthYear, 10), parseInt(birthMonth, 10), 0).getDate();
  const days = Array.from({ length: maxDays }, (_, i) => String(i + 1));

  // Correct out-of-bounds days
  useEffect(() => {
    const currentDayNum = parseInt(birthDay, 10) || 1;
    if (currentDayNum > maxDays) {
      setBirthDay(String(maxDays));
    }
  }, [birthYear, birthMonth, maxDays, birthDay]);

  // Sync to profile.birthDate
  useEffect(() => {
    const formattedMonth = birthMonth.padStart(2, '0');
    const formattedDay = birthDay.padStart(2, '0');
    setProfile(prev => ({
      ...prev,
      birthDate: `${birthYear}-${formattedMonth}-${formattedDay}`
    }));
  }, [birthYear, birthMonth, birthDay]);

  const hours = [
    '子时 (23:00-01:00)', '丑时 (01:00-03:00)', '寅时 (03:00-05:00)',
    '卯时 (05:00-07:00)', '辰时 (07:00-09:00)', '巳时 (09:00-11:00)',
    '午时 (11:00-13:00)', '未时 (13:00-15:00)', '申时 (15:00-17:00)',
    '酉时 (17:00-19:00)', '戌时 (19:00-21:00)', '亥时 (21:00-23:00)'
  ];

  // Authentic Ziwei Dou Shu chart calculation engine using lunar-javascript
  const generateChartData = (profile: BirthProfile): PalaceData[] => {
    if (!profile.birthDate) return [];

    const [yStr, mStr, dStr] = profile.birthDate.split('-');
    const year = parseInt(yStr, 10) || 1995;
    const month = parseInt(mStr, 10) || 5;
    const day = parseInt(dStr, 10) || 18;

    // Convert Solar to Lunar
    let lunar: any;
    try {
      lunar = Solar.fromYmd(year, month, day).getLunar();
    } catch (e) {
      lunar = Solar.fromYmd(1995, 5, 18).getLunar();
    }

    const yearGan = lunar.getYearGan();
    const yearZhi = lunar.getYearZhi();
    
    // Get lunar month and day with traditional leap month adjustment
    let rawMonth = lunar.getMonth();
    const isLeap = rawMonth < 0;
    let lunarMonth = Math.abs(rawMonth);
    const lunarDay = lunar.getDay();
    if (isLeap && lunarDay > 15) {
      lunarMonth = (lunarMonth % 12) + 1;
    }

    const hours = [
      '子时 (23:00-01:00)', '丑时 (01:00-03:00)', '寅时 (03:00-05:00)',
      '卯时 (05:00-07:00)', '辰时 (07:00-09:00)', '巳时 (09:00-11:00)',
      '午时 (11:00-13:00)', '未时 (13:00-15:00)', '申时 (15:00-17:00)',
      '酉时 (17:00-19:00)', '戌时 (19:00-21:00)', '亥时 (21:00-23:00)'
    ];
    const hourIndex = hours.indexOf(profile.birthHour);
    const hourBranchIndex = hourIndex === -1 ? 0 : hourIndex;

    // 1. Calculate Ming Gong (命宫) & Shen Gong (身宫) Branch Indices
    // 0 = 子, 1 = 丑, 2 = 寅, 3 = 卯, 4 = 辰, 5 = 巳, 6 = 午, 7 = 未, 8 = 申, 9 = 酉, 10 = 戌, 11 = 亥
    // "起寅宫 (2)，顺数月，逆数时，即为命宫。"
    const mingGongIndex = (2 + (lunarMonth - 1) - hourBranchIndex + 12) % 12;
    // "起寅宫 (2)，顺数月，顺数时，即为身宫。"
    const shenGongIndex = (2 + (lunarMonth - 1) + hourBranchIndex) % 12;

    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    // 2. Calculate Palace Heavenly Stems (宫干) using "五虎遁" (Five Tigers Escape)
    const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const getTigerStartStem = (gan: string): number => {
      if (gan === '甲' || gan === '己') return 2; // 丙寅
      if (gan === '乙' || gan === '庚') return 4; // 戊寅
      if (gan === '丙' || gan === '辛') return 6; // 庚寅
      if (gan === '丁' || gan === '壬') return 8; // 壬寅
      return 0; // 戊/癸 -> 甲寅 (index 0)
    };
    const startStemIdx = getTigerStartStem(yearGan);
    const palaceStems = Array(12).fill('');
    for (let i = 0; i < 12; i++) {
      const branchIdx = i;
      // Distance clockwise from 寅 (index 2)
      const dist = (branchIdx - 2 + 12) % 12;
      palaceStems[branchIdx] = GAN[(startStemIdx + dist) % 10];
    }

    // 3. Determine Five Elements Bureau (五行局) based on Ming Gong's stem/branch Nayin
    const mingGongStem = palaceStems[mingGongIndex];
    const mingGongBranch = branches[mingGongIndex];

    const getNayinElement = (stem: string, branch: string): string => {
      const stemMap: Record<string, number> = { 甲: 1, 乙: 1, 丙: 2, 丁: 2, 戊: 3, 己: 3, 庚: 4, 辛: 4, 壬: 5, 癸: 5 };
      const branchMap: Record<string, number> = {
        子: 1, 丑: 1, 午: 1, 未: 1,
        寅: 2, 卯: 2, 申: 2, 酉: 2,
        辰: 3, 巳: 3, 戌: 3, 亥: 3
      };
      const sVal = stemMap[stem] || 1;
      const bVal = branchMap[branch] || 1;
      let sum = sVal + bVal;
      if (sum > 5) sum -= 5;
      const elementMap: Record<number, string> = {
        1: '木',
        2: '金',
        3: '水',
        4: '火',
        5: '土'
      };
      return elementMap[sum] || '水';
    };

    const bureauElement = getNayinElement(mingGongStem, mingGongBranch);
    // Bureau values: Water=2, Wood=3, Metal=4, Earth=5, Fire=6
    const bureauAgeMap: Record<string, number> = { 水: 2, 木: 3, 金: 4, 土: 5, 火: 6 };
    const bureauAge = bureauAgeMap[bureauElement] || 2;
    const bureauName = `${bureauElement}${['', '', '二', '三', '四', '五', '六'][bureauAge]}局`;

    // 4. Calculate Decade Direction (大限顺逆)
    // 阳男阴女顺行，阴男阳女逆行
    const isYangYear = ['甲', '丙', '戊', '庚', '壬'].includes(yearGan);
    const isClockwise = (isYangYear && profile.gender === 'male') || (!isYangYear && profile.gender === 'female');

    // 5. Position the Ziwei Star (紫微星)
    // Find smallest X such that X * bureauAge >= lunarDay
    let X = 1;
    while (X * bureauAge < lunarDay) {
      X++;
    }
    const R = X * bureauAge - lunarDay;
    let ziweiIdx = 0;
    if (R % 2 === 0) {
      // Even R
      ziweiIdx = (2 + X + R) % 12;
    } else {
      // Odd R
      ziweiIdx = (2 + X - R + 12) % 12;
    }

    // 6. Position all 14 Major Stars
    // Ziwei group (counter-clockwise)
    const tianjiIdx = (ziweiIdx - 1 + 12) % 12;
    const taiyangIdx = (ziweiIdx - 3 + 12) % 12;
    const wuquIdx = (ziweiIdx - 4 + 12) % 12;
    const tiantongIdx = (ziweiIdx - 5 + 12) % 12;
    const lianzhenIdx = (ziweiIdx - 8 + 12) % 12;

    // Tianfu group (clockwise, start at symmetric axis)
    const tianfuIdx = (10 - ziweiIdx + 12) % 12;
    const taiyinIdx = (tianfuIdx + 1) % 12;
    const tanlangIdx = (tianfuIdx + 2) % 12;
    const jumenIdx = (tianfuIdx + 3) % 12;
    const tianxiangIdx = (tianfuIdx + 4) % 12;
    const tianliangIdx = (tianfuIdx + 5) % 12;
    const qishaIdx = (tianfuIdx + 6) % 12;
    const pojunIdx = (tianfuIdx + 10) % 12;

    // 7. Calculate Key Auxiliary Stars
    // Wenchang & Wenqu (by hour)
    const wenchangIdx = (10 - hourBranchIndex + 12) % 12;
    const wenquIdx = (4 + hourBranchIndex) % 12;

    // Zuofu & Youbi (by month)
    const zuofuIdx = (4 + (lunarMonth - 1)) % 12;
    const youbiIdx = (10 - (lunarMonth - 1) + 12) % 12;

    // Tiankui & Tianyue (by year stem)
    const getKuiYueIdx = (gan: string): { kui: number; yue: number } => {
      if (['甲', '戊', '庚'].includes(gan)) return { kui: 1, yue: 7 };
      if (['乙', '己'].includes(gan)) return { kui: 0, yue: 8 };
      if (['丙', '丁'].includes(gan)) return { kui: 11, yue: 9 };
      if (gan === '辛') return { kui: 6, yue: 2 };
      return { kui: 3, yue: 5 }; // 壬/癸
    };
    const { kui: tiankuiIdx, yue: tianyueIdx } = getKuiYueIdx(yearGan);

    // Lucun (by year stem)
    const lucunMap: Record<string, number> = {
      甲: 2, 乙: 3, 丙: 5, 戊: 5, 丁: 6, 己: 6, 庚: 8, 辛: 9, 壬: 11, 癸: 0
    };
    const lucunIdx = lucunMap[yearGan] || 2;

    // Tianma (by year branch)
    const getTianmaIdx = (zhi: string): number => {
      if (['寅', '午', '戌'].includes(zhi)) return 8; // 申
      if (['申', '子', '辰'].includes(zhi)) return 2; // 寅
      if (['巳', '酉', '丑'].includes(zhi)) return 11; // 亥
      return 5; // 巳
    };
    const tianmaIdx = getTianmaIdx(yearZhi);

    // Group major and minor stars by palace branch
    const majorStarsInPalaces: string[][] = Array(12).fill(null).map(() => []);
    const minorStarsInPalaces: string[][] = Array(12).fill(null).map(() => []);

    const majorStarNames = [
      { name: '紫微', pos: ziweiIdx },
      { name: '天机', pos: tianjiIdx },
      { name: '太阳', pos: taiyangIdx },
      { name: '武曲', pos: wuquIdx },
      { name: '天同', pos: tiantongIdx },
      { name: '廉贞', pos: lianzhenIdx },
      { name: '天府', pos: tianfuIdx },
      { name: '太阴', pos: taiyinIdx },
      { name: '贪狼', pos: tanlangIdx },
      { name: '巨门', pos: jumenIdx },
      { name: '天相', pos: tianxiangIdx },
      { name: '天梁', pos: tianliangIdx },
      { name: '七杀', pos: qishaIdx },
      { name: '破军', pos: pojunIdx }
    ];

    const minorStarNames = [
      { name: '文昌', pos: wenchangIdx },
      { name: '文曲', pos: wenquIdx },
      { name: '左辅', pos: zuofuIdx },
      { name: '右弼', pos: youbiIdx },
      { name: '天魁', pos: tiankuiIdx },
      { name: '天钺', pos: tianyueIdx },
      { name: '禄存', pos: lucunIdx },
      { name: '天马', pos: tianmaIdx }
    ];

    // Sihua Calculation for Birth Year Stem (年干四化)
    const getSihua = (gan: string): Record<string, '禄' | '权' | '科' | '忌'> => {
      const map: Record<string, string[]> = {
        甲: ['廉贞', '破军', '武曲', '太阳'],
        乙: ['天机', '天梁', '紫微', '太阴'],
        丙: ['天同', '天机', '文昌', '廉贞'],
        丁: ['太阴', '天同', '天机', '巨门'],
        戊: ['贪狼', '太阴', '右弼', '天机'],
        己: ['武曲', '贪狼', '天梁', '文曲'],
        庚: ['太阳', '武曲', '太阴', '天同'],
        辛: ['巨门', '太阳', '文曲', '文昌'],
        壬: ['天梁', '紫微', '左辅', '武曲'],
        癸: ['破军', '巨门', '太阴', '贪狼']
      };
      const stars = map[gan] || [];
      return {
        [stars[0]]: '禄',
        [stars[1]]: '权',
        [stars[2]]: '科',
        [stars[3]]: '忌'
      };
    };

    const sihuaMap = getSihua(yearGan);
    
    const formatStarName = (name: string): string => {
      const sh = sihuaMap[name];
      return sh ? `${name}·${sh}` : name;
    };

    majorStarNames.forEach(star => {
      majorStarsInPalaces[star.pos].push(formatStarName(star.name));
    });

    minorStarNames.forEach(star => {
      minorStarsInPalaces[star.pos].push(formatStarName(star.name));
    });

    // 8. Map Twelve Palaces (命宫, 兄弟宫, etc.)
    const palaceNames = [
      '命宫', '兄弟宫', '夫妻宫', '子女宫', 
      '财帛宫', '疾厄宫', '迁移宫', '交友宫', 
      '官禄宫', '田宅宫', '福德宫', '父母宫'
    ];

    // Grid positions corresponding to the perimeter of a 4x4 grid (子 to 亥)
    const gridPositions = [
      'col-start-3 row-start-4', // 子
      'col-start-2 row-start-4', // 丑
      'col-start-1 row-start-4', // 寅
      'col-start-1 row-start-3', // 卯
      'col-start-1 row-start-2', // 辰
      'col-start-1 row-start-1', // 巳
      'col-start-2 row-start-1', // 午
      'col-start-3 row-start-1', // 未
      'col-start-4 row-start-1', // 申
      'col-start-4 row-start-2', // 酉
      'col-start-4 row-start-3', // 戌
      'col-start-4 row-start-4', // 亥
    ];

    const STAR_DESCS: Record<string, string> = {
      紫微: '紫微帝星坐镇，气度高华，贵气自生，利于领导与格局提升。',
      天机: '天机谋略星，主聪颖多智、灵动善变、机智过人，长于企划。',
      太阳: '太阳星光芒万丈，主热诚博爱、公正无私，重名声传播。',
      武曲: '武曲金星为正财，性情刚毅果决，利于专业技能与财富开创。',
      天同: '天同为福德星，主安享清闲、人缘极佳，能逢凶化吉。',
      廉贞: '廉贞星兼具行政与桃花，性格刚柔相济，具开创和社交才能。',
      天府: '天府南斗主星为财库，沉稳内敛，处事守成得当，一生衣食丰足。',
      太阴: '太阴水星主富，性格细腻阴柔，擅于资产积累及精神享受。',
      贪狼: '贪狼星为第一桃花，多才多艺，善于社交应对，物欲强盛。',
      巨门: '巨门主口舌与钻研，善于分析透彻，多凭借言辞或专业技术扬名。',
      天相: '天相为宰相之星，主正直敦厚、管理协调，辅佐他人得力。',
      天梁: '天梁荫星主寿、化吉与长者风范，有逢凶化吉之神效。',
      七杀: '七杀将星主肃杀与独立开拓，性情坚毅，宜白手起家。',
      破军: '破军主冲锋陷阵与破旧立新，性格敢于冒险变动，开创力极强。'
    };

    const birthBranchIdx = branches.indexOf(yearZhi);

    const list: PalaceData[] = [];
    for (let i = 0; i < 12; i++) {
      const branchIdx = i;
      // Rotate counter-clockwise from Ming Gong (index mingGongIndex)
      const nameIndex = (mingGongIndex - branchIdx + 12) % 12;
      const palaceName = palaceNames[nameIndex];

      // Calculate decade range (大限) based on direction
      // distance along the direction from Ming Gong
      const distFromMing = isClockwise
        ? (branchIdx - mingGongIndex + 12) % 12
        : (mingGongIndex - branchIdx + 12) % 12;
      
      const startAge = bureauAge + distFromMing * 10;
      const endAge = startAge + 9;
      const luckRange = `${startAge}-${endAge} 岁`;

      // Generate dynamic description
      const majors = majorStarsInPalaces[branchIdx];
      let desc = `【${palaceName}】落在【${palaceStems[branchIdx]}${branches[branchIdx]}】宫，五行局为【${bureauName}】。`;
      if (majors.length > 0) {
        desc += `主星为【${majors.map(m => m.split('·')[0]).join('、')}】。` + majors.map(m => {
          const rawM = m.split('·')[0];
          return STAR_DESCS[rawM] || '';
        }).join(' ');
      } else {
        const oppositeBranchIdx = (branchIdx + 6) % 12;
        const oppositeNameIndex = (mingGongIndex - oppositeBranchIdx + 12) % 12;
        desc += `本宫无主星（空宫），受对宫【${palaceNames[oppositeNameIndex]}】的主星磁场强烈照耀，宜参考对宫运势起伏。`;
      }

      // Calculate transiting flowing ages (流年岁数)
      const a0 = (branchIdx - birthBranchIdx + 12) % 12 + 1;
      const flowingAges = [a0, a0 + 12, a0 + 24, a0 + 36, a0 + 48, a0 + 60, a0 + 72];

      list.push({
        branch: branches[branchIdx],
        name: palaceName,
        majorStars: majors,
        minorStars: minorStarsInPalaces[branchIdx],
        luckRange,
        desc,
        gridClass: gridPositions[branchIdx],
        isShenGong: branchIdx === shenGongIndex,
        stem: palaceStems[branchIdx],
        flowingAges
      });
    }

    return list;
  };

  const chartData = generateChartData(profile);
  const mingGongData = chartData.find(p => p.name === '命宫') || chartData[0];

  const currentFlowingBranchIdx = (currentYear - 4) % 12;
  const currentFlowingYearGanzhi = [
    '甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉','甲戌','乙亥',
    '丙子','丁丑','戊寅','己卯','庚辰','辛巳','壬午','癸未','甲申','乙酉','丙戌','丁亥',
    '戊子','己丑','庚寅','辛卯','壬辰','癸巳','甲午','乙未','丙申','丁酉','戊戌','己亥',
    '庚子','辛丑','壬寅','癸卯','甲辰','乙巳','丙午','丁未','戊申','己酉','庚戌','辛亥',
    '壬子','癸丑','甲寅','乙卯','丙辰','丁巳','戊午','己未','庚申','辛酉','壬戌','癸亥'
  ][(currentYear - 4) % 60];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name) {
      alert('请填写姓名');
      return;
    }
    setShowChart(true);
  };

  const handleSave = () => {
    const [year, month, day] = profile.birthDate.split('-').map(Number);
    const hourIndex = hours.indexOf(profile.birthHour);
    const hourValue = hourIndex === -1 ? 0 : hourIndex * 2;

    const record: DivinationRecord = {
      id: uuidv4(),
      timestamp: Date.now(),
      type: 'ziwei',
      question: `${profile.name}的紫微命盘排盘`,
      data: {
        birthInfo: {
          year,
          month,
          day,
          hour: hourValue,
          gender: profile.gender
        },
        chartData: {
          name: profile.name,
          mingGongStars: mingGongData.majorStars
        }
      }
    };

    const success = saveRecord(record);
    if (success) {
      setSaved(true);
    }
  };

  const ziweiData = {
    profile: {
      name: profile.name,
      gender: profile.gender,
      birthDate: profile.birthDate,
      birthHour: profile.birthHour
    },
    mingGongData: {
      majorStars: mingGongData.majorStars,
      minorStars: mingGongData.minorStars,
      desc: mingGongData.desc,
      luckRange: mingGongData.luckRange,
      branch: mingGongData.branch
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl w-full space-y-8 relative z-10">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full border border-gold/20 bg-gold-tint text-gold text-xs font-sans tracking-widest uppercase">
              紫微斗数 · Ziwei Dou Shu
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-ink tracking-wide">
              天星排盘，<span className="text-gold italic font-calligraphy">命理乾坤</span>
            </h1>
            <p className="text-muted font-sans font-light leading-relaxed text-sm max-w-lg mx-auto">
              排演天干地支，定位十二宫垣。洞察本命星宿分布，解构先天格局与运势。
            </p>
          </div>

          {!showChart ? (
            /* Input Form */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="bg-cream-light/60 backdrop-blur-md rounded-3xl border border-border p-6 sm:p-8 max-w-xl mx-auto space-y-6"
            >
              <h2 className="text-lg font-serif text-gold border-l-2 border-gold pl-2">输入命主档案</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
                <div>
                  <label className="block text-ink font-light mb-2">姓名</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-cream/60 text-ink placeholder-muted/65 focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold transition-all duration-300"
                    placeholder="输入姓名"
                    required
                  />
                </div>

                <div>
                  <label className="block text-ink font-light mb-2">性别</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, gender: 'male' })}
                      className={`flex-1 py-2.5 rounded-full border transition-all duration-300 ${
                        profile.gender === 'male'
                          ? 'bg-gold text-cream font-medium border-gold'
                          : 'bg-cream/40 text-muted border-border/80 hover:text-gold hover:border-gold/30'
                      }`}
                    >
                      🚹 乾造 (男)
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, gender: 'female' })}
                      className={`flex-1 py-2.5 rounded-full border transition-all duration-300 ${
                        profile.gender === 'female'
                          ? 'bg-gold text-cream font-medium border-gold'
                          : 'bg-cream/40 text-muted border-border/80 hover:text-gold hover:border-gold/30'
                      }`}
                    >
                      🚺 坤造 (女)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-ink font-light mb-2">出生日期 (公历)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <CustomDropdown
                      value={birthYear}
                      onChange={setBirthYear}
                      options={years}
                      label="年"
                    />
                    <CustomDropdown
                      value={birthMonth}
                      onChange={setBirthMonth}
                      options={months}
                      label="月"
                    />
                    <CustomDropdown
                      value={birthDay}
                      onChange={setBirthDay}
                      options={days}
                      label="日"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-ink font-light mb-2">出生时辰 (地支)</label>
                  <CustomDropdown
                    value={profile.birthHour}
                    onChange={(val) => setProfile({ ...profile, birthHour: val })}
                    options={hours}
                    label=""
                    className="w-full"
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" fullWidth>
                    排定紫微命盘
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : (
            /* Astrological 12-Palace Grid Layout */
            <div className="space-y-6">
              
              {/* Outer Grid Panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="grid grid-cols-4 grid-rows-4 gap-1.5 sm:gap-2 bg-cream-light/45 backdrop-blur-md rounded-3xl border border-border p-2 sm:p-4 aspect-square max-w-2xl mx-auto overflow-hidden"
              >
                
                {/* 12 Palaces mapping */}
                {chartData.map((palace, index) => {
                  const isHovered = hoveredPalace?.name === palace.name;
                  const isMingGong = palace.name === '命宫';
                  const isShenGong = palace.isShenGong;

                  // Earth branch index
                  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
                  const branchIdx = branches.indexOf(palace.branch);

                  // Calculate Sanfang Sizheng (三方四正) and opposite palace (对宫)
                  let isSanfangSizheng = false;
                  let isOpposite = false;
                  if (hoveredPalace) {
                    const hoveredIdx = branches.indexOf(hoveredPalace.branch);
                    const diff = (branchIdx - hoveredIdx + 12) % 12;
                    if (diff === 4 || diff === 8) {
                      isSanfangSizheng = true;
                    } else if (diff === 6) {
                      isOpposite = true;
                    }
                  }

                  const shColors: Record<string, string> = {
                    '禄': 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
                    '权': 'bg-rose-500/15 text-rose-600 border-rose-500/20',
                    '科': 'bg-blue-500/15 text-blue-600 border-blue-500/20',
                    '忌': 'bg-zinc-500/15 text-zinc-600 border-zinc-500/20'
                  };

                  return (
                    <motion.div
                      key={palace.branch}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        type: 'spring',
                        stiffness: 80,
                        damping: 12,
                        delay: index * 0.04 
                      }}
                      onMouseEnter={() => setHoveredPalace(palace)}
                      onMouseLeave={() => setHoveredPalace(null)}
                      onClick={() => setHoveredPalace(palace === hoveredPalace ? null : palace)}
                      className={`rounded-2xl border p-1.5 sm:p-2.5 flex flex-col justify-between transition-all duration-300 cursor-pointer shadow-sm ${palace.gridClass} ${
                        isHovered 
                          ? 'border-gold bg-gold-tint/20 shadow-[0_8px_20px_rgba(223,177,91,0.2)] scale-[1.03] -translate-y-0.5 z-20' 
                          : isSanfangSizheng
                            ? 'border-gold/45 bg-gold-tint/5 shadow-sm scale-[1.01] z-10'
                            : isOpposite
                              ? 'border-terracotta/40 bg-terracotta-tint/5 shadow-sm scale-[1.01] z-10'
                              : isMingGong 
                                ? 'border-terracotta/70 bg-terracotta-tint/15 shadow-inner' 
                                : 'border-border/60 bg-cream/35 hover:border-gold/30 hover:shadow-[0_4px_10px_rgba(223,177,91,0.06)]'
                      }`}
                    >
                      {/* Palace Title Header */}
                      <div className="flex justify-between items-start gap-0.5">
                        <div className="flex gap-0.5 sm:gap-1 items-center overflow-hidden">
                          <span className={`text-[8px] sm:text-[10px] font-sans font-light px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0 ${
                            isMingGong ? 'bg-terracotta text-cream' : 'bg-border/30 text-gold'
                          }`}>
                            {palace.name}
                          </span>
                          {isShenGong && (
                            <span className="text-[7px] sm:text-[8px] font-sans px-0.5 sm:px-1 py-0.5 rounded bg-gold/15 text-gold border border-gold/20 flex-shrink-0 scale-90 sm:scale-100 origin-left">
                              身
                            </span>
                          )}
                          {isSanfangSizheng && (
                            <span className="text-[6.5px] sm:text-[7.5px] font-sans px-0.5 py-0.5 rounded bg-gold/10 text-gold/80 flex-shrink-0 scale-90 sm:scale-100 origin-left">
                              合
                            </span>
                          )}
                          {isOpposite && (
                            <span className="text-[6.5px] sm:text-[7.5px] font-sans px-0.5 py-0.5 rounded bg-terracotta/10 text-terracotta/80 flex-shrink-0 scale-90 sm:scale-100 origin-left">
                              照
                            </span>
                          )}
                        </div>
                        <span className="text-[8px] sm:text-[10px] text-muted font-sans font-light">
                          {palace.stem}{palace.branch}
                        </span>
                      </div>

                      {/* Stars Center */}
                      <div className="my-0.5 sm:my-1 space-y-0.5">
                        {palace.majorStars.map(star => {
                          const [starName, sh] = star.split('·');
                          return (
                            <div key={starName} className="text-[10px] sm:text-xs font-serif font-medium text-ink flex items-center gap-0.5 sm:gap-1 justify-center">
                              <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-gold inline-block" />
                              <span>{starName}</span>
                              {sh && (
                                <span className={`text-[7px] scale-90 px-0.5 py-0 rounded border leading-none font-sans font-normal ${shColors[sh] || 'bg-border text-muted'}`}>
                                  {sh}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Minor Stars List */}
                      {palace.minorStars.length > 0 && (
                        <div className="text-[7px] sm:text-[8px] text-muted/60 font-sans font-light text-center truncate border-t border-border/10 pt-0.5 mt-0.5">
                          {palace.minorStars.map(s => {
                            const [name, sh] = s.split('·');
                            return sh ? `${name}(${sh})` : name;
                          }).join(' ')}
                        </div>
                      )}

                      {/* Decade range & Flowing Year transits */}
                      <div className="flex flex-col gap-0.5 text-[6.5px] sm:text-[7.5px] text-muted/75 font-sans font-light border-t border-border/20 pt-1 mt-1">
                        <div className="flex justify-between items-center">
                          <span>大限: {palace.luckRange.split(' ')[0]}</span>
                          <span className="opacity-70">岁数: {palace.flowingAges?.slice(0, 3).join(',')}...</span>
                        </div>
                        {branchIdx === currentFlowingBranchIdx && (
                          <div className="text-[6.5px] text-terracotta font-medium flex items-center justify-between mt-0.5 leading-none">
                            <span>🎯 当年流年</span>
                            <span>{currentYear} ({currentFlowingYearGanzhi})</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Central Combined block (grid position col 2-3, row 2-3) */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  onClick={() => setHoveredPalace(null)}
                  className="col-start-2 col-end-4 row-start-2 row-end-4 bg-cream/70 border border-border/80 rounded-2xl p-2 sm:p-4 flex flex-col justify-between text-center overflow-y-auto cursor-pointer"
                >
                  <AnimatePresence mode="wait">
                    {hoveredPalace ? (
                      <motion.div
                        key={hoveredPalace.name}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2 sm:space-y-3 my-auto"
                      >
                        <div className="space-y-0.5 sm:space-y-1">
                          <span className="text-[8px] sm:text-[9px] text-gold tracking-widest font-sans uppercase">宫位研判</span>
                          <h3 className="text-sm sm:text-xl font-serif text-ink">{hoveredPalace.name} ({hoveredPalace.stem}{hoveredPalace.branch})</h3>
                        </div>
                        <div className="flex gap-1 sm:gap-2 justify-center flex-wrap">
                          {hoveredPalace.majorStars.map(s => {
                            const [name, sh] = s.split('·');
                            return (
                              <span key={name} className="px-1.5 sm:px-2 py-0.5 rounded bg-gold-tint text-gold text-[9px] sm:text-[10px] border border-gold/10 font-sans font-light flex items-center gap-0.5">
                                <span>{name}</span>
                                {sh && <strong className="text-terracotta text-[8px] font-bold">({sh})</strong>}
                              </span>
                            );
                          })}
                          {hoveredPalace.minorStars.map(s => {
                            const [name, sh] = s.split('·');
                            return (
                              <span key={name} className="px-1.5 sm:px-2 py-0.5 rounded bg-border/20 text-muted text-[9px] sm:text-[10px] font-sans font-light flex items-center gap-0.5">
                                <span>{name}</span>
                                {sh && <strong className="text-terracotta text-[8px] font-bold">({sh})</strong>}
                              </span>
                            );
                          })}
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-muted font-sans font-light leading-relaxed text-left">
                          {hoveredPalace.desc}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-1.5 sm:space-y-2 my-auto font-sans"
                      >
                        <span className="text-[8px] sm:text-[9px] text-gold tracking-widest uppercase">命主格局盘志</span>
                        <h3 className="text-sm sm:text-lg font-serif text-ink">{profile.name} 的紫微盘</h3>
                        <div className="text-[10px] sm:text-[11px] text-muted space-y-0.5 sm:space-y-1 font-light leading-relaxed">
                          <p>性别：{profile.gender === 'male' ? '乾造 (男)' : '坤造 (女)'}</p>
                          <p>诞辰：{profile.birthDate}</p>
                          <p>时辰：{profile.birthHour}</p>
                          <p className="text-gold mt-1 pt-1 border-t border-border/20">💡 提示：点击或滑动宫位查看断语</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              {/* AI Interpretation */}
              <AIInterpretation type="ziwei" data={ziweiData} onResultLoaded={setAiResult} />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto mt-8 font-sans text-xs sm:text-sm">
                <Button onClick={handleSave} disabled={saved} variant="primary" className="flex-1">
                  {saved ? '✓ 已保存排盘' : '保存此命盘'}
                </Button>
                <Button
                  onClick={() => setShareModalOpen(true)}
                  variant="secondary"
                  className="flex-1"
                >
                  🌌 分享结果
                </Button>
                <Button
                  onClick={() => {
                    setShowChart(false);
                    setSaved(false);
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  重新排盘
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  variant="ghost"
                  className="flex-1"
                >
                  返回首页
                </Button>
              </div>
              <SharePosterModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                type="ziwei"
                data={ziweiData}
                aiResult={aiResult}
              />
            </div>
          )}

        </div>
      </div>
    </PageTransition>
  );
}

import { Solar } from 'lunar-javascript';
import {
  generateAllLines,
  isChangingLine
} from '../../utils/liuyao';
import type { LineValue } from '../../utils/liuyao';
import {
  linesToStructure,
  getHexagramByStructure,
  getChangingLines,
  getTransformedHexagram,
  getAllHexagrams,
  getHexagramById
} from '../../utils/hexagram';
import type { Hexagram } from '../../utils/hexagram';
import { calculateLiuyaoLayout } from '../../utils/liuyaoLayout';
import type { LiuyaoLayoutResult } from '../../utils/liuyaoLayout';
import { getDivinationPrompt, getDivinationInterpretation } from '../../utils/deepseek';

export interface LiuyaoDivinationResult {
  question: string;
  datetime: string;
  timestamp: number;
  lines: number[];
  additionalContext?: string;
  ganzhi: {
    year: string;
    month: string;
    day: string;
    hour: string;
    xunKong: string;
  };
  mainHexagram: {
    id: number;
    name: string;
    unicode: string;
    palaceName: string;
    palaceElement: string;
    shiPosition: number;
    yingPosition: number;
    isYouhun: boolean;
    isGuihun: boolean;
    judgment?: {
      original: string;
      translation: string;
    };
  };
  transformedHexagram?: {
    id: number;
    name: string;
    unicode: string;
    judgment?: {
      original: string;
      translation: string;
    };
  } | null;
  changingLines: Array<{
    position: number;
    name: string;
    original?: string;
    translation?: string;
  }>;
  linesDetail: Array<{
    position: number;
    value: number;
    name: string;
    beast: string;
    relation: string;
    branch: string;
    element: string;
    isShi: boolean;
    isYing: boolean;
    isChanging: boolean;
    isVoid: boolean;
    isYuePo: boolean;
    isRiPo: boolean;
    isAnDong: boolean;
    symbol: string;
    transLine?: {
      relation: string;
      branch: string;
      element: string;
      symbol: string;
    };
  }>;
  markdownChart: string;
  interpretationGuide: string;
  aiPrompt: {
    systemMessage: string;
    userPrompt: string;
    copyText: string;
  };
}

const POSITION_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

/**
 * 六爻起卦与专业纳甲排盘
 */
export function divineLiuyao(
  question: string,
  customLines?: number[],
  timestamp: number = Date.now(),
  additionalContext?: string
): LiuyaoDivinationResult {
  // 1. 确定六爻值
  let lines: LineValue[];
  if (customLines && customLines.length === 6) {
    lines = customLines.map(v => {
      const num = Number(v);
      if ([6, 7, 8, 9].includes(num)) return num as LineValue;
      return 7;
    });
  } else {
    lines = generateAllLines();
  }

  // 2. 本卦与排盘
  const structure = linesToStructure(lines);
  const mainHexagram = getHexagramByStructure(structure);
  if (!mainHexagram) {
    throw new Error('无法匹配卦象结构');
  }

  const mainLayout = calculateLiuyaoLayout(lines, timestamp);
  const changingLinePositions = getChangingLines(lines);

  // 3. 变卦（之卦）与排盘
  let transformedHexagram: Hexagram | null = null;
  let transLayout: LiuyaoLayoutResult | null = null;

  if (changingLinePositions.length > 0) {
    transformedHexagram = getTransformedHexagram(lines);
    const transLines = lines.map(v => {
      if (v === 9) return 8;
      if (v === 6) return 7;
      return v;
    });
    transLayout = calculateLiuyaoLayout(transLines, timestamp);
  }

  // 4. 日历四柱干支
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

  // 5. 动爻爻辞提取
  const changingLinesData = changingLinePositions.map(pos => {
    const lineIndex = pos - 1;
    const lineItem = mainHexagram.lines?.find(l => l.position === pos);
    return {
      position: pos,
      name: POSITION_NAMES[lineIndex] || `第${pos}爻`,
      original: lineItem?.original || '',
      translation: lineItem?.translation || ''
    };
  });

  // 6. 整合六爻明细（自初爻到上爻）
  const linesDetail = mainLayout.lines.map((l, idx) => {
    const isChanging = isChangingLine(l.value as LineValue);
    let transLine: any = undefined;

    if (transLayout && transLayout.lines[idx]) {
      const t = transLayout.lines[idx];
      transLine = {
        relation: t.relation,
        branch: t.branch,
        element: t.element,
        symbol: t.lineType === 'yang' ? '━━━' : '━ ━'
      };
    }

    const currentSymbol = l.lineType === 'yang' ? '━━━' : '━ ━';
    const changeSymbol = l.value === 9 ? '○->' : l.value === 6 ? '×->' : '   ';

    return {
      position: l.position,
      value: l.value,
      name: POSITION_NAMES[l.position - 1],
      beast: l.beast,
      relation: l.relation,
      branch: l.branch,
      element: l.element,
      isShi: l.isShi,
      isYing: l.isYing,
      isChanging,
      isVoid: l.isVoid,
      isYuePo: l.isYuePo,
      isRiPo: l.isRiPo,
      isAnDong: l.isAnDong,
      symbol: `${currentSymbol} ${changeSymbol}`,
      transLine
    };
  });

  // 7. 生成美观的 Markdown 纳甲排盘盘面
  const reversedLines = [...linesDetail].reverse();
  const tableRows: string[] = [];

  for (const item of reversedLines) {
    const flags: string[] = [];
    if (item.isShi) flags.push('世');
    if (item.isYing) flags.push('应');
    if (item.isVoid) flags.push('空');
    if (item.isYuePo) flags.push('月破');
    if (item.isRiPo) flags.push('日破');
    if (item.isAnDong) flags.push('暗动');
    const flagStr = flags.length > 0 ? `(${flags.join('')})` : '';

    const transPart = item.transLine
      ? `${item.transLine.branch}${item.transLine.element} ${item.transLine.relation} ${item.transLine.symbol}`
      : '-';

    tableRows.push(
      `| ${item.name} | ${item.beast} | ${item.branch}${item.element} ${item.relation} | ${item.symbol} ${flagStr} | ${transPart} |`
    );
  }

  const specialCategory = mainLayout.isYouhun ? '【游魂卦】' : mainLayout.isGuihun ? '【归魂卦】' : '';
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

  const markdownChart = [
    `### 周易六爻专业纳甲排盘`,
    ``,
    `* **求测事项**：${question}`,
    `* **起卦时间**：${dateStr} (${lunar.getYearInGanZhi()}年 农历${lunar.getMonthInChinese()}月${lunar.getDayInChinese()})`,
    `* **四柱天机**：${bazi[0]}年  ${bazi[1]}月  ${bazi[2]}日  ${bazi[3]}时 （日旬空亡：${mainLayout.dayXunKong}）`,
    `* **本卦卦象**：${mainHexagram.unicode} **${mainHexagram.name}** [${mainLayout.palaceName}宫${mainLayout.palaceElement}] ${specialCategory}`,
    transformedHexagram ? `* **变卦卦象**：${transformedHexagram.unicode} **${transformedHexagram.name}**` : `* **变卦卦象**：无动爻（静卦）`,
    ``,
    `| 爻位 | 六神 | 本卦纳甲 | 爻象世应 | 变卦纳甲 |`,
    `| :--- | :--- | :--- | :--- | :--- |`,
    ...tableRows,
    ``,
    `#### 卦辞爻辞原典`,
    `* **本卦【${mainHexagram.name}】卦辞**：${mainHexagram.judgment?.original || '无'}`,
    `  * *译文*：${mainHexagram.judgment?.translation || '无'}`,
    transformedHexagram ? `* **变卦【${transformedHexagram.name}】卦辞**：${transformedHexagram.judgment?.original || '无'}\n  * *译文*：${transformedHexagram.judgment?.translation || '无'}` : '',
    changingLinesData.length > 0 ? `\n#### 发动之爻爻辞\n` + changingLinesData.map(c => `* **${c.name}**：${c.original}\n  * *译文*：${c.translation}`).join('\n') : ''
  ].filter(Boolean).join('\n');

  // 8. 断卦研判指南
  const interpretationGuide = `
【易理断卦研判指引】：
1. **明确用神**：根据求问事项“${question}”选取核心用神（求财看妻财，求官职/事业/升学看官鬼或父母，问合作/同辈看兄弟，问忧虑解难看子孙）。
2. **审查日月旺衰**：查看用神在地支五行上受月建（${bazi[1]}）与日辰（${bazi[2]}）的生克扶抑，是否临月破、日破、旬空（${mainLayout.dayXunKong}空）。
3. **推演动变生克**：${changingLinePositions.length > 0 ? `当前动爻为第 ${changingLinePositions.join('、')} 爻。动爻发动为变，审查动爻是生扶用神（原神发动）、还是克害用神（忌神发动），以及动化回头生、回头克、化进神或化退神。` : '当前为六爻安静之卦，以用神临日月旺衰及卦辞象传为主研判。'}
4. **辨析世应用神**：世爻（第${mainLayout.shiPosition}爻）为自身、求占者心态与处境；应爻（第${mainLayout.yingPosition}爻）为对方、彼方环境或所谋之事。察看世应相生相合抑或相冲相克。
5. **定应期与行止建议**：合处逢冲、冲处逢合、空下出空、破者逢值逢合，给出明确的时机与切实可行的行动避坑建议。
`.trim();

  // 9. 生成小卦摊专属的【一键复制 AI 提示词】
  const aiPromptData = {
    question,
    timestamp,
    additionalContext,
    mainHexagram: {
      name: mainHexagram.name,
      unicode: mainHexagram.unicode,
      judgment: mainHexagram.judgment ? {
        original: mainHexagram.judgment.original || '',
        translation: mainHexagram.judgment.translation || ''
      } : undefined,
      lines: mainHexagram.lines ? mainHexagram.lines.map(line => ({
        original: line.original || '',
        translation: line.translation || ''
      })) : undefined
    },
    changingLines: changingLinePositions,
    transformedHexagram: transformedHexagram ? {
      name: transformedHexagram.name,
      unicode: transformedHexagram.unicode,
      judgment: transformedHexagram.judgment ? {
        original: transformedHexagram.judgment.original || '',
        translation: transformedHexagram.judgment.translation || ''
      } : undefined
    } : null
  };

  const { prompt: userPrompt, systemMessage } = getDivinationPrompt('liuyao', aiPromptData);
  const copyText = `## 角色设定（AI解卦师指示）\n${systemMessage}\n\n## 卦盘/命盘数据与问题\n${userPrompt}`;

  return {
    question,
    datetime: dateStr,
    timestamp,
    lines,
    additionalContext,
    ganzhi: {
      year: bazi[0],
      month: bazi[1],
      day: bazi[2],
      hour: bazi[3],
      xunKong: mainLayout.dayXunKong
    },
    mainHexagram: {
      id: mainHexagram.id,
      name: mainHexagram.name,
      unicode: mainHexagram.unicode,
      palaceName: mainLayout.palaceName,
      palaceElement: mainLayout.palaceElement,
      shiPosition: mainLayout.shiPosition,
      yingPosition: mainLayout.yingPosition,
      isYouhun: mainLayout.isYouhun,
      isGuihun: mainLayout.isGuihun,
      judgment: mainHexagram.judgment
    },
    transformedHexagram: transformedHexagram ? {
      id: transformedHexagram.id,
      name: transformedHexagram.name,
      unicode: transformedHexagram.unicode,
      judgment: transformedHexagram.judgment
    } : null,
    changingLines: changingLinesData,
    linesDetail,
    markdownChart,
    interpretationGuide,
    aiPrompt: {
      systemMessage,
      userPrompt,
      copyText
    }
  };
}

/**
 * 六爻智能解析与多轮追问对话接口
 * 支持生成最新一轮提示词，并尝试调用后端大模型生成解析
 */
export async function interpretLiuyao(
  question: string,
  customLines?: number[],
  timestamp: number = Date.now(),
  additionalContext?: string,
  executeAi: boolean = true
): Promise<{
  divination: LiuyaoDivinationResult;
  aiInterpretation?: string;
  copyPromptText: string;
  source: 'ai_engine' | 'prompt_template';
}> {
  const divination = divineLiuyao(question, customLines, timestamp, additionalContext);

  let aiInterpretation: string | undefined = undefined;
  let source: 'ai_engine' | 'prompt_template' = 'prompt_template';

  if (executeAi) {
    try {
      const aiPromptData = {
        question: divination.question,
        timestamp: divination.timestamp,
        additionalContext: divination.additionalContext,
        mainHexagram: {
          name: divination.mainHexagram.name,
          unicode: divination.mainHexagram.unicode,
          judgment: divination.mainHexagram.judgment,
          lines: divination.changingLines.map(c => ({
            position: c.position,
            original: c.original || '',
            translation: c.translation || ''
          }))
        },
        changingLines: divination.changingLines.map(c => c.position),
        transformedHexagram: divination.transformedHexagram
      };

      aiInterpretation = await getDivinationInterpretation('liuyao', aiPromptData);
      source = 'ai_engine';
    } catch {
      // 若后端 API 未配置或调用受阻，平滑降级为提示词模板输出，由宿主 AI 处理
      source = 'prompt_template';
    }
  }

  return {
    divination,
    aiInterpretation,
    copyPromptText: divination.aiPrompt.copyText,
    source
  };
}

/**
 * 六十四卦易经原典库精确/模糊查询
 */
export function lookupHexagram(query: string | number): Hexagram | null {
  const all = getAllHexagrams();
  
  if (typeof query === 'number' || !isNaN(Number(query))) {
    const id = Number(query);
    return getHexagramById(id);
  }

  const str = String(query).trim();
  
  // 6位二进制直接查询
  if (/^[01]{6}$/.test(str)) {
    return getHexagramByStructure(str);
  }

  // 按卦名匹配（例如："乾", "乾为天", "天风姤", "姤"）
  const directMatch = all.find(h => h.name === str);
  if (directMatch) return directMatch;

  // 模糊匹配
  const partialMatch = all.find(h => h.name.includes(str) || str.includes(h.name));
  return partialMatch || null;
}

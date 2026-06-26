import OpenAI from 'openai';
import { getAllHexagrams, reconstructLiuyaoLines } from './hexagram';
import { calculateLiuyaoLayout } from './liuyaoLayout';

// Read config injected at build-time by Vite define block
const apiKey = process.env.API_KEY || '';
const baseURL = process.env.BASE_URL || 'https://api.deepseek.com';
const model = process.env.MODEL || 'deepseek-chat';

let openai: OpenAI | null = null;

// Initialize OpenAI client lazily to handle empty keys gracefully on startup
const getOpenAIClient = () => {
  if (!openai) {
    if (!apiKey) {
      console.warn('DeepSeek API Key is missing. AI divination interpretation will not function.');
    }
    openai = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
      dangerouslyAllowBrowser: true // Essential for Vite browser environments
    });
  }
  return openai;
};

export interface LiuyaoData {
  question?: string;
  timestamp?: number;
  mainHexagram: {
    name: string;
    unicode: string;
    judgment?: { original: string; translation: string };
    lines?: Array<{ original: string; translation: string }>;
  };
  changingLines: number[];
  transformedHexagram?: {
    name: string;
    unicode: string;
    judgment?: { original: string; translation: string };
  } | null;
}

export interface MeihuaData {
  question?: string;
  method: 'number' | 'time';
  upperTrigram: string;
  lowerTrigram: string;
  mainHexagram: {
    name: string;
    unicode: string;
    judgment?: { original: string; translation: string };
    lines?: Array<{ original: string; translation: string }>;
  };
  changingLine: number;
  transformedHexagram?: {
    name: string;
    unicode: string;
    judgment?: { original: string; translation: string };
  } | null;
}

export interface ZiweiData {
  profile: {
    name: string;
    gender: 'male' | 'female';
    birthDate: string;
    birthHour: string;
  };
  mingGongData: {
    majorStars: string[];
    minorStars: string[];
    desc: string;
    luckRange: string;
    branch: string;
  };
}

/**
 * Generate AI-based interpretation using DeepSeek
 */
export async function getDivinationInterpretation(
  type: 'liuyao' | 'meihua' | 'ziwei',
  data: any
): Promise<string> {
  const client = getOpenAIClient();
  if (!apiKey) {
    throw new Error('API秘钥未配置，无法进行AI解卦。请检查系统环境变量 MODEL / API_KEY / BASE_URL。');
  }

  let prompt = '';

  if (type === 'liuyao') {
    const lData = data as LiuyaoData;
    const changingLinesDesc = lData.changingLines.length > 0
      ? lData.changingLines
          .map((pos) => {
            const lineData = lData.mainHexagram.lines?.[pos - 1];
            return `第 ${pos} 爻变：爻辞为 “${lineData?.original || ''}”（译：${lineData?.translation || ''}）`;
          })
          .join('\n')
      : '无变爻（静卦）';

    prompt = `
【六爻卦盘参数】
用户问事：${lData.question || '未明确输入具体问题，问综合运势'}
本卦：${lData.mainHexagram.name}卦 (${lData.mainHexagram.unicode})
本卦卦辞：${lData.mainHexagram.judgment?.original || ''} (释义：${lData.mainHexagram.judgment?.translation || ''})

变爻分布：
${changingLinesDesc}

之卦（变卦）：${lData.transformedHexagram ? `${lData.transformedHexagram.name}卦 (${lData.transformedHexagram.unicode})` : '无之卦'}
之卦卦辞：${lData.transformedHexagram?.judgment?.original || '无'}
`;

    // Calculate Najia parameters to enrich prompt
    const hex = getAllHexagrams().find(h => h.name === lData.mainHexagram.name);
    if (hex && lData.timestamp) {
      const linesArray = reconstructLiuyaoLines(hex.id, lData.changingLines);
      const layout = calculateLiuyaoLayout(linesArray, lData.timestamp);
      
      const lineDetails = layout.lines.map(line => {
        let statusStr = '';
        if (line.isVoid) statusStr = ' (旬空)';
        else if (line.isYuePo) statusStr = ' (月破)';
        else if (line.isRiPo) statusStr = ' (日破)';
        else if (line.isAnDong) statusStr = ' (暗动)';
        
        const shiYingStr = line.isShi ? ' [世爻]' : (line.isYing ? ' [应爻]' : '');
        return `  第 ${line.position} 爻: ${line.beast} | ${line.relation} ${line.branch}${line.element} ${line.lineType === 'yang' ? '━━━' : '━ ━'}${line.isChanging ? ' (变爻)' : ''}${shiYingStr}${statusStr}`;
      }).join('\n');

      prompt += `
【专业纳甲本卦排盘信息】
起卦时间干支：${layout.yearGanzhi}年 ${layout.monthGanzhi}月 ${layout.dayGanzhi}日 ${layout.hourGanzhi}时
日旬空亡：${layout.dayXunKong}
本宫卦位：${layout.palaceName} (${layout.palaceElement}宫)${layout.isYouhun ? ' · 游魂卦' : ''}${layout.isGuihun ? ' · 归魂卦' : ''}
世应位置：世爻在第 ${layout.shiPosition} 爻，应爻在第 ${layout.yingPosition} 爻
各爻地支与六亲六神分布（自下而上）：
${lineDetails}
`;

      const hasChanging = lData.changingLines.length > 0;
      if (hasChanging) {
        const transLines = linesArray.map(v => {
          if (v === 9) return 8;
          if (v === 6) return 7;
          return v;
        });
        const transLayout = calculateLiuyaoLayout(transLines, lData.timestamp);
        
        const transLineDetails = transLayout.lines.map(line => {
          let statusStr = '';
          if (line.isVoid) statusStr = ' (旬空)';
          else if (line.isYuePo) statusStr = ' (月破)';
          else if (line.isRiPo) statusStr = ' (日破)';
          else if (line.isAnDong) statusStr = ' (暗动)';
          
          const shiYingStr = line.isShi ? ' [世爻]' : (line.isYing ? ' [应爻]' : '');
          return `  第 ${line.position} 爻: ${line.beast} | ${line.relation} ${line.branch}${line.element} ${line.lineType === 'yang' ? '━━━' : '━ ━'}${shiYingStr}${statusStr}`;
        }).join('\n');

        prompt += `
【专业纳甲变卦（之卦）排盘信息】
之卦本宫卦位：${transLayout.palaceName} (${transLayout.palaceElement}宫)${transLayout.isYouhun ? ' · 游魂卦' : ''}${transLayout.isGuihun ? ' · 归魂卦' : ''}
之卦世应位置：世爻在第 ${transLayout.shiPosition} 爻，应爻在第 ${transLayout.yingPosition} 爻
之卦各爻地支与六亲（各自宫位五行独立推算，自下而上）：
${transLineDetails}
`;
      }

      prompt += `
【专业六爻纳甲解卦要领】
请作为专业的解卦师，结合以下步骤为用户提供详尽剖析：
1. **推演并确定用神 (Yong Shen)**:
   - 依据用户询问的问题主题，从六亲中推演并确定“用神”所落的爻位（例如：求官职/工作/官司取“官鬼”，求钱财/生意取“妻财”，求考试/车房/父母取“父母”，求子孙/安全/疾病痊愈取“子孙”，求同辈/竞争取“兄弟”）。
   - 若用神在卦中伏藏（即本卦六亲不现），请指出“伏神”与“飞神”的关系，并推断用神能否出伏。
2. **评判用神与世应之强弱旺衰**:
   - 结合起卦日月的地支五行，分析用神受日月“生克冲合”的强弱旺衰程度。
   - 结合“旬空”分析用神是否空亡（属于有用避空、冲空还是填实）。
   - 分析用神是否遭遇“月破”或“日破”（被日月冲克而破散无用）。
3. **分析世应关系与爻位互动**:
   - 世爻代表 querent（求占者自己），应爻代表求占之事或对方。分析世爻与用神、应爻的生克关系（是相生、相克还是比和，是否“世克用”或“用生世”）。
4. **剖析动爻与变卦转化**:
   - 重点分析本卦中的“动爻（变爻）”对用神产生的生克影响。
   - 分析动爻在之卦（变卦）中变出之爻，与用神/世爻之间的动态关系（是否产生“回头生”、“回头克”、“化空”、“化破”、“化进神”或“化退神”）。
5. **融入六神（六兽）参断**:
   - 结合用神与世爻所临的六神（青龙主吉庆、朱雀主口舌、勾陈主迟滞、腾蛇主虚惊、白虎主官非或病伤、玄武主隐私或暗昧），刻画预测细节，使分析有血有肉。

请结合【专业纳甲本卦排盘信息】和【专业纳甲变卦（之卦）排盘信息】进行深入、通俗白话且极其符合传统卦理的分析，给出切实的行动警示与建议。
`;
    } else {
      prompt += `
请结合易经爻象、动爻与静爻的生克转换，深度剖析本卦与变卦的承接轨迹，分析世应、动变及用神关系，针对用户询问的事情给出切实的行动警示与灵性启迪。
`;
    }
  } else if (type === 'meihua') {
    const mData = data as MeihuaData;
    prompt = `
【梅花易数卦盘参数】
用户问事：${mData.question || '未明确输入具体问题，问当下玄机'}
起卦方式：${mData.method === 'number' ? '数字起卦' : '时间起卦'}

本卦：${mData.mainHexagram.name}卦 (${mData.mainHexagram.unicode})
本卦卦辞：${mData.mainHexagram.judgment?.original || ''}
体卦（无动爻）：${mData.changingLine <= 3 ? '上卦' : '下卦'} (五行卦象：${mData.changingLine <= 3 ? mData.upperTrigram : mData.lowerTrigram})
用卦（有动爻）：${mData.changingLine <= 3 ? '下卦' : '上卦'} (五行卦象：${mData.changingLine <= 3 ? mData.lowerTrigram : mData.upperTrigram})
动爻：第 ${mData.changingLine} 爻

变卦（之卦）：${mData.transformedHexagram ? `${mData.transformedHexagram.name}卦 (${mData.transformedHexagram.unicode})` : '无变卦'}

请根据梅花易数“体用生克分析法”，根据体卦与用卦的五行生克关系（生我、我生、克我、我克、同气），配合动爻爻变之走向，深入讲解此事的现状阻力、助力分布以及未来结局走向，并给出行事趋避方案。
`;
  } else if (type === 'ziwei') {
    const zData = data as ZiweiData;
    prompt = `
【紫微斗数命盘参数】
命主姓名：${zData.profile.name}
性别：${zData.profile.gender === 'male' ? '乾造 (男)' : '坤造 (女)'}
出生时间：${zData.profile.birthDate} ${zData.profile.birthHour}

命宫主星：${zData.mingGongData.majorStars.join('、')}
命宫辅星：${zData.mingGongData.minorStars.join('、')}
命宫所属格局：${zData.mingGongData.desc}
大限起岁：${zData.mingGongData.luckRange}

请结合紫微斗数命理理论，剖析该命主的核心性格特质、先天福泽格局。分析其本命盘的优势与短板，并就此格局给出具体的为人处世与自我突破的“修心解厄”指南。
`;
  }

  const systemMessage = `
你是一位经验丰富、通晓易经与命理的“小卦摊摊主”。
你说话亲切自然，像一位摆摊解卦、值得信赖的老邻居或老朋友在聊天。在解读中，你应该自称为“摊主我”或“小卦摊摊主”。
现在你需要结合用户的起卦/命盘数据，用通俗易懂的大白话为用户解读。

对于六爻占卜，必须严格遵循以下结构化排版和内容要求进行输出：
1. **说人话**：不要故弄玄虚，多用生活中的比喻，自称“摊主我”或“小卦摊摊主”。
2. **排版格式**：必须包含以下结构和标题：
   - ### 🎯 摊主结论卡片
     - **占断结论**：[成/不成/吉/凶/利/不利/能/不能...]
     - **置信程度**：[高/中/低，说明理由]
     - **应期提示**：[具体时间段或无法断定]
   - ### 💬 摊主一句话（百字简析）
     - [100字以内的口语化大白话分析]
   - ### 💡 摊主给你的趋避小建议
     - [可执行、简短的行动建议]
   - ### 🔍 摊主解卦依据链路
     - **第一步：取用神** [说明为什么取这个为用神]
     - **第二步：定旺衰** [结合日月五行断旺衰]
     - **第三步：看动变** [分析动爻变爻、回头生克等]
     - **第四步：看冲合** [六冲六合三合等关系]
     - **第五步：看特殊格局** [旬空、伏吟、反吟、伏神等]
     - **第六步：断应期** [推算具体应期及依据]
   - ### 📖 依据与引用
     - [引述经典卦理口诀或经典如《古筮真诠》等规则进行佐证，不超过100字]
   - ### ❓ 待补充与不确定信息
     - [若有信息缺失或不确定项，提出补充问题]

对于梅花易数和紫微斗数，可保留原有的亲切叙述结构（包含 ### 🎯 摊主看这卦/命盘, ### 🔍 摊主详细说, ### 💡 摊主给你的小建议）。

其他要求：
- 必须输出中文，六爻占卜字数建议在 500-950 字左右，确保推理步骤完整。
- 举例说明时可以用"打个比方"、"简单来说"、"换句话说"这类过渡词。
- 禁止使用以下词汇：拨云见日、天机、玄妙、神韵、灵性、参悟、法要。
`;

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      stream: false
    });

    return response.choices[0].message.content || '解卦未生成，请重试。';
  } catch (error: any) {
    console.error('DeepSeek API Call Failed:', error);
    throw new Error(error.message || 'API 请求发生错误，请检查网络并重试。');
  }
}

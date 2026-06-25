import { Solar } from 'lunar-javascript';

/**
 * 梅花易数计算工具
 * Meihua Yishu (Plum Blossom Numerology) calculation utilities
 */

// 数字到八卦的映射 (1-8 对应八个卦)
const TRIGRAM_MAP: Record<number, string> = {
  1: 'qian',   // 乾 ☰
  2: 'dui',    // 兑 ☱
  3: 'li',     // 离 ☲
  4: 'zhen',   // 震 ☳
  5: 'xun',    // 巽 ☴
  6: 'kan',    // 坎 ☵
  7: 'gen',    // 艮 ☶
  8: 'kun',    // 坤 ☷
};

export interface MeihuaResult {
  upperTrigram: string;
  lowerTrigram: string;
  changingLine: number; // 1-6, 从下往上数
  hexagramStructure: string; // 6位二进制字符串
  transformedStructure?: string; // 变卦结构
  method: 'number' | 'time';
  input: {
    numbers?: [number, number, number]; // 三个数字
    timestamp?: {
      year: number;
      month: number;
      day: number;
      hour: number;
      lunarStr?: string;
    };
  };
}

/**
 * 将三个数字转换为卦象
 * @param num1 第一个数字 (1-8) - 决定上卦
 * @param num2 第二个数字 (1-8) - 决定下卦
 * @param num3 第三个数字 (任意正整数) - 决定动爻
 */
export function numberToHexagram(
  num1: number,
  num2: number,
  num3: number
): MeihuaResult {
  // 验证输入
  if (num1 < 1 || num1 > 8 || num2 < 1 || num2 > 8) {
    throw new Error('前两个数字必须在1-8之间');
  }
  if (num3 < 1) {
    throw new Error('第三个数字必须是正整数');
  }

  const upperTrigram = TRIGRAM_MAP[num1];
  const lowerTrigram = TRIGRAM_MAP[num2];

  // 计算动爻位置: (num1 + num2 + num3) % 6，余数为0时取6
  const changingLine = ((num1 + num2 + num3 - 1) % 6) + 1;

  // 构建卦象结构
  const hexagramStructure = buildHexagramStructure(upperTrigram, lowerTrigram);

  // 计算变卦
  const transformedStructure = applyChangingLine(hexagramStructure, changingLine);

  return {
    upperTrigram,
    lowerTrigram,
    changingLine,
    hexagramStructure,
    transformedStructure,
    method: 'number',
    input: {
      numbers: [num1, num2, num3],
    },
  };
}

/**
 * 根据时间起卦
 * @param year 年份
 * @param month 月份 (1-12)
 * @param day 日期 (1-31)
 * @param hour 时辰 (0-23，每两小时为一个时辰)
 */
export function timeToHexagram(
  year: number,
  month: number,
  day: number,
  hour: number
): MeihuaResult {
  // 1. 将公历时间转换为农历
  const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
  const lunar = solar.getLunar();

  // 2. 获取农历年、月、日、时参数
  // 年数：地支索引 (子=1, 丑=2, ..., 亥=12)
  const yearZhi = lunar.getYearZhi();
  const zhiList = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const yearNum = zhiList.indexOf(yearZhi) + 1;

  // 月数：农历月份 (1-12)
  const monthNum = Math.abs(lunar.getMonth());

  // 日数：农历日期 (1-30)
  const dayNum = lunar.getDay();

  // 时数：时辰地支索引 (子=1, 丑=2, ..., 亥=12)
  const hourPeriod = Math.floor((hour + 1) / 2) % 12; // 0 to 11 (子=0, 丑=1, ..., 亥=11)
  const hourNum = hourPeriod + 1; // 1 to 12

  // 3. 计算梅花易数卦象数
  // 上卦：(年 + 月 + 日) % 8
  const upperNum = ((yearNum + monthNum + dayNum - 1) % 8) + 1;

  // 下卦：(年 + 月 + 日 + 时) % 8
  const lowerNum = ((yearNum + monthNum + dayNum + hourNum - 1) % 8) + 1;

  // 动爻：(年 + 月 + 日 + 时) % 6
  const changingLine = ((yearNum + monthNum + dayNum + hourNum - 1) % 6) + 1;

  const upperTrigram = TRIGRAM_MAP[upperNum];
  const lowerTrigram = TRIGRAM_MAP[lowerNum];

  const hexagramStructure = buildHexagramStructure(upperTrigram, lowerTrigram);
  const transformedStructure = applyChangingLine(hexagramStructure, changingLine);

  // 格式化农历展示字符串
  const lunarStr = `农历 ${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}日 ${lunar.getTimeZhi()}时`;

  return {
    upperTrigram,
    lowerTrigram,
    changingLine,
    hexagramStructure,
    transformedStructure,
    method: 'time',
    input: {
      timestamp: {
        year,
        month,
        day,
        hour,
        lunarStr,
      },
    },
  };
}

/**
 * 根据上下卦构建六爻卦象结构
 */
function buildHexagramStructure(upperTrigram: string, lowerTrigram: string): string {
  // 获取八卦对应的三爻结构
  const trigramStructures: Record<string, string> = {
    qian: '111',  // 乾 ☰
    dui: '011',   // 兑 ☱
    li: '101',    // 离 ☲
    zhen: '001',  // 震 ☳
    xun: '110',   // 巽 ☴
    kan: '010',   // 坎 ☵
    gen: '100',   // 艮 ☶
    kun: '000',   // 坤 ☷
  };

  const lower = trigramStructures[lowerTrigram];
  const upper = trigramStructures[upperTrigram];

  // 下卦在下，上卦在上
  return lower + upper;
}

/**
 * 应用动爻，生成变卦
 * @param structure 原卦结构
 * @param changingLine 动爻位置 (1-6)
 */
function applyChangingLine(structure: string, changingLine: number): string {
  const lines = structure.split('');
  // changingLine 从1开始，从下往上数
  const index = changingLine - 1;
  // 阴阳互变
  lines[index] = lines[index] === '1' ? '0' : '1';
  return lines.join('');
}

/**
 * 获取时辰名称（用于展示）
 */
export function getHourPeriodName(hour: number): string {
  const hourPeriod = Math.floor(hour / 2);
  const periods = [
    '子时', '丑时', '寅时', '卯时', '辰时', '巳时',
    '午时', '未时', '申时', '酉时', '戌时', '亥时'
  ];
  return periods[hourPeriod];
}

/**
 * 获取八卦名称（中文）
 */
export function getTrigramName(trigramId: string): string {
  const names: Record<string, string> = {
    qian: '乾',
    dui: '兑',
    li: '离',
    zhen: '震',
    xun: '巽',
    kan: '坎',
    gen: '艮',
    kun: '坤',
  };
  return names[trigramId] || trigramId;
}

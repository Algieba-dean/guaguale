import { builtInPools } from '../../data/shakerPools';
import type { ShakerStick } from '../../data/shakerPools';

export interface FortuneResult {
  poolId: string;
  poolName: string;
  stick: ShakerStick;
  question?: string;
  formattedText: string;
}

/**
 * 获取所有支持的签池概览
 */
export function getFortunePools() {
  return builtInPools.map(pool => ({
    id: pool.id,
    name: pool.name,
    totalSticks: pool.sticks.length,
    description: pool.id === 'today-fortune'
      ? '求卜今日综合运势、气运走势与行动宜忌'
      : pool.id === 'lunch-decider'
      ? '治愈选择困难症，求测今天吃什么美味'
      : pool.id === 'action-decision'
      ? '面对抉择时求取动静行止建议（宜行/宜静/防坑）'
      : '自定义签筒'
  }));
}

/**
 * 摇签抽签核心逻辑
 */
export function drawStick(poolId?: string, question?: string): FortuneResult {
  // 查找对应签池，默认使用 today-fortune
  let targetPool = builtInPools.find(p => p.id === poolId);
  if (!targetPool) {
    targetPool = builtInPools[0];
  }

  const sticks = targetPool.sticks;
  const randomIndex = Math.floor(Math.random() * sticks.length);
  const stick = sticks[randomIndex];

  const formattedLines: string[] = [
    `**【小卦摊·摇签结果】**`,
    `--------------------------------------`,
    `**签池**：${targetPool.name}`,
    question ? `**求问事项**：${question}` : '',
    `**签号**：第 ${stick.id} 签`,
    stick.fortune ? `**吉凶**：【${stick.fortune}】` : '',
    `**签文**：${stick.title}`,
    stick.poetry ? `**诗曰**：\n> ${stick.poetry}` : '',
    `**摊主解签与行动建议**：\n${stick.explanation}`,
    `--------------------------------------`,
    `*提示：心诚则灵，签文揭示机缘与心态，行事仍在人为。*`
  ].filter(Boolean);

  return {
    poolId: targetPool.id,
    poolName: targetPool.name,
    stick,
    question,
    formattedText: formattedLines.join('\n')
  };
}

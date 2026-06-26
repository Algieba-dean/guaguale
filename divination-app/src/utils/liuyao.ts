/**
 * Liuyao divination logic
 * Three coins are tossed, each result is heads (yang) or tails (yin)
 * The combination determines the line value:
 * - 3 heads = Old Yang (老阳) = 9 (changing)
 * - 2 heads, 1 tail = Young Yang (少阳) = 7 (static)
 * - 2 tails, 1 head = Young Yin (少阴) = 8 (static)
 * - 3 tails = Old Yin (老阴) = 6 (changing)
 */

export type CoinResult = 'heads' | 'tails';
export type LineValue = 6 | 7 | 8 | 9;

/**
 * Simulate tossing three coins
 * Returns array of three coin results
 */
export function tossCoins(): [CoinResult, CoinResult, CoinResult] {
  const toss = (): CoinResult => Math.random() < 0.5 ? 'heads' : 'tails';
  return [toss(), toss(), toss()];
}

/**
 * Convert three coin results to a line value
 */
export function coinsToLineValue(coins: CoinResult[]): LineValue {
  const headsCount = coins.filter(c => c === 'heads').length;

  switch (headsCount) {
    case 3: return 9; // Old Yang (老阳)
    case 2: return 8; // Young Yin (少阴) - 2 heads/Yang (一阴两阳)
    case 1: return 7; // Young Yang (少阳) - 1 head/Yang (一阳两阴)
    case 0: return 6; // Old Yin (老阴)
    default: return 7;
  }
}

/**
 * Generate a single line by tossing three coins
 */
export function generateLine(): { coins: CoinResult[]; value: LineValue } {
  const coins = tossCoins();
  const value = coinsToLineValue(coins);
  return { coins, value };
}

/**
 * Generate all 6 lines for a complete hexagram
 * Returns lines from bottom to top
 */
export function generateAllLines(): LineValue[] {
  const lines: LineValue[] = [];
  for (let i = 0; i < 6; i++) {
    const { value } = generateLine();
    lines.push(value);
  }
  return lines;
}

/**
 * Check if a line is changing (老阳 or 老阴)
 */
export function isChangingLine(value: LineValue): boolean {
  return value === 6 || value === 9;
}

/**
 * Get line name in Chinese
 */
export function getLineName(value: LineValue): string {
  switch (value) {
    case 9: return '老阳';
    case 7: return '少阳';
    case 8: return '少阴';
    case 6: return '老阴';
  }
}

/**
 * Get line type for display
 */
export function getLineType(value: LineValue): 'yang' | 'yin' {
  return (value === 7 || value === 9) ? 'yang' : 'yin';
}

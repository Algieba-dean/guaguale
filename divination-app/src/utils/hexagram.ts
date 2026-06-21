import hexagramsData from '../data/hexagrams.json';

export interface Hexagram {
  id: number;
  name: string;
  unicode: string;
  structure: string;
  upper: string;
  lower: string;
  judgment?: {
    original: string;
    translation: string;
  };
  lines?: Array<{
    position: number;
    original: string;
    translation: string;
  }>;
  interpretation?: {
    general: string;
    career?: string;
    relationship?: string;
  };
}

/**
 * Get hexagram by ID (1-64)
 */
export function getHexagramById(id: number): Hexagram | null {
  const hexagram = hexagramsData.hexagrams[id.toString() as keyof typeof hexagramsData.hexagrams];
  return hexagram ? (hexagram as Hexagram) : null;
}

/**
 * Get hexagram by 6-bit binary structure (e.g., "111111" for Qian)
 * Structure is from bottom to top: first digit = bottom line
 */
export function getHexagramByStructure(structure: string): Hexagram | null {
  if (structure.length !== 6) return null;

  const hexagrams = Object.values(hexagramsData.hexagrams);
  const found = hexagrams.find((h) => h.structure === structure);
  return found ? (found as Hexagram) : null;
}

/**
 * Get all hexagrams
 */
export function getAllHexagrams(): Hexagram[] {
  return Object.values(hexagramsData.hexagrams) as Hexagram[];
}

/**
 * Convert line values to binary structure
 * Line values: 6 (old yin), 7 (young yang), 8 (young yin), 9 (old yang)
 * Returns structure string: 1 = yang, 0 = yin
 */
export function linesToStructure(lines: number[]): string {
  if (lines.length !== 6) return '';

  return lines.map(line => {
    // 7 (young yang) and 9 (old yang) = 1
    // 6 (old yin) and 8 (young yin) = 0
    return (line === 7 || line === 9) ? '1' : '0';
  }).join('');
}

/**
 * Get changing line positions (1-indexed, from bottom)
 * Old yang (9) and old yin (6) are changing lines
 */
export function getChangingLines(lines: number[]): number[] {
  const changing: number[] = [];
  lines.forEach((line, index) => {
    if (line === 6 || line === 9) {
      changing.push(index + 1); // 1-indexed from bottom
    }
  });
  return changing;
}

/**
 * Calculate transformed hexagram from changing lines
 * Changing lines flip: yang -> yin, yin -> yang
 */
export function getTransformedHexagram(lines: number[]): Hexagram | null {
  const changingPositions = getChangingLines(lines);
  if (changingPositions.length === 0) return null;

  const transformedLines = lines.map(line => {
    if (line === 9) return 8; // old yang -> young yin
    if (line === 6) return 7; // old yin -> young yang
    return line; // young lines stay the same
  });

  const structure = linesToStructure(transformedLines);
  return getHexagramByStructure(structure);
}

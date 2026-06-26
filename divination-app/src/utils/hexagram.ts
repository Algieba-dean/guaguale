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

  // Reverse lines to map from top (line 6 / index 5) to bottom (line 1 / index 0)
  // so that character 0 matches line 6 and character 5 matches line 1
  return [...lines].reverse().map(line => {
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

/**
 * Reconstruct the original 6 line values (6, 7, 8, 9) from the saved hexagram ID and changing lines.
 */
export function reconstructLiuyaoLines(mainHexagramId: number, changingLines: number[] = []): number[] {
  const hexagram = getHexagramById(mainHexagramId);
  if (!hexagram || !hexagram.structure) return [];

  const structure = hexagram.structure; // top-to-bottom (0 is line 6, 5 is line 1)
  const lines: number[] = new Array(6);
  for (let i = 0; i < 6; i++) {
    const pos = 6 - i; // line position 6 down to 1
    const isChanging = changingLines.includes(pos);
    const isYang = structure[i] === '1';

    const val = isYang ? (isChanging ? 9 : 7) : (isChanging ? 6 : 8);
    lines[pos - 1] = val; // place in 0-indexed array (pos 1 is index 0)
  }
  return lines;
}

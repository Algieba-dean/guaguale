interface HexagramDisplayProps {
  structure: string; // 6-bit binary string, e.g., "111111"
  changingLines?: number[]; // 1-indexed positions from bottom
  size?: 'sm' | 'md' | 'lg';
}

export function HexagramDisplay({
  structure,
  changingLines = [],
  size = 'md'
}: HexagramDisplayProps) {
  if (structure.length !== 6) return null;

  const sizeStyles = {
    sm: { gap: 'gap-1', lineHeight: 'h-1', lineWidth: 'w-12' },
    md: { gap: 'gap-2', lineHeight: 'h-1.5', lineWidth: 'w-16' },
    lg: { gap: 'gap-3', lineHeight: 'h-2', lineWidth: 'w-20' }
  };

  const styles = sizeStyles[size];

  // Structure is from bottom to top, so reverse for display
  const lines = structure.split('').reverse();

  return (
    <div className={`flex flex-col ${styles.gap} items-center`}>
      {lines.map((line, index) => {
        const position = index + 1; // 1-indexed from bottom
        const isChanging = changingLines.includes(position);
        const isYang = line === '1';

        return (
          <div
            key={index}
            className={`flex items-center justify-center ${styles.lineWidth} ${styles.lineHeight} ${
              isChanging ? 'animate-pulse' : ''
            }`}
          >
            {isYang ? (
              // Solid yang line
              <div
                className={`w-full ${styles.lineHeight} rounded-sm ${
                  isChanging ? 'bg-terracotta' : 'bg-ink'
                }`}
              />
            ) : (
              // Broken yin line
              <div className="w-full flex gap-2 justify-center">
                <div
                  className={`flex-1 ${styles.lineHeight} rounded-sm ${
                    isChanging ? 'bg-terracotta' : 'bg-ink'
                  }`}
                />
                <div
                  className={`flex-1 ${styles.lineHeight} rounded-sm ${
                    isChanging ? 'bg-terracotta' : 'bg-ink'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

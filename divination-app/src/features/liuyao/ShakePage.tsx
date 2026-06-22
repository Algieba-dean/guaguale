import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageTransition } from '../../components/shared/PageTransition';
import { Button } from '../../components/shared/Button';
import { HexagramDisplay } from '../../components/shared/HexagramDisplay';
import { CoinAnimation } from '../../components/shared/CoinAnimation';
import { generateLine, generateAllLines, getLineName, type LineValue, type CoinResult } from '../../utils/liuyao';
import { linesToStructure } from '../../utils/hexagram';

export function ShakePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { question, mode } = location.state as { question: string; mode: 'ritual' | 'quick' };

  const [lines, setLines] = useState<LineValue[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [coins, setCoins] = useState<CoinResult[] | undefined>(undefined);

  // Quick mode: auto-generate all lines
  useEffect(() => {
    if (mode === 'quick') {
      const allLines = generateAllLines();
      let index = 0;

      const interval = setInterval(() => {
        if (index < allLines.length) {
          setLines((prev) => [...prev, allLines[index]]);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 300);

      return () => clearInterval(interval);
    }
  }, [mode]);

  // Navigate to result when all 6 lines are complete
  useEffect(() => {
    if (lines.length === 6) {
      setTimeout(() => {
        navigate('/liuyao/result', { state: { question, lines } });
      }, 1000);
    }
  }, [lines, navigate, question]);

  const handleToss = () => {
    if (isAnimating || lines.length >= 6) return;

    const { coins: tossedCoins, value } = generateLine();
    // 把三枚铜钱的真实正反结果交给动画播放
    setCoins(tossedCoins);
    setIsAnimating(true);

    // Simulate coin animation
    setTimeout(() => {
      setLines((prev) => [...prev, value]);
      setIsAnimating(false);
    }, 1400);
  };

  const structure = linesToStructure(lines);

  return (
    <PageTransition>
      <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-pill bg-terracotta-tint text-terracotta text-sm font-light">
              {mode === 'ritual' ? '投掷铜钱' : '自动生成'}
            </div>
            <h2 className="text-3xl font-serif text-ink">
              {mode === 'ritual'
                ? `第 ${lines.length + 1} 爻`
                : '卦象生成中...'}
            </h2>
            {question && (
              <p className="text-muted font-light text-sm">
                问：{question}
              </p>
            )}
          </div>

          {/* Progress */}
          <div className="flex justify-center gap-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`w-12 h-1 rounded-full transition-colors ${
                  i < lines.length ? 'bg-terracotta' : 'bg-border'
                }`}
              />
            ))}
          </div>

          {/* Hexagram Display */}
          <div className="bg-cream-light rounded-3xl border border-border p-8 flex flex-col items-center space-y-8">
            {structure && (
              <HexagramDisplay
                structure={structure}
                size="lg"
              />
            )}

            {/* Coin Animation (Ritual Mode) */}
            {mode === 'ritual' && lines.length < 6 && (
              <div className="space-y-6 flex flex-col items-center">
                <CoinAnimation
                  isAnimating={isAnimating}
                  coins={coins}
                />

                <Button
                  onClick={handleToss}
                  disabled={isAnimating}
                  variant="primary"
                  size="lg"
                >
                  {isAnimating ? '投掷中...' : '投掷铜钱'}
                </Button>
              </div>
            )}

            {/* Lines Generated */}
            {lines.length > 0 && (
              <div className="w-full pt-4 border-t border-border">
                <div className="space-y-2">
                  {lines.map((line, index) => {
                    // 根据爻值显示符号
                    const getLineSymbol = (value: number) => {
                      if (value === 9) return '━━━  '; // 老阳（变爻）
                      if (value === 7) return '━━━  '; // 少阳
                      if (value === 6) return '━  ━ '; // 老阴（变爻）
                      if (value === 8) return '━  ━ '; // 少阴
                      return '';
                    };

                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-muted font-light">第 {index + 1} 爻：</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-lg">{getLineSymbol(line)}</span>
                          <span className={`${line === 6 || line === 9 ? 'text-terracotta font-medium' : 'text-ink font-light'}`}>
                            {getLineName(line)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {lines.length === 6 && (
            <p className="text-center text-muted font-light text-sm">
              卦象已成，正在跳转到解读...
            </p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

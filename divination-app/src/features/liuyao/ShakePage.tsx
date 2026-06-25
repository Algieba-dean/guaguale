import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../../components/shared/PageTransition';
import { Button } from '../../components/shared/Button';
import { HexagramDisplay } from '../../components/shared/HexagramDisplay';
import { CoinAnimation } from '../../components/shared/CoinAnimation';
import { generateLine, generateAllLines, getLineName, type LineValue, type CoinResult } from '../../utils/liuyao';
import { linesToStructure } from '../../utils/hexagram';
import { useDeviceShake, isShakeAvailable } from '../../hooks/useDeviceShake';

export function ShakePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { question: string; mode: 'ritual' | 'quick' } | null;

  const [lines, setLines] = useState<LineValue[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [coins, setCoins] = useState<CoinResult[] | undefined>(undefined);
  const [shakeFlash, setShakeFlash] = useState(false);

  const question = state?.question ?? '';
  const mode = state?.mode ?? 'ritual';

  const handleToss = useCallback(() => {
    if (isAnimating || lines.length >= 6) return;

    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 80]);
    }

    const { coins: tossedCoins, value } = generateLine();
    setCoins(tossedCoins);
    setIsAnimating(true);

    setTimeout(() => {
      setLines((prev) => [...prev, value]);
      setIsAnimating(false);
    }, 1400);
  }, [isAnimating, lines.length]);

  // --- Device shake integration ---
  const shakeEnabled = mode === 'ritual' && lines.length < 6 && !isAnimating;

  const handleShake = useCallback(() => {
    if (!shakeEnabled) return;
    // Flash visual indicator
    setShakeFlash(true);
    setTimeout(() => setShakeFlash(false), 400);
    handleToss();
  }, [shakeEnabled, handleToss]);

  const { requestPermission, permissionGranted } = useDeviceShake({
    onShake: handleShake,
    threshold: 15,
    enabled: shakeEnabled,
  });

  const showShakeUI = isShakeAvailable();

  // Redirect if no state (direct navigation to /liuyao/shake)
  useEffect(() => {
    if (!state) {
      navigate('/liuyao', { replace: true });
    }
  }, [state, navigate]);

  // Quick mode: auto-generate all lines
  useEffect(() => {
    if (!state || mode !== 'quick') return;
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
  }, [mode, state]);

  // Navigate to result when all 6 lines are complete
  useEffect(() => {
    if (lines.length === 6) {
      setTimeout(() => {
        navigate('/liuyao/result', { state: { question, lines } });
      }, 1000);
    }
  }, [lines, navigate, question]);

  // Keyboard shortcut listener for space/enter keys
  useEffect(() => {
    if (mode !== 'ritual' || lines.length >= 6) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        handleToss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mode, lines.length, handleToss]);

  // Don't render if state is missing (redirecting)
  if (!state) return null;

  const fullStructure = lines.length === 6 ? linesToStructure(lines) : '';

  return (
    <PageTransition>
      <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full space-y-8">
          {/* Shake flash overlay */}
          <AnimatePresence>
            {shakeFlash && (
              <motion.div
                className="fixed inset-0 z-50 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  background: 'radial-gradient(circle at center, rgba(223,177,91,0.15) 0%, transparent 70%)'
                }}
              />
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-pill bg-terracotta-tint text-terracotta text-sm font-light">
              {mode === 'ritual' ? '投掷铜钱' : '自动生成'}
            </div>
            <h2 className="text-3xl font-serif text-ink">
              {mode === 'ritual'
                ? lines.length >= 6
                  ? '卦象已成'
                  : `第 ${lines.length + 1} 爻`
                : lines.length >= 6
                  ? '卦象已成'
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
              <motion.div
                key={i}
                className={`w-12 h-1.5 rounded-full transition-all duration-300 ${
                  i < lines.length
                    ? 'bg-gold shadow-[0_0_8px_rgba(223,177,91,0.5)]'
                    : 'bg-border/60'
                }`}
                initial={false}
                animate={i === lines.length - 1 && i < 6 ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            ))}
          </div>

          {/* Hexagram Display */}
          <div className="bg-cream-light/60 backdrop-blur-md rounded-3xl border border-border p-8 flex flex-col items-center space-y-8">
            {fullStructure && (
              <HexagramDisplay
                structure={fullStructure}
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

                <div className="flex flex-col items-center gap-3">
                  <Button
                    onClick={handleToss}
                    disabled={isAnimating}
                    variant="primary"
                    size="lg"
                  >
                    {isAnimating ? '正在摇卦...' : '摇卦投币'}
                  </Button>

                  {/* Shake-to-divinate UI for mobile */}
                  {showShakeUI && (
                    <div className="flex flex-col items-center gap-2">
                      {!permissionGranted ? (
                        <button
                          onClick={requestPermission}
                          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gold/10 border border-gold/20 text-gold text-xs font-sans transition-all duration-300 hover:bg-gold/20 active:scale-95"
                        >
                          <ShakeIcon className="w-4 h-4" />
                          <span>开启摇晃手机投掷</span>
                        </button>
                      ) : (
                        <motion.div
                          className="flex items-center gap-2 text-gold/70 text-[11px] font-sans font-light"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <motion.div
                            animate={!isAnimating ? {
                              rotate: [-8, 8, -8],
                              x: [-1, 1, -1],
                            } : {}}
                            transition={{
                              repeat: Infinity,
                              duration: 0.5,
                              ease: 'easeInOut',
                            }}
                          >
                            <ShakeIcon className="w-4 h-4" />
                          </motion.div>
                          <span>📱 摇晃手机也可投掷铜钱</span>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Desktop keyboard hint — always show */}
                  <p className="text-[11px] text-muted font-sans font-light mt-1">
                    💡 您也可以直接按 <kbd className="px-1.5 py-0.5 rounded bg-cream border border-border text-[10px]">空格键</kbd> 或 <kbd className="px-1.5 py-0.5 rounded bg-cream border border-border text-[10px]">回车键</kbd> 进行投掷
                  </p>
                </div>
              </div>
            )}

            {/* Lines Generated */}
            {lines.length > 0 && (
              <div className="w-full pt-6 border-t border-border/80">
                <div className="space-y-2">
                  {lines.map((line, index) => {
                    const getLineSymbol = (value: number) => {
                      if (value === 9) return '━━━ ◯'; // 老阳（变爻）
                      if (value === 7) return '━━━';    // 少阳
                      if (value === 6) return '━ ━ ✕'; // 老阴（变爻）
                      if (value === 8) return '━ ━';    // 少阴
                      return '';
                    };

                    const isChanging = line === 6 || line === 9;

                    return (
                      <motion.div
                        key={index}
                        className="flex justify-between items-center text-xs font-sans"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                      >
                        <span className="text-muted font-light">初至上第 {index + 1} 爻：</span>
                        <div className="flex items-center gap-4">
                          <span className={`font-mono text-base tracking-wider ${isChanging ? 'text-terracotta' : 'text-gold/80'}`}>
                            {getLineSymbol(line)}
                          </span>
                          <span className={`${isChanging ? 'text-terracotta font-medium' : 'text-ink font-light'}`}>
                            {getLineName(line)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {lines.length === 6 && (
            <motion.p
              className="text-center text-muted font-light text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              卦象已成，正在跳转到解读...
            </motion.p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

/** SVG icon for a shaking phone */
function ShakeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Phone body */}
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2" />
      {/* Shake lines left */}
      <path d="M4 8 L2 6" />
      <path d="M4 16 L2 18" />
      <path d="M3.5 12 L1 12" />
      {/* Shake lines right */}
      <path d="M20 8 L22 6" />
      <path d="M20 16 L22 18" />
      <path d="M20.5 12 L23 12" />
    </svg>
  );
}

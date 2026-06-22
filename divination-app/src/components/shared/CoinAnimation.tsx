import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type CoinResult = 'heads' | 'tails';

interface CoinAnimationProps {
  onComplete?: (coins: CoinResult[]) => void;
  isAnimating?: boolean;
  /** 三枚铜钱的正反结果，正面(heads)为阳，反面(tails)为阴 */
  coins?: CoinResult[];
}

/** 单枚铜钱：静止 / 翻转 / 落定三态 */
function Coin({
  result,
  isAnimating,
  delay,
  reducedMotion,
}: {
  result?: CoinResult;
  isAnimating: boolean;
  delay: number;
  reducedMotion: boolean;
}) {
  const headsFace = (
    <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 border-yellow-500 border-4 flex items-center justify-center shadow-lg">
      <span className="text-xs font-serif text-yellow-900">正</span>
    </div>
  );
  const tailsFace = (
    <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 border-gray-600 border-4 flex items-center justify-center shadow-lg">
      <span className="text-xs font-serif text-gray-900">反</span>
    </div>
  );

  // 翻转动画中
  if (isAnimating) {
    return (
      <motion.div
        className="w-14 h-14"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{
          rotateY: reducedMotion ? 0 : [0, 360, 720, 1080],
          scale: reducedMotion ? 1 : [1, 1.15, 1, 1.15, 1],
        }}
        transition={{
          duration: reducedMotion ? 0 : 1,
          ease: 'easeInOut',
          delay: reducedMotion ? 0 : delay,
        }}
      >
        {headsFace}
      </motion.div>
    );
  }

  // 落定结果
  if (result) {
    return (
      <motion.div
        className="w-14 h-14"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {result === 'heads' ? headsFace : tailsFace}
      </motion.div>
    );
  }

  // 静止状态（默认显示正面）
  return <div className="w-14 h-14">{headsFace}</div>;
}

export function CoinAnimation({ onComplete, isAnimating = false, coins }: CoinAnimationProps) {
  const [finalCoins, setFinalCoins] = useState<CoinResult[] | null>(null);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (isAnimating) {
      // 新一轮投掷开始，先清除上一次的结果，以便重新播放翻转动画
      setFinalCoins(null);

      if (coins) {
        const duration = prefersReducedMotion ? 0 : 1200;
        const timer = setTimeout(() => {
          setFinalCoins(coins);
          onComplete?.(coins);
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [isAnimating, coins, onComplete, prefersReducedMotion]);

  return (
    <div className="flex items-center justify-center gap-4" style={{ perspective: '1000px' }}>
      {[0, 1, 2].map((i) => (
        <Coin
          key={i}
          isAnimating={isAnimating && !finalCoins}
          result={finalCoins?.[i]}
          delay={i * 0.12}
          reducedMotion={prefersReducedMotion}
        />
      ))}
    </div>
  );
}

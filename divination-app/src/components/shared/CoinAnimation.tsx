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
    <div className="w-full h-full select-none">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="heads-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCE7B2" />
            <stop offset="30%" stopColor="#D7B568" />
            <stop offset="70%" stopColor="#9E7C3B" />
            <stop offset="100%" stopColor="#6E501C" />
          </linearGradient>
        </defs>
        <path d="M 50 4 A 46 46 0 1 1 49.9 4 Z M 40 40 L 60 40 L 60 60 L 40 60 Z" fill="url(#heads-grad)" fillRule="evenodd" stroke="#5C4214" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="#FCE7B2" strokeWidth="1" opacity="0.3" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill="none" stroke="#5C4214" strokeWidth="1.5" />
        <text x="50" y="27" textAnchor="middle" fontFamily="'Ma Shan Zheng', 'Zhi Mang Xing', cursive" fontWeight="bold" fontSize="15" fill="#422E0B">乾</text>
        <text x="50" y="81" textAnchor="middle" fontFamily="'Ma Shan Zheng', 'Zhi Mang Xing', cursive" fontWeight="bold" fontSize="15" fill="#422E0B">坤</text>
        <text x="25" y="55" textAnchor="middle" fontFamily="'Ma Shan Zheng', 'Zhi Mang Xing', cursive" fontWeight="bold" fontSize="15" fill="#422E0B">通</text>
        <text x="75" y="55" textAnchor="middle" fontFamily="'Ma Shan Zheng', 'Zhi Mang Xing', cursive" fontWeight="bold" fontSize="15" fill="#422E0B">宝</text>
      </svg>
    </div>
  );

  const tailsFace = (
    <div className="w-full h-full select-none">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="tails-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2E6E9" />
            <stop offset="30%" stopColor="#B0B8C0" />
            <stop offset="70%" stopColor="#737E88" />
            <stop offset="100%" stopColor="#4B535A" />
          </linearGradient>
        </defs>
        <path d="M 50 4 A 46 46 0 1 1 49.9 4 Z M 40 40 L 60 40 L 60 60 L 40 60 Z" fill="url(#tails-grad)" fillRule="evenodd" stroke="#2D3337" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.3" />
        <rect x="38" y="38" width="24" height="24" rx="2" fill="none" stroke="#2D3337" strokeWidth="1.5" />
        <text x="50" y="27" textAnchor="middle" fontFamily="'Ma Shan Zheng', 'Zhi Mang Xing', cursive" fontWeight="bold" fontSize="15" fill="#202427">阴</text>
        <text x="50" y="81" textAnchor="middle" fontFamily="'Ma Shan Zheng', 'Zhi Mang Xing', cursive" fontWeight="bold" fontSize="15" fill="#202427">阳</text>
        <text x="25" y="55" textAnchor="middle" fontFamily="'Ma Shan Zheng', 'Zhi Mang Xing', cursive" fontWeight="bold" fontSize="15" fill="#202427">贞</text>
        <text x="75" y="55" textAnchor="middle" fontFamily="'Ma Shan Zheng', 'Zhi Mang Xing', cursive" fontWeight="bold" fontSize="15" fill="#202427">吉</text>
      </svg>
    </div>
  );

  // 翻转动画中
  if (isAnimating) {
    return (
      <motion.div
        className="w-16 h-16"
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
        className="w-16 h-16"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {result === 'heads' ? headsFace : tailsFace}
      </motion.div>
    );
  }

  // 静止状态（默认显示正面）
  return <div className="w-16 h-16">{headsFace}</div>;
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

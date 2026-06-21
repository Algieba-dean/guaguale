import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CoinAnimationProps {
  onComplete?: (result: 'heads' | 'tails') => void;
  isAnimating?: boolean;
  result?: 'heads' | 'tails';
}

export function CoinAnimation({ onComplete, isAnimating = false, result }: CoinAnimationProps) {
  const [finalResult, setFinalResult] = useState<'heads' | 'tails' | null>(null);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (isAnimating && result) {
      const duration = prefersReducedMotion ? 0 : 1000;
      const timer = setTimeout(() => {
        setFinalResult(result);
        onComplete?.(result);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isAnimating, result, onComplete, prefersReducedMotion]);

  // 静止状态 - 金色硬币
  if (!isAnimating && !finalResult) {
    return (
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 border-4 border-yellow-500 flex items-center justify-center shadow-lg">
        <span className="text-sm font-serif text-yellow-900">正面</span>
      </div>
    );
  }

  // 最终结果显示
  if (finalResult) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`w-20 h-20 rounded-full flex items-center justify-center text-base font-serif shadow-lg border-4 ${
          finalResult === 'heads'
            ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 border-yellow-500 text-yellow-900'
            : 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 border-gray-600 text-gray-900'
        }`}
      >
        {finalResult === 'heads' ? '正面' : '反面'}
      </motion.div>
    );
  }

  // 翻转动画 - 在金色和银色之间切换
  return (
    <motion.div
      className="relative w-20 h-20"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="absolute inset-0 rounded-full flex items-center justify-center shadow-lg border-4"
        style={{ backfaceVisibility: 'hidden' }}
        animate={{
          rotateY: prefersReducedMotion ? 0 : [0, 360, 720, 1080],
          scale: prefersReducedMotion ? 1 : [1, 1.1, 1, 1.1, 1]
        }}
        transition={{
          duration: prefersReducedMotion ? 0 : 1,
          ease: 'easeInOut'
        }}
      >
        {/* 动态显示金色或银色 */}
        <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 border-yellow-500 border-4 flex items-center justify-center">
          <span className="text-sm font-serif text-yellow-900">正面</span>
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-0 rounded-full flex items-center justify-center shadow-lg border-4"
        style={{ backfaceVisibility: 'hidden', rotateY: 180 }}
        animate={{
          rotateY: prefersReducedMotion ? 180 : [180, 540, 900, 1260],
          scale: prefersReducedMotion ? 1 : [1, 1.1, 1, 1.1, 1]
        }}
        transition={{
          duration: prefersReducedMotion ? 0 : 1,
          ease: 'easeInOut'
        }}
      >
        {/* 反面 - 银色 */}
        <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 border-gray-600 border-4 flex items-center justify-center">
          <span className="text-sm font-serif text-gray-900">反面</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

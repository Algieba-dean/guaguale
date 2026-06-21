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

  if (!isAnimating && !finalResult) {
    return (
      <div className="w-16 h-16 rounded-full bg-terracotta-tint border-2 border-terracotta flex items-center justify-center">
        <span className="text-2xl">🪙</span>
      </div>
    );
  }

  if (finalResult) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-16 h-16 rounded-full bg-terracotta text-white flex items-center justify-center text-sm font-serif"
      >
        {finalResult === 'heads' ? '阳' : '阴'}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-16 h-16 rounded-full bg-terracotta-tint border-2 border-terracotta flex items-center justify-center"
      animate={{
        rotateY: prefersReducedMotion ? 0 : [0, 360, 720, 1080],
        scale: prefersReducedMotion ? 1 : [1, 1.1, 1, 1.1, 1]
      }}
      transition={{
        duration: prefersReducedMotion ? 0 : 1,
        ease: 'easeInOut'
      }}
    >
      <span className="text-2xl">🪙</span>
    </motion.div>
  );
}

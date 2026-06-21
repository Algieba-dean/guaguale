import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`${sizeStyles[size]} rounded-full border-2 border-terracotta-tint border-t-terracotta`}
        animate={prefersReducedMotion ? {} : { rotate: 360 }}
        transition={
          prefersReducedMotion
            ? {}
            : {
                duration: 1,
                repeat: Infinity,
                ease: 'linear'
              }
        }
      />
    </div>
  );
}

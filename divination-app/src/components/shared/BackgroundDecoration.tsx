import { motion } from 'framer-motion';

export function BackgroundDecoration() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Background Spotlight Glows */}
      <div className="absolute top-[-10%] left-[50%] translate-x-[-50%] w-[80vw] h-[80vw] max-w-[800px] rounded-full bg-radial from-terracotta/8 via-transparent to-transparent opacity-60 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] max-w-[600px] rounded-full bg-radial from-gold/5 via-transparent to-transparent opacity-40 blur-3xl" />
      <div className="absolute top-[40%] left-[-10%] w-[50vw] h-[50vw] max-w-[500px] rounded-full bg-radial from-terracotta/4 via-transparent to-transparent opacity-30 blur-3xl" />

      {/* Rotating Celestial Astrolabe / Bagua Outline */}
      <div className="absolute top-[20%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] h-[90vw] max-w-[750px] opacity-[0.03] md:opacity-[0.04] text-gold flex items-center justify-center">
        <motion.svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        >
          {/* Concentric rings */}
          <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" />
          <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="0.75" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
          <circle cx="100" cy="100" r="55" fill="none" stroke="currentColor" strokeWidth="0.75" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 3" />
          <circle cx="100" cy="100" r="25" fill="none" stroke="currentColor" strokeWidth="0.75" />

          {/* Grid lines */}
          <line x1="100" y1="5" x2="100" y2="195" stroke="currentColor" strokeWidth="0.25" opacity="0.5" />
          <line x1="5" y1="100" x2="195" y2="100" stroke="currentColor" strokeWidth="0.25" opacity="0.5" />
          <line x1="33" y1="33" x2="167" y2="167" stroke="currentColor" strokeWidth="0.25" opacity="0.3" strokeDasharray="2 2" />
          <line x1="33" y1="167" x2="167" y2="33" stroke="currentColor" strokeWidth="0.25" opacity="0.3" strokeDasharray="2 2" />

          {/* Bagua symbols placement rings */}
          <g opacity="0.8">
            {/* Qian (Heaven) - Top */}
            <g transform="translate(100, 12)">
              <line x1="-8" y1="-2" x2="8" y2="-2" stroke="currentColor" strokeWidth="1" />
              <line x1="-8" y1="1" x2="8" y2="1" stroke="currentColor" strokeWidth="1" />
              <line x1="-8" y1="4" x2="8" y2="4" stroke="currentColor" strokeWidth="1" />
            </g>
            {/* Kun (Earth) - Bottom */}
            <g transform="translate(100, 188) rotate(180)">
              <line x1="-8" y1="-2" x2="-1" y2="-2" stroke="currentColor" strokeWidth="1" />
              <line x1="1" y1="-2" x2="8" y2="-2" stroke="currentColor" strokeWidth="1" />
              <line x1="-8" y1="1" x2="-1" y2="1" stroke="currentColor" strokeWidth="1" />
              <line x1="1" y1="1" x2="8" y2="1" stroke="currentColor" strokeWidth="1" />
              <line x1="-8" y1="4" x2="-1" y2="4" stroke="currentColor" strokeWidth="1" />
              <line x1="1" y1="4" x2="8" y2="4" stroke="currentColor" strokeWidth="1" />
            </g>
            {/* Li (Fire) - Right */}
            <g transform="translate(188, 100) rotate(90)">
              <line x1="-8" y1="-2" x2="8" y2="-2" stroke="currentColor" strokeWidth="1" />
              <line x1="-8" y1="1" x2="-1" y2="1" stroke="currentColor" strokeWidth="1" />
              <line x1="1" y1="1" x2="8" y2="1" stroke="currentColor" strokeWidth="1" />
              <line x1="-8" y1="4" x2="8" y2="4" stroke="currentColor" strokeWidth="1" />
            </g>
            {/* Kan (Water) - Left */}
            <g transform="translate(12, 100) rotate(-90)">
              <line x1="-8" y1="-2" x2="-1" y2="-2" stroke="currentColor" strokeWidth="1" />
              <line x1="1" y1="-2" x2="8" y2="-2" stroke="currentColor" strokeWidth="1" />
              <line x1="-8" y1="1" x2="8" y2="1" stroke="currentColor" strokeWidth="1" />
              <line x1="-8" y1="4" x2="-1" y2="4" stroke="currentColor" strokeWidth="1" />
              <line x1="1" y1="4" x2="8" y2="4" stroke="currentColor" strokeWidth="1" />
            </g>
          </g>

          {/* Taiji outline at center */}
          <g transform="translate(100, 100)">
            <path d="M 0 -25 A 12.5 12.5 0 0 0 0 0 A 12.5 12.5 0 0 1 0 25 A 25 25 0 0 1 0 -25 Z" fill="currentColor" opacity="0.15" />
            <path d="M 0 -25 A 12.5 12.5 0 0 0 0 0 A 12.5 12.5 0 0 1 0 25 A 25 25 0 0 0 0 -25 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="0" cy="-12.5" r="2.5" fill="currentColor" />
            <circle cx="0" cy="12.5" r="2.5" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </g>
        </motion.svg>
      </div>

      {/* Decorative Traditional Border Corner Ornaments (1px gold lines) */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t border-l border-gold/20 pointer-events-none hidden md:block">
        <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-gold/20" />
      </div>
      <div className="absolute top-4 right-4 w-12 h-12 border-t border-r border-gold/20 pointer-events-none hidden md:block">
        <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-gold/20" />
      </div>
      <div className="absolute bottom-24 md:bottom-4 left-4 w-12 h-12 border-b border-l border-gold/20 pointer-events-none hidden md:block">
        <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-gold/20" />
      </div>
      <div className="absolute bottom-24 md:bottom-4 right-4 w-12 h-12 border-b border-r border-gold/20 pointer-events-none hidden md:block">
        <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-gold/20" />
      </div>
    </div>
  );
}

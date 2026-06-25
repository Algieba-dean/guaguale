import { Link } from 'react-router-dom';
import { PageTransition } from '../../components/shared/PageTransition';
import { getStorageStats } from '../../utils/storage';
import { useEffect, useState } from 'react';

// Custom Guochao SVGs
const LiuyaoIcon = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 text-gold group-hover:rotate-180 transition-transform duration-1000">
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M 50 5 A 22.5 22.5 0 0 0 50 50 A 22.5 22.5 0 0 1 50 95 A 45 45 0 0 1 50 5 Z" fill="currentColor" className="opacity-85" />
    <circle cx="50" cy="27.5" r="6" fill="currentColor" />
    <circle cx="50" cy="72.5" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const MeihuaIcon = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 text-terracotta group-hover:scale-110 transition-transform duration-500">
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 3" className="opacity-30" />
    {/* 5 Petals */}
    <g fill="none" stroke="currentColor" strokeWidth="1.25">
      <circle cx="50" cy="50" r="5" className="opacity-60" />
      <path d="M 50 45 C 44 45 40 35 50 31 C 60 35 56 45 50 45 Z" />
      <path d="M 50 45 C 44 45 40 35 50 31 C 60 35 56 45 50 45 Z" transform="rotate(72, 50, 50)" />
      <path d="M 50 45 C 44 45 40 35 50 31 C 60 35 56 45 50 45 Z" transform="rotate(144, 50, 50)" />
      <path d="M 50 45 C 44 45 40 35 50 31 C 60 35 56 45 50 45 Z" transform="rotate(216, 50, 50)" />
      <path d="M 50 45 C 44 45 40 35 50 31 C 60 35 56 45 50 45 Z" transform="rotate(288, 50, 50)" />
    </g>
    {/* Pistils */}
    <g stroke="currentColor" strokeWidth="0.75" opacity="0.6" fill="currentColor">
      <line x1="50" y1="50" x2="50" y2="37" />
      <circle cx="50" cy="37" r="0.75" />
      <line x1="50" y1="50" x2="62" y2="41" />
      <circle cx="62" cy="41" r="0.75" />
      <line x1="50" y1="50" x2="58" y2="60" />
      <circle cx="58" cy="60" r="0.75" />
      <line x1="50" y1="50" x2="42" y2="60" />
      <circle cx="42" cy="60" r="0.75" />
      <line x1="50" y1="50" x2="38" y2="41" />
      <circle cx="38" cy="41" r="0.75" />
    </g>
  </svg>
);

const ZiweiIcon = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 text-[#6B8AFD] group-hover:scale-105 transition-transform duration-500">
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.75" className="opacity-30" />
    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" className="opacity-20" />
    {/* Big Dipper Constellation */}
    <g fill="currentColor" stroke="currentColor" strokeWidth="0.5" className="text-gold">
      <circle cx="28" cy="32" r="2" />
      <circle cx="37" cy="34" r="1.5" />
      <circle cx="45" cy="41" r="1.5" />
      <circle cx="53" cy="46" r="1.5" />
      <circle cx="55" cy="57" r="2" />
      <circle cx="68" cy="61" r="2" />
      <circle cx="72" cy="48" r="1.5" />
      <circle cx="59" cy="44" r="1.5" />
      
      <line x1="28" y1="32" x2="37" y2="34" opacity="0.4" />
      <line x1="37" y1="34" x2="45" y2="41" opacity="0.4" />
      <line x1="45" y1="41" x2="53" y2="46" opacity="0.4" />
      <line x1="53" y1="46" x2="55" y2="57" opacity="0.4" />
      <line x1="55" y1="57" x2="68" y2="61" opacity="0.4" />
      <line x1="68" y1="61" x2="72" y2="48" opacity="0.4" />
      <line x1="72" y1="48" x2="59" y2="44" opacity="0.4" />
      <line x1="59" y1="44" x2="53" y2="46" opacity="0.4" />
    </g>
    {/* North Star */}
    <polygon points="50,14 51.5,19.5 57,21 51.5,22.5 50,28 48.5,22.5 43,21 48.5,19.5" fill="currentColor" className="text-gold animate-pulse" />
  </svg>
);

export function HomePage() {
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    const stats = getStorageStats();
    setHistoryCount(stats.count);
  }, []);

  const methods = [
    {
      path: '/liuyao',
      title: '六爻占卜',
      titleEn: 'Liuyao Divination',
      description: '摇钱起卦以通神明之德，动静变化以决百虑之疑。',
      icon: <LiuyaoIcon />,
      borderGlow: 'hover:border-gold/40 hover:shadow-[0_0_20px_rgba(223,177,91,0.08)]'
    },
    {
      path: '/meihua',
      title: '梅花易数',
      titleEn: 'Meihua Yi Shu',
      description: '不执铜钱，观梅起数；万物皆有象，机缘在当下。',
      icon: <MeihuaIcon />,
      borderGlow: 'hover:border-terracotta/40 hover:shadow-[0_0_20px_rgba(232,85,62,0.08)]'
    },
    {
      path: '/ziwei',
      title: '紫微斗数',
      titleEn: 'Ziwei Astrology',
      description: '列曜定位以排命盘格局，天星推演以照平生之运。',
      icon: <ZiweiIcon />,
      borderGlow: 'hover:border-[#6B8AFD]/40 hover:shadow-[0_0_20px_rgba(107,138,253,0.08)]'
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col justify-center">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-20 relative">
          <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
            {/* Eyebrow badge */}
            <div className="inline-block px-5 py-1.5 rounded-full border border-gold/20 bg-gold-tint text-gold text-xs font-sans tracking-widest uppercase">
              ☯️ 传统易占 · 现代呈现 ☯️
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl font-calligraphy text-ink leading-tight tracking-widest py-2">
              问心之所向
              <br />
              <span className="text-gold font-calligraphy block mt-4 drop-shadow-[0_2px_15px_rgba(223,177,91,0.25)]">
                探未知之途
              </span>
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg text-muted font-sans font-light max-w-2xl mx-auto leading-relaxed tracking-wider">
              借古老易理之光，照亮当下人生的抉择。三种中华传统起卦方式，在此融为现代科技的灵性慰藉。
            </p>

            {/* Method Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
              {methods.map((method) => (
                <Link
                  key={method.path}
                  to={method.path}
                  className={`group bg-cream-light/45 backdrop-blur-md rounded-3xl border border-border ${method.borderGlow} p-8 flex flex-col items-center text-center space-y-6 transition-all duration-300 hover:-translate-y-1.5`}
                >
                  <div className="p-3 bg-cream/80 rounded-full border border-border/50 shadow-inner group-hover:scale-105 transition-transform duration-300">
                    {method.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-serif text-ink tracking-wide font-normal">
                      {method.title}
                    </h3>
                    <p className="text-[10px] text-gold font-sans font-light tracking-widest uppercase">
                      {method.titleEn}
                    </p>
                  </div>
                  <p className="text-sm text-muted font-sans font-light leading-relaxed h-12 flex items-center justify-center">
                    {method.description}
                  </p>
                  <div className="pt-2 text-gold text-sm font-sans font-light tracking-widest group-hover:text-terracotta group-hover:translate-x-1 transition-all duration-300">
                    探寻起卦 →
                  </div>
                </Link>
              ))}
            </div>

            {/* History Summary */}
            {historyCount > 0 && (
              <div className="pt-8">
                <Link
                  to="/history"
                  className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-border/80 bg-cream-light/50 backdrop-blur-sm text-muted hover:text-gold hover:border-gold/40 hover:bg-gold-tint transition-all duration-300 font-sans font-light text-sm"
                >
                  <span>📜</span>
                  <span>已有 {historyCount} 条占卜记录</span>
                  <span>→</span>
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

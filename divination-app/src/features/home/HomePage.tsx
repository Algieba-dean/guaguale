import { Link } from 'react-router-dom';
import { PageTransition } from '../../components/shared/PageTransition';
import { getStorageStats } from '../../utils/storage';
import { useEffect, useState } from 'react';

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
      titleEn: 'Liuyao',
      description: '通过摇卦问事，观察变爻，洞察事态发展',
      icon: '☰',
      color: 'border-terracotta'
    },
    {
      path: '/meihua',
      title: '梅花易数',
      titleEn: 'Meihua Yi Shu',
      description: '随机起卦，观物取象，把握当下时机',
      icon: '🌸',
      color: 'border-terracotta/60'
    },
    {
      path: '/ziwei',
      title: '紫微斗数',
      titleEn: 'Ziwei Dou Shu',
      description: '生辰排盘，星曜定位，了解命运格局',
      icon: '⭐',
      color: 'border-terracotta/40'
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-cream flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Eyebrow */}
            <div className="inline-block px-4 py-1.5 rounded-pill bg-terracotta-tint text-terracotta text-sm font-light">
              传统卜卦，现代呈现
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-serif text-ink leading-tight">
              问心之所向
              <br />
              <span className="text-terracotta italic">探未知之途</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted font-light max-w-2xl mx-auto leading-relaxed">
              借古老智慧之光，照亮当下抉择。三种传统卜卦方法，助你理清思路，找到答案。
            </p>

            {/* Method Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
              {methods.map((method) => (
                <Link
                  key={method.path}
                  to={method.path}
                  className={`group bg-cream-light rounded-3xl border-2 ${method.color} p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200`}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="text-5xl">{method.icon}</div>
                    <div>
                      <h3 className="text-xl font-serif text-ink mb-1">
                        {method.title}
                      </h3>
                      <p className="text-xs text-muted font-light tracking-wider">
                        {method.titleEn}
                      </p>
                    </div>
                    <p className="text-sm text-muted font-light leading-relaxed">
                      {method.description}
                    </p>
                    <div className="pt-2 text-terracotta text-sm font-light group-hover:translate-x-1 transition-transform">
                      开始占卜 →
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* History Summary */}
            {historyCount > 0 && (
              <div className="pt-8">
                <Link
                  to="/history"
                  className="inline-flex items-center gap-2 text-muted hover:text-terracotta transition-colors font-light text-sm"
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

import { Link, useLocation } from 'react-router-dom';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export function Header() {
  const { isInstallable, installApp } = usePWAInstall();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const links = [
    { path: '/liuyao', label: '六爻占卜' },
    { path: '/meihua', label: '梅花易数' },
    { path: '/ziwei', label: '紫微斗数' },
    { path: '/history', label: '历史印记' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-cream-light/80 backdrop-blur-md border-b border-border transition-all duration-300">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <svg className="w-5 h-5 text-gold group-hover:rotate-180 transition-transform duration-750" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="10" cy="10" r="9" />
              <path d="M10 1 A 4.5 4.5 0 0 0 10 10 A 4.5 4.5 0 0 1 10 19 A 9 9 0 0 1 10 1 Z" fill="currentColor" className="opacity-80" />
              <circle cx="10" cy="5.5" r="1.2" fill="currentColor" />
              <circle cx="10" cy="14.5" r="1.2" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
            <span className="text-xl font-serif tracking-widest text-ink group-hover:text-gold transition-colors font-medium">
              小卦摊
            </span>
          </Link>

          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-8">
              {links.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm tracking-widest font-sans font-light transition-all duration-300 ${
                      active
                        ? 'text-gold font-normal drop-shadow-[0_0_8px_rgba(223,177,91,0.25)]'
                        : 'text-muted hover:text-gold/80'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {isInstallable && (
              <button
                onClick={installApp}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gold/45 text-gold text-xs font-sans font-light hover:bg-gold hover:text-cream transition-all duration-300 shadow-sm shadow-gold/5 active:scale-95 cursor-pointer"
              >
                <span>📥</span>
                <span>安装应用</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

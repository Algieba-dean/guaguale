import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-cream-light/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-2xl font-serif text-ink">占卜</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/liuyao"
              className="text-muted hover:text-terracotta transition-colors font-light"
            >
              六爻
            </Link>
            <Link
              to="/meihua"
              className="text-muted hover:text-terracotta transition-colors font-light"
            >
              梅花易数
            </Link>
            <Link
              to="/ziwei"
              className="text-muted hover:text-terracotta transition-colors font-light"
            >
              紫微斗数
            </Link>
            <Link
              to="/history"
              className="text-muted hover:text-terracotta transition-colors font-light"
            >
              历史记录
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

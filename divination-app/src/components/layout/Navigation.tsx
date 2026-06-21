import { Link, useLocation } from 'react-router-dom';

export function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-cream-light border-t border-border z-50">
      <div className="flex items-center justify-around px-4 py-3">
        <Link
          to="/liuyao"
          className={`flex flex-col items-center gap-1 text-xs ${
            isActive('/liuyao') ? 'text-terracotta' : 'text-muted'
          }`}
        >
          <span className="text-lg">☰</span>
          <span>六爻</span>
        </Link>

        <Link
          to="/meihua"
          className={`flex flex-col items-center gap-1 text-xs ${
            isActive('/meihua') ? 'text-terracotta' : 'text-muted'
          }`}
        >
          <span className="text-lg">🌸</span>
          <span>梅花</span>
        </Link>

        <Link
          to="/ziwei"
          className={`flex flex-col items-center gap-1 text-xs ${
            isActive('/ziwei') ? 'text-terracotta' : 'text-muted'
          }`}
        >
          <span className="text-lg">⭐</span>
          <span>紫微</span>
        </Link>

        <Link
          to="/history"
          className={`flex flex-col items-center gap-1 text-xs ${
            isActive('/history') ? 'text-terracotta' : 'text-muted'
          }`}
        >
          <span className="text-lg">📜</span>
          <span>历史</span>
        </Link>
      </div>
    </nav>
  );
}

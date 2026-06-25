import { Link, useLocation } from 'react-router-dom';

export function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      path: '/liuyao',
      label: '六爻',
      icon: (
        <svg className="w-5.5 h-5.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.25">
          <circle cx="10" cy="10" r="9" />
          <path d="M10 1 A 4.5 4.5 0 0 0 10 10 A 4.5 4.5 0 0 1 10 19 A 9 9 0 0 1 10 1 Z" fill="currentColor" className="opacity-80" />
          <circle cx="10" cy="5.5" r="1.2" fill="currentColor" />
          <circle cx="10" cy="14.5" r="1.2" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      )
    },
    {
      path: '/meihua',
      label: '梅花',
      icon: (
        <svg className="w-5.5 h-5.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.25">
          <circle cx="10" cy="10" r="2.5" />
          <path d="M10 3 C8.5 3 7.5 5.5 10 7.5 C12.5 5.5 11.5 3 10 3 Z" />
          <path d="M10 3 C8.5 3 7.5 5.5 10 7.5 C12.5 5.5 11.5 3 10 3 Z" transform="rotate(72, 10, 10)" />
          <path d="M10 3 C8.5 3 7.5 5.5 10 7.5 C12.5 5.5 11.5 3 10 3 Z" transform="rotate(144, 10, 10)" />
          <path d="M10 3 C8.5 3 7.5 5.5 10 7.5 C12.5 5.5 11.5 3 10 3 Z" transform="rotate(216, 10, 10)" />
          <path d="M10 3 C8.5 3 7.5 5.5 10 7.5 C12.5 5.5 11.5 3 10 3 Z" transform="rotate(288, 10, 10)" />
        </svg>
      )
    },
    {
      path: '/ziwei',
      label: '紫微',
      icon: (
        <svg className="w-5.5 h-5.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="10,2 12,7 18,8 14,12 15,18 10,15 5,18 6,12 2,8 8,7" />
        </svg>
      )
    },
    {
      path: '/history',
      label: '历史',
      icon: (
        <svg className="w-5.5 h-5.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 3h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
          <line x1="7" y1="7" x2="13" y2="7" />
          <line x1="7" y1="11" x2="13" y2="11" />
          <line x1="7" y1="14" x2="11" y2="14" />
        </svg>
      )
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-cream-light/95 backdrop-blur-md border-t border-border z-50 transition-all duration-300">
      <div className="flex items-center justify-around px-4 py-2.5">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 text-[10px] font-sans font-light tracking-wide transition-all duration-300 ${
                active 
                  ? 'text-gold scale-105 drop-shadow-[0_0_8px_rgba(223,177,91,0.3)]' 
                  : 'text-muted hover:text-gold/70'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

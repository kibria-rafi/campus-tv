import { Link, useLocation } from 'react-router-dom';
import { Home, Newspaper, Info } from 'lucide-react';

export default function BottomNav({ lang }) {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: { bn: 'হোম', en: 'Home' },
    },
    {
      path: '/news',
      icon: Newspaper,
      label: { bn: 'সংবাদ', en: 'News' },
    },
    {
      path: '/about',
      icon: Info,
      label: { bn: 'আমাদের সম্পর্কে', en: 'About Us' },
    },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-brandBlack border-t-2 border-brandRed shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      <div className="grid grid-cols-3 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center gap-1
                transition-all duration-200
                ${
                  active
                    ? 'text-brandRed bg-brandRed/10'
                    : 'text-white hover:text-brandRed hover:bg-white/5'
                }
              `}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 2}
                className="transition-transform duration-200"
              />
              <span
                className="text-[10px] font-semibold tracking-tight"
                style={{ fontFamily: 'SolaimanLipi, sans-serif' }}
              >
                {item.label[lang]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

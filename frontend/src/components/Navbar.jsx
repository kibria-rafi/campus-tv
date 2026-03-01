import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { translations } from '../data';
import {
  Menu,
  X,
  Search,
  PlayCircle,
  Globe,
  Radio,
  Sun,
  Moon,
  MessageSquare,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ lang, setLang }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const desktopSearchRef = useRef(null);
  const navigate = useNavigate();
  const t = translations[lang];
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsDesktopSearchOpen(false);
        setIsMobileSearchOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      if (
        isDesktopSearchOpen &&
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(event.target)
      ) {
        setIsDesktopSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDesktopSearchOpen]);

  const handleSearchSubmit = (event, source) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setSearchQuery('');
    setIsDesktopSearchOpen(false);
    if (source === 'Mobile') {
      closeMobileMenu();
    }
  };

  const toggleMobileMenu = () => {
    const nextIsOpen = !isOpen;
    setIsOpen(nextIsOpen);

    if (!nextIsOpen) {
      setIsMobileSearchOpen(false);
    }
  };

  const closeMobileMenu = () => {
    setIsOpen(false);
    setIsMobileSearchOpen(false);
  };

  return (
    <nav className="bg-card border-b-4 border-brandRed sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 py-0 md:py-4">
          <Link
            to="/"
            className="flex items-center shrink-0 cursor-pointer"
          >
            <img
              src="/logo.png"
              alt="Campus TV Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>

          <div className="hidden lg:flex space-x-8 text-foreground text-lg">
            <Link
              to="/"
              className="hover:text-brandRed transition underline-offset-4 hover:underline"
            >
              {t.home}
            </Link>
            <Link
              to="/news"
              className="hover:text-brandRed transition underline-offset-4 hover:underline"
            >
              {t.news}
            </Link>
            <Link
              to="/about"
              className="hover:text-brandRed transition underline-offset-4 hover:underline"
            >
              {t.about}
            </Link>
            <Link
              to="/contact"
              className="hover:text-brandRed transition underline-offset-4 hover:underline"
            >
              {t.contact || 'Contact'}
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3 md:gap-6">
            <div
              ref={desktopSearchRef}
              className="relative hidden md:flex items-center"
            >
              <button
                type="button"
                onClick={() => setIsDesktopSearchOpen((prev) => !prev)}
                aria-label="Search"
                className="p-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition"
              >
                <Search size={18} />
              </button>

              {isDesktopSearchOpen && (
                <form
                  onSubmit={(event) => handleSearchSubmit(event, 'Desktop')}
                  className="absolute right-0 top-full mt-2 w-64 rounded-md border border-border bg-card p-2 shadow-lg"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search..."
                    aria-label="Search"
                    className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brandRed"
                    autoFocus
                  />
                </form>
              )}
            </div>

            <div className="flex items-center space-x-1 border border-border rounded px-2 py-1 bg-muted">
              <Globe
                size={16}
                className="text-muted-foreground"
              />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer text-foreground"
              >
                <option value="bn">বাংলা</option>
                <option value="en">EN</option>
              </select>
            </div>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link
              to="/video"
              aria-label="Video"
              className="flex items-center space-x-2 bg-primary text-primary-foreground px-3 py-2 rounded-md font-bold hover:opacity-90 transition shadow-lg"
            >
              <PlayCircle
                size={20}
                className="text-brandRed"
              />
              <span className="text-sm md:text-base">{t.video}</span>
            </Link>
            <Link
              to="/live"
              className="flex items-center gap-2 bg-brandRed text-white px-5 py-2 rounded font-black animate-pulse shadow-md text-sm uppercase"
            >
              <Radio size={16} />
              {t.live}
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-3">
            <Link
              to="/live"
              className="inline-flex items-center justify-center gap-2 h-10 px-3 rounded-md text-sm font-semibold bg-brandRed text-white animate-pulse shadow-md whitespace-nowrap"
            >
              <Radio size={16} />
              <span className="leading-none">{t.live}</span>
            </Link>

            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-muted transition"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-muted transition"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden bg-popover text-popover-foreground border-t border-border pb-6 shadow-xl">
            <div className="flex flex-col mt-4 px-4 text-foreground">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="py-4 border-b border-border hover:text-brandRed text-lg"
              >
                {t.home}
              </Link>
              <Link
                to="/news"
                onClick={closeMobileMenu}
                className="py-4 border-b border-border hover:text-brandRed text-lg"
              >
                {t.news}
              </Link>
              <Link
                to="/about"
                onClick={closeMobileMenu}
                className="py-4 border-b border-border hover:text-brandRed text-lg"
              >
                {t.about}
              </Link>
              <Link
                to="/contact"
                onClick={closeMobileMenu}
                className="py-4 border-b border-border hover:text-brandRed text-lg"
              >
                {t.contact || 'Contact'}
              </Link>

              <button
                type="button"
                onClick={() => setIsMobileSearchOpen((prev) => !prev)}
                aria-label="Search"
                className="flex items-center gap-2 py-4 border-b border-border hover:text-brandRed text-lg text-left"
              >
                <Search size={18} />
                <span>Search</span>
              </button>

              {isMobileSearchOpen && (
                <form
                  onSubmit={(event) => handleSearchSubmit(event, 'Mobile')}
                  className="pt-3 pb-4 border-b border-border"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search..."
                    aria-label="Search"
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brandRed"
                  />
                </form>
              )}

              <div className="relative flex items-center justify-between w-full py-4 border-b border-border text-lg">
                <div className="flex items-center gap-3">
                  <Globe
                    size={16}
                    className="text-muted-foreground"
                  />
                  <span className="select-none">
                    {lang === 'bn' ? 'বাংলা' : 'EN'}
                  </span>
                </div>
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 text-muted-foreground"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                {/* Overlay select to trigger language change without visible dropdown */}
                <select
                  value={lang}
                  onChange={(e) => {
                    setLang(e.target.value);
                    closeMobileMenu();
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                >
                  <option value="bn">বাংলা</option>
                  <option value="en">EN</option>
                </select>
              </div>
            </div>

            <div className="mt-6 px-4 space-y-3">
              <Link
                to="/video"
                aria-label="Video"
                onClick={closeMobileMenu}
                className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground py-3 rounded-md w-full"
              >
                <PlayCircle size={20} />
                <span>{t.video}</span>
              </Link>

              <Link
                to="/live"
                onClick={closeMobileMenu}
                className="flex items-center justify-center space-x-2 bg-brandRed text-white py-3 rounded-md w-full font-black animate-pulse"
              >
                <Radio size={20} />
                {t.live}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

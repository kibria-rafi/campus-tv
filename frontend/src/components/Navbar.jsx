import { useState } from 'react';
import { Link } from 'react-router-dom';
import { translations } from '../data';
import {
  Menu,
  X,
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
  const t = translations[lang];
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-card border-b-4 border-brandRed sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3 md:py-4">
          {/* ১. লোগো সেকশন */}
          <Link
            to="/"
            className="flex items-center cursor-pointer"
          >
            <img
              src="/logo.png"
              alt="Campus TV Logo"
              className="h-12 md:h-16 w-auto object-contain"
            />
          </Link>

          {/* ডেস্কটপ মেনু */}
          <div className="hidden lg:flex space-x-8 font-bold text-foreground text-lg italic">
            <Link
              to="/"
              className="hover:text-brandRed transition underline-offset-4 hover:underline"
            >
              {t.home || 'হোম'}
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

          <div className="flex items-center space-x-3 md:space-x-6">
            {/* ভাষা পরিবর্তন */}
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

            {/* থিম টোগল বাটন */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {/* ভিডিও বাটন */}
            <Link
              to="/video"
              aria-label="Video"
              className="hidden sm:flex items-center space-x-2 bg-primary text-primary-foreground px-3 py-2 rounded-md font-bold hover:opacity-90 transition shadow-lg"
            >
              <PlayCircle
                size={20}
                className="text-brandRed"
              />
              <span className="text-sm md:text-base">ভিডিও</span>
            </Link>
            {/* ৪. লাইভ বাটন (Link যোগ করা হয়েছে) */}
            <Link
              to="/live"
              className="hidden md:flex items-center gap-2 bg-brandRed text-white px-5 py-2 rounded font-black animate-pulse shadow-md text-sm uppercase"
            >
              <Radio size={16} />
              {t.live}
            </Link>

            {/* মোবাইল মেনু বাটন */}
            <button
              className="lg:hidden p-2 text-foreground hover:bg-muted rounded transition"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={30} /> : <Menu size={30} />}
            </button>
          </div>
        </div>

        {/* মোবাইল ড্রপডাউন মেনু */}
        {isOpen && (
          <div className="lg:hidden bg-popover text-popover-foreground border-t border-border pb-6 shadow-xl">
            <div className="flex flex-col space-y-4 mt-4 px-4 font-bold text-foreground">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="py-2 border-b border-border hover:text-brandRed"
              >
                হোম
              </Link>
              <Link
                to="/news"
                onClick={() => setIsOpen(false)}
                className="py-2 border-b border-border hover:text-brandRed"
              >
                {t.news}
              </Link>
              <Link
                to="/about"
                onClick={() => setIsOpen(false)}
                className="py-2 border-b border-border hover:text-brandRed"
              >
                {t.about}
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className="py-2 border-b border-border hover:text-brandRed"
              >
                {t.contact || 'Contact'}
              </Link>

              <div className="flex flex-col space-y-3 pt-2">
                {/* মোবাইল ভিডিও বাটন */}
                <Link
                  to="/video"
                  aria-label="Video"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center space-x-2 bg-primary text-primary-foreground py-3 rounded-md"
                >
                  <PlayCircle size={20} />
                  <span>ভিডিও</span>
                </Link>

                {/* মোবাইল কন্ট্যাক্ট বাটন */}
                <Link
                  to="/contact"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 bg-muted text-foreground border border-border py-3 rounded-md font-bold hover:border-brandRed hover:text-brandRed transition"
                >
                  <MessageSquare size={18} />
                  <span>{t.contact || 'Contact'}</span>
                </Link>

                {/* মোবাইল লাইভ বাটন */}
                <Link
                  to="/live"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 bg-brandRed text-white py-3 rounded-md font-black animate-pulse"
                >
                  <Radio size={20} />
                  {t.live}
                </Link>

                {/* মোবাইল থিম টোগল */}
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 border border-border bg-card text-foreground py-3 rounded-md transition"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

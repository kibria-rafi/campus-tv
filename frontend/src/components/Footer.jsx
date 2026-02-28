import { FaYoutube, FaFacebook } from 'react-icons/fa';
import { translations } from '../data';

export default function Footer({ lang = 'bn' }) {
  const t = translations[lang];
  const year = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-gray-300 border-t-4 border-brandRed py-10">
      <div className="container mx-auto px-4 flex flex-col items-center gap-4">
        {/* Logo with drop shadow */}
        <div className="inline-flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Campus TV Logo"
            className="h-14 md:h-16 w-auto object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)]"
          />
        </div>

        {/* Social icons */}
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-xs uppercase tracking-widest">
            {t.followUs}
          </span>
          <a
            href="https://www.youtube.com/@CampusTVofficial"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
          >
            <FaYoutube size={20} />
          </a>
          <a
            href="https://www.facebook.com/www.campustv.ac/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
          >
            <FaFacebook size={20} />
          </a>
        </div>

        {/* Copyright */}
        <p className="text-gray-500 text-xs tracking-wide text-center">
          © {year} ক্যাম্পাস টিভি | All Rights Reserved
        </p>
      </div>
    </footer>
  );
}

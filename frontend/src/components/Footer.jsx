import { FaYoutube, FaFacebook } from 'react-icons/fa';
import logo from '../assets/logo.png';
import { translations } from '../data';

export default function Footer({ lang = 'bn' }) {
  const t = translations[lang];

  return (
    <footer className="bg-[#1e1e1e] text-white border-t-4 border-brandRed">
      <div className="container mx-auto px-4 py-5 md:py-6">
        <div className="flex flex-col items-center gap-3">
          {/* Logo in light background pill */}
          <div className="bg-white rounded-md px-4 py-2 inline-flex items-center justify-center">
            <img
              src={logo}
              alt="Campus TV Logo"
              className="h-9 md:h-12 w-auto object-contain"
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
            © ২০২৬ ক্যাম্পাস টিভি | All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}

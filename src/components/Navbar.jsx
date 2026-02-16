import { useState } from 'react';
import { translations } from '../data';
import { Menu, X, PlayCircle, Globe } from 'lucide-react'; // আইকন ইমপোর্ট

export default function Navbar({ lang, setLang }) {
  const [isOpen, setIsOpen] = useState(false); // মোবাইল মেনু স্টেট
  const t = translations[lang];

  return (
    <nav className="bg-white border-b-4 border-brandRed sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3 md:py-4">
          
          {/* ১. লোগো সেকশন - আপনার দেওয়া PNG ব্যবহারের জন্য */}
          <div className="flex items-center cursor-pointer">
            <img 
              src="/logo.png" // আপনার লোগোটি public ফোল্ডারে logo.png নামে রাখুন
              alt="Campus TV Logo" 
              className="h-12 md:h-16 w-auto object-contain" 
            />
          </div>

          {/* ডেস্কটপ মেনু (বড় ডিভাইসের জন্য) */}
          <div className="hidden lg:flex space-x-8 font-bold text-gray-800 text-lg italic">
            <a href="#" className="hover:text-brandRed transition underline-offset-4 hover:underline">{t.politics}</a>
            <a href="#" className="hover:text-brandRed transition underline-offset-4 hover:underline">{t.admission}</a>
            <a href="#" className="hover:text-brandRed transition underline-offset-4 hover:underline">{t.career}</a>
          </div>

          <div className="flex items-center space-x-3 md:space-x-6">
            {/* ২. ভিডিও বাটন (আইকন সহ) */}
            <button className="hidden sm:flex items-center space-x-2 bg-black text-white px-3 py-2 rounded-md font-bold hover:bg-gray-800 transition shadow-lg">
              <PlayCircle size={20} className="text-brandRed" />
              <span className="text-sm md:text-base">ভিডিও</span>
            </button>

            {/* ভাষা পরিবর্তন */}
            <div className="flex items-center space-x-1 border border-gray-300 rounded px-2 py-1 bg-gray-50">
              <Globe size={16} className="text-gray-500" />
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer"
              >
                <option value="bn">বাংলা</option>
                <option value="en">EN</option>
              </select>
            </div>

            {/* লাইভ বাটন */}
            <button className="hidden md:block bg-brandRed text-white px-5 py-2 rounded font-black animate-pulse shadow-md text-sm uppercase">
              {t.live}
            </button>

            {/* ৩. মোবাইল মেনু বাটন (Hamburger Menu) */}
            <button 
              className="lg:hidden p-2 text-brandBlack hover:bg-gray-100 rounded transition"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={30} /> : <Menu size={30} />}
            </button>
          </div>
        </div>

        {/* মোবাইল ড্রপডাউন মেনু (ছোট ডিভাইসের জন্য) */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 pb-6 shadow-xl animate-in slide-in-from-top duration-300">
            <div className="flex flex-col space-y-4 mt-4 px-4 font-bold text-gray-800">
              <a href="#" className="py-2 border-b border-gray-50 hover:text-brandRed">{t.politics}</a>
              <a href="#" className="py-2 border-b border-gray-50 hover:text-brandRed">{t.admission}</a>
              <a href="#" className="py-2 border-b border-gray-50 hover:text-brandRed">{t.career}</a>
              <div className="flex flex-col space-y-3 pt-2">
                <button className="flex items-center justify-center space-x-2 bg-black text-white py-3 rounded-md">
                   <PlayCircle size={20} />
                   <span>ভিডিও গ্যালারি</span>
                </button>
                <button className="bg-brandRed text-white py-3 rounded-md font-black">
                   {t.live}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
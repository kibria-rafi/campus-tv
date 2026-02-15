import { translations } from '../data';

export default function Navbar({ lang, setLang }) {
  const t = translations[lang];

  return (
    <nav className="bg-white border-b-4 border-brandRed sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* লোগো সেকশন - সাইজ বাড়ানো হয়েছে */}
        <div className="flex items-center space-x-2 cursor-pointer">
          <div className="bg-brandRed text-white p-2 rounded-sm font-black text-3xl">C</div>
          <div className="flex flex-col leading-none">
            <span className="text-4xl font-black text-brandBlack tracking-tighter uppercase">Campus</span>
            <span className="text-xl font-bold text-brandRed tracking-widest uppercase">TV</span>
          </div>
        </div>

        {/* ক্যাটাগরি মেনু - রেড হোভার ইফেক্ট */}
        <div className="hidden lg:flex space-x-8 font-bold text-gray-800 text-lg">
          <a href="#" className="hover:text-brandRed transition">{t.politics}</a>
          <a href="#" className="hover:text-brandRed transition">{t.admission}</a>
          <a href="#" className="hover:text-brandRed transition">{t.career}</a>
        </div>

        <div className="flex items-center space-x-6">
          {/* ভাষা পরিবর্তনের ড্রপডাউন */}
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            className="border-2 border-gray-200 rounded-md px-2 py-1 text-sm font-bold bg-white focus:outline-none focus:border-brandRed"
          >
            <option value="bn">বাংলা</option>
            <option value="en">EN</option>
          </select>

          {/* লাইভ বাটন - ফিক্সড এবং হাইলাইটেড */}
          <button className="bg-brandRed text-white px-6 py-2 rounded-md font-black animate-pulse flex items-center space-x-2 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            <span>{t.live}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
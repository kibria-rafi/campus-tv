import { dummyNews } from '../data';

export default function Ticker({ lang }) {
  return (
    <div className="bg-brandRed text-white flex items-center overflow-hidden h-10 shadow-md">
      {/* বাম পাশের স্থির অংশ */}
      <div className="bg-black px-4 h-full flex items-center font-bold z-10 whitespace-nowrap">
        {lang === 'bn' ? 'সংবাদ শিরোনাম:' : 'Headlines:'}
      </div>
      
      {/* স্ক্রলিং অংশ - যেখানে ১ লাইনে সব খবর যাবে */}
      <div className="flex items-center w-full overflow-hidden relative">
        <div className="animate-scroll flex space-x-12">
          {dummyNews.map((news) => (
            <span key={news.id} className="text-sm md:text-base font-medium flex items-center">
              <span className="text-yellow-300 mx-2">●</span> 
              {news.title[lang]}
            </span>
          ))}
          {/* লুপের সৌন্দর্য বাড়াতে খবরগুলো ডাবল করা হয়েছে */}
          {dummyNews.map((news) => (
            <span key={`dup-${news.id}`} className="text-sm md:text-base font-medium flex items-center">
              <span className="text-yellow-300 mx-2">●</span> 
              {news.title[lang]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
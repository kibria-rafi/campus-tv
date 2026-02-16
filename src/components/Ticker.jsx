import { dummyNews } from "../data";

export default function Ticker({ lang }) {
  const label = lang === "bn" ? "সংবাদ শিরোনাম:" : "Headlines:";

  return (
    <div className="bg-brandRed text-white flex items-center overflow-hidden h-10 md:h-12 shadow-md relative w-full">
      {/* বাম পাশের স্থির লেবেল */}
      <div className="bg-black px-4 h-full flex items-center font-bold z-20 whitespace-nowrap border-r border-brandRed shadow-lg">
        <span className="text-sm md:text-base">{label}</span>
      </div>

      {/* স্ক্রলিং এরিয়া - এখানে আমরা লেখাগুলোকে এক লাইনে রাখছি */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div className="animate-scroll flex items-center space-x-12 whitespace-nowrap">
          {dummyNews.map((news) => (
            <div key={news.id} className="flex items-center">
              <span className="text-yellow-400 font-black mx-2">●</span>
              <span className="text-sm md:text-lg font-bold">
                {news.title[lang]}
              </span>
            </div>
          ))}
          {/* লুপ যাতে নিরবচ্ছিন্ন থাকে তাই আরও একবার ডাটা দেওয়া হলো */}
          {dummyNews.map((news) => (
            <div key={`dup-${news.id}`} className="flex items-center">
              <span className="text-yellow-400 font-black mx-2">●</span>
              // src/components/Ticker.jsx এর ভেতরে যেখানে টাইটেল আছে
              <span className="text-sm md:text-xl font-bold">
                {" "}
                {/* text-lg থেকে xl করা হয়েছে */}
                {news.title[lang]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

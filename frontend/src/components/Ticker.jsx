export default function Ticker({ lang, newsList }) {
  const label = lang === 'bn' ? 'সংবাদ শিরোনাম' : 'Headlines';

  return (
    <div className="bg-brandRed text-white flex items-center overflow-hidden h-10 shadow-lg w-full">
      <div className="bg-black px-4 h-full flex items-center font-bold z-20 whitespace-nowrap italic">
        {label}
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="animate-scroll flex space-x-12 items-center">
          {newsList.map((news) => (
            <span key={news._id} className="text-sm md:text-lg font-bold whitespace-nowrap">
              <span className="text-yellow-400 mx-2">●</span> {news.title[lang]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
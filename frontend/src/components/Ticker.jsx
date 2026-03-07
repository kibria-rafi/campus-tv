import { useEffect, useState } from 'react';
import { pickLang } from '../utils/lang';

function getMarqueeDuration() {
  const w = window.innerWidth;
  if (w < 640) return '12s';
  if (w < 1024) return '18s';
  return '30s';
}

export default function Ticker({ lang, newsList }) {
  const label = lang === 'bn' ? 'সংবাদ শিরোনাম' : 'Headlines';

  const [marqueeDuration, setMarqueeDuration] = useState(getMarqueeDuration);

  useEffect(() => {
    function handleResize() {
      setMarqueeDuration(getMarqueeDuration());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bg-brandRed text-white flex items-center overflow-hidden h-10 shadow-lg w-full">
      <div className="bg-black px-4 h-full flex items-center font-bold z-20 whitespace-nowrap italic">
        {label}
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div
          className="animate-scroll flex space-x-12 items-center"
          style={{ '--marquee-duration': marqueeDuration }}
        >
          {newsList.map((news) => (
            <span
              key={news._id}
              className="text-sm md:text-lg font-bold whitespace-nowrap"
            >
              <span className="text-yellow-400 mx-2">●</span>{' '}
              {pickLang(news.title, lang)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

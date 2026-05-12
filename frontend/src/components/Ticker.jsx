import { useEffect, useState, useMemo } from 'react';
import { pickLang } from '../utils/lang';
import { Link } from 'react-router-dom';

function getMarqueeDuration() {
  const w = window.innerWidth;
  if (w < 640) return '20s';
  if (w < 1024) return '30s';
  return '40s';
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

  const marqueeItems = useMemo(() => {
    if (!newsList || newsList.length === 0) return [];
    const latest = newsList.slice(0, 5);
    // Duplicate to allow seamless looping (0 to -50% translation)
    return [...latest, ...latest];
  }, [newsList]);

  if (marqueeItems.length === 0) return null;

  return (
    <div className="bg-brandRed text-white flex items-center overflow-hidden h-10 shadow-lg w-full">
      <div className="bg-black px-4 h-full flex items-center font-bold z-20 whitespace-nowrap italic shrink-0">
        {label}
      </div>
      <div className="flex-1 overflow-hidden relative flex items-center h-full">
        <div
          className="animate-scroll flex items-center gap-12 w-max px-12"
          style={{ '--marquee-duration': marqueeDuration }}
        >
          {marqueeItems.map((news, idx) => (
            <Link
              key={`${news._id}-${idx}`}
              to={`/news/${news._id}`}
              className="text-sm md:text-base font-bold whitespace-nowrap hover:underline flex items-center shrink-0"
            >
              <span className="text-yellow-400 mr-3 text-lg">●</span>
              {pickLang(news.title, lang)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Ticker from '../components/Ticker';
import LivePlayer from '../components/LivePlayer';
import { translations } from '../data';
import { API_BASE } from '../config/api';

export default function Home({ lang }) {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(11);
  const t = translations[lang];

  useEffect(() => {
    // ব্যাকএন্ড থেকে খবর নিয়ে আসা
    fetch(`${API_BASE}/api/news`)
      .then((res) => res.json())
      .then((data) => {
        // Filter out video posts (non-empty videoUrl that are not live)
        const articles = data.filter(
          (item) =>
            !item.videoUrl ||
            item.videoUrl.trim() === '' ||
            item.isLive === true
        );
        setNewsList(articles);
        setLoading(false);
      })
      .catch((err) => console.error('Error fetching news:', err));
  }, []);

  if (loading)
    return <div className="text-center py-20 font-bold">লোড হচ্ছে...</div>;

  return (
    <div className="space-y-6">
      {/* ── Live / Archive Player (pinned at top) ── */}
      <section className="w-full">
        <LivePlayer
          title="Live Stream"
          variant="compact"
        />
      </section>

      {/* টিচারে এখন আসল খবর স্ক্রল করবে */}
      <Ticker
        lang={lang}
        newsList={newsList}
      />

      {/* ── News Grid ── */}
      <section className="mt-4">
        <h3 className="text-2xl font-black border-l-8 border-brandRed pl-3 uppercase text-foreground italic mb-6">
          {t.latest}
        </h3>

        {newsList.length === 0 ? (
          <div className="text-center py-20 text-foreground opacity-60">
            এখনো কোনো খবর নেই।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:auto-rows-[260px]">
            {/* Featured card — first item */}
            <Link
              to={`/news/${newsList[0]._id}`}
              className="md:col-span-2 lg:col-span-2 group relative overflow-hidden rounded-sm shadow-xl block"
            >
              <img
                src={newsList[0].image}
                className="w-full h-60 md:h-72 lg:h-full object-cover transition group-hover:scale-105 duration-500"
                alt={newsList[0].title[lang]}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                {newsList[0].category && (
                  <span className="bg-brandRed px-3 py-1 text-xs font-bold uppercase mb-3 inline-block rounded-sm">
                    {newsList[0].category[lang]}
                  </span>
                )}
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold leading-tight underline decoration-brandRed decoration-4 underline-offset-8 mb-1">
                  {newsList[0].title[lang]}
                </h2>
                {newsList[0].body && (
                  <p className="text-sm text-gray-300 line-clamp-2 hidden md:block">
                    {typeof newsList[0].body === 'object'
                      ? newsList[0].body[lang]
                      : newsList[0].body}
                  </p>
                )}
              </div>
            </Link>

            {/* Normal cards — items 2–visibleCount */}
            {newsList.slice(1, visibleCount).map((news) => (
              <Link
                key={news._id}
                to={`/news/${news._id}`}
                className="group flex flex-col overflow-hidden rounded-sm shadow-md bg-card border border-border hover:shadow-lg transition-shadow duration-200"
              >
                <div className="overflow-hidden shrink-0">
                  <img
                    src={news.image}
                    className="w-full h-40 object-cover group-hover:brightness-90 group-hover:scale-105 transition duration-300"
                    alt={news.title[lang]}
                  />
                </div>
                <div className="p-3 flex flex-col flex-1">
                  {news.category && (
                    <span className="text-xs text-brandRed font-semibold uppercase mb-1">
                      {news.category[lang]}
                    </span>
                  )}
                  <h4 className="font-bold text-sm leading-snug line-clamp-2 text-foreground group-hover:text-brandRed transition-colors duration-200">
                    {news.title[lang]}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* See More Button */}
        {newsList.length > 11 && visibleCount < newsList.length && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setVisibleCount(newsList.length)}
              className="px-8 py-3 bg-brandRed text-white font-bold rounded-md hover:bg-red-700 transition-all duration-300 hover:shadow-lg transform hover:scale-105 uppercase text-sm"
            >
              {t.seeMore}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
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

  // Feature news: items that carry the "Features" tag, newest first, max 8
  const featureNews = useMemo(
    () =>
      [...newsList]
        .filter(
          (item) =>
            Array.isArray(item.categories) &&
            item.categories.includes('Features')
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8),
    [newsList]
  );

  useEffect(() => {
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
      {/* ── Hero: Live Player + Feature News ─────────────────────────── */}
      <section className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT – Live TV player (dominant) */}
          <div className="lg:col-span-8">
            <LivePlayer
              title="Live Stream"
              variant="hero"
            />
          </div>

          {/* RIGHT – Feature News panel */}
          <div className="lg:col-span-4 lg:self-stretch flex flex-col">
            <div className="bg-card border border-border rounded-xl shadow-lg flex flex-col h-full overflow-hidden">
              {/* Panel header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-muted border-b border-border shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 text-brandRed shrink-0"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <h2 className="font-black uppercase text-foreground text-sm tracking-wide">
                  Feature News
                </h2>
              </div>

              {/* Scrollable list */}
              {featureNews.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10 px-4">
                  No feature news available.
                </p>
              ) : (
                <ul className="overflow-y-auto flex-1 max-h-[520px] divide-y divide-border">
                  {featureNews.map((item) => (
                    <li key={item._id}>
                      <Link
                        to={`/news/${item._id}`}
                        className="flex gap-3 p-3 hover:bg-muted transition-colors duration-150 group"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title[lang]}
                            className="w-16 h-14 object-cover rounded-md shrink-0 group-hover:brightness-90 transition-all duration-200"
                          />
                        )}
                        <div className="min-w-0 flex flex-col justify-center">
                          <time className="text-xs text-muted-foreground mb-1 block">
                            {new Date(item.createdAt).toLocaleDateString(
                              lang === 'bn' ? 'bn-BD' : 'en-GB',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }
                            )}
                          </time>
                          <h4 className="text-sm font-semibold leading-snug line-clamp-2 text-foreground group-hover:text-brandRed transition-colors duration-200">
                            {item.title[lang]}
                          </h4>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      <Ticker
        lang={lang}
        newsList={newsList}
      />

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

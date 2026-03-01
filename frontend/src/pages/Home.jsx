import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Ticker from '../components/Ticker';
import LivePlayer from '../components/LivePlayer';
import VideoSidebar from '../components/VideoSidebar';
import { translations } from '../data';
import { API_BASE } from '../config/api';

const CATEGORIES = ['Features', 'Culture', 'Education', 'Amar Campus', 'Opinion'];

const CATEGORY_LABELS = {
  'Features': { bn: 'ফিচার', en: 'Features' },
  'Culture': { bn: 'সংস্কৃতি', en: 'Culture' },
  'Education': { bn: 'শিক্ষা', en: 'Education' },
  'Amar Campus': { bn: 'আমার ক্যাম্পাস', en: 'Amar Campus' },
  'Opinion': { bn: 'অপিনিয়ন', en: 'Opinion' },
};

export default function Home({ lang }) {
  const [newsList, setNewsList] = useState([]);
  const [allNews, setAllNews] = useState([]); // Store all news for filtering
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(11);
  const [selectedCategory, setSelectedCategory] = useState(null); // null = all categories
  const t = translations[lang];

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
        setAllNews(articles);
        setNewsList(articles);
        setLoading(false);
      })
      .catch((err) => console.error('Error fetching news:', err));
  }, []);

  const handleCategoryClick = (category) => {
    if (selectedCategory === category) {
      // Deselect if clicking the same category
      setSelectedCategory(null);
      setNewsList(allNews);
      setVisibleCount(11);
    } else {
      // Filter by selected category
      setSelectedCategory(category);
      const filtered = allNews.filter((item) =>
        (item.categories || []).includes(category)
      );
      setNewsList(filtered);
      setVisibleCount(11);
    }
  };

  if (loading)
    return <div className="text-center py-20 font-bold">লোড হচ্ছে...</div>;

  return (
    <div className="space-y-6">
      {/* ── Hero: Live Player + YouTube Videos ─────────────────────────── */}
      <section className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT – Live TV player (dominant) */}
          <div className="lg:col-span-8">
            <LivePlayer
              title="Live Stream"
              variant="hero"
            />
          </div>

          {/* RIGHT – YouTube Video Sidebar */}
          <div className="lg:col-span-4 lg:self-stretch flex flex-col">
            <VideoSidebar lang={lang} />
          </div>
        </div>
      </section>

      <Ticker
        lang={lang}
        newsList={allNews}
      />

      {/* Category Filter Buttons */}
      <section className="mt-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm font-bold text-foreground mr-2">
            {lang === 'bn' ? 'বিভাগ:' : 'Categories:'}
          </span>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setNewsList(allNews);
              setVisibleCount(11);
            }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              selectedCategory === null
                ? 'bg-brandRed text-white shadow-lg'
                : 'bg-card border border-border text-foreground hover:border-brandRed'
            }`}
          >
            {lang === 'bn' ? 'সব' : 'All'}
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                selectedCategory === category
                  ? 'bg-brandRed text-white shadow-lg'
                  : 'bg-card border border-border text-foreground hover:border-brandRed'
              }`}
            >
              {CATEGORY_LABELS[category][lang]}
            </button>
          ))}
        </div>
      </section>

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

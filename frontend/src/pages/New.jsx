import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Newspaper } from 'lucide-react';
import { API_BASE } from '../config/api';
import { translations } from '../data';

const CATEGORIES = ['Features', 'Culture', 'Education', 'Amar Campus', 'Opinion'];

const CATEGORY_LABELS = {
  'Features': { bn: 'ফিচার', en: 'Features' },
  'Culture': { bn: 'সংস্কৃতি', en: 'Culture' },
  'Education': { bn: 'শিক্ষা', en: 'Education' },
  'Amar Campus': { bn: 'আমার ক্যাম্পাস', en: 'Amar Campus' },
  'Opinion': { bn: 'অপিনিয়ন', en: 'Opinion' },
};

export default function New({ lang }) {
  const [newsList, setNewsList] = useState([]);
  const [allNews, setAllNews] = useState([]); // Store all news for filtering
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(9);
  const [selectedCategory, setSelectedCategory] = useState(null); // null = all categories
  const t = translations[lang];

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/news`);
      const data = await res.json();
      setAllNews(data);
      setNewsList(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching news:', err);
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    if (selectedCategory === category) {
      // Deselect if clicking the same category
      setSelectedCategory(null);
      setNewsList(allNews);
      setLimit(9);
    } else {
      // Filter by selected category
      setSelectedCategory(category);
      const filtered = allNews.filter((item) =>
        (item.categories || []).includes(category)
      );
      setNewsList(filtered);
      setLimit(9);
    }
  };

  const handleLoadMore = () => {
    setLimit(newsList.length);
  };

  const handleImageError = (e) => {
    e.target.src = '/logo.png';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const NewsCardSkeleton = () => (
    <div className="group flex flex-col overflow-hidden rounded-lg shadow-md bg-card border border-border animate-pulse">
      <div className="w-full h-48 bg-muted"></div>
      <div className="p-4 flex flex-col gap-2">
        <div className="h-4 bg-muted rounded w-1/4"></div>
        <div className="h-5 bg-muted rounded w-full"></div>
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-3 bg-muted rounded w-1/3 mt-2"></div>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <Newspaper
        size={80}
        className="text-muted-foreground mb-4 opacity-50"
      />
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {lang === 'bn' ? 'কোনো খবর পাওয়া যায়নি' : 'No News Found'}
      </h2>
      <p className="text-muted-foreground">
        {lang === 'bn'
          ? 'এই মুহূর্তে কোনো সংবাদ উপলব্ধ নেই।'
          : 'There are no news articles available at the moment.'}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="border-l-8 border-brandRed pl-4 py-2">
        <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase italic">
          {lang === 'bn' ? 'সকল সংবাদ' : 'All News'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === 'bn'
            ? `মোট ${newsList.length} টি সংবাদ পাওয়া গেছে`
            : `${newsList.length} news articles found`}
        </p>
      </div>

      {/* Category Filter Buttons */}
      <section className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-foreground mr-2">
            {lang === 'bn' ? 'বিভাগ:' : 'Categories:'}
          </span>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setNewsList(allNews);
              setLimit(9);
            }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              selectedCategory === null
                ? 'bg-brandRed text-white shadow-lg'
                : 'bg-card border border-border text-foreground hover:border-brandRed'
            }`}
          >
            {lang === 'bn' ? 'সব সংবাদ' : 'All News'}
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, index) => (
            <NewsCardSkeleton key={index} />
          ))}
        </div>
      ) : newsList.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsList.slice(0, limit).map((news) => (
              <Link
                key={news._id}
                to={`/news/${news._id}`}
                className="group flex flex-col overflow-hidden rounded-lg shadow-md bg-card border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="overflow-hidden shrink-0 relative">
                  <img
                    src={news.image || '/logo.png'}
                    className="w-full h-48 object-cover group-hover:brightness-90 group-hover:scale-110 transition duration-500"
                    alt={news.title[lang]}
                    onError={handleImageError}
                  />
                  {news.category && (
                    <span className="absolute top-3 left-3 bg-brandRed text-white px-3 py-1 text-xs font-bold uppercase rounded-full shadow-lg">
                      {news.category[lang]}
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-base leading-snug line-clamp-2 text-foreground group-hover:text-brandRed transition-colors duration-200 mb-2">
                    {news.title[lang]}
                  </h3>

                  {news.subtitle &&
                    news.subtitle[lang] &&
                    news.subtitle[lang].trim() !== '' && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 italic">
                        {news.subtitle[lang]}
                      </p>
                    )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-2 border-t border-border">
                    <Calendar
                      size={14}
                      className="text-brandRed"
                    />
                    <span>{formatDate(news.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {newsList.length > 9 && limit < newsList.length && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                className="px-8 py-3 bg-brandRed text-white font-bold rounded-md hover:bg-red-700 transition-all duration-300 hover:shadow-lg transform hover:scale-105 uppercase text-sm"
              >
                {t.seeMore}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

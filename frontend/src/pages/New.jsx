import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Newspaper } from 'lucide-react';

export default function New({ lang }) {
  const [newsList, setNewsList] = useState([]);
  const [displayedNews, setDisplayedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    // Update displayed news when page changes
    const endIndex = currentPage * itemsPerPage;
    setDisplayedNews(newsList.slice(0, endIndex));
  }, [currentPage, newsList]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5001/api/news');
      const data = await res.json();
      setNewsList(data);
      setDisplayedNews(data.slice(0, itemsPerPage));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching news:', err);
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setCurrentPage((prev) => prev + 1);
      setLoadingMore(false);
    }, 300);
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

  // Loading Skeleton Component
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

  // Empty State Component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <Newspaper size={80} className="text-muted-foreground mb-4 opacity-50" />
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
      {/* Page Header */}
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

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(12)].map((_, index) => (
            <NewsCardSkeleton key={index} />
          ))}
        </div>
      ) : newsList.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedNews.map((news) => (
              <Link
                key={news._id}
                to={`/news/${news._id}`}
                className="group flex flex-col overflow-hidden rounded-lg shadow-md bg-card border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="overflow-hidden shrink-0 relative">
                  <img
                    src={news.image || '/logo.png'}
                    className="w-full h-48 object-cover group-hover:brightness-90 group-hover:scale-110 transition duration-500"
                    alt={news.title[lang]}
                    onError={handleImageError}
                  />
                  {/* Category Badge */}
                  {news.category && (
                    <span className="absolute top-3 left-3 bg-brandRed text-white px-3 py-1 text-xs font-bold uppercase rounded-full shadow-lg">
                      {news.category[lang]}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  {/* Title */}
                  <h3 className="font-bold text-base leading-snug line-clamp-2 text-foreground group-hover:text-brandRed transition-colors duration-200 mb-2">
                    {news.title[lang]}
                  </h3>

                  {/* Subtitle (if available) */}
                  {news.subtitle &&
                    news.subtitle[lang] &&
                    news.subtitle[lang].trim() !== '' && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 italic">
                        {news.subtitle[lang]}
                      </p>
                    )}

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-2 border-t border-border">
                    <Calendar size={14} className="text-brandRed" />
                    <span>{formatDate(news.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More Button */}
          {displayedNews.length < newsList.length && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-3 bg-brandRed text-white font-bold rounded-full hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {lang === 'bn' ? 'আরও দেখুন' : 'Load More'}
                    </span>
                    <span className="text-sm opacity-75">
                      ({displayedNews.length} / {newsList.length})
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* All Loaded Message */}
          {displayedNews.length === newsList.length && newsList.length > itemsPerPage && (
            <div className="text-center text-muted-foreground text-sm py-4">
              {lang === 'bn'
                ? '✓ সকল সংবাদ দেখানো হয়েছে'
                : '✓ All news articles loaded'}
            </div>
          )}
        </>
      )}
    </div>
  );
}

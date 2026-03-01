import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Tag,
  ArrowLeft,
  Clock,
  PlayCircle,
  Plus,
  Minus,
  Facebook,
  Link as LinkIcon,
  Share2,
} from 'lucide-react';
import { API_BASE } from '../config/api';

const CATEGORY_LABELS = {
  'Features': { bn: 'ফিচার', en: 'Features' },
  'Culture': { bn: 'সংস্কৃতি', en: 'Culture' },
  'Education': { bn: 'শিক্ষা', en: 'Education' },
  'Amar Campus': { bn: 'আমার ক্যাম্পাস', en: 'Amar Campus' },
  'Opinion': { bn: 'অপিনিয়ন', en: 'Opinion' },
};

/** Reusable card used in both Related and Latest sidebar sections. */
function SidebarNewsCard({
  item,
  lang,
  getYouTubeThumbnail,
  handleImageError,
}) {
  const chips = [...new Set(item.categories || [])];
  return (
    <Link
      to={`/news/${item._id}`}
      className="flex gap-3 p-4 hover:bg-muted transition-colors duration-200 group"
    >
      <div className="shrink-0">
        <img
          src={item.image || getYouTubeThumbnail(item.videoUrl)}
          alt={item.title[lang]}
          className="w-20 h-20 object-cover rounded-lg group-hover:brightness-90 transition"
          onError={handleImageError}
        />
      </div>
      <div className="flex-1 min-w-0">
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {chips.slice(0, 3).map((c) => (
              <span
                key={c}
                className="text-[9px] bg-brandRed/10 text-brandRed border border-brandRed/30 px-1.5 py-0.5 rounded-full font-bold uppercase"
              >
                {CATEGORY_LABELS[c]?.[lang] || c}
              </span>
            ))}
          </div>
        )}
        <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-3 group-hover:text-brandRed transition-colors">
          {item.title[lang]}
        </h3>
      </div>
    </Link>
  );
}

export default function NewsDetails({ lang }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [sidebarData, setSidebarData] = useState({
    related: [],
    latest: [],
  });
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);

  useEffect(() => {
    const fetchSingleNews = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/news`);
        const allNews = await res.json();
        const selectedNews = allNews.find((item) => item._id === id);
        if (selectedNews) setNews(selectedNews);

        // Fetch sidebar data from dedicated endpoint
        try {
          const sidebarRes = await fetch(
            `${API_BASE}/api/news/sidebar/${id}?related=5&latest=6`
          );
          if (sidebarRes.ok) {
            const sidebarJson = await sidebarRes.json();
            setSidebarData({
              related: sidebarJson.related || [],
              latest: sidebarJson.latest || [],
            });
          } else {
            // Fallback: just load latest
            const latestRes = await fetch(`${API_BASE}/api/news?limit=6`);
            const latestData = await latestRes.json();
            setSidebarData({
              related: [],
              latest: latestData.filter((item) => item._id !== id).slice(0, 6),
            });
          }
        } catch {
          // Fallback if sidebar endpoint not yet deployed
          const latestRes = await fetch(`${API_BASE}/api/news?limit=7`);
          const latestData = await latestRes.json();
          setSidebarData({
            related: [],
            latest: latestData.filter((item) => item._id !== id).slice(0, 6),
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching details:', err);
        setLoading(false);
      }
    };

    fetchSingleNews();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen font-bold text-brandRed animate-pulse">
        লোড হচ্ছে...
      </div>
    );

  if (!news) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-muted-foreground mb-4 uppercase italic">
          {lang === 'bn'
            ? 'দুঃখিত, খবরটি পাওয়া যায়নি!'
            : 'Sorry, news not found!'}
        </h2>
        <button
          onClick={() => navigate('/')}
          className="bg-brandRed text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-black transition-all"
        >
          {lang === 'bn' ? 'হোমপেজে ফিরে যান' : 'Back to Home'}
        </button>
      </div>
    );
  }

  const formattedDate = new Date(news.createdAt).toLocaleDateString(
    lang === 'bn' ? 'bn-BD' : 'en-US',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );

  const formattedTime = new Date(news.createdAt).toLocaleTimeString(
    lang === 'bn' ? 'bn-BD' : 'en-US',
    {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }
  );

  const handleImageError = (e) => {
    e.target.src = '/logo.png';
  };

  const getYouTubeThumbnail = (videoUrl) => {
    if (videoUrl && videoUrl.trim()) {
      return `https://i.ytimg.com/vi/${videoUrl}/hqdefault.jpg`;
    }
    return '/logo.png';
  };

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 2, 32));
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 12));
  };

  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert(lang === 'bn' ? 'লিঙ্ক কপি হয়েছে!' : 'Link copied!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: news.title[lang],
          text:
            news.subtitle?.[lang] || news.description[lang].substring(0, 100),
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-6 mb-10 px-4">
      <div className="bg-muted p-2 border-b border-border rounded-t-xl mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-brandRed font-bold transition px-2 py-1"
        >
          <ArrowLeft size={18} /> {lang === 'bn' ? 'ফিরে যান' : 'Back'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card text-card-foreground shadow-2xl rounded-xl overflow-hidden border border-border">
            <div className="p-6 md:p-10">
              <div className="flex flex-wrap gap-6 mb-6 text-sm text-muted-foreground font-semibold border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <Calendar
                    size={16}
                    className="text-brandRed"
                  />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 border-l pl-6 border-border">
                  <Clock
                    size={16}
                    className="text-brandRed"
                  />
                  <span>{formattedTime}</span>
                </div>
                {news.videoUrl && (
                  <div className="flex items-center gap-2 border-l pl-6 border-border text-primary">
                    <PlayCircle size={16} />
                    <span className="uppercase text-[10px] font-black tracking-widest">
                      {news.isLive ? 'Live Stream' : 'Video Content'}
                    </span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-foreground mb-6 leading-tight">
                {news.title[lang]}
              </h1>

              {news.subtitle && news.subtitle[lang] && (
                <h2 className="text-xl md:text-2xl font-semibold text-muted-foreground mb-8 leading-relaxed italic">
                  {news.subtitle[lang]}
                </h2>
              )}

              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
                <span className="text-sm font-bold text-muted-foreground">
                  {lang === 'bn' ? 'শেয়ার করুন:' : 'Share:'}
                </span>
                <button
                  onClick={shareOnFacebook}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                  aria-label="Share on Facebook"
                >
                  <Facebook size={16} />
                  <span className="hidden sm:inline">Facebook</span>
                </button>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition font-semibold text-sm"
                  aria-label="Copy link"
                >
                  <LinkIcon size={16} />
                  <span className="hidden sm:inline">
                    {lang === 'bn' ? 'লিঙ্ক' : 'Link'}
                  </span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold text-sm"
                  aria-label="Share"
                >
                  <Share2 size={16} />
                  <span className="hidden sm:inline">
                    {lang === 'bn' ? 'শেয়ার' : 'Share'}
                  </span>
                </button>
              </div>

              <div className="mb-8">
                {news.videoUrl ? (
                  <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${news.videoUrl}?autoplay=0`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <>
                    <img
                      src={news.image}
                      alt={news.title[lang]}
                      className="w-full h-auto object-cover rounded-lg"
                      onError={handleImageError}
                    />
                    {news.imageCaption && (
                      <p className="text-sm text-muted-foreground italic mt-2 text-center">
                        {news.imageCaption}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <div>
                  {news.reporterName && (
                    <p className="text-sm font-bold text-foreground">
                      <span className="text-muted-foreground">
                        {lang === 'bn' ? 'প্রতিবেদক:' : 'Reporter:'}
                      </span>{' '}
                      {news.reporterName}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {lang === 'bn' ? 'ফন্ট সাইজ:' : 'Font Size:'}
                  </span>
                  <button
                    onClick={decreaseFontSize}
                    className="p-2 bg-muted hover:bg-muted-foreground/20 rounded-full transition"
                    aria-label="Decrease font size"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-sm font-bold w-8 text-center">
                    {fontSize}
                  </span>
                  <button
                    onClick={increaseFontSize}
                    className="p-2 bg-muted hover:bg-muted-foreground/20 rounded-full transition"
                    aria-label="Increase font size"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div
                className="text-foreground leading-loose whitespace-pre-line first-letter:text-5xl first-letter:font-bold first-letter:text-brandRed first-letter:mr-2"
                style={{ fontSize: `${fontSize}px` }}
              >
                {news.description[lang]}
              </div>

              {/* Category tags at bottom of article */}
              {(news.categories || []).length > 0 && (
                <div className="mt-8 pt-6 border-t border-border flex flex-wrap items-center gap-2">
                  <Tag
                    size={14}
                    className="text-muted-foreground shrink-0"
                  />
                  {news.categories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border hover:border-brandRed hover:text-brandRed transition-colors"
                    >
                      {CATEGORY_LABELS[cat]?.[lang] || cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="bg-card text-card-foreground shadow-xl rounded-xl overflow-hidden border border-border">
              {/* Related News section */}
              {sidebarData.related.length > 0 && (
                <div>
                  <div className="bg-brandRed text-white p-4">
                    <h2 className="text-xl font-black uppercase italic">
                      {lang === 'bn' ? 'সম্পর্কিত সংবাদ' : 'Related News'}
                    </h2>
                  </div>
                  <div className="divide-y divide-border max-h-[70vh] overflow-y-auto pr-2">
                    {sidebarData.related.map((item) => (
                      <SidebarNewsCard
                        key={item._id}
                        item={item}
                        lang={lang}
                        getYouTubeThumbnail={getYouTubeThumbnail}
                        handleImageError={handleImageError}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Latest News section */}
              <div>
                <div className="bg-brandRed text-white p-4">
                  <h2 className="text-xl font-black uppercase italic">
                    {lang === 'bn' ? 'সর্বশেষ সংবাদ' : 'Latest News'}
                  </h2>
                </div>
                <div className="divide-y divide-border max-h-[70vh] overflow-y-auto pr-2">
                  {sidebarData.latest.length > 0 ? (
                    sidebarData.latest.map((item) => (
                      <SidebarNewsCard
                        key={item._id}
                        item={item}
                        lang={lang}
                        getYouTubeThumbnail={getYouTubeThumbnail}
                        handleImageError={handleImageError}
                      />
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      {lang === 'bn' ? 'কোনো খবর নেই' : 'No news available'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

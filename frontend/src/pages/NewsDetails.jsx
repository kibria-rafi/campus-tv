import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Tag, ArrowLeft, Clock, PlayCircle, Plus, Minus, Facebook, Link as LinkIcon, Share2 } from 'lucide-react';

export default function NewsDetails({ lang }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);

  useEffect(() => {
    const fetchSingleNews = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/news`);
        const allNews = await res.json();
        const selectedNews = allNews.find(item => item._id === id);

        if (selectedNews) {
          setNews(selectedNews);
        }
        
        // Fetch latest 6 news from the new endpoint
        const latestRes = await fetch('http://localhost:5001/api/news?limit=6');
        const latestData = await latestRes.json();
        // Exclude the current news from latest
        const filtered = latestData.filter(item => item._id !== id);
        setLatestNews(filtered.slice(0, 6));
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching details:", err);
        setLoading(false);
      }
    };

    fetchSingleNews();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen font-bold text-brandRed animate-pulse">লোড হচ্ছে...</div>;

  if (!news) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-muted-foreground mb-4 uppercase italic">
          {lang === 'bn' ? 'দুঃখিত, খবরটি পাওয়া যায়নি!' : 'Sorry, news not found!'}
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

  const formattedDate = new Date(news.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const formattedTime = new Date(news.createdAt).toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });

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
    setFontSize(prev => Math.min(prev + 2, 32));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
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
          text: news.subtitle?.[lang] || news.description[lang].substring(0, 100),
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
      {/* Back Button */}
      <div className="bg-muted p-2 border-b border-border rounded-t-xl mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-brandRed font-bold transition px-2 py-1"
        >
          <ArrowLeft size={18} /> {lang === 'bn' ? 'ফিরে যান' : 'Back'}
        </button>
      </div>

      {/* Two-column grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content - Left Column (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="bg-card text-card-foreground shadow-2xl rounded-xl overflow-hidden border border-border">
            
            <div className="p-6 md:p-10">
              {/* 1. Category Badge */}
              <div className="mb-4">
                <span className="inline-flex items-center gap-1 bg-brandRed text-white px-4 py-2 rounded-full text-sm font-bold uppercase shadow-lg">
                  <Tag size={14} /> {news.category[lang]}
                </span>
              </div>

              {/* 2. Date and Time */}
              <div className="flex flex-wrap gap-6 mb-6 text-sm text-muted-foreground font-semibold border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-brandRed" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 border-l pl-6 border-border">
                  <Clock size={16} className="text-brandRed" />
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

              {/* 3. Title */}
              <h1 className="text-3xl md:text-5xl font-black text-foreground mb-6 leading-tight">
                {news.title[lang]}
              </h1>

              {/* 4. Subtitle */}
              {news.subtitle && news.subtitle[lang] && (
                <h2 className="text-xl md:text-2xl font-semibold text-muted-foreground mb-8 leading-relaxed italic">
                  {news.subtitle[lang]}
                </h2>
              )}

              {/* Social Share Buttons */}
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
                  <span className="hidden sm:inline">{lang === 'bn' ? 'লিঙ্ক' : 'Link'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold text-sm"
                  aria-label="Share"
                >
                  <Share2 size={16} />
                  <span className="hidden sm:inline">{lang === 'bn' ? 'শেয়ার' : 'Share'}</span>
                </button>
              </div>

              {/* 5. Main Image with Caption */}
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

              {/* 6. Reporter Name & Font Size Controls */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <div>
                  {news.reporterName && (
                    <p className="text-sm font-bold text-foreground">
                      <span className="text-muted-foreground">{lang === 'bn' ? 'প্রতিবেদক:' : 'Reporter:'}</span> {news.reporterName}
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
                  <span className="text-sm font-bold w-8 text-center">{fontSize}</span>
                  <button
                    onClick={increaseFontSize}
                    className="p-2 bg-muted hover:bg-muted-foreground/20 rounded-full transition"
                    aria-label="Increase font size"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* 7. Full Description */}
              <div 
                className="text-foreground leading-loose whitespace-pre-line first-letter:text-5xl first-letter:font-bold first-letter:text-brandRed first-letter:mr-2"
                style={{ fontSize: `${fontSize}px` }}
              >
                {news.description[lang]}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Right Column (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="bg-card text-card-foreground shadow-xl rounded-xl overflow-hidden border border-border">
              {/* Sidebar Header */}
              <div className="bg-brandRed text-white p-4">
                <h2 className="text-xl font-black uppercase italic">
                  {lang === 'bn' ? 'সর্বশেষ সংবাদ' : 'Latest News'}
                </h2>
              </div>

              {/* Latest News List */}
              <div className="divide-y divide-border">
                {latestNews.length > 0 ? (
                  latestNews.map((item) => (
                    <Link
                      key={item._id}
                      to={`/news/${item._id}`}
                      className="flex gap-3 p-4 hover:bg-muted transition-colors duration-200 group"
                    >
                      {/* Thumbnail */}
                      <div className="shrink-0">
                        <img
                          src={item.image || getYouTubeThumbnail(item.videoUrl)}
                          alt={item.title[lang]}
                          className="w-20 h-20 object-cover rounded-lg group-hover:brightness-90 transition"
                          onError={handleImageError}
                        />
                      </div>

                      {/* Title and Category */}
                      <div className="flex-1 min-w-0">
                        {item.category && (
                          <span className="text-xs text-brandRed font-semibold uppercase block mb-1">
                            {item.category[lang]}
                          </span>
                        )}
                        <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-3 group-hover:text-brandRed transition-colors">
                          {item.title[lang]}
                        </h3>
                      </div>
                    </Link>
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
  );
}
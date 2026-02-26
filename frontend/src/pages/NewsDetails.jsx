import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Tag, ArrowLeft, Clock, PlayCircle } from 'lucide-react';

export default function NewsDetails({ lang }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSingleNews = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/news`);
        const allNews = await res.json();
        const selectedNews = allNews.find(item => item._id === id);
        
        if (selectedNews) {
          setNews(selectedNews);
        }
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
        <h2 className="text-2xl font-bold text-gray-600 mb-4 text-brandBlack uppercase italic">
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

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden mt-6 mb-10 border border-gray-100">
      {/* Back Button */}
      <div className="bg-gray-50 p-2 border-b">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-600 hover:text-brandRed font-bold transition px-2 py-1"
        >
          <ArrowLeft size={18} /> {lang === 'bn' ? 'ফিরে যান' : 'Back'}
        </button>
      </div>

      {/* Media Section: Video or Image */}
      <div className="relative group">
        {news.videoUrl ? (
          <div className="aspect-video w-full bg-black">
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
          <img src={news.image} alt={news.title[lang]} className="w-full h-[300px] md:h-[500px] object-cover" />
        )}
        
        <div className="absolute top-4 left-4">
            <span className="flex items-center gap-1 bg-brandRed text-white px-4 py-1 rounded-full text-xs font-bold uppercase shadow-lg">
                <Tag size={12} /> {news.category[lang]}
            </span>
        </div>
      </div>
      
      <div className="p-6 md:p-10">
        {/* Date and Time */}
        <div className="flex flex-wrap gap-6 mb-8 text-sm text-gray-500 font-semibold border-b pb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-brandRed" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 border-l pl-6 border-gray-300">
            <Clock size={16} className="text-brandRed" />
            <span>{formattedTime}</span>
          </div>
          {news.videoUrl && (
            <div className="flex items-center gap-2 border-l pl-6 border-gray-300 text-blue-600">
              <PlayCircle size={16} />
              <span className="uppercase text-[10px] font-black tracking-widest">
                {news.isLive ? 'Live Stream' : 'Video Content'}
              </span>
            </div>
          )}
        </div>

        <h1 className="text-2xl md:text-4xl font-black text-brandBlack mb-8 leading-tight italic">
          {news.title[lang]}
        </h1>

        <div className="text-lg text-gray-700 leading-loose whitespace-pre-line first-letter:text-5xl first-letter:font-bold first-letter:text-brandRed first-letter:mr-2">
          {news.description[lang]}
        </div>
      </div>
    </div>
  );
}
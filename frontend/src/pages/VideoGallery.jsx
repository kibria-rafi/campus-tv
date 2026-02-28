import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Clock } from 'lucide-react';
import { API_BASE } from '../config/api';

export default function VideoGallery({ lang }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/news`);
        const data = await res.json();
        // ভিডিও ইউআরএল আছে এমন পোস্টগুলো ফিল্টার করা
        const onlyVideos = data.filter(
          (item) => item.videoUrl && item.videoUrl.trim() !== ''
        );
        setVideos(onlyVideos);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  // ইমেজ লোড হতে ব্যর্থ হলে ব্যাকআপ ইমেজ সেট করার ফাংশন
  const handleImageError = (e, videoId) => {
    e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center py-20 font-bold animate-pulse text-brandRed">
          {lang === 'bn' ? 'ভিডিও লোড হচ্ছে...' : 'Loading Videos...'}
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto my-10 px-4">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-10 border-l-8 border-brandRed pl-4">
        <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase italic">
          {lang === 'bn' ? 'ভিডিও গ্যালারি' : 'Video Gallery'}
        </h2>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-20 bg-muted rounded-2xl border-2 border-dashed border-border">
          <p className="text-muted-foreground font-bold italic">
            {lang === 'bn' ? 'কোনো ভিডিও পাওয়া যায়নি!' : 'No videos found!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((item) => (
            <Link
              to={`/news/${item._id}`}
              key={item._id}
              className="group bg-card text-card-foreground rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-border"
            >
              {/* Thumbnail Section */}
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img
                  src={
                    item.image ||
                    `https://img.youtube.com/vi/${item.videoUrl}/mqdefault.jpg`
                  }
                  alt={item.title[lang]}
                  onError={(e) => handleImageError(e, item.videoUrl)}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <PlayCircle
                    size={64}
                    className="text-white drop-shadow-2xl"
                  />
                </div>

                {/* Status Badge */}
                <div className="absolute bottom-3 right-3 bg-brandRed text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-md">
                  {item.isLive
                    ? lang === 'bn'
                      ? 'লাইভ'
                      : 'Live'
                    : lang === 'bn'
                      ? 'ভিডিও'
                      : 'Video'}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5">
                <div className="flex items-center gap-2 text-brandRed text-[10px] font-black mb-3 uppercase tracking-widest">
                  <span className="bg-brandRed/10 px-2 py-1 rounded">
                    {item.category?.[lang] ||
                      (lang === 'bn' ? 'ক্যাম্পাস' : 'Campus')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-card-foreground leading-[1.2] group-hover:text-brandRed transition-colors line-clamp-2 italic">
                  {item.title[lang]}
                </h3>

                <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-muted-foreground text-[11px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <Clock
                      size={14}
                      className="text-muted-foreground"
                    />
                    <span>
                      {new Date(item.createdAt).toLocaleDateString(
                        lang === 'bn' ? 'bn-BD' : 'en-US'
                      )}
                    </span>
                  </div>
                  <span className="text-brandRed font-black uppercase text-[9px] tracking-tighter group-hover:translate-x-1 transition-transform">
                    {lang === 'bn' ? 'দেখুন' : 'Watch Now'} →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { PlayCircle, X, AlertCircle } from 'lucide-react';
import { API_BASE } from '../config/api';

function VideoModal({ video, onClose }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!video) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-background rounded-2xl overflow-hidden shadow-2xl border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close player"
          className="absolute top-3 right-3 z-10 bg-card/80 hover:bg-card text-foreground rounded-full p-1.5 border border-border transition"
        >
          <X size={20} />
        </button>

        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="px-5 py-4">
          <p className="text-base font-bold text-foreground leading-snug line-clamp-2">
            {video.title}
          </p>
          {video.publishedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(video.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VideoSidebar({ lang }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/api/videos/youtube?limit=7`);
        
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Failed to load videos');
        }
        
        const data = await res.json();
        setVideos(data.items || []);
      } catch (err) {
        console.error('Error fetching YouTube videos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleVideoClick = (video) => {
    setActiveVideo(video);
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl shadow-lg flex flex-col h-full overflow-hidden">
        {/* Panel header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-muted border-b border-border shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 text-brandRed shrink-0"
          >
            <path d="M4.5 5.25v13.5c0 1.035.84 1.875 1.875 1.875h11.25c1.035 0 1.875-.84 1.875-1.875V5.25c0-1.035-.84-1.875-1.875-1.875H6.375c-1.035 0-1.875.84-1.875 1.875zM8.25 9.75A.75.75 0 019 9h6a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM9 12a.75.75 0 000 1.5h3a.75.75 0 000-1.5H9z" />
          </svg>
          <h2 className="font-black uppercase text-foreground text-sm tracking-wide">
            {lang === 'bn' ? 'সর্বশেষ ভিডিও' : 'Latest Videos'}
          </h2>
        </div>

        {/* Content area */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-10">
            <div className="text-center space-y-2">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brandRed"></div>
              <p className="text-sm text-muted-foreground">
                {lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center py-10 px-4">
            <div className="text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                {lang === 'bn'
                  ? 'ভিডিও লোড করা যায়নি'
                  : 'Unable to load videos'}
              </p>
            </div>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-10 px-4">
            <p className="text-sm text-muted-foreground text-center">
              {lang === 'bn' ? 'কোনো ভিডিও পাওয়া যায়নি' : 'No videos available'}
            </p>
          </div>
        ) : (
          <ul className="overflow-y-auto flex-1 max-h-[520px] divide-y divide-border">
            {videos.map((video) => (
              <li key={video.id}>
                <button
                  onClick={() => handleVideoClick(video)}
                  className="flex gap-3 p-3 hover:bg-muted transition-colors duration-150 group w-full text-left"
                >
                  <div className="relative w-20 h-14 shrink-0 rounded-md overflow-hidden bg-muted">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:brightness-90 transition-all duration-200"
                      onError={(e) => {
                        e.currentTarget.src = `https://i.ytimg.com/vi/${video.id}/default.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors duration-200">
                      <PlayCircle className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                  </div>

                  <div className="min-w-0 flex flex-col justify-center flex-1">
                    <h4 className="text-sm font-semibold leading-snug line-clamp-2 text-foreground group-hover:text-brandRed transition-colors duration-200">
                      {video.title}
                    </h4>
                    {video.publishedAt && (
                      <time className="text-xs text-muted-foreground mt-1 block">
                        {new Date(video.publishedAt).toLocaleDateString(
                          lang === 'bn' ? 'bn-BD' : 'en-GB',
                          {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }
                        )}
                      </time>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <VideoModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </>
  );
}

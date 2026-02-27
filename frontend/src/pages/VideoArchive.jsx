import { useState, useEffect, useCallback } from 'react';
import { PlayCircle, X, AlertCircle, RefreshCw, Film } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';
const STEP = 12;
const MAX = 50;

// ── Skeleton card ────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-3/4" />
        <div className="h-2 bg-muted rounded w-1/3 mt-1" />
      </div>
    </div>
  );
}

// ── Modal player ─────────────────────────────────────────────────────────
function VideoModal({ video, onClose }) {
  // Close on backdrop click or Escape key
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
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close player"
          className="absolute top-3 right-3 z-10 bg-card/80 hover:bg-card text-foreground rounded-full p-1.5 border border-border transition"
        >
          <X size={20} />
        </button>

        {/* YouTube iframe */}
        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Title + date */}
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

// ── Video card (grid) ────────────────────────────────────────────────────
function VideoCard({ video, onClick }) {
  return (
    <button
      onClick={() => onClick(video)}
      className="group text-left bg-card border border-border rounded-xl overflow-hidden hover:border-brandRed hover:shadow-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brandRed"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`;
          }}
        />
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <PlayCircle
            size={48}
            className="text-white drop-shadow-lg"
          />
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-brandRed transition-colors">
          {video.title}
        </p>
        {video.publishedAt && (
          <p className="text-[11px] text-muted-foreground mt-1.5">
            {new Date(video.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        )}
      </div>
    </button>
  );
}

// ── Featured card (hero) ─────────────────────────────────────────────────
function FeaturedCard({ video, onClick }) {
  return (
    <button
      onClick={() => onClick(video)}
      className="group w-full text-left bg-card border border-border rounded-2xl overflow-hidden hover:border-brandRed hover:shadow-2xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brandRed"
    >
      <div className="md:flex">
        {/* Thumbnail */}
        <div className="relative md:w-3/5 aspect-video overflow-hidden bg-muted">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <PlayCircle
              size={72}
              className="text-white drop-shadow-xl"
            />
          </div>
          {/* Featured badge */}
          <span className="absolute top-3 left-3 bg-brandRed text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide shadow">
            Featured
          </span>
        </div>

        {/* Meta */}
        <div className="md:w-2/5 p-5 flex flex-col justify-center gap-3">
          <p className="text-xs font-bold text-brandRed uppercase tracking-widest">
            Latest Upload
          </p>
          <h3 className="text-lg md:text-xl font-black text-foreground leading-snug group-hover:text-brandRed transition-colors line-clamp-3">
            {video.title}
          </h3>
          {video.publishedAt && (
            <p className="text-sm text-muted-foreground">
              {new Date(video.publishedAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
          <span className="inline-flex items-center gap-2 mt-2 bg-brandRed text-white px-4 py-2 rounded-lg font-bold text-sm w-max shadow group-hover:opacity-90 transition">
            <PlayCircle size={16} />
            Watch Now
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Main page ────────────────────────────────────────────────────────────
export default function VideoArchive({ lang }) {
  const [items, setItems] = useState([]);
  const [limit, setLimit] = useState(STEP);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  const fetchVideos = useCallback(async (currentLimit) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/videos/youtube?limit=${currentLimit}`
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos(limit);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    const next = Math.min(limit + STEP, MAX);
    setLimit(next);
    fetchVideos(next);
  };

  const featured = items[0] ?? null;
  const rest = items.slice(1);
  const canLoadMore = items.length === limit && limit < MAX;

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading && items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <div className="h-8 bg-muted rounded w-52 animate-pulse" />
          <div className="h-4 bg-muted rounded w-72 mt-2 animate-pulse" />
        </div>
        {/* Featured skeleton */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse mb-10">
          <div className="aspect-video md:aspect-16/6 bg-muted" />
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col items-center justify-center min-h-100 gap-5">
        <AlertCircle
          size={56}
          className="text-brandRed"
        />
        <h2 className="text-xl font-bold text-foreground">
          {lang === 'bn' ? 'ভিডিও লোড করতে ব্যর্থ' : 'Failed to load videos'}
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {error}
        </p>
        <button
          onClick={() => fetchVideos(limit)}
          className="flex items-center gap-2 bg-brandRed text-white px-5 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition"
        >
          <RefreshCw size={15} />
          {lang === 'bn' ? 'আবার চেষ্টা করুন' : 'Retry'}
        </button>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────
  if (!loading && items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col items-center justify-center min-h-100 gap-4">
        <Film
          size={56}
          className="text-muted-foreground"
        />
        <p className="text-lg font-bold text-muted-foreground">
          {lang === 'bn' ? 'কোনো ভিডিও পাওয়া যায়নি' : 'No videos found'}
        </p>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────
  return (
    <>
      {/* Modal */}
      {activeVideo && (
        <VideoModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8 border-l-8 border-brandRed pl-4">
          <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase italic">
            {lang === 'bn' ? 'ভিডিও আর্কাইভ' : 'Video Archive'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            {lang === 'bn'
              ? 'Campus TV Official-এর সর্বশেষ ভিডিওসমূহ'
              : 'Latest uploads from Campus TV Official'}
          </p>
        </div>

        {/* Featured video */}
        {featured && (
          <div className="mb-10">
            <FeaturedCard
              video={featured}
              onClick={setActiveVideo}
            />
          </div>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <>
            <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-4">
              {lang === 'bn' ? 'আরও ভিডিও' : 'More Videos'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {rest.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={setActiveVideo}
                />
              ))}
              {/* Show skeletons while loading more */}
              {loading &&
                Array.from({ length: STEP }).map((_, i) => (
                  <SkeletonCard key={`sk-${i}`} />
                ))}
            </div>
          </>
        )}

        {/* Load more */}
        {canLoadMore && !loading && (
          <div className="flex justify-center mt-10">
            <button
              onClick={handleLoadMore}
              className="bg-card border border-border text-foreground hover:border-brandRed hover:text-brandRed px-8 py-3 rounded-xl font-bold text-sm transition"
            >
              {lang === 'bn' ? 'আরও লোড করুন' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

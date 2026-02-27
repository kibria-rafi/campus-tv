import { useState, useEffect } from 'react';

/**
 * YouTubeArchivePlayer
 *
 * Fetches the latest video IDs from the backend and embeds them as an
 * autoplay YouTube playlist.
 */
export default function YouTubeArchivePlayer() {
  const [videoIds, setVideoIds] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'error' | 'ready'

  // Only updates state asynchronously (inside .then / .catch) so it is
  // safe to call from both useEffect on mount and from the Retry button.
  const fetchVideos = () => {
    fetch('http://localhost:5001/api/youtube/latest?limit=10')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data.videoIds?.length) throw new Error('Empty playlist');
        setVideoIds(data.videoIds);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // When the user clicks Retry, reset to loading first (this is an event
  // handler, so synchronous setState is fine here), then re-fetch.
  const handleRetry = () => {
    setStatus('loading');
    fetchVideos();
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center aspect-video bg-neutral-900 rounded-xl text-neutral-400 text-sm">
        Loading archive videos…
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 aspect-video bg-neutral-900 rounded-xl text-red-400 text-sm">
        <span>Could not load archive videos.</span>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const firstId = videoIds[0];
  const playlistParam = videoIds.slice(1).join(',');
  const embedUrl =
    `https://www.youtube.com/embed/${firstId}` +
    `?autoplay=1&mute=1&playsinline=1&rel=0` +
    (playlistParam ? `&playlist=${playlistParam}` : '');

  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden">
      <iframe
        src={embedUrl}
        title="Campus TV Archive"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        className="w-full h-full border-0"
      />
    </div>
  );
}

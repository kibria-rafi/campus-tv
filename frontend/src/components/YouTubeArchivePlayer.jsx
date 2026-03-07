import { useState, useEffect } from 'react';
import { apiPath } from '../config/api';
import Loader from './ui/Loader';

/**
 * YouTubeArchivePlayer
 *
 * Fetches the latest video IDs from the backend and embeds them as an
 * autoplay YouTube playlist.
 */
export default function YouTubeArchivePlayer() {
  const [videoIds, setVideoIds] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'error' | 'ready'
  const [errorMsg, setErrorMsg] = useState('');

  // Only updates state asynchronously (inside .then / .catch) so it is
  // safe to call from both useEffect on mount and from the Retry button.
  const fetchVideos = async () => {
    try {
      setErrorMsg('');

      const url = apiPath('/api/youtube/latest?limit=10');
      console.log('[YouTubeArchivePlayer] Fetching:', url);
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        mode: 'cors',
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(
          `Request failed (${res.status}). ${text ? `Response: ${text.slice(0, 200)}` : ''}`.trim()
        );
      }

      const data = await res.json();
      console.log('[YouTubeArchivePlayer] Response:', res.status, data);

      // Extract video IDs from the new API shape: { items: [{ videoId, ... }] }
      // Also tolerates legacy shapes for backward compatibility.
      let ids;
      if (
        Array.isArray(data?.items) &&
        data.items.length > 0 &&
        data.items[0]?.videoId !== undefined
      ) {
        ids = data.items.map((item) => item.videoId);
      } else if (Array.isArray(data)) {
        ids = data;
      } else {
        ids =
          data?.videoIds || data?.ids || data?.videos || data?.data?.videoIds;
      }

      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('Empty playlist (no video IDs returned).');
      }

      const normalized = ids.map(String).filter(Boolean);
      if (normalized.length === 0) {
        throw new Error('Playlist contained invalid video IDs.');
      }

      setVideoIds(normalized);
      setStatus('ready');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch.';
      console.error('YouTubeArchivePlayer fetch error:', err);
      setErrorMsg(msg);
      setStatus('error');
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleRetry = () => {
    setStatus('loading');
    fetchVideos();
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center aspect-video bg-muted rounded-xl p-4">
        <Loader
          size="md"
          className="text-brandRed"
        />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 aspect-video bg-muted rounded-xl text-destructive text-sm p-4 text-center">
        <span>Could not load archive videos.</span>
        {errorMsg ? (
          <span className="text-xs text-muted-foreground break-words max-w-full">
            {errorMsg}
          </span>
        ) : null}
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-secondary text-secondary-foreground hover:opacity-80 rounded-lg text-sm transition"
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

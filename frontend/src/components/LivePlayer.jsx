import { useState, useCallback } from 'react';
import VideoJsPlayer from './VideoJsPlayer';
import YouTubeArchivePlayer from './YouTubeArchivePlayer';

const HLS_SRC =
  'https://app.ncare.live/c3VydmVyX8RpbEU9Mi8xNy8yMDE0GIDU6RgzQ6NTAgdEoaeFzbF92YWxIZTO0U0ezN1IzMyfvcGVMZEJCTEFWeVN3PTOmdFsaWRtaW51aiPhnPTI2/greentv.stream/live-orgin/greentv.stream/chunks.m3u8';

/**
 * LivePlayer
 *
 * Orchestrates live HLS playback with automatic fallback to YouTube archive.
 *
 * Props:
 *   hlsSrc  {string}  – optional override for the HLS stream URL
 *   title   {string}  – display title (default "Live Stream")
 */
export default function LivePlayer({
  hlsSrc = HLS_SRC,
  title = 'Live Stream',
}) {
  // 'live' → show VideoJsPlayer
  // 'archive' → show YouTubeArchivePlayer
  const [mode, setMode] = useState('live');
  // Key forces full remount of VideoJsPlayer when retrying live
  const [liveKey, setLiveKey] = useState(0);
  const [fallbackReason, setFallbackReason] = useState('');

  const handleFallback = useCallback((reason) => {
    setFallbackReason(reason);
    setMode('archive');
  }, []);

  const handleTryLiveAgain = useCallback(() => {
    setFallbackReason('');
    setLiveKey((k) => k + 1);
    setMode('live');
  }, []);

  return (
    <div className="w-full bg-neutral-900 rounded-xl shadow-2xl overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-3 bg-neutral-800">
        {/* Pulsing live/archive dot */}
        <span className="relative flex h-3 w-3 shrink-0">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              mode === 'live' ? 'bg-red-500' : 'bg-yellow-500'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-3 w-3 ${
              mode === 'live' ? 'bg-red-600' : 'bg-yellow-500'
            }`}
          />
        </span>

        <h2 className="text-white font-bold text-lg tracking-wide uppercase">
          {title}
        </h2>

        {mode === 'archive' && (
          <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold border border-yellow-500/40">
            Archive Mode
          </span>
        )}

        {mode === 'archive' && (
          <button
            onClick={handleTryLiveAgain}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition"
          >
            {/* Reload icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5"
            >
              <path
                fillRule="evenodd"
                d="M15.312 5.293a1 1 0 0 1 0 1.414l-1.543 1.543A5 5 0 1 1 5 10a1 1 0 1 1 2 0 3 3 0 1 0 5.293-2.121L10.75 9.422a1 1 0 0 1-1.5-1.329l2.75-3.109a1 1 0 0 1 1.312-.69z"
                clipRule="evenodd"
              />
            </svg>
            Try Live Again
          </button>
        )}
      </div>

      {/* ── Player area ─────────────────────────────────────────────────── */}
      <div className="p-3">
        {mode === 'live' ? (
          <VideoJsPlayer
            key={liveKey}
            src={hlsSrc}
            title={title}
            onFallback={handleFallback}
          />
        ) : (
          <>
            {fallbackReason && (
              <p className="text-yellow-400/80 text-xs mb-2 px-1">
                Live stream unavailable ({fallbackReason}) — showing archive.
              </p>
            )}
            <YouTubeArchivePlayer />
          </>
        )}
      </div>
    </div>
  );
}

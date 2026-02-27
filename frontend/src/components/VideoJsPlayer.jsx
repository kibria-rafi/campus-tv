import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const FALLBACK_TIMEOUT_MS = 8000;

/**
 * VideoJsPlayer
 *
 * Props:
 *   src        {string}    – HLS m3u8 URL
 *   title      {string}    – Accessible label (default "Live Stream")
 *   onFallback {function}  – Called with "timeout" | "error" when playback fails
 */
export default function VideoJsPlayer({
  src,
  title = 'Live Stream',
  onFallback,
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const fallbackTimerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !src) return;

    // video.js requires an actual <video> element; we create it here so
    // React does not manage it (video.js owns its own DOM lifecycle).
    const videoEl = document.createElement('video');
    videoEl.className = 'video-js vjs-big-play-centered vjs-fluid';
    videoEl.setAttribute('aria-label', title);
    containerRef.current.appendChild(videoEl);

    const player = videojs(videoEl, {
      controls: true,
      muted: true,
      autoplay: true,
      fluid: true,
      responsive: true,
      preload: 'auto',
      sources: [{ src, type: 'application/x-mpegURL' }],
    });

    playerRef.current = player;

    // Start fallback timer – cancelled if "playing" fires first
    fallbackTimerRef.current = setTimeout(() => {
      onFallback?.('timeout');
    }, FALLBACK_TIMEOUT_MS);

    player.on('playing', () => {
      clearTimeout(fallbackTimerRef.current);
    });

    player.on('error', () => {
      clearTimeout(fallbackTimerRef.current);
      onFallback?.('error');
    });

    return () => {
      clearTimeout(fallbackTimerRef.current);
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return (
    <div
      ref={containerRef}
      className="w-full"
    />
  );
}

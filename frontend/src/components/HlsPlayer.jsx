import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

/**
 * Detect HLS support once at module level (no DOM churn per render).
 *   HLS_JS – hls.js can handle it (Chrome / Edge / Firefox)
 *   NATIVE  – browser natively plays HLS (Safari / iOS)
 */
const HLS_JS = Hls.isSupported();
const NATIVE =
  !HLS_JS &&
  typeof document !== 'undefined' &&
  !!document
    .createElement('video')
    .canPlayType('application/vnd.apple.mpegurl');

/**
 * HlsPlayer – a reusable HLS video player component.
 *
 * Props:
 *   src   {string}  – m3u8 stream URL
 *   title {string}  – optional display title (default "Live Stream")
 */
export default function HlsPlayer({ src, title = 'Live Stream' }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  // State is only ever updated inside async callbacks (never synchronously
  // in the effect body), which keeps React's render cycle clean.
  const [statusText, setStatusText] = useState('Connecting\u2026');
  const [errorText, setErrorText] = useState('');

  // ── hls.js path (Chrome / Edge / Firefox) ──────────────────────────────
  useEffect(() => {
    if (!HLS_JS || !src) return;
    const video = videoRef.current;
    if (!video) return;

    const hls = new Hls();
    hlsRef.current = hls;

    hls.loadSource(src);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      setErrorText('');
      setStatusText('Playing HLS stream');
      video.play().catch(() => {
        // Autoplay policy blocked – the user can press Play manually.
      });
    });

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setErrorText(`Network error \u2013 retrying\u2026 (${data.details})`);
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setErrorText(`Media error \u2013 recovering\u2026 (${data.details})`);
          hls.recoverMediaError();
        } else {
          setErrorText(`Fatal error: ${data.details}`);
          hls.destroy();
          hlsRef.current = null;
        }
      } else {
        setErrorText(`Warning: ${data.details}`);
      }
    });

    return () => {
      hls.destroy();
      hlsRef.current = null;
    };
  }, [src]);

  // ── Native HLS path (Safari / iOS) ─────────────────────────────────────
  useEffect(() => {
    if (!NATIVE || !src) return;
    const video = videoRef.current;
    if (!video) return;

    video.src = src;

    const onMeta = () => {
      setErrorText('');
      setStatusText('Playing HLS stream');
      video.play().catch(() => {});
    };
    const onErr = () => setErrorText('Video failed to load.');

    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('error', onErr);

    return () => {
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('error', onErr);
      video.src = '';
    };
  }, [src]);

  // ── Unsupported browser: render fallback without any video element ───────
  if (!HLS_JS && !NATIVE) {
    return (
      <div className="w-full bg-neutral-900 rounded-xl shadow-2xl overflow-hidden">
        <PlayerHeader
          title={title}
          statusText=""
          errorText=""
        />
        <div className="px-5 py-10 text-center text-neutral-400 text-sm">
          Your browser does not support HLS playback.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-neutral-900 rounded-xl shadow-2xl overflow-hidden">
      <PlayerHeader
        title={title}
        statusText={statusText}
        errorText={errorText}
      />

      {/* 16:9 video wrapper */}
      <div
        className="relative w-full"
        style={{ paddingBottom: '56.25%' }}
      >
        <video
          ref={videoRef}
          controls
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover bg-black"
          aria-label={title}
        />
      </div>

      {/* Error / status bar */}
      {errorText && (
        <div className="px-5 py-2 bg-red-900/80 text-red-200 text-sm font-medium">
          {errorText}
        </div>
      )}
    </div>
  );
}

// ── Extracted header avoids repeating the same JSX in two return paths ────
function PlayerHeader({ title, statusText, errorText }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 bg-neutral-800">
      {/* Pulsing live dot */}
      <span className="relative flex h-3 w-3 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
      </span>
      <h2 className="text-white font-bold text-lg tracking-wide uppercase">
        {title}
      </h2>
      {statusText && !errorText && (
        <span className="ml-auto text-xs text-green-400 font-medium">
          {statusText}
        </span>
      )}
    </div>
  );
}

/**
 * LiveViewerBadge
 *
 * Props:
 *   count  {number}  – current viewer count
 *   status {string}  – "connecting" | "connected" | "error"
 */
export default function LiveViewerBadge({ count, status }) {
  // ── Connecting state ──────────────────────────────────────────────────
  if (status === 'connecting') {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur text-neutral-500 text-xs font-medium">
        <span className="h-2 w-2 rounded-full bg-neutral-500 animate-pulse" />
        Connecting…
      </span>
    );
  }

  // ── Error / offline state ─────────────────────────────────────────────
  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur text-neutral-500 text-xs font-medium">
        <span className="h-2 w-2 rounded-full bg-neutral-600" />
        Offline
      </span>
    );
  }

  // ── Connected ─────────────────────────────────────────────────────────
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur text-xs font-medium">
      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
      <span className="font-semibold text-red-400 uppercase tracking-wide">
        Live
      </span>
      <span className="text-neutral-200">{count} watching</span>
    </span>
  );
}

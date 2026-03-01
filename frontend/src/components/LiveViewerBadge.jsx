/**
 * LiveViewerBadge
 *
 * Props:
 *   count  {number}  – current viewer count
 *   status {string}  – "connecting" | "connected" | "error"
 */
export default function LiveViewerBadge({ count, status }) {
  if (status === 'connecting') {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground text-xs font-medium">
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" />
        Connecting…
      </span>
    );
  }

  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground text-xs font-medium">
        <span className="h-2 w-2 rounded-full bg-muted-foreground" />
        Offline
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs font-medium">
      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
      <span className="font-semibold text-red-400 uppercase tracking-wide">
        Live
      </span>
      <span className="text-foreground">{count} watching</span>
    </span>
  );
}

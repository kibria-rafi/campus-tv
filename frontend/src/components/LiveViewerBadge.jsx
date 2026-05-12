/**
 * LiveViewerBadge
 *
 * Props:
 *   count  {number}  – current viewer count
 *   status {string}  – "connecting" | "connected" | "error"
 */
export default function LiveViewerBadge({ count, status, streamMode = 'live' }) {
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

  const label = streamMode === 'archive' ? 'Archive' : 'Live';
  const color = streamMode === 'archive' ? 'text-yellow-400' : 'text-red-400';
  const dotColor = streamMode === 'archive' ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs font-medium">
      <span className={`h-2 w-2 rounded-full ${dotColor} animate-pulse shrink-0`} />
      <span className={`font-semibold ${color} uppercase tracking-wide`}>
        {label}
      </span>
      <span className="text-foreground">{count} watching</span>
    </span>
  );
}

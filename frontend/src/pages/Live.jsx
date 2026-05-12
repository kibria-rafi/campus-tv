import { useState } from 'react';
import { Share2 } from 'lucide-react';
import LivePlayer from '../components/LivePlayer';
import LiveViewerBadge from '../components/LiveViewerBadge';
import { useLiveViewers } from '../hooks/useLiveViewers';

const LIVE_SHARE_URL = 'https://campustv.ac/live';

export default function Live() {
  const { count, status } = useLiveViewers();
  const [shareMsg, setShareMsg] = useState('');
  const [streamMode, setStreamMode] = useState('live');

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Campus TV Live',
          url: LIVE_SHARE_URL,
        });
      } else {
        await navigator.clipboard.writeText(LIVE_SHARE_URL);
      }
      setShareMsg('Link copied');
      setTimeout(() => setShareMsg(''), 2000);
    } catch {
      setShareMsg('');
    }
  };

  return (
    <section className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-4 py-12 flex flex-col gap-8 grow">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
              </span>
              <span className="text-red-500 text-xs font-bold uppercase tracking-widest">
                On Air
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LiveViewerBadge
                count={count}
                status={status}
                streamMode={streamMode}
              />
              <div className="relative">
                <button
                  type="button"
                  onClick={handleShare}
                  className="min-h-9 min-w-9 inline-flex items-center justify-center rounded-full border border-border bg-card text-foreground hover:border-brandRed hover:text-brandRed transition-colors"
                  aria-label="Share live page"
                  title="Share live page"
                >
                  <Share2 size={16} />
                </button>
                {shareMsg && (
                  <span className="absolute right-0 top-full mt-2 whitespace-nowrap rounded-md bg-green-600 px-2 py-1 text-[11px] font-bold text-white shadow-lg">
                    {shareMsg}
                  </span>
                )}
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Live Broadcast
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl">
            Watch Campus TV live — breaking news, campus updates, and more.
          </p>
        </div>

        <div className="grow">
          <LivePlayer
            title="Live Stream"
            variant="full"
            onModeChange={setStreamMode}
          />
        </div>

        <p className="text-center text-muted-foreground text-xs pb-4">
          Campus TV Live &mdash; Official Broadcast
        </p>
      </div>
    </section>
  );
}
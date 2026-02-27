import LivePlayer from '../components/LivePlayer';
import LiveViewerBadge from '../components/LiveViewerBadge';
import { useLiveViewers } from '../hooks/useLiveViewers';

export default function Live() {
  const { count, status } = useLiveViewers();

  return (
    <section className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-4 py-12 flex flex-col gap-8 grow">
        {/* Page header */}
        <div className="space-y-3">
          {/* Top row: On Air badge + viewer count */}
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
            <LiveViewerBadge
              count={count}
              status={status}
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Live Broadcast
          </h1>
          <p className="text-neutral-400 text-sm md:text-base max-w-xl">
            Watch Campus TV live — breaking news, campus updates, and more.
          </p>
        </div>

        {/* Player */}
        <div className="grow">
          <LivePlayer
            title="Live Stream"
            variant="full"
          />
        </div>

        {/* Footer note */}
        <p className="text-center text-neutral-600 text-xs pb-4">
          Campus TV Live &mdash; Official Broadcast
        </p>
      </div>
    </section>
  );
}

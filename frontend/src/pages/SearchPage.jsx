import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Newspaper, SearchX, RefreshCw, Calendar } from 'lucide-react';
import { API_BASE } from '../config/api';

// Wrap the matched portion in a <mark> element for inline highlighting.
function Highlight({ text, query }) {
  if (!query || !text) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 dark:bg-yellow-800 text-foreground rounded-sm px-0.5 not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// Skeleton card reused for both news and video loading states.
function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
      <div className="h-40 bg-muted" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-muted rounded w-1/4" />
        <div className="h-4 bg-muted rounded" />
        <div className="h-3 bg-muted rounded w-3/4" />
      </div>
    </div>
  );
}

export default function SearchPage({ lang }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/news/search?q=${encodeURIComponent(query.trim())}&limit=20`
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const details = body.details || `HTTP ${res.status}`;
        console.error('[SearchPage] Backend error:', details);
        throw new Error(details);
      }

      const data = await res.json();
      setResults(data.results ?? []);
    } catch (err) {
      console.error('[SearchPage] Fetch error:', err.message);
      setError(
        lang === 'bn'
          ? 'ফলাফল লোড করতে সমস্যা হয়েছে।'
          : 'Failed to load search results. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [query, lang]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(
      lang === 'bn' ? 'bn-BD' : 'en-US',
      { day: 'numeric', month: 'short', year: 'numeric' }
    );
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="border-l-8 border-brandRed pl-4 py-2">
        <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase italic">
          {lang === 'bn' ? 'অনুসন্ধান ফলাফল' : 'Search Results'}
        </h1>
        {query && !loading && !error && (
          <p className="text-sm text-muted-foreground mt-1">
            {lang === 'bn'
              ? `"${query}" এর জন্য ${results.length} টি ফলাফল পাওয়া গেছে`
              : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
          </p>
        )}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Error state with retry */}
      {!loading && error && (
        <div className="flex flex-col gap-3 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/30 px-5 py-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={runSearch}
            className="self-start inline-flex items-center gap-2 text-sm font-semibold text-brandRed hover:underline"
          >
            <RefreshCw size={14} />
            {lang === 'bn' ? 'আবার চেষ্টা করুন' : 'Try again'}
          </button>
        </div>
      )}

      {/* No query prompt */}
      {!loading && !error && !query && (
        <EmptyIllustration
          message={
            lang === 'bn'
              ? 'অনুসন্ধান করতে উপরের সার্চ বক্সে কিছু লিখুন।'
              : 'Enter a keyword in the search bar above to get started.'
          }
        />
      )}

      {/* No results */}
      {!loading && !error && query && results.length === 0 && (
        <EmptyIllustration
          message={
            lang === 'bn'
              ? `"${query}" এর সাথে মিলে এমন কোনো সংবাদ পাওয়া যায়নি।`
              : `No news matched "${query}". Try a different keyword.`
          }
        />
      )}

      {/* Results grid */}
      {!loading && results.length > 0 && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground border-b border-border pb-3">
            <Newspaper
              size={20}
              className="text-brandRed"
            />
            {lang === 'bn' ? 'সংবাদ' : 'News'}
            <span className="text-sm font-normal text-muted-foreground">
              ({results.length})
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((item) => {
              const title =
                item.title?.[lang] || item.title?.en || item.title?.bn || '';
              const snippet =
                item.snippet?.[lang] ||
                item.snippet?.en ||
                item.snippet?.bn ||
                '';
              const category = item.category?.[lang] || item.category?.en || '';

              return (
                <Link
                  key={String(item.id)}
                  to={`/news/${item.id}`}
                  className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card hover:border-brandRed hover:shadow-lg transition-all duration-200"
                >
                  {item.image && (
                    <div className="relative overflow-hidden shrink-0">
                      <img
                        src={item.image}
                        alt={title}
                        loading="lazy"
                        className="w-full h-40 object-cover group-hover:brightness-90 transition duration-300"
                        onError={(e) => {
                          e.currentTarget.src = '/logo.png';
                        }}
                      />
                      {category && (
                        <span className="absolute top-2 left-2 bg-brandRed text-white text-xs font-bold uppercase px-2 py-0.5 rounded-full">
                          {category}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-4 flex flex-col gap-2 flex-1">
                    {!item.image && (
                      <span className="inline-flex items-center gap-1 self-start text-xs font-bold uppercase text-white bg-brandRed px-2 py-0.5 rounded-full">
                        <Newspaper size={11} />
                        {lang === 'bn' ? 'সংবাদ' : 'News'}
                      </span>
                    )}

                    <p className="font-bold text-sm leading-snug text-foreground group-hover:text-brandRed transition-colors line-clamp-2">
                      <Highlight
                        text={title}
                        query={query}
                      />
                    </p>

                    {snippet && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        <Highlight
                          text={snippet}
                          query={query}
                        />
                      </p>
                    )}

                    {item.createdAt && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto pt-2 border-t border-border">
                        <Calendar
                          size={12}
                          className="text-brandRed"
                        />
                        {formatDate(item.createdAt)}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Shared sub-component ─────────────────────────────────────────────────
function EmptyIllustration({ message }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-4">
      <SearchX
        size={72}
        className="text-muted-foreground opacity-40"
      />
      <p className="text-muted-foreground max-w-sm text-sm">{message}</p>
    </div>
  );
}

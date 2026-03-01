import { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';

// Module-level cache: shared across all hook instances so every LivePlayer
// on the page (Home compact + Live full) uses the same single network request.
let _cache = null; // { primaryM3u8, backupM3u8 } once resolved
let _promise = null; // in-flight fetch promise

function fetchSettings() {
  if (_promise) return _promise;
  _promise = fetch(`${API_BASE}/api/stream-settings`)
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (data && data.primaryM3u8) {
        _cache = {
          primaryM3u8: data.primaryM3u8 || '',
          backupM3u8: data.backupM3u8 || null,
        };
      }
      return _cache;
    })
    .catch(() => {
      // Don't cache failures so a retry can occur on next page navigation
      _promise = null;
      return null;
    });
  return _promise;
}

/**
 * useStreamSettings
 *
 * Returns admin-configured stream URLs, shared & cached across components.
 * Falls back gracefully to null so LivePlayer can use its built-in default.
 *
 * @returns {{ settings: { primaryM3u8: string, backupM3u8: string|null } | null, loading: boolean }}
 */
export function useStreamSettings() {
  const [settings, setSettings] = useState(_cache); // immediately returns cache if already fetched
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) {
      // Already resolved — nothing to do
      return;
    }
    let cancelled = false;
    fetchSettings().then((data) => {
      if (!cancelled) {
        setSettings(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, loading };
}

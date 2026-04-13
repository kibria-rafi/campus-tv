import { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';

// Module-level cache: shared across all hook instances so every LivePlayer
// on the page (Home compact + Live full) uses the same single network request.
let _cache = null; // { primaryM3u8, backupM3u8 } once resolved
let _promise = null; // in-flight fetch promise

function normalizeSettings(data) {
  return {
    primaryM3u8:
      typeof data?.primaryM3u8 === 'string' ? data.primaryM3u8.trim() : '',
    backupM3u8:
      typeof data?.backupM3u8 === 'string' && data.backupM3u8.trim()
        ? data.backupM3u8.trim()
        : null,
  };
}

function fetchSettings() {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  _promise = fetch(`${API_BASE}/api/stream-settings`, {
    signal: controller.signal,
  })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      _cache = normalizeSettings(data);
      return _cache;
    })
    .catch(() => {
      // Normalize failures so UI can gracefully fall back without blank states.
      _cache = normalizeSettings(null);
      return _cache;
    })
    .finally(() => {
      clearTimeout(timeoutId);
      _promise = null;
    });

  return _promise;
}

/**
 * useStreamSettings
 *
 * Returns admin-configured stream URLs, shared & cached across components.
 * Falls back gracefully to empty settings so LivePlayer can enter archive mode when no stream URLs are configured.
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

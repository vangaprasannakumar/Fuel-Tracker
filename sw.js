// ─── FUEL TRACKER — SERVICE WORKER v20260527 ─────────────────────────────────
// BUG-07 FIX: App version is extracted ONCE at install time and stored in
//             self.__APP_VERSION. Previous version fetched index.html on
//             every single network request — this eliminates that waste.
// BUG-08 FIX: Offline fallback Response is now returned explicitly so the
//             browser never receives undefined from the fetch handler.

const CACHE_PREFIX    = 'fuel-tracker';
const FALLBACK_VER    = '20260527';
const OFFLINE_PAGE    = './index.html';

// Assets cached at install time — shell + CDN resources so charts and
// fonts render correctly on first offline load (previous version only
// cached ./, ./index.html, ./manifest.json — charts failed offline).
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  // ApexCharts — pre-cached so the dashboard works fully offline
  'https://cdn.jsdelivr.net/npm/apexcharts',
  // Outfit + Syne from Google Fonts (CSS + WOFF2 files cached on first fetch via stale-while-revalidate)
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap',
];

// ─── INSTALL ──────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      // Extract version from index.html meta tag ONCE and store it in-scope.
      // All subsequent handlers read self.__APP_VERSION directly — zero extra fetches.
      self.__APP_VERSION = await readVersionFromMeta() || FALLBACK_VER;
      const cacheName   = `${CACHE_PREFIX}-${self.__APP_VERSION}`;

      console.log(`[SW] Installing cache: ${cacheName}`);
      const cache = await caches.open(cacheName);

      // addAll is all-or-nothing. We catch CDN failures gracefully so a network
      // hiccup during install doesn't block the entire SW from activating.
      await Promise.allSettled(
        SHELL_ASSETS.map(url =>
          cache.add(url).catch(err =>
            console.warn(`[SW] Pre-cache skipped (${url}):`, err.message)
          )
        )
      );

      self.skipWaiting(); // Activate immediately — no waiting for old tab to close
    })()
  );
});

// ─── ACTIVATE ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const activeCacheName = `${CACHE_PREFIX}-${self.__APP_VERSION || FALLBACK_VER}`;
      const allCaches       = await caches.keys();

      // Evict all stale caches that belong to this prefix but aren't current
      await Promise.all(
        allCaches.map(key => {
          if (key.startsWith(CACHE_PREFIX) && key !== activeCacheName) {
            console.log(`[SW] Evicting stale cache: ${key}`);
            return caches.delete(key);
          }
        })
      );

      await self.clients.claim(); // Take control of all open tabs immediately
    })()
  );
});

// ─── FETCH ────────────────────────────────────────────────────────────────────
// Strategy: Cache-first for shell assets, network-first for API calls.
// BUG-08 FIX: Every code path now returns a valid Response object.
self.addEventListener('fetch', event => {
  const { request } = event;

  // Only intercept GET requests
  if (request.method !== 'GET') return;

  // Pass Google Apps Script API calls straight through — never cache them
  if (request.url.includes('script.google.com')) return;

  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const cacheName = `${CACHE_PREFIX}-${self.__APP_VERSION || FALLBACK_VER}`;

  try {
    // Try the cache first
    const cached = await caches.match(request);

    // Kick off a network fetch in parallel to keep cache fresh
    const networkFetch = fetch(request).then(async networkResponse => {
      if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }).catch(() => null); // Network failure — return null, handled below

    // Return cached version immediately if available; otherwise await network
    if (cached) return cached;

    const networkResponse = await networkFetch;
    if (networkResponse) return networkResponse;

    // BUG-08 FIX: Explicit offline fallback — return the cached shell page
    // instead of undefined, which previously caused an unhandled rejection.
    const offlineFallback = await caches.match(OFFLINE_PAGE);
    if (offlineFallback) return offlineFallback;

    // Last resort — return a proper 503 response so the browser doesn't crash
    return new Response(
      '<html><body style="font-family:sans-serif;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:16px"><h2>⛽ Fuel Tracker</h2><p style="color:#888">You are offline and the app shell is not cached yet.</p><p style="color:#888">Please connect to the internet and reload once.</p></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    );

  } catch (err) {
    console.error('[SW] Fetch handler error:', err);
    // BUG-08 FIX: Always return a Response, never undefined
    return new Response('Service Worker error.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// ─── VERSION EXTRACTION (runs ONCE at install, not on every request) ──────────
// BUG-07 FIX: Previously called on every fetch event. Now called only once
// during the install lifecycle and the result stored in self.__APP_VERSION.
async function readVersionFromMeta() {
  try {
    const response = await fetch('./index.html', {
      cache: 'no-store',
      headers: { Accept: 'text/html' }
    });
    if (!response.ok) return null;

    const html  = await response.text();
    const match =
      html.match(/<meta[^>]+name=["']app-version["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']app-version["']/i);

    if (match && match[1] && /^\d{8}$/.test(match[1].trim())) {
      console.log(`[SW] Detected app-version: ${match[1].trim()}`);
      return match[1].trim();
    }
  } catch (err) {
    console.warn('[SW] Version extraction failed:', err.message);
  }
  return null;
}

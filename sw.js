const CACHE_PREFIX = 'fuel-tracker-matrix';
const CACHE_DATE_FALLBACK = '20260520';

const IMMUTABLE_SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Asynchronously extract current deploy date properties from index.html metadata tags
async function readAppVersionFromHTML() {
  try {
    const response = await fetch('./index.html', {
      cache: 'no-store',
      headers: { 'Accept': 'text/html' }
    });
    if (!response.ok) return null;

    const text = await response.text();
    const match = text.match(/<meta[^>]+name=["']app-version["'][^>]+content=["']([^"']+)["']/i)
                || text.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']app-version["']/i);

    if (match && match[1] && /^\d{8}$/.test(match[1].trim())) {
      return match[1].trim();
    }
  } catch (err) {
    console.warn('[SW] App-version tag extraction fault bypassed:', err.message);
  }
  return null; 
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const detectedDate = await readAppVersionFromHTML();
      const resolvedCacheName = `${CACHE_PREFIX}-${detectedDate || CACHE_DATE_FALLBACK}`;
      
      const cache = await caches.open(resolvedCacheName);
      await cache.addAll(IMMUTABLE_SHELL_ASSETS);
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const detectedDate = await readAppVersionFromHTML();
      const activeCacheName = `${CACHE_PREFIX}-${detectedDate || CACHE_DATE_FALLBACK}`;
      const cacheKeys = await caches.keys();
      
      await Promise.all(
        cacheKeys.map(key => {
          if (key.startsWith(CACHE_PREFIX) && key !== activeCacheName) {
            console.log(`[SW] Evicting outdated core application shell: ${key}`);
            return caches.delete(key);
          }
        })
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          readAppVersionFromHTML().then(date => {
            const cacheName = `${CACHE_PREFIX}-${date || CACHE_DATE_FALLBACK}`;
            caches.open(cacheName).then(cache => cache.put(event.request, responseToCache));
          });
        }
        return networkResponse;
      }).catch(() => { /* Network dropout fallback */ });
      return cachedResponse || fetchPromise;
    })
  );
});

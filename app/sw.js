// Service worker (gap #4) — caches the app shell for offline use.
// Strategy: cache-first for the shell/assets, network-first for /api (so data is
// fresh online, and the last response is available offline). Full offline works
// best against a production build (hashed, cacheable assets).

const CACHE = 'rihla-v3'
// Relative to this worker's own location, which is the app directory. Absolute
// '/' cached the company website's homepage instead of the app shell, so an
// offline launch showed the marketing site.
const SHELL = ['./', './index.html']

// Map tiles get their own cache so the count cap below never evicts the shell.
// We cache only tiles the user actually viewed (OSM's tile policy forbids bulk
// prefetching an area), which still makes a browsed itinerary map work offline.
const TILE_CACHE = 'rihla-tiles-v1'
const TILE_HOST = /(^|\.)tile\.openstreetmap\.org$/
const TILE_MAX = 300 // ≈ a few MB; enough for a city at 3–4 zoom levels

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE && k !== TILE_CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  )
})

// Drop oldest entries once over the cap. Cache API keys() preserves insertion
// order, so the front of the list is the oldest tile.
async function trimTiles() {
  const c = await caches.open(TILE_CACHE)
  const keys = await c.keys()
  if (keys.length <= TILE_MAX) return
  await Promise.all(keys.slice(0, keys.length - TILE_MAX).map((k) => c.delete(k)))
}

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  // Map tiles: cache-first (a tile never changes meaningfully within a trip),
  // populate on miss, capped LRU-ish. Opaque no-cors responses are fine to cache.
  if (TILE_HOST.test(url.hostname)) {
    e.respondWith(
      caches.open(TILE_CACHE).then((c) =>
        c.match(req).then(
          (hit) =>
            hit ||
            fetch(req).then((resp) => {
              c.put(req, resp.clone()).then(trimTiles)
              return resp
            }),
        ),
      ),
    )
    return
  }

  // API: network-first, fall back to cache when offline. Checked by pathname,
  // not origin — in production the API lives on api.rihlatc.com.
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(req)
        .then((resp) => {
          const copy = resp.clone()
          caches.open(CACHE).then((c) => c.put(req, copy))
          return resp
        })
        .catch(() => caches.match(req)),
    )
    return
  }

  // Other cross-origin requests (fonts, unpkg CSS): default browser handling.
  if (url.origin !== self.location.origin) return

  // Shell/assets: cache-first, populate on miss, fall back to the shell.
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req)
          .then((resp) => {
            const copy = resp.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
            return resp
          })
          .catch(() => caches.match('./index.html')),
    ),
  )
})

// Service worker (gap #4) — caches the app shell for offline use.
// Strategy: cache-first for the shell/assets, network-first for /api (so data is
// fresh online, and the last response is available offline). Full offline works
// best against a production build (hashed, cacheable assets).

const CACHE = 'rihla-v2'
// Relative to this worker's own location, which is the app directory. Absolute
// '/' cached the company website's homepage instead of the app shell, so an
// offline launch showed the marketing site.
const SHELL = ['./', './index.html']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  // API: network-first, fall back to cache when offline.
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
          .catch(() => caches.match('/index.html')),
    ),
  )
})

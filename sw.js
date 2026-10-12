// Offline support. Site files are cache-first: VERSION is bumped on every
// deploy, which creates a fresh cache and deletes the old one, so cached files
// can never be stale. Repeat visits load instantly from cache.
const VERSION = 'msf-final-v1';

const CORE = ['./', 'style.css', 'app.js', 'icons.js', 'finder-ui.js', 'view3d.js',
  'worker.js', 'finder.js', 'cubiomes.mjs', 'cubiomes.wasm',
  'cubiomes-bedrock.mjs', 'cubiomes-bedrock.wasm',
  'three.module.min.js', 'OrbitControls.js', 'palette.js', 'tools.js',
  'inter-latin.woff2', 'jetbrains-mono-500-latin.woff2', 'waypoints-io.js', 'commands.js',
  'seed.js', 'saved.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin === location.origin) e.respondWith(cacheFirst(e.request));
});

async function cacheFirst(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req, { ignoreSearch: true });
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return Response.error();
  }
}

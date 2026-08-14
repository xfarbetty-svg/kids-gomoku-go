const CACHE = 'kids-games-v3';
const FILES = [
  './',
  './index.html',
  './gomoku.html',
  './go.html',
  './jump.html',
  './dressup.html',
  './color.html',
  './manifest.json',
  './common.css',
  './common.js',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // 頁面（導覽）一律先抓網路，確保手機能看到最新版；離線才用快取
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request).then((r) => r || caches.match('./')))
    );
    return;
  }
  // 其他檔案用快取優先
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});

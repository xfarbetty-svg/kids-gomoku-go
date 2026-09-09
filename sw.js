const CACHE = 'kids-games-v34';
const FILES = [
  './',
  './index.html',
  './learn.html',
  './toeic.html',
  './data/toeic.json',
  './rhythm.html',
  './memory.html',
  './puzzle.html',
  './gomoku.html',
  './sticky-gomoku-new.html',
  './manifest.json',
  './common.css',
  './common.js',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './audio/warashibe/s01.mp3',
  './audio/warashibe/s02.mp3',
  './audio/warashibe/s03.mp3',
  './audio/warashibe/s04.mp3',
  './audio/warashibe/s05.mp3',
  './audio/warashibe/s06.mp3',
  './audio/warashibe/s07.mp3',
  './audio/warashibe/s08.mp3',
  './audio/warashibe/s09.mp3',
  './audio/warashibe/s10.mp3',
  './audio/warashibe/s11.mp3',
  './audio/warashibe/s12.mp3',
  './audio/warashibe/s13.mp3',
  './audio/warashibe/s14.mp3',
  './audio/warashibe/s15.mp3',
  './audio/warashibe/s16.mp3',
  './audio/warashibe/s17.mp3',
  './audio/warashibe/s18.mp3',
  './audio/warashibe/s19.mp3',
  './audio/warashibe/s20.mp3',
  './audio/warashibe/s21.mp3',
  './audio/warashibe/s22.mp3',
  './audio/warashibe/s23.mp3',
  './audio/warashibe/s24.mp3',
  './audio/warashibe/s25.mp3',
  './audio/warashibe/s26.mp3',
  './audio/warashibe/s27.mp3',
  './audio/warashibe/s28.mp3',
  './audio/warashibe/s29.mp3',
  './audio/warashibe/s30.mp3',
  './audio/warashibe/s31.mp3',
  './audio/warashibe/s32.mp3',
  './audio/warashibe/s33.mp3',
  './audio/warashibe/s34.mp3',
  './audio/warashibe/s35.mp3',
  './audio/warashibe/s36.mp3',
  './audio/warashibe/s37.mp3',
  './audio/warashibe/s38.mp3',
  './audio/warashibe/s39.mp3',
  './audio/warashibe/s40.mp3',
  './audio/warashibe/s41.mp3',
  './audio/warashibe/s42.mp3',
  './audio/warashibe/s43.mp3',
  './audio/warashibe/s44.mp3',
  './audio/warashibe/s45.mp3',
  './audio/warashibe/s46.mp3',
  './audio/warashibe/s47.mp3',
  './audio/warashibe/s48.mp3',
  './audio/warashibe/s49.mp3',
  './audio/warashibe/s50.mp3',
  './audio/warashibe/s51.mp3'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(async (c) => {
      for (const f of FILES) {
        try { await c.add(f); } catch (err) { console.warn('[SW] skip cache add:', f, err); }
      }
    }).then(() => self.skipWaiting())
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
  // 一律「上線優先」：有網路就抓最新，離線才用快取 → 手機永遠拿到新版
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./')))
  );
});

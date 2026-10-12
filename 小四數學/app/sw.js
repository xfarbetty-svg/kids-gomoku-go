var CACHE = "g3math-v4-20261011";
var SHELL = [
  "./",
  "index.html",
  "rpg_adventure.html",
  "css/style.css",
  "js/app.js",
  "js/vertical_math_explainer.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "worksheets.json",
  "questions.json",
  "rpg_world_map.json"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(SHELL);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.origin !== location.origin) return;

  // 頁面圖片 & 資料：快取優先，先看快取，沒有才抓並存入
  if (/\.(webp|png|jpe?g)$/.test(url.pathname) || /worksheets\.json$/.test(url.pathname)) {
    e.respondWith(
      caches.match(e.request).then(function (hit) {
        if (hit) return hit;
        return fetch(e.request).then(function (res) {
          if (res.ok) {
            var clone = res.clone();
            caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
          }
          return res;
        });
      })
    );
    return;
  }

  // 其餘（含首頁導覽）：網路優先，失敗回退快取（離線用）
  e.respondWith(
    fetch(e.request).then(function (res) {
      var clone = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
      return res;
    }).catch(function () {
      return caches.match(e.request).then(function (hit) {
        if (hit) return hit;
        if (e.request.mode === "navigate") return caches.match("index.html");
        return Response.error();
      });
    })
  );
});

(function () {
  "use strict";

  var DB = "worksheets.json";
  var QB = "questions.json";
  var data = [];
  var qdata = {};
  var cats = [];
  var currentCat = "全部";
  var favs = JSON.parse(localStorage.getItem("g3favs") || "[]");
  var viewPos = JSON.parse(localStorage.getItem("g3viewpos") || "{}");
  var qPos = JSON.parse(localStorage.getItem("g3qpos") || "{}");
  var cur = null;      // current worksheet item
  var pageIdx = 0;
  var zoomed = false;
  var qcur = null;     // current question list
  var qIdx = 0;
  var qZoomed = false;

  var $ = function (id) { return document.getElementById(id); };

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function renderChips() {
    var box = $("catChips");
    box.innerHTML = "";
    var all = ["全部", "最愛"].concat(cats);
    all.forEach(function (c) {
      var b = el("button", "chip" + (c === currentCat ? " active" : ""), c);
      b.dataset.cat = c;
      b.addEventListener("click", function () { currentCat = c; renderChips(); renderList(); });
      box.appendChild(b);
    });
  }

  function matches(item, kw) {
    var t = (item.title + " " + item.cat + " " + item.sub).toLowerCase();
    return t.indexOf(kw.toLowerCase()) !== -1;
  }

  function renderList() {
    var list = $("list");
    list.innerHTML = "";
    var kw = $("search").value.trim();
    var shown = data.filter(function (it) {
      if (currentCat === "最愛") { if (favs.indexOf(it.title) === -1) return false; }
      else if (currentCat !== "全部") { if (it.cat !== currentCat) return false; }
      if (kw && !matches(it, kw)) return false;
      return true;
    });

    $("stats").textContent = "共 " + shown.length + " 份練習卷";
    $("empty").classList.toggle("hidden", shown.length > 0);

    shown.forEach(function (it) {
      var card = el("div", "ws-card");
      var thumb = el("img", "ws-thumb");
      thumb.loading = "lazy";
      thumb.src = it.pages[0];
      thumb.alt = it.title;
      var info = el("div", "ws-info");
      var title = el("div", "ws-title", it.title);
      var meta = el("div", "ws-meta");
      var badge = el("span", "ws-badge", it.cat + (it.sub ? " · " + it.sub : ""));
      meta.appendChild(badge);
      meta.appendChild(document.createTextNode(it.pages.length + " 頁"));
      info.appendChild(title);
      info.appendChild(meta);

      var star = el("button", "ws-star" + (favs.indexOf(it.title) !== -1 ? " on" : ""), "★");
      star.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleFav(it.title);
        star.classList.toggle("on");
      });

      var qkey = it.cat + "/" + (it.sub ? it.sub + "/" : "") + it.title;
      if (qdata[qkey] && qdata[qkey].length) {
        var play = el("button", "ws-play", "▶ 闖關");
        play.addEventListener("click", function (e) {
          e.stopPropagation();
          openQviewer(qkey);
        });
        card.appendChild(play);
      }

      card.appendChild(thumb);
      card.appendChild(info);
      card.appendChild(star);
      card.addEventListener("click", function () { openViewer(it); });
      list.appendChild(card);
    });
  }

  function toggleFav(title) {
    var i = favs.indexOf(title);
    if (i === -1) favs.push(title); else favs.splice(i, 1);
    localStorage.setItem("g3favs", JSON.stringify(favs));
    if (currentCat === "最愛") renderList();
  }

  /* ---------------- Viewer ---------------- */
  function openViewer(it) {
    cur = it;
    pageIdx = viewPos[it.title] || 0;
    if (pageIdx >= it.pages.length) pageIdx = 0;
    zoomed = false;
    $("viewer").classList.remove("hidden");
    $("vTitle").textContent = it.title;
    $("vPdf").href = it.pdf;
    $("vBody").classList.remove("zoomed");
    showPage();
  }

  function showPage() {
    var img = $("vImg");
    img.src = cur.pages[pageIdx];
    $("vPage").textContent = (pageIdx + 1) + " / " + cur.pages.length;
    $("vPrev").disabled = pageIdx === 0;
    $("vNext").disabled = pageIdx === cur.pages.length - 1;
    viewPos[cur.title] = pageIdx;
    localStorage.setItem("g3viewpos", JSON.stringify(viewPos));
    var body = $("vBody");
    if (zoomed) body.scrollTop = 0;
  }

  function next() { if (pageIdx < cur.pages.length - 1) { pageIdx++; showPage(); } }
  function prev() { if (pageIdx > 0) { pageIdx--; showPage(); } }

  function toggleZoom() {
    zoomed = !zoomed;
    var body = $("vBody");
    body.classList.toggle("zoomed", zoomed);
    $("vZoom").textContent = zoomed ? "縮小" : "放大";
    if (zoomed) body.scrollTop = 0;
  }

  function savePage() {
    var src = cur.pages[pageIdx];
    fetch(src).then(function (r) { return r.blob(); }).then(function (blob) {
      var file = new File([blob], (cur.title + "_p" + (pageIdx + 1) + ".webp"), { type: "image/webp" });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: cur.title }).catch(function () {});
      } else {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = file.name;
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
      }
    }).catch(function () { alert("存圖失敗"); });
  }

  /* swipe to change page */
  var sx = 0, sy = 0, tracking = false;
  var body = $("vBody");
  body.addEventListener("touchstart", function (e) {
    if (zoomed) return;
    var t = e.touches[0];
    sx = t.clientX; sy = t.clientY; tracking = true;
  }, { passive: true });
  body.addEventListener("touchend", function (e) {
    if (!tracking || zoomed) return;
    tracking = false;
    var t = e.changedTouches[0];
    var dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next(); else prev();
    }
  }, { passive: true });

  /* double tap to zoom */
  var lastTap = 0;
  body.addEventListener("click", function (e) {
    if (cur === null) return;
    var now = Date.now();
    if (now - lastTap < 300) { toggleZoom(); lastTap = 0; }
    else lastTap = now;
  });

  $("vClose").addEventListener("click", function () { cur = null; $("viewer").classList.add("hidden"); });
  $("vPrev").addEventListener("click", prev);
  $("vNext").addEventListener("click", next);
  $("vZoom").addEventListener("click", toggleZoom);
  $("vSave").addEventListener("click", savePage);

  /* ---------------- 闖關模式 ---------------- */
  function openQviewer(key) {
    qcur = qdata[key];
    if (!qcur || !qcur.length) return;
    qIdx = qPos[key] || 0;
    if (qIdx >= qcur.length) qIdx = 0;
    qZoomed = false;
    $("qviewer").classList.remove("hidden");
    $("qTitle").textContent = key.split("/").pop();
    $("qBody").classList.remove("zoomed");
    $("qZoom").textContent = "放大";
    showQ();
  }

  function showQ() {
    $("qImg").src = qcur[qIdx];
    $("qPage").textContent = "第 " + (qIdx + 1) + " / " + qcur.length + " 題";
    $("qPrev").disabled = qIdx === 0;
    $("qNext").disabled = qIdx === qcur.length - 1;
    qPos[$("qTitle").textContent] = qIdx;
    localStorage.setItem("g3qpos", JSON.stringify(qPos));
    if (qZoomed) $("qBody").scrollTop = 0;
  }

  function qNext() { if (qIdx < qcur.length - 1) { qIdx++; showQ(); } }
  function qPrev() { if (qIdx > 0) { qIdx--; showQ(); } }
  function qToggleZoom() {
    qZoomed = !qZoomed;
    $("qBody").classList.toggle("zoomed", qZoomed);
    $("qZoom").textContent = qZoomed ? "縮小" : "放大";
    if (qZoomed) $("qBody").scrollTop = 0;
  }
  function qSave() {
    fetch(qcur[qIdx]).then(function (r) { return r.blob(); }).then(function (blob) {
      var file = new File([blob], ("題目" + (qIdx + 1) + ".webp"), { type: "image/webp" });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file] }).catch(function () {});
      } else {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = file.name;
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
      }
    }).catch(function () { alert("存圖失敗"); });
  }

  $("qClose").addEventListener("click", function () { qcur = null; $("qviewer").classList.add("hidden"); });
  $("qPrev").addEventListener("click", qPrev);
  $("qNext").addEventListener("click", qNext);
  $("qZoom").addEventListener("click", qToggleZoom);
  $("qSave").addEventListener("click", qSave);

  var qbx = 0, qby = 0, qtracking = false;
  var qbody = $("qBody");
  qbody.addEventListener("touchstart", function (e) {
    if (qZoomed) return;
    var t = e.touches[0];
    qbx = t.clientX; qby = t.clientY; qtracking = true;
  }, { passive: true });
  qbody.addEventListener("touchend", function (e) {
    if (!qtracking || qZoomed) return;
    qtracking = false;
    var t = e.changedTouches[0];
    var dx = t.clientX - qbx, dy = t.clientY - qby;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) qNext(); else qPrev();
    }
  }, { passive: true });
  var qlastTap = 0;
  qbody.addEventListener("click", function (e) {
    if (qcur === null) return;
    var now = Date.now();
    if (now - qlastTap < 300) { qToggleZoom(); qlastTap = 0; }
    else qlastTap = now;
  });

  $("search").addEventListener("input", renderList);

  /* install prompt */
  var deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
  });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    }
  });

  /* init */
  fetch(DB).then(function (r) { return r.json(); }).then(function (arr) {
    data = arr;
    return fetch(QB).then(function (r) { return r.json(); }).then(function (q) {
      qdata = q;
    }).catch(function () { qdata = {}; });
  }).then(function () {
    var seen = {};
    data.forEach(function (it) { if (!seen[it.cat]) { seen[it.cat] = true; cats.push(it.cat); } });
    renderChips();
    renderList();
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(function () {});
  });
})();

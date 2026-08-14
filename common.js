/* 小朋友樂園：共用成就系統 */
(function(){
  var KEY = 'kids_app_v1';
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY)) || {stars:0, wins:{}, stickers:{}} }catch(e){ return {stars:0, wins:{}, stickers:{}} } }
  function save(s){ try{ localStorage.setItem(KEY, JSON.stringify(s)); }catch(e){} }

  window.KidsApp = {
    reportWin: function(gameId, sticker){
      var s = load();
      s.stars = (s.stars||0) + 1;
      s.wins = s.wins || {};
      s.wins[gameId] = (s.wins[gameId]||0) + 1;
      var isNew = false;
      if(sticker){
        s.stickers = s.stickers || {};
        if(!s.stickers[gameId]){ s.stickers[gameId] = sticker; isNew = true; }
      }
      save(s);
      if(isNew && sticker) showSticker(sticker);
      return s;
    },
    state: function(){ return load(); },
    getStars: function(){ return load().stars || 0; },
    getWins: function(g){ return (load().wins||{})[g] || 0; },
    hasSticker: function(g){ return !!((load().stickers||{})[g]); },
    getStickers: function(){ return load().stickers || {}; }
  };

  function showSticker(emoji){
    var d = document.createElement('div');
    d.style.cssText = 'position:fixed;left:50%;top:36%;transform:translate(-50%,-50%);z-index:300;text-align:center;pointer-events:none;';
    d.innerHTML = '<div style="font-size:78px;animation:bounceIn .5s ease">' + emoji + '</div>' +
      '<div style="font-size:18px;font-weight:800;color:#e05a9c;background:#fff;border-radius:999px;padding:5px 18px;box-shadow:0 4px 12px rgba(224,90,156,.35);margin-top:4px;">🎀 獲得新貼紙！</div>';
    document.body.appendChild(d);
    setTimeout(function(){ d.remove(); }, 1900);
  }

  var st = document.createElement('style');
  st.textContent = '@keyframes bounceIn { 0%{transform:scale(0)} 60%{transform:scale(1.25)} 100%{transform:scale(1)} }';
  document.head.appendChild(st);

  /* 漂浮亮片 */
  var em = ['✨','💖','🎀','⭐','🌸','💫'];
  for(var i=0;i<6;i++){
    (function(i){
      var sp = document.createElement('span');
      sp.className = 'sparkle';
      sp.textContent = em[i%em.length];
      sp.style.left = (2 + Math.random()*94) + 'vw';
      sp.style.top = (25 + Math.random()*60) + 'vh';
      sp.style.fontSize = (13 + Math.random()*11) + 'px';
      sp.style.animationDuration = (4 + Math.random()*3) + 's';
      sp.style.animationDelay = (Math.random()*4) + 's';
      document.body.appendChild(sp);
    })(i);
  }

  /* 有新版 App 上線時，自動重新整理拿最新版 */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', function(){
      location.reload();
    });
  }
})();

/* 繽紛樂園：共用成就系統 v2（星星貨幣 + 收集圖鑑冊） */
(function(){
  var KEY = 'kids_app_v2';
  var OLD_KEY = 'kids_app_v1';

  /* 圖鑑收集物定義：每款遊戲一種主題收藏物 */
  var FIGURES = {
    gomoku:  { e:'🐱', n:'貓咪棋王',  t:'森林' },
    go:      { e:'⚪', n:'圍棋大師',  t:'海洋' },
    jump:    { e:'⭐', n:'跳跳星',    t:'太空' },
    color:   { e:'🌈', n:'彩虹畫家',  t:'繽紛' },
    memory:  { e:'🐬', n:'海豚記憶王',t:'海洋' },
    mole:    { e:'👾', n:'星際獵人',  t:'太空' },
    puzzle:  { e:'🧁', n:'甜點拼圖師',t:'甜點' }
  };

  function defaultState(){ return { stars:0, wins:{}, figures:{} }; }
  function load(){
    var s;
    try{ s = JSON.parse(localStorage.getItem(KEY)); }catch(e){}
    if(!s){ s = defaultState(); }
    /* 從舊版搬移已收集貼紙 */
    try{
      var old = JSON.parse(localStorage.getItem(OLD_KEY));
      if(old && old.stickers){
        s.figures = s.figures || {};
        for(var k in old.stickers){ if(!s.figures[k]) s.figures[k] = old.stickers[k]; }
        if(!s.stars && old.stars) s.stars = old.stars;
        if(!s.wins && old.wins) s.wins = old.wins;
        save(s);
        localStorage.removeItem(OLD_KEY);
      }
    }catch(e){}
    return s;
  }
  function save(s){ try{ localStorage.setItem(KEY, JSON.stringify(s)); }catch(e){} }

  function album(){
    var s = load();
    var list = [];
    for(var id in FIGURES){
      var f = FIGURES[id];
      list.push({ id:id, emoji:f.e, name:f.n, theme:f.t, got:!!(s.figures||{})[id] });
    }
    return list;
  }

  window.KidsApp = {
    reportWin: function(gameId, sticker){
      var s = load();
      s.stars = (s.stars||0) + 1;
      s.wins = s.wins || {};
      s.wins[gameId] = (s.wins[gameId]||0) + 1;
      var isNew = false;
      if(sticker){
        s.figures = s.figures || {};
        if(!s.figures[gameId]){ s.figures[gameId] = sticker; isNew = true; }
      }
      save(s);
      if(isNew && sticker){ showCollect(sticker); confetti(); }
      return s;
    },
    state: function(){ return load(); },
    album: album,
    getStars: function(){ return load().stars || 0; },
    getWins: function(g){ return (load().wins||{})[g] || 0; },
    hasFigure: function(g){ return !!((load().figures||{})[g]); },
    getFigures: function(){ return load().figures || {}; }
  };

  function showCollect(emoji){
    var d = document.createElement('div');
    d.style.cssText = 'position:fixed;left:50%;top:36%;transform:translate(-50%,-50%);z-index:300;text-align:center;pointer-events:none;';
    d.innerHTML = '<div style="font-size:78px;animation:bounceIn .5s ease">' + emoji + '</div>' +
      '<div style="font-size:18px;font-weight:800;color:#e05a9c;background:#fff;border-radius:999px;padding:5px 18px;box-shadow:0 4px 12px rgba(224,90,156,.35);margin-top:4px;">🎁 收集到新圖鑑！</div>';
    document.body.appendChild(d);
    setTimeout(function(){ d.remove(); }, 1900);
  }

  function confetti(){
    var em = ['🌟','🎀','💖','⭐','🌸','💫','🎉','🍀'];
    for(var i=0;i<36;i++) setTimeout(function(){
      var c = document.createElement('div');
      c.textContent = em[Math.floor(Math.random()*em.length)];
      c.style.cssText = 'position:fixed;font-size:'+(14+Math.random()*14)+'px;left:'+Math.random()*100+'vw;top:-30px;z-index:95;pointer-events:none;animation:confettiFall '+(2+Math.random()*2)+'s linear forwards;';
      c.style.animationName = 'confettiFall';
      document.body.appendChild(c);
      setTimeout(function(){ c.remove(); }, 4300);
    }, Math.random()*900);
  }

  var st = document.createElement('style');
  st.textContent = '@keyframes bounceIn { 0%{transform:scale(0)} 60%{transform:scale(1.25)} 100%{transform:scale(1)} }' +
    '@keyframes confettiFall { to { transform:translateY(105vh) rotate(360deg); opacity:.4; } }';
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

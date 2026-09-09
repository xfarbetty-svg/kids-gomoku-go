# 手機端部署修正執行計畫

> **建立日期**：2026-09-09
> **審計範圍**：learn.html、toeic.html、index.html、common.js/css、sw.js
> **目標**：所有 APP 手機端正常運作、PWA 可安裝、音訊正常

---

## 🔍 審計摘要

| 嚴重等級 | 數量 | 說明 |
|----------|------|------|
| 🔴 致命 | 12 | 會 crash 或功能完全失效 |
| 🟡 中等 | 32 | 功能受損但不 crash |
| 🟢 低 | 43 | UX 不佳但可用 |
| **合計** | **87** | |

---

## Sprint 1：止血（致命 bug 修復）— ✅ 已完成（2026-09-09）

> **狀態**：10/10 全數修正並通過 JS 語法檢查。修正方式摘要（完整 diff 見 git）：
> 1.1 `KidsApp.addStars` 加 `window.KidsApp && typeof` guard
> 1.2 `stopAllAudio()` 加 `sharedMicStream.getTracks().forEach(t => t.stop()); sharedMicStream = null;`
> 1.3 `initShadowYtPlayer`／`playYoutubeSentence` 加 `retry` 參數，≥5 放棄並 `showToast` 提示（learn.html 已新增共用 `showToast`）
> 1.4 `AppState` 內 `localStorage` 取得/parse 全包 IIFE + try/catch + 預設值
> 1.5 `rateCurrent` 改成「again 一律 re-queue」，不再判斷 `isNew`
> 1.6 `SpeechSys` 暴露 `__reloadVoices()`，boot 綁單一 handler 同時更新 voices 與選擇器
> 1.7 `.fc-back` 移除 `overflow-y:auto`，改內層 `.fc-back-scroll` wrapper（兩處 HTML 範本同步加）
> 1.8 `.rate-btn` → `padding:12px 8px; min-height:44px;`
> 1.9 `install` 改逐筆 `c.add()` + try/catch，單檔 404 跳過不拖垮
> 1.10 viewport 加 `viewport-fit=cover` + `apple-mobile-web-app-status-bar-style:black-translucent`（並順手移除 `user-scalable=no`）
> 教訓彙整已寫入全域手冊 `~/.config/opencode/usage-manuals/code-pitfalls-mobile.md`

### 1.1 `learn.html` — KidsApp null guard
- **行號**：7351, 7355
- **問題**：`KidsApp.addStars(1)` 沒做 null check，common.js 載入失敗直接 crash
- **修正**：改為 `if (window.KidsApp && typeof KidsApp.addStars === 'function') KidsApp.addStars(1);`
- **參考**：line 4197 已有正確寫法 `if (window.KidsApp && typeof KidsApp.reportWin === 'function')`

### 1.2 `learn.html` — 麥克風 stream 釋放
- **行號**：7451 (`stopAllAudio`)
- **問題**：錄音結束後 `sharedMicStream` 從未呼叫 `getTracks().forEach(t => t.stop())`，紅條持續亮、吃電、隱私問題
- **修正**：在 `stopAllAudio()` 中加入：
  ```js
  if (sharedMicStream) {
    sharedMicStream.getTracks().forEach(t => t.stop());
    sharedMicStream = null;
  }
  ```

### 1.3 `learn.html` — YT API 無限重試
- **行號**：6768-6776, 6814-6820
- **問題**：YouTube API 載入失敗時 `setTimeout(() => initShadowYtPlayer(videoId), 400)` 無限遞迴，吃爆 CPU
- **修正**：加 `maxRetry` 參數，超過 5 次放棄並顯示錯誤提示

### 1.4 `learn.html` — localStorage parse 保護
- **行號**：3611-3616
- **問題**：`JSON.parse(localStorage.getItem(...))` 在 module load 時執行，storage 損壞 = 整個 APP 死掉
- **修正**：包在 try/catch 中，解析失敗時使用預設值

### 1.5 `toeic.html` — 「忘了」卡片移除 bug
- **行號**：791-796
- **問題**：有復習紀錄的卡片（reps > 0）按「忘了」走 else 分支，直接從 queue 移除，整場不再出現
- **修正**：改為不分 reps 多少，「忘了」一律 re-queue（插入 fcPos+4 位置）

### 1.6 `toeic.html` — onvoiceschanged 被覆蓋
- **行號**：386 (SpeechSys), 1062 (boot)
- **問題**：boot 時 `window.speechSynthesis.onvoiceschanged = populateVoiceSelect` 覆蓋了 SpeechSys 的 `loadVoices`，導致 SpeechSys 內部 voices 陣列永遠過期
- **修正**：統一在 boot 時綁定一個 handler，同時呼叫 `loadVoices()` 和 `populateVoiceSelect()`

### 1.7 `toeic.html` — 閃卡背面 3D flip 閃爍
- **行號**：145
- **問題**：`.fc-back` 有 `overflow-y: auto` + `backface-visibility: hidden`，WebKit 翻面時背面閃爍消失
- **修正**：移除 `.fc-back` 的 `overflow-y: auto`，內部加一個 `.fc-back-scroll` wrapper 做滾動

### 1.8 `toeic.html` — 評分按鈕觸控太小
- **行號**：250
- **問題**：`padding: 11px 2px` 只有 2px 水平 padding，手機上按不到
- **修正**：改為 `padding: 12px 8px` 並確保最小觸控區域 44x44px

### 1.9 `sw.js` — addAll 單檔失敗拖垮整體
- **行號**：75
- **問題**：`c.addAll(FILES)` 只要一個檔案 404（如 icon-180.png），整個 PWA 安裝失敗
- **修正**：改為逐筆 put：
  ```js
  caches.open(CACHE).then(async (c) => {
    for (const f of FILES) {
      try { await c.add(f); } catch (e) { console.warn('[SW] skip', f); }
    }
  }).then(() => self.skipWaiting())
  ```

### 1.10 `index.html` — 缺 viewport-fit
- **行號**：5
- **問題**：缺 `viewport-fit=cover`，iPhone X+ 圓角裁切內容；缺 `apple-mobile-web-app-status-bar-style`
- **修正**：viewport 改為 `width=device-width, initial-scale=1.0, viewport-fit=cover`，加 `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`

---

## Sprint 2：手機體驗修復

### 2.1 底部 safe-area-inset
- **檔案**：`learn.html` (line 326, 2296-2304), `index.html`
- **修正**：所有 `padding-bottom` 改為 `calc(Npx + env(safe-area-inset-bottom))`

### 2.2 移除 user-scalable=no
- **檔案**：`learn.html` line 5
- **修正**：移除 `user-scalable=no`，允許 pinch-to-zoom（WCAG 合規）

### 2.3 觸控按鈕 ≥44px
- **檔案**：`learn.html` (action-btn 32px, bubble-btn 24px, icon-btn 38px, sub-actions 20px)
- **修正**：所有可互動元素最小 44x44px，用 `min-width: 44px; min-height: 44px` 確保

### 2.4 alert() 替換為 toast
- **檔案**：`learn.html` lines 4054, 4201, 4423, 4426, 4430, 4459, 4464, 4470, 4673
- **修正**：建立共用 `showToast(msg, type)` 函數，替換全部 9 處 alert

### 2.5 Shadowing 控制列 sticky
- **檔案**：`learn.html` lines 2296-2304
- **修正**：`.shadow-control-dock` 加 `position: sticky; bottom: 0; z-index: 50;`

### 2.6 Filter pills 滾動優化
- **檔案**：`toeic.html` lines 93-94
- **修正**：加 `flex-wrap: nowrap; -webkit-overflow-scrolling: touch;`，加視覺滾動指示（漸層遮罩）

### 2.7 Flashcard swipe 手勢
- **檔案**：`toeic.html` line 776-779
- **修正**：加 touchstart/touchmove/touchend 事件，左滑=忘了，右滑=良好，附帶動畫

### 2.8 中→英測驗加發音
- **檔案**：`toeic.html` lines 880-888
- **修正**：zh2en 模式渲染時加入發音按鈕

### 2.9 搜尋 debounce
- **檔案**：`toeic.html` line 670
- **修正**：`oninput` 改為 300ms debounce 後再呼叫 `setFilter`

---

## Sprint 3：音訊與 PWA 穩定化

### 3.1 Cloud TTS timeout 延長
- **檔案**：`learn.html` line 6989-6994
- **修正**：1.5s → 3s

### 3.2 MediaRecorder MIME fallback
- **檔案**：`learn.html` line 7131
- **修正**：先嘗試 `audio/webm;codecs=opus`，失敗改 `audio/webm`，再失敗改 `audio/mp4`

### 3.3 PWA 新版本通知
- **檔案**：`learn.html` lines 7610-7611
- **修正**：偵測到新 SW 時顯示 toast「有新版本，點擊更新」+ click 重新載入

### 3.4 SW 離線回退頁修正
- **檔案**：`sw.js` line 97
- **修正**：catch 回退改為嘗試 `caches.match(e.request)` 再 fallback 到 `caches.match('./index.html')`

### 3.5 kids.json 加入快取
- **檔案**：`sw.js` FILES 陣列
- **修正**：加入 `'./data/kids.json'`

### 3.6 icon-180.png 存在性確認
- **檔案**：`sw.js` FILES, `index.html` line 8
- **修正**：確認檔案存在；不存在則從 SW 快取清單移除、index.html 改用 icon-192.png

### 3.7 版本字串統一
- **檔案**：所有 HTML 的 `?v=N` 引用
- **修正**：全部統一為同一版本號（建議 `?v=35`，對齊 sw.js cache name）

---

## Sprint 4：效能與資料穩定

### 4.1 toeic.json 載入優化
- **檔案**：`toeic.html` line 593
- **修正**：加 AbortController（10s timeout）+ loading 進度提示

### 4.2 common.js load() cache
- **檔案**：`common.js` line 21-22
- **修正**：加模組級 cache 變數，同 render 週期不重複 parse

### 4.3 saveState() quota 警告
- **檔案**：`toeic.html` line 484-486
- **修正**：catch QuotaExceededError 時顯示 toast 警告

### 4.4 render() debounce
- **檔案**：`index.html` line 119
- **修正**：改為 dirty flag + requestAnimationFrame 批次更新

### 4.5 KIDS_WORDS 外部化
- **檔案**：`toeic.html` line 419
- **修正**：684 字內嵌 JSON 改為 `data/kids.json`（已有此檔案），動態 fetch 載入

### 4.6 多 Tab race condition
- **檔案**：`common.js` lines 20-52
- **修正**：加 `window.addEventListener('storage', ...)` 監聽同源 tab 變更，自動重載 state

---

## Sprint 5：收尾與測試

### 5.1 manifest.json 更新
- **修正**：description 改為包含所有 APP 功能的描述

### 5.2 prefers-reduced-motion
- **修正**：所有動畫（sparkleTwinkle, bounceIn, floatY, ribbonMove, confettiFall）加 media query 降級

### 5.3 PWA 離線偵測
- **修正**：全域監聽 `online/offline` 事件，離線時顯示提示 banner

### 5.4 實機測試清單
- [ ] iPhone SE（小螢幕）
- [ ] iPhone 14 Pro Max（大螢幕 + Dynamic Island）
- [ ] Android 中階機（Samsung A54 或同等）
- [ ] 各 APP 核心流程走一遍：開啟→瀏覽→操作→音訊→返回

### 5.5 部署驗證
- [ ] GitHub Pages 正常載入
- [ ] PWA 可安裝到桌面
- [ ] 離線模式可用

### 5.6 版本推進
- `sw.js` cache name 改為 `kids-games-v35`
- `sw.js` FILES 陣列更新
- commit + push

---

## ⚠️ 注意事項

- 修改 `learn.html` 時保留 ShadowingStudio 生命週期 API（`onModeChange`, `setShadowingLang`, `onTabOpen`, `stopAllAudio`）
- `toeic.html` 是獨立 APP，不引用 common.js，所有修正直接在該檔案內完成
- 每個 Sprint 完成後建議在手機上基本驗證再進入下一個 Sprint

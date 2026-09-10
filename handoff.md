# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；換對話框／收工時**必更新**。本檔只放交接必需的精簡資訊。

## ⏯️ 目前做到哪

1. **影子跟讀第 5 步驟「回音法」（Echo Method）全套實作完成**（commit a736e19 / 888ef19，已 push）：
   - `learn.html` 新增第 5 個步驟 Tab `[🔊 回音]`，CSS `.step-tabs` 改為 5 欄等寬網格。
   - `applyStepUI()` 實作 Step 5 盲聽狀態（隱藏 ruby/romaji/zh/hint/badge，常駐錄音按鈕）。
   - `playEchoSentence()` 實作原音播放 → 5 秒複述倒數「換你說！」→ 原音對照重播 → 銜接下一句。
   - `speakSentence()` 智慧分流，YouTube 來源在 Step 5 自動導向回音法。
   - `zhHidden` 與音訊定時器清理邏輯同步整合。
2. **BBT《The Big Bang Theory》素材整合**（commit 888ef19，已 push）：
   - `PRESET_VIDEOS` 納入 Sheldon 考駕照經典對白（13 句中英對照字幕）。
   - 支援「📤 送到影子跟讀」與 Step 5 回音法練習。
3. **綠野仙蹤影子跟讀版第 1 章完成**（commit f26bb8e）：
   - `woo_shadow_ch1.html`（獨立檔案，49 句英中對照，Read Me A Classic 朗讀版）。
4. **平板橫向版面最佳化**（commit a9a1889）。
5. **影音精聽室 YouTube 無法播放修復**：
   - 根因：載入時精聽室 Tab 為 `display:none`，`new YT.Player` 在零尺寸容器內初始化 → 黑畫面。
   - 修復：YTPlayerSys 改為 `playerBuilt` flag + `ensureReady()` 延後到第一次打開精聽室才建立播放器；`UI.switchTab()` 切到 video Tab 時呼叫。
6. **影子跟讀「📖 全文雙語對照」檢視器**：
   - `.shadow-story-row-1` 新增「📖 全文對照」按鈕 → `#fullTextViewModal` 彈窗（逐句 中英/中日對照 + 時間戳 + 🎯 跳句回訓練）。
   - ShadowingStudio 新增 `fmtFullTextTime/openFullTextView/renderFullTextView/jumpToSentenceFromFullText/closeFullTextView/toggleFullTextZh/initFullTextViewEvents`。
7. **影音精聽室精選自動同步進影子跟讀故事庫**：
   - `getPresetStories()` 依 mode+lang 將 PRESET_VIDEOS 自動轉成 `yt-` 故事（source:youtube）；`getCurrentStory()`/`populateStorySelect()` 已擴充。
   - 手動「📤 送到影子跟讀」僅保留給用戶自訂影片/字幕。
8. **綠野仙蹤 Ch.1 正式收編 learn.html 故事庫**：
   - `WOO_CH1_STORY` const（`source:'localaudio'`，`audioFile:'woo_shadow_ch1.webm'`，81 句 `{start,end,text,zh}`）。
   - 新增 `playLocalAudioSegment()`（seek 到 start、追到 end 自動停、`playbackRate` 跟語速）並掛進 `speakSentence()` 與 `stopAllAudio()`；Step 5 回音法對 localaudio 退化為一般播放。
   - 修正 `woo_shadow_ch1.html` 兩處字典型 typo（`start:375.5,en:378.88`、`start:419,en:424` → `end:`）。
   - `sw.js` 快取版本升為 `kids-games-v37`，加入 `woo_shadow_ch1.webm` 與 `woo_shadow_ch1.html`。

9. **網頁版＋無頭瀏覽器驗收＆Bug 修復（本次）**：
   - 🔴 修 `openFullTextView()` 的 `$('#fullTextViewModal')` → `$('fullTextViewModal')`（`$`=getElementById，null.classList 曾讓「全文對照」完全無法開啟）。
   - 🔴 修 `playLocalAudioSegment()` 播放斷裂：`stopLocalAudioSegment()` 對舊元素設 `src=''` 會觸發非同步 `error`（Empty src attribute）→ 舊 `onerror` 再呼叫 `finish()`＋`speakSentence()` 回退，把新元素清掉並無限 rebuild。改為「先解綁事件 handler → pause → removeAttribute('src')+load()」；localaudio 的 `onerror` 不再觸發 TTS 回退（避免無限遞迴）。
   - 🔴 修語速無效：`audio.playbackRate = currentSpeed` 在 `audio.load()` 之前設定會被 Chrome 重設回 1.0。移到 `begin()`（load 之後、play 之前）再設一次；speed-btn 對播放中的 `localSegmentAudio`／`realAudioEl` 即時套用。
   - 🟢 `common.js:156` sparkle `document.body.appendChild` 在 `<head>` 載入時 body 尚未解析 → 加 null 防護（原本 sparkles 全消失＋console error）。
   - 📖 **全文對照升級為「閱讀器」**：`openFullTextViewEx(title, rows, onJump)` 可重用（故事與影片字幕共用）＋整排可點跳句（hover 高亮、字級放大）；精聽室載入列新增「📖 全文閱讀」按鈕，點擊開目前影片雙語閱讀、跳句自動送出並切影子跟讀。
   - ✅ 無頭 Chrome e2e 10/10 通過：選單/81 句/全文彈窗/sentence0/1/重播/語速0.7與1.0/停止/YT iframe 建立。
   - ⚠️ 已知測試工具陷阱：YT.Player 會把 `#player` div「替換成」同 id 的 iframe（內部不會再巢狀 iframe）；puppeteer 新版無 `page.waitForTimeout`，須自製 setTimeout promise；語速測試時 `load()` 會重設 rate。e2e 腳本在 `C:\Users\PXP\AppData\Local\Temp\opencode\`。

## 🚦 目前狀態

- 專案：純前端 HTML/CSS/JS，無框架、無 build 步驟。
- 主要應用：
  - `index.html`：四關魔王討伐卡片 + 影子跟讀入口 + 星光單字星球入口
  - `learn.html`：影子跟讀 V2（含 Step 5 回音法）、影音精聽室、情境對話、跟讀生字庫、語境記憶閃卡
  - `toeic.html`：星光單字星球（兒童美語 684 + 多益 11,238 字）
  - `sticky-gomoku-new.html`：黏黏圍棋（Gooey 果凍、4 段 AI、AI 教練）
  - `woo_shadow_ch1.html`：綠野仙蹤 Ch.1 影子跟讀（獨立檔案）
- 快取版本：`sw.js` = `kids-games-v37`
- GitHub Pages：https://xfarbetty-svg.github.io/kids-gomoku-go/
- 依賴工具鏈現況（DESKTOP-6ELKIRH）：
  - `yt-dlp`：2026.08.19
  - `ffmpeg`：9.0-full_build（已加入系統 PATH）
  - `whisper`：openai-whisper 20250625 已安裝於 Python 3.10
- 綠野仙蹤 Ch.1 音檔：`woo_shadow_ch1.webm`（6.1MB，已進 SW 快取）。

## ➡️ 尚未做的工作清單（待辦路線圖）

1. **綠野仙蹤後續**：
   - ~~確認 Ch.1 影子跟讀版品質 → 正式加入 learn.html~~ ✅ 已完成（source:localaudio 直接收編）
   - **待驗收**：手機/平板實機跑一遍精聽室→影子跟讀（YouTube 精選、WOO Ch.1、Step 5），確認全文對照跳句與音訊。
   - 製作 Ch.2~24（YouTube playlist 已確認，流程已跑通）
2. **平板與手機實機體驗走查**：
   - 實機確認 Step 5「回音法」在 iPhone / Android 上之觸控與 5 個 Tab 寬度體驗。
   - 平板橫向雙欄體驗驗收。
3. **Sprint 2 手機體驗剩餘項**（見 `PLAN-MOBILE-FIX.md`）。
4. **Sprint 3-5**（音訊 PWA、效能資料、收尾測試）。
5. **單字星球優化**：PDF 題庫擴充、閃卡左右翻動效、主題 Pills 修復。
6. **TASK-008 內容包**（VOA + BBC 素材）。
7. **魔王討伐動畫／音效**。

## ⚠️ 注意事項

- 本機目前未配置 Obsidian MCP 工具，L3 筆記暫未自動同步，待回到有 Obsidian 工具之環境時補齊。
- 綠野仙蹤素材來源：`youtube.com/playlist?list=PLgQjk-xm2AGXx0mwnIuQiDocH9wssCTeU`（Read Me A Classic，24 章）。
- 平板斷點慣例：`@media (min-width: 900~960px) and (orientation: landscape)`。
- 修改 `learn.html` 時務必保留 ShadowingStudio 生命週期與各 Step UI 獨立分流機制。

## 🕐 最後更新

- 時間：2026-09-11
- 更新者：antigravity @ DESKTOP-6ELKIRH
- 內容：網頁版＋無頭瀏覽器驗收修復（全文彈窗、WOO 連播、語速、stop、pepper YT 確認）＋全文對照升級閱讀器＋精聽室「📖 全文閱讀」入口（未 commit）
- Git push：⏳ 尚未 commit/push（本次修改未提交）

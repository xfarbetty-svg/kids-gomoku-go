# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；換對話框／收工時**必更新**。本檔只放交接必需的精簡資訊。

## ⏯️ 目前做到哪
新增完成 **星光單字星球 `toeic.html`**——萬字多益 + 兒童美語單字卡 APP：
1. **雙庫切換**：🧸 兒童美語（GEPT Kids 684 字・33 主題）/ 💼 多益（11238 字・15 分類・5 星級）
2. **單字庫瀏覽**：搜尋、主題/星級/收藏篩選、卡片網格、自訂生字、收藏功能
3. **SM-2 間隔重複閃卡**：真正 SRS 演算法（4 評分：忘記/困難/良好/簡單），動態排程復習日期
4. **測驗模式**：英→中、中→英、拼寫三種題型，可選 10/20/30 題，即時計分
5. **真人發音**：Web Speech API，語音選擇器（持久化）
6. **進度追蹤**：localStorage 持久化（SRS 狀態、收藏、統計）
7. **資料源**：`data/toeic.json`（Hugging Face kknono668/toeic-vocab-tw，去掉 exam_tips 瘦身至 9MB）、`data/kids.json`（GEPT Kids 33 主題爬蟲）
8. **收尾**：index.html 入口卡片、sw.js v29 快取、headless 全四頁籤冒煙測試通過、node 語法檢查通過

## 🚦 目前狀態
- 專案：星光獵魔團（K-pop 少女獵人主題），純前端 HTML/CSS/JS，無框架、無 build 步驟
- 主要應用：
  - `index.html`：四關魔王討伐卡片 + 雙語探險學院 + 光單字星球入口
  - `learn.html`：雙語探險學院（單字庫、YouTube 精聽室、打怪/閃卡、情境對話、影子跟讀訓練室 V2）
  - `toeic.html`：**星光單字星球**（兒童美語 684 字 + 多益 11238 字，SM-2 間隔重複閃卡、測驗、進度追蹤）
  - `sticky-gomoku-new.html`：黏黏圍棋（Gooey 果凍融合、4 段 AI 棋力）
- 資料檔：`data/toeic.json`（多益 11238 字・9MB）、`data/kids.json`（GEPT Kids 684 字・62KB）
- 快取與離線：`sw.js` 為 `kids-games-v29`，包含 `toeic.html` 與 `data/toeic.json`
- 接力狀態機：`TASK-007` 處於 `CODE_DONE`；`toeic.html` 為本次新增功能。

## ➡️ 下一步
1. **實測 toeic.html**：手機端 PWA 安裝測試雙庫切換、閃卡翻牌、SRS 排程、測驗流程
2. **補強 toeic.html**：TOEIC 單字加入音標欄位（從外部 API 補齊）、兒童單字加例句
3. **TASK-008 內容包實作**：預載 VOA Learning English + BBC 6 Minute English 逐字稿素材包
4. **實測魔王系統**：手機端實測各關卡解鎖與討伐流程
5. **魔王討伐動畫／音效**：補齊討伐獲勝的視覺動畫與音效反饋
6. **真人音檔逐句切分整合**：日文老師《稻草富翁》m4a → 逐句片段對齊 ShadowingStudio

## ⚠️ 注意事項
- 純前端，修改完直接重新整理即可測試，無需 build
- 手機測試建議以 PWA 方式安裝或在 localhost / HTTPS 環境下測試（以確保 Web Speech 與 MediaRecorder 權限正常）
- 修改 `learn.html` 時務必注意保留 ShadowingStudio 暴露之 4 大生命週期 API（`onModeChange`, `setShadowingLang`, `onTabOpen`, `stopAllAudio`）

## 🔧 進行中：真人語音切換與真人音檔載入

### 已完成並 commit
- `ca0cc1e`：**語音切換選擇器**（🗣️ 下拉）——`SpeechSys` 新增 `getVoicesByLang` / `setPreferredVoice` / `resolveVoice`；ShadowingStudio 新增 `populateVoiceSelect()` / `applyVoiceSelect()`，依語言列語音、localStorage 持久化，`speakSentence()` 優先套用使用者選定語音。
  - 本機可用語音僅 4 個（Google）：US English、UK English Male/Female、Google 日本語。
  - 使用者期望更換為「某位真人老師聲線」，TTS 僅能選最接近合成聲，故決定引入「真人音檔載入」。

### 真人音檔下載進度（尚未 commit）
- 目標：日文老師 `https://www.youtube.com/watch?v=rLwowh9SBa4`（《稻草富翁》From Straw to a Great Turnaround｜JLPT N5｜11 分鐘）
- ✅ **已下載日文原音**：`C:\Users\PXP\AppData\Local\Temp\opencode\jp_teacher_ja.m4a`（10.28MB，format 140-1，日文原始音軌）
- ⚠️ `jp_teacher.webm` 是誤抓的英文配音（format 251-0），可刪除
- ✅ 影片有**日文自動字幕（ja CC，SRT 可用）**，可取得逐句時間戳
- ✅ 工具鏈已就緒：
  - yt-dlp 2026.08.19（`C:\Users\PXP\AppData\Local\Programs\Python\Python310\Scripts\yt-dlp.exe`）
  - deno 2.9.6（`C:\Users\PXP\AppData\Local\Programs\deno\deno.exe`）
  - ffmpeg 9.0.1（`C:\Users\PXP\AppData\Local\Programs\ffmpeg\ffmpeg-9.0.1-essentials_build\bin\ffmpeg.exe`）
- **yt-dlp 抓取指令範例**（需指定 JS runtime 避免 403）：
  `yt-dlp --no-playlist --js-runtimes "deno:<deno路徑>" -f "140-1" -o "<輸出>.m4a" <影片網址>`

### 下一步（逐句切分整合）
1. 下載日文字幕 SRT，取得逐句時間戳
2. 用 ffmpeg 依時間戳切出每句音訊片段
3. 對齊現有 `SHADOWING_DATA.kids.ja.warashibe` 的逐句文字
4. 在 ShadowingStudio 加「真人音檔」音源（取代 TTS），支援逐句播放 + 錄音對照

## 🕐 最後更新
- 時間：2026-09-09
- 更新者：opencode @ DESKTOP-6ELKIRH
- 內容：完成星光單字星球 `toeic.html`（雙庫 SM-2 閃卡 + 測驗 + 進度追蹤），index.html 入口 + sw.js v29 快取
- Git push：✅ 已推送到 origin/main

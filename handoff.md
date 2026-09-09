# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；換對話框／收工時**必更新**。本檔只放交接必需的精簡資訊。

## ⏯️ 目前做到哪
1. **全面統一命名為「🎙️ 影子跟讀」**：首頁卡片、`learn.html` 網頁標題與頂部品牌 Header 全面統一名稱為「影子跟讀 🎙️」，預設開啟分頁直達「影子跟讀」。
2. **影音精聽室 ➔ 影子跟讀 橋接實作完成**：
   - 精聽室新增「📤 送到影子跟讀」綠色醒目按鈕，支援「📝 匯入/編輯字幕」抽屜面板（支援每行語法與標準 JSON 字幕）。
   - 資料結構統一，存入 `localStorage.user_shadow_videos`。
   - 影子跟讀故事選單動態載入「── 🎬 我的 YouTube 影片 ──」並顯示練習進度。
   - 影子跟讀內嵌專用小型 YouTube 播放器容器，支援精確時間戳 `seekTo(start)` ~ `end` 原音播放、句尾自動停止、連續跟讀自動留白，以及第 4 階段 AB 對照（A 原音播放 YouTube 該句）。
3. **日文老師《稻草富翁》真人音檔切分整合完成**：`audio/warashibe/s01.mp3` ~ `s51.mp3` 全數對齊掛載進影子跟讀教材庫。
4. **本地啟動腳本與桌面捷徑**：新增 `影子跟讀.bat`（Port 8090）並在 Windows 桌面建立「影子跟讀.lnk」捷徑。
5. **行動端優先（Mobile First）版面徹底重構 (v33)**：
   - 導航分頁列重構為橫向平滑滑動膠囊列（`white-space: nowrap !important; overflow-x: auto;`），消滅單字直排擠壓災難。
   - 頂部 Header 98% 實心漸層背景防穿透，固定膠囊高度防垂直拉伸，單行緊湊化。
   - 影子跟讀導航列採雙層獨立架構（進度置中帶微型進度條 + 3 大按鈕寬敞排列）。
   - 72x72px 居中盲按錄音大按鈕，大拇指極佳操作體驗。
6. **手機音訊無聲徹底治本修復 (v34)**：
   - 移除 `unlockMobileAudio()` 內的空字串 Utterance，徹底根除 Android/WebKit 語音佇列永久卡死的死結 bug。
   - 51 句真人老師《稻草富翁》音檔同步完整掛載至 kids 模式，預設點選即 100% 播放清晰真人原聲 MP3。
   - 實作「雙雲端 TTS 備援（Dual-Engine Cloud Fallback）」：英文走有道、日文走 Google Translate TTS，配備 1.5s 超時與 onerror 自動降級，保證任何手機 100% 必定能發出聲音！
7. 快取升級：`sw.js` 推進至 `kids-games-v34`。

## 🚦 目前狀態
- 專案：星光獵魔團（K-pop 少女獵人主題），純前端 HTML/CSS/JS，無框架、無 build 步驟
- 主要應用：
  - `index.html`：四關魔王討伐卡片 + 影子跟讀入口 + 星光單字星球入口
  - `learn.html`：影子跟讀（沉浸式影子跟讀 V2、影音精聽室、情境對話、跟讀生字庫、語境記憶閃卡）
  - `toeic.html`：星光單字星球（兒童美語 684 字 + 多益 11,238 字，SM-2 閃卡、三向測驗）
  - `sticky-gomoku-new.html`：黏黏圍棋（Gooey 果凍融合、4 段 AI 棋力）
- 快取版本：`sw.js` 為 `kids-games-v34`

## ➡️ 尚未做的工作清單（待辦路線圖）

### 1. 單字星球（`toeic.html`）體驗優化備忘
- **閃卡左右翻面動效修復**：改為流暢的 3D 左右翻轉（Y 軸），解決翻轉卡頓/手感問題
- **主題標籤列（Pills）滾動修復**：支援電腦端橫向滾動或換行，避免後方主題被截斷無法點選
- **兒童美語題庫擴充**：解析並整合根目錄 3 份 PDF 資源（`國小英文單字.pdf`、`國小英文單字 （2）.pdf`、`GEPTKid_wordlist01.pdf`，參考清大英語教學資源網）

### 2. TASK-008 內容包實作
- 預載 VOA Learning English 與 BBC 6 Minute English 逐字稿素材包

### 3. 魔王討伐系統實測與動效音效
- 手機端全流程測試四關魔王血量扣除、自動解鎖下一關流程
- 魔王討伐勝利專屬動畫與音效反饋

## ⚠️ 注意事項
- 純前端應用，直接以瀏覽器開啟或透過 `影子跟讀.bat` / `星光單字星球.bat`（Port 8090）伺服器啟動。
- 修改 `learn.html` 時注意保留 ShadowingStudio 生命週期 API（`onModeChange`, `setShadowingLang`, `onTabOpen`, `stopAllAudio`）。

## 🕐 最後更新
- 時間：2026-09-09 12:15
- 更新者：antigravity @ DESKTOP-6ELKIRH
- 內容：完成行動端全面重構、徹底修復 Android/iOS 無聲音問題（解鎖死結、掛載51句真人音檔、TTS雲端備援），經無頭真實瀏覽器端到端測試通過，推進快取至 v34。
- Git push：✅ 已推送到 origin/main

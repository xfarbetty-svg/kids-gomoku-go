# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；換對話框／收工時**必更新**。本檔只放交接必需的精簡資訊。

## ⏯️ 目前做到哪

1. **綠野仙蹤第 1 章純聽力試用版完成**（commit 5ac4484，已 push）：
   - `woo_trial_audio.html`：純音訊 + 中英字幕同步高亮（49 句，Gutenberg 原文對齊 YouTube auto-caption）
   - `woo_p1_audio.webm`：第 1 章《The Cyclone》音訊（35MB，yt-dlp 下載）
   - 功能：A-B 循環、遮蔽中文、上/下一句導航、進度條
   - 流程驗證：YouTube auto-caption 抓取 → Gutenberg 書本句子對齊 → 中文翻譯 → 本地音訊播放
   - ⚠️ 已知問題：**字幕時間序不夠精準**，auto-caption 對齊演算法需要改善（目前用 word-overlap greedy matching，中間穿插老師講解段落導致偏移）
   - 下次：調整對齊演算法 → 確認字幕品質 → 正式加入 `learn.html` 的 PRESET_VIDEOS
2. **完成全部 APP 平板橫向（landscape）版面最佳化**（commit a9a1889，已 push）：
   - `index.html`：卡片網格 780→1180px 用滿平板寬度。
   - `learn.html`：影子跟讀 ≥960px 橫向改雙欄 CSS Grid（左：選單/步驟/全文稿 380px，右：訓練舞台 1fr）。
   - `toeic.html`：容器加寬至 1180px，閃卡/測驗/彈窗 520→720px，字卡 280px。
   - `sticky-gomoku-new.html`：解除棋盤 480px 上限，橫向雙欄（左棋盤/右比分技能），`fitScale` 依 `isWide` 分流可放大至 1.6x。
   - `rhythm/memory/puzzle`：舞台/牌面/拼圖板加寬至 640~720px；`gomoku.html` 棋盤放大至 1.5x。
   - ♿ 全部移除 `user-scalable=no`（WCAG 縮放合規，也完成 Sprint 2.2）。
2. **8 檔案 JS/CSS 語法檢驗通過**（node `new Function` 檢查 + CSS braces 平衡檢查）。
3. **SW 為上線優先策略**，HTML 不會快取過期，本次改版不需推快取版本（目前 `kids-games-v36`）。

## 🚦 目前狀態

- 專案：純前端 HTML/CSS/JS，無框架、無 build 步驟
- 主要應用：
  - `index.html`：四關魔王討伐卡片 + 影子跟讀入口 + 星光單字星球入口
  - `learn.html`：影子跟讀 V2、影音精聽室、情境對話、跟讀生字庫、語境記憶閃卡
  - `toeic.html`：星光單字星球（兒童美語 684 + 多益 11,238 字）
  - `sticky-gomoku-new.html`：黏黏圍棋（Gooey 果凍、4 段 AI、AI 教練）
- 快取版本：`sw.js` = `kids-games-v36`（上線優先，改 HTML 不需推版）
- 審計計畫：`PLAN-MOBILE-FIX.md`（87 問題，Sprint 1 ✅，Sprint 2 進行中）
- GitHub Pages：https://xfarbetty-svg.github.io/kids-gomoku-go/

## ➡️ 尚未做的工作清單（待辦路線圖）

1. **🔴 平板實機驗證**：iPad／Android 平板轉橫向，逐頁確認雙欄與放大效果（本次改版尚未實機看過）。
2. **Sprint 2 手機體驗剩餘項**（見 `PLAN-MOBILE-FIX.md`）：
   - 2.1 底部 safe-area-inset、2.3 觸控按鈕 ≥44px、2.4 alert→toast、2.5 控制列 sticky、2.6 Pills 滾動、2.7 閃卡 swipe、2.8 中英測驗發音、2.9 搜尋 debounce
3. **Sprint 3-5**（音訊 PWA、效能資料、收尾測試，詳見 `PLAN-MOBILE-FIX.md`）
4. **單字星球優化**：PDF 題庫擴充、閃卡左右翻動效、主題 Pills 修復
5. **TASK-008 內容包**（VOA + BBC 素材）
6. **魔王討伐動畫／音效**

## ⚠️ 注意事項

- 平板斷點慣例：`@media (min-width: 900~960px) and (orientation: landscape)`，已涵蓋 iPad 1024px。
- 修改 `learn.html` 時保留 ShadowingStudio 生命週期 API（`onModeChange`, `setShadowingLang`, `onTabOpen`, `stopAllAudio`）。
- `toeic.html` 是獨立 APP，不引用 common.js。
- `sticky-gomoku-new.html` 的 `fitScale` 有瀏覽模式分流（`isWide`：landscape ≥920px 用主欄寬度公式計算棋盤放大）。
- 舊版遊戲（mole/jump/go/dressup/color/sticky-gomoku.html）未在 index 引用，為 legacy 檔案，本次未改。

## 🕐 最後更新
- 時間：2026-09-10
- 更新者：antigravity @ DESKTOP-6ELKIRH
- 內容：綠野仙蹤第 1 章純聽力試用版（音訊 OK，字幕時序待調整）
- Git push：✅ 已推送到 origin/main（5ac4484 + cc9b26e）
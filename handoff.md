# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；換對話框／收工時**必更新**。本檔只放交接必需的精簡資訊。

## ⏯️ 目前做到哪

1. **完成手機端部署全面審計**：對 learn.html、toeic.html、index.html、common.js/css、sw.js 進行徹底檢查，共發現 **87 個問題**（🔴 致命 12 / 🟡 中等 32 / 🟢 低 43）。
2. **產出完整執行計畫**：已寫入 `PLAN-MOBILE-FIX.md`，分 5 個 Sprint（止血→手機體驗→音訊 PWA→效能資料→收尾測試），每項任務有具體行號與修正方案。
3. **目前未修改任何程式碼**，純審計 + 計畫產出階段。

## 🚦 目前狀態

- 專案：星光獵魔團（K-pop 少女獵人主題），純前端 HTML/CSS/JS，無框架、無 build 步驟
- 主要應用：
  - `index.html`：四關魔王討伐卡片 + 影子跟讀入口 + 星光單字星球入口
  - `learn.html`：影子跟讀（沉浸式影子跟讀 V2、影音精聽室、情境對話、跟讀生字庫、語境記憶閃卡）
  - `toeic.html`：星光單字星球（兒童美語 684 字 + 多益 11,238 字，SM-2 閃卡、三向測驗）
  - `sticky-gomoku-new.html`：黏黏圍棋（Gooey 果凍融合、4 段 AI 棋力）
- 快取版本：`sw.js` 為 `kids-games-v34`
- **審計報告**：`PLAN-MOBILE-FIX.md`（87 個問題 + 5 Sprint 執行計畫）

## ➡️ 尚未做的工作清單（待辦路線圖）

### 🔴 最優先：Sprint 1 止血（PLAN-MOBILE-FIX.md → Sprint 1）
1. `learn.html` KidsApp.addStars null guard（line 7351）
2. `learn.html` 麥克風 stream 釋放（line 7451 stopAllAudio）
3. `learn.html` YT API 無限重試加 maxRetry=5（line 6768）
4. `learn.html` localStorage parse 包 try/catch（line 3611）
5. `toeic.html` 「忘了」卡片 re-queue 而非移除（line 791）
6. `toeic.html` onvoiceschanged 統一綁定（line 386+1062）
7. `toeic.html` 閃卡背面 3D flip 修復（line 145）
8. `toeic.html` 評分按鈕觸控 ≥44px（line 250）
9. `sw.js` addAll 改逐筆 put（line 75）
10. `index.html` 加 viewport-fit=cover（line 5）

### Sprint 2-5 詳見 PLAN-MOBILE-FIX.md

### 其他待辦（沿用）
- TASK-008 內容包實作（VOA + BBC 素材包）
- 魔王討伐動畫／音效
- 兒童美語題庫擴充（3 份 PDF 整合）

## ⚠️ 注意事項

- 純前端應用，直接以瀏覽器開啟或透過本地伺服器啟動
- 修改 `learn.html` 時保留 ShadowingStudio 生命週期 API（`onModeChange`, `setShadowingLang`, `onTabOpen`, `stopAllAudio`）
- `toeic.html` 是獨立 APP，不引用 common.js，所有修正在該檔案內完成
- 87 個問題的完整行號與修正方案在 `PLAN-MOBILE-FIX.md`

## 🕐 最後更新
- 時間：2026-09-09 22:30
- 更新者：antigravity @ DESKTOP-6ELKIRH
- 內容：完成手機端部署全面審計（87 個問題），產出 5-Sprint 執行計畫 PLAN-MOBILE-FIX.md
- Git push：✅ 已推送到 origin/main

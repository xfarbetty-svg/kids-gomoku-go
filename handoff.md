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

## 🚦 目前狀態

- 專案：純前端 HTML/CSS/JS，無框架、無 build 步驟。
- 主要應用：
  - `index.html`：四關魔王討伐卡片 + 影子跟讀入口 + 星光單字星球入口
  - `learn.html`：影子跟讀 V2（含 Step 5 回音法）、影音精聽室、情境對話、跟讀生字庫、語境記憶閃卡
  - `toeic.html`：星光單字星球（兒童美語 684 + 多益 11,238 字）
  - `sticky-gomoku-new.html`：黏黏圍棋（Gooey 果凍、4 段 AI、AI 教練）
  - `woo_shadow_ch1.html`：綠野仙蹤 Ch.1 影子跟讀（獨立檔案）
- 快取版本：`sw.js` = `kids-games-v36`
- GitHub Pages：https://xfarbetty-svg.github.io/kids-gomoku-go/
- 依賴工具鏈現況（DESKTOP-6ELKIRH）：
  - `yt-dlp`：2026.08.19
  - `ffmpeg`：9.0-full_build（已加入系統 PATH）
  - `whisper`：openai-whisper 20250625 已安裝於 Python 3.10

## ➡️ 尚未做的工作清單（待辦路線圖）

1. **綠野仙蹤後續**：
   - 確認 Ch.1 影子跟讀版品質 → 正式加入 `learn.html` 的 PRESET_VIDEOS
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
- 內容：影子跟讀 Step 5 回音法（Echo Method）+ BBT 經典考駕照片段整合
- Git push：✅ 已推送到 origin/main（823317b）

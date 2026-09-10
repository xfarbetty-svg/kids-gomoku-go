# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；換對話框／收工時**必更新**。本檔只放交接必需的精簡資訊。

## ⏯️ 目前做到哪

1. **綠野仙蹤影子跟讀版第 1 章完成**（commit f26bb8e，已 push）：
   - `woo_shadow_ch1.html`：Read Me A Classic 朗讀版影子跟讀（49 句英中對照）
   - `woo_shadow_ch1.webm`：第 1 章音訊（6MB，yt-dlp 下載）
   - 流程：yt-dlp 下載 → Whisper verbose_json 切字幕 → Gutenberg 原文校正 → 中翻
   - 素材來源：YouTube playlist `PLgQjk-xm2AGXx0mwnIuQiDocH9wssCTeU`（Read Me A Classic 頻道，24 章）
   - ⛔ 已確認 Deep Work Session 頻道（lwAG7bBg4n8）不適合做影子跟讀（節奏斷裂、文本解析感）
   - 狀態：獨立 HTML，尚未整合進 `learn.html`
2. **純聽力試用版**（commit 5ac4484）：
   - `woo_trial_audio.html`：49 句英中字幕，本地音訊，字幕時序不夠精準（已知問題）
3. **平板橫向版面最佳化**（commit a9a1889，已 push）。

## 🚦 目前狀態

- 專案：純前端 HTML/CSS/JS，無框架、無 build 步驟
- 主要應用：
  - `index.html`：四關魔王討伐卡片 + 影子跟讀入口 + 星光單字星球入口
  - `learn.html`：影子跟讀 V2、影音精聽室、情境對話、跟讀生字庫、語境記憶閃卡
  - `toeic.html`：星光單字星球（兒童美語 684 + 多益 11,238 字）
  - `sticky-gomoku-new.html`：黏黏圍棋（Gooey 果凍、4 段 AI、AI 教練）
  - `woo_shadow_ch1.html`：綠野仙蹤 Ch.1 影子跟讀（獨立檔案）
- 快取版本：`sw.js` = `kids-games-v36`（上線優先，改 HTML 不需推版）
- 審計計畫：`PLAN-MOBILE-FIX.md`（87 問題，Sprint 1 ✅，Sprint 2 進行中）
- GitHub Pages：https://xfarbetty-svg.github.io/kids-gomoku-go/

## ➡️ 尚未做的工作清單（待辦路線圖）

1. **綠野仙蹤後續**：
   - 確認 Ch.1 影子跟讀版品質 → 正式加入 `learn.html` 的 PRESET_VIDEOS
   - 製作 Ch.2~24（YouTube playlist 已確認，流程已跑通）
2. **🔴 平板實機驗證**：iPad／Android 平板轉橫向，逐頁確認雙欄與放大效果。
3. **Sprint 2 手機體驗剩餘項**（見 `PLAN-MOBILE-FIX.md`）。
4. **Sprint 3-5**（音訊 PWA、效能資料、收尾測試）。
5. **單字星球優化**：PDF 題庫擴充、閃卡左右翻動效、主題 Pills 修復。
6. **TASK-008 內容包**（VOA + BBC 素材）。
7. **魔王討伐動畫／音效**。

## ⚠️ 注意事項

- 綠野仙蹤素材來源：`youtube.com/playlist?list=PLgQjk-xm2AGXx0mwnIuQiDocH9wssCTeU`（Read Me A Classic，24 章，每集 6~21 分鐘）
- 無 auto-caption，字幕全靠 Whisper 切 + Gutenberg 原文校正。
- 平板斷點慣例：`@media (min-width: 900~960px) and (orientation: landscape)`。
- 修改 `learn.html` 時保留 ShadowingStudio 生命週期 API。
- `toeic.html` 是獨立 APP，不引用 common.js。

## 🕐 最後更新
- 時間：2026-09-10
- 更新者：antigravity @ DESKTOP-6ELKIRH
- 內容：綠野仙蹤第 1 章影子跟讀版（Read Me A Classic 朗讀 + Whisper 字幕 + 中翻）
- Git push：✅ 已推送到 origin/main（f26bb8e）

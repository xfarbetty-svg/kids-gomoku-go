# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；換對話框／收工時**必更新**。本檔只放交接必需的精簡資訊。

## ⏯️ 目前做到哪
黏黏圍棋（sticky-gomoku-new.html）完成手機版面極致優化與 Pass 按鈕常駐體驗升級：
1. **底端控制列固定與視覺強化（Sticky Ctrl Bar）**：`.ctrl-bar` 吸底浮動常駐（`position: sticky; bottom: 6px;`），搭配毛玻璃半透明背景，`⏸️ 放棄下一手 (Pass)` 升級為醒目紫色大按鈕並附帶結算說明。
2. **狀態列快速 Pass 雙入口**：在 `.status-bar` 右側加入快速 `[⏸️ Pass]` 按鈕，上方與底端皆可秒按。
3. **優化手機垂直空間（Single-Screen Viewport Fit）**：頂部導航、教練氣泡、比分板緊湊化排版，移除手勢鎖定改用 `touch-action: manipulation`。
4. **修復 `fitScale()` 自適應縮放**：動態扣除頂部與底部實際高度，寬高雙向精準縮放，並同步設定 `boardOuter` 的 `width` 與 `height`，徹底消除縮放後殘留的空白。
5. **完整保留**：SVG Gooey Metaball 果凍融合、3 段 AI 棋力、🎓 AI 星光教練智慧解說、7x7/9x9/13x13/19x19 四規格、能量技能與爆破音效。

## 🚦 目前狀態
- 專案：星光獵魔團（K-pop 少女獵人主題），純前端 HTML/CSS/JS，無框架、無 build 步驟
- 遊戲清單（依序解鎖）：rhythm 節奏打怪 → memory 封印記憶 → puzzle 獵魔拼圖 → gomoku 獵魔五子棋
- **額外遊戲**：sticky-gomoku-new.html（黏黏圍棋，預設解鎖，獨立於魔王系統）
- **sw.js 已升級至 v16**
- 進度存 localStorage（key `kids_app_v2`），舊版 `kids_app_v1` 會自動搬移

## ➡️ 下一步
1. **實測黏黏圍棋**：手機跑一遍，確認各尺寸縮放、Pass 雙入口按鈕與遊戲流暢度
2. **實測魔王系統**：手機跑一遍，確認鎖定／解鎖／討伐流程正常
3. 魔王討伐動畫／音效（目前只有文字狀態顯示）

## ⚠️ 注意事項
- 純前端，改完直接重新整理即可測試，無需 build
- 快取問題：改共用檔要更新 `?v=` 版本參數（sw.js 已升級至 v16）
- 手機測試建議用 PWA（manifest.json + sw.js 已設定）

## 🕐 最後更新
- 時間：2026-08-29
- 更新者：antigravity @ DESKTOP-6ELKIRH
- 內容：黏黏圍棋手機版面緊湊化、Pass 雙入口常駐可見、fitScale 寬高動態適應與 sw.js v16
- Git push：✅ 已推送到 origin/main

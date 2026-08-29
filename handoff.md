# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；換對話框／收工時**必更新**。本檔只放交接必需的精簡資訊。

## ⏯️ 目前做到哪
黏黏圍棋（sticky-gomoku-new.html）已從五子棋改為圍棋規則，推上 GitHub。

## 🚦 目前狀態
- 專案：星光獵魔團（K-pop 少女獵人主題），純前端 HTML/CSS/JS，無框架、無 build 步驟
- 遊戲清單（依序解鎖）：rhythm 節奏打怪 → memory 封印記憶 → puzzle 獵魔拼圖 → gomoku 獵魔五子棋
- **額外遊戲**：sticky-gomoku-new.html（黏黏圍棋，預設解鎖，獨立於魔王系統）
- **魔王系統已實作並 commit**（commit ad87661）
- **黏黏圍棋已改為圍棋規則並 commit**（commit d21a5a0）
- 進度存 localStorage（key `kids_app_v2`），舊版 `kids_app_v1` 會自動搬移

## ➡️ 下一步
1. **實測黏黏圍棋**：手機跑一遍，確認圍棋規則（提子、算氣、圍地）正常
2. **實測魔王系統**：手機跑一遍，確認鎖定／解鎖／討伐流程正常
3. 魔王討伐動畫／音效（目前只有文字狀態顯示）

## ⚠️ 注意事項
- 純前端，改完直接重新整理即可測試，無需 build
- 共用邏輯在 `common.js`，各遊戲頁面各自 `<script>` 內
- 快取問題：改共用檔要更新 `?v=` 版本參數（common.css / common.js 目前 v=4）
- 手機測試建議用 PWA（manifest.json + sw.js 已設定）
- 黏黏圍棋用 `g.unlocked:true` 跳過魔王解鎖檢查，不影響原四關流程
- 黏黏圍棋規則：9x9 棋盤、提子（無氣即吃）、圍地算分、雙方 pass 結束、禁止自殺

## 🕐 最後更新
- 時間：2026-08-29
- 更新者：opencode @ DESKTOP-6ELKIRH
- 內容：黏黏五子棋改為黏黏圍棋（圍棋規則），更新文件
- Git push：✅ 已推（commit d21a5a0）

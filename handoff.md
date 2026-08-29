# 交接檔（handoff.md）

> any Agent、any computer接手前**必讀**；換對話框／收工時**必更新**。本檔只放交接必需的精簡資訹。

## ⏯️ 目前做到哪

- 新增 `sticky-gomoku-new.html` - 黏黏圍棋（9x9 棋盤，連 4 即獲勝，黏著機制：落在黏著點得 1 能量）
- 新增 `AGENTS.md` - 專案藍圖與進度檢查清單
- 測試黏黏規則：9x9 棋盤、連 4 即贏、黏著點能量機制、AI 三難度、火球術/封印格/冰凍技能
- 驗證原始 `gomoku.html` 保持不變（15x15，連 5 顶）
- 驗證 `sticker-gomoku.html` 為粉色主題變體

## 🚦 目前狀態

- 專案：017_小朋友APP - 兒童 PWA 應用，包含多款遊戲
- **新增檔案**：`sticky-gomoku-new.html`（黏黏版本），`AGENTS.md`（專案藍圖）
- **原有檔案保持不變**：`gomoku.html`、`.common.css`、`.common.js`、`.sw.js` 等
- **測試狀態**：規則已實作（連 4 即贊、黏著機制、技能系統），尚未進行實際人工實測對局
- **成就系統**：`KidsApp` 整合已保留，勝局後會 reportWin('gomoku','⭐')

## ➡️ 下一步

1. **實測 sticker-gomoku-new.html**：雙擊檔案或拖曳進瀏覽器，確認遊戲流程、黏著機制、AI 表現
2. **修正任何 Bug**：如有畫面卡住、無法下棋、規則不符等問題
3. **Git commit + push**：提交新增的 `sticky-gomoku-new.html` 與 `AGENTS.md` 變更
4. **檢視 L3 Obsidian**：如有 Obsidian vault，補錄 `專案工作流程.md` 詳細紀錄

## ⚠️ 注意事項

- 本專案純前端 HTML/CSS/JS，無框架、無 build 步驟
- 改完直接重新整理即可測試
- 共用邏輯在 `common.js`，各遊戲頁面各自 `<script>` 內
- 快取問題：改共用檔要更新 `?v=` 版本參數（common.css / common.js 目前 v=4）
- 手機測試建議用 PWA（manifest.json + sw.js 已設定）
- `sticky-gomoku-new.html` 規則與原 `gomoku.html` 獨立，互不影響（雙方都可以同時存在）

## 🕐 最後更新

- **時間**：2026-08-29
- **更新者**：Agent @ DESKTOP-XXXXXXXX
- **Git push 狀態**：待推送（請執行 `git add`、`git commit`、`git push`）
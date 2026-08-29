# 017_小朋友APP - 專案藍圖

## 📋 路線圖檢查清單

- [x] 魔王討伐系統：四關遊戲（節奏打怪→封印記憶→獵魔拼圖→獵魔五子棋）各有魔王 HP，通關自動解鎖下一關，首關預設解鎖
- [ ] 實測魔王系統：手機跑一遍，確認鎖定／解鎖／討伐流程
- [ ] 魔王討伐動畫／音效（目前只有文字狀態顯示）
- [ ] 測試黏黏五子棋（sticky-gomoku-new.html）遊戲功能（連線、黏著機制、AI、技能）

## 📁 資料夾結構

**魔王系統（commit ad87661）：**
- `common.js`：魔王系統核心（STAGES、defeated／unlocked、isUnlocked()／isBossDefeated()、通關自動解鎖、舊存檔自動補解鎖）
- `index.html`：首頁卡片顯示魔王資訊（👿 魔王＋HP／✅ 已討伐）、未解鎖關卡顯示 🔒 鎖定
- `rhythm.html`／`memory.html`／`puzzle.html`／`gomoku.html`：各關魔王血量與討伐邏輯
- `sw.js`：版本更新

**未追蹤檔案（待確認）：**
- `sticky-gomoku-new.html`（黏黏版本，9x9，連 4 即贏）

## ⚠️ 待完成事項

- [ ] 實測魔王系統（手機測試）
- [ ] 測試黏黏五子棋遊戲功能
- [ ] 魔王討伐動畫／音效

## 🕐 最後更新

- **日期**：2026-08-29
- **更新者**：opencode @ DESKTOP-6ELKIRH
- **Git push 狀態**：待推
# 🎾 雙 Agent 接力拋接協定 (Relay Protocol)

本專案採用 **Antigravity（架構師 / 覆核主管）** 與 **OpenCode（實作工程師）** 的雙 Agent 協作模式。

## 狀態機流轉 (State Machine)
- `SPEC_READY`：Antigravity 已撰寫好規格任務書，等待 OpenCode 接球實作。
- `IN_PROGRESS`：OpenCode 正在實作編程。
- `CODE_DONE`：OpenCode 完成代碼修改，等待 Antigravity 覆核。
- `REVIEWING`：Antigravity 正在進行語法檢驗、邏輯測試與美學覆核。
- `REVIEWED_PASSED`：覆核 100% 通過，任務結案歸檔。
- `CHANGES_REQUESTED`：覆核未通過，Antigravity 標註需修正點，退回 OpenCode。

## 雙方權責劃分
- **Antigravity**：
  1. 需求探索與 OpenSpec 規格定義
  2. 撰寫具體行號、資料結構與代碼範例的 `OPENCODE_TASK_*.md`
  3. 驗收 OpenCode 產出的代碼（Node.js 語法檢查、Git Diff 審查、演算法修正）
  4. 美術與排版打磨（Ruby 標音、CSS 調整、PWA 快取版本更新）
- **OpenCode**：
  1. 讀取 `OPENCODE_TASK_*.md`
  2. 執行大量代碼寫入、字庫擴充、函式替換
  3. 完成後將 `RELAY_STATUS.json` 中的 status 改為 `CODE_DONE`

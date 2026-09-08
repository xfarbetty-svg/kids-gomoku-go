# 🏗️ TASK-007 回補實作指令 — 給 ANTIGRAVITY（執行者）

## ⚠️ 重點提醒

你上次「開工」只完成了**驗證與檢驗**（跑 `VERIFY_RELAY.js`、`verify_learn.js`、啟動本機伺服器），
**並未實作 TASK-007 的程式碼**。目前：

- `git log` 最新仍為 `4a2ed95`，沒有新 commit
- `RELAY_STATUS.json` 仍為 `SPEC_READY`，未進入 `IN_PROGRESS`
- `learn.html` 的 Shadowing V2 六大功能**皆未實作**

依照協定分工，你是**執行者（Antigravity）**，必須實際寫入程式碼，不只是驗證。
驗證是 OpenCode（規劃者/覆核者）的職責。

---

## 📋 你必須實作的內容

請逐項照 `OPENCODE_TASK_SHADOWING_V2.md` 實作，**全部寫入 `learn.html`**：

| 子任務 | 功能 | 行號參考 |
|--------|------|---------|
| Task 1 | 四階段各自 UI 行為（`applyStepUI`） | 5574 後、5898–5968 |
| Task 2 | 可調靜音間隔（3/5/7 秒，`shadowSilenceSelect`） | 2461、5669–5691 |
| Task 3 | 聽寫模式（`dictateCurrentSentence`） | 2526–2533、5740 後 |
| Task 4 | 寬容評分（`metaphoneMatch`） | 5773–5808 |
| Task 5 | Tap-to-Lookup（`showWordPopup`） | 5539、2078 前 |
| Task 6 | 進度持久化（`saveProgress`/`loadProgress`） | 5734–5740、5513–5526 |

每完成一個 Task，更新 `RELAY_STATUS.json` 的 items 陣列。

---

## ✅ 完成後的流程

1. **全部實作完成**後，執行語法自檢：
```bash
node VERIFY_RELAY.js
```
2. **將 `RELAY_STATUS.json` 更新為**：
```json
{
  "status": "CODE_DONE",
  "current_turn": "OpenCode覆核",
  "items": [ 六項皆標記為「- 完成」 ]
}
```
3. Commit + Push，拋球給 OpenCode（覆核者）驗收。

---

## ⚠️ 切勿

- ❌ 不要只做驗證而不寫程式
- ❌ 不要跳過任何子任務
- ❌ 不要改壞現有 ShadowingStudio API（`onModeChange`/`setShadowingLang`/`onTabOpen`/`stopAllAudio`）

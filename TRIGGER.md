# 🚦 Agent 啟動行為指引（Trigger Guide）

每位 Agent 啟動時，**第一件事**讀取本檔案 + `RELAY_STATUS.json` + `RELAY_QUEUE.json`，根據狀態自動決定下一步。

---

## OpenCode 啟動流程

```
1. 讀取 RELAY_STATUS.json → 取得 status
2. 讀取 RELAY_QUEUE.json → 取得 current_task

3. 若 status = "SPEC_READY"
   → 讀取 current_task.spec（如 OPENCODE_TASK_SHADOWING_V2.md）
   → 理解所有子任務的行號、改動、驗收標準
   → 更新 RELAY_STATUS.json { "status": "IN_PROGRESS", "current_turn": "OpenCode" }
   → 開始逐個執行子任務
   → 每完成一個子任務：更新 RELAY_STATUS.json items 陣列
   → 全部完成後：執行 node VERIFY_RELAY.js
   → 通過後：更新 RELAY_STATUS.json { "status": "CODE_DONE" }

4. 若 status = "CHANGES_REQUESTED"
   → 讀取 RELAY_STATUS.json 中的 changes 陣列
   → 更新 RELAY_STATUS.json { "status": "IN_PROGRESS", "current_turn": "OpenCode" }
   → 逐項修正
   → 修正完成後：執行 node VERIFY_RELAY.js
   → 通過後：更新 RELAY_STATUS.json { "status": "CODE_DONE" }

5. 若 status = "CODE_DONE" 或 "REVIEWING"
   → Antigravity 正在覆核中，請等待或協助檢查

6. 若 status = "REVIEWED_PASSED"
   → 當前任務已結案
   → 檢查 RELAY_QUEUE.json 是否有下一個 pending 任務
   → 若有：更新 current_task，開始新任務
   → 若無：工作完成，提示使用者
```

---

## Antigravity 啟動流程

```
1. 讀取 RELAY_STATUS.json → 取得 status
2. 讀取 RELAY_QUEUE.json → 取得 current_task

3. 若 status = "CODE_DONE"
   → 讀取 current_task.spec 的驗收清單
   → 更新 RELAY_STATUS.json { "status": "REVIEWING", "current_turn": "Antigravity" }
   → 執行 node VERIFY_RELAY.js
   → 檢查 Git Diff（git diff learn.html）
   → 美學覆核（CSS、排版、互動流暢度）
   → 若全部通過：更新 RELAY_STATUS.json { "status": "REVIEWED_PASSED" }
   → 若需修正：更新 RELAY_STATUS.json { "status": "CHANGES_REQUESTED", "changes": [...] }

4. 若 status = "IN_PROGRESS"
   → OpenCode 正在實作中，請等待

5. 若 status = "REVIEWED_PASSED"
   → 更新 RELAY_QUEUE.json：當前任務 completed
   → 找到下一個 pending 任務
   → 撰寫新任務的 OPENCODE_TASK_*.md
   → 更新 RELAY_STATUS.json 為新任務的 SPEC_READY

6. 若 status = "SPEC_READY"
   → 新任務已準備好，等待 OpenCode 接球
```

---

## 狀態碼速查

| status | 意義 | OpenCode 動作 | Antigravity 動作 |
|--------|------|--------------|-----------------|
| `SPEC_READY` | 任務已寫好等接 | 開始執行 | 等待 |
| `IN_PROGRESS` | 實作中 | 繼續執行 | 等待 |
| `CODE_DONE` | 代碼完成等覆核 | 等待 | 開始覆核 |
| `REVIEWING` | 覆核中 | 等待 | 繼續覆核 |
| `REVIEWED_PASSED` | 通過結案 | 檢查下一個任務 | 準備下一個任務 |
| `CHANGES_REQUESTED` | 需修正 | 修正中 | 等待修正 |

---

## 更新 RELAY_STATUS.json 範例

```json
{
  "project": "017_小朋友APP - 雙語探險學院",
  "round": 7,
  "status": "IN_PROGRESS",
  "current_turn": "OpenCode",
  "task_id": "TASK-007",
  "task_name": "Shadowing V2 — 強化四階段行為 + 可調間隔 + 聽寫模式 + 寬容評分 + Tap-to-Lookup + 進度持久化",
  "spec_file": "OPENCODE_TASK_SHADOWING_V2.md",
  "target_files": ["learn.html"],
  "items": [],
  "changes": [],
  "last_updated": "2026-09-09T00:00:00+08:00"
}
```

---

## 更新 RELAY_QUEUE.json 範例

任務完成後，將 current_task 移入 completed，並設定下一個 pending 任務為 current_task：
```json
{
  "current_task": {
    "id": "TASK-008",
    "spec": "OPENCODE_TASK_CONTENT_PACK.md",
    "status": "pending",
    "assigned_to": "OpenCode"
  },
  "queue": [
    { "id": "TASK-008", "status": "in_progress" }
  ]
}
```

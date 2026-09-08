# 🎾 雙 Agent 接力拋接協定 v2（Relay Protocol）

本專案採用 **Antigravity（架構師 / 覆核主管）** 與 **OpenCode（實作工程師）** 的雙 Agent 協作模式。

---

## 一、狀態機流轉（State Machine）

```
SPEC_READY ──→ IN_PROGRESS ──→ CODE_DONE ──→ REVIEWING ──→ REVIEWED_PASSED
                    ↑                                │
                    └──── CHANGES_REQUESTED ─────────┘
```

| 狀態 | 誰負責 | 觸發條件 | 完成後動作 |
|------|--------|---------|-----------|
| `SPEC_READY` | OpenCode 待接 | Antigravity 寫完 `OPENCODE_TASK_*.md` 並更新 `RELAY_QUEUE.json` | OpenCode 啟動時自動讀取任務 |
| `IN_PROGRESS` | OpenCode 執行中 | OpenCode 開始改代碼 | 完成後寫入 `CODE_DONE` |
| `CODE_DONE` | OpenCode → Antigravity | OpenCode 完成所有子任務並通過語法自檢 | Antigravity 啟動時自動進入覆核 |
| `REVIEWING` | Antigravity 執行中 | Antigravity 開始語法檢驗 + 美學覆核 | 覆核完成後寫入 `PASS` 或 `CHANGES_REQUESTED` |
| `REVIEWED_PASSED` | 任務結案 | 100% 驗證通過 | 自動從 `RELAY_QUEUE.json` 拉取下一個 `pending` 任務 |
| `CHANGES_REQUESTED` | OpenCode 修正 | Antigravity 標註需修正點 | OpenCode 讀取修正清單後重新進入 `IN_PROGRESS` |

---

## 二、自動觸發規則

### 核心原則
每次狀態變更時，**必須更新 `RELAY_STATUS.json`**。下一位 Agent 啟動時讀取此檔案，自動判斷該做什麼。

### 觸發流程

```
Agent 啟動
  │
  ├─ 讀取 RELAY_STATUS.json
  │
  ├─ 若 status = "SPEC_READY"
  │     → 讀取 RELAY_QUEUE.json 找到第一個 pending 任務
  │     → 讀取對應 spec 檔案
  │     → 更新 status = "IN_PROGRESS"
  │     → 開始執行
  │
  ├─ 若 status = "CODE_DONE"
  │     → 讀取 spec 檔案中的驗收清單
  │     → 更新 status = "REVIEWING"
  │     → 執行 VERIFY_RELAY.js + 美學覆核
  │     → 更新 status = "REVIEWED_PASSED" 或 "CHANGES_REQUESTED"
  │
  ├─ 若 status = "CHANGES_REQUESTED"
  │     → 讀取 RELAY_STATUS.json 中的 changes 陣列
  │     → 更新 status = "IN_PROGRESS"
  │     → 修正後重新提交
  │
  └─ 若 status = "REVIEWED_PASSED"
        → 更新 RELAY_QUEUE.json：當前任務標記 completed
        → 找到下一個 pending 任務
        → 更新 RELAY_STATUS.json 為下一個任務的 SPEC_READY
```

---

## 三、雙方權責劃分

### Antigravity（架構師 / 覆核主管）
1. 需求探索與 OpenSpec 規格定義
2. 撰寫具體行號、資料結構與代碼範例的 `OPENCODE_TASK_*.md`
3. 驗收 OpenCode 產出的代碼（`VERIFY_RELAY.js` + Node.js 語法檢查 + Git Diff 審查）
4. 美術與排版打磨（Ruby 標音、CSS 調整、PWA 快取版本更新）
5. 管理 `RELAY_QUEUE.json`（新增任務、調整優先度）

### OpenCode（實作工程師）
1. 讀取 `RELAY_QUEUE.json` 中的下一個 pending 任務
2. 讀取對應 `OPENCODE_TASK_*.md` 的完整規格
3. 執行大量代碼寫入、字庫擴充、函式替換
4. 完成後執行 `node VERIFY_RELAY.js` 自檢
5. 更新 `RELAY_STATUS.json` 狀態為 `CODE_DONE`

---

## 四、檔案互動規範

### 必須讀取的檔案
| 檔案 | 用途 | 誰讀 |
|------|------|------|
| `RELAY_STATUS.json` | 當前任務狀態 | 雙方啟動時 |
| `RELAY_QUEUE.json` | 任務佇列 | 雙方啟動時 |
| `OPENCODE_TASK_*.md` | 具體任務規格 | OpenCode 執行時 |
| `VERIFY_RELAY.js` | 自動化驗證 | 雙方驗收時 |
| `TRIGGER.md` | 啟動行為指引 | 雙方啟動時 |

### 必須更新的檔案
| 檔案 | 更新時機 | 更新者 |
|------|---------|--------|
| `RELAY_STATUS.json` | 每次狀態變更 | 當前執行者 |
| `RELAY_QUEUE.json` | 任務完成/新增時 | Antigravity |
| `RELAY_TASK.md` | 任務完成後補執行結果 | 執行者 |
| `AGENTS.md` | 重要里程碑完成後 | Antigravity |

---

## 五、任務佇列管理（RELAY_QUEUE.json）

- 任務按 `priority` 排序：`high` > `medium` > `low`
- 每次只執行一個 `in_progress` 任務（避免衝突）
- `auto_trigger: true` 時，任務結案自動拉取下一個
- 新增任務由 Antigravity 操作，OpenCode 只讀取

---

## 六、衝突預防

- 任何 Agent 不得同時修改同一檔案
- OpenCode 只改 `learn.html`、`common.js`、`sw.js`
- Antigravity 只改 `*.md`、`*.json`、`VERIFY_RELAY.js`、`common.css`
- 若需交叉修改，必須在 spec 中明確標註

---

## 七、緊急回退

若 `CODE_DONE` 後發現嚴重問題：
1. Antigravity 標記 `CHANGES_REQUESTED` 並附修正清單
2. OpenCode 修正後重新提交
3. 若需回退代碼，使用 `git revert` 並更新 `RELAY_STATUS.json`

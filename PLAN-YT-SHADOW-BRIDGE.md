# 規劃：影音精聽室 → 影子跟讀 橋接方案

## 一句話
用戶在影音精聽室貼 YouTube 網址 → 字幕自動同步到影子跟讀 → 直接開始跟讀練習。

---

## 現狀分析

| | 影音精聽室 | 影子跟讀 |
|--|-----------|---------|
| 資料源 | `PRESET_VIDEOS`（寫死 4 部） | `SHADOWING_DATA`（寫死故事） |
| 句子格式 | `{ start, end, orig, zh }` | `{ text, phonetic, zh, pauseHint, ruby?, audio? }` |
| 音源 | YouTube 原音 | TTS / 真人音檔 |
| 持久化 | **無**（URL 載入是暫時的） | localStorage 只存進度 |
| 互通 | **完全獨立** | **完全獨立** |

---

## 架構設計

### 核心概念
```
影音精聽室 = 素材準備區（URL → 字幕 → 預覽）
影子跟讀   = 練習區（同一份素材 → 聽 + 說 + 錄音對照）
```

### 資料流
```
用戶貼 URL
  ↓
精聽室：抓字幕（手動或自動）
  ↓
顯示逐句對照（可編輯）
  ↓
用戶按「📤 送到影子跟讀」
  ↓
存入 localStorage（userShadowVideos）
  ↓
影子跟讀：下拉選單顯示「🎬 用戶影片」分類
  ↓
載入後，用 YouTube iframe 做逐句播放 + 錄音對照
```

---

## 實作任務

### Task 1：統一句子資料格式

建立橋接用的標準格式，兼容兩邊：

```js
// 聽聽室 → 影子跟讀 的轉換格式
{
  id: 'yt-' + videoId,
  title: '🎬 ' + 影片標題,
  titleZh: desc || '',
  source: 'youtube',           // 標記來源
  videoId: videoId,            // YouTube video ID
  lang: 'en' | 'ja',
  sentences: [
    {
      text: orig,              // 原文（= 聽聽室的 orig）
      phonetic: '',            // 可留空，後續可自動生成
      zh: zh,                  // 翻譯（= 聽聽室的 zh）
      pauseHint: '',           // 可留空
      start: 0,                // 時間戳（= 聽聽室的 start）
      end: 4                   // 時間戳（= 聽聽室的 end）
    }
  ]
}
```

### Task 2：精聽室 — 持久化 + 送出按鈕

**2a. localStorage 持久化**
- key: `user_shadow_videos`
- 用戶貼 URL 載入影片時，自動存入（包含 videoId、標題、字幕）
- 精聽室打開時，顯示「📁 我的影片」區塊，可切回之前載入過的影片

**2b. 「📤 送到影子跟讀」按鈕**
- 位置：字幕面板上方，與「🔂 單句循環」「🙈 遮蔽翻譯」同一列
- 點擊後：
  1. 將目前影片的字幕轉成 Task 1 的格式
  2. 存入 `localStorage.user_shadow_videos`
  3. 顯示 toast「✅ 已送到影子跟讀！切換到跟讀分頁即可開始練習」
  4. （可選）自動切到影子跟讀 tab

**2c. 可編輯字幕**
- 每句字幕的 `orig` 和 `zh` 支援雙擊編輯
- 編輯後的內容才是送出到影子跟讀的版本

### Task 3：影子跟讀 — 載入用戶影片

**3a. 故事下拉選單擴充**
- `populateStorySelect()` 改為先顯示內建故事，再分隔線後顯示用戶影片
- 用戶影片從 `localStorage.user_shadow_videos` 讀取
- 分類標題：「── 🎬 我的 YouTube 影片 ──」

**3b. YouTube 逐句播放模式**
- 當 `story.source === 'youtube'` 時，切換音源策略：
  - 不用 TTS
  - 在影子跟讀區域嵌入一個小型 YouTube iframe
  - 播放某句時：`player.seekTo(start, true)` → `playVideo()` → 到 end 時暫停
  - 用 `YT.PlayerState.ENDED` 或 polling `getCurrentTime()` 偵測句尾

**3c. 錄音對照**
- 保持現有 MediaRecorder 錄音功能不變
- 錄音播放時，對照的是 YouTube 原音（而非 TTS）

### Task 4：進度追蹤

- 用戶影片的進度也存入 localStorage，key 格式同現有：
  `shadow_progress_{lang}_{storyId}`
- storyId 用 `'yt-' + videoId`

---

## 檔案改動範圍

| 檔案 | 改動 |
|------|------|
| `learn.html` | 主要改動檔（YTPlayerSys、ShadowingStudio、UI 模組） |

### 具體改動位置

| 區塊 | 行號（約） | 改動 |
|------|-----------|------|
| `PRESET_VIDEOS` | 3092-3151 | 不動 |
| `AppState` | 3156-3200 | 新增 `userVideos` 陣列 + `saveUserVideos()` / `loadUserVideos()` |
| `YTPlayerSys` | 3903-4110 | 新增 `getCurrentVideoSnapshot()`（取目前影片+字幕快照）、`saveToUserVideos()`、字幕雙擊編輯 |
| 字幕面板 HTML | 2328-2348 | 新增「📤 送到影子跟讀」按鈕 |
| `ShadowingStudio` | 5708-6635 | 改 `populateStorySelect()`、改 `getCurrentStory()` 支援用戶影片、新增 YouTube iframe 播放邏輯 |
| `speakSentence()` | 6102-6161 | 新增 `source === 'youtube'` 分支，用 iframe seekTo 播放 |

---

## 用戶流程（前後對比）

### Before（現狀）
```
精聽室貼 URL → 看字幕 → 結束（沒了）
影子跟讀 → 只能選內建故事
```

### After（目標）
```
精聽室貼 URL → 看字幕 → 點「送到影子跟讀」
影子跟讀 → 下拉選單多出「🎬 我的 YouTube 影片」→ 選它 → 開始跟讀
```

---

## 注意事項

- 純前端，無 build 步驟
- YouTube iframe API 有限制：頁面只能有一個 player（目前精聽室已佔用）
  - 解法：精聽室送出後，影子跟讀複用同一個 player，或在切 tab 時 destroy/recreate
- 用戶字幕編輯是 nice-to-have，可先不做，第一版先用手動貼上的原始字幕
- 真人音檔（handoff.md 中的日文老師 m4a）整合是獨立任務，不影響本次橋接

---

## 預估工作量

| Task | 複雜度 | 備註 |
|------|--------|------|
| Task 1 統一格式 | 低 | 純資料結構 |
| Task 2 持久化+送出 | 中 | 涉及 localStorage + UI |
| Task 3 影子跟讀載入+YouTube播放 | 高 | iframe 控制最複雜 |
| Task 4 進度追蹤 | 低 | 復用現有機制 |

預估改動行數：~200-300 行 JS + ~30 行 HTML

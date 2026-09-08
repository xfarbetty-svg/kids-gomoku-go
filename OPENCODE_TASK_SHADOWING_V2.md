# 🎙️ Shadowing V2 任務書 — 強化四階段行為 + 六大功能升級

## 一、 問題診斷

目前 `ShadowingStudio`（`learn.html` 行 5465–5991）存在以下不足：

1. **四階段 tab 只切換 UI 可見度**：`currentStep`（行 5468）只影響 `zhHidden`，Step 1~4 的實際行為幾乎相同
2. **auto-flow 固定 4 秒**：行 5669–5691 的倒數計時無法調整，初學者來不及、進階者太慢
3. **只有跟讀模式**：沒有聽寫（dictation）練習選項
4. **評分過於嚴格**：行 5773–5808 的 Levenshtein 精確匹配，微小發音差異就被扣分
5. **無單字查詢**：行 5539 直接 `innerHTML = s.ruby`，沒有可點擊的單字互動
6. **無進度儲存**：重新整理後練習進度歸零

---

## 二、 六大子任務

---

### Task 1：強化四階段各自 UI 行為

**目標**：每個 step 有獨立的 UI 行為，不再只是隱藏/顯示中文。

#### Step 1 👂 純聽磨耳朵（Blind Listen）
- 隱藏 focus card 全部文字（`#shadowFocusRuby`、`#shadowFocusRomaji`、`#shadowFocusZh`、`#shadowFocusHint` 全部 `style.display = 'none'`）
- 只顯示聲波動畫（`#shadowWaveBox` 保持可見）
- 顯示播放按鈕（`#shadowPlayBtn`），隱藏錄音按鈕（`#shadowRecordBtn`）
- banner 顯示：「🎧 專心聽，感受語調與節奏」
- AB dock 隱藏

#### Step 2 📖 理解精讀（Text & Meaning）
- 顯示所有文字（Ruby、音標、中文、發音提示）
- 眼睛按鈕強制開啟（不可隱藏中文）
- 隱藏錄音按鈕，只顯示播放按鈕
- banner 顯示：「📖 仔細閱讀，理解每句含義」
- AB dock 隱藏

#### Step 3 📑 視讀同步跟讀（Karaoke Sync）
- 顯示英文文字 + 音標，隱藏中文（眼按鈕可偷看）
- 顯示播放按鈕 + 錄音按鈕
- 播放時逐字高亮同步（karaoke 效果）
- banner 顯示：「📑 看著文字，跟著節奏朗讀」
- AB dock 顯示（錄音完成後）

#### Step 4 🎙️ 脫稿影子跟讀（True Shadowing）
- 文字半透明（`opacity: 0.2`），使用者可選擇完全隱藏（眼按鈕切換 0/0.2/1）
- 顯示播放按鈕 + 錄音按鈕
- 錄音前顯示 3 秒倒數（現有 `#shadowCountdown` overlay）
- banner 顯示：「🎙️ 放開文字，像影子一樣跟隨！」
- AB dock 顯示（錄音完成後）

#### 修改位置

**`renderFocusSentence()`（行 5528–5574）**：
在函式末尾加入 step-based UI 調整邏輯：

```javascript
// 行 5574 後插入
function applyStepUI() {
  const ruby = document.getElementById('shadowFocusRuby');
  const romaji = document.getElementById('shadowFocusRomaji');
  const zh = document.getElementById('shadowFocusZh');
  const hint = document.getElementById('shadowFocusHint');
  const wave = document.getElementById('shadowWaveBox');
  const recordBtn = document.getElementById('shadowRecordBtn');
  const abDock = document.getElementById('shadowAbDock');
  const badge = document.getElementById('shadowSentenceRoleBadge');

  // 預設全部顯示
  [ruby, romaji, zh, hint].forEach(el => { if (el) el.style.display = ''; });
  if (wave) wave.style.display = '';
  if (recordBtn) recordBtn.style.display = '';
  if (abDock) abDock.style.display = '';
  if (badge) badge.style.display = '';

  if (currentStep === 1) {
    // 純聽：隱藏所有文字，只留聲波
    [ruby, romaji, zh, hint, badge].forEach(el => { if (el) el.style.display = 'none'; });
    if (recordBtn) recordBtn.style.display = 'none';
    if (abDock) abDock.style.display = 'none';
    setBanner('🎧 專心聽，感受語調與節奏', '#1e3a5f', '#a5d8ff');
  } else if (currentStep === 2) {
    // 精讀：全顯示，強制開中文
    zhHidden = false;
    if (zh) zh.style.display = '';
    if (document.getElementById('shadowToggleEye')) {
      document.getElementById('shadowToggleEye').textContent = '🙈';
    }
    if (recordBtn) recordBtn.style.display = 'none';
    if (abDock) abDock.style.display = 'none';
    setBanner('📖 仔細閱讀，理解每句含義', '#2d5016', '#b2f2bb');
  } else if (currentStep === 3) {
    // 視讀跟讀：隱藏中文，可偷看
    if (zh) zh.style.display = zhHidden ? 'none' : '';
    setBanner('📑 看著文字，跟著節奏朗讀', '#5f3a1e', '#ffd8a8');
  } else if (currentStep === 4) {
    // 脫稿影子：半透明或隱藏
    if (ruby) ruby.style.opacity = '0.2';
    if (romaji) romaji.style.opacity = '0.2';
    if (zh) zh.style.display = 'none';
    if (hint) hint.style.display = 'none';
    setBanner('🎙️ 放開文字，像影子一樣跟隨！', '#5f1e3a', '#fcc2d7');
  }
}
```

**Step tab 點擊事件**（在 `bindEvents()` 行 5898–5968 內）：

找到現有的 step tab 點擊邏輯，補上 `applyStepUI()` 呼叫：

```javascript
// 在 step tab 點擊事件的末尾加入
applyStepUI();
```

---

### Task 2：可調靜音間隔（Silence Multiplier）

**目標**：auto-flow 的句間等待時間可由使用者調整。

#### 新增 HTML（行 2461 附近，在 auto-flow 按鈕旁）

```html
<select id="shadowSilenceSelect" class="shadow-silence-select" style="background:rgba(255,255,255,0.08);color:#ccc;border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:4px 8px;font-size:0.8rem;">
  <option value="3">⏱️ 3秒（進階）</option>
  <option value="5" selected>⏱️ 5秒（中級）</option>
  <option value="7">⏱️ 7秒（初學）</option>
</select>
```

#### 修改 JS（行 5669–5691 的 `startAutoFlowCountdown()`）

改前：
```javascript
function startAutoFlowCountdown() {
  let countdown = 4;
  // ... (倒數 4 秒)
}
```

改後：
```javascript
function startAutoFlowCountdown() {
  const silenceSelect = document.getElementById('shadowSilenceSelect');
  let countdown = silenceSelect ? parseInt(sailenceSelect.value) || 5 : 5;
  const countdownEl = document.getElementById('shadowCountdown');
  if (countdownEl) {
    countdownEl.style.display = 'flex';
    countdownEl.innerHTML = `<span style="font-size:3rem;font-weight:bold;">${countdown}</span>`;
  }
  const interval = setInterval(() => {
    countdown--;
    if (countdownEl) countdownEl.innerHTML = `<span style="font-size:3rem;font-weight:bold;">${countdown}</span>`;
    if (countdown <= 0) {
      clearInterval(interval);
      if (countdownEl) countdownEl.style.display = 'none';
      nextSentence();
      playCurrentSentence();
    }
  }, 1000);
  autoFlowTimer = interval;
}
```

#### 新增 CSS（在行 2078 前）

```css
.shadow-silence-select { cursor: pointer; }
.shadow-silence-select option { background: #1e293b; color: #ccc; }
```

---

### Task 3：聽寫模式（Dictation Mode）

**目標**：在 Step 3/4 新增「聽寫」切換，播放後隱藏文字，使用者打字輸入。

#### 新增 HTML（行 2526–2533 的 control dock 內，播放按鈕旁）

```html
<button id="shadowDictateBtn" class="shadow-ctrl-btn" style="display:none;" title="切換聽寫模式">📝 聽寫</button>
```

#### 新增 JS 函式（行 5740 後插入）

```javascript
let dictateMode = false;

function toggleDictateMode() {
  dictateMode = !dictateMode;
  const dictateBtn = document.getElementById('shadowDictateBtn');
  const playBtn = document.getElementById('shadowPlayBtn');
  const recordBtn = document.getElementById('shadowRecordBtn');
  if (dictateBtn) dictateBtn.style.background = dictateMode ? 'rgba(59,130,246,0.4)' : '';
  if (recordBtn) recordBtn.style.display = dictateMode ? 'none' : '';
  if (playBtn) playBtn.style.display = '';
}

function dictateCurrentSentence() {
  const story = getCurrentStory();
  if (!story) return;
  const s = story.sentences[currentSentenceIdx];
  if (!s) return;

  // 播放原音
  speakSentence(s.text, () => {
    // 播放完後隱藏文字，顯示輸入框
    const ruby = document.getElementById('shadowFocusRuby');
    const romaji = document.getElementById('shadowFocusRomaji');
    if (ruby) ruby.style.display = 'none';
    if (romaji) romaji.style.display = 'none';

    // 動態生成輸入框
    let inputArea = document.getElementById('shadowDictateInput');
    if (!inputArea) {
      inputArea = document.createElement('div');
      inputArea.id = 'shadowDictateInput';
      inputArea.style.cssText = 'margin:12px 0;text-align:center;';
      inputArea.innerHTML = `
        <input id="shadowDictateText" type="text" placeholder="輸入你聽到的句子..."
          style="width:90%;max-width:500px;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#fff;font-size:1rem;text-align:center;" />
        <button id="shadowDictateSubmit" class="shadow-ctrl-btn" style="margin-top:8px;background:rgba(59,130,246,0.3);">確認</button>
      `;
      document.getElementById('shadowFocusCard').appendChild(inputArea);
    }
    inputArea.style.display = 'block';

    // 綁定確認事件
    document.getElementById('shadowDictateSubmit').onclick = () => {
      const userText = document.getElementById('shadowDictateText').value.trim();
      if (!userText) return;
      const pct = calculateShadowingAccuracy(userText, s.text);
      showFeedback(pct, '📝 聽寫');
      // 恢復文字顯示
      if (ruby) { ruby.style.display = ''; ruby.style.opacity = ''; }
      if (romaji) { romaji.style.display = ''; romaji.style.opacity = ''; }
      inputArea.style.display = 'none';
      document.getElementById('shadowDictateText').value = '';
    };
  });
}
```

#### 在 bindEvents() 綁定按鈕

```javascript
document.getElementById('shadowDictateBtn')?.addEventListener('click', toggleDictateMode);
```

#### 在 applyStepUI() 中控制顯示

Step 3 和 Step 4 時顯示聽寫按鈕：
```javascript
const dictateBtn = document.getElementById('shadowDictateBtn');
if (dictateBtn) dictateBtn.style.display = (currentStep === 3 || currentStep === 4) ? '' : 'none';
```

---

### Task 4：寬容評分（Metaphone 模糊匹配）

**目標**：雙評分制，取較高分為最終分，避免微小發音差異過度扣分。

#### 修改位置：`calculateShadowingAccuracy()`（行 5773–5808）

改後完整函式：

```javascript
function calculateShadowingAccuracy(recognized, target) {
  // 1. Levenshtein 精確分
  const lev = levenshtein(recognized.toLowerCase(), target.toLowerCase());
  const maxLen = Math.max(recognized.length, target.length);
  const levPct = maxLen > 0 ? Math.round(((maxLen - lev) / maxLen) * 100) : 0;

  // 2. Metaphone 模糊分（輔助字母匹配）
  const metaphonePct = metaphoneMatch(recognized, target);

  // 3. 取兩者較高分
  return Math.max(levPct, metaphonePct);
}

// 新增輔助函式
function metaphoneMatch(a, b) {
  // 簡化版 Metaphone：提取母音骨架比較
  function extractVowels(s) {
    return s.toLowerCase().replace(/[^aeiou]/g, '');
  }
  function extractConsonants(s) {
    return s.toLowerCase().replace(/[aeiou\s]/g, '');
  }
  const va = extractVowels(a), vb = extractVowels(b);
  const ca = extractConsonants(a), cb = extractConsonants(b);
  const vPct = va && vb ? Math.round(((Math.min(va.length, vb.length) / Math.max(va.length, vb.length)) * 100) * 0.6) : 0;
  const cPct = ca && cb ? Math.round(((Math.min(ca.length, cb.length) / Math.max(ca.length, cb.length)) * 100) * 0.4) : 0;
  return vPct + cPct;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}
```

**注意**：若現有 `levenshtein()` 函式已存在（行 5773 前），則只新增 `metaphoneMatch()` 並修改 `calculateShadowingAccuracy()` 即可。

---

### Task 5：Tap-to-Lookup（點擊單字查詢）

**目標**：句子文字拆成可點擊單字，點擊後彈出查詢泡泡。

#### 修改位置：`renderFocusSentence()`（行 5528–5574）

改前（行 5539）：
```javascript
$('shadowFocusRuby').innerHTML = s.ruby || s.text;
```

改後：
```javascript
// 將句子拆成可點擊的單字 span
function renderClickableWords(text, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const words = text.split(/(\s+)/);
  words.forEach(word => {
    if (word.match(/^\s+$/)) {
      container.appendChild(document.createTextNode(' '));
    } else {
      const span = document.createElement('span');
      span.className = 'shadow-word';
      span.textContent = word;
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        showWordPopup(word, span.getBoundingClientRect());
      });
      container.appendChild(span);
    }
  });
}

// 呼叫
renderClickableWords(s.text, 'shadowFocusRuby');
```

#### 新增查詢泡泡函式

```javascript
function showWordPopup(word, rect) {
  // 移除舊泡泡
  const old = document.getElementById('shadowWordPopup');
  if (old) old.remove();

  const popup = document.createElement('div');
  popup.id = 'shadowWordPopup';
  popup.className = 'shadow-word-popup';
  popup.innerHTML = `
    <div style="font-weight:bold;margin-bottom:4px;">${word}</div>
    <button onclick="SpeechSys.speak('${word.replace(/'/g, "\\'")}')" style="background:rgba(59,130,246,0.3);border:none;color:#fff;border-radius:6px;padding:4px 10px;cursor:pointer;margin-right:6px;">🔊 發音</button>
    <button onclick="KidsApp.addStars(0);document.getElementById('shadowWordPopup').remove()" style="background:rgba(34,197,94,0.3);border:none;color:#fff;border-radius:6px;padding:4px 10px;cursor:pointer;">📝 加入生字本</button>
  `;
  popup.style.cssText = `position:fixed;top:${rect.top - 60}px;left:${Math.max(10, rect.left - 40)}px;background:#1e293b;color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:12px;padding:10px 14px;z-index:9999;font-size:0.85rem;box-shadow:0 4px 20px rgba(0,0,0,0.4);`;
  document.body.appendChild(popup);

  // 點擊其他地方關閉
  setTimeout(() => {
    document.addEventListener('click', function closePopup() {
      popup.remove();
      document.removeEventListener('click', closePopup);
    }, { once: true });
  }, 100);
}
```

#### 新增 CSS（行 2078 前）

```css
.shadow-word {
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background 0.2s;
  display: inline-block;
}
.shadow-word:hover {
  background: rgba(59,130,246,0.3);
}
.shadow-word-popup {
  pointer-events: auto;
}
```

---

### Task 6：學習進度持久化

**目標**：用 localStorage 儲存已練習句數、得分、星星。

#### 新增 JS 函式（行 5740 後）

```javascript
function saveProgress() {
  const story = getCurrentStory();
  if (!story) return;
  const key = `shadow_progress_${currentLang}_${currentStoryId}`;
  const existing = JSON.parse(localStorage.getItem(key) || '{"completed":[],"totalStars":0}');
  if (!existing.completed.includes(currentSentenceIdx)) {
    existing.completed.push(currentSentenceIdx);
  }
  existing.lastStep = currentStep;
  existing.lastSentence = currentSentenceIdx;
  localStorage.setItem(key, JSON.stringify(existing));
}

function loadProgress() {
  const story = getCurrentStory();
  if (!story) return null;
  const key = `shadow_progress_${currentLang}_${currentStoryId}`;
  return JSON.parse(localStorage.getItem(key) || 'null');
}
```

#### 在 `stopRecordingAndScore()` 後呼叫

找到行 5734–5740 的 `stopRecordingAndScore()`，在評分完成後插入：
```javascript
saveProgress();
```

#### 在 `populateStorySelect()` 中顯示進度

在故事下拉選單的 option 文字中加入進度標記：
```javascript
// 在 populateStorySelect() 行 5513–5526 內
const progress = loadProgress();
const completedCount = progress ? progress.completed.length : 0;
const total = story.sentences.length;
option.textContent = `${story.title} (${completedCount}/${total})`;
```

---

## 三、 修改總覽

| 子任務 | 修改檔案 | 修改行號（約） | 新增行數（約） |
|--------|---------|--------------|--------------|
| Task 1 | `learn.html` | 5574 後、5898–5968 | ~60 行 |
| Task 2 | `learn.html` | 2461、5669–5691 | ~25 行 |
| Task 3 | `learn.html` | 2526–2533、5740 後 | ~70 行 |
| Task 4 | `learn.html` | 5773–5808 | ~40 行（替換） |
| Task 5 | `learn.html` | 5539、2078 前 | ~60 行 |
| Task 6 | `learn.html` | 5734–5740、5513–5526 | ~35 行 |
| **合計** | | | **~290 行** |

---

## 四、 驗收標準

| # | 檢查項 | 驗證方式 |
|---|--------|---------|
| 1 | Step 1 隱藏所有文字，只顯示聲波 | 手動測試 |
| 2 | Step 2 顯示全部文字，中文不可隱藏 | 手動測試 |
| 3 | Step 3 顯示英文，中文可切換 | 手動測試 |
| 4 | Step 4 文字半透明，可切換透明度 | 手動測試 |
| 5 | 間隔選擇器 3/5/7 秒生效 | auto-flow 測試 |
| 6 | 聽寫模式可輸入文字並評分 | 手動測試 |
| 7 | 評分容忍微小差異（Metaphone 輔助） | 單元測試 |
| 8 | 點擊單字出現查詢泡泡 | 手動測試 |
| 9 | 練習進度 localStorage 儲存 | 重新整理後檢查 |
| 10 | `node VERIFY_RELAY.js` 全數通過 | CLI 驗證 |

---

## 五、 執行順序建議

1. **Task 4**（寬容評分）— 改動最小，先穩定評分基礎
2. **Task 6**（進度持久化）— 無 UI 改動，先建立儲存機制
3. **Task 2**（可調間隔）— 簡單 UI + JS 改動
4. **Task 1**（四階段行為）— 核心改動，需謹慎
5. **Task 3**（聽寫模式）— 依賴 Task 1 的 UI 結構
6. **Task 5**（Tap-to-Lookup）— 獨立功能，最後做

每完成一個 Task，執行 `node VERIFY_RELAY.js` 確認不破壞現有功能。

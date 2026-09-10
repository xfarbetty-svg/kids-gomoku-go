# 規劃：BBT 回音法 + 影子跟讀整合

## 一句話
把 The Big Bang Theory 影片用 Whisper 自動提取字幕，加入 PRESET_VIDEOS，並在 Shadowing Studio 新增第 5 步驟「回音法」練習模式。

---

## 現狀分析

| | 現有 Shadowing Studio |
|--|----------------------|
| 步驟 | 4 步（純聽→精讀→視讀→脫稿） |
| YouTube 支援 | 有，但字幕需手動或 Whisper 提取 |
| 回音法 | **無**（需新增） |
| BBT 素材 | **無**（需新增） |

---

## 環境準備

### 需安裝的工具
```powershell
# 1. yt-dlp（下載 YouTube 音訊）
pip install yt-dlp

# 2. OpenAI Whisper（語音轉文字）
pip install openai-whisper

# 3. ffmpeg（Whisper 依賴，音訊處理）
# Windows: 用 choco 或到 https://ffmpeg.org/download.html 下載
# 如果有 choco:
choco install ffmpeg
# 如果沒有 choco，手動下載：
# 1. 到 https://github.com/BtbN/FFmpeg-Builds/releases 下載 ffmpeg-master-latest-win64-gpl.zip
# 2. 解壓縮後把 bin 資料夾裡的 ffmpeg.exe 放到 PATH 路徑下
```

### 驗證安裝
```powershell
yt-dlp --version        # 應顯示版本號
whisper --help          # 應顯示 Whisper 說明
ffmpeg -version         # 應顯示版本資訊
```

---

## 實作任務

### Task 1：下載 BBT 音訊並提取字幕

#### 步驟 1.1：下載音訊
```powershell
cd D:\ANTIGRAVITY\017_小朋友APP

# 只下載音訊（不下載影片），轉為 mp3
yt-dlp -x --audio-format mp3 -o "temp/bbt_audio.%(ext)s" "https://www.youtube.com/watch?v=StcfvDFM7LQ"
```

> ⚠️ 如果 `temp/` 資料夾不存在，先建立：
> ```powershell
> mkdir temp
> ```

#### 步驟 1.2：Whisper 轉錄
```powershell
# 用 medium 模型（精準度與速度平衡）
whisper temp/bbt_audio.mp3 --model medium --language en --output_format json --output_dir temp/
```

> 💡 如果是第一次跑 whisper medium，會自動下載模型（約 1.5GB），需等待。
> 如果效能不夠，可改用 `small` 模型。

#### 步驟 1.3：檢查輸出
Whisper 會在 `temp/` 產生：
- `bbt_audio.json`：完整逐字稿（含時間戳）
- `bbt_audio.txt`：純文字版

打開 `bbt_audio.json`，確認格式大致如下：
```json
{
  "segments": [
    {
      "start": 0.0,
      "end": 3.5,
      "text": " Why is your English getting worse the more you practice?"
    },
    ...
  ]
}
```

#### 步驟 1.4：擷取片段
BBT 完整影片可能太長（20+ 分鐘），需要**截取一段 1-3 分鐘的精華片段**。

方法 A：用 ffmpeg 手動剪
```powershell
# 例：截取 01:00 ~ 02:30（90 秒）
ffmpeg -i temp/bbt_audio.mp3 -ss 00:01:00 -to 00:02:30 -c copy temp/bbt_clip.mp3
```
然後對 `bbt_clip.mp3` 重跑 Whisper。

方法 B：直接從 Whisper JSON 中挑選時間範圍內的 segments
- 用 Node.js 或手動從 `bbt_audio.json` 篩出 `start >= 60 && end <= 150` 的 segments
- 轉成 subtitles 格式

#### 步驟 1.5：字幕格式轉換
把 Whisper 的 segments 轉成 `PRESET_VIDEOS` 需要的格式：

```js
// Whisper 格式
{ "start": 0.0, "end": 3.5, "text": " Hello world" }

// 目標格式
{ start: 0, end: 4, orig: "Hello world.", zh: "你好世界。" }
```

轉換腳本（存為 `temp/convert_whisper.js`）：
```js
const fs = require('fs');
const whisper = JSON.parse(fs.readFileSync('temp/bbt_audio.json', 'utf8'));

// 設定時間範圍（秒），根據你想要的片段調整
const START_SEC = 60;   // 從 1:00 開始
const END_SEC = 150;    // 到 2:30 結束

const filtered = whisper.segments
  .filter(s => s.start >= START_SEC && s.end <= END_SEC)
  .map(s => ({
    start: Math.round(s.start),
    end: Math.round(s.end),
    orig: s.text.trim(),
    zh: ''  // 需要人工翻譯
  }));

console.log(JSON.stringify(filtered, null, 2));
// 輸出後貼到 learn.html 的 subtitles 欄位
```

執行：
```powershell
node temp/convert_whisper.js > temp/subtitles.json
```

#### 步驟 1.6：校正與翻譯
- 打開 `temp/subtitles.json`
- **校正英文**：Whisper 可能聽錯專有名詞（如 Sheldon、Leonard 等）
- **補上中文翻譯**：填入 `zh` 欄位
- **調整時間戳**：確保句子邊界合理（每句 2-8 秒為佳）

---

### Task 2：將 BBT 加入 PRESET_VIDEOS

在 `learn.html` 的 `PRESET_VIDEOS` 陣列（約第 3679 行）最後一筆後面，新增：

```js
{
  id: 'bbt-echo',
  title: '🔬 The Big Bang Theory',
  category: 'adult-en',
  videoId: 'StcfvDFM7LQ',
  desc: '生活美語回音法練習（BBT 經典片段）',
  subtitles: [
    // ====== 貼入 Task 1 產出的字幕 ======
    // 格式範例：
    { start: 0, end: 4, orig: "Sheldon, why are you eating cereal at 2 AM?", zh: "謝爾頓，你為什麼凌晨兩點在吃麥片？" },
    { start: 4, end: 8, orig: "Because the pizza place closed at 1 AM.", zh: "因為披薩店一點就關了。" },
    // ... 繼續貼完所有句子
  ]
}
```

---

### Task 3：新增 Step 5 — 回音法模式

#### 步驟 3.1：新增 Step Tab 按鈕

找到 `learn.html` 約第 3028-3032 行的 `#shadowStepTabs`：

```html
<!-- 原本 4 個 tab -->
<button class="step-tab-btn active" data-step="1">👂 純聽</button>
<button class="step-tab-btn" data-step="2">📖 精讀</button>
<button class="step-tab-btn" data-step="3">📑 視讀</button>
<button class="step-tab-btn" data-step="4">🎙️ 脫稿</button>
```

改成 5 個：
```html
<button class="step-tab-btn active" data-step="1">👂 純聽</button>
<button class="step-tab-btn" data-step="2">📖 精讀</button>
<button class="step-tab-btn" data-step="3">📑 視讀</button>
<button class="step-tab-btn" data-step="4">🎙️ 脫稿</button>
<button class="step-tab-btn" data-step="5">🔊 回音</button>
```

#### 步驟 3.2：修改 CSS grid 支援 5 個 tab

找到 `learn.html` 約第 1843-1848 行：

```css
/* 原本 */
.step-tabs {
  grid-template-columns: repeat(4, 1fr);
}

/* 改為 */
.step-tabs {
  grid-template-columns: repeat(5, 1fr);
}
```

#### 步驟 3.3：在 `applyStepUI()` 新增 Step 5 邏輯

找到 `learn.html` 約第 6803 行（`}` 結束 Step 4 的 `else if` 塊），在 `}` 後面、`function setBanner` 前面加入：

```js
    } else if (currentStep === 5) {
      // 回音法：文字全隱藏，播放→暫停複述→再播一次
      [ruby, romaji, zh, hint, badge].forEach(el => { if (el) el.style.display = 'none'; });
      if (eyeLabel) eyeLabel.textContent = '回音練習';
      if (eyeIcon) eyeIcon.textContent = '🔊';
      if (recordBtn) recordBtn.style.display = '';        // 錄音按鈕常駐
      if (abDock) abDock.style.display = 'none';
      if (dictateBtn) dictateBtn.style.display = 'none';
      setBanner('🔊 聽一句 → 暫停複述 → 再聽一次', '#1a1a2e', '#e0e0e0');
    }
```

#### 步驟 3.4：設定 `zhHidden` 邏輯

找到 `learn.html` 約第 7771 行：

```js
// 原本
zhHidden = (currentStep === 1 || currentStep === 3 || currentStep === 4);

// 改為
zhHidden = (currentStep === 1 || currentStep === 3 || currentStep === 4 || currentStep === 5);
```

#### 步驟 3.5：實作回音法播放邏輯

在 `learn.html` 的 `playYoutubeSentence()` 函數附近（約第 6905 行），新增回音法專用函數：

```js
function playEchoSentence(start, end, onEnd) {
  const PAUSE_MS = 5000; // 暫停 5 秒讓使用者複述
  
  // 第一次播放原音
  shadowYtPlayer.seekTo(start, true);
  shadowYtPlayer.playVideo();
  
  const timer1 = setInterval(() => {
    const t = shadowYtPlayer.getCurrentTime();
    if (t >= end) {
      clearInterval(timer1);
      shadowYtPlayer.pauseVideo();
      
      // 暫停 5 秒，顯示提示
      setBanner('🎤 換你說！聽完後複述這句', '#2d1a4e', '#e0c3fc');
      
      setTimeout(() => {
        // 第二次播放原音（讓使用者對照）
        setBanner('🔊 再聽一次原音...', '#1a1a2e', '#e0e0e0');
        shadowYtPlayer.seekTo(start, true);
        shadowYtPlayer.playVideo();
        
        const timer2 = setInterval(() => {
          const t2 = shadowYtPlayer.getCurrentTime();
          if (t2 >= end) {
            clearInterval(timer2);
            shadowYtPlayer.pauseVideo();
            if (onEnd) onEnd();
          }
        }, 100);
      }, PAUSE_MS);
    }
  }, 100);
}
```

#### 步驟 3.6：在句子播放路由中呼叫回音法

找到 `speakSentence()` 函數（約第 7086 行），在 YouTube 播放的分支中加入 Step 5 判斷：

```js
// 找到類似這段邏輯：
if (story.source === 'youtube' && sentence.start != null && sentence.end != null) {
  playYoutubeSentence(sentence.start, sentence.end, onEnd);
}

// 改為：
if (story.source === 'youtube' && sentence.start != null && sentence.end != null) {
  if (currentStep === 5) {
    playEchoSentence(sentence.start, sentence.end, onEnd);
  } else {
    playYoutubeSentence(sentence.start, sentence.end, onEnd);
  }
}
```

#### 步驟 3.7：更新 `zhHidden` 初始值

確認 `currentStep` 初始值為 1（第 6377 行），不需改動。但要確認步驟切換時 Step 5 的 `zhHidden` 行為正確。

---

### Task 4：清理與測試

#### 步驟 4.1：清理暫存檔
```powershell
# 確認字幕正確後，刪除暫存
rmdir /s /q temp
```

#### 步驟 4.2：手機端測試清單
- [ ] `PRESET_VIDEOS` 顯示 BBT 卡片
- [ ] 點擊 BBT → 影音精聽室載入 → 字幕正確顯示
- [ ] 按「📤 送到影子跟讀」→ 跳轉到影子跟讀
- [ ] 下拉選單可選到 BBT
- [ ] Step 1-4 功能正常（不受新 step 影響）
- [ ] Step 5 回音法：
  - [ ] 文字全隱藏
  - [ ] 播放一句後自動暫停
  - [ ] 顯示「 換你說！」提示
  - [ ] 5 秒後自動重播原音
  - [ ] 重播結束自動跳下一句
  - [ ] 錄音按鈕可正常使用
- [ ] 手機端 5 個 tab 不溢出、可點擊

#### 步驟 4.3：平板橫向測試
- [ ] 5 個 tab 在橫向模式下排列正常

---

## 檔案修改清單

| 檔案 | 修改內容 |
|------|---------|
| `learn.html` | 1. `PRESET_VIDEOS` 新增 BBT（~3679 行） |
| `learn.html` | 2. Step tab HTML 新增第 5 個（~3032 行） |
| `learn.html` | 3. CSS `grid-template-columns` 改 `repeat(5, 1fr)`（~1845 行） |
| `learn.html` | 4. `applyStepUI()` 新增 Step 5 分支（~6803 行後） |
| `learn.html` | 5. `zhHidden` 邏輯加入 Step 5（~7771 行） |
| `learn.html` | 6. 新增 `playEchoSentence()` 函數（~6905 行附近） |
| `learn.html` | 7. `speakSentence()` 路由加入 Step 5 判斷（~7086 行） |

---

## 🚨 嚴格執行規範（ANTIGRAVITY 必讀）

### 一、基本紀律

1. **每個 Task 完成後，必須執行驗證步驟，回傳驗證結果。沒有驗證結果 = 沒做完。**
2. **修改檔案前，先用 `Read` 讀取目標區域，確認行號與內容與計畫一致。如果行號偏移超過 5 行，立即停止，回報偏差。**
3. **絕對不允許重寫整個檔案。所有修改必須用 `Edit` 工具的 `oldString → newString` 精確替換。**
4. **每完成一個 Task 的所有步驟後，跑一次 `git diff --stat` 確認只改了該改的檔案。**
5. **遇到任何不確定的狀況，停下來問，不要猜。**

---

### 二、Task 1 驗收標準（Whisper 字幕提取）

#### 驗證點 1.1：工具安裝
```powershell
yt-dlp --version
whisper --help 2>&1 | Select-Object -First 3
ffmpeg -version 2>&1 | Select-Object -First 1
```
**回報**：三個工具的版本號。缺任一個 = 不通過。

#### 驗證點 1.2：音訊下載
```powershell
ls temp\bbt_audio.*
```
**回報**：檔案存在、大小（KB）。如果檔案 < 100KB = 下載失敗，重來。

#### 驗證點 1.3：Whisper 輸出
```powershell
ls temp\bbt_audio.json
```
**回報**：
- JSON 檔案存在
- 用 Node.js 讀取並回報：`segments` 數量、第一句的 `start/end/text`、最後一句的 `start/end/text`
- 總時長（最後一句的 `end` 值）

#### 驗證點 1.4：字幕格式
**回報**：貼出完整的 `subtitles.json` 內容（前 5 句 + 後 5 句）。
**檢查項目**：
- [ ] 每筆都有 `start`、`end`、`orig`、`zh` 四個欄位
- [ ] `orig` 不為空字串
- [ ] `zh` 不為空字串
- [ ] `start < end`（時間邏輯正確）
- [ ] 相鄰句子時間不重疊（前一句 end ≤ 後一句 start，容許 0.5 秒重疊）
- [ ] 每句長度 2-10 秒（太短沒意義，太長難跟）
- [ ] 總句數 8-20 句（太少沒練習價值，太多會疲勞）

---

### 三、Task 2 驗收標準（PRESET_VIDEOS）

#### 驗證點 2.1：語法正確
```powershell
node -e "const fs=require('fs'); const html=fs.readFileSync('learn.html','utf8'); const m=html.match(/const PRESET_VIDEOS = \[([\s\S]*?)\];/); if(!m){console.log('ERROR: PRESET_VIDEOS not found');process.exit(1);} try{eval('['+m[1]+']');console.log('SYNTAX OK');}catch(e){console.log('SYNTAX ERROR:',e.message);}"
```
**回報**：`SYNTAX OK` 或錯誤訊息。

#### 驗證點 2.2：BBT 筆數
```powershell
node -e "const fs=require('fs'); const html=fs.readFileSync('learn.html','utf8'); const m=html.match(/const PRESET_VIDEOS = \[([\s\S]*?)\];/); const arr=eval('['+m[1]+']'); console.log('Total presets:', arr.length); const bbt=arr.find(v=>v.id==='bbt-echo'); if(!bbt){console.log('ERROR: bbt-echo not found');process.exit(1);} console.log('BBT subtitles:', bbt.subtitles.length); console.log('BBT videoId:', bbt.videoId);"
```
**回報**：
- `Total presets` 應為 5（原本 4 + BBT 1）
- `BBT subtitles` 應在 8-20 之間
- `BBT videoId` 應為 `StcfvDFM7LQ`

#### 驗證點 2.3：不影響其他 Preset
```powershell
node -e "const fs=require('fs'); const html=fs.readFileSync('learn.html','utf8'); const m=html.match(/const PRESET_VIDEOS = \[([\s\S]*?)\];/); const arr=eval('['+m[1]+']'); const ids=['peppa-cleaning','anpanman-song','ted-learning','nhk-conversation','bbt-echo']; ids.forEach(id=>{const v=arr.find(x=>x.id===id); console.log(id, v?'OK':'MISSING', v?'subs:'+v.subtitles.length:'');});"
```
**回報**：5 個 preset 都應顯示 `OK`。任何 `MISSING` = 不通過。

---

### 四、Task 3 驗收標準（Step 5 回音法）

#### 驗證點 3.1：HTML tab 數量
```powershell
node -e "const fs=require('fs'); const html=fs.readFileSync('learn.html','utf8'); const tabs=(html.match(/data-step=/g)||[]).length; console.log('Step tabs:', tabs);"
```
**回報**：`Step tabs: 5`。不是 5 = 不通過。

#### 驗證點 3.2：CSS grid
```powershell
node -e "const fs=require('fs'); const html=fs.readFileSync('learn.html','utf8'); const m=html.match(/\.step-tabs\s*\{[^}]*grid-template-columns:\s*repeat\((\d+)/); console.log('Grid columns:', m?m[1]:'NOT FOUND');"
```
**回報**：`Grid columns: 5`。不是 5 = 不通過。

#### 驗證點 3.3：applyStepUI 包含 Step 5
```powershell
node -e "const fs=require('fs'); const html=fs.readFileSync('learn.html','utf8'); const has5=html.includes('currentStep === 5'); console.log('Step 5 in applyStepUI:', has5);"
```
**回報**：`Step 5 in applyStepUI: true`。`false` = 不通過。

#### 驗證點 3.4：playEchoSentence 函數存在
```powershell
node -e "const fs=require('fs'); const html=fs.readFileSync('learn.html','utf8'); const hasFn=html.includes('function playEchoSentence'); console.log('playEchoSentence exists:', hasFn);"
```
**回報**：`playEchoSentence exists: true`。`false` = 不通過。

#### 驗證點 3.5：speakSentence 路由
```powershell
node -e "const fs=require('fs'); const html=fs.readFileSync('learn.html','utf8'); const has=html.includes('playEchoSentence(sentence.start'); console.log('speakSentence routes to echo:', has);"
```
**回報**：`speakSentence routes to echo: true`。`false` = 不通過。

#### 驗證點 3.6：zhHidden 包含 Step 5
```powershell
node -e "const fs=require('fs'); const html=fs.readFileSync('learn.html','utf8'); const m=html.match(/zhHidden\s*=\s*\([^)]+\)/g); console.log('zhHidden assignments:', JSON.stringify(m));"
```
**回報**：所有 `zhHidden = (...)` 賦值中，至少有一筆包含 `currentStep === 5`。

#### 驗證點 3.7：完整語法檢查
```powershell
node -e "const fs=require('fs'); const html=fs.readFileSync('learn.html','utf8'); const scriptMatch=html.match(/<script>([\s\S]*?)<\/script>/g); if(!scriptMatch){console.log('No script tags found');process.exit(1);} let errors=0; scriptMatch.forEach((s,i)=>{try{new Function(s.replace(/<\/?script>/g,''));}catch(e){console.log('Script block',i,'error:',e.message);errors++;}}); console.log(errors===0?'ALL SCRIPTS OK':errors+' script errors');"
```
**回報**：`ALL SCRIPTS OK`。有任何 error = 不通過。

---

### 五、Task 4 驗收標準（清理與測試）

#### 驗證點 4.1：git diff 確認
```powershell
git diff --stat
git diff learn.html | Select-String "^[+-]" | Measure-Object
```
**回報**：
- 只有 `learn.html` 出現在 diff 中（不應有其他檔案）
- 變更行數合理（預估 50-100 行新增/修改）

#### 驗證點 4.2：最終功能走查（必須逐項回報）
請用瀏覽器打開 `learn.html`，逐項確認：

| # | 項目 | 結果 |
|---|------|------|
| 1 | 首頁顯示 BBT 卡片 | |
| 2 | 點擊 BBT → 影音精聽室載入 | |
| 3 | 字幕行數正確（與 subtitles.json 一致） | |
| 4 | 按「📤 送到影子跟讀」→ 影子跟讀載入 | |
| 5 | 下拉選單可選到 BBT | |
| 6 | Step 1 純聽：文字隱藏、播放正常 | |
| 7 | Step 2 精讀：文字顯示、翻譯可切換 | |
| 8 | Step 3 視讀：跟讀正常、錄音按鈕可按 | |
| 9 | Step 4 脫稿：半透明文字正常 | |
| 10 | **Step 5 回音：文字全隱藏** | |
| 11 | **Step 5：播放一句後自動暫停** | |
| 12 | **Step 5：顯示「 換你說！」banner** | |
| 13 | **Step 5：5 秒後自動重播原音** | |
| 14 | **Step 5：重播結束自動跳下一句** | |
| 15 | **錄音按鈕在 Step 5 可正常使用** | |
| 16 | 5 個 tab 在手機寬度（375px）不溢出 | |
| 17 | 5 個 tab 在平板橫向（1024px）排列正常 | |

**全部勾 OK 才算通過。任何一項 FAIL = 打回修正。**

---

### 六、退回機制

以下任一條件成立，**立即退回，不得繼續下一步**：

| 退回條件 | 處理 |
|---------|------|
| 驗證點回報不是預期值 | 修正後重跑該驗證點 |
| `git diff` 出現非預期檔案 | 撤銷該檔案的改動 |
| 語法錯誤（Node.js 檢查不通過） | 修正語法，重跑檢查 |
| Step 1-4 任何功能異常 | 先修復 regression，再繼續 |
| 手機端 tab 溢出 | 調整 CSS，重測 |
| Whisper 字幕有空 `zh` | 補上翻譯才能進 Task 2 |

---

### 七、交付格式

完成後回報格式：

```
## Task 1 完成
- 驗證點 1.1：[PASS/FAIL] ...
- 驗證點 1.2：[PASS/FAIL] ...
- 驗證點 1.3：[PASS/FAIL] ...
- 驗證點 1.4：[PASS/FAIL] ...

## Task 2 完成
- 驗證點 2.1：[PASS/FAIL] ...
- 驗證點 2.2：[PASS/FAIL] ...
- 驗證點 2.3：[PASS/FAIL] ...

## Task 3 完成
- 驗證點 3.1：[PASS/FAIL] ...
- 驗證點 3.2：[PASS/FAIL] ...
- 驗證點 3.3：[PASS/FAIL] ...
- 驗證點 3.4：[PASS/FAIL] ...
- 驗證點 3.5：[PASS/FAIL] ...
- 驗證點 3.6：[PASS/FAIL] ...
- 驗證點 3.7：[PASS/FAIL] ...

## Task 4 完成
- git diff --stat：...
- 功能走查：[全部 17 項 PASS / 附上 FAIL 項目]
```

---

## ⚠️ 注意事項

1. **Whisper 模型選擇**：`medium` 精準度好但吃記憶體（~5GB RAM）。如果電腦效能不夠，改用 `small` 模型。
2. **字幕校正很重要**：Whisper 對專有名詞（Sheldon、Penny 等）可能聽錯，必須人工檢查。
3. **片段長度建議**：回音法適合 1-3 分鐘的短片段，太長會讓使用者疲勞。
4. **不要動到其他 Step**：Step 5 是純新增，不應影響 Step 1-4 的既有行為。
5. **CSS grid**：`repeat(5, 1fr)` 在手機小螢幕上 tab 文字可能折行，需測試。如果太擠，可把 tab 文字改短（如 `🔊 回`）。
6. **行號偏移處理**：本計畫行號是基於 2026-09-10 的 `learn.html`。如果 ANTIGRAVITY 執行時行號已變動，**必須先重新 Read 確認實際行號**，不可硬套計畫中的行號。

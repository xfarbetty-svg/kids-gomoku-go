# 🚀 語言學習程式核心升級任務書 (V2) — 給 OpenCode

本任務書針對使用者反饋的 5 大體驗痛點，制定了具體修改指示。請 OpenCode 嚴格依照下列指示修改 `d:\antigravity\017_小朋友APP\learn.html` 與 `sw.js`。

---

## 任務 1：影子跟讀訓練室新增「英 / 日」語言切換鈕（解鎖日語故事）

### 問題原因：
目前 `learn.html` 第 5045 行 `let currentLang = 'en';` 寫死，且畫面上沒有語言切換按鈕，導致日語故事無法被選取。

### 修改步驟：
1. **HTML 結構**（約第 2410 行）：
   在 `<div class="shadow-control-dock">` 或 `<select id="shadowStorySelect">` 的上方，加入語言切換按鈕組：
   ```html
   <div class="shadow-lang-selector" style="display: flex; gap: 8px; margin-bottom: 12px; justify-content: center;">
     <button type="button" class="pill active" id="shadowLangEnBtn" data-slang="en" style="cursor: pointer;">🇬🇧 英語 (English)</button>
     <button type="button" class="pill" id="shadowLangJaBtn" data-slang="ja" style="cursor: pointer;">🇯🇵 日語 (日本語)</button>
   </div>
   ```
2. **JavaScript 邏輯**（約第 5045 行與 5460 行）：
   - 讓 `currentLang` 預設讀取 `AppState.lang || 'en'`。
   - 綁定切換按鈕事件：
     ```javascript
     function setShadowingLang(lang) {
       currentLang = lang;
       document.querySelectorAll('.shadow-lang-selector .pill').forEach(b => {
         b.classList.toggle('active', b.getAttribute('data-slang') === lang);
       });
       populateStorySelect();
       const story = getCurrentStory();
       if (story) renderSentences();
     }
     $('shadowLangEnBtn')?.addEventListener('click', () => setShadowingLang('en'));
     $('shadowLangJaBtn')?.addEventListener('click', () => setShadowingLang('ja'));
     ```
   - 在全域語言切換按鈕點擊時（`AppState.lang = ...`），同步調用 `setShadowingLang(AppState.lang)`。

---

## 任務 2：重構 TTS 語音挑選引擎（修復日文怪異聲線）

### 問題原因：
`SpeechSys.speak()` 只有指定 `u.lang`，未指定 `u.voice`，Windows 系統會使用英文語音硬念日文或調用劣質機械音。

### 修改步驟：
改寫 `SpeechSys`（約第 2639 行）：
```javascript
const SpeechSys = (() => {
  let voices = [];

  function loadVoices() {
    if ('speechSynthesis' in window) {
      voices = window.speechSynthesis.getVoices();
    }
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }

  function getBestVoice(lang) {
    if (!voices.length && 'speechSynthesis' in window) {
      voices = window.speechSynthesis.getVoices();
    }
    if (lang === 'ja' || lang === 'ja-JP') {
      // 優先挑選微軟高品質日文、Google 日本語或 Apple 原生日文語音
      const preferred = ['Haruka', 'Ayumi', 'Nanami', 'Ichiro', 'Google 日本語', 'Kyoko', 'Otoya', 'Sayaka'];
      for (const name of preferred) {
        const found = voices.find(v => v.lang.startsWith('ja') && v.name.includes(name));
        if (found) return found;
      }
      return voices.find(v => v.lang.startsWith('ja')) || null;
    } else {
      // 英語優選自然語音
      const preferred = ['Jenny', 'Zira', 'Guy', 'Aria', 'Google US English', 'Samantha', 'Daniel'];
      for (const name of preferred) {
        const found = voices.find(v => v.lang.startsWith('en') && v.name.includes(name));
        if (found) return found;
      }
      return voices.find(v => v.lang.startsWith('en')) || null;
    }
  }

  return {
    speak(text, lang = 'en', rate = 0.95) {
      if (!('speechSynthesis' in window) || !text) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = (lang === 'ja' || lang === 'ja-JP') ? 'ja-JP' : 'en-US';
      u.rate = rate;
      const voice = getBestVoice(lang);
      if (voice) u.voice = voice;
      window.speechSynthesis.speak(u);
    }
  };
})();
```
並在影子跟讀的 `speakSentence()` 處，同樣採用 `getBestVoice(currentLang)` 指派 `u.voice`。

---

## 任務 3：實境對話日文劇本加入「羅馬拼音（Romaji）」對照

### 修改步驟：
在 `DIALOGUE_SCENARIOS` 的所有日文劇本中（包括 `kids.ja` 與 `adult.ja`），將 `phonetic` 統一提供標準**羅馬拼音（Hepburn Romaji）**，例如：
- 超商便當：`Irasshaimase! Obentō o oazukari shimasu.` / `Kore to, shake no onigiri o kudasai.`
- 柴犬打招呼：`Konnichiwa! Wan-chan, kawaii desu ne!`
- 飯店入住：`Konbanwa. Chekkuin o onegai shimasu.`
- 拉麵點餐：`Sumimasen, men katame de onegai dekimasu ka?`
- 地鐵問路：`Sumimasen, Shibuya-eki wa dochira desu ka?`
在 `renderDialogueTurn()` 渲染時，確保日文對話氣泡會展示這行羅馬拼音：
`<div class="bubble-phonetic" style="font-family: monospace; font-size: 13px; opacity: 0.8; color: #4f46e5;">${turnData.npc.phonetic}</div>`

---

## 任務 4：高效閃卡分頁加入「能力級別切換標籤列」

### 修改步驟：
1. **HTML 結構**（約第 2250 行，大人閃卡面板 `#adultFlashcardPanel` 內）：
   在閃卡卡片頂部加入專屬的級別切換容器：
   ```html
   <div id="flashcardLevelPills" class="level-pills" style="margin-bottom: 16px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;"></div>
   ```
2. **JS 邏輯**：
   在 `initAdultPractice()` 或切換到閃卡分頁時，渲染 `flashcardLevelPills`，點擊特定等級（如 A2、B1、N5、N4 等）時，過濾當前閃卡卡池，並將 `AppState.flashcardIndex = 0`，重新執行 `renderFlashcard()`。

---

## 任務 5：擴充常用詞庫（對接 GEPT 常用 2000/4000/7000 字 與 JLPT N5-N1）

### 修改步驟：
在 `DEFAULT_WORDS` 中擴充高品質實用單字：
- **英文分級標籤標示**：
  - `A1`：國小/入門生活常用詞（10+ 詞）
  - `A2`：**GEPT 初級 / 常用 2000 字**（國中核心，包含 airport, baggage, medicine, convenient 等 10+ 詞）
  - `B1`：**GEPT 中級 / 常用 4000 字**（高中核心，包含 opportunity, communicate, atmosphere 等 10+ 詞）
  - `B2`：**GEPT 中高級 / 常用 7000 字**（包含 accomplishment, comprehensive, phenomenon 等）
  - `C1`：**GEPT 高級 / 專業與商務**（包含 negotiate, implement, perspective 等）
- **日文分級標籤標示**：
  - `50音`：基礎發音與招呼
  - `N5`：生活最基礎高頻詞（食べる、飲む、行く、駅、先生、本、車 等）
  - `N4`：初級進階（旅行、天気、案内、買い物、便利 等）
  - `N3`：日常流暢交流（連絡、相談、準備、複雑、経験 等）
  - `N2`：職場與新聞（会議、方針、効果、感謝、評価 等）
  - `N1`：專業與高階語彙（妥協、配慮、概念、推測 等）
每個單字皆必須具備精準的 `word`, `phonetic`, `meaning`, `pos`, `example`, `exampleZh`。

---

## 任務 6：Service Worker 快取版本升級

在 `sw.js` 中將 `CACHE` 更新為 `'kids-games-v22'`，確保更新即時生效。

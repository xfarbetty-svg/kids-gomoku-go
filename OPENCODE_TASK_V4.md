# 🎙️ 影子跟讀調優任務書 (V4) — 聲線節奏與羅馬字顯示

## 任務背景與使用者需求
1. **復刻 OYASUMI JAPANESE 原片聲線與語速**：
   - 原始頻道為放鬆、慢速、睡前聽力的溫柔講故事風格。
   - 預設語速調整為慢速（0.85x），音調微調為溫和自然的中低音（pitch 0.95~1.0），句間停頓拉長為 600ms，營造沈浸式放鬆聽力氛圍。
   - 挑選最溫和的日語語音（如 Nanami, Haruka, Ayumi, Kyoko, Google 日本語）。
2. **影子跟讀全面常駐顯示「羅馬字（Hepburn Romaji）」**：
   - 修復 `renderSentences()` 的邏輯漏洞：過去若有 `ruby` 則不顯示 `phonetic`，導致使用者看不到羅馬拼音。
   - 改為：無論有無 `ruby`，只要資料中有 `s.phonetic`，就一律在下方以專屬樣式展示羅馬字（`shadow-sentence-phonetic`），讓不會五十音的學習者也能直覺拼讀！

---

## 具體代碼修改指示 (`learn.html`)

### 1. 羅馬字顯示邏輯修復（約第 5096~5115 行）
在 `renderSentences()` 中：
```javascript
      let phoneticHtml = '';
      // 只要有 phonetic（羅馬字/音標），一律渲染，不因有 ruby 而隱藏
      if (s.phonetic) {
        phoneticHtml = `<div class="shadow-sentence-phonetic" style="font-family: monospace; color: #4f46e5; font-size: 13px; opacity: 0.85; margin: 2px 0 4px;">${s.phonetic}</div>`;
      }

      const showZh = (currentStep === 1 || currentStep === 4) && zhHidden;
      div.innerHTML = `
        <div class="shadow-sentence-text">${s.ruby || s.text}</div>
        ${phoneticHtml}
        <div class="shadow-sentence-zh ${showZh ? 'hidden-text' : ''}">${s.zh}</div>
        ${s.pauseHint ? `<div class="shadow-pause-hint">💡 ${s.pauseHint}</div>` : ''}
      `;
```

### 2. 聲線、語速與句間停頓調優（約第 5135~5200 行）
- 在 `speakSentence(text, onEnd)` 中：
  ```javascript
  const u = new SpeechSynthesisUtterance(text);
  u.lang = (currentLang === 'ja') ? 'ja-JP' : 'en-US';
  // 若是日語，預設採用 0.85x 溫和慢速，pitch 設為 0.98（溫柔講故事聲線）
  u.rate = (currentLang === 'ja') ? (currentSpeed * 0.88) : currentSpeed;
  u.pitch = (currentLang === 'ja') ? 0.98 : 1.0;
  if (typeof SpeechSys !== 'undefined' && SpeechSys.getBestVoice) {
    const v = SpeechSys.getBestVoice(currentLang);
    if (v) u.voice = v;
  }
  ```
- 在 `playAllSentences()` 與 `playAllSentencesForRecording()` 中，將句與句之間的間隔 `setTimeout` 從 `200ms` 改為 `600ms`，使句子間有足夠的呼吸與沉澱時間，更貼近 OYASUMI 原片講故事的舒緩步調。

### 3. Service Worker 更新
將 `sw.js` 快取版本升級至 `'kids-games-v24'`。

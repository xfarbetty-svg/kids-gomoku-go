# 🏁 RELAY TASK — learn.html ShadowingStudio 啟動修復

## 狀態：`COMPLETED`

---

## 📋 問題描述

`ShadowingStudio` 的 return API（5970-5981）只暴露 `init`、`onTabOpen`、`stopAllAudio` 三個方法，但外部呼叫了兩個不存在的方法，導致 `UI.init()` 在 3082 行拋出 `TypeError`，整頁初始化中斷。

---

## 🔧 修復任務（共 3 處，按順序執行）

### Task 1：補暴露缺失的 API 方法
**檔案**：`learn.html`
**位置**：第 5970-5981 行（return API 區塊）
**改動**：在 return 物件中補上兩個方法

**改前**（5970-5981）：
```js
  return {
    init() {
      populateStorySelect();
      bindEvents();
    },
    onTabOpen() {
      if (AppState.lang && AppState.lang !== currentLang) {
        setShadowingLang(AppState.lang);
      }
    },
    stopAllAudio
  };
```

**改後**：
```js
  return {
    init() {
      populateStorySelect();
      bindEvents();
    },
    onModeChange() {
      if (AppState.lang && AppState.lang !== currentLang) {
        setShadowingLang(AppState.lang);
      }
    },
    setShadowingLang(lang) {
      setShadowingLang(lang);
    },
    onTabOpen() {
      if (AppState.lang && AppState.lang !== currentLang) {
        setShadowingLang(AppState.lang);
      }
    },
    stopAllAudio
  };
```

---

### Task 2：switchTab 的 shadowing 分支補上 onTabOpen 呼叫
**檔案**：`learn.html`
**位置**：第 3247-3253 行
**改動**：在 `stopAllAudio()` 之後加上 `onTabOpen()`

**改前**（3247-3253）：
```js
    } else if (tabId === 'shadowing') {
      if (typeof ShadowingStudio !== 'undefined') {
        ShadowingStudio.stopAllAudio();
        document.querySelectorAll('.shadow-lang-selector .pill').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-slang') === (AppState.lang || 'en'));
        });
      }
    }
```

**改後**：
```js
    } else if (tabId === 'shadowing') {
      if (typeof ShadowingStudio !== 'undefined') {
        ShadowingStudio.stopAllAudio();
        ShadowingStudio.onTabOpen();
        document.querySelectorAll('.shadow-lang-selector .pill').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-slang') === (AppState.lang || 'en'));
        });
      }
    }
```

---

### Task 3：驗證語法
**執行指令**：
```bash
node -e "const fs=require('fs');const html=fs.readFileSync('learn.html','utf8');const scripts=[...html.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];console.log('Script count:',scripts.length);scripts.forEach((m,i)=>{try{new Function(m[1]);console.log('Script '+i+': OK')}catch(e){console.error('Script '+i+' ERROR:',e.message)}})"
```

**期望結果**：`Script count: 2`，兩行 `OK`，零 ERROR。

---

## ✅ 驗收標準

| # | 檢查項 | 期望值 |
|---|--------|--------|
| 1 | `ShadowingStudio.onModeChange` 存在 | `typeof` 不是 `function` |
| 2 | `ShadowingStudio.setShadowingLang` 存在 | `typeof` 不是 `function` |
| 3 | `ShadowingStudio.onTabOpen` 存在 | `typeof` 不是 `function` |
| 4 | `ShadowingStudio.stopAllAudio` 存在 | `typeof` 不是 `function` |
| 5 | 語法檢查 | 0 SyntaxError |
| 6 | 行數 | 5995~6005 行 |

---

## 📌 執行結果回報 (ANTIGRAVITY)

1. **改動行數**：
   - **Task 1**：`learn.html` 第 5975-5982 行（補上 `onModeChange` 與 `setShadowingLang`，新增 8 行）。
   - **Task 2**：`learn.html` 第 3250 行（補上 `ShadowingStudio.onTabOpen();`，新增 1 行）。
2. **驗證指令輸出**：
   - Task 3 語法指令：`Script count: 2`、`Script 0: OK`、`Script 1: OK`（零 ERROR）。
   - `VERIFY_RELAY.js` 驗收指令：**8 項全數通過 / 0 項失敗**。
3. **最終狀態**：`COMPLETED`

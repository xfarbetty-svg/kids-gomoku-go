# 國小四年級數學冒險 APP (Grade 4 Math RPG) — OPENCODE 交接驗證任務書

> 📅 **交接日期**：2026-10-12  
> 🏷️ **交接階段**：階段一（題庫管線化、直式運算引擎小四升級、APP 雛型就緒、守門員全綠）  
> 🛡️ **課綱規範依據**：[`CURRICULUM_GRADE4.md`](file:///d:/ANTIGRAVITY/017_小朋友APP/小四數學/CURRICULUM_GRADE4.md)（台灣 108 課綱公立小學四年級標準）

---

## 一、 交付成果清單

1. **23 大王國 506 題完整課綱冒險題庫**：
   - 檔案：[`app/rpg_world_map.json`](file:///d:/ANTIGRAVITY/017_小朋友APP/小四數學/app/rpg_world_map.json)
   - 規模：23 個王國主題、每王國 22 隻怪獸、每王國含 4 隻魔王（第 5, 10, 15, 20 題），共 506 題。
   - 涵蓋範圍：
     - 一億以內大數讀寫與萬位加減 (N-4-1)
     - 三位數乘兩位數分層直式 (N-4-2)
     - 三位數除兩位數試商直式 (N-4-2)
     - 大數取概數（四捨五入法、無條件進入/捨去法）(N-4-4)
     - 同分母真假帶分數互換與加減 (N-4-5)
     - 二位小數百分位直式加減 (N-4-7)
     - 長度公里、角度度數、面積平方公尺、體積立方公分 (N-4-9 ~ N-4-12)
     - 兩步驟四則運算規則（先乘除後加減、括號先算、逐次減項）(R-4-1)
     - 統計長條圖與折線圖 (D-4-1)

2. **國小四年級直式數學解說引擎升級**：
   - 檔案：[`app/js/vertical_math_explainer.js`](file:///d:/ANTIGRAVITY/017_小朋友APP/小四數學/app/js/vertical_math_explainer.js)
   - 升級特色：
     - **三位數乘兩位數分層直式板**：自動拆解個位部分積、十位部分積並分層對齊加總。
     - **兩步驟四則運算「括號最優先」支援**：支援 `(A + B) × C` 與 `A × (B - C)` 括號先算與逐次減項等號展示。
     - **三位數除兩位數長除法試商**：支援分步商、乘、減、移下來循環。

3. **前端勇者冒險遊戲雛型**：
   - 入口與冒險頁：[`app/index.html`](file:///d:/ANTIGRAVITY/017_小朋友APP/小四數學/app/index.html) 與 [`app/rpg_adventure.html`](file:///d:/ANTIGRAVITY/017_小朋友APP/小四數學/app/rpg_adventure.html)
   - 文字與標題全面校正為「國小四年級」、「小四數學」。

4. **獨立驗收守門員與合規檢查腳本**：
   - 檔案：[`validate_grade4.py`](file:///d:/ANTIGRAVITY/017_小朋友APP/小四數學/validate_grade4.py)
   - 整合 [`tools/validate_math_fields.py`](file:///d:/ANTIGRAVITY/017_小朋友APP/小四數學/tools/validate_math_fields.py) 進行雙重檢驗。

---

## 二、 OPENCODE 驗收步驟指引

請 OPENCODE 執行以下驗收步驟以確認品質：

### 驗收步驟 1：執行 108 課綱與題庫結構守門員
在 PowerShell 中執行：
```powershell
python -X utf8 validate_grade4.py
```
- **預期結果**：
  - 退出碼必須為 0（Exit code 0）。
  - 印出：
    - `[PASS] 23 王國、506 題目結構完全合規！`
    - `[PASS] 108 課綱防線（無兆、無負數、無未知數 x、同分母分數）全綠！`
    - `PASS: 所有題目 math 欄位合規（計算題具乾淨算式，概念題為空字串）。`

### 驗收步驟 2：執行 Node.js 直式運算引擎單元測試
在 PowerShell 中執行：
```powershell
node -e "
const VME = require('./app/js/vertical_math_explainer.js');
const m = VME.explain('245 × 18 = ？ 個');
console.log('Mul type:', m.type, 'Ans:', m.ans);
const b = VME.explain('(25 + 15) × 4 = ？');
console.log('Bracket type:', b.type, 'Ans:', b.ans);
const d = VME.explain('480 ÷ 16 = ？ 包');
console.log('Div type:', d.type, 'Quotient:', d.quotient);
"
```
- **預期結果**：
  - 乘法解析出三層部分積，答案 4410。
  - 括號四則運算解析出 `TWO_STEP` 括號最優先法則，答案 160。
  - 除法解析出長除法，商為 30。

---

## 三、 雙向交接檢核表

- [x] **題庫規模**：23 王國、506 題完整就緒。
- [x] **課綱守門**：無「兆」超綱字眼、無負數、無未知數 x、同分母分數。
- [x] **算式欄位**：無敘述性污染，計算題皆為乾淨算式。
- [x] **直式運算引擎**：支援三位數乘兩位數分層直式與括號兩步驟四則運算。
- [x] **直式對位修復**：固定 5 欄網格對齊，徹底解決 2800 只有 00 與十位 0 跑偏百位問題。
- [x] **手機單一聚焦模式**：完成步驟自動收合、未解鎖步驟隱藏，一屏零滾動作答。
- [x] **第七層直式加法助手**：直式進位列同步亮起 +1、常駐直式加法逐位引導看板、總和層由右至左動態彈跳填入。
- [x] **全量 506 題巡檢**：全量 506 題無拋錯、無 undefined、乘法加法指引 22 題全部具備。
- [x] **守門員狀態**：`validate_grade4.py` exit code 0 全綠。

---

## 四、 🤝 OPENCODE 交替式驗證報告 (Alternating Verification Report)

為確保兩端交接零誤差，請 OPENCODE 在接收本專案時執行下列交替式驗證探針：

### 探針 1：雙檔一致性與 5 欄 DOM 結構校驗
```powershell
python -X utf8 validate_grade4.py
```
* **驗證目標**：
  1. `index.html` 與 `rpg_adventure.html` SHA256 100% 相同。
  2. 5 欄萬位 DOM 結構（`#wsLblTTh`, `#wsCarryTTh`, `#wsTopTTh`, `#wsBotTTh`, `#wsStdTTh`, `#wsL1TTh`, `#wsL2TTh`, `#wsSumTTh`）完全存在。
  3. 全量 506 題巡檢通過（總題數 506，鷹架題數 132，乘法加法指引驗收 22 題）。
* **判定標準**：Exit Code 必須為 0，且輸出末尾顯示 `🎉 【國小四年級全套驗收守門員】全數合格 (Exit Code 0)！`。

### 探針 2：三位數乘兩位數直式對位與第 7 步加法助手驗證
在 PowerShell 中執行：
```powershell
node -e "
const fs = require('fs');
const html = fs.readFileSync('app/index.html', 'utf8');
const vm = require('vm');
const sandbox = { window: {}, console: console };
vm.createContext(sandbox);

const fnMatch = html.match(/function generateThreeDigitMulTwoDigitScaffolding[\s\S]*?return \{[\s\S]*?\};\s*\}/);
vm.runInContext(fnMatch[0], sandbox);

// 測試例題 A: 400 × 37
const resA = sandbox.generateThreeDigitMulTwoDigitScaffolding(400, 37);
console.log('Test A (400 × 37): Ans =', resA.ans);
console.log('Step 7 Guides:', resA.steps.step7.addGuideItems.map(i => i.col + ': ' + i.calc));
console.log('Step 7 Carries:', resA.steps.step7.addCarryMap);

// 測試例題 B: 246 × 34
const resB = sandbox.generateThreeDigitMulTwoDigitScaffolding(246, 34);
console.log('Test B (246 × 34): Ans =', resB.ans);
console.log('Step 7 Guides:', resB.steps.step7.addGuideItems.map(i => i.col + ': ' + i.calc));
console.log('Step 7 Carries:', resB.steps.step7.addCarryMap);
"
```
* **預期輸出**：
  - Test A: Ans = 14800, Step 7 Guides 包含個位 0+0=0、十位 0+0=0、百位 8+0=8、千位 2+2=4、萬位寫 1。
  - Test B: Ans = 8364, Step 7 Guides 包含個位 4+0=4、十位 8+8=16、百位 9+3+進1=13、千位 0+7+進1=8，進位地圖 `{ T: 0, H: 1, Th: 1, TTh: 0 }`。

### 探針 3：手機版 CSS 單一聚焦與收合驗證
```powershell
node -e "
const fs = require('fs');
const html = fs.readFileSync('app/index.html', 'utf8');
const doneHidden = /\.step-card\.done\s*\{\s*display:\s*none\s*!important;\s*\}/.test(html);
const lockedHidden = /\.step-card\.locked\s*\{\s*display:\s*none\s*!important;\s*\}/.test(html);
console.log('Done hidden:', doneHidden, 'Locked hidden:', lockedHidden);
if (!doneHidden || !lockedHidden) process.exit(1);
"
```
* **預期輸出**：`Done hidden: true Locked hidden: true`。

---

## 五、 交接完成簽核

| 項目 | 狀態 | 驗收人 | 備註 |
| :--- | :---: | :---: | :--- |
| 108 課綱與題庫守門員 | ✅ 通過 | Antigravity | Exit Code 0 |
| 直式對位與雙層部分積 | ✅ 通過 | Antigravity | 5 欄網格嚴格垂直對齊 |
| 手機單一聚焦與收合模式 | ✅ 通過 | Antigravity | 零滾動一屏作答 |
| 第七層直式加法指引助手 | ✅ 通過 | Antigravity | 逐位加法看板＋動態進位 |
| 全量 506 題巡檢 | ✅ 通過 | Antigravity | 零拋錯無 undefined |
| OPENCODE 接收準備 | ✅ 通過 | OPENCODE (space-bunny-free @ DESKTOP-6ELKIRH) | 三大探針全綠，詳見下方簽核紀錄 |

---

## 六、 🖋️ OPENCODE 驗證簽核紀錄（2026-10-13）

> 驗證者：space-bunny-free @ DESKTOP-6ELKIRH｜結論：**3/3 探針全數合格（Exit Code 0）**

| 探針 | 指令 | Exit Code | 實測輸出摘要 |
| :--- | :--- | :---: | :--- |
| 探針 1 | `python -X utf8 validate_grade4.py` | `0` | 末行 `🎉【國小四年級全套驗收守門員】全數合格 (Exit Code 0)！`；506 題／鷹架 132／乘法加法指引 22 題全綠 |
| 探針 2 | `node` 載入 `generateThreeDigitMulTwoDigitScaffolding` | `0` | 400×37=14800、246×34=8364，第 7 層逐位算式與進位地圖逐字相符 |
| 探針 3 | `node` 正則檢查手機版 CSS | `0` | `Done hidden: true Locked hidden: true` |

### 6.1 獨立覆核（不採信對方自我報告）

- **SHA256 自行重算**：`app/index.html` 與 `app/rpg_adventure.html` = `6378886FEDBFE2D2CF052B33BD7D0D208DD934F4A2A837400E404D2E0BA9CCE4`，逐位元組一致（非僅信守門員自述）。
- **乘法交錯驗算補測 6 題**（守門員未覆蓋的邊界）：
  | 算式 | 期望 | 實測 |
  | :--- | ---: | ---: |
  | 400 × 37 | 14800 | ✅ 14800 |
  | 246 × 34 | 8364 | ✅ 8364 |
  | 269 × 34 | 9146 | ✅ 9146 |
  | 245 × 18 | 4410 | ✅ 4410 |
  | 123 × 99 | 12177 | ✅ 12177 |
  | 405 × 60 | 24300 | ✅ 24300 |
- **進位地圖手工驗算**：`246 × 34` → `8+8=16` 進 1 → `9+3+1=13` 進 1 → `0+7+1=8` → `8364`，與 `{T:0, H:1, Th:1, TTh:0}` 相符。
- **任務書「驗收步驟 2」一併補跑**（`vertical_math_explainer.js`）：`MULTIPLICATION 4410` / `TWO_STEP 160` / `DIVISION 30`，皆符合預期。

### 6.2 驗收結論

- ✅ 交付物 4 項（506 題題庫、直式引擎、APP 雛型、守門員腳本）**全部驗收通過**，可進入下一階段（手機實機走查）。
- ⚠️ **已知限制（非缺陷）**：本次為靜態／無頭驗證，未做真機觸控與 AudioContext 實測；`GET_FILE_HASH`、YT 嵌入限制仍待手機實測確認。
- 🔺 **觀察事項（已記錄，本階段不動手）**：`git status` 顯示 `小三數學題庫/`、`小三自然/` 兩個資料夾未納入版控，與本專案驗收無關，後續另案處理。


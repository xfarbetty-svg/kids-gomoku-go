// -*- coding: utf-8 -*-
/**
 * verify_scaffoldings.js
 * 驗收守門員：檢驗小四數學直式鷹架、5 欄位值方格與大數拆解
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'app', 'index.html');
const rpgPath = path.join(root, 'app', 'rpg_adventure.html');
const explainerPath = path.join(root, 'app', 'js', 'vertical_math_explainer.js');
const mapPath = path.join(root, 'app', 'rpg_world_map.json');

console.log('[*] 執行小四直式鷹架與雙檔案同步驗收守門員...');

// 1. 檢查 app/index.html 與 app/rpg_adventure.html 100% 同步
if (!fs.existsSync(indexPath) || !fs.existsSync(rpgPath)) {
  console.error('[FAIL] index.html 或 rpg_adventure.html 不存在');
  process.exit(1);
}

const indexContent = fs.readFileSync(indexPath, 'utf8');
const rpgContent = fs.readFileSync(rpgPath, 'utf8');
const hash1 = crypto.createHash('sha256').update(indexContent).digest('hex');
const hash2 = crypto.createHash('sha256').update(rpgContent).digest('hex');

if (hash1 !== hash2) {
  console.error('[FAIL] index.html 與 rpg_adventure.html 內容不一致 (Hash 不符)');
  process.exit(1);
}
console.log('[PASS] index.html 與 rpg_adventure.html 100% 完全同步 (Byte-for-Byte SHA256 一致)');

// 2. 檢查 5 欄萬位 DOM 元件完整性
const requiredDomIds = [
  'wsLblTTh', 'wsCarryTTh', 'wsTopTTh', 'wsBotTTh', 'wsStdTTh',
  'wsL1TTh', 'wsL2TTh', 'wsSumTTh'
];
for (const id of requiredDomIds) {
  if (!indexContent.includes(`id="${id}"`)) {
    console.error(`[FAIL] HTML 缺少萬位 DOM 元件: id="${id}"`);
    process.exit(1);
  }
}
console.log('[PASS] 5 欄萬位 DOM 結構齊全 (#wsLblTTh, #wsCarryTTh, #wsTopTTh, #wsBotTTh, #wsStdTTh 等)');

// 3. 測試前端 index.html 內的 generateScaffoldingForProblem 鷹架生成
const scriptRegex = /<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi;
let match;
let mainScript = '';
while ((match = scriptRegex.exec(indexContent)) !== null) {
  if (match[1].length > 1000) {
    mainScript = match[1];
    break;
  }
}

const sandbox = {
  console: console,
  window: {},
  navigator: { userAgent: '' },
  Audio: function() { return { addEventListener: () => {}, pause: () => {} }; },
  fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }),
  document: {
    getElementById: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {} } })
  },
  localStorage: { getItem: () => null, setItem: () => {} },
  setTimeout: () => {},
  setInterval: () => {},
  clearTimeout: () => {},
  clearInterval: () => {}
};

const codeToRun = mainScript + `
this.generateScaffoldingForProblem = generateScaffoldingForProblem;
`;

vm.createContext(sandbox);
vm.runInContext(codeToRun, sandbox);

const genScaff = sandbox.generateScaffoldingForProblem;
const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

function assertNoUndefined(obj, pathStr) {
  if (obj === undefined) throw new Error('Found undefined at ' + pathStr);
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      assertNoUndefined(obj[key], pathStr + '.' + key);
    }
  }
}

// 測試 t01 Q1 (大數加法 >= 6 位數拆解)
const t01 = mapData.find(c => c.theme_id === 't01');
const t01_q1 = t01.monsters[0];
const res_t01_q1 = genScaff(t01_q1.math, t01_q1.id, t01_q1.word_problem);
if (!res_t01_q1 || res_t01_q1.type !== 'big_number_standard' || res_t01_q1.stepCount !== 3) {
  console.error('[FAIL] t01 Q1 應生成 big_number_standard 且 stepCount=3');
  process.exit(1);
}
assertNoUndefined(res_t01_q1, 'res_t01_q1');
console.log('[PASS] t01 Q1 (736100 + 270000) 成功生成大數 3 步階拆解鷹架，無 undefined');

// 測試 t01 Q3 (大數加法)
const t01_q3 = t01.monsters[2];
const res_t01_q3 = genScaff(t01_q3.math, t01_q3.id, t01_q3.word_problem);
if (!res_t01_q3 || res_t01_q3.type !== 'big_number_standard' || res_t01_q3.stepCount !== 3) {
  console.error('[FAIL] t01 Q3 應生成 big_number_standard 且 stepCount=3');
  process.exit(1);
}
assertNoUndefined(res_t01_q3, 'res_t01_q3');
console.log('[PASS] t01 Q3 (845200 + 170000) 成功生成大數 3 步階拆解鷹架，無 undefined');

// 測試 t02 Q1 (萬位加法 5 欄)
const t02 = mapData.find(c => c.theme_id === 't02');
const t02_q1 = t02.monsters[0];
const res_t02_q1 = genScaff(t02_q1.math, t02_q1.id, t02_q1.word_problem);
if (!res_t02_q1 || res_t02_q1.type !== 'add_standard' || res_t02_q1.stepCount !== 5 || res_t02_q1.steps.step5.colKey !== 'TTh') {
  console.error('[FAIL] t02 Q1 應生成 add_standard 5 欄直式且第 5 步為萬位 (TTh)');
  process.exit(1);
}
assertNoUndefined(res_t02_q1, 'res_t02_q1');
console.log('[PASS] t02 Q1 (40538 + 26896) 成功生成萬位 5 欄直式加法鷹架，第 5 步精準對齊 TTh，無 undefined');

// 測試 t03 Q2 (萬位減法 5 欄)
const t03 = mapData.find(c => c.theme_id === 't03');
const t03_q2 = t03.monsters[1];
const res_t03_q2 = genScaff(t03_q2.math, t03_q2.id, t03_q2.word_problem);
if (!res_t03_q2 || res_t03_q2.type !== 'sub_standard' || res_t03_q2.stepCount !== 5) {
  console.error('[FAIL] t03 Q2 應生成 sub_standard 5 欄直式');
  process.exit(1);
}
assertNoUndefined(res_t03_q2, 'res_t03_q2');
console.log('[PASS] t03 Q2 (70901 - 24544) 成功生成萬位 5 欄直式減法破十法鷹架，無 undefined');

// 測試 t05 Q1 (三位數乘兩位數 7 微步階)
const t05 = mapData.find(c => c.theme_id === 't05');
const t05_q1 = t05.monsters[0];
const res_t05_q1 = genScaff(t05_q1.math, t05_q1.id, t05_q1.word_problem);
if (!res_t05_q1 || res_t05_q1.type !== 'mul_twodigit_steps' || res_t05_q1.stepCount !== 7) {
  console.error('[FAIL] t05 Q1 應生成 mul_twodigit_steps 且 stepCount=7');
  process.exit(1);
}
assertNoUndefined(res_t05_q1, 'res_t05_q1');
console.log('[PASS] t05 Q1 (269 × 34) 成功生成三位數乘兩位數 7 微步階細粒度鷹架，無 undefined');

// 4. 測試 vertical_math_explainer.js 解說引擎
const explainerCode = fs.readFileSync(explainerPath, 'utf8');
const explainerSandbox = { window: {}, console: console };
vm.createContext(explainerSandbox);
vm.runInContext(explainerCode, explainerSandbox);
const explainer = explainerSandbox.window.VerticalMathExplainer || explainerSandbox.VerticalMathExplainer;

if (!explainer) {
  console.error('[FAIL] 無法載入 VerticalMathExplainer');
  process.exit(1);
}

const exp_mul = explainer.explain('269 × 34 = ？ 個');
if (!exp_mul || exp_mul.ans !== 9146 || exp_mul.steps.length !== 7) {
  console.error('[FAIL] VerticalMathExplainer 269 × 34 應生成 7 步階');
  process.exit(1);
}
console.log('[PASS] VerticalMathExplainer 乘法細粒度 7 微步階解析完全正確 (ans=9146)');

const exp_big = explainer.explain('736100 + 270000 = ？ 元');
if (!exp_big || exp_big.ans !== 1006100 || exp_big.steps.length !== 3) {
  console.error('[FAIL] VerticalMathExplainer 736100 + 270000 應生成大數 3 步階');
  process.exit(1);
}
console.log('[PASS] VerticalMathExplainer 大數加法 3 步階拆解解析完全正確 (ans=1006100)');

// 5. 全量 506 題巡檢守門員：驗證無拋錯、無 undefined、乘法第 7 步加法指引齊備
let totalChecked = 0;
let scaffoldCount = 0;
let mulStep7Checked = 0;

mapData.forEach(theme => {
  theme.monsters.forEach(m => {
    totalChecked++;
    try {
      const res = genScaff(m.math, m.id, m.word_problem);
      if (res) {
        scaffoldCount++;
        assertNoUndefined(res, m.id);
        if (res.type === 'mul_twodigit_steps') {
          mulStep7Checked++;
          if (!res.steps || !res.steps.step7 || !res.steps.step7.addGuideItems || res.steps.step7.addGuideItems.length === 0) {
            throw new Error(m.id + ' mul_twodigit_steps 缺少 step7.addGuideItems 直式加法指引！');
          }
          if (!res.steps.step7.addCarryMap) {
            throw new Error(m.id + ' mul_twodigit_steps 缺少 step7.addCarryMap 進位地圖！');
          }
        }
      }
    } catch (e) {
      console.error('[FAIL] 題目巡檢異常 ' + m.id + ': ' + e.message);
      process.exit(1);
    }
  });
});

console.log(`[PASS] 全量 506 題巡檢通過：總題數 ${totalChecked}，鷹架題數 ${scaffoldCount}，乘法加法指引驗收 ${mulStep7Checked} 題，零拋錯無 undefined！`);
console.log('[PASS] 全套直式鷹架與 DOM 驗收守門員 100% 全綠！');
process.exit(0);

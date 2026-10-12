#!/usr/bin/env node
// -*- coding: utf-8 -*-
/**
 * test_vertical_math_explainer.js
 * 直式數學解說引擎單元測試 (Node built-in test runner, 零外部相依)
 *
 * 執行： node tests/test_vertical_math_explainer.js
 * 退出碼： 0 = 全數通過 / 1 = 有測試失敗 (只認 exit code)
 *
 * 測試哲學：斷言「數學上正確的答案」，不是斷言「引擎自己吐出來的答案」。
 * 若引擎算錯，測試必須紅燈 —— 這是本檔存在的唯一理由。
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');

const VME = require(path.join(__dirname, '..', 'app', 'js', 'vertical_math_explainer.js'));
const MAP_PATH = path.join(__dirname, '..', 'app', 'rpg_world_map.json');

function run(input) {
  return typeof input === 'string' ? VME.explain(input) : VME.explain(input);
}

/** 斷言解說結果的 HTML 骨架健全：非空、無 NaN、無 undefined */
function assertHtmlSane(r, label) {
  assert.ok(r && typeof r === 'object', label + '：應回傳物件');
  assert.ok(typeof r.type === 'string' && r.type.length > 0, label + '：應有非空 type');
  assert.ok(typeof r.html === 'string' && r.html.length > 0, label + '：應有非空 html');
  assert.ok(!r.html.includes('NaN'), label + '：html 內含 NaN（計算失敗外洩）');
  assert.ok(!r.html.includes('undefined'), label + '：html 內含 undefined（欄位缺漏外洩）');
}

// ==================== 1. 加法直式 ====================

test('加法：三位數連續進位 345 + 278 = 623', () => {
  const r = run('345 + 278');
  assert.strictEqual(r.type, 'ADDITION');
  assert.strictEqual(r.ans, 623);
  assertHtmlSane(r, '345+278');
});

test('加法：不同位數無進位 120 + 45 = 165', () => {
  const r = run('120 + 45');
  assert.strictEqual(r.type, 'ADDITION');
  assert.strictEqual(r.ans, 165);
  assertHtmlSane(r, '120+45');
});

test('加法：全字型加號 ＋ 與單位殘留仍可解析 36 + 7 個 = 43', () => {
  const r = run('36 ＋ 7 個');
  assert.strictEqual(r.type, 'ADDITION');
  assert.strictEqual(r.ans, 43);
});

// ==================== 2. 減法直式 ====================

test('減法：連續借位 523 - 178 = 345', () => {
  const r = run('523 - 178');
  assert.strictEqual(r.type, 'SUBTRACTION');
  assert.strictEqual(r.ans, 345);
  assertHtmlSane(r, '523-178');
});

test('減法：全減得零 456 - 456 = 0', () => {
  const r = run('456 - 456');
  assert.strictEqual(r.type, 'SUBTRACTION');
  assert.strictEqual(r.ans, 0);
});

test('減法：全字型減號 － 800 - 356 = 444', () => {
  const r = run('800 － 356');
  assert.strictEqual(r.type, 'SUBTRACTION');
  assert.strictEqual(r.ans, 444);
});

// ==================== 3. 乘法直式 ====================

test('乘法：一位數進位 234 × 5 = 1170', () => {
  const r = run('234 × 5');
  assert.strictEqual(r.type, 'MULTIPLICATION');
  assert.strictEqual(r.ans, 1170);
  assertHtmlSane(r, '234×5');
});

test('乘法：兩位數雙層部分積 234 × 12 = 2808', () => {
  const r = run('234 × 12');
  assert.strictEqual(r.type, 'MULTIPLICATION');
  assert.strictEqual(r.ans, 2808);
  assertHtmlSane(r, '234×12');
});

test('乘法：三位數 × 兩位數 315 × 24 = 7560', () => {
  const r = run('315 × 24');
  assert.strictEqual(r.type, 'MULTIPLICATION');
  assert.strictEqual(r.ans, 7560);
});

// ==================== 4. 長除法直式 ====================

test('除法：整除 876 ÷ 4 = 219 餘 0', () => {
  const r = run('876 ÷ 4');
  assert.strictEqual(r.type, 'DIVISION');
  assert.strictEqual(r.quotient, 219);
  assert.strictEqual(r.remainder, 0);
  assertHtmlSane(r, '876÷4');
});

test('除法：含餘數 785 ÷ 4 = 196 餘 1', () => {
  const r = run('785 ÷ 4');
  assert.strictEqual(r.type, 'DIVISION');
  assert.strictEqual(r.quotient, 196);
  assert.strictEqual(r.remainder, 1);
});

test('除法：商首位為 0 需補位 605 ÷ 5 = 121 餘 0', () => {
  const r = run('605 ÷ 5');
  assert.strictEqual(r.type, 'DIVISION');
  assert.strictEqual(r.quotient, 121);
  assert.strictEqual(r.remainder, 0);
  assertHtmlSane(r, '605÷5');
});

// ==================== 5. 兩步驟四則運算（先乘除後加減 / 括號優先） ====================

test('兩步驟：先乘除後加減 45 + 6 × 7 = 87（非左到右 357）', () => {
  const r = run('45 + 6 × 7');
  assert.strictEqual(r.type, 'TWO_STEP');
  assert.strictEqual(r.ans, 87);
  assertHtmlSane(r, '45+6×7');
});

test('兩步驟：先除後減 84 - 48 ÷ 6 = 76', () => {
  const r = run('84 - 48 ÷ 6');
  assert.strictEqual(r.type, 'TWO_STEP');
  assert.strictEqual(r.ans, 76);
});

test('兩步驟：連減 450 - 120 - 80 = 250', () => {
  const r = run('450 - 120 - 80');
  assert.strictEqual(r.type, 'TWO_STEP');
  assert.strictEqual(r.ans, 250);
  assertHtmlSane(r, '450-120-80');
});

test('兩步驟：連加 120 + 350 + 30 = 500', () => {
  const r = run('120 + 350 + 30');
  assert.strictEqual(r.type, 'TWO_STEP');
  assert.strictEqual(r.ans, 500);
});

test('兩步驟：先乘後加減 150 × 2 + 80 = 380', () => {
  const r = run('150 × 2 + 80');
  assert.strictEqual(r.type, 'TWO_STEP');
  assert.strictEqual(r.ans, 380);
});

test('兩步驟：括號最優先 (23 + 45) × 6 = 408', () => {
  const r = run('(23 + 45) × 6');
  assert.strictEqual(r.type, 'TWO_STEP');
  assert.strictEqual(r.ans, 408);
  assertHtmlSane(r, '(23+45)×6');
});

// ==================== 6. 一位小數 ====================

test('小數：一位小數減法 0.7 - 0.4 = 0.3', () => {
  const r = run('0.7 - 0.4');
  assert.strictEqual(r.type, 'DECIMAL');
  assert.strictEqual(r.ans, 0.3);
  assertHtmlSane(r, '0.7-0.4');
});

test('小數：一位小數進位加法 0.4 + 0.5 = 0.9', () => {
  const r = run('0.4 + 0.5');
  assert.strictEqual(r.type, 'DECIMAL');
  assert.strictEqual(r.ans, 0.9);
});

// ==================== 7. 同分母分數 ====================

test('分數：同分母加法 3/8 + 2/8 = 5/8', () => {
  const r = run('3/8 + 2/8');
  assert.strictEqual(r.type, 'FRACTION');
  assert.strictEqual(r.ansNum, 5);
  assert.strictEqual(r.d, 8);
  assertHtmlSane(r, '3/8+2/8');
});

test('分數：同分母減法 5/8 - 2/8 = 3/8', () => {
  const r = run('5/8 - 2/8');
  assert.strictEqual(r.type, 'FRACTION');
  assert.strictEqual(r.ansNum, 3);
  assert.strictEqual(r.d, 8);
});

// --- 分數劫持防線回歸（bug: 兩步驟「形式 2」曾把 n/d op n/d 當成除法，t12 全 22 題答案是亂的） ---

test('防線：帶尾端單位與問號的分數題仍走 FRACTION（t12 實際題型）', () => {
  const r = run('2/6 + 2/6 = ？ 塊');
  assert.strictEqual(r.type, 'FRACTION');
  assert.strictEqual(r.ansNum, 4);
  assert.strictEqual(r.d, 6);
  assertHtmlSane(r, '2/6+2/6=?塊');
});

test('防線：3/8 + 5/8 = 8/8 不得被當成 TWO_STEP', () => {
  const r = run('3/8 + 5/8 = ？ 塊');
  assert.strictEqual(r.type, 'FRACTION');
  assert.strictEqual(r.ansNum, 8);
  assert.strictEqual(r.d, 8);
});

test('防線：異分母分數絕不可被當成除法算出亂答（超出課綱應退回觀念導引）', () => {
  const r = run('1/2 + 1/3');
  assert.notStrictEqual(r.type, 'TWO_STEP', '異分母不得進入兩步驟除法路徑');
});

test('防線：真正的「先除後加減」150 ÷ 2 + 80 = 155 仍須正常解析（守衛不可誤傷）', () => {
  const r = run('150 ÷ 2 + 80');
  assert.strictEqual(r.type, 'TWO_STEP');
  assert.strictEqual(r.ans, 155);
});

test('防線：ASCII 斜線版 150 / 2 + 80 = 155 仍須正常解析', () => {
  const r = run('150 / 2 + 80');
  assert.strictEqual(r.type, 'TWO_STEP');
  assert.strictEqual(r.ans, 155);
});

test('防線：1/5 = ？ (小數) 仍須退回觀念導引（等值分數題不可誤判成分數加減）', () => {
  const r = run('1/5 = ？ (小數)');
  assert.strictEqual(r.type, 'CONCEPT_GENERAL');
});

// ==================== 8. column_data 直解通道 ====================

test('column_data：div_long 876 ÷ 4', () => {
  const r = run({ column_data: { type: 'div_long', dividend: 876, divisor: 4 } });
  assert.strictEqual(r.type, 'DIVISION');
  assert.strictEqual(r.quotient, 219);
  assertHtmlSane(r, 'div_long');
});

test('column_data：mul_standard 234 × 12', () => {
  const r = run({ column_data: { type: 'mul_standard', num_top: 234, num_bot: 12 } });
  assert.strictEqual(r.type, 'MULTIPLICATION');
  assert.strictEqual(r.ans, 2808);
  assertHtmlSane(r, 'mul_standard');
});

test('column_data：mul_partial 315 × 24', () => {
  const r = run({ column_data: { type: 'mul_partial', num_top: 315, num_bot: 24 } });
  assert.strictEqual(r.type, 'MULTIPLICATION');
  assert.strictEqual(r.ans, 7560);
  assertHtmlSane(r, 'mul_partial');
});

test('column_data：convert_standard 單位換算卡', () => {
  const r = run({
    column_data: {
      type: 'convert_standard',
      title: '公升毫升換算',
      formula: '1 公升 ＝ 1000 毫升',
      rows: [
        { label: '2 公升 = ', boxVal: '2000', unit: '毫升' },
        { label: '再加 500 毫升 = ', boxVal: '2500', unit: '毫升' }
      ],
      ans: '2500 毫升'
    }
  });
  assert.strictEqual(r.type, 'CONVERT_STANDARD');
  assert.ok(r.summary.includes('2500 毫升'), 'convert_standard 摘要應帶出答案 2500 毫升');
  assertHtmlSane(r, 'convert_standard');
});

// ==================== 9. 觀念題退場 ====================

test('觀念題：無法解析的算式退回觀念導引且不崩潰', () => {
  const r = run({ math: '這個長方形周長怎麼算', question: '長方形周長', options: ['A', 'B'], correct: 0 });
  assert.ok(typeof r.type === 'string' && r.type.length > 0);
  assertHtmlSane(r, 'concept-fallback');
});

test('空字串不會拋例外', () => {
  const r = run('');
  assert.ok(r && typeof r.type === 'string' && r.type.length > 0);
});

// ==================== 10. 全題庫回歸：506 題逐題跑過不爆不髒 ====================

test('全題庫回歸：23 王國 506 題全數可解說且 HTML 無 NaN/undefined', () => {
  const data = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
  assert.ok(Array.isArray(data), '題庫應為陣列');
  assert.strictEqual(data.length, 23, '應為 23 王國');

  let total = 0;
  const failures = [];

  for (const theme of data) {
    for (const monster of theme.monsters || []) {
      total += 1;
      let r;
      try {
        r = VME.explain(monster);
      } catch (err) {
        failures.push(`${monster.id} @ ${theme.theme_id}：拋例外 ${err && err.message}`);
        continue;
      }
      if (!r || typeof r.html !== 'string' || r.html.length === 0) {
        failures.push(`${monster.id} @ ${theme.theme_id}：無 html 輸出`);
        continue;
      }
      if (r.html.includes('NaN')) {
        failures.push(`${monster.id} @ ${theme.theme_id}（${r.type}）：html 含 NaN`);
      }
      if (r.html.includes('undefined')) {
        failures.push(`${monster.id} @ ${theme.theme_id}（${r.type}）：html 含 undefined`);
      }
    }
  }

  assert.strictEqual(total, 506, `題庫總數應為 506，實際 ${total}`);
  assert.strictEqual(failures.length, 0, `有 ${failures.length} 題解說異常：\n` + failures.slice(0, 20).join('\n'));
});

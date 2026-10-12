// -*- coding: utf-8 -*-
/**
 * vertical_math_explainer.js
 * 國小四年級全年級通用直式數學解說引擎 (Universal Vertical Math Explainer)
 * 支援：加法進位直式、減法借位退位直式、乘法單層/部分積直式、長除法四步直式、
 *      兩步驟四則運算直式、小數直式、同分母分數圖解、複名數單位直式與幾何公式導引
 */

(function(global) {
  'use strict';

  var VerticalMathExplainer = {
    explain: function(monsterOrMath) {
      var m = typeof monsterOrMath === 'string' ? { math: monsterOrMath } : (monsterOrMath || {});
      var mathStr = (m.math || '').trim();

      // 0. 特殊檢查：如果怪獸本身有 column_data (如第五章除法或第四章乘法)，可優先提取
      if (m.column_data) {
        if (m.column_data.type === 'div_long') {
          return explainDivision(m.column_data.dividend, m.column_data.divisor, m);
        }
        if (m.column_data.type === 'mul_standard' || m.column_data.type === 'mul_partial' || m.column_data.type === 'mul_twodigit_steps') {
          return explainMultiplication(m.column_data.num_top, m.column_data.num_bot, m);
        }
        if (m.column_data.type === 'convert_standard') {
          return explainConvertStandard(m.column_data, m);
        }
        if (m.column_data.type === 'big_number_standard') {
          return explainBigNumberStandard(m.column_data, m);
        }
      }

      // 1. 同分母分數加減法 (例如: 3/8 ＋ 2/8, 2/6 + 2/6 = ？ 塊)
      //    必須排在兩步驟解析器之前：兩步驟「形式 2」會把 n/d op n/d 誤認成除法
      var fraction = parseFractionArithmetic(mathStr);
      if (fraction) {
        return explainFraction(fraction, m);
      }

      // 2. 兩步驟四則混合題 (例如: 45 + 6 × 7, 80 − 48 ÷ 6, 450 − 120 − 80, 150 × 2 ＋ 80)
      var twoStep = parseTwoStepArithmetic(mathStr);
      if (twoStep) {
        return explainTwoStep(twoStep, m);
      }

      // 3. 一位小數加減法 (例如: 0.7 − 0.4)
      var decimal = parseDecimalArithmetic(mathStr);
      if (decimal) {
        return explainDecimal(decimal, m);
      }

      // 4. 標準基礎四則運算 (A + B, A - B, A × B, A ÷ B)
      var basic = parseBasicArithmetic(mathStr);
      if (basic) {
        if (basic.op === '+') return explainAddition(basic.a, basic.b, m);
        if (basic.op === '-' || basic.op === '−') return explainSubtraction(basic.a, basic.b, m);
        if (basic.op === '×' || basic.op === '*') return explainMultiplication(basic.a, basic.b, m);
        if (basic.op === '÷' || basic.op === '/') return explainDivision(basic.a, basic.b, m);
      }

      // 5. 複名數運算 (時間、長度、重量、容量)
      var compound = parseCompoundMath(mathStr, m);
      if (compound) {
        return explainCompound(compound, m);
      }

      // 6. 其他幾何/單位/未知數觀念題
      return explainConcept(m);
    }
  };

  // ================= 解析函式 =================
  function cleanMathString(str) {
    if (!str) return '';
    return str
      .replace(/[？\?=＝]/g, '')
      .replace(/\s*\.\.\.\s*？?/g, '')
      .replace(/\s*…\s*？?/g, '')
      .replace(/(平方公分|伏特|分鐘|公分|毫米|公斤|公克|公升|毫升|公尺|單位)/g, '')
      .replace(/[下人件份位個元冊分包團塊天封尾度張批把支本朵束杯枚株根條次步滴片瓶盆盒盞盤秒箱籃袋輛道陣隻雙頁顆點]/g, '')
      .replace(/[＋+]/g, '+')
      .replace(/[−－\-]/g, '-')
      .replace(/×/g, '×')
      .replace(/÷/g, '÷')
      .trim();
  }

  function parseBasicArithmetic(str) {
    if (!str) return null;
    var clean = cleanMathString(str);
    var match = clean.match(/^(\d+)\s*([\+\-\×\*\÷\/])\s*(\d+)$/);
    if (match) {
      return {
        a: parseInt(match[1], 10),
        op: match[2],
        b: parseInt(match[3], 10)
      };
    }
    return null;
  }

  function parseTwoStepArithmetic(str) {
    if (!str) return null;
    var clean = cleanMathString(str);
    // 形式 0: 括號先算 (A + B) × C 或 (A - B) × C 或 (A + B) ÷ C
    var m0a = clean.match(/^\(?\s*(\d+)\s*([\+\-])\s*(\d+)\s*\)?\s*([\×\*\/÷])\s*(\d+)/);
    if (m0a && (clean.indexOf('(') !== -1 || clean.indexOf('（') !== -1)) {
      return {
        type: 'BRACKET_FIRST_LEFT',
        numA: parseInt(m0a[1], 10), op1: m0a[2],
        numB: parseInt(m0a[3], 10), op2: m0a[4] === '/' || m0a[4] === '÷' ? '÷' : '×',
        numC: parseInt(m0a[5], 10)
      };
    }
    // 形式 0b: 括號先算 A × (B + C) 或 A ÷ (B - C)
    var m0b = clean.match(/^(\d+)\s*([\×\*\/÷])\s*\(?\s*(\d+)\s*([\+\-])\s*(\d+)\s*\)?/);
    if (m0b && (clean.indexOf('(') !== -1 || clean.indexOf('（') !== -1)) {
      return {
        type: 'BRACKET_FIRST_RIGHT',
        numA: parseInt(m0b[1], 10), op1: m0b[2] === '/' || m0b[2] === '÷' ? '÷' : '×',
        numB: parseInt(m0b[3], 10), op2: m0b[4],
        numC: parseInt(m0b[5], 10)
      };
    }
    // 形式 1: A + B × C 或 A - B ÷ C
    var m1 = clean.match(/^(\d+)\s*([\+\-])\s*(\d+)\s*([\×\*\/÷])\s*(\d+)/);
    if (m1) {
      return {
        type: 'PRIORITY_FIRST_MUL_DIV',
        numA: parseInt(m1[1], 10), op1: m1[2],
        numB: parseInt(m1[3], 10), op2: m1[4] === '/' || m1[4] === '÷' ? '÷' : '×',
        numC: parseInt(m1[5], 10)
      };
    }
    // 形式 2: A × B + C 或 A ÷ B - C
    // 防線：n/d op n/d 是分數不是「先除後加減」，不得進入此路徑（否則 floor(1/2)=0 會算出亂答）
    var fractionShaped = /^\d+\s*\/\s*\d+\s*[\+\-]\s*\d+\s*\/\s*\d+/.test(clean);
    var m2 = clean.match(/^(\d+)\s*([\×\*\/÷])\s*(\d+)\s*([\+\-])\s*(\d+)/);
    if (m2 && !fractionShaped) {
      return {
        type: 'LEFT_TO_RIGHT_MUL_FIRST',
        numA: parseInt(m2[1], 10), op1: m2[2] === '/' || m2[2] === '÷' ? '÷' : '×',
        numB: parseInt(m2[3], 10), op2: m2[4],
        numC: parseInt(m2[5], 10)
      };
    }
    // 形式 3: A - B - C 或 A - B + C
    var m3 = clean.match(/^(\d+)\s*([\+\-])\s*(\d+)\s*([\+\-])\s*(\d+)/);
    if (m3) {
      var op1 = m3[2] === '+' ? '+' : '-';
      var op2 = m3[4] === '+' ? '+' : '-';
      return {
        type: 'CHAIN_ADD_SUB',
        numA: parseInt(m3[1], 10), op1: op1,
        numB: parseInt(m3[3], 10), op2: op2,
        numC: parseInt(m3[5], 10)
      };
    }
    return null;
  }

  function parseDecimalArithmetic(str) {
    if (!str) return null;
    var clean = str.replace(/[？\?=]/g, '').replace(/＋/g, '+').replace(/－/g, '-').trim();
    var m = clean.match(/^(\d+\.\d+)\s*([\+\-\−])\s*(\d+\.\d+)$/);
    if (m) {
      return {
        a: parseFloat(m[1]),
        op: m[2] === '+' ? '+' : '-',
        b: parseFloat(m[3])
      };
    }
    return null;
  }

  function parseFractionArithmetic(str) {
    if (!str) return null;
    var clean = str.replace(/[？\?=＝]/g, '').replace(/＋/g, '+').replace(/[－−]/g, '-').trim();
    // 尾端允許殘留單位或說明文字 (如 "= 塊")，但不可緊接數字或斜線
    var m = clean.match(/^(\d+)\/(\d+)\s*([\+\-\−])\s*(\d+)\/(\d+)(?!\s*[\d\/])/);
    if (m && m[2] === m[5]) { // 同分母
      return {
        n1: parseInt(m[1], 10), d: parseInt(m[2], 10),
        op: m[3] === '+' ? '+' : '-',
        n2: parseInt(m[4], 10)
      };
    }
    return null;
  }

  function parseCompoundMath(str, mObj) {
    if (!str && (!mObj || !mObj.question)) return null;
    var targetStr = (str || '') + ' ' + (mObj && mObj.question ? mObj.question : '') + ' ' + (mObj && mObj.story ? mObj.story : '');

    // 格式 0：複名數連減 / 容量連減題 (例: 3公升200毫升 減去 1公升500毫升 再減去 1公升500毫升，或一次噴1L500mL噴兩次)
    var chainCapM = targetStr.match(/(\d+)\s*公升\s*(\d+)\s*毫升.*?(?:減去|減|－|−|-)\s*(\d+)\s*公升\s*(\d+)\s*毫升.*?(?:再減去|再減|減去|減|－|−|-)\s*(\d+)\s*公升\s*(\d+)\s*毫升/);
    if (chainCapM) {
      return {
        unitType: 'capacity', uMajor: '公升', uMinor: '毫升', base: 1000,
        type: 'COMPOUND_CHAIN_SUB',
        a1: parseInt(chainCapM[1], 10), a2: parseInt(chainCapM[2], 10),
        b1: parseInt(chainCapM[3], 10), b2: parseInt(chainCapM[4], 10),
        c1: parseInt(chainCapM[5], 10), c2: parseInt(chainCapM[6], 10)
      };
    }

    // 格式 0-2：情境容量連減 (例: 一次噴出 1 公升 500 毫升...裝了 3 公升 200 毫升...噴了兩次)
    if ((targetStr.indexOf('噴了兩次') !== -1 || targetStr.indexOf('兩次') !== -1 || targetStr.indexOf('喝了兩次') !== -1 || targetStr.indexOf('倒出兩次') !== -1) && targetStr.indexOf('公升') !== -1) {
      var allCap = [];
      var capRegex = /(\d+)\s*公升(?:\s*(\d+)\s*毫升)?/g;
      var cm;
      while ((cm = capRegex.exec(targetStr)) !== null) {
        allCap.push({ high: parseInt(cm[1], 10), low: cm[2] ? parseInt(cm[2], 10) : 0 });
      }
      if (allCap.length >= 2) {
        // 找出總量 (較大者) 與每次用量
        var totalCap = allCap[0];
        var usedCap = allCap[1];
        if (allCap[0].high * 1000 + allCap[0].low < allCap[1].high * 1000 + allCap[1].low) {
          totalCap = allCap[1]; usedCap = allCap[0];
        }
        return {
          unitType: 'capacity', uMajor: '公升', uMinor: '毫升', base: 1000,
          type: 'COMPOUND_CHAIN_SUB',
          a1: totalCap.high, a2: totalCap.low,
          b1: usedCap.high, b2: usedCap.low,
          c1: usedCap.high, c2: usedCap.low
        };
      }
    }

    // 格式 1：加減法 (例: 10小時30分 + 1小時30分, 14時15分 − 10時40分)
    var timeM = targetStr.match(/(\d+)\s*(?:時|小時)\s*(\d+)\s*分\s*([\+＋\-－−]|減去|減|加上|加)\s*(\d+)\s*(?:時|小時)\s*(\d+)\s*分/);
    if (timeM) {
      var opTime = (timeM[3] === '+' || timeM[3] === '＋' || timeM[3] === '加' || timeM[3] === '加上') ? '+' : '-';
      return {
        unitType: 'time', uMajor: '時', uMinor: '分', base: 60,
        op: opTime,
        a1: parseInt(timeM[1], 10), a2: parseInt(timeM[2], 10),
        b1: parseInt(timeM[4], 10), b2: parseInt(timeM[5], 10)
      };
    }

    // 格式 2：時間經過題 (例: 從 10:40 到 14:15 經過多久？ 或 高鐵 09:30 開車，11:10 到達)
    if (targetStr.indexOf('經過') !== -1 || targetStr.indexOf('行駛') !== -1 || targetStr.indexOf('行車') !== -1 || targetStr.indexOf('到') !== -1) {
      var normTime = targetStr.replace(/：/g, ':');
      var tMatches = [];
      var tReg = /(\d{1,2})\s*[:時]\s*(\d{1,2})/g;
      var tm;
      while ((tm = tReg.exec(normTime)) !== null) {
        tMatches.push({ h: parseInt(tm[1], 10), m: parseInt(tm[2], 10) });
      }
      if (tMatches.length >= 2) {
        var startT = tMatches[0];
        var endT = tMatches[1];
        if ((startT.h * 60 + startT.m) > (endT.h * 60 + endT.m)) {
          var tmp = startT; startT = endT; endT = tmp;
        }
        return {
          unitType: 'time', uMajor: '時', uMinor: '分', base: 60,
          op: '-',
          a1: endT.h, a2: endT.m,
          b1: startT.h, b2: startT.m,
          isElapsed: true,
          startTimeStr: (startT.h < 10 ? '0' : '') + startT.h + ':' + (startT.m < 10 ? '0' : '') + startT.m,
          endTimeStr: (endT.h < 10 ? '0' : '') + endT.h + ':' + (endT.m < 10 ? '0' : '') + endT.m
        };
      }
    }

    var lenM = targetStr.match(/(\d+)\s*公分\s*(\d+)\s*毫米\s*([\+＋\-－−]|減去|減|加上|加)\s*(\d+)\s*公分\s*(\d+)\s*毫米/);
    if (lenM) {
      var opLen = (lenM[3] === '+' || lenM[3] === '＋' || lenM[3] === '加' || lenM[3] === '加上') ? '+' : '-';
      return {
        unitType: 'length', uMajor: '公分', uMinor: '毫米', base: 10,
        op: opLen,
        a1: parseInt(lenM[1], 10), a2: parseInt(lenM[2], 10),
        b1: parseInt(lenM[4], 10), b2: parseInt(lenM[5], 10)
      };
    }

    var wtM = targetStr.match(/(\d+)\s*公斤\s*(\d+)\s*公克\s*([\+＋\-－−]|減去|減|加上|加)\s*(\d+)\s*公斤\s*(\d+)\s*公克/);
    if (wtM) {
      var opWt = (wtM[3] === '+' || wtM[3] === '＋' || wtM[3] === '加' || wtM[3] === '加上') ? '+' : '-';
      return {
        unitType: 'weight', uMajor: '公斤', uMinor: '公克', base: 1000,
        op: opWt,
        a1: parseInt(wtM[1], 10), a2: parseInt(wtM[2], 10),
        b1: parseInt(wtM[4], 10), b2: parseInt(wtM[5], 10)
      };
    }

    var capM = targetStr.match(/(\d+)\s*公升\s*(\d+)\s*毫升\s*([\+＋\-－−]|減去|減|加上|加)\s*(\d+)\s*公升\s*(\d+)\s*毫升/);
    if (capM) {
      var opCap = (capM[3] === '+' || capM[3] === '＋' || capM[3] === '加' || capM[3] === '加上') ? '+' : '-';
      return {
        unitType: 'capacity', uMajor: '公升', uMinor: '毫升', base: 1000,
        op: opCap,
        a1: parseInt(capM[1], 10), a2: parseInt(capM[2], 10),
        b1: parseInt(capM[4], 10), b2: parseInt(capM[5], 10)
      };
    }

    return null;
  }

  // ================= 直式網格排版核心生成器 =================
  function renderAdditionGrid(a, b) {
    var sum = a + b;
    var aStr = String(a);
    var bStr = String(b);
    var maxDigits = Math.max(aStr.length, bStr.length);
    var paddedA = aStr.padStart(maxDigits, '0');
    var paddedB = bStr.padStart(maxDigits, '0');

    var carry = 0;
    var carryList = [];
    for (var i = 0; i < maxDigits; i++) {
      var dIdx = maxDigits - 1 - i;
      var da = parseInt(paddedA[dIdx], 10);
      var db = parseInt(paddedB[dIdx], 10);
      var curSum = da + db + carry;
      var nextCarry = Math.floor(curSum / 10);
      carryList.push(carry);
      carry = nextCarry;
    }
    if (carry > 0) {
      carryList.push(carry);
    }

    var totalCols = Math.max(String(sum).length, maxDigits) + 1;
    var html = '<div class="vme-grid" style="--vme-cols:' + totalCols + ';">';

    // 進位指示列
    html += '<div class="vme-row vme-carry-row">';
    html += '<div class="vme-cell vme-op"></div>';
    var sumStr = String(sum);
    for (var c = 0; c < totalCols - 1; c++) {
      var posFromRight = totalCols - 2 - c;
      var cr = carryList[posFromRight];
      if (cr && cr > 0 && posFromRight > 0) {
        html += '<div class="vme-cell vme-carry">+' + cr + '</div>';
      } else {
        html += '<div class="vme-cell"></div>';
      }
    }
    html += '</div>';

    // 被加數列
    html += '<div class="vme-row">';
    html += '<div class="vme-cell vme-op"></div>';
    for (var ca = 0; ca < totalCols - 1; ca++) {
      var posA = ca - (totalCols - 1 - aStr.length);
      var charA = posA >= 0 ? aStr[posA] : '';
      html += '<div class="vme-cell vme-num' + (charA ? ' filled' : '') + '">' + charA + '</div>';
    }
    html += '</div>';

    // 加數列
    html += '<div class="vme-row">';
    html += '<div class="vme-cell vme-op" style="color:#10B981;">+</div>';
    for (var cb = 0; cb < totalCols - 1; cb++) {
      var posB = cb - (totalCols - 1 - bStr.length);
      var charB = posB >= 0 ? bStr[posB] : '';
      html += '<div class="vme-cell vme-num' + (charB ? ' filled' : '') + '">' + charB + '</div>';
    }
    html += '</div>';

    html += '<div class="vme-divider"></div>';

    // 和列
    html += '<div class="vme-row vme-ans-row">';
    html += '<div class="vme-cell vme-op"></div>';
    for (var cs = 0; cs < totalCols - 1; cs++) {
      var posS = cs - (totalCols - 1 - sumStr.length);
      var charS = posS >= 0 ? sumStr[posS] : '';
      html += '<div class="vme-cell vme-num vme-ans">' + charS + '</div>';
    }
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderSubtractionGrid(a, b) {
    var diff = a - b;
    var aStr = String(a);
    var bStr = String(b);
    var totalDigits = aStr.length;
    var paddedB = bStr.padStart(totalDigits, '0');
    var digitsA = aStr.split('').map(function(c) { return parseInt(c, 10); });

    for (var i = 0; i < totalDigits; i++) {
      var idx = totalDigits - 1 - i;
      var da = digitsA[idx];
      var db = parseInt(paddedB[idx], 10);

      if (da < db) {
        var lendIdx = idx - 1;
        while (lendIdx >= 0 && digitsA[lendIdx] === 0) {
          lendIdx--;
        }
        if (lendIdx >= 0) {
          digitsA[lendIdx] -= 1;
          for (var k = lendIdx + 1; k < idx; k++) {
            digitsA[k] += 9;
          }
          digitsA[idx] += 10;
        }
      }
    }

    var diffStr = String(diff);
    var totalCols = totalDigits + 1;
    var html = '<div class="vme-grid" style="--vme-cols:' + totalCols + ';">';

    // 退位標記列
    html += '<div class="vme-row vme-borrow-row">';
    html += '<div class="vme-cell vme-op"></div>';
    for (var c = 0; c < totalCols - 1; c++) {
      var pos = c - (totalCols - 1 - aStr.length);
      if (pos >= 0 && digitsA[pos] !== parseInt(aStr[pos], 10)) {
        var markVal = (digitsA[pos] >= 10 && pos === totalDigits - 1) ? 10 : digitsA[pos];
        html += '<div class="vme-cell vme-borrow-num">' + markVal + '</div>';
      } else {
        html += '<div class="vme-cell"></div>';
      }
    }
    html += '</div>';

    // 被減數列
    html += '<div class="vme-row">';
    html += '<div class="vme-cell vme-op"></div>';
    for (var ca = 0; ca < totalCols - 1; ca++) {
      var posA = ca - (totalCols - 1 - aStr.length);
      var origChar = posA >= 0 ? aStr[posA] : '';
      var isSlashed = posA >= 0 && digitsA[posA] !== parseInt(aStr[posA], 10) && !(digitsA[posA] >= 10 && posA === totalDigits - 1);
      html += '<div class="vme-cell vme-num' + (isSlashed ? ' vme-slash' : '') + '">' + origChar + '</div>';
    }
    html += '</div>';

    // 減數列
    html += '<div class="vme-row">';
    html += '<div class="vme-cell vme-op" style="color:#06B6D4;">−</div>';
    for (var cb = 0; cb < totalCols - 1; cb++) {
      var posB = cb - (totalCols - 1 - bStr.length);
      var charB = posB >= 0 ? bStr[posB] : '';
      html += '<div class="vme-cell vme-num' + (charB ? ' filled' : '') + '">' + charB + '</div>';
    }
    html += '</div>';

    html += '<div class="vme-divider"></div>';

    // 差列
    html += '<div class="vme-row vme-ans-row">';
    html += '<div class="vme-cell vme-op"></div>';
    for (var cd = 0; cd < totalCols - 1; cd++) {
      var posD = cd - (totalCols - 1 - diffStr.length);
      var charD = posD >= 0 ? diffStr[posD] : '';
      html += '<div class="vme-cell vme-num vme-ans">' + charD + '</div>';
    }
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderMultiplicationGrid(a, b) {
    var prod = a * b;
    var aStr = String(a);
    var bStr = String(b);
    var prodStr = String(prod);
    var totalCols = Math.max(prodStr.length, aStr.length + bStr.length) + 1;

    if (bStr.length > 1) {
      // 國小四年級標準雙層部分積直式板
      var p1 = a * parseInt(bStr[bStr.length - 1], 10);
      var p2 = a * parseInt(bStr[bStr.length - 2], 10);
      var p1Str = String(p1);
      var p2Str = String(p2);

      var html = '<div class="vme-grid" style="--vme-cols:' + totalCols + ';">';
      // 被乘數列
      html += '<div class="vme-row">';
      html += '<div class="vme-cell vme-op"></div>';
      for (var ca = 0; ca < totalCols - 1; ca++) {
        var posA = ca - (totalCols - 1 - aStr.length);
        var charA = posA >= 0 ? aStr[posA] : '';
        html += '<div class="vme-cell vme-num' + (charA ? ' filled' : '') + '">' + charA + '</div>';
      }
      html += '</div>';

      // 乘數列
      html += '<div class="vme-row">';
      html += '<div class="vme-cell vme-op" style="color:#F59E0B;">×</div>';
      for (var cb = 0; cb < totalCols - 1; cb++) {
        var posB = cb - (totalCols - 1 - bStr.length);
        var charB = posB >= 0 ? bStr[posB] : '';
        html += '<div class="vme-cell vme-num' + (charB ? ' filled' : '') + '">' + charB + '</div>';
      }
      html += '</div>';

      html += '<div class="vme-divider"></div>';

      // 第一層部分積 (個位)
      html += '<div class="vme-row">';
      html += '<div class="vme-cell vme-op" style="font-size:0.75rem; color:#A5B4FC;">①</div>';
      for (var c1 = 0; c1 < totalCols - 1; c1++) {
        var pos1 = c1 - (totalCols - 1 - p1Str.length);
        var char1 = pos1 >= 0 ? p1Str[pos1] : '';
        html += '<div class="vme-cell vme-num' + (char1 ? ' filled' : '') + '">' + char1 + '</div>';
      }
      html += '</div>';

      // 第二層部分積 (十位，向左移一位)
      html += '<div class="vme-row">';
      html += '<div class="vme-cell vme-op" style="font-size:0.75rem; color:#A5B4FC;">②</div>';
      for (var c2 = 0; c2 < totalCols - 1; c2++) {
        var pos2 = c2 - (totalCols - 2 - p2Str.length);
        var char2 = (pos2 >= 0 && pos2 < p2Str.length) ? p2Str[pos2] : '';
        html += '<div class="vme-cell vme-num' + (char2 ? ' filled' : '') + '">' + char2 + '</div>';
      }
      html += '</div>';

      html += '<div class="vme-divider"></div>';

      // 總和列
      html += '<div class="vme-row vme-ans-row">';
      html += '<div class="vme-cell vme-op" style="color:#10B981;">＋</div>';
      for (var cp = 0; cp < totalCols - 1; cp++) {
        var posP = cp - (totalCols - 1 - prodStr.length);
        var charP = posP >= 0 ? prodStr[posP] : '';
        html += '<div class="vme-cell vme-num vme-ans">' + charP + '</div>';
      }
      html += '</div>';
      html += '</div>';
      return html;
    }

    var carry = 0;
    var carryRow = [];
    var singleDigitB = parseInt(bStr[bStr.length - 1], 10);

    for (var i = 0; i < aStr.length; i++) {
      var dIdx = aStr.length - 1 - i;
      var curDigit = parseInt(aStr[dIdx], 10);
      var baseMul = curDigit * singleDigitB;
      var curSum = baseMul + carry;
      var nextCarry = Math.floor(curSum / 10);
      carryRow[i + 1] = nextCarry;
      carry = nextCarry;
    }

    var html = '<div class="vme-grid" style="--vme-cols:' + totalCols + ';">';
    // 進位圈列
    html += '<div class="vme-row vme-carry-row">';
    html += '<div class="vme-cell vme-op"></div>';
    for (var c = 0; c < totalCols - 1; c++) {
      var p = totalCols - 2 - c;
      var crVal = carryRow[p];
      if (crVal && crVal > 0) {
        html += '<div class="vme-cell vme-carry">+' + crVal + '</div>';
      } else {
        html += '<div class="vme-cell"></div>';
      }
    }
    html += '</div>';

    // 被乘數列
    html += '<div class="vme-row">';
    html += '<div class="vme-cell vme-op"></div>';
    for (var ca = 0; ca < totalCols - 1; ca++) {
      var posA = ca - (totalCols - 1 - aStr.length);
      var charA = posA >= 0 ? aStr[posA] : '';
      html += '<div class="vme-cell vme-num' + (charA ? ' filled' : '') + '">' + charA + '</div>';
    }
    html += '</div>';

    // 乘數列
    html += '<div class="vme-row">';
    html += '<div class="vme-cell vme-op" style="color:#F59E0B;">×</div>';
    for (var cb = 0; cb < totalCols - 1; cb++) {
      var posB = cb - (totalCols - 1 - bStr.length);
      var charB = posB >= 0 ? bStr[posB] : '';
      html += '<div class="vme-cell vme-num' + (charB ? ' filled' : '') + '">' + charB + '</div>';
    }
    html += '</div>';

    html += '<div class="vme-divider"></div>';

    // 積列
    html += '<div class="vme-row vme-ans-row">';
    html += '<div class="vme-cell vme-op"></div>';
    for (var cp = 0; cp < totalCols - 1; cp++) {
      var posP = cp - (totalCols - 1 - prodStr.length);
      var charP = posP >= 0 ? prodStr[posP] : '';
      html += '<div class="vme-cell vme-num vme-ans">' + charP + '</div>';
    }
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderDivisionBoard(a, b) {
    var quotient = Math.floor(a / b);
    var remainder = a % b;
    var aStr = String(a);
    var divLines = [];
    var curRem = 0;
    for (var i = 0; i < aStr.length; i++) {
      var digit = parseInt(aStr[i], 10);
      var curVal = curRem * 10 + digit;
      var qDigit = Math.floor(curVal / b);
      var prod = qDigit * b;
      var nextRem = curVal - prod;
      divLines.push({
        bringDown: curVal,
        q: qDigit,
        prod: prod,
        diff: nextRem,
        digitIdx: i
      });
      curRem = nextRem;
    }
    var qStr = String(quotient).split('').join('   ');
    var html = '<div class="vme-longdiv-board">';
    html += '<div class="vme-ld-quotient">' + qStr + '</div>';
    html += '<div class="vme-ld-roof"><span class="vme-ld-divisor">' + b + ' ) </span><span class="vme-ld-dividend">' + aStr.split('').join('   ') + '</span></div>';
    html += '<div class="vme-ld-body">';
    divLines.forEach(function(dl, idx) {
      if (dl.q > 0 || idx > 0) {
        var pad = '&nbsp;'.repeat(idx * 3);
        html += '<div class="vme-ld-step">' + pad + String(dl.prod).padStart(2, ' ') + '</div>';
        html += '<div class="vme-ld-subline">' + pad + '----</div>';
        if (idx < divLines.length - 1) {
          var nextD = aStr[idx + 1];
          html += '<div class="vme-ld-step">' + pad + dl.diff + ' ' + nextD + '</div>';
        } else {
          html += '<div class="vme-ld-remainder">' + pad + dl.diff + ' (餘數)</div>';
        }
      }
    });
    html += '</div></div>';
    return html;
  }

  function renderOperationBoard(op, a, b) {
    if (op === '+') return renderAdditionGrid(a, b);
    if (op === '-' || op === '−') return renderSubtractionGrid(a, b);
    if (op === '×' || op === '*') return renderMultiplicationGrid(a, b);
    if (op === '÷' || op === '/') return renderDivisionBoard(a, b);
    return '';
  }

  // ================= 0. 大數位值拆解解說 (四年級 >= 6 位數大數專用) =================
  function explainBigNumberAddition(a, b, m) {
    var sum = a + b;
    var wanA = Math.floor(a / 10000);
    var remA = a % 10000;
    var wanB = Math.floor(b / 10000);
    var remB = b % 10000;
    var sumWan = wanA + wanB;
    var descA = wanA + '萬' + (remA > 0 ? ('與' + remA) : '');
    var descB = wanB + '萬' + (remB > 0 ? ('與' + remB) : '');

    var stepDetails = [
      '① 拆解整萬：把 ' + a + ' 拆成 ' + descA + '，' + b + ' 拆成 ' + descB,
      '② 整萬相加：' + wanA + '萬 ＋ ' + wanB + '萬 ＝ ' + sumWan + '萬',
      '③ 合併總答：' + sumWan + '萬' + (remA + remB > 0 ? (' ＋ ' + (remA + remB)) : '') + ' ＝ ' + sum
    ];

    var html = '<div class="vme-box vme-big-number">';
    html += '<div class="vme-title">🌌 大數位值拆解加法 (四年級以萬為單位思考)</div>';
    html += '<div style="background:#1E293B; border-radius:10px; padding:12px; margin:10px 0; border:1px solid #475569;">';
    html += '<div style="color:#38BDF8; font-weight:bold; margin-bottom:6px;">🔹 ① 拆解整萬：' + a + ' (' + descA + ')，' + b + ' (' + descB + ')</div>';
    html += '<div style="color:#FDE68A; margin-bottom:6px;">🔹 ② 整萬相加：' + wanA + '萬 ＋ ' + wanB + '萬 ＝ ' + sumWan + '萬</div>';
    html += '<div style="color:#34D399; font-weight:bold;">🔹 ③ 合併總答：' + sumWan + '萬' + (remA + remB > 0 ? (' ＋ ' + (remA + remB)) : '') + ' ＝ ' + sum + '</div>';
    html += '</div>';
    html += '<div class="vme-steps-box">';
    html += '<div class="vme-steps-header">💡 軍師大數位值拆解解說：</div>';
    html += '<ol class="vme-steps-list">';
    stepDetails.forEach(function(s) { html += '<li>' + s + '</li>'; });
    html += '</ol>';
    html += '<div class="vme-summary">🎉 計算完成！' + a + ' + ' + b + ' ＝ <span class="vme-highlight">' + sum + '</span></div>';
    html += '</div></div>';

    return {
      type: 'ADDITION', a: a, b: b, ans: sum,
      html: html, steps: stepDetails, summary: a + ' + ' + b + ' = ' + sum
    };
  }

  function explainBigNumberSubtraction(a, b, m) {
    var diff = a - b;
    var wanA = Math.floor(a / 10000);
    var remA = a % 10000;
    var wanB = Math.floor(b / 10000);
    var remB = b % 10000;
    var diffWan = wanA - wanB;
    var descA = wanA + '萬' + (remA > 0 ? ('與' + remA) : '');
    var descB = wanB + '萬' + (remB > 0 ? ('與' + remB) : '');

    var stepDetails = [
      '① 拆解整萬：把 ' + a + ' 拆成 ' + descA + '，' + b + ' 拆成 ' + descB,
      '② 整萬相減：' + wanA + '萬 − ' + wanB + '萬 ＝ ' + diffWan + '萬',
      '③ 合併總答：' + diffWan + '萬' + (remA !== remB ? (' ＋ ' + (remA - remB)) : '') + ' ＝ ' + diff
    ];

    var html = '<div class="vme-box vme-big-number">';
    html += '<div class="vme-title">🌌 大數位值拆解減法 (四年級以萬為單位思考)</div>';
    html += '<div style="background:#1E293B; border-radius:10px; padding:12px; margin:10px 0; border:1px solid #475569;">';
    html += '<div style="color:#38BDF8; font-weight:bold; margin-bottom:6px;">🔹 ① 拆解整萬：' + a + ' (' + descA + ')，' + b + ' (' + descB + ')</div>';
    html += '<div style="color:#FDE68A; margin-bottom:6px;">🔹 ② 整萬相減：' + wanA + '萬 − ' + wanB + '萬 ＝ ' + diffWan + '萬</div>';
    html += '<div style="color:#34D399; font-weight:bold;">🔹 ③ 合併總答：' + diffWan + '萬' + (remA !== remB ? (' ＋ ' + (remA - remB)) : '') + ' ＝ ' + diff + '</div>';
    html += '</div>';
    html += '<div class="vme-steps-box">';
    html += '<div class="vme-steps-header">💡 軍師大數位值拆解解說：</div>';
    html += '<ol class="vme-steps-list">';
    stepDetails.forEach(function(s) { html += '<li>' + s + '</li>'; });
    html += '</ol>';
    html += '<div class="vme-summary">🎉 計算完成！' + a + ' − ' + b + ' ＝ <span class="vme-highlight">' + diff + '</span></div>';
    html += '</div></div>';

    return {
      type: 'SUBTRACTION', a: a, b: b, ans: diff,
      html: html, steps: stepDetails, summary: a + ' − ' + b + ' = ' + diff
    };
  }

  function explainBigNumberStandard(colData, m) {
    var steps = colData.steps || {};
    var stepDetails = [];
    for (var k in steps) {
      if (steps[k] && steps[k].target) stepDetails.push(steps[k].target);
    }
    var html = '<div class="vme-box vme-big-number">';
    html += '<div class="vme-title">' + (colData.title || '🌌 大數位值拆解鷹架') + '</div>';
    html += '<div style="background:#1E293B; border-radius:10px; padding:12px; margin:10px 0; border:1px solid #475569;">';
    (colData.rows || []).forEach(function(r) {
      html += '<div style="color:#38BDF8; margin-bottom:4px;">' + r.label + ' <span style="color:#FDE68A; font-weight:bold;">' + r.boxVal + '</span>' + (r.unit ? (' ' + r.unit) : '') + '</div>';
    });
    html += '</div>';
    html += '<div class="vme-steps-box">';
    html += '<div class="vme-steps-header">💡 軍師解題步驟：</div>';
    html += '<ol class="vme-steps-list">';
    stepDetails.forEach(function(s) { html += '<li>' + s + '</li>'; });
    html += '</ol>';
    html += '<div class="vme-summary">🎉 答案：<span class="vme-highlight">' + colData.ans + '</span></div>';
    html += '</div></div>';
    return {
      type: 'BIG_NUMBER', ans: colData.ans,
      html: html, steps: stepDetails, summary: '答案為 ' + colData.ans
    };
  }

  // ================= 1. 加法直式解說 =================
  function explainAddition(a, b, m) {
    var sum = a + b;
    var aStr = String(a);
    var bStr = String(b);
    var maxDigits = Math.max(aStr.length, bStr.length);

    // 四年級一億以內大數加法 (>= 6 位數)：採用大數位值拆解解說
    if (maxDigits >= 6) {
      return explainBigNumberAddition(a, b, m);
    }

    var paddedA = aStr.padStart(maxDigits, '0');
    var paddedB = bStr.padStart(maxDigits, '0');

    var carry = 0;
    var stepDetails = [];
    var colNames = ['個位', '十位', '百位', '千位', '萬位', '十萬位'];

    for (var i = 0; i < maxDigits; i++) {
      var dIdx = maxDigits - 1 - i;
      var da = parseInt(paddedA[dIdx], 10);
      var db = parseInt(paddedB[dIdx], 10);
      var curCol = colNames[i] || ('第' + (i + 1) + '位');
      var curSum = da + db + carry;
      var curDigit = curSum % 10;
      var nextCarry = Math.floor(curSum / 10);

      var stepText = curCol + '相加：' + da + ' + ' + db;
      if (carry > 0) stepText += ' + 進位 ' + carry;
      stepText += ' = ' + curSum + ' ➔ ' + curCol + '寫 ' + curDigit;
      if (nextCarry > 0) stepText += '，向' + (colNames[i + 1] || '上一位') + '進 ' + nextCarry;
      stepDetails.push(stepText);

      carry = nextCarry;
    }
    if (carry > 0) {
      stepDetails.push((colNames[maxDigits] || '最高位') + '寫入進位 ' + carry);
    }

    var html = '<div class="vme-box vme-addition">';
    html += '<div class="vme-title">📐 加法直式對齊計算板</div>';
    html += renderAdditionGrid(a, b);
    html += '<div class="vme-steps-box">';
    html += '<div class="vme-steps-header">💡 軍師直式微步階解說：</div>';
    html += '<ol class="vme-steps-list">';
    stepDetails.forEach(function(s) { html += '<li>' + s + '</li>'; });
    html += '</ol>';
    html += '<div class="vme-summary">🎉 計算完成！' + a + ' + ' + b + ' ＝ <span class="vme-highlight">' + sum + '</span></div>';
    html += '</div></div>';

    return {
      type: 'ADDITION', a: a, b: b, ans: sum,
      html: html, steps: stepDetails, summary: a + ' + ' + b + ' = ' + sum
    };
  }

  // ================= 2. 減法退位借位直式解說 =================
  function explainSubtraction(a, b, m) {
    var diff = a - b;
    var aStr = String(a);
    var bStr = String(b);
    var totalDigits = aStr.length;

    // 四年級一億以內大數減法 (>= 6 位數)：採用大數位值拆解解說
    if (totalDigits >= 6) {
      return explainBigNumberSubtraction(a, b, m);
    }

    var paddedB = bStr.padStart(totalDigits, '0');

    var colNames = ['個位', '十位', '百位', '千位', '萬位', '十萬位'];
    var stepDetails = [];
    var digitsA = aStr.split('').map(function(c) { return parseInt(c, 10); });

    for (var i = 0; i < totalDigits; i++) {
      var idx = totalDigits - 1 - i;
      var curCol = colNames[i] || ('第' + (i + 1) + '位');
      var da = digitsA[idx];
      var db = parseInt(paddedB[idx], 10);

      if (da < db) {
        var lendIdx = idx - 1;
        while (lendIdx >= 0 && digitsA[lendIdx] === 0) {
          lendIdx--;
        }
        var borrowChain = [];
        if (lendIdx >= 0) {
          digitsA[lendIdx] -= 1;
          borrowChain.push(colNames[totalDigits - 1 - lendIdx] + '借出 1 (剩 ' + digitsA[lendIdx] + ')');
          for (var k = lendIdx + 1; k < idx; k++) {
            digitsA[k] += 9;
            borrowChain.push(colNames[totalDigits - 1 - k] + '退 10 借 1 (變 ' + digitsA[k] + ')');
          }
          digitsA[idx] += 10;
        }
        var sub10 = 10 - db;
        var resD = sub10 + da;
        stepDetails.push(curCol + '：' + da + ' 減 ' + db + ' 不夠減！' + borrowChain.join('，') + '，' + curCol + '借到 10。💡 破十法：10 − ' + db + ' = ' + sub10 + '，' + sub10 + ' ＋ ' + da + ' = ' + resD + ' ➔ ' + curCol + '寫 ' + resD);
      } else {
        var resD2 = da - db;
        stepDetails.push(curCol + '：' + da + ' - ' + db + ' = ' + resD2 + ' ➔ ' + curCol + '寫 ' + resD2);
      }
    }

    var html = '<div class="vme-box vme-subtraction">';
    html += '<div class="vme-title">📐 減法退位借位直式板 (破十法位值對齊)</div>';
    html += renderSubtractionGrid(a, b);
    html += '<div class="vme-steps-box">';
    html += '<div class="vme-steps-header">💡 軍師退位借位微步階解說：</div>';
    html += '<ol class="vme-steps-list">';
    stepDetails.forEach(function(s) { html += '<li>' + s + '</li>'; });
    html += '</ol>';
    html += '<div class="vme-summary">🎉 計算完成！' + a + ' − ' + b + ' ＝ <span class="vme-highlight">' + diff + '</span></div>';
    html += '</div></div>';

    return {
      type: 'SUBTRACTION', a: a, b: b, ans: diff,
      html: html, steps: stepDetails, summary: a + ' − ' + b + ' = ' + diff
    };
  }

  // ================= 3. 乘法直式解說 =================
  function explainMultiplication(a, b, m) {
    var prod = a * b;
    var aStr = String(a);
    var bStr = String(b);
    var stepDetails = [];

    if (bStr.length > 1) {
      // 國小四年級標準：三位數乘以兩位數（雙層部分積細粒度 7 微步階解說）
      if (bStr.length === 2 && a >= 100) {
        var b0 = parseInt(bStr[1], 10);
        var b1 = parseInt(bStr[0], 10);
        var oA = a % 10;
        var tA = Math.floor((a % 100) / 10);
        var hA = Math.floor(a / 100);

        // 第一層（乘數個位 b0）
        var mul1 = oA * b0;
        var c1 = Math.floor(mul1 / 10);
        var w1 = mul1 % 10;
        stepDetails.push('① 個位九九乘法：' + oA + ' × ' + b0 + ' ＝ ' + mul1 + '（寫 ' + w1 + (c1 > 0 ? (' 進 ' + c1) : '') + '）');

        var mul2 = tA * b0;
        var sum2 = mul2 + c1;
        var c2 = Math.floor(sum2 / 10);
        var w2 = sum2 % 10;
        stepDetails.push('② 十位乘加進位：' + tA + ' × ' + b0 + ' ＝ ' + mul2 + (c1 > 0 ? ('，加 ' + c1 + ' ＝ ' + sum2) : '') + '（寫 ' + w2 + (c2 > 0 ? (' 進 ' + c2) : '') + '）');

        var mul3 = hA * b0;
        var sum3 = mul3 + c2;
        var p1 = a * b0;
        stepDetails.push('③ 百位乘加進位：' + hA + ' × ' + b0 + ' ＝ ' + mul3 + (c2 > 0 ? ('，加 ' + c2 + ' ＝ ' + sum3) : '') + '（寫 ' + sum3 + '，第一層部分積為 ' + p1 + '）');

        // 第二層（乘數十位 b1）
        var mul4 = oA * b1;
        var c3 = Math.floor(mul4 / 10);
        var w4 = mul4 % 10;
        stepDetails.push('④ 十位乘個位：' + oA + ' × ' + b1 + ' ＝ ' + mul4 + '（十位寫 ' + w4 + (c3 > 0 ? (' 進 ' + c3) : '') + '）');

        var mul5 = tA * b1;
        var sum5 = mul5 + c3;
        var c4 = Math.floor(sum5 / 10);
        var w5 = sum5 % 10;
        stepDetails.push('⑤ 十位乘十位：' + tA + ' × ' + b1 + ' ＝ ' + mul5 + (c3 > 0 ? ('，加 ' + c3 + ' ＝ ' + sum5) : '') + '（百位寫 ' + w5 + (c4 > 0 ? (' 進 ' + c4) : '') + '）');

        var mul6 = hA * b1;
        var sum6 = mul6 + c4;
        var p2Total = a * b1 * 10;
        stepDetails.push('⑥ 十位乘百位：' + hA + ' × ' + b1 + ' ＝ ' + mul6 + (c4 > 0 ? ('，加 ' + c4 + ' ＝ ' + sum6) : '') + '（千位寫 ' + sum6 + '，第二層部分積為 ' + p2Total + '）');

        // 第三層（垂直相加）
        stepDetails.push('⑦ 兩層相加：' + p1 + ' ＋ ' + p2Total + ' ＝ ' + prod);
      } else {
        var p1 = a * parseInt(bStr[bStr.length - 1], 10);
        var p2 = a * parseInt(bStr[bStr.length - 2], 10);
        stepDetails.push('第一層（個位部分積）：' + a + ' × ' + bStr[bStr.length - 1] + ' ＝ ' + p1);
        stepDetails.push('第二層（十位部分積）：' + a + ' × ' + bStr[bStr.length - 2] + '0 ＝ ' + (p2 * 10) + '（十位對齊寫 ' + p2 + '）');
        stepDetails.push('第三層（分層直式加總）：' + p1 + ' ＋ ' + (p2 * 10) + ' ＝ ' + prod);
      }

      var html = '<div class="vme-box vme-multiplication">';
      html += '<div class="vme-title">📐 三位數乘兩位數分層直式板 (細粒度部分積對齊)</div>';
      html += renderMultiplicationGrid(a, b);
      html += '<div class="vme-steps-box">';
      html += '<div class="vme-steps-header">💡 軍師乘法細粒度微步階解說：</div>';
      html += '<ol class="vme-steps-list">';
      stepDetails.forEach(function(s) { html += '<li>' + s + '</li>'; });
      html += '</ol>';
      html += '<div class="vme-summary">🎉 計算完成！' + a + ' × ' + b + ' ＝ <span class="vme-highlight">' + prod + '</span></div>';
      html += '</div></div>';

      return {
        type: 'MULTIPLICATION', a: a, b: b, ans: prod,
        html: html, steps: stepDetails, summary: a + ' × ' + b + ' = ' + prod
      };
    }

    var colNames = ['個位', '十位', '百位', '千位'];
    var carry = 0;
    var singleDigitB = parseInt(bStr[bStr.length - 1], 10);

    for (var i = 0; i < aStr.length; i++) {
      var dIdx = aStr.length - 1 - i;
      var curDigit = parseInt(aStr[dIdx], 10);
      var curCol = colNames[i] || ('第' + (i + 1) + '位');
      var baseMul = curDigit * singleDigitB;
      var curSum = baseMul + carry;
      var writeDigit = curSum % 10;
      var nextCarry = Math.floor(curSum / 10);

      var sText = curCol + '相乘：' + curDigit + ' × ' + singleDigitB + ' = ' + baseMul;
      if (carry > 0) sText += '，加上進位 ' + carry + ' = ' + curSum;
      sText += ' ➔ ' + curCol + '寫 ' + writeDigit;
      if (nextCarry > 0) sText += '，向' + (colNames[i + 1] || '上一位') + '進 ' + nextCarry;
      stepDetails.push(sText);

      carry = nextCarry;
    }

    var html = '<div class="vme-box vme-multiplication">';
    html += '<div class="vme-title">📐 乘法單層進位直式板</div>';
    html += renderMultiplicationGrid(a, b);
    html += '<div class="vme-steps-box">';
    html += '<div class="vme-steps-header">💡 軍師乘法微步階鷹架解說：</div>';
    html += '<ol class="vme-steps-list">';
    stepDetails.forEach(function(s) { html += '<li>' + s + '</li>'; });
    html += '</ol>';
    html += '<div class="vme-summary">🎉 計算完成！' + a + ' × ' + b + ' ＝ <span class="vme-highlight">' + prod + '</span></div>';
    html += '</div></div>';

    return {
      type: 'MULTIPLICATION', a: a, b: b, ans: prod,
      html: html, steps: stepDetails, summary: a + ' × ' + b + ' = ' + prod
    };
  }

  // ================= 4. 長除法四步直式解說 =================
  function explainDivision(a, b, m) {
    var quotient = Math.floor(a / b);
    var remainder = a % b;
    var aStr = String(a);
    var stepDetails = [];

    var curRem = 0;
    for (var i = 0; i < aStr.length; i++) {
      var digit = parseInt(aStr[i], 10);
      var curVal = curRem * 10 + digit;
      var qDigit = Math.floor(curVal / b);
      var prod = qDigit * b;
      var nextRem = curVal - prod;

      var stepName = (i === 0 && aStr.length === 3 ? '百位' : (i === 1 && aStr.length === 3 ? '十位' : '個位')) + '除法';
      var stepDesc = '第 ' + (i + 1) + ' 輪 (' + stepName + ')：' + (curRem > 0 ? ('移下 ' + digit + ' 變成 ' + curVal) : ('拿 ' + curVal)) + '，' + curVal + ' ÷ ' + b + ' 商 ' + qDigit + '。' + qDigit + ' × ' + b + ' = ' + prod + '，' + curVal + ' - ' + prod + ' = ' + nextRem;
      stepDetails.push(stepDesc);

      curRem = nextRem;
    }

    var html = '<div class="vme-box vme-division">';
    html += '<div class="vme-title">📐 長除法直式步驟板 (商 ➔ 乘 ➔ 減 ➔ 移下來)</div>';
    html += renderDivisionBoard(a, b);
    html += '<div class="vme-steps-box">';
    html += '<div class="vme-steps-header">💡 軍師長除法四步循環解說：</div>';
    html += '<ol class="vme-steps-list">';
    stepDetails.forEach(function(s) { html += '<li>' + s + '</li>'; });
    html += '</ol>';
    html += '<div class="vme-summary">🎉 計算完成！' + a + ' ÷ ' + b + ' ＝ <span class="vme-highlight">' + quotient + (remainder > 0 ? (' … ' + remainder) : '') + '</span></div>';
    html += '</div></div>';

    return {
      type: 'DIVISION', a: a, b: b, quotient: quotient, remainder: remainder,
      html: html, steps: stepDetails, summary: a + ' ÷ ' + b + ' = ' + quotient + (remainder > 0 ? (' … ' + remainder) : '')
    };
  }

  // ================= 5. 兩步驟四則運算直式解說 =================
  function explainTwoStep(p, m) {
    var steps = [];
    var finalAns = 0;
    var formulaDisplay = m.math;

    var s1Op = '', s1A = 0, s1B = 0, s1Res = 0, s1Title = '';
    var s2Op = '', s2A = 0, s2B = 0, s2Res = 0, s2Title = '';

    if (p.type === 'BRACKET_FIRST_LEFT') {
      // 例: (12 + 18) × 4 -> 括號先算: 12 + 18 = 30, 30 × 4 = 120
      var mid0a = p.op1 === '+' ? (p.numA + p.numB) : (p.numA - p.numB);
      var op1Sign0a = p.op1 === '+' ? '＋' : '−';
      steps.push('🔒 【括號最優先法則】：算式中有括號，必須先算括號裡面的算式！');
      steps.push('1. 括號內先算：' + p.numA + ' ' + op1Sign0a + ' ' + p.numB + ' ＝ ' + mid0a);
      finalAns = p.op2 === '×' ? (mid0a * p.numC) : Math.floor(mid0a / p.numC);
      steps.push('2. 再乘除外面的數：' + mid0a + ' ' + p.op2 + ' ' + p.numC + ' ＝ ' + finalAns);

      formulaDisplay = '<span style="font-size:1.1em;">(' + p.numA + ' ' + op1Sign0a + ' ' + p.numB + ') ' + p.op2 + ' ' + p.numC + ' ＝ ' + mid0a + ' ' + p.op2 + ' ' + p.numC + ' ＝ ' + finalAns + '</span>';

      s1Op = p.op1;
      s1A = p.numA;
      s1B = p.numB;
      s1Res = mid0a;
      s1Title = '(' + p.numA + ' ' + op1Sign0a + ' ' + p.numB + ') ＝ ' + mid0a;

      s2Op = p.op2;
      s2A = mid0a;
      s2B = p.numC;
      s2Res = finalAns;
      s2Title = mid0a + ' ' + p.op2 + ' ' + p.numC + ' ＝ ' + finalAns;
    } else if (p.type === 'BRACKET_FIRST_RIGHT') {
      // 例: 4 × (15 - 5) -> 括號先算: 15 - 5 = 10, 4 × 10 = 40
      var mid0b = p.op2 === '+' ? (p.numB + p.numC) : (p.numB - p.numC);
      var op2Sign0b = p.op2 === '+' ? '＋' : '−';
      steps.push('🔒 【括號最優先法則】：算式中有括號，必須先算括號裡面的算式！');
      steps.push('1. 括號內先算：' + p.numB + ' ' + op2Sign0b + ' ' + p.numC + ' ＝ ' + mid0b);
      finalAns = p.op1 === '×' ? (p.numA * mid0b) : Math.floor(p.numA / mid0b);
      steps.push('2. 再與前面的數相乘除：' + p.numA + ' ' + p.op1 + ' ' + mid0b + ' ＝ ' + finalAns);

      formulaDisplay = '<span style="font-size:1.1em;">' + p.numA + ' ' + p.op1 + ' (' + p.numB + ' ' + op2Sign0b + ' ' + p.numC + ') ＝ ' + p.numA + ' ' + p.op1 + ' ' + mid0b + ' ＝ ' + finalAns + '</span>';

      s1Op = p.op2;
      s1A = p.numB;
      s1B = p.numC;
      s1Res = mid0b;
      s1Title = '(' + p.numB + ' ' + op2Sign0b + ' ' + p.numC + ') ＝ ' + mid0b;

      s2Op = p.op1;
      s2A = p.numA;
      s2B = mid0b;
      s2Res = finalAns;
      s2Title = p.numA + ' ' + p.op1 + ' ' + mid0b + ' ＝ ' + finalAns;
    } else if (p.type === 'PRIORITY_FIRST_MUL_DIV') {
      // 例: 45 + 6 × 7 -> 先乘除後加減: 6 × 7 = 42, 45 + 42 = 87
      // 例: 84 - 48 ÷ 6 -> 先 48 ÷ 6 = 8, 84 - 8 = 76
      var mid = p.op2 === '×' ? (p.numB * p.numC) : Math.floor(p.numB / p.numC);
      var op1Sign = p.op1 === '+' ? '＋' : '−';
      var op1Name = p.op1 === '+' ? '加號' : '減號';
      var wrongLeftToRight = p.op1 === '+' ?
        (p.op2 === '×' ? (p.numA + p.numB) * p.numC : Math.floor((p.numA + p.numB) / p.numC)) :
        (p.op2 === '×' ? (p.numA - p.numB) * p.numC : Math.floor((p.numA - p.numB) / p.numC));

      steps.push('⚠️ 【直覺警報・反思說明】：千萬不能從左往右算！若先算前面會算出 ' + wrongLeftToRight + '，在生活情境中完全不合理！');
      steps.push('🧴 【強力膠法則】：『' + p.op2 + '』是強力膠，把 ' + p.numB + ' 和 ' + p.numC + ' 緊緊黏成一團！畫底線優先打包計算：' + p.numB + ' ' + p.op2 + ' ' + p.numC + ' ＝ ' + mid);
      steps.push('📌 【照抄排原位】：沒算到的數字（' + p.numA + ' 和 ' + op1Sign + '）乖乖留在前面排原位，算出來的 ' + mid + ' 補在後面。');
      if (p.op1 === '+') {
        finalAns = p.numA + mid;
      } else {
        finalAns = p.numA - mid;
      }
      steps.push('🛒 【小推車結算】：最後啟動' + op1Name + '小推車：' + p.numA + ' ' + op1Sign + ' ' + mid + ' ＝ ' + finalAns);

      formulaDisplay = '<span style="font-size:1.1em;">' + p.numA + ' ' + op1Sign +
        ' <u style="text-decoration: underline wavy #EC4899; padding: 0 4px; background: rgba(236,72,153,0.1); border-radius: 4px;">' +
        p.numB + ' ' + p.op2 + ' ' + p.numC + '</u> ＝ ' +
        p.numA + ' ' + op1Sign + ' ' + mid + ' ＝ ' + finalAns + '</span>';

      s1Op = p.op2;
      s1A = p.numB;
      s1B = p.numC;
      s1Res = mid;
      s1Title = p.numB + ' ' + p.op2 + ' ' + p.numC + ' ＝ ' + mid;

      s2Op = p.op1;
      s2A = p.numA;
      s2B = mid;
      s2Res = finalAns;
      s2Title = p.numA + ' ' + (p.op1 === '+' ? '+' : '−') + ' ' + mid + ' ＝ ' + finalAns;
    } else if (p.type === 'LEFT_TO_RIGHT_MUL_FIRST') {
      // 例: 150 × 2 + 80 -> 150 × 2 = 300, 300 + 80 = 380
      var mid2 = p.op1 === '×' ? (p.numA * p.numB) : Math.floor(p.numA / p.numB);
      steps.push('1. 由左至右先算乘除法：' + p.numA + ' ' + p.op1 + ' ' + p.numB + ' ＝ ' + mid2);
      if (p.op2 === '+') {
        finalAns = mid2 + p.numC;
        steps.push('2. 再加上後面的數：' + mid2 + ' ＋ ' + p.numC + ' ＝ ' + finalAns);
      } else {
        finalAns = mid2 - p.numC;
        steps.push('2. 再減去後面的數：' + mid2 + ' − ' + p.numC + ' ＝ ' + finalAns);
      }

      s1Op = p.op1;
      s1A = p.numA;
      s1B = p.numB;
      s1Res = mid2;
      s1Title = p.numA + ' ' + p.op1 + ' ' + p.numB + ' ＝ ' + mid2;

      s2Op = p.op2;
      s2A = mid2;
      s2B = p.numC;
      s2Res = finalAns;
      s2Title = mid2 + ' ' + (p.op2 === '+' ? '+' : '−') + ' ' + p.numC + ' ＝ ' + finalAns;
    } else if (p.type === 'CHAIN_ADD_SUB') {
      // 例: 450 - 120 - 80 -> 450 - 120 = 330, 330 - 80 = 250
      var mid3 = p.op1 === '+' ? (p.numA + p.numB) : (p.numA - p.numB);
      steps.push('1. 由左往右依序計算！第一步：' + p.numA + ' ' + (p.op1 === '+' ? '＋' : '−') + ' ' + p.numB + ' ＝ ' + mid3);
      finalAns = p.op2 === '+' ? (mid3 + p.numC) : (mid3 - p.numC);
      steps.push('2. 第二步：' + mid3 + ' ' + (p.op2 === '+' ? '＋' : '−') + ' ' + p.numC + ' ＝ ' + finalAns);

      s1Op = p.op1;
      s1A = p.numA;
      s1B = p.numB;
      s1Res = mid3;
      s1Title = p.numA + ' ' + (p.op1 === '+' ? '+' : '−') + ' ' + p.numB + ' ＝ ' + mid3;

      s2Op = p.op2;
      s2A = mid3;
      s2B = p.numC;
      s2Res = finalAns;
      s2Title = mid3 + ' ' + (p.op2 === '+' ? '+' : '−') + ' ' + p.numC + ' ＝ ' + finalAns;
    }

    var svgArea = '';
    var svgDiagram = '';
    if (p.type === 'CHAIN_ADD_SUB' && p.op1 === '-' && p.op2 === '-') {
      var visualSpec = (m && m.visual && m.visual.type === 'number_line') ? m.visual : {
        type: 'number_line',
        min: 0,
        max: Math.ceil(p.numA / 500) * 500 || p.numA,
        start: p.numA,
        jumps: [
          { delta: -p.numB, label: '第1步 −' + p.numB, target: mid3 },
          { delta: -p.numC, label: '第2步 −' + p.numC, target: finalAns }
        ],
        result: finalAns
      };
      svgDiagram = renderNumberLineSvg(visualSpec);
      svgArea = '<div class="vme-visual-area" style="margin:12px 0;">' +
        '<div style="font-size:0.85rem; color:#94A3B8; margin-bottom:4px; font-weight:bold;">📈 數線圖像化解題模型（兩步連減倒退跳躍）：</div>' +
        svgDiagram + '</div>';
    }

    var s1BoardHtml = renderOperationBoard(s1Op, s1A, s1B);
    var s2BoardHtml = renderOperationBoard(s2Op, s2A, s2B);

    var twoStepBoardsHtml = '<div class="vme-twostep-boards" style="display:flex; flex-wrap:wrap; gap:16px; justify-content:center; margin:16px 0;">' +
      '<div class="vme-step-board-item ' + (s1Op === '+' ? 'vme-addition' : ((s1Op === '-' || s1Op === '−') ? 'vme-subtraction' : '')) + '" style="flex:1; min-width:220px; max-width:320px; background:rgba(30,41,59,0.7); border:1px solid #334155; border-radius:12px; padding:12px; text-align:center;">' +
        '<div class="vme-step-badge" style="color:#38BDF8; font-weight:800; font-size:0.95rem; margin-bottom:8px;">📐 步驟一直式板：' + s1Title + '</div>' +
        s1BoardHtml +
      '</div>' +
      '<div class="vme-step-board-item ' + (s2Op === '+' ? 'vme-addition' : ((s2Op === '-' || s2Op === '−') ? 'vme-subtraction' : '')) + '" style="flex:1; min-width:220px; max-width:320px; background:rgba(30,41,59,0.7); border:1px solid #334155; border-radius:12px; padding:12px; text-align:center;">' +
        '<div class="vme-step-badge" style="color:#38BDF8; font-weight:800; font-size:0.95rem; margin-bottom:8px;">📐 步驟二直式板：' + s2Title + '</div>' +
        s2BoardHtml +
      '</div>' +
    '</div>';

    var html = '<div class="vme-box vme-twostep">';
    html += '<div class="vme-title">📐 兩步驟四則運算直式計算拆解板</div>';
    html += '<div class="vme-concept-formula">' + formulaDisplay + '</div>';
    html += svgArea;
    html += twoStepBoardsHtml;
    html += '<div class="vme-steps-box">';
    html += '<div class="vme-steps-header">💡 軍師解題步驟與直式微步階解說：</div>';
    html += '<ol class="vme-steps-list">';
    steps.forEach(function(s) { html += '<li>' + s + '</li>'; });
    html += '</ol>';
    html += '<div class="vme-summary">🎉 計算完成！最終答案 ＝ <span class="vme-highlight">' + finalAns + '</span></div>';
    html += '</div></div>';

    return {
      type: 'TWO_STEP',
      steps: steps, ans: finalAns, html: html, svg: svgDiagram, summary: '答案 ＝ ' + finalAns
    };
  }

  // ================= 6. 一位小數直式解說 =================
  function explainDecimal(d, m) {
    var ans = d.op === '+' ? (Math.round((d.a + d.b) * 10) / 10) : (Math.round((d.a - d.b) * 10) / 10);
    var steps = [
      '1. 【小數直式核心原則】：小數點一定要對齊！',
      '2. 十分位相' + (d.op === '+' ? '加' : '減') + '：' + (Math.round(d.a * 10) % 10) + ' ' + d.op + ' ' + (Math.round(d.b * 10) % 10) + ' ＝ ' + (Math.round(ans * 10) % 10),
      '3. 個位相' + (d.op === '+' ? '加' : '減') + '：' + Math.floor(d.a) + ' ' + d.op + ' ' + Math.floor(d.b) + ' ＝ ' + Math.floor(ans),
      '4. 點上下對齊的小數點，得出答案 ＝ ' + ans.toFixed(1)
    ];

    var html = '<div class="vme-box vme-decimal">';
    html += '<div class="vme-title">📐 一位小數直式計算板 (小數點對齊)</div>';
    html += '<div class="vme-decimal-board" style="font-family:monospace; font-size:1.6rem; text-align:right; width:160px; margin:0 auto; line-height:1.4;">';
    html += '<div>&nbsp;&nbsp;' + d.a.toFixed(1) + '</div>';
    html += '<div><span style="color:#F59E0B; float:left;">' + (d.op === '+' ? '+' : '−') + '</span>&nbsp;' + d.b.toFixed(1) + '</div>';
    html += '<div style="border-top:2px solid #64748B; margin-top:4px;">&nbsp;&nbsp;<span style="color:#10B981; font-weight:bold;">' + ans.toFixed(1) + '</span></div>';
    html += '</div>';
    html += '<div class="vme-steps-box">';
    html += '<div class="vme-steps-header">💡 軍師小數直式解說：</div>';
    html += '<ol class="vme-steps-list">' + steps.map(function(s){return '<li>'+s+'</li>';}).join('') + '</ol>';
    html += '<div class="vme-summary">🎉 答案：<span class="vme-highlight">' + ans.toFixed(1) + '</span></div>';
    html += '</div></div>';

    return { type: 'DECIMAL', ans: ans, steps: steps, html: html, summary: d.a + ' ' + d.op + ' ' + d.b + ' = ' + ans.toFixed(1) };
  }

  // ================= 7. 同分母分數解說 =================
  function explainFraction(f, m) {
    var ansNum = f.op === '+' ? (f.n1 + f.n2) : (f.n1 - f.n2);
    var steps = [
      '1. 【同分母分數運算原則】：分母不變，只有分子相' + (f.op === '+' ? '加' : '減') + '！',
      '2. 分母固定為 ' + f.d + '，計算分子：' + f.n1 + ' ' + (f.op === '+' ? '＋' : '−') + ' ' + f.n2 + ' ＝ ' + ansNum,
      '3. 寫成完整分數：' + ansNum + '/' + f.d
    ];

    var html = '<div class="vme-box vme-fraction">';
    html += '<div class="vme-title">💡 同分母分數運算圖解</div>';
    html += '<div class="vme-concept-formula" style="font-size:1.8rem;">' + f.n1 + '/' + f.d + ' ' + (f.op === '+' ? '＋' : '−') + ' ' + f.n2 + '/' + f.d + ' ＝ (' + f.n1 + (f.op === '+' ? '＋' : '−') + f.n2 + ') / ' + f.d + ' ＝ <span style="color:#38BDF8;">' + ansNum + '/' + f.d + '</span></div>';
    html += '<div class="vme-steps-box"><ol class="vme-steps-list">' + steps.map(function(s){return '<li>'+s+'</li>';}).join('') + '</ol>';
    html += '<div class="vme-summary">🎉 答案是：<span class="vme-highlight">' + ansNum + '/' + f.d + '</span></div></div></div>';

    return { type: 'FRACTION', ansNum: ansNum, d: f.d, steps: steps, html: html, summary: ansNum + '/' + f.d };
  }

  // ================= 8. 複名數直式與數線圖像化解說 =================
  function renderNumberLineSvg(v) {
    if (!v) return '';
    var minVal = v.min !== undefined ? v.min : 0;
    var maxVal = v.max !== undefined ? v.max : Math.max(v.start || 100, v.result || 100);
    var range = maxVal - minVal;
    if (range <= 0) range = 100;

    var width = 560;
    var height = 145;
    var paddingX = 45;
    var axisY = 95;
    var usableWidth = width - paddingX * 2;

    function xOf(val) {
      return paddingX + ((val - minVal) / range) * usableWidth;
    }

    var svg = '<svg viewBox="0 0 ' + width + ' ' + height + '" class="vme-number-line-svg" style="width:100%; max-width:560px; height:auto; background:#0B132B; border-radius:12px; margin:10px auto; display:block; padding:8px; border:1px solid #1E293B;">';
    svg += '<defs>';
    svg += '<marker id="vme-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">';
    svg += '<path d="M 0 1 L 10 5 L 0 9 z" fill="#38BDF8" />';
    svg += '</marker>';
    svg += '<marker id="vme-arc-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">';
    svg += '<path d="M 0 1 L 10 5 L 0 9 z" fill="#F43F5E" />';
    svg += '</marker>';
    svg += '</defs>';

    // 主軸線
    svg += '<line x1="' + (paddingX - 15) + '" y1="' + axisY + '" x2="' + (width - paddingX + 15) + '" y2="' + axisY + '" stroke="#475569" stroke-width="3" marker-end="url(#vme-arrow)" />';

    // 關鍵刻度點
    var keyPoints = [minVal, maxVal];
    if (v.start !== undefined) keyPoints.push(v.start);
    if (v.result !== undefined) keyPoints.push(v.result);
    if (Array.isArray(v.jumps)) {
      v.jumps.forEach(function(j) { if (j.target !== undefined) keyPoints.push(j.target); });
    }
    keyPoints = Array.from(new Set(keyPoints)).sort(function(a, b) { return a - b; });

    keyPoints.forEach(function(val) {
      var kx = xOf(val);
      var isTarget = (val === v.result);
      var isStart = (val === v.start);
      var tickColor = isTarget ? '#10B981' : (isStart ? '#38BDF8' : '#94A3B8');
      var r = (isTarget || isStart) ? 5 : 3;

      svg += '<line x1="' + kx + '" y1="' + (axisY - 6) + '" x2="' + kx + '" y2="' + (axisY + 6) + '" stroke="' + tickColor + '" stroke-width="2" />';
      svg += '<circle cx="' + kx + '" cy="' + axisY + '" r="' + r + '" fill="' + tickColor + '" />';
      svg += '<text x="' + kx + '" y="' + (axisY + 22) + '" fill="' + tickColor + '" font-size="11" font-weight="' + (isTarget ? 'bold' : 'normal') + '" text-anchor="middle" font-family="system-ui, sans-serif">' + val + (v.unit ? (' ' + v.unit) : '') + '</text>';
    });

    // 跳躍弧線 (Jumps)
    if (Array.isArray(v.jumps)) {
      var curVal = v.start;
      v.jumps.forEach(function(jump, idx) {
        var fromX = xOf(curVal);
        var toX = xOf(jump.target);
        var midX = (fromX + toX) / 2;
        var arcHeight = 44 + (idx % 2) * 8;
        var controlY = axisY - arcHeight;

        svg += '<path d="M ' + fromX + ' ' + (axisY - 4) + ' Q ' + midX + ' ' + controlY + ' ' + toX + ' ' + (axisY - 4) + '" fill="none" stroke="#F43F5E" stroke-width="2.5" stroke-dasharray="4,2" marker-end="url(#vme-arc-arrow)" />';
        var label = jump.label || (jump.delta > 0 ? ('+' + jump.delta) : String(jump.delta));
        svg += '<text x="' + midX + '" y="' + (controlY + 2) + '" fill="#FBBF24" font-size="11" font-weight="bold" text-anchor="middle" font-family="system-ui, sans-serif">' + label + '</text>';

        curVal = jump.target;
      });
    }

    svg += '</svg>';
    return svg;
  }

  function explainCompoundChainSubtract(c, m) {
    var totalMinor = c.a1 * c.base + c.a2;
    var sub1Minor = c.b1 * c.base + c.b2;
    var sub2Minor = c.c1 * c.base + c.c2;

    var step1Rem = totalMinor - sub1Minor;
    var finalRem = step1Rem - sub2Minor;

    var step1MajorRem = Math.floor(step1Rem / c.base);
    var step1MinorRem = step1Rem % c.base;

    var steps = [
      '1. 【單位換算與列式】：1 ' + c.uMajor + ' ＝ ' + c.base + ' ' + c.uMinor + '。',
      '   • 原有容量：' + c.a1 + ' ' + c.uMajor + ' ' + c.a2 + ' ' + c.uMinor + ' ＝ ' + totalMinor + ' ' + c.uMinor,
      '   • 第一次消耗：' + c.b1 + ' ' + c.uMajor + ' ' + c.b2 + ' ' + c.uMinor + ' ＝ ' + sub1Minor + ' ' + c.uMinor,
      '   • 第二次消耗：' + c.c1 + ' ' + c.uMajor + ' ' + c.c2 + ' ' + c.uMinor + ' ＝ ' + sub2Minor + ' ' + c.uMinor,
      '2. 【第一步減法（第一次噴出後）】：' + totalMinor + ' − ' + sub1Minor + ' ＝ ' + step1Rem + ' ' + c.uMinor + (step1MajorRem > 0 ? ('（即 ' + step1MajorRem + ' ' + c.uMajor + ' ' + step1MinorRem + ' ' + c.uMinor + '）') : ''),
      '3. 【第二步減法（第二次噴出後）】：' + step1Rem + ' − ' + sub2Minor + ' ＝ ' + finalRem + ' ' + c.uMinor,
      '4. 【綜合連減算式】：' + totalMinor + ' − ' + sub1Minor + ' − ' + sub2Minor + ' ＝ ' + finalRem + ' ' + c.uMinor
    ];

    var visualSpec = (m && m.visual && m.visual.type === 'number_line') ? m.visual : {
      type: "number_line",
      unit: c.uMinor,
      min: 0,
      max: Math.ceil(totalMinor / 500) * 500,
      start: totalMinor,
      jumps: [
        { delta: -sub1Minor, label: "第1槍 −" + sub1Minor + c.uMinor, target: step1Rem },
        { delta: -sub2Minor, label: "第2槍 −" + sub2Minor + c.uMinor, target: finalRem }
      ],
      result: finalRem
    };
    var svgDiagram = renderNumberLineSvg(visualSpec);

    var ansStr = finalRem + ' ' + c.uMinor;
    var html = '<div class="vme-box vme-compound-chain">';
    html += '<div class="vme-title">📐 容量連減兩步驟解說板</div>';
    html += '<div class="vme-concept-formula" style="font-size:1.3rem; margin:10px 0; color:#38BDF8; line-height:1.6;">' +
      c.a1 + ' ' + c.uMajor + ' ' + c.a2 + ' ' + c.uMinor + ' − ' + c.b1 + ' ' + c.uMajor + ' ' + c.b2 + ' ' + c.uMinor + ' − ' + c.c1 + ' ' + c.uMajor + ' ' + c.c2 + ' ' + c.uMinor + '<br>' +
      '<span style="color:#FBBF24; font-size:1.15rem; font-weight:bold;">＝ ' + totalMinor + ' − ' + sub1Minor + ' − ' + sub2Minor + ' ＝ ' + finalRem + ' ' + c.uMinor + '</span></div>';
    html += '<div class="vme-visual-area" style="margin:12px 0;">' +
      '<div style="font-size:0.85rem; color:#94A3B8; margin-bottom:4px; font-weight:bold;">📈 數線圖像化解題模型（容量倒退跳躍）：</div>' +
      svgDiagram + '</div>';
    html += '<div class="vme-steps-box">';
    html += '<div class="vme-steps-header">💡 軍師容量連減微步階解說：</div>';
    html += '<ol class="vme-steps-list">' + steps.map(function(s){return '<li>'+s+'</li>';}).join('') + '</ol>';
    html += '<div class="vme-summary">🎉 計算完成！最後剩下：<span class="vme-highlight">' + ansStr + '</span></div>';
    html += '</div></div>';

    return {
      type: 'COMPOUND_CHAIN_SUB',
      steps: steps,
      ans: ansStr,
      html: html,
      svg: svgDiagram,
      summary: totalMinor + ' − ' + sub1Minor + ' − ' + sub2Minor + ' ＝ ' + finalRem + ' ' + c.uMinor
    };
  }

  function explainConvertStandard(col, m) {
    var title = col.title || '💧 單位換算與拆解流程圖卡';
    var formula = col.formula || '1 公升 ＝ 1000 毫升';
    var steps = [];
    var rowsHtml = '';

    if (col.rows && col.rows.length) {
      col.rows.forEach(function(r, idx) {
        steps.push('步驟 ' + (idx + 1) + '：' + r.label + ' ' + r.boxVal + (r.unit ? (' ' + r.unit) : ''));
        rowsHtml += '<div style="background:#0F172A; border:1px solid #334155; border-radius:8px; padding:8px 12px; margin-bottom:8px; font-size:1.05rem; display:flex; align-items:center; justify-content:space-between;">' +
                    '<span>' + r.label + '</span>' +
                    '<span style="color:#10B981; font-weight:bold; font-family:monospace; font-size:1.15rem; background:rgba(16,185,129,0.15); border:1px solid #10B981; border-radius:6px; padding:2px 8px;">' + r.boxVal + (r.unit ? (' ' + r.unit) : '') + '</span>' +
                    '</div>';
      });
    }

    steps.push('最終結論：答案是 ' + col.ans);

    var html = '<div class="vme-box" style="background:#1E293B; border:2px solid #0284C7; border-radius:14px; padding:16px;">';
    html += '<div class="vme-title" style="color:#38BDF8; font-size:1.15rem; font-weight:bold; margin-bottom:10px;">' + title + '</div>';
    html += '<div style="display:inline-block; background:rgba(56,189,248,0.15); border:1px solid #38BDF8; color:#38BDF8; padding:4px 12px; border-radius:999px; font-weight:bold; margin-bottom:12px;">' + formula + '</div>';
    html += '<div style="margin:12px 0;">' + rowsHtml + '</div>';
    html += '<div class="vme-summary" style="margin-top:12px; font-size:1.1rem; color:#FBBF24; font-weight:bold;">🎉 破解總答：<span class="vme-highlight" style="color:#34D399; font-size:1.25rem;">' + col.ans + '</span></div>';
    html += '</div>';

    return {
      type: 'CONVERT_STANDARD',
      html: html,
      steps: steps,
      summary: '換算口訣：' + formula + '，最終答案是 ' + col.ans
    };
  }

  function explainCompound(c, m) {
    if (c.type === 'COMPOUND_CHAIN_SUB') {
      return explainCompoundChainSubtract(c, m);
    }

    var stepDetails = [];
    var resMajor = 0, resMinor = 0;

    var isTime = c.unitType === 'time';
    var boardTitle = isTime ? ('📐 時間經過直式對齊計算板 (1 小時 ＝ 60 分)') : ('📐 複名數直式對齊計算板 (' + c.uMajor + ' 與 ' + c.uMinor + ')');
    var convRule = isTime ? '依據單位換算「1 小時 ＝ 60 分」' : ('依據單位換算「1 ' + c.uMajor + ' ＝ ' + c.base + ' ' + c.uMinor + '」');

    if (c.op === '+') {
      var sumMinor = c.a2 + c.b2;
      var carryMajor = Math.floor(sumMinor / c.base);
      resMinor = sumMinor % c.base;
      resMajor = c.a1 + c.b1 + carryMajor;

      stepDetails.push('1. 先算小單位（' + c.uMinor + '）：' + c.a2 + ' + ' + c.b2 + ' = ' + sumMinor + ' ' + c.uMinor);
      if (carryMajor > 0) {
        stepDetails.push('2. 【單位進位換算】：' + convRule + '，滿 ' + c.base + ' ' + c.uMinor + ' 向大單位進 1 ' + c.uMajor + '：' + sumMinor + ' − ' + (carryMajor * c.base) + ' ＝ ' + resMinor + ' ' + c.uMinor + '，進 ' + carryMajor + ' ' + c.uMajor);
      }
      stepDetails.push('3. 再算大單位（' + c.uMajor + '）：' + c.a1 + ' + ' + c.b1 + (carryMajor > 0 ? (' + 進位 ' + carryMajor) : '') + ' = ' + resMajor + ' ' + c.uMajor);
    } else {
      var borrowMajor = 0;
      var curMinorA = c.a2;
      var curMajorA = c.a1;
      if (c.isElapsed) {
        stepDetails.push('0. 【時間經過直式公式】：經過時間 ＝ 結束時間（' + c.endTimeStr + '） − 開始時間（' + c.startTimeStr + '）');
      }
      if (curMinorA < c.b2) {
        borrowMajor = 1;
        curMajorA -= 1;
        curMinorA += c.base;
        stepDetails.push('1. 【單位借位換算】：' + c.a2 + ' ' + c.uMinor + ' 不夠減 ' + c.b2 + ' ' + c.uMinor + '！' + convRule + '，向 ' + c.uMajor + ' 借 1 ' + c.uMajor + '（時剩 ' + curMajorA + '），換成 ' + c.base + ' ' + c.uMinor + '，' + c.uMinor + ' 變成 ' + c.a2 + ' ＋ ' + c.base + ' ＝ ' + curMinorA + ' ' + c.uMinor);
        stepDetails.push('2. 小單位（' + c.uMinor + '）相減：借來的 ' + curMinorA + ' ' + c.uMinor + ' − ' + c.b2 + ' ' + c.uMinor + ' ＝ ' + (curMinorA - c.b2) + ' ' + c.uMinor);
      } else {
        stepDetails.push('1. 小單位（' + c.uMinor + '）相減：' + curMinorA + ' − ' + c.b2 + ' ＝ ' + (curMinorA - c.b2) + ' ' + c.uMinor);
      }
      resMinor = curMinorA - c.b2;
      resMajor = curMajorA - c.b1;
      stepDetails.push('3. 大單位（' + c.uMajor + '）相減：剩下的 ' + curMajorA + ' − ' + c.b1 + ' ＝ ' + resMajor + ' ' + c.uMajor);
    }

    var html = '<div class="vme-box vme-compound">';
    html += '<div class="vme-title">' + boardTitle + '</div>';
    html += '<div class="vme-compound-grid">';
    html += '<div class="vme-cp-header"><span></span><span>' + c.uMajor + '</span><span>' + c.uMinor + '</span></div>';
    html += '<div class="vme-cp-row"><span></span><span>' + c.a1 + '</span><span>' + c.a2 + '</span></div>';
    html += '<div class="vme-cp-row"><span style="color:#F59E0B; font-weight:bold;">' + (c.op === '+' ? '+' : '−') + '</span><span>' + c.b1 + '</span><span>' + c.b2 + '</span></div>';
    html += '<div class="vme-divider"></div>';
    html += '<div class="vme-cp-row vme-ans-row"><span>＝</span><span class="vme-ans">' + resMajor + '</span><span class="vme-ans">' + resMinor + '</span></div>';
    html += '</div>';

    html += '<div class="vme-steps-box">';
    html += '<div class="vme-steps-header">💡 軍師' + (isTime ? '時間直式借位換算' : '複名數換算') + '微步階解說：</div>';
    html += '<ol class="vme-steps-list">';
    stepDetails.forEach(function(s) { html += '<li>' + s + '</li>'; });
    html += '</ol>';
    html += '<div class="vme-summary">🎉 直式計算完成！答案：<span class="vme-highlight">' + (resMajor > 0 ? (resMajor + ' ' + c.uMajor + ' ') : '') + resMinor + ' ' + c.uMinor + '</span></div>';
    html += '</div></div>';

    return {
      type: 'COMPOUND', unitType: c.unitType, op: c.op,
      resMajor: resMajor, resMinor: resMinor, html: html,
      steps: stepDetails, summary: (resMajor > 0 ? (resMajor + ' ' + c.uMajor + ' ') : '') + resMinor + ' ' + c.uMinor
    };
  }

  // ================= 9. 觀念/公式題圖解 =================
  function explainConcept(m) {
    var mathStr = m.math || '';
    var hint = m.hint || '按照題目步驟逐步推導！';
    var steps = [];

    // 未知數 ( ) ÷ 7 = 9
    var unkMatch = mathStr.match(/（\s*）\s*÷\s*(\d+)\s*=\s*(\d+)/);
    if (unkMatch) {
      var d = parseInt(unkMatch[1], 10);
      var q = parseInt(unkMatch[2], 10);
      var ans = d * q;
      steps.push('1. 題目是「被除數 ÷ ' + d + ' ＝ ' + q + '」');
      steps.push('2. 運用【除法與乘法互逆】：被除數 ＝ 商 × 除數');
      steps.push('3. 列出算式：' + q + ' × ' + d + ' ＝ ' + ans);
      steps.push('4. 直式計算：' + q + ' × ' + d + ' ＝ ' + ans);
      return {
        type: 'CONCEPT_INVERSE',
        html: '<div class="vme-box"><div class="vme-title">💡 乘除互逆還原直式解說</div><div class="vme-concept-formula">（ ） ＝ ' + q + ' × ' + d + ' ＝ ' + ans + '</div><div class="vme-steps-box"><ol class="vme-steps-list">' + steps.map(function(s){return '<li>'+s+'</li>';}).join('') + '</ol><div class="vme-summary">🎉 答案是：<span class="vme-highlight">' + ans + '</span></div></div></div>',
        steps: steps, summary: '（ ） ＝ ' + ans
      };
    }

    // 周長題 (長15公尺、寬8公尺長方形的周長？)
    var periMatch = mathStr.match(/長\s*(\d+).*寬\s*(\d+).*周長/);
    if (periMatch) {
      var l = parseInt(periMatch[1], 10);
      var w = parseInt(periMatch[2], 10);
      var half = l + w;
      var peri = half * 2;
      steps.push('1. 長方形周長公式 ＝（長 ＋ 寬）× 2');
      steps.push('2. 先算一組長加寬：' + l + ' ＋ ' + w + ' ＝ ' + half);
      steps.push('3. 乘以 2 計算總周長：' + half + ' × 2 ＝ ' + peri);
      return {
        type: 'CONCEPT_PERIMETER',
        html: '<div class="vme-box"><div class="vme-title">💡 長方形周長公式直式解說</div><div class="vme-concept-formula">周長 ＝ (' + l + ' ＋ ' + w + ') × 2 ＝ ' + half + ' × 2 ＝ ' + peri + '</div><div class="vme-steps-box"><ol class="vme-steps-list">' + steps.map(function(s){return '<li>'+s+'</li>';}).join('') + '</ol><div class="vme-summary">🎉 周長答案是：<span class="vme-highlight">' + peri + ' 公尺</span></div></div></div>',
        steps: steps, summary: '周長 ＝ ' + peri
      };
    }

    // 單位換算題 (如 180 秒 = ？ 分鐘, 2 小時 15 分 = ？ 分鐘, 4 公分 = ？ 毫米)
    var secMatch = mathStr.match(/(\d+)\s*秒\s*=\s*？\s*分鐘/);
    if (secMatch) {
      var sec = parseInt(secMatch[1], 10);
      var min = sec / 60;
      steps.push('1. 【時間換算公式】：1 分鐘 ＝ 60 秒');
      steps.push('2. 秒換算成分鐘使用除法：' + sec + ' ÷ 60 ＝ ' + min);
      steps.push('3. 計算結果：相當於 ' + min + ' 分鐘');
      return {
        type: 'CONCEPT_UNIT',
        html: '<div class="vme-box"><div class="vme-title">💡 時間單位換算除法解說 (1 分 ＝ 60 秒)</div><div class="vme-concept-formula">' + sec + ' ÷ 60 ＝ ' + min + ' 分鐘</div><div class="vme-steps-box"><ol class="vme-steps-list">' + steps.map(function(s){return '<li>'+s+'</li>';}).join('') + '</ol><div class="vme-summary">🎉 答案是：<span class="vme-highlight">' + min + ' 分鐘</span></div></div></div>',
        steps: steps, summary: min + ' 分鐘'
      };
    }

    var hourMinMatch = mathStr.match(/(\d+)\s*(?:小時|時)\s*(\d+)\s*分\s*=\s*？\s*分鐘/);
    if (hourMinMatch) {
      var h = parseInt(hourMinMatch[1], 10);
      var m = parseInt(hourMinMatch[2], 10);
      var totM = h * 60 + m;
      steps.push('1. 【時間換算公式】：1 小時 ＝ 60 分鐘');
      steps.push('2. 先將小時換算為分鐘：' + h + ' × 60 ＝ ' + (h * 60) + ' 分鐘');
      steps.push('3. 加上剩餘的分鐘：' + (h * 60) + ' ＋ ' + m + ' ＝ ' + totM + ' 分鐘');
      return {
        type: 'CONCEPT_UNIT',
        html: '<div class="vme-box"><div class="vme-title">💡 時間單位換算解說 (1 小時 ＝ 60 分)</div><div class="vme-concept-formula">' + h + ' × 60 ＋ ' + m + ' ＝ ' + totM + ' 分鐘</div><div class="vme-steps-box"><ol class="vme-steps-list">' + steps.map(function(s){return '<li>'+s+'</li>';}).join('') + '</ol><div class="vme-summary">🎉 答案是：<span class="vme-highlight">' + totM + ' 分鐘</span></div></div></div>',
        steps: steps, summary: totM + ' 分鐘'
      };
    }

    // 圓直徑題 (半徑 4 公分的圓，直徑是多少？)
    var circleMatch = mathStr.match(/半徑\s*(\d+).*直徑/);
    if (circleMatch) {
      var r = parseInt(circleMatch[1], 10);
      var dia = r * 2;
      steps.push('1. 圓的核心幾何性質：直徑 ＝ 半徑 × 2');
      steps.push('2. 列出乘法算式：' + r + ' × 2 ＝ ' + dia);
      return {
        type: 'CONCEPT_CIRCLE',
        html: '<div class="vme-box"><div class="vme-title">💡 圓規幾何直徑公式解說</div><div class="vme-concept-formula">直徑 ＝ 半徑 × 2 ＝ ' + r + ' × 2 ＝ ' + dia + ' 公分</div><div class="vme-steps-box"><ol class="vme-steps-list">' + steps.map(function(s){return '<li>'+s+'</li>';}).join('') + '</ol><div class="vme-summary">🎉 答案是：<span class="vme-highlight">' + dia + ' 公分</span></div></div></div>',
        steps: steps, summary: dia + ' 公分'
      };
    }

    // 通用題型
    steps.push('1. 題目考點：' + (m.sub_cat || '國小四年級核心數學指標'));
    steps.push('2. 軍師解題關鍵：' + hint);
    if (m.options && typeof m.correct === 'number') {
      steps.push('3. 正確答案為選項：' + m.options[m.correct]);
    }

    return {
      type: 'CONCEPT_GENERAL',
      html: '<div class="vme-box"><div class="vme-title">💡 軍師解題觀念與步驟導引</div><div class="vme-concept-formula">' + mathStr + '</div><div class="vme-steps-box"><ol class="vme-steps-list">' + steps.map(function(s){return '<li>'+s+'</li>';}).join('') + '</ol><div class="vme-summary">🎉 關鍵破解：<span class="vme-highlight">' + (m.options ? m.options[m.correct] : '') + '</span></div></div></div>',
      steps: steps, summary: hint
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = VerticalMathExplainer;
  } else {
    global.VerticalMathExplainer = VerticalMathExplainer;
  }

})(typeof window !== 'undefined' ? window : global);

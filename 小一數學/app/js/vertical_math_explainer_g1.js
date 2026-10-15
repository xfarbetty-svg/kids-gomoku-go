/**
 * 小一數學奧利博士微步階鷹架解說引擎 (Grade 1 Explainer Engine)
 * 涵蓋台灣 108 課綱一年級核心認知模型：
 * 1. 湊十法（Make 10 Addition: e.g. 8 + 5 = 8 + 2 + 3 = 13）
 * 2. 拆十法（Break 10 Subtraction: e.g. 13 - 5 = 10 - 5 + 3 = 8）
 * 3. 數的分與合（Number Bonds: 10 的互補數）
 * 4. 鐘面整點與半點讀時微步階
 * 5. 硬幣換算與買賣微步階
 */

const VerticalMathExplainerG1 = (function() {
  
  // 1. 湊十法加法微步階
  function explainMakeTenAddition(a, b) {
    if (a < b) { [a, b] = [b, a]; } // 大數在前面
    const need = 10 - a;
    const remaining = b - need;
    
    return {
      type: 'make_ten_addition',
      title: '湊十法魔法加法',
      steps: [
        {
          step: 1,
          desc: `看大數【${a}】，想一想：${a} 還差多少能湊成 10 呢？`,
          formula: `${a} + ${need} = 10`,
          ollie_hint: `🌱 奧利博士：「找到 10 的好朋友！${a} 的好朋友是 ${need} 喔！」`
        },
        {
          step: 2,
          desc: `把小數【${b}】拆開成【${need}】和【${remaining}】。`,
          formula: `${b} = ${need} + ${remaining}`,
          ollie_hint: `🍎 奧利博士：「從 ${b} 裡面拿出 ${need} 給 ${a} 湊成 10，還剩下 ${remaining}。」`
        },
        {
          step: 3,
          desc: `先算 ${a} + ${need} = 10，再加上剩下的 ${remaining}。`,
          formula: `10 + ${remaining} = ${10 + remaining}`,
          ollie_hint: `🎉 奧利博士：「10 加 ${remaining} 就是 ${10 + remaining}！真厲害！」`
        }
      ],
      final_answer: a + b
    };
  }

  // 2. 拆十法減法微步階
  function explainBreakTenSubtraction(minuend, subtrahend) {
    const tens = Math.floor(minuend / 10) * 10;
    const units = minuend % 10;
    const fromTen = 10 - subtrahend;
    
    return {
      type: 'break_ten_subtraction',
      title: '拆十法退位減法',
      steps: [
        {
          step: 1,
          desc: `個位的【${units}】不夠減【${subtrahend}】，向十位拿出 1 個十（10）。`,
          formula: `${minuend} = 10 + ${units}`,
          ollie_hint: `📦 奧利博士：「個位不夠吃，我們打開一盒裝有 10 個的積木盒！」`
        },
        {
          step: 2,
          desc: `先用拿出來的【10】去減【${subtrahend}】。`,
          formula: `10 - ${subtrahend} = ${fromTen}`,
          ollie_hint: `✂️ 奧利博士：「從 10 裡面拿走 ${subtrahend} 個，盒子裡剩下 ${fromTen} 個。」`
        },
        {
          step: 3,
          desc: `把盒子剩下的【${fromTen}】和原本的【${units}】加在一起。`,
          formula: `${fromTen} + ${units} = ${fromTen + units}`,
          ollie_hint: `🌟 奧利博士：「把剩下的合體：${fromTen} + ${units} = ${fromTen + units}，就是最後答案！」`
        }
      ],
      final_answer: minuend - subtrahend
    };
  }

  // 3. 數的分與合（10以內）
  function explainNumberBond(total, part) {
    const otherPart = total - part;
    return {
      type: 'number_bond',
      title: '數字的分與合',
      steps: [
        {
          step: 1,
          desc: `總共有【${total}】個寶物，其中一盤放了【${part}】個。`,
          formula: `${total} 分成 ${part} 和 □`,
          ollie_hint: `🔍 奧利博士：「用雙手比一比，總數是 ${total}，藏起來 ${part} 個。」`
        },
        {
          step: 2,
          desc: `算一算另一盤還有幾個：${total} - ${part} = ${otherPart}。`,
          formula: `${part} + ${otherPart} = ${total}`,
          ollie_hint: `✨ 奧利博士：「${part} 和 ${otherPart} 合起來剛好就是 ${total}！」`
        }
      ],
      final_answer: otherPart
    };
  }

  // 4. 時鐘指針報讀
  function explainClockReading(hour, minute) {
    const isHalf = (minute === 30);
    return {
      type: 'clock_reading',
      title: isHalf ? '半點鐘報讀' : '整點鐘報讀',
      steps: [
        {
          step: 1,
          desc: `看藍色長針（分針）：長針指向【${isHalf ? '6' : '12'}】。`,
          formula: isHalf ? '長針指著 6 代表 30 分（半）' : '長針指著 12 代表整點 00 分',
          ollie_hint: `⏰ 奧利博士：「長針是分針跑得快！${isHalf ? '指向 6 就是走了一半，是半點喔！' : '指向 12 就是剛好整點！'}`
        },
        {
          step: 2,
          desc: `看紅色短針（時針）：短針${isHalf ? `在 ${hour} 和 ${(hour % 12) + 1} 的正中間` : `正好指向 ${hour}`}。`,
          formula: isHalf ? `走過 ${hour} 還沒到 ${(hour % 12) + 1}` : `指向 ${hour}`,
          ollie_hint: `🕰️ 奧利博士：「短針是時針慢慢走，看它走過了哪個數字。」`
        },
        {
          step: 3,
          desc: `綜合讀法：現在是【${hour} 點${isHalf ? '半（30分）' : '鐘'}】。`,
          formula: `${hour}:${isHalf ? '30' : '00'}`,
          ollie_hint: `🎯 奧利博士：「時間報讀成功！是 ${hour} 點${isHalf ? '半' : '整'}！」`
        }
      ],
      final_answer: `${hour}點${isHalf ? '半' : ''}`
    };
  }

  // 5. 硬幣換算
  function explainCoinExchange(fromCoin, toCoin) {
    const count = fromCoin / toCoin;
    return {
      type: 'coin_exchange',
      title: '錢幣換算小達人',
      steps: [
        {
          step: 1,
          desc: `我們有一枚【${fromCoin}元】硬幣。`,
          formula: `1 個 ${fromCoin} 元 = ${fromCoin} 元`,
          ollie_hint: `💰 奧利博士：「大硬幣裡面裝滿了好多小錢錢！」`
        },
        {
          step: 2,
          desc: `算一算可以換成幾個【${toCoin}元】：${toCoin} 個一數，數到 ${fromCoin}。`,
          formula: `${toCoin} × ${count} = ${fromCoin}`,
          ollie_hint: `🪙 奧利博士：「1 個 ${fromCoin} 元剛好可以換 ${count} 個 ${toCoin} 元硬幣喔！」`
        }
      ],
      final_answer: count
    };
  }

  return {
    explainMakeTenAddition,
    explainBreakTenSubtraction,
    explainNumberBond,
    explainClockReading,
    explainCoinExchange
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VerticalMathExplainerG1;
}

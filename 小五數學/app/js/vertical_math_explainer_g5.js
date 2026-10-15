/**
 * 小五數學奧利博士微步階鷹架解說引擎 (Grade 5 Explainer Engine)
 * 涵蓋台灣 108 課綱五年級高階運算思維：
 * 1. 異分母分數通分加減法（找最小公倍數、等值擴分、分子加減、約分）
 * 2. 分數乘法直式（分子乘分子、分母乘分母、十字交叉約分）
 * 3. 小數乘法直式（小數位數定位、小數點右移與最後還原）
 * 4. 長方體與正方體體積運算（底面積 × 高、邊長 × 邊長 × 邊長）
 * 5. 扇形圓心角比例計算（360度 × 幾分之幾圓）
 */

const VerticalMathExplainerG5 = (function() {
  
  // 最大公因數
  function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
  }
  
  // 最小公倍數
  function lcm(a, b) {
    return (a * b) / gcd(a, b);
  }

  // 1. 異分母分數加減法微步階
  function explainFractionAddSub(num1, den1, num2, den2, op = '+') {
    const commonDen = lcm(den1, den2);
    const m1 = commonDen / den1;
    const m2 = commonDen / den2;
    const newNum1 = num1 * m1;
    const newNum2 = num2 * m2;
    const resNum = op === '+' ? (newNum1 + newNum2) : (newNum1 - newNum2);
    const commonFactor = gcd(Math.abs(resNum), commonDen);
    const simpNum = resNum / commonFactor;
    const simpDen = commonDen / commonFactor;

    return {
      type: 'fraction_add_sub',
      title: `異分母分數${op === '+' ? '加法' : '減法'}通分鷹架`,
      steps: [
        {
          step: 1,
          desc: `分母不同不能直接${op === '+' ? '相加' : '相減'}！先找出分母 ${den1} 和 ${den2} 的最小公倍數。`,
          formula: `[${den1}, ${den2}] = ${commonDen}`,
          ollie_hint: `🦉 奧利博士：「找到共通的尺規！共同分母是 ${commonDen}。」`
        },
        {
          step: 2,
          desc: `進行擴分：把兩分數換成同分母分數。`,
          formula: `${num1}/${den1} = ${newNum1}/${commonDen}，${num2}/${den2} = ${newNum2}/${commonDen}`,
          ollie_hint: `🔍 奧利博士：「分子分母同乘相同倍數，分數大小不變！」`
        },
        {
          step: 3,
          desc: `分母不變，分子${op === '+' ? '相加' : '相減'}，最後約成最簡分數。`,
          formula: `${newNum1}/${commonDen} ${op} ${newNum2}/${commonDen} = ${resNum}/${commonDen} = ${simpNum}/${simpDen}`,
          ollie_hint: `🎉 奧利博士：「通分成功！最終答案是 ${simpNum}/${simpDen}！」`
        }
      ],
      final_answer: `${simpNum}/${simpDen}`
    };
  }

  // 2. 分數乘法微步階
  function explainFractionMultiply(num1, den1, num2, den2) {
    const rawNum = num1 * num2;
    const rawDen = den1 * den2;
    const commonFactor = gcd(rawNum, rawDen);
    const simpNum = rawNum / commonFactor;
    const simpDen = rawDen / commonFactor;

    return {
      type: 'fraction_multiply',
      title: '分數乘法運算鷹架',
      steps: [
        {
          step: 1,
          desc: `分數乘法口訣：分子乘分子，分母乘分母。`,
          formula: `(${num1} × ${num2}) / (${den1} × ${den2})`,
          ollie_hint: `✨ 奧利博士：「乘法不用通分！直接水平線對齊相乘即可。」`
        },
        {
          step: 2,
          desc: `計算分子與分母乘積，並檢查是否有公因數可約分。`,
          formula: `${rawNum} / ${rawDen}，最大公因數為 ${commonFactor}`,
          ollie_hint: `✂️ 奧利博士：「約分能讓大數字變輕巧！上下同除以 ${commonFactor}。」`
        },
        {
          step: 3,
          desc: `化為最簡分數。`,
          formula: `${rawNum}/${rawDen} = ${simpNum}/${simpDen}`,
          ollie_hint: `🌟 奧利博士：「答案是 ${simpNum}/${simpDen}，真厲害！」`
        }
      ],
      final_answer: `${simpNum}/${simpDen}`
    };
  }

  // 3. 體積公式微步階
  function explainCuboidVolume(l, w, h) {
    const baseArea = l * w;
    const vol = baseArea * h;
    return {
      type: 'cuboid_volume',
      title: '長方體體積微步階',
      steps: [
        {
          step: 1,
          desc: `先算出底面的面積：長 × 寬。`,
          formula: `${l} × ${w} = ${baseArea}（平方公分）`,
          ollie_hint: `📦 奧利博士：「底面平鋪了一層有 ${baseArea} 塊 1立方公分積木。」`
        },
        {
          step: 2,
          desc: `再將底面積乘以高（堆疊了幾層）：底面積 × 高。`,
          formula: `${baseArea} × ${h} = ${vol}（立方公分）`,
          ollie_hint: `🏗️ 奧利博士：「往上堆疊了 ${h} 層，全部共有 ${vol} 立方公分！」`
        }
      ],
      final_answer: vol
    };
  }

  return {
    explainFractionAddSub,
    explainFractionMultiply,
    explainCuboidVolume
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VerticalMathExplainerG5;
}

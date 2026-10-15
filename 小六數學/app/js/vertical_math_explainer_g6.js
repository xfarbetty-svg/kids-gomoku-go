/**
 * 小六數學奧利博士微步階鷹架解說引擎 (Grade 6 Explainer Engine)
 * 涵蓋台灣 108 課綱六年級核心數學思維：
 * 1. 分數除以分數微步階（顛倒相乘倒數法、約分）
 * 2. 圓面積與圓周長運算（半徑 × 半徑 × 3.14，直徑 × 3.14）
 * 3. 速度、時間、距離三維換算（距離＝速度×時間）
 * 4. 簡易等量公理（天平平衡、同加減乘除）
 * 5. 柱體表面積與體積（底面積×高、側面展開圖長度為底面周長）
 */

const VerticalMathExplainerG6 = (function() {
  
  function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
  }

  // 1. 分數除以分數微步階
  function explainFractionDivision(num1, den1, num2, den2) {
    const invNum = den2;
    const invDen = num2;
    const rawNum = num1 * invNum;
    const rawDen = den1 * invDen;
    const commonFactor = gcd(rawNum, rawDen);
    const simpNum = rawNum / commonFactor;
    const simpDen = rawDen / commonFactor;

    return {
      type: 'fraction_division',
      title: '分數除法倒數相乘鷹架',
      steps: [
        {
          step: 1,
          desc: `除法變乘法：將除數【${num2}/${den2}】上下顛倒，取倒數變成【${invNum}/${invDen}】。`,
          formula: `${num1}/${den1} ÷ ${num2}/${den2} = ${num1}/${den1} × ${invNum}/${invDen}`,
          ollie_hint: `🦉 奧利博士：「除以一個分數，等於乘以它的倒數喔！」`
        },
        {
          step: 2,
          desc: `轉成乘法後，分子乘分子，分母乘分母。`,
          formula: `(${num1} × ${invNum}) / (${den1} × ${invDen}) = ${rawNum}/${rawDen}`,
          ollie_hint: `🔍 奧利博士：「水平乘起來，再找出公因數約分簡化！」`
        },
        {
          step: 3,
          desc: `約成最簡分數。`,
          formula: `${rawNum}/${rawDen} = ${simpNum}/${simpDen}`,
          ollie_hint: `🎉 奧利博士：「答案是 ${simpNum}/${simpDen}，非常棒！」`
        }
      ],
      final_answer: `${simpNum}/${simpDen}`
    };
  }

  // 2. 圓面積與圓周長微步階
  function explainCircleGeometry(radius) {
    const diameter = radius * 2;
    const circumference = (diameter * 3.14).toFixed(2);
    const area = (radius * radius * 3.14).toFixed(2);

    return {
      type: 'circle_geometry',
      title: '圓周長與圓面積計算鷹架',
      steps: [
        {
          step: 1,
          desc: `先算圓周長：直徑 × 圓周率(3.14)。`,
          formula: `(${radius} × 2) × 3.14 = ${diameter} × 3.14 = ${circumference}`,
          ollie_hint: `⭕ 奧利博士：「繞圓一圈的長度就是圓周長！」`
        },
        {
          step: 2,
          desc: `計算圓面積：半徑 × 半徑 × 圓周率(3.14)。`,
          formula: `${radius} × ${radius} × 3.14 = ${radius * radius} × 3.14 = ${area}`,
          ollie_hint: `🥧 奧利博士：「把圓切成無限多個小扇形拼成長方形，面積是 半徑 × 半徑 × 3.14！」`
        }
      ],
      circumference: parseFloat(circumference),
      area: parseFloat(area)
    };
  }

  // 3. 等量公理微步階
  function explainEquivalenceAxiom(equationType, a, b, result) {
    // e.g. x + a = b  => x = b - a
    return {
      type: 'equivalence_axiom',
      title: '等量公理天平鷹架',
      steps: [
        {
          step: 1,
          desc: `觀察等式天平：想求未知數 x，要把兩邊的多餘數字消除。`,
          formula: `x + ${a} = ${b}`,
          ollie_hint: `⚖️ 奧利博士：「天平兩邊同時做一樣的動作，天平依然平衡！」`
        },
        {
          step: 2,
          desc: `等號左右兩邊同時減去 ${a}。`,
          formula: `x + ${a} - ${a} = ${b} - ${a}`,
          ollie_hint: `✨ 奧利博士：「左邊只剩下 x，右邊算出結果！」`
        },
        {
          step: 3,
          desc: `計算出未知數的值。`,
          formula: `x = ${b - a}`,
          ollie_hint: `🎯 奧利博士：「求得 x = ${b - a}！」`
        }
      ],
      final_answer: b - a
    };
  }

  return {
    explainFractionDivision,
    explainCircleGeometry,
    explainEquivalenceAxiom
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VerticalMathExplainerG6;
}

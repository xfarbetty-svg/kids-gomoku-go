/**
 * 守門員驗收腳本：verify_g4_3b1b_engine.js
 * 驗收小四 3B1B 視覺幾何引擎 (visual_morph_engine_g4.js)
 * 驗證項目：
 * 1. 引擎模組正確掛載 window.VisualMorphG4
 * 2. 5 大核心模型（protractor, voxel, area_model, exploding_dots, rounding）
 * 3. 跨 5 個進度階梯 (0.0, 0.25, 0.5, 0.75, 1.0) 連續幾何計算
 * 4. X-Ray 透視模式切換無崩潰
 * 5. 全數 PASS 則 exit code 0，任一失敗即 exit code 1
 */

const fs = require("fs");
const path = require("path");

function createMockContext() {
  return {
    fillRect: () => {},
    clearRect: () => {},
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    quadraticCurveTo: () => {},
    stroke: () => {},
    fill: () => {},
    rect: () => {},
    strokeRect: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    setTransform: () => {},
    scale: () => {},
    fillText: () => {},
    measureText: () => ({ width: 50 }),
    fillStyle: "#000",
    strokeStyle: "#000",
    lineWidth: 1,
    font: "12px sans-serif",
    textAlign: "left",
    textBaseline: "top",
    globalAlpha: 1.0
  };
}

function createMockCanvas(w, h) {
  const ctx = createMockContext();
  return {
    width: w || 760,
    height: h || 440,
    getBoundingClientRect: () => ({ width: w || 760, height: h || 440 }),
    getContext: (type) => (type === "2d" ? ctx : null)
  };
}

console.log("🛡️ [守門員] 啟動小四 3B1B 視覺幾何引擎驗收測試...");

// 載入引擎代碼
const enginePath = path.join(__dirname, "..", "app", "js", "visual_morph_engine_g4.js");
if (!fs.existsSync(enginePath)) {
  console.error("❌ 找不到引擎檔案: " + enginePath);
  process.exit(1);
}

const engineCode = fs.readFileSync(enginePath, "utf-8");

// 建立假沙箱環境
const mockWindow = {
  devicePixelRatio: 1,
  requestAnimationFrame: (cb) => setTimeout(cb, 16),
  cancelAnimationFrame: (id) => clearTimeout(id)
};

// 執行沙箱
const sandboxFunction = new Function("window", engineCode);
sandboxFunction(mockWindow);

const engine = mockWindow.VisualMorphG4;
if (!engine) {
  console.error("❌ 引擎未成功掛載至 window.VisualMorphG4");
  process.exit(1);
}
console.log("✅ 引擎掛載成功 (window.VisualMorphG4 就緒)");

const mockCanvas = createMockCanvas(760, 440);
engine.initCanvas(mockCanvas);
console.log("✅ Canvas 初始化成功 (寬度: " + engine.width + ", 高度: " + engine.height + ")");

// 測試 5 大模型
const testModels = [
  {
    name: "📐 角度與量角器 (t15)",
    data: { type: "smart_protractor_spin", angle: 125, direction: "ccw" }
  },
  {
    name: "📐 順時針內圈量角器 (t15)",
    data: { type: "smart_protractor_spin", angle: 70, direction: "cw" }
  },
  {
    name: "🧊 等角積木與 X-Ray (t14)",
    data: {
      type: "isometric_voxel_xray",
      blocks: [
        { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 },
        { x: 0, y: 0, z: 1 }
      ]
    },
    testXray: true
  },
  {
    name: "⚒️ 矩陣面積乘法模型 (t05)",
    data: { type: "area_model_multiplication", numA: 246, numB: 34 }
  },
  {
    name: "🌌 十進位爆裂點 (t01)",
    data: { type: "exploding_dots_large" }
  },
  {
    name: "🔭 四捨五入重力滾球 (t10)",
    data: { type: "hillside_gravity_rounding", leftVal: 40000, rightVal: 50000, val: 46800 }
  },
  {
    name: "🏭 長方形面積與網格 (t21)",
    data: { type: "area_cut_and_fill", length: 22, width: 14 }
  },
  {
    name: "🍰 分數披薩切片合體 (t12)",
    data: { type: "fraction_pizza_combine", num1: 2, num2: 2, denominator: 6 }
  },
  {
    name: "💧 二位小數百格板 (t16)",
    data: { type: "hundreds_grid_decimal", valA: 3.02, valB: 2.6 }
  }
];

const testProgressSteps = [0.0, 0.25, 0.5, 0.75, 1.0];

let totalCases = 0;
let passedCases = 0;

for (const tm of testModels) {
  for (const prog of testProgressSteps) {
    totalCases++;
    try {
      engine.render(tm.data, prog);
      passedCases++;
    } catch (err) {
      console.error(`❌ 測試失敗: [${tm.name}] 進度 ${prog} -> ${err.message}`);
      process.exit(1);
    }
  }

  if (tm.testXray) {
    totalCases++;
    try {
      engine.setXRay(true);
      engine.render(tm.data, 1.0);
      engine.setXRay(false);
      passedCases++;
    } catch (err) {
      console.error(`❌ X-Ray 測試失敗: [${tm.name}] -> ${err.message}`);
      process.exit(1);
    }
  }
}

console.log(`\n🎉 守門員檢核通過：全部 ${passedCases} / ${totalCases} 組渲染測試 100% 成功！`);
console.log("🛡️ [守門員] Exit code: 0");
process.exit(0);

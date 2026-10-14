/**
 * 3B1B 國小四年級視覺幾何透視引擎 (Visual Morph Engine Grade 4)
 * 專為小四數學 108 課綱 23 王國設計的純原生 HTML5 Canvas 物理動態渲染核心
 * 零外部依賴、純前端 60fps 幾何計算、$0 雲端 Token 消耗
 * 
 * 核心渲染器：
 * 1. smart_protractor_spin (t15 角度與量角器星際站 - 內外圈自適應吸附量角器)
 * 2. isometric_voxel_xray (t14 立方公分積木體積島 - 2.5D Isometric 透視與 X-Ray 隱藏積木)
 * 3. area_model_multiplication (t05 三位數乘兩位數 - 矩陣面積色塊展開)
 * 4. exploding_dots_large (t01 一億以內大數神殿 - 十進位爆裂點聚合)
 * 5. hillside_gravity_rounding (t10 四捨五入概數天文台 - 雙峰重力滾球數線)
 */

(function (window) {
  "use strict";

  var COLORS = {
    bg: "#181A26",
    grid: "rgba(255, 255, 255, 0.08)",
    blue: "#58C4DD",
    pink: "#FF6584",
    yellow: "#FFFF00",
    green: "#83C167",
    orange: "#FF9F40",
    purple: "#9A72AC",
    white: "#FFFFFF",
    darkText: "#2C3E50"
  };

  var VisualMorphG4 = {
    canvas: null,
    ctx: null,
    currentModel: null,
    progress: 0.0,
    isAnimating: false,
    animFrameId: null,
    xrayMode: false,
    registry: {},

    initCanvas: function (canvasElem) {
      if (!canvasElem) return;
      this.canvas = canvasElem;
      this.ctx = canvasElem.getContext("2d");
      this.handleResize();
    },

    handleResize: function () {
      if (!this.canvas) return;
      var rect = this.canvas.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      var displayW = rect.width || 600;
      var displayH = rect.height || 400;

      this.canvas.width = Math.floor(displayW * dpr);
      this.canvas.height = Math.floor(displayH * dpr);
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
      this.width = displayW;
      this.height = displayH;
    },

    setXRay: function (enabled) {
      this.xrayMode = !!enabled;
      if (this.currentModel) {
        this.render(this.currentModel, this.progress);
      }
    },

    // 核心渲染進入點
    render: function (modelData, progress) {
      if (!this.ctx) return;
      this.currentModel = modelData;
      this.progress = Math.max(0, Math.min(1, progress !== undefined ? progress : 1.0));

      var ctx = this.ctx;
      var w = this.width;
      var h = this.height;

      // 清除背景 (3B1B 經典深藍暗黑畫布)
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, w, h);

      // 繪製微弱網格
      this.drawBackdropGrid(ctx, w, h);

      if (!modelData || !modelData.type) {
        this.drawEmptyPlaceholder(ctx, w, h);
        return;
      }

      ctx.save();
      switch (modelData.type) {
        case "smart_protractor_spin":
        case "protractor":
          this.renderProtractor(ctx, w, h, modelData, this.progress);
          break;
        case "isometric_voxel_xray":
        case "voxel":
          this.renderIsometricVoxel(ctx, w, h, modelData, this.progress, this.xrayMode);
          break;
        case "area_model_multiplication":
        case "area_model":
          this.renderAreaModel(ctx, w, h, modelData, this.progress);
          break;
        case "exploding_dots_large":
        case "exploding_dots":
          this.renderExplodingDots(ctx, w, h, modelData, this.progress);
          break;
        case "hillside_gravity_rounding":
        case "rounding":
          this.renderHillsideRounding(ctx, w, h, modelData, this.progress);
          break;
        default:
          this.drawFallbackModel(ctx, w, h, modelData, this.progress);
      }
      ctx.restore();
    },

    // 背景微弱網格
    drawBackdropGrid: function (ctx, w, h) {
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1;
      var step = 30;
      ctx.beginPath();
      for (var x = 0; x < w; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (var y = 0; y < h; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
    },

    drawEmptyPlaceholder: function (ctx, w, h) {
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("3B1B 視覺透視引擎就緒 - 請指定題目模型", w / 2, h / 2);
    },

    drawFallbackModel: function (ctx, w, h, model, progress) {
      ctx.fillStyle = COLORS.yellow;
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(model.title || "3B1B 幾何透視", w / 2, 50);
      ctx.font = "14px sans-serif";
      ctx.fillStyle = COLORS.blue;
      ctx.fillText("模型型態: " + model.type + " (進度: " + Math.round(progress * 100) + "%)", w / 2, 80);
    },

    /* =====================================================================
       1. 📐 角度與量角器 (t15 角度與量角器星際站)
       ===================================================================== */
    renderProtractor: function (ctx, w, h, data, progress) {
      var targetAngle = data.angle || 65; // 目標度數
      var currentAngle = targetAngle * progress;
      var isClockwise = data.direction === "cw"; // 順時針或逆時針

      var cx = w * 0.5;
      var cy = h * 0.72;
      var radius = Math.min(w * 0.38, h * 0.55);

      // 1. 繪製半透明半圓形量角器本體
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, Math.PI, 0, false);
      ctx.closePath();
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 2. 刻度線（大刻度 10°、小刻度 1°/5°）
      for (var deg = 0; deg <= 180; deg += 5) {
        var rad = Math.PI - (deg * Math.PI / 180);
        var isMajor = (deg % 10 === 0);
        var tickLen = isMajor ? 14 : 7;

        var x1 = cx + radius * Math.cos(rad);
        var y1 = cy - radius * Math.sin(rad);
        var x2 = cx + (radius - tickLen) * Math.cos(rad);
        var y2 = cy - (radius - tickLen) * Math.sin(rad);

        ctx.strokeStyle = isMajor ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = isMajor ? 1.5 : 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // 數字標籤（雙圈刻度：外圈藍光、內圈紅光）
        if (deg % 30 === 0) {
          ctx.font = "9px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // 外圈標籤 (0 -> 180)
          var textR_out = radius - 24;
          var tx_out = cx + textR_out * Math.cos(rad);
          var ty_out = cy - textR_out * Math.sin(rad);
          ctx.fillStyle = isClockwise ? "rgba(255, 255, 255, 0.35)" : COLORS.blue;
          ctx.fillText(deg.toString(), tx_out, ty_out);

          // 內圈標籤 (180 -> 0)
          var textR_in = radius - 36;
          var tx_in = cx + textR_in * Math.cos(rad);
          var ty_in = cy - textR_in * Math.sin(rad);
          ctx.fillStyle = isClockwise ? COLORS.pink : "rgba(255, 255, 255, 0.35)";
          ctx.fillText((180 - deg).toString(), tx_in, ty_in);
        }
      }

      // 中心對齊孔與底線
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.yellow;
      ctx.fill();

      ctx.restore();

      // 3. 繪製起始邊 (始邊固定在 0° 水平向右)
      var rayLen = radius * 1.15;
      ctx.strokeStyle = COLORS.yellow;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + rayLen, cy);
      ctx.stroke();

      // 4. 動態展開終邊射線與發光夾角扇形
      var curRad = isClockwise ? (Math.PI * 2 - (currentAngle * Math.PI / 180)) : (currentAngle * Math.PI / 180);
      var endX = cx + rayLen * Math.cos(isClockwise ? -curRad : -curRad);
      var endY = cy - rayLen * Math.sin(isClockwise ? -curRad : curRad);

      // 夾角扇形
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius * 0.45, 0, isClockwise ? curRad : -curRad, isClockwise);
      ctx.closePath();
      ctx.fillStyle = isClockwise ? "rgba(255, 101, 132, 0.25)" : "rgba(88, 196, 221, 0.25)";
      ctx.fill();
      ctx.restore();

      // 終邊射線
      ctx.strokeStyle = isClockwise ? COLORS.pink : COLORS.blue;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // 5. 特殊角直角 (90°) 卡入符號
      if (Math.abs(currentAngle - 90) < 1.0) {
        var boxS = 18;
        ctx.strokeStyle = COLORS.green;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(cx, cy - boxS, boxS, boxS);
      }

      // 6. 頂部儀表板度數讀數
      ctx.fillStyle = COLORS.white;
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(Math.round(currentAngle) + "°", cx, cy - radius - 20);

      ctx.font = "14px sans-serif";
      var angleName = "銳角 (<90°)";
      if (Math.abs(currentAngle - 90) < 0.5) angleName = "直角 (=90°)";
      else if (currentAngle > 90 && currentAngle < 180) angleName = "鈍角 (>90°)";
      else if (Math.abs(currentAngle - 180) < 0.5) angleName = "平角 (=180°)";

      ctx.fillStyle = isClockwise ? COLORS.pink : COLORS.blue;
      ctx.fillText("讀數引導: " + (isClockwise ? "內圈順時針" : "外圈逆時針") + " ➔ " + angleName, cx, cy - radius - 45);
    },

    /* =====================================================================
       2. 🧊 Isometric 3D 等角積木堆疊與 X-Ray (t14 立方公分積木體積島)
       ===================================================================== */
    renderIsometricVoxel: function (ctx, w, h, data, progress, xray) {
      // blocks 陣列: [{x:0, y:0, z:0}, {x:1, y:0, z:0}, ...]
      var blocks = data.blocks || [
        { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 2, y: 1, z: 0 },
        { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 },
        { x: 0, y: 0, z: 2 }
      ];

      var totalBlocks = blocks.length;
      var visibleCount = Math.max(1, Math.ceil(totalBlocks * progress));

      // Isometric 參數
      var cx = w * 0.5;
      var cy = h * 0.65;
      var size = Math.min(w, h) * 0.085;
      var cos30 = Math.cos(Math.PI / 6);
      var sin30 = Math.sin(Math.PI / 6);

      // Painter's algorithm 深度排序: x + y + z 由小到大
      var sortedBlocks = blocks.slice().sort(function (a, b) {
        return (a.x + a.y + a.z) - (b.x + b.y + b.z);
      });

      // 投影計算
      function isoProject(x, y, z) {
        return {
          px: cx + (x - y) * size * cos30,
          py: cy + (x + y) * size * sin30 - z * size
        };
      }

      // 繪製單顆正方體
      function drawVoxel(block, isHiddenBehind) {
        var x = block.x;
        var y = block.y;
        var z = block.z;

        var p = isoProject(x, y, z);
        var dx = size * cos30;
        var dy = size * sin30;
        var dz = size;

        var alpha = (xray && isHiddenBehind) ? 0.35 : (xray ? 0.85 : 1.0);
        ctx.lineWidth = 1.5;

        // 頂面 (Top) - 亮黃/青藍
        ctx.beginPath();
        ctx.moveTo(p.px, p.py - dz);
        ctx.lineTo(p.px + dx, p.py - dz + dy);
        ctx.lineTo(p.px, p.py - dz + dy * 2);
        ctx.lineTo(p.px - dx, p.py - dz + dy);
        ctx.closePath();
        ctx.fillStyle = (xray && isHiddenBehind) ? "rgba(255, 101, 132, " + alpha + ")" : "rgba(88, 196, 221, " + alpha + ")";
        ctx.fill();
        ctx.strokeStyle = COLORS.white;
        ctx.stroke();

        // 左面 (Left) - 陰暗面
        ctx.beginPath();
        ctx.moveTo(p.px - dx, p.py - dz + dy);
        ctx.lineTo(p.px, p.py - dz + dy * 2);
        ctx.lineTo(p.px, p.py + dy * 2);
        ctx.lineTo(p.px - dx, p.py + dy);
        ctx.closePath();
        ctx.fillStyle = (xray && isHiddenBehind) ? "rgba(200, 60, 90, " + alpha + ")" : "rgba(45, 120, 160, " + alpha + ")";
        ctx.fill();
        ctx.stroke();

        // 右面 (Right) - 次陰暗面
        ctx.beginPath();
        ctx.moveTo(p.px, p.py - dz + dy * 2);
        ctx.lineTo(p.px + dx, p.py - dz + dy);
        ctx.lineTo(p.px + dx, p.py + dy);
        ctx.lineTo(p.px, p.py + dy * 2);
        ctx.closePath();
        ctx.fillStyle = (xray && isHiddenBehind) ? "rgba(230, 80, 110, " + alpha + ")" : "rgba(60, 150, 190, " + alpha + ")";
        ctx.fill();
        ctx.stroke();
      }

      for (var i = 0; i < visibleCount; i++) {
        var b = sortedBlocks[i];
        // 判斷是否為被遮蔽積木（前方與上方有其他積木）
        var isHidden = sortedBlocks.some(function (other) {
          return (other.x > b.x && other.y >= b.y && other.z >= b.z) ||
                 (other.y > b.y && other.x >= b.x && other.z >= b.z);
        });
        drawVoxel(b, isHidden);
      }

      // 儀表板資訊
      ctx.fillStyle = COLORS.white;
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("當前體積: " + visibleCount + " 立方公分 (cm³)", cx, 50);

      ctx.font = "14px sans-serif";
      ctx.fillStyle = xray ? COLORS.pink : COLORS.green;
      ctx.fillText(xray ? "🔍 X-Ray 透視模式已啟動 (透視背後被遮蔽積木)" : "🧱 實體等角投影模式 (點擊 X-Ray 鍵透視隱藏塊)", cx, 78);
    },

    /* =====================================================================
       3. ⚒️ 矩陣面積乘法模型 (t05 三位數乘兩位數直式工坊)
       ===================================================================== */
    renderAreaModel: function (ctx, w, h, data, progress) {
      // 範例: 246 * 34 = (200 + 40 + 6) * (30 + 4)
      var numA = data.numA || 246;
      var numB = data.numB || 34;

      var partsA = [Math.floor(numA / 100) * 100, Math.floor((numA % 100) / 10) * 10, numA % 10];
      var partsB = [Math.floor(numB / 10) * 10, numB % 10];

      var startX = w * 0.18;
      var startY = h * 0.28;
      var totalW = w * 0.65;
      var totalH = h * 0.52;

      // 依比例分配長寬
      var weightA = partsA.map(function (v) { return Math.max(1, Math.sqrt(v)); });
      var sumWeightA = weightA.reduce(function (a, b) { return a + b; }, 0);
      var widthCols = weightA.map(function (wt) { return (wt / sumWeightA) * totalW; });

      var weightB = partsB.map(function (v) { return Math.max(1, Math.sqrt(v)); });
      var sumWeightB = weightB.reduce(function (a, b) { return a + b; }, 0);
      var heightRows = weightB.map(function (wt) { return (wt / sumWeightB) * totalH; });

      var colorsGrid = [
        [COLORS.blue, COLORS.green, COLORS.orange],
        [COLORS.purple, COLORS.pink, COLORS.yellow]
      ];

      // 繪製標籤
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = COLORS.yellow;

      // 頂部 partsA
      var curX = startX;
      for (var col = 0; col < 3; col++) {
        var colW = widthCols[col];
        ctx.fillText(partsA[col].toString(), curX + colW / 2, startY - 12);
        curX += colW;
      }

      // 左側 partsB
      ctx.textAlign = "right";
      var curY = startY;
      for (var row = 0; row < 2; row++) {
        var rowH = heightRows[row];
        ctx.fillText(partsB[row].toString(), startX - 12, curY + rowH / 2 + 5);
        curY += rowH;
      }

      // 繪製各區塊面積展開
      var cellIndex = 0;
      var currentY = startY;
      var totalSum = 0;

      for (var r = 0; r < 2; r++) {
        var rH = heightRows[r];
        var currentX = startX;
        for (var c = 0; c < 3; c++) {
          var cW = widthCols[c];
          var cellVal = partsA[c] * partsB[r];
          var cellThreshold = (cellIndex + 1) / 6;

          if (progress >= (cellIndex / 6)) {
            var cellProgress = Math.min(1, (progress - (cellIndex / 6)) * 6);
            ctx.save();
            ctx.beginPath();
            ctx.rect(currentX, currentY, cW * cellProgress, rH);
            ctx.fillStyle = colorsGrid[r][c];
            ctx.globalAlpha = 0.35;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.strokeStyle = colorsGrid[r][c];
            ctx.lineWidth = 2;
            ctx.stroke();

            // 區塊內部文字
            if (cellProgress > 0.6) {
              ctx.fillStyle = COLORS.white;
              ctx.font = "bold 13px sans-serif";
              ctx.textAlign = "center";
              ctx.fillText(cellVal.toString(), currentX + cW / 2, currentY + rH / 2 + 5);
            }
            ctx.restore();
            totalSum += cellVal;
          }
          currentX += cW;
          cellIndex++;
        }
        currentY += rH;
      }

      // 頂部標題與結果
      ctx.fillStyle = COLORS.white;
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(numA + " × " + numB + " = " + (numA * numB), w / 2, 45);

      ctx.font = "14px sans-serif";
      ctx.fillStyle = COLORS.blue;
      ctx.fillText("矩陣面積法：拆解為 6 個子矩形部分積加總", w / 2, 70);
    },

    /* =====================================================================
       4. 🌌 Exploding Dots 十進位爆裂點 (t01 一億以內大數神殿)
       ===================================================================== */
    renderExplodingDots: function (ctx, w, h, data, progress) {
      var boxes = ["萬位", "千位", "百位", "十位", "個位"];
      var boxW = w * 0.15;
      var boxH = h * 0.45;
      var startY = h * 0.35;
      var spacing = (w - boxW * 5) / 6;

      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";

      for (var i = 0; i < 5; i++) {
        var bx = spacing + i * (boxW + spacing);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, startY, boxW, boxH);

        // 箱子標題
        ctx.fillStyle = COLORS.yellow;
        ctx.fillText(boxes[i], bx + boxW / 2, startY - 15);

        // 模擬個位集滿 10 顆爆炸進位至十位
        if (i === 4) {
          // 個位點點
          var dotCount = Math.floor(10 * (1 - progress));
          ctx.fillStyle = COLORS.pink;
          for (var d = 0; d < dotCount; d++) {
            var dotX = bx + 15 + (d % 3) * 22;
            var dotY = startY + boxH - 20 - Math.floor(d / 3) * 22;
            ctx.beginPath();
            ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (i === 3) {
          // 十位接收進位
          var receive = progress > 0.8;
          ctx.fillStyle = receive ? COLORS.blue : "rgba(255,255,255,0.3)";
          if (receive) {
            ctx.beginPath();
            ctx.arc(bx + boxW / 2, startY + boxH - 25, 8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 進位弧線光斑
      if (progress > 0.4 && progress < 0.9) {
        var arcProgress = (progress - 0.4) / 0.5;
        var srcX = spacing + 4 * (boxW + spacing) + boxW / 2;
        var dstX = spacing + 3 * (boxW + spacing) + boxW / 2;
        var currentFlightX = srcX + (dstX - srcX) * arcProgress;
        var currentFlightY = startY - 30 * Math.sin(arcProgress * Math.PI);

        ctx.fillStyle = COLORS.yellow;
        ctx.beginPath();
        ctx.arc(currentFlightX, currentFlightY, 9, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = COLORS.white;
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Exploding Dots 爆裂點：10 個合體融合成 1 個高位", w / 2, 50);
    },

    /* =====================================================================
       5. 🔭 四捨五入重力滾球數線 (t10 四捨五入概數天文台)
       ===================================================================== */
    renderHillsideRounding: function (ctx, w, h, data, progress) {
      var leftVal = data.leftVal || 30000;
      var rightVal = data.rightVal || 40000;
      var inputVal = data.val || 36400; // 輸入值

      var startX = w * 0.15;
      var endX = w * 0.85;
      var groundY = h * 0.65;
      var peakY = h * 0.38;
      var midX = (startX + endX) / 2;

      // 繪製山丘曲線 (Hillside Curve)
      ctx.beginPath();
      ctx.moveTo(startX, groundY);
      ctx.quadraticCurveTo(midX, peakY, endX, groundY);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 3;
      ctx.stroke();

      // 端點標籤
      ctx.fillStyle = COLORS.yellow;
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(leftVal.toString(), startX, groundY + 30);
      ctx.fillText(rightVal.toString(), endX, groundY + 30);
      ctx.fillText("山頂中點 " + ((leftVal + rightVal) / 2), midX, peakY - 15);

      // 球的初始比例
      var ratio = (inputVal - leftVal) / (rightVal - leftVal);
      var willRollRight = ratio >= 0.5;

      // 計算滾動軌跡
      var finalRatio = willRollRight ? 1.0 : 0.0;
      var currentRatio = ratio + (finalRatio - ratio) * Math.pow(progress, 2);

      var ballX = startX + (endX - startX) * currentRatio;
      var t = currentRatio;
      var ballY = (1 - t) * (1 - t) * groundY + 2 * (1 - t) * t * peakY + t * t * groundY - 12;

      // 繪製滾球
      ctx.fillStyle = willRollRight ? COLORS.green : COLORS.orange;
      ctx.beginPath();
      ctx.arc(ballX, ballY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = COLORS.white;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = COLORS.white;
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(inputVal.toString(), ballX, ballY - 18);

      // 結果儀表板
      ctx.font = "bold 22px sans-serif";
      ctx.fillText("四捨五入結果: " + inputVal + " ≈ " + (willRollRight ? rightVal : leftVal), w / 2, 50);
      ctx.font = "14px sans-serif";
      ctx.fillStyle = willRollRight ? COLORS.green : COLORS.orange;
      ctx.fillText(willRollRight ? "超過中點 (≥5)，受重力加速滾向較大整數！" : "未達中點 (<5)，順勢滾回較小整數！", w / 2, 80);
    },

    /* =====================================================================
       動畫引擎主迴圈控制 (60fps rAF)
       ===================================================================== */
    startAnimation: function (modelData, durationMs, onUpdate, onComplete) {
      this.stopAnimation();
      var self = this;
      var startTime = performance.now();
      var duration = durationMs || 2000;
      this.isAnimating = true;

      function loop(currentTime) {
        if (!self.isAnimating) return;
        var elapsed = currentTime - startTime;
        var rawProg = Math.min(1.0, elapsed / duration);

        // 3B1B 經典平滑緩動 (Smooth Step Ease)
        var smoothProg = rawProg * rawProg * (3 - 2 * rawProg);
        self.render(modelData, smoothProg);

        if (onUpdate) onUpdate(smoothProg);

        if (rawProg < 1.0) {
          self.animFrameId = requestAnimationFrame(loop);
        } else {
          self.isAnimating = false;
          if (onComplete) onComplete();
        }
      }

      this.animFrameId = requestAnimationFrame(loop);
    },

    stopAnimation: function () {
      this.isAnimating = false;
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
    }
  };

  window.VisualMorphG4 = VisualMorphG4;
})(window);

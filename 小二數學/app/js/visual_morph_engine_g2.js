/**
 * 3Blue1Brown 視覺幾何透視引擎 - 小二數學專用版 (Visual Morph Engine G2)
 * 專為國小二年級數學 RPG 冒險量身打造的純原生 Canvas 物理與連續幾何形變引擎
 * 支援 8 大經典具象化數學模型：
 * 1. 乘法分組陣列形變 (mul_group)
 * 2. 乘法表累加與波浪點亮 (mul_table)
 * 3. 乘法交換律 90° 旋轉不變量 (mul_rotate)
 * 4. 平分與分裝拋物線飛入 (fair_share)
 * 5. 積木加法與滿十進位融合成棒 (block_add)
 * 6. 積木減法與借一退十拆解劃線 (block_sub)
 * 7. 擬真公分直尺跳步拱橋 (ruler_jump)
 * 8. 圖形疊合透明度比較 (shape_superposition)
 */

(function (window) {
  "use strict";

  // 🌟 3Blue1Brown 經典招牌配色盤
  var COLORS = {
    bg: "#0E0E0E",
    blue: "#58C4DD",
    pink: "#FF6584",
    yellow: "#FFFF00",
    green: "#83C167",
    orange: "#FF9F40",
    purple: "#9A72AC",
    cyan: "#38BDF8",
    text: "#F8FAFC",
    gridLine: "rgba(255, 255, 255, 0.05)"
  };

  // 🧮 緩動與數學工具
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // 🎨 繪圖輔助函式
  function drawRoundRect(ctx, x, y, w, h, r, fillColor, strokeColor, lineWidth) {
    ctx.save();
    ctx.beginPath();
    var radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.roundRect ? ctx.roundRect(x, y, w, h, radius) : fallbackRoundRect(ctx, x, y, w, h, radius);
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth || 1.5;
      ctx.stroke();
    }
    ctx.restore();
  }

  function fallbackRoundRect(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawBadge(ctx, text, x, y, bgColor, textColor, fontSize, bold) {
    ctx.save();
    ctx.font = (bold !== false ? "bold " : "") + (fontSize || 12) + "px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var textWidth = ctx.measureText(text).width;
    var pw = textWidth + 16;
    var ph = (fontSize || 12) + 10;
    drawRoundRect(ctx, x - pw / 2, y - ph / 2, pw, ph, ph / 2, bgColor, null);
    ctx.fillStyle = textColor || "#FFFFFF";
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function drawGlowDot(ctx, x, y, r, fillColor, glowColor, glowBlur) {
    ctx.save();
    ctx.shadowColor = glowColor || fillColor;
    ctx.shadowBlur = glowBlur || 10;
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // 內部高光反光
    var grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.85)");
    grad.addColorStop(0.5, fillColor);
    grad.addColorStop(1, fillColor);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 🧱 十位棒繪製 (Ten-rod)
  function drawTenRod(ctx, x, y, w, h, alpha, isFading) {
    ctx.save();
    ctx.globalAlpha = alpha !== undefined ? alpha : 1.0;
    var segH = h / 10;

    // 外框與微立體漸層
    var bgGrad = ctx.createLinearGradient(x, y, x + w, y);
    bgGrad.addColorStop(0, isFading ? "rgba(255, 101, 132, 0.2)" : "rgba(131, 193, 103, 0.35)");
    bgGrad.addColorStop(0.5, isFading ? "rgba(255, 101, 132, 0.6)" : "rgba(131, 193, 103, 0.65)");
    bgGrad.addColorStop(1, isFading ? "rgba(255, 101, 132, 0.2)" : "rgba(131, 193, 103, 0.35)");

    drawRoundRect(ctx, x, y, w, h, 4, bgGrad, isFading ? COLORS.pink : COLORS.green, 2);

    // 10 節刻度細線
    ctx.strokeStyle = isFading ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1;
    for (var i = 1; i < 10; i++) {
      var sy = y + i * segH;
      ctx.beginPath();
      ctx.moveTo(x + 1, sy);
      ctx.lineTo(x + w - 1, sy);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 🟨 個位立方塊繪製 (One-cube)
  function drawOneCube(ctx, x, y, size, alpha, isFading) {
    ctx.save();
    ctx.globalAlpha = alpha !== undefined ? alpha : 1.0;

    var bgGrad = ctx.createLinearGradient(x, y, x + size, y + size);
    bgGrad.addColorStop(0, isFading ? "rgba(255, 101, 132, 0.3)" : "rgba(255, 255, 0, 0.5)");
    bgGrad.addColorStop(1, isFading ? "rgba(255, 101, 132, 0.7)" : "rgba(255, 200, 0, 0.85)");

    drawRoundRect(ctx, x, y, size, size, 3, bgGrad, isFading ? COLORS.pink : COLORS.yellow, 1.8);

    // 內角立體折射高光
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + size - 2);
    ctx.lineTo(x + 2, y + 2);
    ctx.lineTo(x + size - 2, y + 2);
    ctx.stroke();
    ctx.restore();
  }

  // 🚀 VisualMorphG2 主體物件
  var VisualMorphG2 = {
    registry: {},
    currentCanvas: null,
    currentCtx: null,
    currentData: null,
    progress: 0.0,
    isAnimating: false,
    animDir: 1,
    animId: null,
    audioCtx: null,
    width: 480,
    height: 280,

    // 1. 初始化與註冊表載入
    initRegistry: function (data) {
      if (data && typeof data === "object") {
        this.registry = data;
      } else if (typeof window !== "undefined" && window.__VISUAL_MORPH_REGISTRY_G2__) {
        this.registry = window.__VISUAL_MORPH_REGISTRY_G2__;
      } else {
        this.registry = {};
      }
    },

    loadRegistryAsync: function (url, cb) {
      var self = this;
      fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP error " + res.status);
          return res.json();
        })
        .then(function (data) {
          self.registry = data;
          if (cb) cb(null, data);
        })
        .catch(function (err) {
          console.warn("[VisualMorphG2] 註冊表異步載入注意:", err);
          if (cb) cb(err);
        });
    },

    getMorphData: function (qid) {
      return this.registry[qid] || null;
    },

    // 2. Web Audio 音效引擎
    playTone: function (freq, type, dur) {
      try {
        type = type || "sine";
        dur = dur || 0.06;
        if (!this.audioCtx) {
          var AudioCtxClass = window.AudioContext || window.webkitAudioContext;
          if (AudioCtxClass) {
            this.audioCtx = new AudioCtxClass();
          }
        }
        if (this.audioCtx && this.audioCtx.state === "suspended") {
          this.audioCtx.resume();
        }
        if (!this.audioCtx) return;

        var now = this.audioCtx.currentTime;
        var osc = this.audioCtx.createOscillator();
        var gain = this.audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + dur);
      } catch (e) {
        // 音訊靜音容錯
      }
    },

    // 3. 掛載與生命週期
    mount: function (canvasEl, morphData) {
      this.currentCanvas = canvasEl;
      this.currentCtx = canvasEl.getContext("2d");
      this.currentData = morphData;
      this.progress = 0.0;
      this.isAnimating = false;
      this.animDir = 1;
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
      this.resize();
      this.render();
    },

    resize: function () {
      if (!this.currentCanvas) return;
      var parent = this.currentCanvas.parentElement;
      var rect = parent ? parent.getBoundingClientRect() : this.currentCanvas.getBoundingClientRect();
      var w = rect.width > 0 ? rect.width : (this.currentCanvas.width || 480);
      var h = rect.height > 0 ? rect.height : (this.currentCanvas.height || 280);

      var dpr = window.devicePixelRatio || 1;
      this.width = w;
      this.height = h;

      this.currentCanvas.width = Math.round(w * dpr);
      this.currentCanvas.height = Math.round(h * dpr);
      this.currentCanvas.style.width = w + "px";
      this.currentCanvas.style.height = h + "px";

      if (this.currentCtx) {
        this.currentCtx.setTransform(1, 0, 0, 1, 0, 0);
        this.currentCtx.scale(dpr, dpr);
      }
    },

    // 4. 背景 3B1B 經典格線紙 (Graph Paper Grid)
    renderGrid: function (w, h) {
      var ctx = this.currentCtx;
      ctx.save();
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = COLORS.gridLine;
      ctx.lineWidth = 1;

      var step = 24;
      for (var x = 0; x <= w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, h);
        ctx.stroke();
      }
      for (var y = 0; y <= h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
        ctx.stroke();
      }
      ctx.restore();
    },

    // 5. 總渲染調度器
    render: function () {
      if (!this.currentCanvas || !this.currentCtx || !this.currentData) return;
      var w = this.width;
      var h = this.height;
      var ctx = this.currentCtx;

      ctx.clearRect(0, 0, w, h);
      this.renderGrid(w, h);

      var type = this.currentData.type;
      var params = this.currentData.params || {};

      switch (type) {
        case "mul_group":
          this.renderMulGroup(w, h, params);
          break;
        case "mul_table":
          this.renderMulTable(w, h, params);
          break;
        case "mul_rotate":
          this.renderMulRotate(w, h, params);
          break;
        case "fair_share":
          this.renderFairShare(w, h, params);
          break;
        case "block_add":
          this.renderBlockAdd(w, h, params);
          break;
        case "block_sub":
          this.renderBlockSub(w, h, params);
          break;
        case "ruler_jump":
          this.renderRulerJump(w, h, params);
          break;
        case "shape_superposition":
          this.renderShapeSuperposition(w, h, params);
          break;
        default:
          console.warn("[VisualMorphG2] 未知圖形類型:", type);
          break;
      }
    },

    setProgress: function (val) {
      this.progress = clamp(val, 0, 1);
      this.render();
    },

    stepAnimation: function () {
      if (!this.isAnimating) return;
      this.progress += 0.012 * this.animDir;
      if (this.progress >= 1.0) {
        this.progress = 1.0;
        this.animDir = -1;
        this.playTone(659, "triangle", 0.08);
      } else if (this.progress <= 0.0) {
        this.progress = 0.0;
        this.animDir = 1;
        this.playTone(330, "triangle", 0.08);
      }
      this.render();

      if (this.isAnimating) {
        var self = this;
        var raf = (typeof window !== "undefined" && window.requestAnimationFrame) ? window.requestAnimationFrame : function (fn) { return setTimeout(fn, 16); };
        this.animId = raf(function () {
          self.stepAnimation();
        });
      }
    },

    toggleAnimation: function () {
      this.isAnimating = !this.isAnimating;
      if (this.isAnimating) {
        this.playTone(440, "sine", 0.05);
        this.stepAnimation();
      } else if (this.animId) {
        var caf = (typeof window !== "undefined" && window.cancelAnimationFrame) ? window.cancelAnimationFrame : function (id) { clearTimeout(id); };
        caf(this.animId);
        this.animId = null;
      }
    },

    // =========================================================================
    // 🎨 8 大核心具象化數學模型渲染器 (All 8 3B1B Renderers)
    // =========================================================================

    // -------------------------------------------------------------------------
    // 1. 乘法分組陣列形變 (renderMulGroup)
    // -------------------------------------------------------------------------
    renderMulGroup: function (w, h, p) {
      var ctx = this.currentCtx;
      var each = p.each_count || 3;
      var group = p.group_count || 3;
      var total = p.total || (each * group);
      var itemName = p.item_name || "顆球";
      var t = this.progress;
      var easeT = easeInOutCubic(t);

      // 標題與引導
      ctx.save();
      ctx.font = "bold 13px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = COLORS.cyan;
      ctx.fillText("【乘法意義：每份有 " + each + "，共有 " + group + " 份】", w * 0.5, 22);

      // 起始狀態：group 個分組盒子排布
      var maxColsPerRow = group <= 4 ? group : Math.ceil(group / 2);
      var boxW = Math.min(84, (w - 40) / maxColsPerRow - 10);
      var boxH = group <= 4 ? (h * 0.45) : (h * 0.28);
      var dotR = Math.min(8, boxW / (each * 2 + 1));

      // 終止狀態：緊湊的 (group x each) 矩陣
      var matrixCellW = Math.min(32, (w * 0.55) / each);
      var matrixCellH = Math.min(26, (h * 0.48) / group);
      var matrixTotalW = each * matrixCellW;
      var matrixTotalH = group * matrixCellH;
      var matrixStartX = w * 0.5 - matrixTotalW * 0.5 + matrixCellW * 0.5;
      var matrixStartY = h * 0.54 - matrixTotalH * 0.5 + matrixCellH * 0.5;

      // 繪製各分組的外框（隨著 t 增大漸漸淡出消隱）
      if (t < 0.6) {
        var boxAlpha = clamp(1.0 - t * 1.8, 0, 1);
        ctx.globalAlpha = boxAlpha;
        for (var g = 0; g < group; g++) {
          var rowIdx = group <= 4 ? 0 : Math.floor(g / maxColsPerRow);
          var colIdx = group <= 4 ? g : g % maxColsPerRow;
          var rowCount = (rowIdx === 1 && group % maxColsPerRow !== 0) ? (group % maxColsPerRow) : maxColsPerRow;
          var totalRowW = rowCount * (boxW + 10) - 10;
          var bx = w * 0.5 - totalRowW * 0.5 + colIdx * (boxW + 10);
          var by = group <= 4 ? (h * 0.48 - boxH * 0.5) : (h * 0.35 + rowIdx * (boxH + 12) - boxH * 0.5);

          drawRoundRect(ctx, bx, by, boxW, boxH, 8, "rgba(88, 196, 221, 0.08)", "rgba(88, 196, 221, 0.4)", 1.5);
          ctx.fillStyle = COLORS.blue;
          ctx.font = "bold 11px -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("第 " + (g + 1) + " 盒", bx + boxW * 0.5, by - 6);
        }
        ctx.globalAlpha = 1.0;
      }

      // 繪製每個物件點從「盒內」滑動飛向「矩陣位置」
      for (var g = 0; g < group; g++) {
        var rowIdx = group <= 4 ? 0 : Math.floor(g / maxColsPerRow);
        var colIdx = group <= 4 ? g : g % maxColsPerRow;
        var rowCount = (rowIdx === 1 && group % maxColsPerRow !== 0) ? (group % maxColsPerRow) : maxColsPerRow;
        var totalRowW = rowCount * (boxW + 10) - 10;
        var bx = w * 0.5 - totalRowW * 0.5 + colIdx * (boxW + 10);
        var by = group <= 4 ? (h * 0.48 - boxH * 0.5) : (h * 0.35 + rowIdx * (boxH + 12) - boxH * 0.5);

        for (var i = 0; i < each; i++) {
          // 起始位置（均勻分佈在盒內）
          var itemStartX = bx + (boxW / (each + 1)) * (i + 1);
          var itemStartY = by + boxH * 0.5;

          // 終止位置（排列成緊密矩陣）
          var itemTargetX = matrixStartX + i * matrixCellW;
          var itemTargetY = matrixStartY + g * matrixCellH;

          // 線性差值＋拋物線彈動
          var curX = lerp(itemStartX, itemTargetX, easeT);
          var curY = lerp(itemStartY, itemTargetY, easeT);

          // 顏色隨過渡從藍轉亮黃
          var dotColor = t > 0.7 ? COLORS.yellow : COLORS.cyan;
          drawGlowDot(ctx, curX, curY, dotR, dotColor, dotColor, 8);
        }
      }

      // 當 t > 0.5 時，繪製矩陣標註括弧與乘法算式
      if (t > 0.4) {
        var guideAlpha = clamp((t - 0.4) * 2.0, 0, 1);
        ctx.globalAlpha = guideAlpha;

        // 左側排數括弧
        ctx.strokeStyle = COLORS.pink;
        ctx.lineWidth = 2;
        var bracketLeftX = matrixStartX - dotR - 14;
        ctx.beginPath();
        ctx.moveTo(bracketLeftX + 6, matrixStartY - dotR - 4);
        ctx.lineTo(bracketLeftX, matrixStartY - dotR - 4);
        ctx.lineTo(bracketLeftX, matrixStartY + (group - 1) * matrixCellH + dotR + 4);
        ctx.lineTo(bracketLeftX + 6, matrixStartY + (group - 1) * matrixCellH + dotR + 4);
        ctx.stroke();

        ctx.fillStyle = COLORS.pink;
        ctx.font = "bold 11px -apple-system, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(group + " 排", bracketLeftX - 4, matrixStartY + (group - 1) * matrixCellH * 0.5 + 4);

        // 上方每排個數括弧
        ctx.strokeStyle = COLORS.cyan;
        var bracketTopY = matrixStartY - dotR - 14;
        ctx.beginPath();
        ctx.moveTo(matrixStartX - dotR - 4, bracketTopY + 6);
        ctx.lineTo(matrixStartX - dotR - 4, bracketTopY);
        ctx.lineTo(matrixStartX + (each - 1) * matrixCellW + dotR + 4, bracketTopY);
        ctx.lineTo(matrixStartX + (each - 1) * matrixCellW + dotR + 4, bracketTopY + 6);
        ctx.stroke();

        ctx.fillStyle = COLORS.cyan;
        ctx.textAlign = "center";
        ctx.fillText("每排 " + each + " " + itemName, matrixStartX + (each - 1) * matrixCellW * 0.5, bracketTopY - 6);
        ctx.globalAlpha = 1.0;
      }

      // 底部動態算式條
      var formulaY = h - 18;
      if (t < 0.5) {
        drawBadge(ctx, "共有 " + group + " 組，每組 " + each + " " + itemName, w * 0.5, formulaY, "rgba(56, 189, 248, 0.15)", COLORS.cyan, 12);
      } else {
        var formulaText = each + " 顆 × " + group + " 盒 ＝ " + total + " " + itemName + " (陣列總數: " + total + ")";
        drawBadge(ctx, formulaText, w * 0.5, formulaY, "rgba(255, 255, 0, 0.18)", COLORS.yellow, 13, true);
      }

      ctx.restore();
    },

    // -------------------------------------------------------------------------
    // 2. 乘法表累加與波浪點亮 (renderMulTable)
    // -------------------------------------------------------------------------
    renderMulTable: function (w, h, p) {
      var ctx = this.currentCtx;
      var a = p.a || 3;
      var b = p.b || 4;
      var product = p.product || (a * b);
      var t = this.progress;

      ctx.save();
      ctx.font = "bold 13px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = COLORS.yellow;
      ctx.fillText("【" + a + " 的乘法表連加探秘：每次加 " + a + "】", w * 0.5, 22);

      // 左側/中央 2D 矩陣網格
      var cellW = Math.min(30, (w * 0.42) / a);
      var cellH = Math.min(22, (h * 0.52) / b);
      var startX = w * 0.18;
      var startY = h * 0.48 - (b * cellH) * 0.5;

      var activeRowProgress = t * b;

      for (var r = 0; r < b; r++) {
        var rowT = clamp(activeRowProgress - r, 0, 1);
        var isRowActive = rowT > 0;
        var rowY = startY + r * cellH;

        // 繪製每排的 a 個小方格
        for (var c = 0; c < a; c++) {
          var cellX = startX + c * cellW;
          var fillGrad = ctx.createLinearGradient(cellX, rowY, cellX + cellW, rowY + cellH);

          if (isRowActive) {
            fillGrad.addColorStop(0, "rgba(56, 189, 248, " + (0.2 + rowT * 0.5) + ")");
            fillGrad.addColorStop(1, "rgba(131, 193, 103, " + (0.2 + rowT * 0.5) + ")");
            drawRoundRect(ctx, cellX + 1.5, rowY + 1.5, cellW - 3, cellH - 3, 4, fillGrad, COLORS.cyan, 1.5);

            // 格子中心圓點
            ctx.fillStyle = COLORS.yellow;
            ctx.beginPath();
            ctx.arc(cellX + cellW * 0.5, rowY + cellH * 0.5, 3.5 * rowT, 0, Math.PI * 2);
            ctx.fill();
          } else {
            drawRoundRect(ctx, cellX + 1.5, rowY + 1.5, cellW - 3, cellH - 3, 4, "rgba(255, 255, 255, 0.03)", "rgba(255, 255, 255, 0.12)", 1);
          }
        }

        // 右側連加與累計標註 (Skip Counting Badge)
        if (isRowActive) {
          ctx.save();
          ctx.globalAlpha = rowT;
          var labelX = startX + a * cellW + 18;
          var cumVal = a * (r + 1);

          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.font = "bold 12px -apple-system, sans-serif";
          ctx.fillStyle = COLORS.pink;
          ctx.fillText("+" + a, labelX, rowY + cellH * 0.5);

          var badgeX = labelX + 44;
          var isLastRow = (r === b - 1 && rowT > 0.8);
          var badgeBg = isLastRow ? "rgba(255, 255, 0, 0.25)" : "rgba(88, 196, 221, 0.15)";
          var badgeTextCol = isLastRow ? COLORS.yellow : COLORS.cyan;

          drawBadge(ctx, a + " × " + (r + 1) + " ＝ " + cumVal, badgeX + 36, rowY + cellH * 0.5, badgeBg, badgeTextCol, 11);
          ctx.restore();
        }
      }

      // 底部水平連加進程珠鍊
      var chainY = h - 22;
      var chainStep = Math.min(48, (w - 60) / b);
      var chainStartX = w * 0.5 - (b * chainStep) * 0.5 + chainStep * 0.5;

      for (var k = 1; k <= b; k++) {
        var cx = chainStartX + (k - 1) * chainStep;
        var passed = activeRowProgress >= k;
        var isCurrent = (activeRowProgress >= k - 1 && activeRowProgress < k);

        if (passed) {
          drawBadge(ctx, String(a * k), cx, chainY, "rgba(255, 255, 0, 0.25)", COLORS.yellow, 11, true);
        } else {
          drawBadge(ctx, String(a * k), cx, chainY, "rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.3)", 11, false);
        }

        if (k < b) {
          ctx.fillStyle = passed ? COLORS.green : "rgba(255, 255, 255, 0.2)";
          ctx.font = "10px sans-serif";
          ctx.fillText("➔", cx + chainStep * 0.5, chainY);
        }
      }

      ctx.restore();
    },

    // -------------------------------------------------------------------------
    // 3. 乘法交換律 90° 旋轉不變量 (renderMulRotate)
    // -------------------------------------------------------------------------
    renderMulRotate: function (w, h, p) {
      var ctx = this.currentCtx;
      var rows = p.rows || 3;
      var cols = p.cols || 4;
      var total = p.total || (rows * cols);
      var t = this.progress;
      var angle = easeInOutCubic(t) * (Math.PI / 2);

      var cx = w * 0.5;
      var cy = h * 0.5 - 6;
      var cellSize = Math.min(34, (w * 0.5) / Math.max(rows, cols), (h * 0.48) / Math.max(rows, cols));

      ctx.save();
      ctx.font = "bold 13px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = COLORS.green;
      ctx.fillText("【乘法交換律：旋轉 90°，總數恆等於 " + total + "】", w * 0.5, 22);

      // 旋轉導引虛線圓弧
      var maxHalf = Math.sqrt(Math.pow((cols * cellSize) / 2, 2) + Math.pow((rows * cellSize) / 2, 2)) + 16;
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, maxHalf, 0, Math.PI / 2);
      ctx.stroke();
      ctx.restore();

      // 旋轉箭頭提示
      if (t > 0.05 && t < 0.95) {
        var arrowAngle = angle;
        var ax = cx + Math.cos(arrowAngle) * maxHalf;
        var ay = cy + Math.sin(arrowAngle) * maxHalf;
        ctx.fillStyle = COLORS.yellow;
        ctx.beginPath();
        ctx.arc(ax, ay, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // 旋轉矩陣本體
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      var gridTotalW = cols * cellSize;
      var gridTotalH = rows * cellSize;
      var gridStartX = -gridTotalW * 0.5;
      var gridStartY = -gridTotalH * 0.5;

      // 繪製半透明矩陣外圍框
      drawRoundRect(ctx, gridStartX, gridStartY, gridTotalW, gridTotalH, 10, "rgba(88, 196, 221, 0.06)", "rgba(88, 196, 221, 0.35)", 1.5);

      // 繪製各點
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var px = gridStartX + (c + 0.5) * cellSize;
          var py = gridStartY + (r + 0.5) * cellSize;
          var dotColor = (t > 0.8) ? COLORS.pink : ((t < 0.2) ? COLORS.cyan : COLORS.yellow);
          drawGlowDot(ctx, px, py, 6.5, dotColor, dotColor, 8);
        }
      }
      ctx.restore();

      // 兩側與頂部視角標註
      var formulaY = h - 20;
      if (t < 0.3) {
        ctx.fillStyle = COLORS.cyan;
        ctx.font = "bold 12px -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("當前視角： " + rows + " 排 × 每排 " + cols + " 個 ＝ " + total + " 個", w * 0.5, formulaY);
      } else if (t > 0.7) {
        ctx.fillStyle = COLORS.pink;
        ctx.font = "bold 12px -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("旋轉後視角： " + cols + " 排 × 每排 " + rows + " 個 ＝ " + total + " 個", w * 0.5, formulaY);
      } else {
        ctx.fillStyle = COLORS.yellow;
        ctx.font = "bold 13px -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🌟 旋轉中... " + rows + " × " + cols + " ＝ " + cols + " × " + rows + " ＝ " + total, w * 0.5, formulaY);
      }

      ctx.restore();
    },

    // -------------------------------------------------------------------------
    // 4. 平分與分裝拋物線飛入 (renderFairShare)
    // -------------------------------------------------------------------------
    renderFairShare: function (w, h, p) {
      var ctx = this.currentCtx;
      var total = p.total || 9;
      var perGroup = p.per_group || 3;
      var groupCount = p.group_count || 3;
      var itemName = p.item_name || "糖果";
      var t = this.progress;

      ctx.save();
      ctx.font = "bold 13px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = COLORS.orange;
      ctx.fillText("【分裝任務：總共 " + total + " 顆，每 " + perGroup + " 顆裝一袋】", w * 0.5, 22);

      // 上方待分裝托盤
      var topTrayY = 56;
      var topItemR = 9;
      var topSpacing = Math.min(26, (w - 60) / total);
      var topStartX = w * 0.5 - (total * topSpacing) * 0.5 + topSpacing * 0.5;

      // 下方袋子 (Bowls / Bags)
      var bowlW = Math.min(74, (w - 40) / groupCount - 12);
      var bowlH = 50;
      var bowlY = h - 86;
      var bowlSpacing = (w - 40) / groupCount;

      // 繪製袋子
      for (var g = 0; g < groupCount; g++) {
        var bx = 20 + g * bowlSpacing + (bowlSpacing - bowlW) * 0.5;
        var fullAtT = (g + 1) / groupCount;
        var isFilled = t >= fullAtT;

        // 袋子主體
        var bagBorderColor = isFilled ? COLORS.green : "rgba(255, 159, 64, 0.45)";
        var bagFillColor = isFilled ? "rgba(131, 193, 103, 0.12)" : "rgba(255, 159, 64, 0.08)";
        drawRoundRect(ctx, bx, bowlY, bowlW, bowlH, 12, bagFillColor, bagBorderColor, 1.8);

        // 袋子標籤
        ctx.fillStyle = isFilled ? COLORS.green : "rgba(255, 255, 255, 0.7)";
        ctx.font = "bold 11px -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("第 " + (g + 1) + " 袋", bx + bowlW * 0.5, bowlY + bowlH + 15);
      }

      // 每個物品的運動軌跡
      for (var i = 0; i < total; i++) {
        var targetBag = Math.floor(i / perGroup);
        var targetSlot = i % perGroup;

        // 拋物線時間安排
        var startT = (i / total) * 0.65;
        var endT = startT + 0.28;
        var localT = clamp((t - startT) / (endT - startT), 0, 1);
        var easeItemT = easeInOutCubic(localT);

        // 起點（上方托盤）
        var sx = topStartX + i * topSpacing;
        var sy = topTrayY;

        // 終點（目標袋中）
        var bx = 20 + targetBag * bowlSpacing + (bowlSpacing - bowlW) * 0.5;
        var slotSpacing = bowlW / (perGroup + 1);
        var ex = bx + (targetSlot + 1) * slotSpacing;
        var ey = bowlY + bowlH * 0.52;

        // 貝茲曲線控制點
        var cpx = (sx + ex) * 0.5 + (i % 2 === 0 ? 25 : -25);
        var cpy = Math.min(sy, ey) - 30;

        // 當前位置計算
        var curX = (1 - easeItemT) * (1 - easeItemT) * sx + 2 * (1 - easeItemT) * easeItemT * cpx + easeItemT * easeItemT * ex;
        var curY = (1 - easeItemT) * (1 - easeItemT) * sy + 2 * (1 - easeItemT) * easeItemT * cpy + easeItemT * easeItemT * ey;

        var itemColor = localT >= 1.0 ? COLORS.green : COLORS.orange;
        drawGlowDot(ctx, curX, curY, topItemR, itemColor, itemColor, 8);

        // 飛越中的流光粒子
        if (localT > 0 && localT < 1) {
          ctx.save();
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.beginPath();
          ctx.arc(curX - 4, curY - 4, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // 底部總結算式
      var formulaY = h - 14;
      var filledCount = Math.floor(t * groupCount);
      if (t < 0.95) {
        var statusStr = "已分裝 " + filledCount + " 袋，還有 " + Math.max(0, total - Math.floor(t * total)) + " 顆待分裝...";
        drawBadge(ctx, statusStr, w * 0.5, formulaY, "rgba(255, 159, 64, 0.15)", COLORS.orange, 11);
      } else {
        var completeStr = total + " 顆每 " + perGroup + " 顆一袋 ➔ 剛好分成 " + groupCount + " 袋！";
        drawBadge(ctx, completeStr, w * 0.5, formulaY, "rgba(131, 193, 103, 0.25)", COLORS.green, 13, true);
      }

      ctx.restore();
    },

    // -------------------------------------------------------------------------
    // 5. 積木加法與滿十進位融合成棒 (renderBlockAdd)
    // -------------------------------------------------------------------------
    renderBlockAdd: function (w, h, p) {
      var ctx = this.currentCtx;
      var a = p.a || 26;
      var b = p.b || 24;
      var sum = p.sum || (a + b);
      var carry = p.carry !== undefined ? p.carry : ((a % 10) + (b % 10) >= 10);
      var t = this.progress;

      var tensA = Math.floor(a / 10);
      var onesA = a % 10;
      var tensB = Math.floor(b / 10);
      var onesB = b % 10;
      var onesSum = sum % 10;
      var tensSum = Math.floor(sum / 10);

      ctx.save();
      ctx.font = "bold 13px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = COLORS.yellow;
      ctx.fillText("【積木加法：個位滿 10 個小立方塊，結合成 1 根綠色十位棒】", w * 0.5, 20);

      // 十位與個位分界中線
      var midX = w * 0.5;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(midX, 36);
      ctx.lineTo(midX, h - 36);
      ctx.stroke();
      ctx.setLineDash([]);

      // 欄位標籤
      ctx.font = "bold 12px -apple-system, sans-serif";
      ctx.fillStyle = COLORS.green;
      ctx.fillText("十位 (10)", midX * 0.5, 48);
      ctx.fillStyle = COLORS.yellow;
      ctx.fillText("個位 (1)", midX + midX * 0.5, 48);

      var rodW = 16;
      var rodH = 78;
      var cubeSize = 13;

      // Phase 1 (0 -> 0.4): a 與 b 積木向中間下方結果區匯流
      var mergeT = clamp(t / 0.4, 0, 1);
      var easeMergeT = easeInOutCubic(mergeT);

      // 十位綠棒渲染
      var tensStartY = 64;
      var tensEndY = h * 0.5 - rodH * 0.5;
      var totalTensInitial = tensA + tensB;
      var tensSpacing = Math.min(22, (midX - 40) / Math.max(totalTensInitial, 5));

      for (var ta = 0; ta < tensA; ta++) {
        var startX = 25 + ta * tensSpacing;
        var endX = 25 + ta * tensSpacing;
        var curY = lerp(tensStartY, tensEndY, easeMergeT);
        drawTenRod(ctx, startX, curY, rodW, rodH);
      }
      for (var tb = 0; tb < tensB; tb++) {
        var startX = 25 + (tensA + tb) * tensSpacing;
        var endX = 25 + (tensA + tb) * tensSpacing;
        var curY = lerp(tensStartY + 45, tensEndY, easeMergeT);
        drawTenRod(ctx, startX, curY, rodW, rodH);
      }

      // 個位黃塊渲染
      var onesStartX = midX + 25;
      var onesTotalInitial = onesA + onesB;

      // Phase 2 (0.4 -> 0.85): 若 carry，個位滿 10 聚集融合成 1 根棒子並躍遷至十位
      if (carry && t > 0.4) {
        var fuseT = clamp((t - 0.4) / 0.45, 0, 1);
        var easeFuseT = easeInOutCubic(fuseT);

        // 剩下的散塊 (onesSum)
        for (var os = 0; os < onesSum; os++) {
          var ox = onesStartX + (os % 5) * (cubeSize + 5);
          var oy = tensEndY + Math.floor(os / 5) * (cubeSize + 6) + 25;
          drawOneCube(ctx, ox, oy, cubeSize);
        }

        // 滿十融合中或已飛入十位的棒子
        var fuseStartX = onesStartX + 4;
        var fuseStartY = tensEndY;
        var targetRodX = 25 + (totalTensInitial) * tensSpacing;
        var targetRodY = tensEndY;

        var flyingRodX = lerp(fuseStartX, targetRodX, easeFuseT);
        var flyingRodY = lerp(fuseStartY - 20, targetRodY, easeFuseT);

        if (fuseT < 0.4) {
          // 10 個小立方塊聚集緊貼
          var gatherFactor = 1.0 - fuseT / 0.4;
          for (var f = 0; f < 10; f++) {
            var origX = onesStartX + (f % 5) * (cubeSize + 5);
            var origY = tensEndY + Math.floor(f / 5) * (cubeSize + 6);
            var stackedX = fuseStartX;
            var stackedY = fuseStartY + f * (rodH / 10);
            var cx = lerp(stackedX, origX, gatherFactor);
            var cy = lerp(stackedY, origY, gatherFactor);
            drawOneCube(ctx, cx, cy, cubeSize);
          }
        } else {
          // 已經結合成發光的新十位棒，並飛向十位
          drawTenRod(ctx, flyingRodX, flyingRodY, rodW, rodH);

          // 進位光芒徽章
          ctx.save();
          drawBadge(ctx, "★ 滿十進 1 (+10)", flyingRodX + rodW * 0.5, flyingRodY - 14, "rgba(255, 255, 0, 0.3)", COLORS.yellow, 11, true);
          ctx.restore();
        }
      } else {
        // 未進位或尚未合流
        for (var i = 0; i < onesTotalInitial; i++) {
          var ox = onesStartX + (i % 5) * (cubeSize + 5);
          var oy = lerp(tensStartY + Math.floor(i / 5) * (cubeSize + 6), tensEndY + Math.floor(i / 5) * (cubeSize + 6), easeMergeT);
          drawOneCube(ctx, ox, oy, cubeSize);
        }
      }

      // 底部總算式橫條
      var formulaY = h - 16;
      var sumFormula = a + " ＋ " + b + " ＝ " + sum + (carry ? " (個位滿十進位！)" : "");
      drawBadge(ctx, sumFormula, w * 0.5, formulaY, carry ? "rgba(255, 255, 0, 0.2)" : "rgba(131, 193, 103, 0.2)", carry ? COLORS.yellow : COLORS.green, 13, true);

      ctx.restore();
    },

    // -------------------------------------------------------------------------
    // 6. 積木減法與借一退十拆解劃線 (renderBlockSub)
    // -------------------------------------------------------------------------
    renderBlockSub: function (w, h, p) {
      var ctx = this.currentCtx;
      var a = p.a || 81;
      var b = p.b || 25;
      var diff = p.diff || (a - b);
      var borrow = p.borrow !== undefined ? p.borrow : ((a % 10) < (b % 10));
      var t = this.progress;

      var tensA = Math.floor(a / 10);
      var onesA = a % 10;
      var tensB = Math.floor(b / 10);
      var onesB = b % 10;
      var tensDiff = Math.floor(diff / 10);
      var onesDiff = diff % 10;

      ctx.save();
      ctx.font = "bold 13px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = COLORS.pink;
      ctx.fillText("【積木減法：個位不夠減，十位借 1 拆成 10 個小立方塊】", w * 0.5, 20);

      var midX = w * 0.5;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(midX, 36);
      ctx.lineTo(midX, h - 36);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = "bold 12px -apple-system, sans-serif";
      ctx.fillStyle = COLORS.green;
      ctx.fillText("十位 (被減數 " + tensA + ")", midX * 0.5, 48);
      ctx.fillStyle = COLORS.yellow;
      ctx.fillText("個位 (被減數 " + onesA + ")", midX + midX * 0.5, 48);

      var rodW = 14;
      var rodH = 74;
      var cubeSize = 12;

      var tensY = h * 0.5 - rodH * 0.5;
      var tensSpacing = Math.min(20, (midX - 40) / Math.max(tensA, 5));

      // Phase 1 (0 -> 0.45): 借位拆解
      var borrowT = clamp(t / 0.45, 0, 1);
      var easeBorrowT = easeInOutCubic(borrowT);

      // 十位棒渲染（被借走的那一根會移動並拆解）
      var remainingTens = borrow ? (tensA - 1) : tensA;

      for (var ta = 0; ta < remainingTens; ta++) {
        var rx = 25 + ta * tensSpacing;
        var willBeSubtracted = (ta >= remainingTens - tensB);

        // Phase 2: 減去十位時劃紅斜線
        var isCrossing = t > 0.6 && willBeSubtracted;
        var rodAlpha = isCrossing ? 0.35 : 1.0;
        drawTenRod(ctx, rx, tensY, rodW, rodH, rodAlpha, isCrossing);

        if (isCrossing) {
          ctx.strokeStyle = COLORS.pink;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(rx - 2, tensY + rodH + 2);
          ctx.lineTo(rx + rodW + 2, tensY - 2);
          ctx.stroke();
        }
      }

      // 被借去個位的那根棒子
      if (borrow) {
        var borrowedRodX = 25 + (tensA - 1) * tensSpacing;
        var targetBorrowX = midX + 20;

        if (borrowT < 0.5) {
          // 正在移動過中線
          var curBx = lerp(borrowedRodX, targetBorrowX, borrowT * 2);
          drawTenRod(ctx, curBx, tensY, rodW, rodH, 1.0, true);
        } else {
          // 已經拆成 10 個小立方塊
          var splitFactor = (borrowT - 0.5) * 2;
          ctx.save();
          drawBadge(ctx, "借 1 退 10", targetBorrowX + 24, tensY - 14, "rgba(255, 101, 132, 0.3)", COLORS.pink, 10, true);
          ctx.restore();
        }
      }

      // 個位立方塊渲染（包含原本的 onesA 與借來的 10 塊）
      var onesStartX = midX + 20;
      var totalOnesNow = borrow ? (onesA + 10) : onesA;

      for (var oi = 0; oi < totalOnesNow; oi++) {
        var ox = onesStartX + (oi % 5) * (cubeSize + 6);
        var oy = tensY + Math.floor(oi / 5) * (cubeSize + 7);

        // 減法劃線淘汰 (Phase 2: t > 0.55)
        var isEliminated = (oi < onesB);
        var isCrossed = (t > 0.55 && isEliminated);
        var cubeAlpha = isCrossed ? 0.25 : 1.0;

        drawOneCube(ctx, ox, oy, cubeSize, cubeAlpha, isCrossed);

        if (isCrossed) {
          ctx.strokeStyle = COLORS.pink;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ox - 1, oy + cubeSize + 1);
          ctx.lineTo(ox + cubeSize + 1, oy - 1);
          ctx.stroke();
        }
      }

      // 底部算式
      var formulaY = h - 16;
      var subFormula = a + " － " + b + " ＝ " + diff + (borrow ? " (十位借 1 拆成 10 個一！)" : "");
      drawBadge(ctx, subFormula, w * 0.5, formulaY, borrow ? "rgba(255, 101, 132, 0.25)" : "rgba(88, 196, 221, 0.2)", borrow ? COLORS.pink : COLORS.cyan, 13, true);

      ctx.restore();
    },

    // -------------------------------------------------------------------------
    // 7. 擬真公分直尺跳步拱橋 (renderRulerJump)
    // -------------------------------------------------------------------------
    renderRulerJump: function (w, h, p) {
      var ctx = this.currentCtx;
      var startCm = p.start_cm !== undefined ? p.start_cm : 2;
      var endCm = p.end_cm !== undefined ? p.end_cm : 7;
      var lengthCm = p.length_cm || (endCm - startCm);
      var t = this.progress;

      ctx.save();
      ctx.font = "bold 13px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = COLORS.yellow;
      ctx.fillText("【直尺測量：非 0 刻度起點，用 終點 － 起點 ＝ 長度】", w * 0.5, 20);

      // 直尺規格排布
      var maxCm = Math.max(endCm + 2, 12);
      var rulerMarginX = 36;
      var rulerW = w - rulerMarginX * 2;
      var rulerH = 46;
      var rulerY = h * 0.65;
      var pxPerCm = rulerW / maxCm;

      function getCmX(cm) {
        return rulerMarginX + cm * pxPerCm;
      }

      // 1. 繪製擬真直尺本體
      var rulerGrad = ctx.createLinearGradient(rulerMarginX, rulerY, rulerMarginX, rulerY + rulerH);
      rulerGrad.addColorStop(0, "#1E293B");
      rulerGrad.addColorStop(1, "#0F172A");
      drawRoundRect(ctx, rulerMarginX, rulerY, rulerW, rulerH, 8, rulerGrad, "rgba(255, 255, 255, 0.25)", 1.5);

      // 繪製公分刻度 (毫米、半公分、整公分)
      ctx.textAlign = "center";
      for (var mm = 0; mm <= maxCm * 10; mm++) {
        var x = rulerMarginX + (mm / 10) * pxPerCm;
        if (mm % 10 === 0) {
          // 整公分長刻度
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(x, rulerY);
          ctx.lineTo(x, rulerY + 18);
          ctx.stroke();

          // 數字標籤
          ctx.font = "bold 11px -apple-system, sans-serif";
          ctx.fillStyle = (mm / 10 === startCm || mm / 10 === endCm) ? COLORS.yellow : "rgba(255, 255, 255, 0.85)";
          ctx.fillText(String(mm / 10), x, rulerY + 32);
        } else if (mm % 5 === 0) {
          // 半公分中刻度
          ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(x, rulerY);
          ctx.lineTo(x, rulerY + 12);
          ctx.stroke();
        } else {
          // 毫米短刻度
          ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, rulerY);
          ctx.lineTo(x, rulerY + 7);
          ctx.stroke();
        }
      }

      // 2. 測量物體本體 (彩色長條/鉛筆)
      var itemY = rulerY - 32;
      var itemStartX = getCmX(startCm);
      var itemEndX = getCmX(endCm);
      var itemW = itemEndX - itemStartX;

      var objGrad = ctx.createLinearGradient(itemStartX, itemY, itemEndX, itemY);
      objGrad.addColorStop(0, COLORS.cyan);
      objGrad.addColorStop(1, COLORS.blue);
      drawRoundRect(ctx, itemStartX, itemY, itemW, 18, 6, objGrad, "rgba(255, 255, 255, 0.8)", 1.5);

      // 物體兩端對齊垂直指示線
      ctx.strokeStyle = COLORS.yellow;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(itemStartX, itemY + 18); ctx.lineTo(itemStartX, rulerY);
      ctx.moveTo(itemEndX, itemY + 18); ctx.lineTo(itemEndX, rulerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 起點終點文字徽章
      drawBadge(ctx, "起點: " + startCm, itemStartX, itemY - 14, "rgba(56, 189, 248, 0.2)", COLORS.cyan, 10);
      drawBadge(ctx, "終點: " + endCm, itemEndX, itemY - 14, "rgba(255, 101, 132, 0.2)", COLORS.pink, 10);

      // 3. 黃金跳步拱橋動畫 (Golden Arches +1cm each step)
      var stepProgress = t * lengthCm;

      for (var s = 0; s < lengthCm; s++) {
        var archStartX = getCmX(startCm + s);
        var archEndX = getCmX(startCm + s + 1);
        var archMidX = (archStartX + archEndX) * 0.5;
        var archApexY = rulerY - 44;

        if (stepProgress >= s + 1) {
          // 已完成的步階
          ctx.strokeStyle = COLORS.yellow;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(archStartX, rulerY);
          ctx.quadraticCurveTo(archMidX, archApexY, archEndX, rulerY);
          ctx.stroke();

          // 拱頂 +1cm 標籤
          ctx.fillStyle = COLORS.yellow;
          ctx.font = "bold 10px sans-serif";
          ctx.fillText("+1cm", archMidX, archApexY - 4);
        } else if (stepProgress > s) {
          // 正在跳躍中的動態拱橋
          var jumpFraction = stepProgress - s;
          ctx.strokeStyle = "rgba(255, 255, 0, " + jumpFraction + ")";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(archStartX, rulerY);
          var curEndX = lerp(archStartX, archEndX, jumpFraction);
          var curApexY = lerp(rulerY, archApexY, jumpFraction);
          ctx.quadraticCurveTo(lerp(archStartX, archMidX, jumpFraction), curApexY, curEndX, rulerY);
          ctx.stroke();

          // 跳動發光金球
          drawGlowDot(ctx, curEndX, curApexY, 5, COLORS.yellow, COLORS.yellow, 10);
        }
      }

      // 底部測量總結
      var formulaY = h - 14;
      var measureFormula = "刻度 " + startCm + " 到 " + endCm + " ➔ 總長度: " + endCm + " － " + startCm + " ＝ " + lengthCm + " 公分";
      drawBadge(ctx, measureFormula, w * 0.5, formulaY, "rgba(255, 255, 0, 0.2)", COLORS.yellow, 13, true);

      ctx.restore();
    },

    // -------------------------------------------------------------------------
    // 8. 圖形疊合透明度比較 (renderShapeSuperposition)
    // -------------------------------------------------------------------------
    renderShapeSuperposition: function (w, h, p) {
      var ctx = this.currentCtx;
      var countA = p.count_a || 4;
      var countB = p.count_b || 6;
      var unit = p.unit || "小正方形";
      var larger = p.larger || (countA > countB ? "甲" : (countA < countB ? "乙" : "一樣大"));
      var t = this.progress;

      ctx.save();
      ctx.font = "bold 13px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = COLORS.purple;
      ctx.fillText("【圖形疊合比大小：甲圖移動覆蓋乙圖，重疊區變成紫色】", w * 0.5, 20);

      var blockSize = Math.min(34, (w * 0.28) / 3, (h * 0.42) / 4);

      // 起始佈局：甲圖在左、乙圖在右
      var leftCenter = w * 0.26;
      var rightCenter = w * 0.74;
      var targetCenter = rightCenter; // 甲圖向右滑動覆蓋乙圖

      var slideT = clamp(t / 0.65, 0, 1);
      var easeSlideT = easeInOutCubic(slideT);
      var curCenterXA = lerp(leftCenter, targetCenter, easeSlideT);

      var centerY = h * 0.5 - 6;

      // 輔助函式：取得 N 個方塊的 (col, row) 排列座標
      function getBlockOffset(idx) {
        var col = idx % 3;
        var row = Math.floor(idx / 3);
        return {
          x: (col - 1) * (blockSize + 3),
          y: (row - 1) * (blockSize + 3)
        };
      }

      // 1. 繪製乙圖 (Pink, 固定在右側)
      for (var b = 0; b < countB; b++) {
        var offB = getBlockOffset(b);
        var bx = rightCenter + offB.x;
        var by = centerY + offB.y;

        // 若被甲覆蓋，重疊區漸漸轉為紫光
        var isOverlap = (b < countA && slideT > 0.4);
        var overlapAlpha = clamp((slideT - 0.4) * 2.0, 0, 1);

        if (isOverlap) {
          // 紫色重疊方塊
          drawRoundRect(ctx, bx - blockSize * 0.5, by - blockSize * 0.5, blockSize, blockSize, 4, "rgba(154, 114, 172, 0.75)", COLORS.purple, 2);
        } else {
          // 乙圖原始粉紅方塊（若乙較大，多出的部分在 t > 0.7 閃爍高亮）
          var isExcessB = (b >= countA && larger === "乙" && t > 0.65);
          var excessPulse = isExcessB ? (0.6 + Math.sin(Date.now() * 0.008) * 0.4) : 1.0;
          var excessBorder = isExcessB ? COLORS.yellow : COLORS.pink;

          drawRoundRect(ctx, bx - blockSize * 0.5, by - blockSize * 0.5, blockSize, blockSize, 4, "rgba(255, 101, 132, " + (0.35 * excessPulse) + ")", excessBorder, isExcessB ? 2.5 : 1.5);
        }
      }

      // 2. 繪製甲圖 (Blue, 從左往右滑動覆蓋)
      for (var a = 0; a < countA; a++) {
        var offA = getBlockOffset(a);
        var ax = curCenterXA + offA.x;
        var ay = centerY + offA.y;

        // 當完全重疊時，前 min(A, B) 個方塊由上方乙圖已處理成紫色，故滑動完成後只繪製甲多出來的部分
        var isOverlapNow = (a < countB && slideT >= 0.98);
        if (!isOverlapNow) {
          var isExcessA = (a >= countB && larger === "甲" && t > 0.65);
          var excessPulseA = isExcessA ? (0.6 + Math.sin(Date.now() * 0.008) * 0.4) : 1.0;
          var excessBorderA = isExcessA ? COLORS.yellow : COLORS.blue;
          var alphaA = slideT > 0.6 ? 0.7 : 0.85;

          drawRoundRect(ctx, ax - blockSize * 0.5, ay - blockSize * 0.5, blockSize, blockSize, 4, "rgba(88, 196, 221, " + (alphaA * excessPulseA) + ")", excessBorderA, isExcessA ? 2.5 : 1.5);
        }
      }

      // 標籤提示
      if (slideT < 0.3) {
        drawBadge(ctx, "甲圖: " + countA + " 塊", leftCenter, centerY + blockSize * 1.8, "rgba(88, 196, 221, 0.2)", COLORS.blue, 11);
        drawBadge(ctx, "乙圖: " + countB + " 塊", rightCenter, centerY + blockSize * 1.8, "rgba(255, 101, 132, 0.2)", COLORS.pink, 11);
      } else {
        var minOverlap = Math.min(countA, countB);
        drawBadge(ctx, "重疊 " + minOverlap + " 塊 (紫色)", rightCenter, centerY + blockSize * 1.8, "rgba(154, 114, 172, 0.3)", COLORS.purple, 11);
      }

      // 底部比較結果
      var formulaY = h - 14;
      var diffCount = Math.abs(countA - countB);
      var resultStr = "";
      if (larger === "一樣大") {
        resultStr = "甲圖 (" + countA + "塊) 與 乙圖 (" + countB + "塊) 完全疊合，面積一樣大！";
      } else {
        resultStr = "甲圖 (" + countA + "塊) vs 乙圖 (" + countB + "塊) ➔ " + larger + "圖較大 (多出 " + diffCount + " " + unit + ")";
      }
      drawBadge(ctx, resultStr, w * 0.5, formulaY, "rgba(154, 114, 172, 0.25)", (larger === "一樣大" ? COLORS.green : COLORS.yellow), 13, true);

      ctx.restore();
    }
  };

  // 🌟 自動初始化本機已載入之註冊表
  if (typeof window !== "undefined") {
    if (window.__VISUAL_MORPH_REGISTRY_G2__) {
      VisualMorphG2.initRegistry(window.__VISUAL_MORPH_REGISTRY_G2__);
    }

    // 瀏覽器點擊互動自動解鎖音訊上下文
    var unlockAudio = function () {
      if (VisualMorphG2.audioCtx && VisualMorphG2.audioCtx.state === "suspended") {
        VisualMorphG2.audioCtx.resume();
      }
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    window.VisualMorphG2 = VisualMorphG2;
  }
})(typeof window !== "undefined" ? window : this);

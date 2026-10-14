# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；換對話框／收工時**必更新**。本檔只放交接必需的精簡資訊。

## ⏯️ 目前做到哪

1. **小四數學（Grade 4 Math RPG）— 交接驗收完成（2026-10-13）**
   - Antigravity 端已完成：直式對位修復、手機單一聚焦模式、第七層直式加法助手、506 題巡檢守門員全綠。
   - OPENCODE 端**三大交替式驗證探針 3/3 全綠（Exit Code 0）**，簽核完成：
     - 探針 1 `python -X utf8 validate_grade4.py` → 全套守門員合格。
     - 探針 2 `400×37=14800` / `246×34=8364`，第 7 層逐位加法算式與進位地圖逐字相符。
     - 探針 3 `.step-card.done` / `.step-card.locked` 皆 `display:none !important`。
   - 獨立覆核：SHA256 自行重算雙檔一致、乘法交錯驗算補測 6 題全對、`vertical_math_explainer.js` 乘／括號／除三型別通過。
   - 簽核紀錄寫在 `小四數學/OPENCODE_TASK_GRADE4_MATH.md` 第六節（附加，未覆寫原文）。

2. **小四數學 現有可執行成果**
   - `小四數學/app/rpg_world_map.json`：23 王國／506 題課綱對齊題庫（108 課綱，零敘述性污染）。
   - `小四數學/app/index.html` ＝ `rpg_adventure.html`（Byte-for-Byte 同步，SHA256 `6378886F…9CCE4`）。
   - `小四數學/app/js/vertical_math_explainer.js`：三位數乘兩位數分層直式、括號兩步驟四則、長除法試商。
   - `小四數學/validate_grade4.py`：整合三套子守門員的總開關。

3. **綠野仙蹤影子跟讀教材管線跑通**
   - Ch.1（`woo_shadow_ch1.html` ＋ `woo_shadow_ch1.webm` 81 句）、Ch.2（`woo_shadow_ch2.html` ＋ `.webm` 134 句）已收編進 `learn.html`。
   - 流程：yt-dlp 取音 → Whisper Large-v3 word-level 錨定 → 本地 `qwen3:8b` 批次翻譯 → 人工嚴格覆核。
   - sw.js 已到 `kids-games-v39`。

4. **APP 主線現況**：`index.html`／`learn.html`／`toeic.html`／`sticky-gomoku-new.html` 純前端、無框架、無 build；sw.js 快取版本 `kids-games-v45`。

5. **小二數學（Grade 2 Math RPG）與三年級/四年級大廳整合（2026-10-14）**
   - **125B (Strata) 審查與生產全量上線**：
     - 審查 7 筆 OCR 殘缺題判定 REJECT，簽核 26 王國 572 題 seed bank 獲 PASS。
     - 執行 6 個任務流水線（耗時 465.37s，消耗 17,204 tokens，30.70 tokens/s），生成 26 王國生活題、直式微步階鷹架（`vertical_math_explainer_g2.js`）與切片重構。
   - **戰鬥介面全面升級**：升級為小三、小四同款精緻 RPG 沉浸式戰鬥系統（血條、怪獸頭像、4 顆魔法選項卡片、奧利博士軍師對話氣泡、26 王國地圖 Modal）。
   - **三合一數學大廳（Hub）**：`小三數學題庫/app/index.html` 正式收納 G2, G3, G4 卡片，並部署 `app/g2/`；`017_小朋友APP/index.html` 首頁新增直通入口。
   - **驗收全綠**：雙守門員（`validate_grade2.py`, `validate_grade2_provenance.py`）PASS，無頭 Edge CDP 4/4 全綠。

## 🚦 目前狀態

- 小四數學：靜態／無頭驗證全綠 ✅，**待手機實機走查**（點擊流程、音訊、觸控）。
- 語言學習主 APP（learn/toeic）：功能齊備，待真機體驗驗收。
- 圍棋：5 段 AI（萌芽／初級／中級／大師／宗師）＋防誤按＋雙人對弈＋讓子，可玩。
- 綠野仙蹤：Ch.3~24 共 22 集待製作（流程已跑通，批次產出即可）。

## ➡️ 下一步（建議順序）

1. **國小數學 G1、G5、G6 全量生產與六合一大廳建置**（依 `PLAN-ALL-GRADES-MATH-125B-35B.md`）：
   - 啟動 35B 題幹生活化潤色 + 125B 課綱守門與微步階直式引擎生成。
   - 小一（初生森林 20 王國）、小五（蒼穹天域 22 王國）、小六（幻滅王座 20 王國）全量建置。
   - 更新年級大廳為 6 卡並列，雙向導航打通。
2. **手機實機走查 小二、小三、小四數學大冒險**：開各年級冒險確認手機直式對位、單一聚焦、作答與下一題動畫反饋。
3. **綠野仙蹤 Ch.3~24 批次製作**（23 集，流程已全通，注意時軸人工覆核）。
4. `PLAN-MOBILE-FIX.md` Sprint 2~5（手機體驗、音訊 PWA、效能資料、收尾測試）。
5. 單字星球（`toeic.html`）優化：PDF 題庫擴充、閃卡 3D 左右翻、主題 Pills 橫向滾動。

## ⚠️ 注意事項

- **本機未配置 Obsidian MCP**，L3 筆記未同步，待有工具的環境補齊。
- 本次驗證是靜態／無頭，**未做真機觸控與 AudioContext 實測**——別當成已手機驗收。
- 🔺 未納入版控：`小三數學題庫/`、`小三自然/` 兩個資料夾（與本專案驗收無關，另案處理）。
- 修 `learn.html` 務必保留 ShadowingStudio 生命週期與各 Step UI 獨立分流。
- 新 APP（小三英文 `kids-english.html`）待產出：全新獨立檔案、**不要沿用 `toeic.html` 深色太空主題**、手機優先大按鈕、單字庫共用 `data/kids.json`（684 字）。
- 平板斷點慣例：`@media (min-width: 900~960px) and (orientation: landscape)`。
- PowerShell 主控台是 cp950：`Get-Content` 讀 UTF-8 檔會亂碼，請加 `-Encoding UTF8`（AGENTS.md 全域規則第 6 條）。
- 綠野仙蹤素材來源：`youtube.com/playlist?list=PLgQjk-xm2AGXx0mwnIuQiDocH9wssCTeU`。



## 🕐 最後更新

- 時間：2026-10-14
- 更新者：Antigravity
- 內容：小二數學 125B 審查與全量生產、精緻 RPG 戰鬥介面升級、三合一數學年級大廳整合與 Edge CDP 端到端驗證通過。
- Git push：✅ 已推（`math3-bank` 與 `017_小朋友APP` 同步推向 `origin/main`）


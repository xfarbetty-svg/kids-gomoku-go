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

## 🚦 目前狀態

- 小四數學：靜態／無頭驗證全綠 ✅，**待手機實機走查**（點擊流程、音訊、觸控）。
- 語言學習主 APP（learn/toeic）：功能齊備，待真機體驗驗收。
- 圍棋：5 段 AI（萌芽／初級／中級／大師／宗師）＋防誤按＋雙人對弈＋讓子，可玩。
- 綠野仙蹤：Ch.3~24 共 22 集待製作（流程已跑通，批次產出即可）。

## ➡️ 下一步（建議順序）

1. **手機實機走查 小四數學 APP**（本次唯一未驗證的缺口）：開 `小四數學/app/index.html`，實跑萬位加法、三位數乘兩位數（含 400×37 對位）、括號四則、長除法，確認一屏作答與逐格彈跳。
2. **綠野仙蹤 Ch.3~24 批次製作**（23 集，流程已全通，注意時軸人工覆核）。
3. `PLAN-MOBILE-FIX.md` Sprint 2~5（手機體驗、音訊 PWA、效能資料、收尾測試）。
4. 單字星球（`toeic.html`）優化：PDF 題庫擴充、閃卡 3D 左右翻、主題 Pills 橫向滾動。
5. 綠野仙蹤 YT 精選 5 支全數 embed 受限（錯誤 153），需在**使用者自己網路**用 yt-dlp 抽原音後於 preset 加 `audioFile`。

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

- 時間：2026-10-13
- 更新者：space-bunny-free（OPENCODE） @ DESKTOP-6ELKIRH
- 內容：小四數學交接驗收簽核完成（3/3 探針全綠 ＋ 獨立覆核）；`handoff.md` 整份重寫，修正重複段落、編號錯亂與 sw.js 版本不一致（v38/v43 → v45）。
- Git push：⏳ 待推（本次收工 commit）

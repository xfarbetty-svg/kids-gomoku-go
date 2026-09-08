# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；換對話框／收工時**必更新**。本檔只放交接必需的精簡資訊。

## ⏯️ 目前做到哪
完成 **影音精聽室 → 影子跟讀 橋接規劃**（`PLAN-YT-SHADOW-BRIDGE.md`），規劃文件已寫好，待交給 ANTIGRAVITY 實作。

## 🚦 目前狀態
- 專案：星光獵魔團（K-pop 少女獵人主題），純前端 HTML/CSS/JS，無框架、無 build 步驟
- 主要應用：
  - `index.html`：四關魔王討伐卡片 + 雙語探險學院入口
  - `learn.html`：雙語探險學院（單字庫、YouTube 精聽室、打怪/閃卡、情境對話、影子跟讀訓練室 V2）
  - `sticky-gomoku-new.html`：黏黏圍棋（Gooey 果凍融合、4 段 AI 棋力）
  - `toeic.html`：星光單字星球（兒童美語 684 字 + 多益 11238 字）
- 快取與離線：`sw.js` 為 `kids-games-v25`
- 接力狀態機：`TASK-007` 處於 `CODE_DONE`；規劃檔 `PLAN-YT-SHADOW-BRIDGE.md` 待實作

## ➡️ 下一步
1. **ANTIGRAVITY 實作橋接功能**：依 `PLAN-YT-SHADOW-BRIDGE.md` 四個 Task 開發
   - Task 1：統一句子資料格式
   - Task 2：精聽室持久化 + 「送到影子跟讀」按鈕
   - Task 3：影子跟讀載入用戶 YouTube 影片 + 逐句播放
   - Task 4：進度追蹤
2. **OpenCode 覆核**：實作完成後審核 UI 美學與互動流暢度
3. **TASK-008 內容包實作**：預載 VOA Learning English + BBC 6 Minute English 逐字稿素材包
4. **實測魔王系統**：手機端實測各關卡解鎖與討伐流程

## ⚠️ 注意事項
- 純前端，修改完直接重新整理即可測試，無需 build
- YouTube iframe API 限制：頁面只能有一個 player，橋接需處理精聽室/影子跟讀切換時的 player destroy/recreate
- 真人音檔（日文老師 m4a）整合是獨立任務，不影響本次橋接
- 修改 `learn.html` 時務必注意保留 ShadowingStudio 暴露之 4 大生命週期 API（`onModeChange`, `setShadowingLang`, `onTabOpen`, `stopAllAudio`）

## 🔧 進行中：真人語音切換與真人音檔載入

### 已完成並 commit
- `d01c1d8`：**語音切換選擇器**（🗣️ 下拉）+ warashibe 51 段 mp3 真人音檔
- `cc6dd15`：**星光單字星球** `toeic.html`（兒童美語 684 字 + 多益 11238 字）

### 真人音檔下載進度（尚未 commit）
- 目標：日文老師 `https://www.youtube.com/watch?v=rLwowh9SBa4`（《稻草富翁》）
- ✅ 已下載日文原音：`C:\Users\PXP\AppData\Local\Temp\opencode\jp_teacher_ja.m4a`（10.28MB）
- ⚠️ `jp_teacher.webm` 是誤抓的英文配音，可刪除
- ✅ 影片有日文自動字幕（ja CC，SRT 可用）
- ✅ 工具鏈已就緒：yt-dlp + deno + ffmpeg
- **下一步**：下載 SRT → ffmpeg 切分 → 對齊 SHADOWING_DATA → 整合進 ShadowingStudio

## 🕐 最後更新
- 時間：2026-09-09
- 更新者：opencode @ DESKTOP-6ELKIRH
- 內容：完成影音精聽室→影子跟讀橋接規劃文件，待 ANTIGRAVITY 實作
- Git push：✅ 已推送到 origin/main

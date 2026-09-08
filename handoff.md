# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；換對話框／收工時**必更新**。本檔只放交接必需的精簡資訊。

## ⏯️ 目前做到哪
已依照 `RELAY_TASK_007_DIRECTIVE.md` 與 `OPENCODE_TASK_SHADOWING_V2.md` 完整實作完成 **TASK-007 Shadowing V2 六大核心功能**，並寫入 `learn.html`：
1. **Task 1: 四階段獨立 UI 行為**：`applyStepUI()` 實作完成，Step 1 純聽（隱藏文字留聲波）、Step 2 精讀（強制顯示中文）、Step 3 視讀（聽寫與跟讀）、Step 4 脫稿影子（半透明 0.2/眼鈕切換透明度），均具備專屬情境橫幅。
2. **Task 2: 可調靜音間隔**：新增 `#shadowSilenceSelect` 下拉選單（3/5/7 秒），`startAutoFlowCountdown()` 支援動態留白倒數。
3. **Task 3: 聽寫模式（Dictation Mode）**：新增 `#shadowDictateBtn`（Step 3 & 4 顯示），點擊播放原音後隱藏文字跳出輸入框，支援 Enter 送出比對評分。
4. **Task 4: 寬容評分機制**：新增 `metaphoneMatch()` 比對母音/子音骨架模糊分，與 `levenshtein()` 雙軌取最高分。
5. **Task 5: Tap-to-Lookup 查字**：`renderClickableWords()` 拆解單字，點擊跳出 `#shadowWordPopup` 支援「🔊 發音」與「📝 加入生字本」。
6. **Task 6: 學習進度持久化**：`saveProgress()` / `loadProgress()` 透過 `localStorage` 保存，故事下拉選單顯示每篇進度 `(completed/total)`。
7. **測試驗收**：`node VERIFY_RELAY.js` 24/24 項全數通過（0 失敗），行數 6340 行。`RELAY_STATUS.json` 已轉為 `CODE_DONE`，turn 移交 `OpenCode覆核`。

## 🚦 目前狀態
- 專案：星光獵魔團（K-pop 少女獵人主題），純前端 HTML/CSS/JS，無框架、無 build 步驟
- 主要應用：
  - `index.html`：四關魔王討伐卡片 + 雙語探險學院入口
  - `learn.html`：雙語探險學院（單字庫、YouTube 精聽室、打怪/閃卡、情境對話、影子跟讀訓練室 V2）
  - `sticky-gomoku-new.html`：黏黏圍棋（Gooey 果凍融合、4 段 AI 棋力）
- 快取與離線：`sw.js` 為 `kids-games-v25`，包含 `learn.html` 與相關靜態資源
- 本地測試伺服器：背景常駐於 `http://localhost:3000/learn.html`
- 接力狀態機：`TASK-007` 處於 `CODE_DONE`，等待 OpenCode 終審與驗收；佇列下一項為 `TASK-008`（內容包預載）。

## ➡️ 下一步
1. **OpenCode 覆核 TASK-007**：檢查 Git Diff、UI 美學與互動流暢度，確認通過後更新 `RELAY_STATUS.json` 為 `REVIEWED_PASSED` 並推進至 `TASK-008`。
2. **TASK-008 內容包實作**：預載 VOA Learning English + BBC 6 Minute English 逐字稿素材包。
3. **實測魔王系統**：手機端實測各關卡解鎖與討伐流程。
4. **魔王討伐動畫／音效**：補齊討伐獲勝的視覺動畫與音效反饋。

## ⚠️ 注意事項
- 純前端，修改完直接重新整理即可測試，無需 build
- 手機測試建議以 PWA 方式安裝或在 localhost / HTTPS 環境下測試（以確保 Web Speech 與 MediaRecorder 權限正常）
- 修改 `learn.html` 時務必注意保留 ShadowingStudio 暴露之 4 大生命週期 API（`onModeChange`, `setShadowingLang`, `onTabOpen`, `stopAllAudio`）

## 🕐 最後更新
- 時間：2026-09-09 00:15
- 更新者：antigravity @ DESKTOP-6ELKIRH
- 內容：完成 TASK-007 Shadowing V2 六大功能實作、測試通過 (24/24)、更新藍圖與交接檔
- Git push：✅ 已推送到 origin/main

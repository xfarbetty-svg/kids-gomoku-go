# 017_小朋友APP - 專案藍圖

## 📋 路線圖檢查清單

- [x] 魔王討伐系統：四關遊戲（節奏打怪→封印記憶→獵魔拼圖→獵魔五子棋）各有魔王 HP，通關自動解鎖下一關，首關預設解鎖
- [x] 升級黏黏圍棋（sticky-gomoku-new.html）：
  - 🧲 真實 SVG Gooey Metaball 果凍融合成型（同色相鄰自動流動黏合為大果凍）
  - 🧠 4 段 AI 棋力切換（🐣 初級／🌸 中級／👑 大師／🔥 宗師）：
    - 🐣 初級：60% 隨機探索，40% 基礎提子防守
    - 🌸 中級：提子得分、避開 1 氣送死叫吃、瀕死 1 氣逃跑檢驗、友軍連通與中央趨近
    - 👑 大師：提吃高權重 (+380)、瀕死精算逃脫路徑 (+400)、叫吃威脅 (+220)、真眼判定防自填 (-600)、開局搶佔星位與角邊 (+45)、避開 1 路死亡線 (-80)
    - 🔥 宗師：Phase 1 啟發式評分（嚴禁填己方真眼 -2500、提子 +650、瀕死對殺救援 +600、做兩眼做活 +500、金角銀邊佔大場 +150、切斷敵方 +220、官子淨目數增益計算）+ Phase 2 2-Ply Minimax 深度前瞻反擊檢驗（評估玩家反擊最大威脅並扣除 0.95 倍風險）
  - 🎓 AI 星光教練智慧解說系統（救命逃氣、封氣提子、果凍合體、擴大領地推薦與標記）
  - 📐 7x7 / 9x9 / 13x13 / 19x19 四規格與精準星位配置、雙向動態縮放 fitScale
  - 📱 手機版面極致緊湊化、Sticky 吸底控制列與 Pass 放棄下一手雙入口常駐可見
  - 萌系眨眼與 1 氣瀕死顫抖表情、禁自殺反彈、彩色地盤高亮、提子粒子大爆破與 Web Audio 果凍音效庫
- [x] 雙語探險學院（learn.html）：
  - 🧒 小朋友冒險模式 vs 🧑 大人高效模式一鍵切換，本地持久保存
  - 📚 英日分級單字庫（英文 A1-C2、日文 五十音/N5-N1，支援 Web Speech 真人口音與自訂生字本）
  - 📺 YouTube 雙語影音精聽室（自訂/精選短片、時間軸精準同步、單句 A-B Loop 循環、遮蔽盲聽、生字劃詞收藏）
  - 🎮 趣味互動打怪與 SRS 記憶閃卡（小朋友打擊魔王 HP、大人 FSRS 間隔翻卡與聽力默寫）
  - 💬 情境實境對話（12 組日常情境劇本、Web Speech 麥克風即時語音辨識判定、星級評分、聽示範與安靜送出模式）
  - 🎙️ 影子跟讀訓練室（Shadowing Studio）：4 階段階梯跟讀訓練法（純聽磨耳朵、理解精讀、視讀跟讀、脫稿影子+錄音AB對照）、大人/小孩英日語精選故事庫、動態聲波、Levenshtein 語音評分與星星連動
  - 🚀 Shadowing V2（TASK-007）：四階段獨立 UI 行為（applyStepUI）、可調靜音間隔（3/5/7 秒）、聽寫模式（Dictation Mode）、寬容評分（Metaphone 模糊匹配 + Levenshtein 取高）、Tap-to-Lookup 單字即時查詢卡片、學習進度持久化（localStorage）
- [ ] 實測魔王系統：手機跑一遍，確認鎖定／解鎖／討伐流程
- [ ] 魔王討伐動畫／音效（目前只有文字狀態顯示）

## 📁 資料夾結構

**魔王系統（commit ad87661）：**
- `common.js`：魔王系統核心（STAGES、defeated／unlocked、isUnlocked()／isBossDefeated()、KidsApp.addStars()、通關自動解鎖）
- `index.html`：首頁卡片顯示魔王資訊、新增「雙語探險學院」卡片
- `rhythm.html`／`memory.html`／`puzzle.html`／`gomoku.html`：各關魔王血量與討伐邏輯
- `sw.js`：版本更新（v25，快取 learn.html 與全套影子跟讀教材庫）
- `openspec/`：OpenSpec 規格驅動開發（SDD）提案 `enrich-language-learning`（proposal／design／tasks／specs）

**雙語學院與圍棋：**
- `learn.html`：大人/小孩雙模式語言學習 APP（字庫、YT影音精聽、打怪/閃卡、情境實境對話、影子跟讀訓練室 V2）
- `sticky-gomoku-new.html`：Gooey 果凍融合、4 段 AI 棋力（🐣 初級／🌸 中級／👑 大師／🔥 宗師）、AI 教練解說、7x7/9x9/13x13/19x19 規格、圍地彩色高亮、Pass 雙入口與 Sticky 吸底控制列

## ⚠️ 待完成事項

- [ ] 實測魔王系統（手機測試）
- [ ] 魔王討伐動畫／音效
- [ ] 影子跟讀**真人音檔載入**（日文老師《稻草富翁》已下載 m4a，待逐句切分整合取代 TTS 音源）
  - 音檔暫存：`C:\Users\PXP\AppData\Local\Temp\opencode\jp_teacher_ja.m4a`（10.28MB，日文原音）
  - 工具：yt-dlp 2026.08.19 + deno 2.9.6 + ffmpeg 9.0.1 已就緒；影片含日文字幕(SRT)可供逐句對齊
- [ ] 語音資源補充：詳見 `handoff.md`「進行中」區塊

## 🕐 最後更新

- **日期**：2026-09-09
- **更新者**：opencode @ DESKTOP-6ELKIRH
- **內容**：完成**語音切換選擇器**（🗣️）並 commit（`ca0cc1e`）；下載日文老師真人音檔待切分。
  - `SpeechSys` 新增 `getVoicesByLang`/`setPreferredVoice`/`resolveVoice`
  - ShadowingStudio 新增 `populateVoiceSelect()`/`applyVoiceSelect()`，依語言列語音、localStorage 持久化，`speakSentence()` 優先套用選定語音
  - 下載日文《稻草富翁》真人音檔（m4a 日文原音），待逐句切分整合
- **Git 狀態**：待本次 commit + push

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
- [ ] 綠野仙蹤教材（The Wizard of Oz）：
- [x] 第 1 章《The Cyclone》純聽力試用版（`woo_trial_audio.html`，49 句英中字幕，本地音訊）
- [x] 第 1 章影子跟讀版（`woo_shadow_ch1.html`，Read Me A Classic 朗讀 + Whisper 字幕 + Gutenberg 原文校正 + 中翻）
- [ ] 確認影子跟讀版品質 → 正式加入 `learn.html` 的 PRESET_VIDEOS
- [ ] 其餘 23 集（Chapter 2-24）依相同流程製作（YouTube playlist PLgQjk-xm2AGXx0mwnIuQiDocH9wssCTeU）
- ⛔ Deep Work Session 頻道（lwAG7bBg4n8）不適合做影子跟讀（節奏斷裂、文本解析感）
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

**星光單字星球（本次新增）：**
- `toeic.html`：獨立萬字單字卡 APP（兒童美語 GEPT Kids 684 字 + 多益 TOEIC 11238 字）
  - 📚 雙庫切換：🧸 兒童美語 33 主題分類 ／ 💼 多益 15 分類・5 星級
  - 🎴 SM-2 間隔重複閃卡（真正 SRS 演算法、4 級評分、動態復習排程）
  - 📝 測驗模式（英→中 / 中→英 / 拼寫，10/20/30 題）
  - 🗣️ Web Speech 真人發音＋語音選擇器
  - 📊 進度追蹤（localStorage 持久化）
  - 📂 資料檔：`data/toeic.json`（9MB，11238 字）、`data/kids.json`（62KB，684 字）
  - ℹ️ `sw.js` v29 快取，`index.html` 已含入口卡片

## ⚠️ 待完成事項

- [x] **影音精聽室 ➔ 影子跟讀 橋接實作**（依 `PLAN-YT-SHADOW-BRIDGE.md` 四階段任務開發）
  - Task 1：統一句子資料格式（source: 'youtube', start/end 時間戳與原文翻譯橋接）
  - Task 2：精聽室持久化 + 「📤 送到影子跟讀」按鈕 + 簡易字幕匯入與編輯器
  - Task 3：影子跟讀載入用戶 YouTube 影片 + 小型專用播放器與逐句原音精準播放
  - Task 4：進度追蹤（localStorage shadow_progress_${lang}_${storyId} 持久化）
- [x] **日文老師《稻草富翁》真人音檔切分整合**（51 段獨立句檔已全數整合進 ShadowingStudio 真人原聲播放庫，覆蓋 kids 與 adult 雙模式）
- [ ] **單字星球（toeic.html）體驗優化備忘**：
  - [ ] 兒童美語題庫擴充：解析整合資料夾內 3 份 PDF（`國小英文單字.pdf`、`國小英文單字 （2）.pdf`、`GEPTKid_wordlist01.pdf`），參考 https://teachers.dale.nthu.edu.tw/?page_id=921
  - [ ] 閃卡翻面動效修正：需改為「左右翻轉（3D rotateY）」，修復目前無法左右翻問題
  - [ ] 單字庫主題 Pills 顯示修復：修復主題篩選列被截斷、無法橫向滾動選取完整主題（兒童美語與多益）
- [ ] **TASK-008 內容包實作**：預載 VOA Learning English + BBC 6 Minute English 逐字稿素材包
- [ ] **實測魔王系統**：手機端實測各關卡解鎖與討伐流程
- [x] **手機端部署全面審計與執行計畫（2026-09-09）**：
  - 🔍 徹底檢查 learn.html、toeic.html、index.html、common.js/css、sw.js，共發現 **87 個問題**（🔴 致命 12 / 🟡 中等 32 / 🟢 低 43）
  - 📋 產出完整執行計畫 `PLAN-MOBILE-FIX.md`：分 5 個 Sprint（止血→手機體驗→音訊 PWA→效能資料→收尾測試）
  - 🚨 致命問題包括：麥克風 stream 未釋放、YT API 無限重試、閃卡 3D flip 閃爍、評分按鈕按不到、SW 安裝單檔 404 拖垮整體
  - ⏳ 狀態：審計完成、計畫產出，待依 Sprint 1 開始逐項修正
- [x] **全面行動端（Mobile First）版面重構與手機音訊解鎖（v33）**：
  - 📱 Header 頂部導航重構：實心背景防穿透、手機端隱藏副標題、膠囊模式按鈕固定高度防拉伸、z-index 1000 常駐置頂。
  - 🚀 導航 Tabs 橫向平滑滑動列：`flex: 0 0 auto !important; white-space: nowrap !important;` 徹底消除單字直排擠壓災難。
  - 📖 影子跟讀故事列雙行化：下拉選單 100% 滿版，老師聲音與語速切換排入第二行。
  - 🎯 步驟切換 4 格等寬網格：等分寬度、防溢出。
  - 🧭 影子跟讀導航列雙層架構：進度置中帶小進度條，上一句/秒數/連續/下一句排成寬敞底列，告別文字折行與按鈕擠壓。
  - 🎙️ 核心卡片字級響應（`clamp`）與 72x72px 超大錄音麥克風按鈕（大拇指盲按優化，圖示隨錄音狀態切換 🎙️ / ⏹️）。
  - 🔊 手機音訊喚醒（Mobile Audio Unlock）：全域監聽初次互動喚醒 Web Audio `AudioContext` 與 `SpeechSynthesis`，外加播放外框動效。
  - 🔄 PWA Service Worker 自動更新偵測與快取版本推進至 `kids-games-v33`。
- [ ] **魔王討伐動畫／音效**
- [x] **徹底解決手機音訊無聲問題（v34）**：
  - 🚫 移除 `unlockMobileAudio()` 中的空字串 `speak('')`，解除 Android Chrome Web Speech 佇列死結。
  - 🌾 kids 模式日文故事全面掛載 51 句真人音檔版《稻草富翁》（`s01.mp3` ~ `s51.mp3`），100% 透過 `<audio>` 真人原聲播放，不走本地 TTS。
  - 🛡️ 實作 TTS 雲端音訊 Fallback（Google Translate TTS + 有道辭典音訊），外加 1.5 秒超時自動降級與 `onerror` 容錯，徹底告別手機無聲。
  - 🔄 PWA 快取升級至 `kids-games-v34`。
- [x] **平板橫向（landscape）版面最佳化**（commit a9a1889）：
  - 全 APP 加入 `@media (min-width: 900~960px) and (orientation: landscape)` 平板斷點（涵蓋 iPad 1024px 橫向）。
  - 🏠 index.html：卡片網格 780→1180px 用滿寬度。
  - 🎙️ learn.html：影子跟讀 ≥960px 橫向改雙欄（380px 選單/步驟/全文稿 ＋ 訓練舞台 1fr）。
  - 🌠 toeic.html：容器加寬至 1180px，閃卡/測驗/彈窗 520→720px，字卡 280px。
  - 💧 sticky-gomoku-new.html：解除 480px 上限＋橫向雙欄（左棋盤/右比分技能），棋盤放大上限 1.6x（`fitScale` 依 isWide 分流）。
  - 🎵 節奏/記憶/拼圖/五子棋：舞台/牌面加寬至 640~720px，五子棋棋盤 1.5x。
  - ♿ 全部移除 `user-scalable=no`（WCAG 縮放合規）。

- [x] **升級影子跟讀第 5 步驟「回音法」（Echo Method）與 BBT 素材**（commit 888ef19）：
  - 🔊 5 步驟 Tab 切換：新增 `[🔊 回音]` 按鈕，CSS `.step-tabs` 響應式 `repeat(5, 1fr)` 排版。
  - 🙈 盲聽複述 UI 狀態：`applyStepUI()` Step 5 隱藏原文、翻譯、提示與徽章，保持錄音按鈕常駐。
  - ⏱️ `playEchoSentence()` 延遲重播機制：播放一句原音 → 暫停 5 秒倒數「換你說！」→ 自動重播原音對照 → 銜接下一句。
  - 🔄 `speakSentence()` 智慧路由：YouTube 來源在 Step 5 自動導向回音法流程。
  - 🔬 BBT 經典素材：新增《The Big Bang Theory》Sheldon 考駕照原聲片段與 13 句中英對照字幕。

## 🕐 最後更新

- **日期**：2026-09-11
- **更新者**：antigravity @ DESKTOP-6ELKIRH
- **內容**：影子跟讀第 5 步驟「回音法」（Echo Method）+ BBT 經典考駕照片段整合（commit 888ef19）
- **Git 狀態**：已提交並推送到 origin/main（888ef19）


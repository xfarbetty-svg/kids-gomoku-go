# 017_小朋友APP - 專案藍圖

## 📋 路線圖檢查清單

- [x] 魔王討伐系統：四關遊戲（節奏打怪→封印記憶→獵魔拼圖→獵魔五子棋）各有魔王 HP，通關自動解鎖下一關，首關預設解鎖
- [x] 升級黏黏圍棋（sticky-gomoku-new.html）：
  - 🧲 真實 SVG Gooey Metaball 果凍融合成型（同色相鄰自動流動黏合為大果凍）
  - 🧠 5 段 AI 棋力切換（🌱 萌芽／🐣 初級／🌸 中級／👑 大師／🔥 宗師）：
    - 🌱 萌芽：慈悲放水模式（嚴禁提吃 -9999、40% 破綻留氣引導提子、散步避戰不切斷）
    - 🐣 初級：60% 隨機探索，40% 基礎提子防守
    - 🌸 中級：提子得分、避開 1 氣送死叫吃、瀕死 1 氣逃跑檢驗、友軍連通與中央趨近
    - 👑 大師：提吃高權重 (+380)、瀕死精算逃脫路徑 (+400)、叫吃威脅 (+220)、真眼判定防自填 (-600)、開局搶佔星位與角邊 (+45)、避開 1 路死亡線 (-80)
    - 🔥 宗師：Phase 1 啟發式評分（嚴禁填己方真眼 -2500、提子 +650、瀕死救援 +600、做兩眼真眼關鍵眼位 +550、破除敵方眼位 +380、征子模擬連續追吃4~6步 +850、切斷弱棋 +420、金角銀邊佔大場 +150、官子淨目數增益）+ Phase 2 2-Ply Minimax 深度前瞻反擊檢驗
  - 🍬 讓子局開局機制（分先 / 讓2子 / 讓4子 / 讓9子），黑棋標準星位預置，白棋魔王先攻
  - 🎓 AI 星光教練智慧解說系統（救命逃氣、封氣提子、果凍合體、擴大領地推薦與 1 氣瀕死強警報）
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
- [x] 綠野仙蹤教材（The Wizard of Oz）：
  - [x] 第 1 章《The Cyclone》影子跟讀版與故事庫全面修復（`woo_shadow_ch1.html` / `learn.html` 修正 350s~465s 錯位，81 句）
  - [x] 第 2 章《The Council with the Munchkins》製作並收編（`woo_shadow_ch2.html` / `woo_shadow_ch2.webm` / `WOO_CH2_STORY` 134 句，本地 Qwen3:8b 批次翻譯 + Whisper Word-level 精準錨定，sw.js v39）
  - [ ] 其餘 22 集（Chapter 3-24）依相同流程製作（YouTube playlist PLgQjk-xm2AGXx0mwnIuQiDocH9wssCTeU）
- ⛔ Deep Work Session 頻道（lwAG7bBg4n8）不適合做影子跟讀（節奏斷裂、文本解析感）
- [x] **國小四年級數學大冒險（小四數學）核心建置完成**：
  - 📚 台灣 108 課綱標準對齊（`CURRICULUM_GRADE4.md`）：涵蓋一億以內大數 (N-4-1)、三位數乘除直式 (N-4-2)、四捨五入概數 (N-4-4)、同分母分數 (N-4-5)、二位小數百分位 (N-4-7)、兩步驟四則運算逐次減項 (R-4-1) 等 23 大主題。
  - 🗺️ 23 王國 506 題冒險題庫全量生成（`app/rpg_world_map.json`）：每王國 22 題、含 4 隻魔王（第 5, 10, 15, 20 題手寫考核），零敘述性污染。
  - 📐 直式運算引擎小四升級（`app/js/vertical_math_explainer.js`）：支援三位數乘兩位數雙層部分積直式、兩步驟四則運算括號最優先法則與長除法試商循環。
  - 🛡️ 守門員全面驗收全綠（`validate_grade4.py` exit code 0）。
  - 📋 產出交接驗證任務書給 OPENCODE（`OPENCODE_TASK_GRADE4_MATH.md`）。
  - 🎨 **小四 3B1B 動態幾何與抽象量感透視系統建置**：
    - 規格藍圖定稿（`PLAN_GRADE4_3B1B_VISUALS.md`）：全 23 王國 506 題 3B1B 視覺模型對應矩陣。
    - 核心引擎 Phase 1 原型落地（`app/js/visual_morph_engine_g4.js`）：支援量角器雙向吸附、Isometric 3D 等角積木 X-Ray 透視、Area Model 矩陣乘法色塊展開、Exploding Dots 爆裂點十進位、雙峰重力滾球數線。
    - 互動展示台（`app/prototype_g4_3b1b.html`）與守門員（`tests/verify_g4_3b1b_engine.js` 31/31 通過，exit code 0）。
- [x] **國小二年級數學大冒險（小二數學）與三合一數學大廳完成**：
  - 🧠 125B (Strata) 審查簽核 26 王國 572 題 seed bank 合規 PASS（`source/AUDIT_REPORT_125B.md`）。
  - 🚀 125B 全量生產管線完成（任務1情境題庫 + 任務2直式微步階鷹架 `vertical_math_explainer_g2.js` + 任務3切片重構）。
  - 🏰 國小數學勇者大冒險大廳（Hub）完成：小二、小三、小四三合一集中展示，雙向導航完全打通。
  - 🎮 戰鬥介面全面升級：小三、小四同款精緻 RPG 沉浸式戰鬥系統與 26 王國地圖 Modal。
  - 🎨 **小二 3B1B 動態幾何與具象量感透視系統落地（8 王國 176 題）**：
    - 覆蓋乘法陣列聚合、九九乘法流光、乘法交換律 90° 旋轉、分裝平分拋物線飛入、Base-10 積木滿十進位融合成棒、借位拆解崩解、直尺公分拱橋跳步、圖形疊合比較（`app/js/visual_morph_engine_g2.js`）。
    - 離線資料包裝（`app/data/visual_morph_registry_g2.json` / `app/js/visual_morph_registry_g2_data.js`）。
    - 守門員（`verify_g2_visuals.py`、`_scratch/verify_3b1b_g2_cdp.js`）100% 全綠 PASS。
  - 🛡️ 雙守門員（`validate_grade2.py`, `validate_grade2_provenance.py`）與無頭 Edge CDP 驗收全綠。
- [ ] **國小數學 G1、G5、G6 全量生產與六合一大廳建置**（依 `PLAN-ALL-GRADES-MATH-125B-35B.md`）：
  - [ ] **Grade 1 小一（初生森林）**：20 王國 / 440 題（35B 題幹生活化潤色 + 125B 10以內分合/錢幣/整半點鐘面題庫與守門員）
  - [ ] **Grade 5 小五（蒼穹天域）**：22 王國 / 484 題（125B 異分母分數加減/乘法/體積容積微步階引擎與守門員）
  - [ ] **Grade 6 小六（幻滅王座）**：20 王國 / 440 題（125B 質因數/公因倍數/分數小數除法/圓面積/速率/等量公理與守門員）
  - [ ] **Math RPG Hub 六卡大廳升級**：年級大廳整合 G1~G6 六卡雙向導航
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
- [x] **影音精聽室 YouTube 修復＋影子跟讀自動同步（v37）**：
  - 🎬 YT 播放器 lazy 建立：`playerBuilt` flag＋`ensureReady()`，第一次開啟精聽室才 new YT.Player（修黑畫面無法播放）。
  - 📖 影子跟讀「📖 全文對照」檢視器：逐句雙語＋時間戳＋🎯 跳句回訓練、隱藏中文切換。
  - 🔗 精聽室精選自動同步：`getPresetStories()` 把 PRESET_VIDEOS 依 mode+lang 自動列入影子跟讀故事選單（手動「送」按鈕只給自訂影片）。
  - 🌪️ 綠野仙蹤 Ch.1 收編故事庫：`WOO_CH1_STORY`（source `localaudio`）、`playLocalAudioSegment()` 逐句切播 `woo_shadow_ch1.webm`。
  - 🔄 PWA 快取升級至 `kids-games-v37`（含 `woo_shadow_ch1.webm`）。
- [x] **驗收 Bug 修復＋全文閱讀器（commit f8ac473）**：
  - 🔴 全文對照無法開啟：`openFullTextView()` 誤用 `$('#fullTextViewModal')`（`$`=getElementById）→ null 拋錯；改 `$('fullTextViewModal')`。
  - 🔴 WOO 連播斷裂：`stopLocalAudioSegment()` 設 `src=''` 觸發舊元素非同步 `error` → 舊 `onerror` 回退把新元素清掉（無限 rebuild、第二句之後全啞）。改為解綁 handler＋`removeAttribute('src')+load()`；localaudio 的 `onerror` 不觸發 TTS 回退。
  - 🔴 語速無效：`audio.playbackRate=currentSpeed` 寫在 `load()` 之前，Chrome 的 `load()` 會重設回 1.0；移到 `begin()` 播放前再設，並對播放中音訊即時套用。
  - 🟢 `common.js:156` `document.body.appendChild(sp)` 加 null 防護（`<head>` 載入時 sparkles 全消失＋console error）。
  - 📖 全文對照升級「閱讀器」：`openFullTextViewEx(title, rows, onJump)` 共用（故事＋影片字幕）、整排可點跳句、字級放大 hover 高亮；精聽室新增「📖 全文閱讀」按鈕。
  - ✅ 無頭 Chrome e2e 10/10（`C:\Users\PXP\AppData\Local\Temp\opencode\end_to_end.js`；YT.Player 會把 `#player` 換成同 id iframe）。
- [x] **閱讀器分頁＋YT 錯誤 153 降級（v38，commit 待 push）**：
  - 🗑️ 移除影子跟讀列「📖 全文對照」按鈕（改由獨立閱讀分頁承擔全文閱讀）。
  - 📖 新增「📖 閱讀器」導航分頁（`FULL_TEXT_READER`）：純文字全文閱讀互動，不錄音／不跟讀／不播影片。
    - 語系切換（🇬🇧／🇯🇵）、文章下拉（`ShadowingStudio.getAllStories(lang, mode)` 共用目錄：內建影子故事＋影音精聽室（YT）自動同步＋綠野仙蹤＋用戶影片）。
    - 逐句卡片（編號＋時間戳＋原文＋音標＋中文）、🙈 隱藏中文、A+／A− 字級（13–24px、localStorage 持久化、上次文章記憶）。
  - ⚠️ YT 錯誤 153／150（影片禁止嵌入）處理：
    - 精聽室：`onError` → `ytEmbedNotice` 醒目提示（附使用建議），切換影片時自動清除。
    - 影子跟讀：`youtubeEmbedBlocked` 旗標＋onError 偵測；句子播放遇 153 自動改由雲端 TTS（Google/有道）朗讀該句，不再死等無聲播放、不再無限重試。
    - 🔍 實測：PRESET_VIDEOS 全部 5 支皆為 embed-restricted（153，非 code bug）；沙箱無法以 yt-dlp 下載（連測試片都失敗，IP 限制）→ 原版音訊抽取需在使用者自己的網路環境完成，之後於 preset 加上 `audioFile` 走 localaudio 即可。
  - 🔄 PWA 快取升級至 `kids-games-v38`。
  - ✅ e2e 10/10＋新功能探針 8/8（`C:\Users\PXP\AppData\Local\Temp\opencode\new_tab_probe.js`）。

- [x] **牛津自然發音繪本《The Trunk and the Skunk》整合與押韻打怪闖關（v44）**：
  - 🦨 影音精聽室：加入 `sWh-dg0t5YU` 兒童精選推薦與 12 句精準時間戳雙語字幕。
  - 🎧 本地原音故事庫：收編 `SKUNK_STORY`（`skunk_audio.webm`，離線可聽），支援 5 步驟跟讀法與本機回音法（Echo Method）雙遍對照。
  - 📖 純文字閱讀器：自動收納進兒童繪本選單，支援字級調整與單句原音點擊播放。
  - 🎮 小朋友闖關新玩法「🦨 押韻大作戰 (Rhyme Match)」：新增森林臭屁鼬與撼地長毛象 Boss，實作自然發音家族押韻題庫（-unk, -amp, -usk, -ink 等），答對觸發象鼻潑水特效（Slosh!）。
  - 📚 單字庫擴充：新增 `Trunk`, `Skunk`, `Mammoth`, `Tusk`, `Stamp`, `Slosh`, `Smell`, `Stink` 8 個基礎繪本生字。
  - 🔄 PWA 快取推進至 `kids-games-v44`。

## 🕐 最後更新

- **小四數學 3Blue1Brown 動態幾何與抽象量感透視系統規劃與首發引擎落地（2026-10-14）**：
  - 📐 **全 23 王國 506 題 3B1B 視覺模型完整規劃（`PLAN_GRADE4_3B1B_VISUALS.md`）**：
    - 涵蓋大數十進位爆裂點、直式位值光柱、矩陣面積乘法模型、長除法分堆、雙峰重力滾球數線、語法樹坍塌、等值分數切刀、量角器自適應雙圈吸附、Isometric 3D 等角透視積木與 X-Ray 等。
  - ⚡ **純原生 Canvas 幾何透視引擎（`app/js/visual_morph_engine_g4.js`）**：
    - 實作 5 大核心渲染器（量角器、等角透視積木、矩陣面積、Exploding Dots、四捨五入滾球），支援 60fps rAF 平滑緩動與 X-Ray 透視。
  - 🖥️ **互動原型展示台（`app/prototype_g4_3b1b.html`）**：提供時間軸進度拉桿、自動播放、X-Ray 自由切換。
  - 🛡️ **獨立守門員測試通過（`tests/verify_g4_3b1b_engine.js`）**：31/31 組渲染條件 100% PASS，Exit Code 0。

- **小三數學 3Blue1Brown 動態幾何與具象量感視覺化系統全量落實（2026-10-14）**：
  - 🎨 **8 大王國 176 題 100% 覆蓋**：
    - `t16` 城堡周長（22 題）：四邊物理鉸鏈平鋪拉直成線段。
    - `t17` 方格拼圖（22 題）：網格展開、半格三角形旋轉咬合拼成正方形。
    - `t22` 圓規與圓（22 題）：圓規流光畫圓、小熊鬧鐘與摩天輪、夏威夷披薩切片拉開牽絲、彩虹腳踏車輪滾動、水波與吸盤飛鏢靶、太陽神輪半徑等長定理。
    - `t21` 角與直角（22 題）：圖釘雙色木條活動角開合、壓克力三角板滑動比對角落直角、鐘面夾角、長方形剪去一角（五邊形）。
    - `t18` 分數蛋糕（22 題）：圓形披薩/派餅與長條巧克力排等分吃掉切開飄移與填色合體。
    - `t10` 經過時間（22 題）：鐘面雙針動態追趕掃掠發光扇形 ＋ 下方水平數線整點跳步拱橋（拱橋區間標記與總結）。
    - `t13` 公升毫升（22 題）：透明量筒藍色波浪水位注入攀升 ＋ 滿 1000 mL 轉化 1 L 魔法光芒合體。
    - `t14` 公斤公克（22 題）：雙臂物理天平傾斜擺動 ＋ 砝碼堆疊 ＋ 1000 g 砝碼合體發光成 1 kg 金塊壓沉平衡。
  - ⚡ **純前端 Canvas 數學物理運算（$0 雲端消耗）**：不需後端 API，高影格率流暢動態，極致節省 Token。
  - 🌐 **離線全相容**：解決 Windows `file:///` 協議限制，全域 JS 資料包裝，免伺服器秒開。
  - 🛡️ **三大守門員全綠通過（Exit Code 0）**：`verify_t22_diverse_visuals.js`、`verify_t21_t18_visuals.js`、`verify_t10_t13_t14_visuals.js` 176 題各 5 階段時間步階繪製測試 100% PASS。
- **Git 狀態**：✅ 已推（`017_小朋友APP` commit b6dfe3f、`math3-bank` commit 68ad090）

- **小二數學 ＆ 數學年級大廳整合（2026-10-14）**：
  - 🧠 **125B Strata 審查完成**：以 `reasoning_effort=none` 分 3 步完成審查。7 筆子由 OCR 候選因題幹殘缺全數 REJECT；26 王國 572 題 seed bank 經課綱守門員審查全數 PASS 獲簽核為權威題庫（`source/AUDIT_REPORT_125B.md`）。
  - 🚀 **125B 全量生產管線（任務1+2+3）**：執行 6 個任務管線，耗時 465.37 秒，消耗 17,204 tokens，平均速度 30.70 tokens/s（`source/PRODUCTION_REPORT_125B.md`）：
    1. 任務 3（切片重構）：成功修復 7 筆破損候選題，補足生活題幹與奧利博士解法（`source/ziyou_reconstructed_candidates.json`）。
    2. 任務 2（直式微步階鷹架）：生成小二加減進退位與九九乘法連加微步階引擎（`app/js/vertical_math_explainer_g2.js`）。
    3. 任務 1（26王國情境題庫）：分 4 大批次全量生成在地生活情境規格（`source/curriculum_scenarios_task1_batch_*.md`）。
  - 🏰 **三合一數學大廳（Hub）**：`小三數學題庫/app/index.html` 正式收納 Grade 2、Grade 3、Grade 4 三年級卡片，並部署 `app/g2/`；`017_小朋友APP/index.html` 首頁同步加入入口。
  - 🧪 **真實無頭 Edge CDP 驗收**：`_scratch/verify_web_cdp.js` 4/4 全綠 PASS，小二冒險答題、解鎖、雙向導航及年級大廳運作完全正常。
  - 🎨 **小二 3B1B 視覺透視系統（176 題）**：`app/js/visual_morph_engine_g2.js` ＋ `verify_g2_visuals.py` PASS ＋ `verify_3b1b_g2_cdp.js` PASS。
  - 🛡️ **雙守門員驗證**：`validate_grade2.py` 與 `validate_grade2_provenance.py` 全數 PASS。

- **日期**：2026-10-13
- **更新者**：space-bunny-free（OPENCODE 驗證端）
- **內容**：執行 Antigravity 交接的交替式驗證任務書（`小四數學/OPENCODE_TASK_GRADE4_MATH.md`）三大探針，**3/3 全綠（Exit Code 0）**。
  - 探針 1：`python -X utf8 validate_grade4.py` → 全套驗收守門員全數合格（506 題／鷹架 132／乘法加法指引 22 題）。
  - 探針 2：`400×37` 第 7 層逐位加法算式與進位地圖逐字相符；`246×34` → `8364` 相符。
  - 探針 3：`.step-card.done` / `.step-card.locked` 皆 `display:none !important`，手機單一聚焦模式成立。
  - 🔬 另做獨立覆核：SHA256 自行重算雙檔一致（`6378886F…9CCE4`）、乘法交錯驗算補測 6 題全對、`vertical_math_explainer.js` 乘／括號／除三型別單元測試通過。
- **Git 狀態**：✅ 已推（`math3-bank` 與 `017_小朋友APP` 同步推向 `origin/main`）



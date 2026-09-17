# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；換對話框／收工時**必更新**。本檔只放交接必需的精簡資訊。

## ⏯️ 目前做到哪

1. **影子跟讀第 5 步驟「回音法」（Echo Method）全套實作完成**（commit a736e19 / 888ef19，已 push）：
   - `learn.html` 新增第 5 個步驟 Tab `[🔊 回音]`，CSS `.step-tabs` 改為 5 欄等寬網格。
   - `applyStepUI()` 實作 Step 5 盲聽狀態（隱藏 ruby/romaji/zh/hint/badge，常駐錄音按鈕）。
   - `playEchoSentence()` 實作原音播放 → 5 秒複述倒數「換你說！」→ 原音對照重播 → 銜接下一句。
   - `speakSentence()` 智慧分流，YouTube 來源在 Step 5 自動導向回音法。
   - `zhHidden` 與音訊定時器清理邏輯同步整合。
2. **BBT《The Big Bang Theory》素材整合**（commit 888ef19，已 push）：
   - `PRESET_VIDEOS` 納入 Sheldon 考駕照經典對白（13 句中英對照字幕）。
   - 支援「📤 送到影子跟讀」與 Step 5 回音法練習。
3. **綠野仙蹤影子跟讀版第 1 章完成**（commit f26bb8e）：
   - `woo_shadow_ch1.html`（獨立檔案，49 句英中對照，Read Me A Classic 朗讀版）。
4. **平板橫向版面最佳化**（commit a9a1889）。
5. **影音精聽室 YouTube 無法播放修復**：
   - 根因：載入時精聽室 Tab 為 `display:none`，`new YT.Player` 在零尺寸容器內初始化 → 黑畫面。
   - 修復：YTPlayerSys 改為 `playerBuilt` flag + `ensureReady()` 延後到第一次打開精聽室才建立播放器；`UI.switchTab()` 切到 video Tab 時呼叫。
6. **影子跟讀「📖 全文雙語對照」檢視器**：
   - `.shadow-story-row-1` 新增「📖 全文對照」按鈕 → `#fullTextViewModal` 彈窗（逐句 中英/中日對照 + 時間戳 + 🎯 跳句回訓練）。
   - ShadowingStudio 新增 `fmtFullTextTime/openFullTextView/renderFullTextView/jumpToSentenceFromFullText/closeFullTextView/toggleFullTextZh/initFullTextViewEvents`。
7. **影音精聽室精選自動同步進影子跟讀故事庫**：
   - `getPresetStories()` 依 mode+lang 將 PRESET_VIDEOS 自動轉成 `yt-` 故事（source:youtube）；`getCurrentStory()`/`populateStorySelect()` 已擴充。
   - 手動「📤 送到影子跟讀」僅保留給用戶自訂影片/字幕。
8. **綠野仙蹤 Ch.1 正式收編 learn.html 故事庫**：
   - `WOO_CH1_STORY` const（`source:'localaudio'`，`audioFile:'woo_shadow_ch1.webm'`，81 句 `{start,end,text,zh}`）。
   - 新增 `playLocalAudioSegment()`（seek 到 start、追到 end 自動停、`playbackRate` 跟語速）並掛進 `speakSentence()` 與 `stopAllAudio()`；Step 5 回音法對 localaudio 退化為一般播放。
   - 修正 `woo_shadow_ch1.html` 兩處字典型 typo（`start:375.5,en:378.88`、`start:419,en:424` → `end:`）。
   - `sw.js` 快取版本升為 `kids-games-v37`，加入 `woo_shadow_ch1.webm` 與 `woo_shadow_ch1.html`。

9. **網頁版＋無頭瀏覽器驗收＆Bug 修復＋閱讀器分頁＋YT 153 降級（本次）**：
   - 🔴 修 `openFullTextView()` 的 `$('#fullTextViewModal')` → `$('fullTextViewModal')`（`$`=getElementById，null.classList 曾讓「全文對照」完全無法開啟）。
   - 🔴 修 `playLocalAudioSegment()` 播放斷裂：`stopLocalAudioSegment()` 對舊元素設 `src=''` 會觸發非同步 `error`（Empty src attribute）→ 舊 `onerror` 再呼叫 `finish()`＋`speakSentence()` 回退，把新元素清掉並無限 rebuild。改為「先解綁事件 handler → pause → removeAttribute('src')+load()」；localaudio 的 `onerror` 不再觸發 TTS 回退（避免無限遞迴）。
   - 🔴 修語速無效：`audio.playbackRate = currentSpeed` 在 `audio.load()` 之前設定會被 Chrome 重設回 1.0。移到 `begin()`（load 之後、play 之前）再設一次；speed-btn 對播放中的 `localSegmentAudio`／`realAudioEl` 即時套用。
   - 🟢 `common.js:156` sparkle `document.body.appendChild` 在 `<head>` 載入時 body 尚未解析 → 加 null 防護（原本 sparkles 全消失＋console error）。
   - 📖 全文對照升級為「閱讀器」：`openFullTextViewEx(title, rows, onJump)` 可重用（故事與影片字幕共用）＋整排可點跳句；精聽室載入列新增「📖 全文閱讀」按鈕。
   - 🗑️ 移除影子跟讀列「📖 全文對照」按鈕；新增**獨立「📖 閱讀器」導航分頁**（`FULL_TEXT_READER`）：純文字全文互動，不錄音／不跟讀／不播影片；語系切換（🇬🇧/🇯🇵）、文章下拉（新公開 API `ShadowingStudio.getAllStories(lang, mode)` 共用目錄）、逐句卡片（編號＋時間戳＋原文＋音標＋中文）、🙈 隱藏中文、A+/A− 字級（13–24px、localStorage 持久化、文章記憶）。
   - ⚠️ **YT 錯誤 153/150 處理**：PRESET_VIDEOS 全部 5 支皆 embed-restricted（探針實測確認為影片端限制，非 code bug）。
     - 精聽室：`createPlayer` 掛 `onError` → `#ytEmbedNotice` 醒目提示（附使用建議），切換影片自動清除。
     - 影子跟讀：`youtubeEmbedBlocked` 旗標＋onError 偵測；句子播放遇 153 自動改雲端 TTS（Google/有道）朗讀該句，不再死等無聲播放。
     - 原版音訊抽取（yt-dlp）需在**使用者自己的網路**跑（沙箱 IP 限制，測試片 BaW_jenozKc 也失敗）；之後 preset 加 `audioFile` 走 localaudio 即可。
   - 🔄 `sw.js` 快取升為 `kids-games-v38`。
   - ✅ e2e 10/10＋新功能探針 8/8（`C:\Users\PXP\AppData\Local\Temp\opencode\new_tab_probe.js`）。
   - ⚠️ 已知測試工具陷阱：YT.Player 會把 `#player` div「替換成」同 id 的 iframe（內部不會再巢狀 iframe）；puppeteer 新版無 `page.waitForTimeout`，須自製 setTimeout promise；語速測試時 `load()` 會重設 rate。e2e 腳本在 `C:\Users\PXP\AppData\Local\Temp\opencode\`。

10. **本機地端 AI 環境建置與評估（本次；非專案程式碼變更）**：
    - Ollama `qwen2.5-coder:7b` 已安裝，經 opencode 實測可用（`opencode run -m ollama/qwen2.5-coder:7b` 正常回應）。
    - Open-WebUI（`localhost:3000`）＋Python 3.11＋Cline（VS Code）環境皆已就緒。
    - **改了全域設定** `~/.config/opencode/opencode.json`（⚠️ 不在 repo、push 不會帶走）：
      - ollama provider 補 `"apiKey": "ollama"`、npm 換成 `@ai-sdk/openai-compatible`（`@ai-sdk/openai` 會一直報 "OpenAI API key is missing"）。
      - permission：`edit`、`bash` 改 `"ask"`（7B 會hallucinate 亂叫 `write` 工具；原本 `"*": "allow"` 下會不問就寫檔）。
    - 硬體盤點：Ryzen 9 3950X（16C/32T）、RAM 64GB、GPU RTX 5060 **8GB** VRAM。
    - **評估決策（2026-09-15 完成）**：
      - 8GB VRAM 鐵律：模型 + KV/compute buffer 只能塞 ~7GB → **全 VRAM 極限就是 7~8B 級**；任何 14B（q4 9.0GB 或 q3_K_S 8.4GB）都 >26% 丟 CPU，實測 **7.4 / 15.5 tok/s**，agentic 無法用，已刪除。
      - 30B（`qwen3-coder:30b-a3b` 19GB）→ 60%+ offload，估 3~8 tok/s，**確認跳過**；`qwen3-coder-next` 52GB 更大不考慮。
      - ✅ **採用 `qwen3:8b`（5.2GB）為本地主模型**：100% GPU、52~69 tok/s、**唯一通過原生工具呼叫測試的**（`qwen2.5-coder:7b` 不會回結構化 `tool_calls`，只把 JSON 當文字吐；qwen3 多步迴圈 read→edit 全通）。缺點：純文字回答偏長篇（沉默無效），走 agent 工具迴圈時簡潔。
      - 已把 `qwen3:8b` 寫進開場設定為預設 `model`（`options.enable_thinking:false`、limit context 40960）、`qwen2.5-coder:7b` 留作 `small_model`（標題/摘要用，78 tok/s）；benchmark 腳本 `C:\Users\PXP\AppData\Local\Temp\opencode\bench.ps1`。
      - **需重啟 opencode 才生效**（config 開機才載入）。
      - 待辦：重啟後用 `opencode run -m ollama/qwen3:8b` 實測 agentic 小任務。

11. **Ollama 桌面開關捷徑（本次；環境設定，非 repo 檔案）**：
    - 診斷本地模型 "CANNOT CONTACT to API"：根因是 Ollama 服務沒跑（`localhost:11434` 無監聽）。
    - 桌面新增單一「Ollama」捷徑（雙擊切換開關）：`Ollama.lnk` → `%LOCALAPPDATA%\opencode-scripts\start-ollama.ps1`（腳本已移出桌面，避免誤認成兩個捷徑）。
    - 捷徑圖示換成 Ollama 羊駝圖示（原 PowerShell 藍圖示易混淆）。
    - 踩坑：PS 5.1 控制台中文顯示為 `??` 亂碼 → 腳本輸出改純英文 `[ON]/[OFF]`。
    - Ollama 0.34.0 已驗證運行中（綠燈）；以後用 opencode 前先雙擊捷徑確認啟動。
    - ⚠️ 捷徑與腳本都在 repo 之外，push 不會帶走；換電腦需重建。

12. **綠野仙蹤 Ch.1 錯位修復 ＋ Ch.2 本地模型流水線全套上線（本次，sw.js v39）**：
    - 🔴 **第 1 章切片錯位修復**：找出 350s～465s（原始 segment 61 處）人為標記 off-by-one 造成後面 22 句文字聲音脫節的根本原因；全面校準 `woo_shadow_ch1.html` 與 `learn.html`（`WOO_CH1_STORY` 81 句）。
    - 🌪️ **第 2 章全套製作並收編**：
      - 音訊壓制：`woo_shadow_ch2.webm`（6.2MB，11 分 41 秒）。
      - Whisper Large-v3 逐詞/逐段轉錄：134 句、2013 單字 word-level timestamps 精準錨定，0 漂移、0 倒流。
      - 本地模型（Ollama `qwen3:8b`）批次高速翻譯（190s 完成 134 句）。
      - 人工嚴格覆核與精修：補齊 10 句缺漏、統一臺灣童書專有名詞規範（桃樂絲／芒奇金人／北方女巫／翡翠城／奧茲／托托／博克）。
      - 獨立播放頁：`woo_shadow_ch2.html`（134 句）。
      - 整合進 `learn.html`：新增 `WOO_CH2_STORY`、擴充 `getWooStories()` / `getCurrentStory()` / `getAllStories()`，影子跟讀與「📖 閱讀器」同步就緒。
    - 🔄 **PWA 快取升級**：`sw.js` 升至 `kids-games-v39`（加入 `woo_shadow_ch2.webm` 與 `woo_shadow_ch2.html`）。

## 🚦 目前狀態

- 專案：純前端 HTML/CSS/JS，無框架、無 build 步驟。
- 主要應用：
  - `index.html`：四關魔王討伐卡片 + 影子跟讀入口 + 星光單字星球入口
  - `learn.html`：影子跟讀 V2（含 Step 5 回音法）、影音精聽室、情境對話、跟讀生字庫、語境記憶閃卡
  - `toeic.html`：星光單字星球（兒童美語 684 + 多益 11,238 字）
  - `sticky-gomoku-new.html`：黏黏圍棋（Gooey 果凍、4 段 AI、AI 教練）
  - `woo_shadow_ch1.html`：綠野仙蹤 Ch.1 影子跟讀（獨立檔案）
- 快取版本：`sw.js` = `kids-games-v38`
- GitHub Pages：https://xfarbetty-svg.github.io/kids-gomoku-go/
- 依賴工具鏈現況（DESKTOP-6ELKIRH）：
  - `yt-dlp`：2026.08.19
  - `ffmpeg`：9.0-full_build（已加入系統 PATH）
  - `whisper`：openai-whisper 20250625 已安裝於 Python 3.10
- 綠野仙蹤 Ch.1 音檔：`woo_shadow_ch1.webm`（6.1MB，已進 SW 快取）。

## ➡️ 尚未做的工作清單（待辦路線圖）

1. **綠野仙蹤後續**：
   - ~~確認 Ch.1 影子跟讀版品質 → 正式加入 learn.html~~ ✅ 已完成（source:localaudio 直接收編）
   - **待驗收**：手機/平板實機跑一遍精聽室→影子跟讀（YouTube 精選、WOO Ch.1、Step 5），確認全文對照跳句與音訊。
   - 製作 Ch.2~24（YouTube playlist 已確認，流程已跑通）
2. **平板與手機實機體驗走查**：
   - 實機確認 Step 5「回音法」在 iPhone / Android 上之觸控與 5 個 Tab 寬度體驗。
   - 平板橫向雙欄體驗驗收。
3. **Sprint 2 手機體驗剩餘項**（見 `PLAN-MOBILE-FIX.md`）。
4. **Sprint 3-5**（音訊 PWA、效能資料、收尾測試）。
5. **單字星球優化**：PDF 題庫擴充、閃卡左右翻動效、主題 Pills 修復。
6. **TASK-008 內容包**（VOA + BBC 素材）。
7. **魔王討伐動畫／音效**。

## ⚠️ 注意事項

- 本機目前未配置 Obsidian MCP 工具，L3 筆記暫未自動同步，待回到有 Obsidian 工具之環境時補齊。
- 綠野仙蹤素材來源：`youtube.com/playlist?list=PLgQjk-xm2AGXx0mwnIuQiDocH9wssCTeU`（Read Me A Classic，24 章）。
- 平板斷點慣例：`@media (min-width: 900~960px) and (orientation: landscape)`。
- 修改 `learn.html` 時務必保留 ShadowingStudio 生命週期與各 Step UI 獨立分流機制。

## 🕐 最後更新

- 時間：2026-09-15
- 更新者：antigravity @ DESKTOP-6ELKIRH
- 內容：
  - 本地模型評估定案：8GB VRAM 極限 7~8B，14B 全量化（7.4/15.5 tok/s）已刪、30B 確認跳過；採用 `qwen3:8b` 為本地主模型（100% GPU、52~69 tok/s、唯一通過原生工具呼叫測試）、`qwen2.5-coder:7b` 降為 `small_model`。
  - **新增子代理委派**：全域 opencode 設定 `agent.general`／`agent.explore` 鎖定 `ollama/qwen3:8b`──主對話跑雲端時粗活分包給本地模型，雲端成本歸零。
  - ⚠️ 全域設定（`~/.config/opencode/opencode.json`）不在 repo，push 不會帶走；換電腦需重建。**需完全重啟 opencode 才生效**，重啟後先跑一個 explore 子代理驗收是否走 ollama。
  - 💡 本地模型使用守則（已回覆使用者）：適合單檔微修／小腳本／讀檔摘要／依慣例複製；跨檔重構要一次一指；深度推理與長篇創作建議交雲端。
- Git push：✅ 已推（本次）

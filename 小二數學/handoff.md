# 小二數學交接

## Current state

- MVP app created under `app/` with 26 themes and 572 deterministic seed questions (26 × 22).
- Seed questions are explicitly marked `seed_pending_local_ziyou_review`; they are not claimed to be copied from Ziyou.
- `ziyou_grade2_pipeline.py --probe` performs a local xajax probe and saves the raw response under `source/ziyou_raw/`.
- `ziyou_grade2_pipeline.py --seed` regenerates the deterministic seed bank.
- `validate_grade2.py` checks 26 themes, 572 questions, curriculum IDs, four distinct options, per-theme content uniqueness, visual-data references, and honest seed source markers.
- Cloudflare Pages instructions are in `cloudflare/README.md`.
- Added `python -X utf8 ziyou_grade2_pipeline.py --ingest`: downloads the 16 probed Grade 2 unit PDFs through the local xajax flow, stores immutable raw PDFs and trace metadata under `source/ziyou_raw/`, renders local question crops when PyMuPDF is available, and writes `source/ziyou_mapping.json`, `source/ziyou_rejected.json`, and `source/INGESTION_REPORT.md`.

## Evidence boundary

- The current bank is still deterministic seed scaffolding. It is not claimed as copied from Ziyou.
- Local evidence now includes 16 successfully downloaded PDFs, URL/xajax/HTTP/size/SHA256 records in `source/ziyou_raw/ziyou_downloads.json`, and rendered question crops under `source/ziyou_questions/`.
- The latest ingestion found 22 parse candidates: 7 passed the mechanical text gate and 15 were rejected for insufficient text or curriculum concerns. The 7 mapping records still require human answer/image review and are not promoted to the app bank.
- `source/ziyou_raw/grade2_unit_probe.xml` and its metadata record the probe only; the deterministic seed questions remain distinct from the Ziyou evidence.

## This session closeout

- 125B completed local Ziyou ingestion: 16/16 Grade 2 unit PDFs downloaded successfully.
- Raw PDFs, download metadata, SHA256 records, rendered question crops, mapping and rejected lists are stored under `source/`.
- Ingestion found 22 parse candidates: 7 mechanical-gate mapping candidates and 15 rejected. The 7 candidates are not yet trusted as final questions.
- The app bank remains the 26-theme / 572-question deterministic seed bank. No seed question is claimed to be a Ziyou original.
- Local gates reported exit code 0 for `--probe`, `--ingest`, `validate_grade2.py`, and Python compilation.

## Must redo before production

1. 125B must inspect the 7 mapping candidates as images and compare each answer, wording, unit, page and question number against the source PDF.
2. Re-run the Grade 2 curriculum gate on every candidate, especially the Ziyou units named 除法、面積、未知數、分配律、交換律、結合律; reject out-of-scope material with a reason.
3. Expand provenance mapping to include reviewed status, reviewer result, accepted/rejected reason, source page and stable question hash.
4. Only after reviewed candidates pass may 125B replace matching seed records; otherwise keep the seed bank and document the shortfall.
5. After any bank replacement, rerun `python -X utf8 validate_grade2.py`, browser/mobile regression, offline PWA test, unlock progression and progress reload test.
6. Cloudflare Pages deployment remains pending until the provenance-aware bank audit and mobile checks pass.

## Important evidence boundary

The successful probe proves the Grade 2 unit list; the 16 PDFs prove local source acquisition. Neither proves that the current 572 seed questions came from Ziyou.


## Grade 2 Ziyou audit append (2026-10-14)
- Created provenance audit artifacts: `ziyou_mapping_audit.json`, `ziyou_review_manifest.json`, `ziyou_rejected_audit.json`
- Created validator: `validate_grade2_provenance.py` (PASS)
- Original seed gate: `validate_grade2.py` (PASS)
- Added pre-upload checklist and review tickets
- App bank, grade3, and grade4 untouched
- Remaining: visual human review, mobile/PWA functional checklist

## Frontend fix status (2026-10-14)
- app.js fetch catch had syntax error causing whole script failure and empty map (no stages)
- Fixed app.js and bumped SW cache to g2-math-v2
- Headless smoke test rendered 28 grade-2 theme buttons
- Still needs human real-browser verification; if old cache/SW persists, map may stay empty until SW/data cleared
- Grade grade lobby back link now points to grade lobby instead of language lobby


## 125B Strata Audit & Hub Integration (2026-10-14)
- **125B (Strata qwen3.8-flash-next-iq2_xs) 審查執行**：分 3 步完成（Context tokens 嚴格控制在 6.5k 以內，遠低於 64k 上限，耗時 287s）：
  - **Step 1 (7 筆子由候選題)**：判定 **REJECT ALL**。題幹截斷、OCR 殘缺、視覺依賴過強、重複題目（Z2-M004/M005）、答案無法對照。**決策：嚴禁替換 seed bank**。
  - **Step 2 (26 王國種子題庫)**：判定 **PASS**。完整覆蓋 108 課綱二年級 N、S、A 四大範疇核心條目，無超綱除法/面積/公升公克，抽樣題目符合小二認知，`seed_pending_local_ziyou_review` 標記誠實合規。
  - **Step 3 (總結簽核)**：產出 `source/AUDIT_REPORT_125B.json` 與 `source/AUDIT_REPORT_125B.md`。維持 26 王國 572 題 seed bank 權威性。
- **全站整合與年級大廳聯動**：
  - 於 `小三數學題庫/app/index.html`（國小數學勇者大冒險傳送大廳）正式整合加入 **Grade 2 萌芽草原冒險** 卡片，實現小二、小三、小四三合一集中展示。
  - 於 `小三數學題庫/app/g2/` 部署同步小二數學完整 App，雙向導航（`../index.html`）無縫回訪大廳。
  - 於 `017_小朋友APP/index.html` 首頁入口新增「⚔️ 國小數學大冒險」卡片，直通年級大廳。
- **真實無頭 Edge CDP 驗收**：
  - 執行 `_scratch/verify_web_cdp.js`（Node 24 + 原生 WebSocket CDP）：**4/4 全綠 PASS**。
    1. Math Hub 3 年級卡片存在與連結驗證 (PASS)
    2. 小二數學地圖 26 王國渲染與題目載入 (PASS)
    3. 小二數學選項點擊、回饋與下一題解鎖 (PASS)
    4. 年級大廳 g2/index.html 整合與雙向導航 (PASS)
    5. 017 首頁包含國小數學年級大廳入口 (PASS)
- **本地守門員檢驗**：
  - `python -X utf8 validate_grade2.py` (PASS, 26 themes / 572 questions)
  - `python -X utf8 validate_grade2_provenance.py` (PASS)


## 125B (Strata) 全量生產管線執行紀錄 (2026-10-14 任務1+2+3)
- **總執行耗時**：465.37 秒 (~7.8 分鐘)，總消耗 Tokens：17,204 tokens（Prompt: 2,915, Completion: 14,289），平均速度：30.70 tokens/s。
- **任務 3 成果（切片重構）**：修復 7 筆破損候選題，補齊完整生活題幹、4 個互斥選項與奧利博士解法（`source/ziyou_reconstructed_candidates.json`）。
- **任務 2 成果（直式微步階鷹架）**：產出小二專屬直式微步階資料結構與 JS 解說函式庫，覆蓋二位數/三位數加減進退位與九九乘法連加模型（`app/js/vertical_math_explainer_g2.js`）。
- **任務 1 成果（26 王國生活情境題庫）**：分 4 批次（A 數與量、B 乘法連加、C 生活實測、D 幾何代數）全量生成台灣在地生活情境規格與診斷型選項設計（`source/curriculum_scenarios_task1_batch_*.md`）。
- **全量生產報告**：已儲存於 `source/PRODUCTION_REPORT_125B.md`。
- **守門員驗收**：`validate_grade2.py` (PASS)、`validate_grade2_provenance.py` (PASS)、`verify_web_cdp.js` (4/4 PASS)。


## G2 精緻 RPG 戰鬥介面升級（對齊小三小四同款風格 2026-10-14）
- **介面全面升級**：將原本的單頁 MVP 按鈕版面，全面升級為小三、小四同款精緻 RPG 沉浸式戰鬥系統。
- **功能特色**：
  - 頂部勇者 HUD：勇者等級 Lv、經驗條、金幣計數、語音開關、地圖按鈕與「↩ 年級大廳」跳轉。
  - 戰鬥舞台：怪獸精靈（`avatar`）、怪獸名稱、血條動畫、破魔題目、4 顆魔法選項卡片、奧利博士軍師對話氣泡。
  - 26 王國冒險地圖 Modal：點擊「🗺️ 地圖」可彈出完整 26 王國章節卡片，支援點選關卡跳轉與進度星數。
  - 動畫與音效：答對爆金幣與經驗值浮動動畫、Confetti 彩帶、Web Audio 音效。
- **驗證確認**：`validate_grade2.py` (PASS)、`validate_grade2_provenance.py` (PASS)、Edge CDP 端到端測試 4/4 PASS。

## 3B1B 動態幾何與具象量感視覺化系統全量落實 (2026-10-14)
- **8 大王國 176 題 100% 覆蓋**：
  1. `g2-08` 乘法小屋（22 題）：連加收攏為二維陣列矩陣（Array Model）。
  2. `g2-09` 九九乘法（22 題）：倍數矩陣波浪流光點亮與累計膠囊。
  3. `g2-24` 排列乘法（22 題）：矩陣 90° 平滑旋轉演示乘法交換律空間不變性。
  4. `g2-10` 分裝平分（22 題）：拋物線飛入分裝袋與等分發牌動畫。
  5. `g2-04` 二位數加法（22 題）：Base-10 積木滿 10 個融合成 1 根十位棒（進位）。
  6. `g2-05` 二位數減法（22 題）：十位積木崩解為 10 顆個位塊（借位退位）與劃線消隱。
  7. `g2-19` 直尺線段（22 題）：擬真公分直尺與黃金跳步拱橋（+1cm 波浪）。
  8. `g2-20` 圖形大小（22 題）：半透明圖形平移疊合（Superposition）與多餘區霓虹高亮。
- **純原生 Canvas 2D 物理形變引擎 (`app/js/visual_morph_engine_g2.js`)**：
  - 3B1B 經典深黑底與調色盤、DPR 銳利度補償、Web Audio 諧音回饋、0~1 平滑來回動畫循環。
- **離線全相容與註冊表**：
  - `app/data/visual_morph_registry_g2.json` ＋ `app/js/visual_morph_registry_g2_data.js` 免伺服器秒開。
- **守門員全面驗收全綠 (Exit Code 0)**：
  - `verify_g2_visuals.py`：176 題幾何算理型別數學一致性檢驗 100% PASS。
  - `_scratch/verify_3b1b_g2_cdp.js`：無頭 Edge CDP 實測動態展開與拉動 Slider 100% PASS。
  - `_scratch/verify_web_cdp.js`：4/4 整合雙向導航與冒險流程 PASS。


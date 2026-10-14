# 125B Strata 唯讀審查任務

## 審查範圍

- `CURRICULUM_GRADE2.md`
- `app/rpg_world_map.json`
- `ziyou_grade2_pipeline.py`
- `source/ziyou_metadata.json`
- `app/index.html`
- `app/app.js`
- `validate_grade2.py`

## 必查事項

1. 26 個主題、572 題是否覆蓋小二課綱的核心 N、S、A 條目；指出未覆蓋的條目。
2. 每一題的答案、四個選項、算式與 explanation 是否數學正確。
3. 題目是否適合二年級兒童閱讀，是否出現不應教學或評量的正式術語。
4. 題目是否違反 `CURRICULUM_GRADE2.md` 的禁止規則：除法符號、餘數、公斤／公克／公升／毫升、面積公式、公尺公分混合運算、兩次退位、併式、超過 1000、未知數移項。
5. `source.kind=seed` 是否被正確標示；在沒有本地子由 PDF 與人工覆核前，不得宣稱為子由原題。
6. `ziyou_grade2_pipeline.py` 的 live probe、來源追蹤、原子 PDF 落盤、逐單元失敗紀錄與錯誤處理是否足以進入下一階段解析。
7. 目前 APP 的解鎖、答題、進度保存與離線快取是否符合手機使用情境。

## 審查輸出格式

- `PASS` 或 `FAIL`
- 嚴重度：Critical / High / Medium / Low
- 檔案與題目 ID
- 課綱依據
- 修正建議
- 是否允許將 seed bank 替換為本地子由題目

## 現況聲明

本版本目標為 26 個主題、572 題；正式 app bank 仍是
`seed_pending_local_ziyou_review` 的 deterministic seed，並非子由原題。最新 ingestion
已下載 16/16 個二年級單元 PDF，解析 22 個候選，7 個進入機械 gate 後的 mapping，15
個進入 rejected；尚未完成 7 個候選的人工影像、答案與術語覆核。125B 審查完成前，
不得替換 seed bank，也不得把 mapping 宣稱為已完成的正式子由題庫。

## Ingestion execution record

- `python -X utf8 ziyou_grade2_pipeline.py --probe`: exit 0
- `python -X utf8 ziyou_grade2_pipeline.py --ingest`: exit 0; downloaded 16, failed 0, parsed 22, mapping 7, rejected 15
- `python -X utf8 validate_grade2.py`: exit 0; seed bank unchanged, 26 themes / 572 questions
- `python -X utf8 -m py_compile ziyou_grade2_pipeline.py validate_grade2.py`: exit 0
- Raw PDFs: `source/ziyou_raw/pdfs/`; trace metadata: `source/ziyou_raw/ziyou_downloads.json`
- Provenance outputs: `source/ziyou_mapping.json`, `source/ziyou_rejected.json`, `source/INGESTION_REPORT.md`

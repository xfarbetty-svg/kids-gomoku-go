# Ziyou Grade 2 Ingestion Report

- 執行時間：2026-10-13T22:11:07Z
- 單元總數：16
- 下載成功：16
- 下載失敗：0
- PDF 解析題數：22
- 可判讀且通過 gate 題數：7
- rejected 題數：15
- 正式題庫：維持既有 seed bank，未替換

## 阻塞與證據

下載紀錄見 `source/ziyou_downloads.json`；每個成功 PDF 保存在 `source/ziyou_raw/pdfs/`。
題目只有在答案可確定且通過二年級課綱 gate 時才進入 mapping；未通過者只保留於 rejected。

## Audit status (2026-10-14, main agent / worker125 cycle)

- Added machine-audit artifacts:
  - `source/ziyou_mapping_audit.json` (7 candidate records)
  - `source/ziyou_review_manifest.json` (7 candidate records)
  - `source/ziyou_rejected_audit.json` (15 rejected records, category-annotated)
- Added `validate_grade2_provenance.py` (exit 0: 7 candidates / 7 manifest / 15 rejected)
- Added `source/GRADE2_PREUPLOAD_CHECKLIST.md` and `source/GRADE2_REVIEW_TICKETS.md`
- `validate_grade2.py` remains exit 0: 26 themes / 572 questions
- App bank unchanged: seed bank remains authoritative
- Pending:
  - human visual image verification for all 7 candidates
  - candidate duplicate resolution (`Z2-M005` duplicates `Z2-M004`)
  - mobile/offline/PWA/unlock reload evidence

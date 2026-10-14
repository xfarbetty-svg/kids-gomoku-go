# Grade 2 Ziyou Review Tickets

| ID | Severity | File(s) | Criterion | Suggested fix |
|---|---|---|---|---|
| GR2-001 | High | `source/ziyou_mapping.json`, `source/ziyou_mapping_audit.json` | Visual answer verification for 7 graph-dependent candidates not done | Human review crop/page images; only PDF answer-key cross-check exists now |
| GR2-002 | High | `source/ziyou_mapping.json` | Candidate Z2-M004 and Z2-M005 are exact duplicates | Keep one and explicitly mark provenance/duplicate policy |
| GR2-003 | Medium | `ziyou_grade2_pipeline.py` | SHA256 is PDF-level, not per-question | Add stable per-question hash derived from crop bytes plus normalized provenance id |
| GR2-004 | Medium | `ziyou_grade2_pipeline.py`, mapping schema | `question_number` does not consistently map to visual crop filename | Add `text_block_index` and filename mapping |
| GR2-005 | Medium | `source/ziyou_mapping.json` | Several candidates rely on visual symbols only (`⃝`, `( )`) and are not readable from text | Add textual caption fields or accept visual-only with image evidence |
| GR2-006 | High | `app/rpg_world_map.json` | Seed-only app bank still in place | Define promotion rule before replacement; do not replace now |
| GR2-007 | Medium | `app/app.js`, `app/sw.js` | Visual data consumption and PWA mount/progress persistence not confirmed | Manual source review + mobile offline test |
| GR2-008 | Medium | `app/sw.js` | Precache has no icons and relies on `icons` query string | Confirm assets exist and test offline first load |
| GR2-009 | High | `app/*`, mobile evidence | No mobile real-device playthrough evidence in repo | Run unlock, 400x37-style grade2 screens, progress reload before upload |
| GR2-010 | Low | `cloudflare/README.md` | Deployment paths and cache behavior need review | Verify output dir, entry, no build command, and cache-busting |
| GR2-011 | Medium | `source/INGESTION_REPORT.md` | Human-readable audit status append still pending | Append upgraded audit section after this report |
| GR2-012 | Low | `source/GRADE2_PREUPLOAD_CHECKLIST.md` | Checklist is v0 until remaining gates pass | Re-run after GR2-001 and GR2-009 |

No automatic code changes included. Seed bank intentionally remains authoritative until review complete.
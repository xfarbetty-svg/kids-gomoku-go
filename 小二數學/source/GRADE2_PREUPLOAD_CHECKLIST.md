# Grade 2 Ziyou Pre-Upload Checklist

Status: v0 (audit artifacts created, visual verification still pending)

## A. Text verification status
- PASS: seed bank unchanged: 26 themes / 572 questions; `validate_grade2.py` exit 0
- PASS: mechanical audit records created: `source/ziyou_mapping_audit.json` (7)
- PASS: provenance manifest created: `source/ziyou_review_manifest.json` (7)
- PASS: rejected audit created: `source/ziyou_rejected_audit.json` (15)
- PASS: provenance validator created and passed: `validate_grade2_provenance.py` exit 0
- PENDING: visual human review for all 7 audit candidates (`visual_review_status=pending_human_visual_review`)
- PENDING: rejected text_insufficient candidates actually may be visual tasks, not false questions
- PENDING: answer correctness beyond PDF answer-key cross-check for graph-dependent questions
- PENDING: page semantic definition (question pages vs answer pages) in provenance records
- PENDING: duplicate candidate `Z2-M005` should be explicitly retained or removed from manifest metadata

## B. Functional verification status
- PARTIAL: app bank remains seed bank, so functional app flow still depends on seed bank (expected)
- NOT RUN: mobile browser full playthrough (no real-device gate recorded)
- NOT RUN: offline/PWA cache test
- NOT RUN: unlock progression reload test
- Evidence found:
  - `app/sw.js`: `CACHE_NAME = g2-math-v1`, precaches `./`, `index.html`, `style.css`, `app.js`, `rpg_world_map.json`, `manifest.webmanifest`
  - `app/app.js`: machine check did not find `visual_data`, `isUnlocked`, or manifest usage in current source; requires manual code review
  - `app/rpg_world_map.json`: 26 themes / 572 questions
  - `cloudflare/README.md`: deploy output dir `小二數學/app`, entry `index.html`, no build command, no API key required

## C. Comparison read-only
- Grade 4 validator pattern: 23 themes / 506 questions / 4 boss questions; Gate `validate_grade4.py` passes
- Grade 3 product reference: deployment evidence in `小三數學題庫/handoff.md` (Cloudflare Pages + AI fallback)
- Grade 2 gap vs current products:
  - no official Ziyou bank replacement yet (seed-only)
  - no mobile real-device report in repo
  - no service worker icon assets in precache
  - no provenance promotion rule for replacing seed records

## D. Exit-gate summary
- Script compile: PASS
- `validate_grade2.py`: PASS exit 0
- `validate_grade2_provenance.py`: PASS exit 0
- Pre-upload status: NOT READY (visual review + mobile/PWA still missing)
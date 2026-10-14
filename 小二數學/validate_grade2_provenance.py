# -*- coding: utf-8 -*-
"""Provenance-aware validator for Grade 2 Ziyou audit artifacts."""
from pathlib import Path
import json, hashlib, sys

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "source"
LEGAL_MECH = {"mechanical_verified", "mechanical_warning", "mechanical_failed"}
LEGAL_REVIEW = {"pending_human_review", "mechanically_verified_pending_human_visual_review"}
LEGAL_CATEGORY = {"text_insufficient", "unit_or_curriculum", "unparseable", "visual_required"}

def load(p, default=None):
    if not p.exists():
        return default
    return json.loads(p.read_text(encoding="utf-8"))

def sha_file(p):
    if not p.exists():
        return None
    h = hashlib.sha256()
    with p.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

def main():
    errors = []
    required = ["ziyou_mapping.json","ziyou_mapping_audit.json","ziyou_review_manifest.json","ziyou_rejected.json","ziyou_rejected_audit.json"]
    missing = [n for n in required if not (SOURCE/n).exists()]
    if missing:
        errors.append("missing files: " + ", ".join(missing))

    mapping = load(SOURCE/"ziyou_mapping.json", [])
    audit = load(SOURCE/"ziyou_mapping_audit.json", [])
    manifest = load(SOURCE/"ziyou_review_manifest.json", [])
    rejected = load(SOURCE/"ziyou_rejected.json", [])
    rejected_audit = load(SOURCE/"ziyou_rejected_audit.json", [])
    downloads = load(SOURCE/"ziyou_downloads.json", [])

    if len(mapping) != 7:
        errors.append(f"mapping={len(mapping)} expected 7")
    if len(audit) != 7:
        errors.append(f"audit={len(audit)} expected 7")
    if len(manifest) != 7:
        errors.append(f"manifest={len(manifest)} expected 7")
    if len(rejected) != 15:
        errors.append(f"rejected={len(rejected)} expected 15")
    if len(rejected_audit) != 15:
        errors.append(f"rejected_audit={len(rejected_audit)} expected 15")

    ids = set()
    for r in audit:
        rid = r.get("candidate_id")
        if rid in ids:
            errors.append(f"duplicate candidate_id {rid}")
        ids.add(rid)
    for req in ["candidate_id","source_pdf","unit_id","unit_name","page","question_number","image_path","pdf_sha256","visual_review_status","provenance_status"]:
        for i,r in enumerate(audit):
            if req not in r:
                errors.append(f"audit[{i}] missing {req}")
    for r in audit:
        if r.get("visual_review_status") != "pending_human_visual_review":
            errors.append(f"{r.get('candidate_id','?')}: visual_review_status must remain pending_human_visual_review")
        if r.get("mechanical_status") not in LEGAL_MECH:
            errors.append(f"{r.get('candidate_id','?')}: bad mechanical_status {r.get('mechanical_status')}")
        if r.get("provenance_status") not in LEGAL_REVIEW:
            errors.append(f"{r.get('candidate_id','?')}: bad provenance_status {r.get('provenance_status')}")
        img = ROOT / (r.get("image_path") or "")
        if not img.exists():
            errors.append(f"{r.get('candidate_id','?')}: missing image {r.get('image_path')}")
        else:
            if r.get("stable_question_hash") and r.get("stable_question_hash") != sha_file(img):
                errors.append(f"{r.get('candidate_id','?')}: image hash mismatch")
        try:
            if int(r["unit_id"]) <= 0:
                errors.append(f"{r.get('candidate_id','?')}: invalid unit_id")
        except (KeyError,TypeError,ValueError):
            errors.append(f"{r.get('candidate_id','?')}: unit_id not int")
    for r in manifest:
        if r.get("candidate_id") not in ids:
            errors.append(f"manifest unknown candidate {r.get('candidate_id')}")
        if r.get("image_bytes",0) < 0:
            errors.append(f"manifest {r.get('candidate_id')}: negative image_bytes")
        if not isinstance(r.get("curriculum_gate_reasons"), list):
            errors.append(f"manifest {r.get('candidate_id')}: reasons not list")
    if {x.get("candidate_id") for x in manifest} != ids:
        errors.append("manifest candidate id set != audit candidate id set")

    for i,r in enumerate(rejected_audit):
        if "category" not in r:
            errors.append(f"rejected_audit[{i}] missing category")
        elif r.get("category") not in LEGAL_CATEGORY:
            errors.append(f"rejected_audit[{i}] bad category {r.get('category')}")
        if r.get("manual_review_required") is not True:
            errors.append(f"rejected_audit[{i}] manual_review_required not true")
    # original rejected count parity
    if len(rejected_audit) != len(rejected):
        errors.append("rejected_audit count != rejected count")

    if errors:
        print("[FAIL] provenance")
        print("\n".join(errors[:50]))
        return 1
    print(f"[PASS] provenance: 7 candidates, 7 manifest, 15 rejected; hashes/forms checked")
    return 0

if __name__ == "__main__":
    sys.exit(main())

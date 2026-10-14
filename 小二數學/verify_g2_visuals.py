# -*- coding: utf-8 -*-
"""
小二數學 3B1B 視覺透視參數守門員 (verify_g2_visuals.py)
嚴格檢驗：
1. app/data/visual_morph_registry_g2.json 完整性 (176 題、8 大主題各 22 題)
2. app/js/visual_morph_registry_g2_data.js 前端離線掛載包裝
3. 8 大幾何算理型別數學一致性：
   - mul_group: each_count * group_count == total
   - mul_table: a * b == product
   - mul_rotate: rows * cols == total
   - fair_share: per_group * group_count == total
   - block_add: a + b == sum
   - block_sub: a - b == diff
   - ruler_jump: end_cm - start_cm == length_cm
   - shape_superposition: count_a, count_b > 0
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
JSON_PATH = ROOT / "app" / "data" / "visual_morph_registry_g2.json"
JS_PATH = ROOT / "app" / "js" / "visual_morph_registry_g2_data.js"

EXPECTED_TYPES = {
    "mul_group": 22,
    "mul_table": 22,
    "mul_rotate": 22,
    "fair_share": 22,
    "block_add": 22,
    "block_sub": 22,
    "ruler_jump": 22,
    "shape_superposition": 22,
}

def verify():
    errors = []

    if not JSON_PATH.exists():
        errors.append(f"Missing JSON file: {JSON_PATH}")
        return errors

    if not JS_PATH.exists():
        errors.append(f"Missing JS file: {JS_PATH}")
        return errors

    # Check JS prefix and syntax
    js_text = JS_PATH.read_text(encoding="utf-8")
    if "window.__VISUAL_MORPH_REGISTRY_G2__" not in js_text:
        errors.append("JS file does not define window.__VISUAL_MORPH_REGISTRY_G2__")

    try:
        data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    except Exception as e:
        errors.append(f"Invalid JSON in {JSON_PATH}: {e}")
        return errors

    if len(data) != 176:
        errors.append(f"Expected 176 items in registry, got {len(data)}")

    type_counts = {}
    for qid, item in data.items():
        itype = item.get("type")
        formula = item.get("formula")
        params = item.get("params")

        if not itype or not formula or not isinstance(params, dict):
            errors.append(f"{qid}: missing required fields (type, formula, params)")
            continue

        type_counts[itype] = type_counts.get(itype, 0) + 1

        # Check math consistency
        if itype == "mul_group":
            each_c = params.get("each_count", 0)
            group_c = params.get("group_count", 0)
            total = params.get("total", 0)
            if each_c * group_c != total or total <= 0:
                errors.append(f"{qid}: mul_group math invalid {each_c} * {group_c} != {total}")

        elif itype == "mul_table":
            a = params.get("a", 0)
            b = params.get("b", 0)
            prod = params.get("product", 0)
            if a * b != prod or prod <= 0:
                errors.append(f"{qid}: mul_table math invalid {a} * {b} != {prod}")

        elif itype == "mul_rotate":
            r = params.get("rows", 0)
            c = params.get("cols", 0)
            tot = params.get("total", 0)
            if r * c != tot or tot <= 0:
                errors.append(f"{qid}: mul_rotate math invalid {r} * {c} != {tot}")

        elif itype == "fair_share":
            per_g = params.get("per_group", 0)
            grp_c = params.get("group_count", 0)
            tot = params.get("total", 0)
            if per_g * grp_c != tot or tot <= 0:
                errors.append(f"{qid}: fair_share math invalid {per_g} * {grp_c} != {tot}")

        elif itype == "block_add":
            a = params.get("a", 0)
            b = params.get("b", 0)
            s = params.get("sum", 0)
            if a + b != s or s <= 0:
                errors.append(f"{qid}: block_add math invalid {a} + {b} != {s}")

        elif itype == "block_sub":
            a = params.get("a", 0)
            b = params.get("b", 0)
            d = params.get("diff", 0)
            if a - b != d or a <= 0:
                errors.append(f"{qid}: block_sub math invalid {a} - {b} != {d}")

        elif itype == "ruler_jump":
            s = params.get("start_cm", 0)
            e = params.get("end_cm", 0)
            l = params.get("length_cm", 0)
            if e - s != l or l <= 0:
                errors.append(f"{qid}: ruler_jump math invalid {e} - {s} != {l}")

        elif itype == "shape_superposition":
            ca = params.get("count_a", 0)
            cb = params.get("count_b", 0)
            if ca <= 0 or cb <= 0:
                errors.append(f"{qid}: shape_superposition count invalid ({ca}, {cb})")

    for etype, exp_count in EXPECTED_TYPES.items():
        actual = type_counts.get(etype, 0)
        if actual != exp_count:
            errors.append(f"Type '{etype}': expected {exp_count}, got {actual}")

    return errors

def main():
    errors = verify()
    if errors:
        print("[FAIL] 3B1B Visual Morph Guardrail Failed:")
        for e in errors:
            print("  - " + e)
        sys.exit(1)

    print("[PASS] 3B1B G2 Visual Morph Guardrail: 176 questions mathematically verified.")
    print("  - mul_group: 22")
    print("  - mul_table: 22")
    print("  - mul_rotate: 22")
    print("  - fair_share: 22")
    print("  - block_add: 22")
    print("  - block_sub: 22")
    print("  - ruler_jump: 22")
    print("  - shape_superposition: 22")
    sys.exit(0)

if __name__ == "__main__":
    main()

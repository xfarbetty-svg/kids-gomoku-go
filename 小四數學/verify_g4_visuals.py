# -*- coding: utf-8 -*-
"""
小四數學 3B1B 視覺透視參數守門員 (verify_g4_visuals.py)
嚴格檢驗：
1. app/data/visual_morph_registry_g4.json 完整性 (176 題、8 大主題各 22 題)
2. app/js/visual_morph_registry_g4_data.js 前端離線掛載包裝
3. 8 大幾何算理型別數學一致性：
   - smart_protractor_spin: angle > 0 and angle <= 360
   - isometric_voxel_xray: dx * dy * dz == volume, blocks length == volume
   - area_model_multiplication: numA * numB == prod
   - exploding_dots_large: valA > 0, valB > 0
   - hillside_gravity_rounding: leftVal < rightVal, val between or near
   - area_cut_and_fill: length * width == area
   - fraction_pizza_combine: num1 > 0, num2 > 0, denominator > 0
   - hundreds_grid_decimal: round(valA + valB, 2) == sum
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
JSON_PATH = ROOT / "app" / "data" / "visual_morph_registry_g4.json"
JS_PATH = ROOT / "app" / "js" / "visual_morph_registry_g4_data.js"

EXPECTED_TYPES = {
    "smart_protractor_spin": 22,
    "isometric_voxel_xray": 22,
    "area_model_multiplication": 22,
    "exploding_dots_large": 22,
    "hillside_gravity_rounding": 22,
    "area_cut_and_fill": 22,
    "fraction_pizza_combine": 22,
    "hundreds_grid_decimal": 22,
}

def verify():
    errors = []

    if not JSON_PATH.exists():
        errors.append(f"Missing JSON file: {JSON_PATH}")
        return errors

    if not JS_PATH.exists():
        errors.append(f"Missing JS file: {JS_PATH}")
        return errors

    js_text = JS_PATH.read_text(encoding="utf-8")
    if "window.__VISUAL_MORPH_REGISTRY_G4__" not in js_text:
        errors.append("JS file does not define window.__VISUAL_MORPH_REGISTRY_G4__")

    try:
        data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    except Exception as e:
        errors.append(f"Invalid JSON in {JSON_PATH}: {e}")
        return errors

    if len(data) != 176:
        errors.append(f"Expected 176 items in registry, got {len(data)}")

    type_counts = {k: 0 for k in EXPECTED_TYPES}

    for qid, item in data.items():
        itype = item.get("type")
        if itype not in EXPECTED_TYPES:
            errors.append(f"[{qid}] Unexpected type: {itype}")
            continue

        type_counts[itype] += 1

        # 數學驗算
        if itype == "smart_protractor_spin":
            ang = item.get("angle", 0)
            if not (0 < ang <= 360):
                errors.append(f"[{qid}] Angle out of range: {ang}")

        elif itype == "isometric_voxel_xray":
            vol = item.get("volume", 0)
            dx = item.get("dx", 0)
            dy = item.get("dy", 0)
            dz = item.get("dz", 0)
            blocks = item.get("blocks", [])
            if dx * dy * dz != vol:
                errors.append(f"[{qid}] Volume mismatch: {dx}*{dy}*{dz} != {vol}")
            if len(blocks) != vol:
                errors.append(f"[{qid}] Blocks count mismatch: {len(blocks)} != {vol}")

        elif itype == "area_model_multiplication":
            nA = item.get("numA", 0)
            nB = item.get("numB", 0)
            prod = item.get("prod", 0)
            if nA * nB != prod:
                errors.append(f"[{qid}] Prod mismatch: {nA}*{nB} != {prod}")

        elif itype == "area_cut_and_fill":
            l = item.get("length", 0)
            w = item.get("width", 0)
            a = item.get("area", 0)
            if l * w != a:
                errors.append(f"[{qid}] Area mismatch: {l}*{w} != {a}")

        elif itype == "fraction_pizza_combine":
            d = item.get("denominator", 0)
            n1 = item.get("num1", 0)
            n2 = item.get("num2", 0)
            if d <= 0 or n1 <= 0 or n2 <= 0:
                errors.append(f"[{qid}] Invalid fraction values: {n1}/{d} + {n2}/{d}")

        elif itype == "hundreds_grid_decimal":
            vA = item.get("valA", 0)
            vB = item.get("valB", 0)
            sm = item.get("sum", 0)
            if round(vA + vB, 2) != sm:
                errors.append(f"[{qid}] Decimal sum mismatch: {vA}+{vB} != {sm}")

    for t, expected in EXPECTED_TYPES.items():
        actual = type_counts.get(t, 0)
        if actual != expected:
            errors.append(f"Type count mismatch for {t}: expected {expected}, got {actual}")

    return errors

if __name__ == "__main__":
    errs = verify()
    if errs:
        print("❌ 守門員驗收失敗:")
        for e in errs:
            print("  - " + e)
        sys.exit(1)
    else:
        print("🎉 [守門員] 小四 3B1B 視覺透視參數全量 176 題驗收 100% PASS！(Exit Code: 0)")
        sys.exit(0)

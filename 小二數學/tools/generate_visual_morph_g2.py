#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Generate 3B1B Visual Morph Registry for Grade 2 Math (小二數學).
Targets 8 kingdoms in app/rpg_world_map.json:
1. g2-08: mul_group (乘法小屋)
2. g2-09: mul_table (九九乘法)
3. g2-24: mul_rotate (排列乘法)
4. g2-10: fair_share (分裝平分)
5. g2-04: block_add (二位數加法)
6. g2-05: block_sub (二位數減法)
7. g2-19: ruler_jump (直尺線段)
8. g2-20: shape_superposition (圖形大小)

Outputs:
- app/data/visual_morph_registry_g2.json
- app/js/visual_morph_registry_g2_data.js
"""

import json
import os
import re
import sys
import tempfile

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


TARGET_KINGDOMS = [
    "g2-08",
    "g2-09",
    "g2-24",
    "g2-10",
    "g2-04",
    "g2-05",
    "g2-19",
    "g2-20",
]


def atomic_write(filepath, content, mode="w", encoding="utf-8"):
    """Atomically write content to file using tempfile.mkstemp."""
    dir_name = os.path.dirname(filepath)
    os.makedirs(dir_name, exist_ok=True)
    fd, tmp_path = tempfile.mkstemp(dir=dir_name, prefix="tmp_morph_", suffix=".tmp")
    try:
        with open(fd, mode, encoding=encoding) as f:
            f.write(content)
        os.replace(tmp_path, filepath)
    except Exception as e:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass
        raise RuntimeError(f"Atomic write to {filepath} failed: {e}") from e


def parse_mul_group(qid, q_text, math_text, v_data, ans):
    """
    g2-08: mul_group (乘法小屋)
    formula: "3 顆 × 3 盒 ＝ 9 顆"
    params: { "each_count": 3, "group_count": 3, "total": 9, "item_name": "顆球" }
    """
    q_match = re.search(r"每盒有\s*(\d+)\s*顆球[，,]\s*(\d+)\s*盒", q_text)
    m_match = re.search(r"(\d+)\s*[×x*]\s*(\d+)", math_text)
    if q_match:
        each_c = int(q_match.group(1))
        grp_c = int(q_match.group(2))
    elif m_match:
        each_c = int(m_match.group(1))
        grp_c = int(m_match.group(2))
    else:
        raise ValueError(f"[{qid}] Unable to parse mul_group: Q='{q_text}', M='{math_text}'")

    tot = each_c * grp_c
    return {
        "type": "mul_group",
        "params": {
            "each_count": each_c,
            "group_count": grp_c,
            "total": tot,
            "item_name": "顆球",
        },
        "formula": f"{each_c} 顆 × {grp_c} 盒 ＝ {tot} 顆",
    }


def parse_mul_table(qid, q_text, math_text, v_data, ans):
    """
    g2-09: mul_table (九九乘法)
    formula: "2 × 2 ＝ 4"
    params: { "a": 2, "b": 2, "product": 4 }
    """
    m_match = re.search(r"(\d+)\s*[×x*]\s*(\d+)", math_text)
    if not m_match:
        m_match = re.search(r"(\d+)\s*[×x*]\s*(\d+)", q_text)
    if not m_match:
        raise ValueError(f"[{qid}] Unable to parse mul_table: Q='{q_text}', M='{math_text}'")

    a = int(m_match.group(1))
    b = int(m_match.group(2))
    prod = a * b
    return {
        "type": "mul_table",
        "params": {"a": a, "b": b, "product": prod},
        "formula": f"{a} × {b} ＝ {prod}",
    }


def parse_mul_rotate(qid, q_text, math_text, v_data, ans):
    """
    g2-24: mul_rotate (排列乘法)
    formula: "3 排 × 3 個 ＝ 9 (旋轉 90°: 3 個 × 3 排)"
    params: { "rows": 3, "cols": 3, "total": 9 }
    """
    q_match = re.search(r"點陣有\s*(\d+)\s*排[，,]\s*每排\s*(\d+)\s*個", q_text)
    m_match = re.search(r"(\d+)\s*[×x*]\s*(\d+)", math_text)
    if q_match:
        rows = int(q_match.group(1))
        cols = int(q_match.group(2))
    elif m_match:
        rows = int(m_match.group(1))
        cols = int(m_match.group(2))
    else:
        raise ValueError(f"[{qid}] Unable to parse mul_rotate: Q='{q_text}', M='{math_text}'")

    tot = rows * cols
    return {
        "type": "mul_rotate",
        "params": {"rows": rows, "cols": cols, "total": tot},
        "formula": f"{rows} 排 × {cols} 個 ＝ {tot} (旋轉 90°: {cols} 個 × {rows} 排)",
    }


def parse_fair_share(qid, q_text, math_text, v_data, ans):
    """
    g2-10: fair_share (分裝平分)
    formula: "9 顆每 3 顆一袋 ➔ 3 袋"
    params: { "total": 9, "per_group": 3, "group_count": 3, "item_name": "糖果" }
    """
    q_match = re.search(r"有\s*(\d+)\s*顆糖[，,]\s*每\s*(\d+)\s*顆裝一袋", q_text)
    m_match = re.search(r"(\d+)\s*＋\s*(\d+).*＝\s*(\d+)", math_text)
    if q_match:
        tot = int(q_match.group(1))
        per_g = int(q_match.group(2))
        grp_c = tot // per_g
    elif m_match:
        per_g = int(m_match.group(1))
        tot = int(m_match.group(3))
        grp_c = tot // per_g
    else:
        raise ValueError(f"[{qid}] Unable to parse fair_share: Q='{q_text}', M='{math_text}'")

    return {
        "type": "fair_share",
        "params": {
            "total": tot,
            "per_group": per_g,
            "group_count": grp_c,
            "item_name": "糖果",
        },
        "formula": f"{tot} 顆每 {per_g} 顆一袋 ➔ {grp_c} 袋",
    }


def parse_block_add(qid, q_text, math_text, v_data, ans):
    """
    g2-04: block_add (二位數加法)
    formula: "21 ＋ 19 ＝ 40 (個位滿10進位)"
    params: { "a": 21, "b": 19, "sum": 40, "carry": true }
    """
    m_match = re.search(r"(\d+)\s*[＋+]\s*(\d+)", math_text)
    if not m_match:
        m_match = re.search(r"(\d+)\s*[＋+]\s*(\d+)", q_text)
    if not m_match:
        raise ValueError(f"[{qid}] Unable to parse block_add: Q='{q_text}', M='{math_text}'")

    a = int(m_match.group(1))
    b = int(m_match.group(2))
    s = a + b
    carry = ((a % 10) + (b % 10)) >= 10
    carry_note = " (個位滿10進位)" if carry else ""
    return {
        "type": "block_add",
        "params": {"a": a, "b": b, "sum": s, "carry": carry},
        "formula": f"{a} ＋ {b} ＝ {s}{carry_note}",
    }


def parse_block_sub(qid, q_text, math_text, v_data, ans):
    """
    g2-05: block_sub (二位數減法)
    formula: "71 － 20 ＝ 51"
    params: { "a": 71, "b": 20, "diff": 51, "borrow": false }
    """
    m_match = re.search(r"(\d+)\s*[－-]\s*(\d+)", math_text)
    if not m_match:
        m_match = re.search(r"(\d+)\s*[－-]\s*(\d+)", q_text)
    if not m_match:
        raise ValueError(f"[{qid}] Unable to parse block_sub: Q='{q_text}', M='{math_text}'")

    a = int(m_match.group(1))
    b = int(m_match.group(2))
    diff = a - b
    borrow = (a % 10) < (b % 10)
    borrow_note = " (十位借1退位)" if borrow else ""
    return {
        "type": "block_sub",
        "params": {"a": a, "b": b, "diff": diff, "borrow": borrow},
        "formula": f"{a} － {b} ＝ {diff}{borrow_note}",
    }


def parse_ruler_jump(qid, q_text, math_text, v_data, ans):
    """
    g2-19: ruler_jump (直尺線段)
    formula: "刻度 1 到 5 ➔ 5 － 1 ＝ 4 公分"
    params: { "start_cm": 1, "end_cm": 5, "length_cm": 4 }
    """
    start_cm = v_data.get("ruler_start_cm")
    end_cm = v_data.get("ruler_end_cm")
    if start_cm is None or end_cm is None:
        q_match = re.search(r"從\s*(\d+)\s*公分到\s*(\d+)\s*公分", q_text)
        if q_match:
            start_cm = int(q_match.group(1))
            end_cm = int(q_match.group(2))
        else:
            m_match = re.search(r"(\d+)\s*[－-]\s*(\d+)", math_text)
            if m_match:
                end_cm = int(m_match.group(1))
                start_cm = int(m_match.group(2))
    if start_cm is None or end_cm is None:
        raise ValueError(f"[{qid}] Unable to parse ruler_jump: Q='{q_text}', V={v_data}")

    length_cm = end_cm - start_cm
    return {
        "type": "ruler_jump",
        "params": {
            "start_cm": start_cm,
            "end_cm": end_cm,
            "length_cm": length_cm,
        },
        "formula": f"刻度 {start_cm} 到 {end_cm} ➔ {end_cm} － {start_cm} ＝ {length_cm} 公分",
    }


def parse_shape_superposition(qid, q_text, math_text, v_data, ans):
    """
    g2-20: shape_superposition (圖形大小)
    formula: "甲圖(3塊) vs 乙圖(4塊) ➔ 乙圖大"
    params: { "count_a": 3, "count_b": 4, "unit": "小正方形", "larger": "乙" }
    """
    count_a = v_data.get("甲")
    count_b = v_data.get("乙")
    if count_a is None or count_b is None:
        q_match = re.search(r"甲圖有\s*(\d+)\s*個.*乙圖有\s*(\d+)\s*個", q_text)
        if q_match:
            count_a = int(q_match.group(1))
            count_b = int(q_match.group(2))
        else:
            m_match = re.search(r"比較\s*(\d+)\s*和\s*(\d+)", math_text)
            if m_match:
                count_a = int(m_match.group(1))
                count_b = int(m_match.group(2))
    if count_a is None or count_b is None:
        raise ValueError(f"[{qid}] Unable to parse shape_superposition: Q='{q_text}', V={v_data}")

    if count_a > count_b:
        larger = "甲"
        formula = f"甲圖({count_a}塊) vs 乙圖({count_b}塊) ➔ 甲圖大"
    elif count_b > count_a:
        larger = "乙"
        formula = f"甲圖({count_a}塊) vs 乙圖({count_b}塊) ➔ 乙圖大"
    else:
        larger = "一樣大"
        formula = f"甲圖({count_a}塊) vs 乙圖({count_b}塊) ➔ 一樣大"

    return {
        "type": "shape_superposition",
        "params": {
            "count_a": count_a,
            "count_b": count_b,
            "unit": "小正方形",
            "larger": larger,
        },
        "formula": formula,
    }


PARSER_MAP = {
    "g2-08": parse_mul_group,
    "g2-09": parse_mul_table,
    "g2-24": parse_mul_rotate,
    "g2-10": parse_fair_share,
    "g2-04": parse_block_add,
    "g2-05": parse_block_sub,
    "g2-19": parse_ruler_jump,
    "g2-20": parse_shape_superposition,
}


def generate_registry(world_map_path):
    if not os.path.exists(world_map_path):
        raise FileNotFoundError(f"Cannot find world map at: {world_map_path}")

    with open(world_map_path, "r", encoding="utf-8") as f:
        world_data = json.load(f)

    registry = {}
    kingdom_counts = {}

    for k in world_data:
        theme_id = k.get("theme_id")
        if theme_id not in TARGET_KINGDOMS:
            continue

        parser = PARSER_MAP.get(theme_id)
        if not parser:
            raise KeyError(f"No parser registered for theme: {theme_id}")

        monsters = k.get("monsters", [])
        kingdom_counts[theme_id] = len(monsters)

        for m in monsters:
            qid = m["id"]
            q_text = m.get("question", "")
            math_text = m.get("math", "")
            v_data = m.get("visual_data") or {}
            ans = m.get("answer", "")

            entry = parser(qid, q_text, math_text, v_data, ans)
            registry[qid] = entry

    return registry, kingdom_counts


def validate_registry(registry, kingdom_counts):
    expected_total = len(TARGET_KINGDOMS) * 22
    actual_total = len(registry)
    if actual_total != expected_total:
        raise ValueError(
            f"Validation failed: expected {expected_total} questions, got {actual_total}"
        )

    for tid in TARGET_KINGDOMS:
        cnt = kingdom_counts.get(tid, 0)
        if cnt != 22:
            raise ValueError(f"Theme {tid} has {cnt} questions, expected 22")

    for qid, entry in registry.items():
        if "type" not in entry or not entry["type"]:
            raise ValueError(f"Missing 'type' in {qid}")
        if "params" not in entry or not isinstance(entry["params"], dict):
            raise ValueError(f"Missing or invalid 'params' in {qid}")
        if "formula" not in entry or not entry["formula"]:
            raise ValueError(f"Missing 'formula' in {qid}")
        for k, v in entry["params"].items():
            if v is None:
                raise ValueError(f"Null parameter '{k}' in {qid}")

    print("🛡️ All validation checks passed (176/176 items validated).")


def main():
    print("🚀 Starting Grade 2 Visual Morph Registry generator...")
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    world_map_path = os.path.join(base_dir, "app", "rpg_world_map.json")
    out_json = os.path.join(base_dir, "app", "data", "visual_morph_registry_g2.json")
    out_js = os.path.join(base_dir, "app", "js", "visual_morph_registry_g2_data.js")

    print(f"Reading world map: {world_map_path}")
    registry, kingdom_counts = generate_registry(world_map_path)

    for tid in TARGET_KINGDOMS:
        print(f"  - {tid}: {kingdom_counts.get(tid, 0)} questions processed")

    validate_registry(registry, kingdom_counts)

    # 1. Output JSON
    json_str = json.dumps(registry, ensure_ascii=False, indent=2) + "\n"
    atomic_write(out_json, json_str)
    print(f"✅ Generated JSON: {out_json} ({len(registry)} items)")

    # 2. Output JS Data
    js_content = f"window.__VISUAL_MORPH_REGISTRY_G2__ = {json.dumps(registry, ensure_ascii=False)};\n"
    atomic_write(out_js, js_content)
    print(f"✅ Generated JS Data: {out_js}")

    # 3. Post-write verification
    with open(out_json, "r", encoding="utf-8") as f:
        re_json = json.load(f)
    if len(re_json) != 176:
        raise ValueError(f"Post-write verify failed: JSON item count {len(re_json)} != 176")

    with open(out_js, "r", encoding="utf-8") as f:
        re_js = f.read().strip()
    prefix = "window.__VISUAL_MORPH_REGISTRY_G2__ = "
    if not re_js.startswith(prefix) or not re_js.endswith(";"):
        raise ValueError("Post-write verify failed: JS file prefix or suffix mismatch")
    js_json_part = re_js[len(prefix) : -1]
    re_parsed = json.loads(js_json_part)
    if len(re_parsed) != 176:
        raise ValueError(f"Post-write verify failed: JS parsed item count {len(re_parsed)} != 176")

    print("🎉 All outputs generated and verified successfully! Exit 0.")
    sys.exit(0)


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        print(f"❌ Error generating visual morph registry: {err}", file=sys.stderr)
        sys.exit(1)

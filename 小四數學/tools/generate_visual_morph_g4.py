#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Generate 3B1B Visual Morph Registry for Grade 4 Math (小四數學).
Targets 8 kingdoms in app/rpg_world_map.json (22 questions each, total 176 items):
1. t15: smart_protractor_spin (角度與量角器星際站)
2. t14: isometric_voxel_xray (立方公分積木體積島)
3. t05: area_model_multiplication (三位數乘兩位數直式工坊)
4. t01: exploding_dots_large (一億以內大數神殿)
5. t10: hillside_gravity_rounding (四捨五入概數天文台)
6. t21: area_cut_and_fill (平方公尺與長方形面積工廠)
7. t12: fraction_pizza_combine (真假帶分數烘焙城堡)
8. t16: hundreds_grid_decimal (二位小數百分位溪流)

Outputs:
- app/data/visual_morph_registry_g4.json
- app/js/visual_morph_registry_g4_data.js
"""

import json
import os
import re
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

TARGET_KINGDOMS = [
    "t15", "t14", "t05", "t01",
    "t10", "t21", "t12", "t16"
]

def atomic_write(filepath, content, encoding="utf-8"):
    dir_name = os.path.dirname(filepath)
    os.makedirs(dir_name, exist_ok=True)
    fd, tmp_path = tempfile.mkstemp(dir=dir_name, prefix="tmp_morph_g4_", suffix=".tmp")
    try:
        with open(fd, "w", encoding=encoding) as f:
            f.write(content)
        os.replace(tmp_path, filepath)
    except Exception as e:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass
        raise RuntimeError(f"Atomic write to {filepath} failed: {e}") from e

def parse_t15_protractor(m):
    # t15: 角度與量角器星際站
    # Math: "60° + 60° = ？ 度"
    q_text = m.get("question", "")
    math_text = m.get("math", "")
    deg_matches = re.findall(r"(\d+)\s*°", math_text + " " + q_text)
    if deg_matches:
        angles = [int(x) for x in deg_matches]
        total_angle = sum(angles[:2]) if len(angles) >= 2 else angles[0]
    else:
        total_angle = 90

    total_angle = min(360, max(15, total_angle))
    return {
        "type": "smart_protractor_spin",
        "title": m.get("name", "角度與量角器"),
        "angle": total_angle,
        "direction": "cw" if "順時針" in q_text else "ccw",
        "tag": "t15 📐 角度與量角器星際站"
    }

def parse_t14_voxel(m):
    # t14: 立方公分積木體積島
    # Math: "2 × 2 × 3 = ？ 立方公分" 或 "長 2 cm、寬 2 cm、高 3 cm"
    q_text = m.get("question", "")
    math_text = m.get("math", "")
    dim_match = re.search(r"(\d+)\s*[×x*]\s*(\d+)\s*[×x*]\s*(\d+)", math_text + " " + q_text)
    if dim_match:
        dx, dy, dz = int(dim_match.group(1)), int(dim_match.group(2)), int(dim_match.group(3))
    else:
        dx, dy, dz = 2, 2, 2

    # 限制方塊最大邊長在 4 內以利手機顯示
    dx = min(4, max(1, dx))
    dy = min(4, max(1, dy))
    dz = min(4, max(1, dz))

    blocks = []
    for z in range(dz):
        for y in range(dy):
            for x in range(dx):
                blocks.append({"x": x, "y": y, "z": z})

    return {
        "type": "isometric_voxel_xray",
        "title": m.get("name", "立方公分積木"),
        "dx": dx, "dy": dy, "dz": dz,
        "volume": dx * dy * dz,
        "blocks": blocks,
        "tag": "t14 🧊 立方公分積木體積島"
    }

def parse_t05_area_model(m):
    # t05: 三位數乘兩位數直式工坊
    # Math: "269 × 34 = ？ 個"
    q_text = m.get("question", "")
    math_text = m.get("math", "")
    mul_match = re.search(r"(\d{2,3})\s*[×x*]\s*(\d{2})", math_text + " " + q_text)
    if mul_match:
        numA = int(mul_match.group(1))
        numB = int(mul_match.group(2))
    else:
        numA = 246
        numB = 34

    return {
        "type": "area_model_multiplication",
        "title": m.get("name", "乘法矩陣面積模型"),
        "numA": numA,
        "numB": numB,
        "prod": numA * numB,
        "tag": "t05 ⚒️ 三位數乘兩位數直式工坊"
    }

def parse_t01_exploding_dots(m):
    # t01: 一億以內大數神殿
    # Math: "736100 + 270000 = ？ 元"
    q_text = m.get("question", "")
    math_text = m.get("math", "")
    add_match = re.search(r"(\d+)\s*\+\s*(\d+)", math_text + " " + q_text)
    if add_match:
        valA = int(add_match.group(1))
        valB = int(add_match.group(2))
    else:
        valA = 500000
        valB = 250000

    return {
        "type": "exploding_dots_large",
        "title": m.get("name", "一億以內大數爆裂點"),
        "valA": valA,
        "valB": valB,
        "tag": "t01 🌌 一億以內大數神殿"
    }

def parse_t10_rounding(m):
    # t10: 四捨五入概數天文台
    # Math: "36183 ≈ ？ (千位四捨五入)"
    q_text = m.get("question", "")
    math_text = m.get("math", "")
    num_match = re.search(r"(\d{4,6})", math_text + " " + q_text)
    if num_match:
        val = int(num_match.group(1))
    else:
        val = 36400

    # 基準為萬位或千位
    step = 10000 if val >= 10000 else 1000
    leftVal = (val // step) * step
    rightVal = leftVal + step

    return {
        "type": "hillside_gravity_rounding",
        "title": m.get("name", "四捨五入重力滾球"),
        "val": val,
        "leftVal": leftVal,
        "rightVal": rightVal,
        "tag": "t10 🔭 四捨五入概數天文台"
    }

def parse_t21_area(m):
    # t21: 平方公尺與長方形面積工廠
    # Math: "22 × 14 = ？ 平方公尺" 或 "長 22 公尺，寬 14 公尺"
    q_text = m.get("question", "")
    math_text = m.get("math", "")
    mul_match = re.search(r"(\d+)\s*[×x*]\s*(\d+)", math_text + " " + q_text)
    if mul_match:
        lenA = int(mul_match.group(1))
        lenB = int(mul_match.group(2))
    else:
        lenA, lenB = 20, 15

    return {
        "type": "area_cut_and_fill",
        "title": m.get("name", "長方形面積展開"),
        "length": lenA,
        "width": lenB,
        "area": lenA * lenB,
        "tag": "t21 🏭 平方公尺與長方形面積工廠"
    }

def parse_t12_fraction(m):
    # t12: 真假帶分數烘焙城堡
    # Math: "2/6 + 2/6 = ？ 塊"
    q_text = m.get("question", "")
    math_text = m.get("math", "")
    f_match = re.search(r"(\d+)/(\d+)\s*\+\s*(\d+)/(\d+)", math_text + " " + q_text)
    if f_match:
        n1 = int(f_match.group(1))
        d1 = int(f_match.group(2))
        n2 = int(f_match.group(3))
        den = d1
    else:
        n1, n2, den = 2, 2, 6

    return {
        "type": "fraction_pizza_combine",
        "title": m.get("name", "分數披薩扇形合體"),
        "num1": n1,
        "num2": n2,
        "denominator": den,
        "tag": "t12 🍰 真假帶分數烘焙城堡"
    }

def parse_t16_decimal(m):
    # t16: 二位小數百分位溪流
    # Math: "3.02 + 2.6 = ？ 公升"
    q_text = m.get("question", "")
    math_text = m.get("math", "")
    d_match = re.search(r"(\d+\.\d+)\s*\+\s*(\d+\.\d+)", math_text + " " + q_text)
    if d_match:
        valA = float(d_match.group(1))
        valB = float(d_match.group(2))
    else:
        valA, valB = 3.02, 2.6

    return {
        "type": "hundreds_grid_decimal",
        "title": m.get("name", "二位小數百格板"),
        "valA": valA,
        "valB": valB,
        "sum": round(valA + valB, 2),
        "tag": "t16 💧 二位小數百分位溪流"
    }

PARSERS = {
    "t15": parse_t15_protractor,
    "t14": parse_t14_voxel,
    "t05": parse_t05_area_model,
    "t01": parse_t01_exploding_dots,
    "t10": parse_t10_rounding,
    "t21": parse_t21_area,
    "t12": parse_t12_fraction,
    "t16": parse_t16_decimal,
}

def main():
    map_path = ROOT / "app" / "rpg_world_map.json"
    if not map_path.exists():
        print(f"❌ 找不到 rpg_world_map.json: {map_path}")
        sys.exit(1)

    world_map = json.loads(map_path.read_text(encoding="utf-8"))
    registry = {}

    for k in world_map:
        tid = k.get("theme_id")
        if tid not in TARGET_KINGDOMS:
            continue

        parser = PARSERS[tid]
        monsters = k.get("monsters", [])
        for m in monsters:
            qid = m.get("id")
            if not qid:
                continue
            entry = parser(m)
            entry["qid"] = qid
            entry["question_text"] = m.get("question", "")
            registry[qid] = entry

    print(f"✅ 成功解析 {len(registry)} 題小四 3B1B 視覺模型 (涵蓋 8 大王國)")

    # 輸出 JSON
    json_path = ROOT / "app" / "data" / "visual_morph_registry_g4.json"
    json_content = json.dumps(registry, ensure_ascii=False, indent=2)
    atomic_write(json_path, json_content)
    print(f"📁 JSON 產出: {json_path}")

    # 輸出 JS (離線相容版本)
    js_path = ROOT / "app" / "js" / "visual_morph_registry_g4_data.js"
    js_content = f"window.__VISUAL_MORPH_REGISTRY_G4__ = {json.dumps(registry, ensure_ascii=False)};\n"
    atomic_write(js_path, js_content)
    print(f"📁 JS 產出: {js_path}")

if __name__ == "__main__":
    main()

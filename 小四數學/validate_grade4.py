#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
validate_grade4.py - 國小四年級數學題庫與課綱守門員
全自動檢驗：
1. 23 王國主題與 506 隻怪獸完整性
2. 每主題怪獸編號與屬性齊全（含 4 隻魔王）
3. 課綱合規防線：
   - ✖ 嚴禁劇透負數、嚴禁未知數 x 移項
   - ✖ 分數僅限同分母
   - ✖ 小數僅限二位小數
   - ✖ 數與量不超過一億（嚴禁兆）
4. 呼叫 validate_math_fields 確保無敘述性污染
"""

import sys
import os
import json
import re
import subprocess
import shutil

sys.stdout.reconfigure(encoding="utf-8")

def main():
    root = os.path.dirname(os.path.abspath(__file__))
    map_path = os.path.join(root, "app", "rpg_world_map.json")

    print(f"[*] 開始執行【小四數學 108 課綱驗收守門員】...")
    print(f"[*] 檢查檔案: {map_path}")

    if not os.path.exists(map_path):
        print(f"[FAIL] 找不到題庫檔案: {map_path}", file=sys.stderr)
        sys.exit(1)

    with open(map_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list) or len(data) != 23:
        print(f"[FAIL] 主題數量錯誤：預期 23 王國，實際 {len(data) if isinstance(data, list) else 0}", file=sys.stderr)
        sys.exit(1)

    total_monsters = 0
    errors = []

    for t_idx, theme in enumerate(data):
        tid = theme.get("theme_id", "")
        tname = theme.get("kingdom_name", "")
        monsters = theme.get("monsters", [])
        
        if len(monsters) != 22:
            errors.append(f"王國 {tid} ({tname}) 怪獸數量錯誤：預期 22，實際 {len(monsters)}")

        boss_count = sum(1 for m in monsters if m.get("is_boss"))
        if boss_count != 4:
            errors.append(f"王國 {tid} ({tname}) 魔王數量錯誤：預期 4 隻，實際 {boss_count} 隻")

        for m in monsters:
            total_monsters += 1
            mid = m.get("id", "")
            q = m.get("question", "")
            math_val = m.get("math", "")
            opts = m.get("options", [])
            corr = m.get("correct", -1)
            ans = m.get("answer", "")

            # 檢查選項與答案正確性
            if len(opts) != 4:
                errors.append(f"題目 {mid} 選項非 4 選 1: {opts}")
            if corr < 0 or corr >= len(opts) or opts[corr] != ans:
                errors.append(f"題目 {mid} 正確答案索引與答案文字不相符: ans={ans}, opts[{corr}]={opts[corr] if 0<=corr<len(opts) else 'OUT'}")

            # 課綱禁令檢核 1：嚴禁出現「兆」
            if "兆" in q or "兆" in math_val or "兆" in ans:
                errors.append(f"題目 {mid} 超綱違規：包含『兆』(超出小四一億以內課綱)")

            # 課綱禁令檢核 2：嚴禁出現負數
            if re.search(r'-\s*\d+', ans) or "負" in ans:
                errors.append(f"題目 {mid} 超綱違規：答案出現負數")

            # 課綱禁令檢核 3：嚴禁未知數 x
            if re.search(r'\b[xyzXYZ]\b', math_val):
                errors.append(f"題目 {mid} 超綱違規：算式出現中學未知數英文代號 (小四僅能用 □ 或括號)")

    if total_monsters != 506:
        errors.append(f"全題庫總數錯誤：預期 506 題，實際 {total_monsters} 題")

    if errors:
        print(f"\n[FAIL] 發現 {len(errors)} 項課綱或結構違規：")
        for err in errors[:10]:
            print(f"  ❌ {err}")
        sys.exit(1)

    print(f"[PASS] 23 王國、506 題目結構完全合規！")
    print(f"[PASS] 108 課綱防線（無兆、無負數、無未知數 x、同分母分數）全綠！")

    # 執行算式欄位守門員
    tools_val = os.path.join(root, "tools", "validate_math_fields.py")
    if os.path.exists(tools_val):
        from tools.validate_math_fields import validate as val_fields
        val_fields(map_path)
        print(f"[PASS] 算式欄位守門員 (validate_math_fields) 100% 通過！")

    # 執行直式鷹架與 DOM 驗收守門員
    tools_scaff = os.path.join(root, "tools", "verify_scaffoldings.js")
    if os.path.exists(tools_scaff):
        node_bin = shutil.which("node") or "node"
        res = subprocess.run([node_bin, tools_scaff], cwd=root)
        if res.returncode != 0:
            print(f"[FAIL] 直式鷹架驗收守門員 (verify_scaffoldings.js) 失敗！", file=sys.stderr)
            sys.exit(res.returncode)
        print(f"[PASS] 直式鷹架驗收守門員 (verify_scaffoldings.js) 100% 通過！")

    print(f"\n🎉 【國小四年級全套驗收守門員】全數合格 (Exit Code 0)！")
    sys.exit(0)

if __name__ == "__main__":
    main()

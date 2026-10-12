#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
validate_math_fields.py - 守門員：檢驗題庫中所有怪獸的 math 欄位合規性
嚴格防止資料生成管線或編輯將中文題目敘述填入 math 欄位。
若發現敘述性 math，印出違規題目並以 exit code 1 失敗熔斷。
"""

import sys
import os
import json
import re

# 規則 1: 敘述性題目特徵 (Narrative)
# 開頭不是數字或括號，且包含 6 個以上中文字；或包含典型圖形/純敘述特徵詞
NARRATIVE_PATTERNS = [
    r'面積是多少',
    r'面積是？',
    r'合起來是？',
    r'拼成花紋',
    r'哪一個比較',
    r'可以記成多少',
]

def is_narrative_math(math_str):
    if not math_str:
        return False  # 概念題 math 為空字串，允許
    s = str(math_str).strip()
    if not s:
        return False
    
    starts_valid = bool(re.match(r'^[0-9（(]', s))
    cjk_chars = len(re.findall(r'[\u4e00-\u9fff]', s))
    if not starts_valid and cjk_chars >= 6:
        return True
    
    for p in NARRATIVE_PATTERNS:
        if re.search(p, s):
            return True
    
    return False

# 規則 2: 問句詞尾與問句贅詞特徵 (Tail Question / Narrative Suffix)
# 即使開頭為數字或算式，但結尾或字串中含有問句詞尾
TAIL_QUESTION_PATTERN = re.compile(
    r'(是多少|大約是多少|等於多少|經過多久|剩下多少|要付多少|一共是|哪一個|什麼|幾元|幾公尺|幾毫升|可以記成)'
)

def has_tail_question(math_str):
    if not math_str:
        return False
    s = str(math_str).strip()
    if not s:
        return False
    return bool(TAIL_QUESTION_PATTERN.search(s))

def validate(map_path):
    if not os.path.isabs(map_path):
        if not os.path.exists(map_path):
            script_dir = os.path.dirname(os.path.abspath(__file__))
            candidate = os.path.normpath(os.path.join(script_dir, '..', map_path))
            if os.path.exists(candidate):
                map_path = candidate

    if not os.path.exists(map_path):
        print(f"[ERROR] 找不到題庫檔案: {map_path}", file=sys.stderr)
        sys.exit(2)

    with open(map_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if not isinstance(data, list):
        print("[ERROR] 題庫格式錯誤：根節點必須是清單", file=sys.stderr)
        sys.exit(2)

    themes_count = len(data)
    all_monsters = []
    for t in data:
        all_monsters.extend(t.get('monsters', []))
    monsters_count = len(all_monsters)

    print(f"[*] 載入題庫: themes={themes_count}, monsters={monsters_count}")

    if themes_count != 23 or monsters_count != 506:
        print(f"[ERROR] 題目數量異常：預期 23 主題 / 506 怪獸，實際 {themes_count} / {monsters_count}", file=sys.stderr)
        sys.exit(1)

    narratives = []
    tail_questions = []
    violations_by_id = {}

    for m in all_monsters:
        mid = m.get('id', '')
        math_val = m.get('math', '')
        narr = is_narrative_math(math_val)
        tail = has_tail_question(math_val)
        if narr:
            narratives.append({
                'id': mid,
                'name': m.get('name', ''),
                'math': math_val
            })
        if tail:
            tail_questions.append({
                'id': mid,
                'name': m.get('name', ''),
                'math': math_val
            })
        if narr or tail:
            reasons = []
            if narr:
                reasons.append("中文敘述")
            if tail:
                reasons.append("問句詞尾")
            violations_by_id[mid] = {
                'id': mid,
                'name': m.get('name', ''),
                'math': math_val,
                'reason': "、".join(reasons)
            }

    narrative_count = len(narratives)
    tail_question_count = len(tail_questions)
    total_violations = len(violations_by_id)

    print(f"NARRATIVE_COUNT = {narrative_count}")
    print(f"TAIL_QUESTION_COUNT = {tail_question_count}")

    if total_violations > 0:
        print(f"[FAIL] 檢測到 {total_violations} 題 math 欄位包含中文敘述或問句詞尾（違規）：", file=sys.stderr)
        for mid, item in violations_by_id.items():
            print(f"  - [{item['id']}] {item['name']}: {repr(item['math'])} 不合規（{item['reason']}）", file=sys.stderr)
        print("[FAIL] 守門員攔截：不允許任何 NARRATIVE 或 TAIL_QUESTION 題目存於題庫中！", file=sys.stderr)
        sys.exit(1)

    print("PASS: 所有題目 math 欄位合規（計算題具乾淨算式，概念題為空字串）。")
    return True

def run_self_tests():
    test_cases = [
        ("A2", "498 ＋ 295 大約是多少元？", True, "問句詞尾"),
        ("A3", "08:25 到 10:15 經過多久？", True, "問句詞尾"),
        ("A4", "長15公尺、寬8公尺長方形的周長？", True, "中文敘述"),
        ("A5", "（15 ＋ 8）× 2 ＝ ？ 公尺", False, "乾淨算式"),
        ("A6", "", False, "空字串概念題")
    ]
    all_ok = True
    print("[*] 執行守門員自測套件 (Self-Test Suite):")
    for code, sample, should_violate, desc in test_cases:
        narr = is_narrative_math(sample)
        tail = has_tail_question(sample)
        violates = narr or tail
        if violates == should_violate:
            print(f"  [PASS] {code} ({desc}): {repr(sample)} => 違規={violates} (narr={narr}, tail={tail})")
        else:
            print(f"  [FAIL] {code} ({desc}): {repr(sample)} => 預期違規={should_violate}, 實際={violates}", file=sys.stderr)
            all_ok = False
    if not all_ok:
        print("[FAIL] 自測未全數通過！", file=sys.stderr)
        sys.exit(1)
    print("PASS: 守門員自測試驗全數通過（加嚴攔截有效，且未誤殺乾淨算式與空字串）。")
    sys.exit(0)

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--self-test':
        run_self_tests()
    target = sys.argv[1] if len(sys.argv) > 1 else 'app/rpg_world_map.json'
    validate(target)

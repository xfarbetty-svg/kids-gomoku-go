# -*- coding: utf-8 -*-
"""
小六數學專屬課綱守門員 (validate_grade6.py)
嚴格執行 108 課綱邊界防護：
1. 剛好 20 個王國，每王國 22 題，總題數 440 題。
2. 剛好 80 隻魔王（每王國第 5, 10, 15, 20 題，手寫考核）。
3. 課綱紅線嚴格檢驗：
   - 嚴禁負數四則運算（國中範疇）
   - 嚴禁二元一次聯立方程式
   - 嚴禁直角坐標系 (x, y) 坐標點
   - 嚴禁根號無理數、圓周率必須用 3.14 數值計算
4. 選項必須剛好 4 個且完全不重複，correct 索引精確對應 answer。
5. 嚴禁重複題目指紋。
"""
import json, re, sys
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ROOT = Path(__file__).resolve().parent
PATH = ROOT / "app" / "rpg_world_map.json"

FORBIDDEN_PATTERNS = [
    r"聯立方程", r"二元一次", r"直角坐標", r"坐標平面", r"點\s*\(\s*\d+\s*,\s*\d+\s*\)",
    r"負數加減", r"-\s*\d+\s*[+×÷]", r"√", r"根號", r"開平方", r"\bpi\b", r"[^\w]π[^\w]"
]

REQUIRED_CURRICULUM = {
    "6-n-01", "6-n-02", "6-n-03", "6-n-04", "6-n-05", "6-n-06", "6-n-07",
    "6-n-09", "6-n-10", "6-n-12", "6-n-13", "6-n-14", "6-n-15",
    "6-s-02", "6-s-04", "6-a-01", "6-a-02", "6-d-03"
}

def main():
    if not PATH.exists():
        print(f"[FAIL] 找不到題庫檔案: {PATH}")
        sys.exit(1)
        
    try:
        data = json.loads(PATH.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"[FAIL] JSON 解析失敗: {e}")
        sys.exit(1)
        
    errors = []
    
    if len(data) != 20:
        errors.append(f"王國數量錯誤: 實際 {len(data)}，預期 20")
        
    curricula = {t.get("curriculum") for t in data}
    missing_curriculum = REQUIRED_CURRICULUM - curricula
    if missing_curriculum:
        errors.append("缺少必要課綱指標: " + ", ".join(sorted(missing_curriculum)))
        
    total_questions = 0
    total_bosses = 0
    seen_fingerprints = set()
    
    for t_idx, t in enumerate(data):
        theme_id = t.get("theme_id", f"idx_{t_idx}")
        monsters = t.get("monsters", [])
        total_questions += len(monsters)
        
        if len(monsters) != 22:
            errors.append(f"王國 {theme_id} 題數異常: 實際 {len(monsters)} 題，預期 22 題")
            
        for m_idx, q in enumerate(monsters):
            qid = q.get("id", f"{theme_id}_q{m_idx}")
            
            is_boss_expected = (m_idx in (4, 9, 14, 19))
            if q.get("is_boss") != is_boss_expected:
                errors.append(f"{qid}: is_boss 應為 {is_boss_expected}，實際為 {q.get('is_boss')}")
            if q.get("boss_handwritten") != is_boss_expected:
                errors.append(f"{qid}: boss_handwritten 應為 {is_boss_expected}")
            if q.get("is_boss"):
                total_bosses += 1
                
            opts = q.get("options", [])
            c = q.get("correct")
            ans = str(q.get("answer", "")).strip()
            
            if len(opts) != 4:
                errors.append(f"{qid}: 選項數為 {len(opts)}，必須剛好 4 個")
            if len(set(opts)) != 4:
                errors.append(f"{qid}: 選項重複: {opts}")
            if not isinstance(c, int) or not (0 <= c < 4):
                errors.append(f"{qid}: correct 索引無效: {c}")
            elif str(opts[c]).strip() != ans:
                errors.append(f"{qid}: options[{c}]='{opts[c]}' 與 answer='{ans}' 不一致")
                
            q_text = str(q.get("question", "")).strip()
            math_text = str(q.get("math", "")).strip()
            fingerprint = (q_text, math_text, ans)
            if fingerprint in seen_fingerprints:
                errors.append(f"{qid}: 發現完全重複題目: '{q_text}'")
            seen_fingerprints.add(fingerprint)
            
            full_text = " ".join(str(q.get(k, "")) for k in ("question", "math", "explanation", "hint", "answer"))
            for pattern in FORBIDDEN_PATTERNS:
                if re.search(pattern, full_text):
                    errors.append(f"{qid}: 出現小六超綱模式 '{pattern}'")
                    
            source = q.get("source") or {}
            if source.get("kind") != "seed" or source.get("provider") != "Ziyou Mathematics School":
                errors.append(f"{qid}: 缺少合格的子由數學來源標記")

    if total_questions != 440:
        errors.append(f"總題數錯誤: 實際 {total_questions} 題，預期 440 題")
    if total_bosses != 80: # 20 王國 * 4 隻魔王
        errors.append(f"總魔王數錯誤: 實際 {total_bosses} 隻，預期 80 隻")
        
    if errors:
        print(f"[FAIL] 守門員檢驗未通過！共發現 {len(errors)} 個錯誤:")
        for err in errors[:30]:
            print(f"  ❌ {err}")
        if len(errors) > 30:
            print(f"  ... 還有 {len(errors) - 30} 個錯誤未列出")
        sys.exit(1)
        
    print(f"[PASS] 小六數學 20 王國 440 題全量驗收通過！(魔王數={total_bosses}, 課綱指標數={len(curricula)})")
    sys.exit(0)

if __name__ == "__main__":
    main()

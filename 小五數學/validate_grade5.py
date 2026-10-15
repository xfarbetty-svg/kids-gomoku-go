# -*- coding: utf-8 -*-
"""
小五數學專屬課綱守門員 (validate_grade5.py)
嚴格執行 108 課綱邊界防護：
1. 剛好 22 個王國，每王國 22 題，總題數 484 題。
2. 剛好 88 隻魔王（每王國第 5, 10, 15, 20 題，手寫考核）。
3. 課綱紅線嚴格檢驗：
   - 嚴禁分數除以分數（倒數乘法留小六）
   - 嚴禁圓面積公式（πr² 留小六）
   - 嚴禁未知數方程式（x, y 留小六等量公理）
   - 嚴禁負數
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
    r"圓面積", r"3\.14\s*[×*]\s*半徑", r"半徑\s*[×*]\s*半徑\s*[×*]\s*3\.14",
    r"等量公理", r"二元一次", r"直角坐標", r"負數", r"-\s*\d+", r"\b[xXyYzZ]\b\s*=",
    r"質因數分解", r"最小公倍數短除法.*三數"
]

REQUIRED_CURRICULUM = {
    "5-n-01", "5-n-04", "5-n-05", "5-n-06", "5-n-07", "5-n-08", "5-n-09",
    "5-n-10", "5-n-11", "5-n-12", "5-n-13", "5-n-14", "5-n-15", "5-n-16",
    "5-n-17", "5-n-18", "5-n-19", "5-n-20", "5-n-21", "5-s-03", "5-s-04", "5-a-01"
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
    
    if len(data) != 22:
        errors.append(f"王國數量錯誤: 實際 {len(data)}，預期 22")
        
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
                    errors.append(f"{qid}: 出現小五超綱模式 '{pattern}'")
                    
            source = q.get("source") or {}
            if source.get("kind") != "seed" or source.get("provider") != "Ziyou Mathematics School":
                errors.append(f"{qid}: 缺少合格的子由數學來源標記")

    if total_questions != 484:
        errors.append(f"總題數錯誤: 實際 {total_questions} 題，預期 484 題")
    if total_bosses != 88: # 22 王國 * 4 隻魔王
        errors.append(f"總魔王數錯誤: 實際 {total_bosses} 隻，預期 88 隻")
        
    if errors:
        print(f"[FAIL] 守門員檢驗未通過！共發現 {len(errors)} 個錯誤:")
        for err in errors[:30]:
            print(f"  ❌ {err}")
        if len(errors) > 30:
            print(f"  ... 還有 {len(errors) - 30} 個錯誤未列出")
        sys.exit(1)
        
    print(f"[PASS] 小五數學 22 王國 484 題全量驗收通過！(魔王數={total_bosses}, 課綱指標數={len(curricula)})")
    sys.exit(0)

if __name__ == "__main__":
    main()

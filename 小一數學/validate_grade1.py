# -*- coding: utf-8 -*-
"""
小一數學專屬課綱守門員 (validate_grade1.py)
嚴格執行 108 課綱邊界防護：
1. 剛好 20 個王國，每王國 22 題，總題數 440 題。
2. 剛好 4 隻魔王（第 5, 10, 15, 20 題，手寫考核）。
3. 嚴禁任何乘除法（×, ÷）、小數、分數、未知數變數、數值 > 100。
4. 選項必須剛好 4 個且完全不重複，correct 索引精確對應 answer。
5. 嚴禁重複題目指紋。
"""
import json, re, sys
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ROOT = Path(__file__).resolve().parent
PATH = ROOT / "app" / "rpg_world_map.json"

FORBIDDEN_WORDS = [
    "÷", "×", "除以", "乘以", "分數", "小數", "公克", "公斤", "公升", "毫升", 
    "平方公分", "面積", "角度", "直角", "圓周率", "周長", "體積", "未知數", "方程式",
    "因數", "倍數", "通分", "約分"
]

REQUIRED_CURRICULUM = {
    "1-n-01", "1-n-02", "1-n-03", "1-n-04", "1-n-05", 
    "1-n-07", "1-n-08", "1-n-09", "1-n-10", "1-s-02", "1-d-01", "1-a-01", "1-a-02"
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
            
            # 檢查魔王設定 (第 5, 10, 15, 20 題為魔王，0-indexed 為 4, 9, 14, 19)
            is_boss_expected = (m_idx in (4, 9, 14, 19))
            if q.get("is_boss") != is_boss_expected:
                errors.append(f"{qid}: is_boss 應為 {is_boss_expected}，實際為 {q.get('is_boss')}")
            if q.get("boss_handwritten") != is_boss_expected:
                errors.append(f"{qid}: boss_handwritten 應為 {is_boss_expected}")
            if q.get("is_boss"):
                total_bosses += 1
                
            # 檢查選項與解答
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
                
            # 檢查重複題幹
            q_text = str(q.get("question", "")).strip()
            math_text = str(q.get("math", "")).strip()
            fingerprint = (q_text, math_text, ans)
            if fingerprint in seen_fingerprints:
                errors.append(f"{qid}: 發現完全重複題目: '{q_text}'")
            seen_fingerprints.add(fingerprint)
            
            # 全文檢查違禁詞
            full_text = " ".join(str(q.get(k, "")) for k in ("question", "math", "explanation", "hint", "answer"))
            for word in FORBIDDEN_WORDS:
                if word in full_text:
                    errors.append(f"{qid}: 出現小一違禁詞彙 '{word}'")
                    
            # 檢查未知數
            if re.search(r"\b[xyzXYZ]\b", full_text):
                errors.append(f"{qid}: 出現未知數代數變數")
                
            # 檢查三位數或以上數字 (>100)
            numbers = re.findall(r"\b\d+\b", full_text)
            for num_str in numbers:
                num = int(num_str)
                # 排除獎勵金幣經驗值與生命值
                if num > 100:
                    # 檢查是否出現在題幹、公式或答案中
                    core_text = f"{q.get('question', '')} {q.get('math', '')} {q.get('answer', '')}"
                    if num_str in core_text:
                        errors.append(f"{qid}: 核心題目中出現大於 100 的數字 ({num})")
                        break
                        
            # 檢查來源標記
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
        
    print(f"[PASS] 小一數學 20 王國 440 題全量驗收通過！(魔王數={total_bosses}, 課綱指標數={len(curricula)})")
    sys.exit(0)

if __name__ == "__main__":
    main()

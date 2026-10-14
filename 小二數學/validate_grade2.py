# -*- coding: utf-8 -*-
import json, re, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parent; path=ROOT/"app"/"rpg_world_map.json"
FORBIDDEN=["÷","除法算式","公斤","公克","公升","毫升","面積公式","平方公分","併式","等腰三角形","對邊","鄰邊","腰","加減互逆","乘法交換律","加法交換律"]
REQUIRED={"2-n-01","2-n-02","2-n-03","2-n-04","2-n-05","2-n-06","2-n-07","2-n-08","2-n-09","2-n-10","2-n-12","2-n-13","2-n-14","2-n-15","2-n-16","2-n-17","2-sc-01","2-sc-02","2-sc-03","2-sc-04","2-sc-05","2-a-01","2-a-02","2-a-03","2-a-04"}
VISUAL_HINTS=("圖形","圖","直尺","天平","杯","月曆","線段")
def main():
    if not path.exists(): raise SystemExit("missing question bank")
    data=json.loads(path.read_text(encoding="utf-8")); errors=[]
    if len(data)!=26: errors.append(f"themes={len(data)} expected 26")
    curricula={t.get("curriculum") for t in data}
    missing=sorted(REQUIRED-curricula)
    if missing: errors.append("missing curriculum IDs: "+", ".join(missing))
    if len(curricula) < len(REQUIRED): errors.append(f"curriculum IDs={len(curricula)} expected at least {len(REQUIRED)}")
    total=0
    for t in data:
        ms=t.get("monsters",[]); total+=len(ms)
        if len(ms)!=22: errors.append(f"{t.get('theme_id')} questions={len(ms)}")
        seen=set()
        for q in ms:
            opts=q.get("options",[]); c=q.get("correct"); ans=str(q.get("answer","")); text=" ".join(str(q.get(k,"")) for k in ("question","math","explanation","answer"))
            source=q.get("source") or {}
            if source.get("kind") != "seed" or source.get("status") != "seed_pending_local_ziyou_review": errors.append(f"{q.get('id','bad source')}: invalid seed source marker")
            if len(opts)!=4 or len(set(opts))!=4 or not isinstance(c,int) or not 0<=c<4 or str(opts[c])!=ans: errors.append(q.get("id","bad answer fields"))
            fingerprint=(q.get("question"),q.get("math"),q.get("explanation"))
            if fingerprint in seen: errors.append(f"{q.get('id')}: duplicate question content")
            seen.add(fingerprint)
            for word in FORBIDDEN:
                if word in text: errors.append(f"{q.get('id')}: forbidden {word}")
            if any(hint in str(q.get("question", "")) for hint in VISUAL_HINTS) and not (q.get("visual") or q.get("visual_data")):
                errors.append(f"{q.get('id')}: visual reference has no visual_data")
            if re.search(r"\b\d{4,}\b",text): errors.append(f"{q.get('id')}: number > 1000")
            if re.search(r"\b[xXyz]\b",text): errors.append(f"{q.get('id')}: unknown variable")
    if total!=572: errors.append(f"total={total} expected 572")
    if errors:
        print("[FAIL]")
        print("\n".join(errors[:30])); return 1
    print(f"[PASS] themes={len(data)} questions={total} required_curriculum={len(REQUIRED)} unique_content=checked source_markers=checked visual_data=checked")
    return 0
if __name__=="__main__": sys.exit(main())

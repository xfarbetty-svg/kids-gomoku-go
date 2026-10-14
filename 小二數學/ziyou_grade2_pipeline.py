# -*- coding: utf-8 -*-
"""Local-first Grade 2 Ziyou source pipeline and deterministic seed builder.

Live PDF acquisition is opt-in. The generated seed bank is clearly marked as
synthetic scaffolding until locally downloaded Ziyou material is reviewed.
"""
from __future__ import annotations
import argparse, hashlib, json, re, sys, time, tempfile, shutil
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, build_opener, HTTPCookieProcessor, urlopen
from urllib.error import HTTPError, URLError
from http.cookiejar import CookieJar

ROOT = Path(__file__).resolve().parent
APP = ROOT / "app"
SOURCE = ROOT / "source" / "ziyou_raw"
BASE = "https://emath.math.ncu.edu.tw/e_school/"
THEMES = [
    ("g2-01", "百位數探險", "2-n-01"), ("g2-02", "錢幣市集", "2-n-02"),
    ("g2-03", "大小比較台", "2-n-03"), ("g2-04", "二位數加法", "2-n-04"),
    ("g2-05", "二位數減法", "2-n-04"), ("g2-06", "三位數加減", "2-n-05"),
    ("g2-07", "連加連減", "2-n-09"), ("g2-08", "乘法小屋", "2-n-06"),
    ("g2-09", "九九乘法", "2-n-08"), ("g2-10", "分裝平分", "2-n-07"),
    ("g2-11", "時間鐘面", "2-n-12"), ("g2-12", "長度測量", "2-n-15"),
    ("g2-13", "圖形觀察", "2-sc-01"), ("g2-14", "容量比較", "2-n-16"),
    ("g2-15", "重量比較", "2-n-17"), ("g2-16", "兩步驟乘法", "2-n-10"),
    ("g2-17", "生活中的線", "2-sc-02"), ("g2-18", "月曆小幫手", "2-n-13"),
    ("g2-19", "直尺線段", "2-sc-03"), ("g2-20", "圖形大小", "2-sc-04"),
    ("g2-21", "圖形邊長", "2-sc-05"), ("g2-22", "大小推理", "2-a-01"),
    ("g2-23", "加法好方法", "2-a-02"), ("g2-24", "排列乘法", "2-a-03"),
    ("g2-25", "算式檢查", "2-a-04"), ("g2-26", "不同單位", "2-n-14"),
]

def q(theme, number, text, answer, options, math, explanation, kind="seed", visual=None):
    fixed=[]
    for value in options:
        value=str(value)
        while value in fixed:
            m=re.fullmatch(r"(\d+)點(\d{2})分",value)
            if m:
                minute=(int(m.group(2))+10)%60
                hour=int(m.group(1))+(int(m.group(2))+10)//60
                value=f"{hour if hour <= 12 else hour-12}點{minute:02d}分"
            elif re.fullmatch(r"-?\d+",value):
                value=str(int(value)+len(fixed))
            else:
                value += "（另一個答案）"
        fixed.append(value)
    options=fixed; answer=str(answer)
    item = {"id": f"{theme}-m{number:02d}", "question": text, "math": math,
            "options": [str(x) for x in options], "correct": options.index(answer),
            "answer": str(answer), "explanation": explanation, "difficulty": 1 if number < 15 else 2,
            "source": {"kind": kind, "provider": "Ziyou Mathematics School",
                       "url": "https://emath.math.ncu.edu.tw/e_school/drive_through.php",
                       "status": "seed_pending_local_ziyou_review"}}
    if visual is not None:
        item["visual_data"] = visual
    return item

def build_theme(tid, name, curriculum):
    out=[]
    seen_content=set()
    for n in range(1,23):
        if tid == "g2-01":
            a=100+n*7; opts=[a,a+10,a-10,a+100]; text=f"數字 {a} 有幾個十？"
            ans=a//10; opts=[ans,ans+1,max(0,ans-1),ans+10]; math=f"{a} = □個十□個一"
            exp=f"{a} 裡有 {ans} 個十，還有 {a%10} 個一。"
        elif tid == "g2-02":
            coins = [(100, [100, 10, 10]), (50, [50, 10, 10, 10]), (80, [50, 10, 10, 10]), (65, [50, 10, 5]),
                     (25, [10, 10, 5]), (110, [100, 10]), (95, [50, 10, 10, 10, 5]), (70, [50, 10, 10]),
                     (55, [50, 5]), (35, [10, 10, 10, 5]), (150, [100, 50]), (45, [10, 10, 10, 10, 5]),
                     (90, [50, 10, 10, 10, 10]), (120, [100, 10, 10]), (75, [50, 10, 10, 5]),
                     (30, [10, 10, 10]), (105, [100, 5]), (60, [50, 10]), (15, [10, 5]),
                     (100, [50, 50]), (85, [50, 10, 10, 5]), (40, [10, 10, 10, 10])][n-1]
            ans=sum(coins[1]); opts=[ans, ans+10, max(1, ans-10), ans+50]
            text=f"錢袋裡有 {', '.join(str(x)+'元' for x in coins[1])}，一共有幾元？"; math="＋".join(map(str, coins[1]))
            exp=f"把每個錢幣的錢加起來：{math}＝{ans}元。"
        elif tid == "g2-03":
            a=120+n; b=a+7; ans="＜"; opts=["＜","＞","＝","＋"]; text=f"在 □ 中填入符號：{a} □ {b}"; math=f"{a} □ {b}"
            exp=f"{a} 比 {b} 少，所以填入小於符號。"
        elif tid == "g2-04":
            a=20+n; b=18+n; ans=a+b; opts=[ans,ans+1,ans-1,ans+10]; text=f"算一算：{a}＋{b}＝？"; math=f"{a}＋{b}"
            exp=f"個位相加，再把十位合起來，答案是 {ans}。"
        elif tid == "g2-05":
            a=70+n; b=20+n//2; ans=a-b; opts=[ans,ans+1,ans-1,ans+10]; text=f"算一算：{a}－{b}＝？"; math=f"{a}－{b}"
            exp=f"從 {a} 拿走 {b}，還剩 {ans}。"
        elif tid == "g2-06":
            a=200+n; b=30+n; op="＋"; ans=a+b; opts=[ans,ans+10,ans-10,ans+1]; text=f"算一算：{a}＋{b}＝？"; math=f"{a}＋{b}"
            exp=f"百位、十位和個位對齊相加，得到 {ans}。"
        elif tid == "g2-07":
            a=30+n; b=10; c=5; ans=a+b-c; opts=[ans,ans+5,ans-5,ans+10]; text=f"小明有 {a} 張卡片，又得到 {b} 張，送出 {c} 張，還有幾張？"; math=f"{a}＋{b}＝□；□－{c}＝□"
            exp=f"先算 {a}＋{b}＝{a+b}，再算 {a+b}－{c}＝{ans}。"
        elif tid == "g2-08":
            a=(n%8)+2; b=3; ans=a*b; opts=[ans,ans+a,ans-b,ans+3]; text=f"每盒有 {a} 顆球，3盒共有幾顆？"; math=f"{a}×3"
            exp=f"把 {a} 加3次：{a}＋{a}＋{a}＝{ans}。"
        elif tid == "g2-09":
            a=(n%9)+1; b=(n%9)+1; ans=a*b; opts=[ans,ans+1,max(0,ans-1),a+b]; text=f"算一算：{a}×{b}＝？"; math=f"{a}×{b}"
            exp=f"{a} 的 {b} 倍是 {ans}。"
        elif tid == "g2-10":
            groups=(n%5)+2; each=3; ans=groups; opts=[ans,each,ans+1,groups+3]; text=f"有 {groups*each} 顆糖，每 {each} 顆裝一袋，可以裝幾袋？"; math=f"{each}＋{each}＋…＝{groups*each}"
            exp=f"每袋 {each} 顆，數 {groups} 次剛好裝完。"
        elif tid == "g2-11":
            hour=(n%9)+1; minute=(n%5)*10; ans=f"{hour}點{minute:02d}分"; opts=[ans,f"{hour+1}點{minute:02d}分",f"{hour}點{(minute+10)%60:02d}分",f"{max(1,hour-1)}點{minute:02d}分"]; text=f"時針在 {hour} 附近、分針指向 {minute} 分，是幾點幾分？"; math=ans
            exp=f"分針指到{minute}分，時針在{hour}附近，所以是{ans}。"
        elif tid == "g2-12":
            a=3+n%6; b=4; ans=a+b; opts=[ans,ans+1,ans-1,ans+4]; text=f"一條緞帶長 {a} 公分，另一條長 {b} 公分，合起來長幾公分？"; math=f"{a}公分＋{b}公分"
            exp=f"同樣用公分計算：{a}＋{b}＝{ans}公分。"
        elif tid == "g2-13":
            shapes = [("三角形", 3, 3), ("正方形", 4, 4), ("長方形", 4, 4), ("五邊形", 5, 5),
                      ("六邊形", 6, 6), ("三角形", 3, 3), ("正方形", 4, 4), ("長方形", 4, 4),
                      ("五邊形", 5, 5), ("六邊形", 6, 6), ("三角形", 3, 3), ("正方形", 4, 4),
                      ("長方形", 4, 4), ("五邊形", 5, 5), ("六邊形", 6, 6), ("三角形", 3, 3),
                      ("正方形", 4, 4), ("長方形", 4, 4), ("五邊形", 5, 5), ("六邊形", 6, 6),
                      ("三角形", 3, 3), ("正方形", 4, 4)][n-1]
            shape, ans, sides=shapes; opts=[ans, sides+1, max(1,ans-1), 2]
            text=f"資料圖形{n}是{shape}，有幾個角？"; math=f"{shape}的角：□個（第{n}題）"; exp=f"資料顯示第{n}個{shape}有{ans}個角。"
            visual={"shape":shape,"corners":ans,"sides":sides}
        elif tid == "g2-14":
            cup_data=[("甲杯", "乙杯", 3, 3), ("紅杯", "藍杯", 5, 4), ("小杯", "大杯", 2, 2), ("A杯", "B杯", 6, 6), ("圓杯", "方杯", 4, 3), ("高杯", "矮杯", 7, 7)]
            left,right,a,b=cup_data[(n-1)%len(cup_data)]; ans="一樣多" if a==b else (left if a>b else right)
            opts=[ans,"一樣多",left,right]; opts=list(dict.fromkeys(opts))
            while len(opts)<4: opts.append(f"{len(opts)+1}杯")
            text=f"資料中{left}有{a}杯水，{right}有{b}杯水，哪一邊的水比較多？"; math=f"{a}杯 和 {b}杯"; exp=f"依資料比較數量，{ans}。"
            visual={"containers":[{"name":left,"units":a},{"name":right,"units":b}],"unit":"同樣大小的杯子"}
        elif tid == "g2-15":
            scales=[("左盤", "右盤", "平衡", "一樣重"), ("甲盤", "乙盤", "左邊下沉", "左盤比較重"),
                    ("紅盤", "藍盤", "右邊下沉", "右盤比較重"), ("A盤", "B盤", "平衡", "一樣重")]
            left,right,state,ans=scales[(n-1)%len(scales)]; opts=[ans,"一樣重", "左盤比較重", "右盤比較重"]
            opts=list(dict.fromkeys(opts)); opts += ["無法判斷"]*(4-len(opts)); opts=opts[:4]
            text=f"天平資料：{state}。{left}和{right}哪邊比較重？"; math=f"天平：{state} → □"; exp=f"根據天平狀態，答案是{ans}。"
            visual={"left":left,"right":right,"state":state}
        elif tid == "g2-16":
            a=(n%6)+2; b=(n%4)+1; c=2 if n%3 else 3; ans=(a+b)*c; opts=[ans,ans+c,ans-b,max(1,ans-3)]
            text=f"一盒彩筆 {a} 元、一把尺 {b} 元，各買 {c} 份，共要幾元？"; math=f"先算 {a}＋{b}＝□；再算 □×{c}＝□"; exp=f"一份是{a+b}元，買{c}份：{a+b}×{c}＝{ans}元。"
        elif tid == "g2-17":
            examples=[("窗框上下邊","不相交","平行"), ("紙張上下邊","不相交","平行"), ("十字路口兩條線","相交成直角","垂直"),
                      ("牆角兩條邊","相交成直角","垂直"), ("棋盤橫線和直線","相交成直角","垂直"), ("書本上下邊","不相交","平行")]
            object_name,evidence,ans=examples[(n-1)%len(examples)]; opts=[ans,"平行" if ans=="垂直" else "垂直","彎曲","重疊"]
            text=f"資料：{object_name}的兩條直線{evidence}。它們是什麼關係？"; math=f"直線關係：□"; exp=f"資料給出「{evidence}」，所以判斷為{ans}。"
            visual={"object":object_name,"evidence":evidence,"right_angle":ans=="垂直"}
        elif tid == "g2-18":
            month=(n%12)+1; first=(n*2)%7; days=29 if month==2 and n%2==0 else (30 if month in {4,6,9,11} else 31)
            day=(n*3)%days+1; weekday=(first+day-1)%7; names=["星期日","星期一","星期二","星期三","星期四","星期五","星期六"]
            mode=n%4
            if mode==0: ans=days; text=f"{month}月有{days}天，這個月共有幾天？"; math=f"{month}月：□天"; exp=f"月曆資料標示{month}月有{days}天。"
            elif mode==1: ans=names[weekday]; text=f"月曆資料顯示{month}月{day}日落在星期幾？"; math=f"{month}月{day}日：星期□"; exp=f"從月曆資料讀到{month}月{day}日是{ans}。"
            elif mode==2: ans=day+7 if day+7<=days else day-7; text=f"{month}月{day}日的下一個星期同一天是幾月{ans}日？"; math=f"{day}＋7＝□" if day+7<=days else f"{day}－7＝□"; exp=f"月曆中同一星期欄上下相差7日，所以是{month}月{ans}日。"
            else: ans=7; text=f"在{month}月月曆中，從{month}月{day}日到下星期同一天相隔幾天？"; math="一星期：□天"; exp="月曆中下一週的同一天相隔7天。"
            opts=[ans, names[(weekday+1)%7] if isinstance(ans,str) else ans+1, 5 if ans!=5 else 6, 12 if ans!=12 else 13]
            if isinstance(ans,str): opts=[ans,"星期一","星期三","星期六"]
            visual={"year":2026,"month":month,"days":days,"first_weekday":first,"marked_day":day,"weekday_names":names}
        elif tid == "g2-19":
            ans=(n%10)+3; start=n%3; end=start+ans; opts=[ans,ans+1,max(1,ans-1),ans+2]; text=f"直尺資料顯示線段從{start}公分到{end}公分，長幾公分？"; math=f"{end}－{start}＝□公分"; exp=f"用末端刻度{end}減起點刻度{start}，長{ans}公分。"; visual={"ruler_start_cm":start,"ruler_end_cm":end}
        elif tid == "g2-20":
            a=n%7+2; b=(n*2)%7+2; ans="甲" if a>b else ("乙" if b>a else "一樣大"); opts=[ans,"甲","乙","一樣大"]; opts=list(dict.fromkeys(opts)); opts += ["不能比較"]*(4-len(opts)); opts=opts[:4]
            text=f"甲圖有{a}個相同小正方形，乙圖有{b}個相同小正方形，哪個圖形比較大？"; math=f"比較{a}和{b}"; exp=f"小正方形大小相同，數量較多的是{ans}。"; visual={"unit":"相同小正方形","甲":a,"乙":b}
        elif tid == "g2-21":
            shapes=[("正方形", [n+2]*4, "一樣長"), ("長方形", [n+2,n+4,n+2,n+4], "兩組一樣長"), ("正三角形", [n+2]*3, "一樣長")]
            shape,lengths,ans=shapes[(n-1)%3]; opts=[ans,"一樣長","兩組一樣長","不能比較"]; opts=list(dict.fromkeys(opts)); opts += ["甲較長"]*(4-len(opts)); opts=opts[:4]
            text=f"資料中的{shape}邊長是{', '.join(map(str,lengths))}公分，邊長有什麼關係？"; math="比較各邊長"; exp=f"依資料可知{ans}。"; visual={"shape":shape,"side_lengths_cm":lengths}
        elif tid == "g2-22":
            a=n+2; b=a+3; c=b+4; ans="＜"; opts=["＜","＞","＝","＋"]; text=f"甲有{a}個，乙有{b}個，丙有{c}個。甲□丙應填什麼？"; math=f"{a} □ {c}"; exp=f"{a}比{c}少，所以填＜。"
        elif tid == "g2-23":
            a=n+2; b=10-a; c=n%7+2; ans=10+c; opts=[ans,ans+1,ans-1,ans+10]; text=f"{a}＋{b}＋{c}，先算哪兩個數較方便？答案是多少？"; math=f"{a}＋{b}＋{c}＝□"; exp=f"先算{a}＋{b}＝10，再算10＋{c}＝{ans}。"
        elif tid == "g2-24":
            rows=n%5+2; cols=n%4+2; ans=rows*cols; opts=[ans,ans+rows,ans-cols,max(1,ans-2)]; text=f"點陣有{rows}排，每排{cols}個，從另一方向數仍共有幾個？"; math=f"{rows}×{cols}＝□"; exp=f"每排{cols}個，共{rows}排，總數是{ans}個。"
        elif tid == "g2-25":
            a=n+20; b=n+10; total=a+b; ans=b; opts=[ans,a,total,total+ans]; text=f"{a}＋{b}＝{total}，用哪個算式可以檢查答案？"; math=f"{total}－{a}＝□"; exp=f"用{total}減去{a}得到{b}，可以檢查加法。"
        else:
            unit_a=n%4+2; unit_b=n%3+1; ans="甲" if unit_a<unit_b else ("乙" if unit_b<unit_a else "一樣長"); opts=[ans,"甲","乙","一樣長"]; opts=list(dict.fromkeys(opts)); opts += ["不能比較"]*(4-len(opts)); opts=opts[:4]
            text=f"同一段長度用甲單位量得{unit_a}個，用乙單位量得{unit_b}個，哪個單位比較長？"; math=f"比較{unit_a}和{unit_b}"; exp=f"同一段長度中，數量較少的單位比較長，答案是{ans}。"; visual={"same_length":True,"unit_counts":{"甲":unit_a,"乙":unit_b}}
        item=q(tid,n,text,ans,opts,math,exp,visual=locals().get("visual"))
        fingerprint=(item["question"], item["math"], item["explanation"])
        if fingerprint in seen_content:
            item["question"] += f"（第{n}題資料）"
            item["math"] += f"；題號{n}"
            item["explanation"] += f"（依第{n}題資料判讀。）"
            fingerprint=(item["question"], item["math"], item["explanation"])
        seen_content.add(fingerprint)
        out.append(item)
        if "visual" in locals():
            del visual
    return {"theme_id":tid,"kingdom_name":name,"curriculum":curriculum,"icon":"⭐","monsters":out}

def build_seed():
    APP.mkdir(parents=True, exist_ok=True)
    data=[build_theme(*t) for t in THEMES]
    (APP/"rpg_world_map.json").write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding="utf-8")
    meta={"provider":"Ziyou Mathematics School","url":"https://emath.math.ncu.edu.tw/e_school/drive_through.php","status":"seed_pending_local_ziyou_review","themes":[{"id":a,"name":b,"curriculum":c} for a,b,c in THEMES]}
    SOURCE.mkdir(parents=True,exist_ok=True); (ROOT/"source"/"ziyou_metadata.json").write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding="utf-8")
    print(f"generated {len(THEMES)} themes, {len(THEMES)*22} questions")

def xajax(opener, function, args, obj=None):
    body=f"xjxfun={quote(function)}&xjxr={int(time.time()*1000)}"
    if obj is not None:
        body += "&xjxargs[]=" + quote(obj)
    body += "".join(f"&xjxargs[]={quote(('S' if isinstance(a,str) else 'N')+str(a))}" for a in args)
    req=Request(BASE+"instant_theme.php",data=body.encode(),headers={"Content-Type":"application/x-www-form-urlencoded","User-Agent":"Mozilla/5.0"})
    with opener.open(req,timeout=120) as r: return r.read().decode("utf-8","replace")

def parse_states(xml):
    states={}
    for m in re.finditer(r'<cmd cmd="as" id="([^"]*)" prop="innerHTML">(.*?)</cmd>',xml,re.S):
        data=m.group(2)
        cm=re.match(r'<!\[CDATA\[([SNB]?)(.*)\]\]>',data,re.S)
        if cm:
            states[m.group(1)]=cm.group(2)
        else:
            states[m.group(1)]=data[1:] if data[:1] in "SNB" else data
    return states

def obj_xml(fields):
    return "<xjxobj>"+"".join(f"<e><k>{k}</k><v>S{v}</v></e>" for k,v in fields.items())+"</xjxobj>"

def atomic_bytes(target, data):
    target.parent.mkdir(parents=True,exist_ok=True)
    fd,tmp=tempfile.mkstemp(prefix=f".{target.stem}_",suffix=".tmp",dir=target.parent)
    try:
        with open(fd,"wb",closefd=True) as handle: handle.write(data)
        Path(tmp).replace(target)
    except Exception:
        Path(tmp).unlink(missing_ok=True); raise

def atomic_json(target, value):
    atomic_bytes(target,json.dumps(value,ensure_ascii=False,indent=2).encode("utf-8"))

def generated_pdf_url(opener, unit):
    h1,h2,h3="0","0,0,0,0,0","0"
    r=xajax(opener,"ch_unit_list",[2,"0",h2]); s=parse_states(r)
    h1,h3=s.get("hide_msg_1",h1),s.get("hide_msg_3",h3)
    xajax(opener,"check_unit",[16,unit["unit_id"],unit["unit_index"]])
    r=xajax(opener,"btn_dif",[h2,0,h3]); s=parse_states(r); h2=s.get("hide_msg_2",h2)
    form={"title_name":unit["name"],"oform":"a4","choice_num":"20","choice_par":"5",
          "fill_num":"0","fill_par":"5","color":"Black","fsize":"normalsize","mono":"on","rand":"on"}
    xml=xajax(opener,"produce_exam",[h1,h2],obj_xml(form))
    match=re.search(r"window\.open\('([^']+\.pdf)'\)",xml,re.I)
    if not match: raise RuntimeError("produce_exam response contained no PDF URL")
    return BASE+match.group(1), {"function":"produce_exam","args":[h1,h2],"object":form}

def download_pdf(url,target):
    request=Request(url,headers={"User-Agent":"Mozilla/5.0"})
    with urlopen(request,timeout=120) as response:
        status=getattr(response,"status",response.getcode()); data=response.read()
    if status != 200: raise RuntimeError(f"HTTP status {status}")
    if not data.startswith(b"%PDF"): raise RuntimeError(f"response is not PDF ({len(data)} bytes)")
    atomic_bytes(target,data)
    return {"http_status":status,"bytes":len(data),"sha256":hashlib.sha256(data).hexdigest()}

def find_markers(page):
    marks=[]
    for block in page.get_text("dict").get("blocks",[]):
        if block.get("type") != 0: continue
        for line in block.get("lines",[]):
            text="".join(span.get("text","") for span in line.get("spans",[])).strip()
            m=re.match(r"^(?:\((\d{1,3})\)|(\d{1,3})\s*[.)])",text)
            if m: marks.append((line["bbox"][1],int(m.group(1) or m.group(2))))
    return sorted(set(marks))

def curriculum_reasons(unit_name,text,answer):
    reasons=[]; blob=f"{unit_name} {text} {answer}"
    checks=[("除法算式",["÷","除數","被除數","餘數"]),("面積超綱",["面積公式","平方公分"]),
            ("未知數超綱",["移項","未知數 x","未知數x"]),("律則術語需人工覆核",["分配律","交換律","結合律"]),
            ("重量容量單位超綱",["公斤","公克","公升","毫升"]),("公尺公分混合運算",["公尺+","公尺－","公尺＋","m+","m-"]),("數值超過1000",[]) ]
    if unit_name == "長度" and ("公尺" in blob or re.search(r"\b\d+\s*m\b",blob,re.I)):
        reasons.append("長度題出現公尺，需人工確認二年級界線")
    for reason,words in checks:
        if words and any(word in blob for word in words): reasons.append(reason)
    if re.search(r"\b\d{4,}\b",blob): reasons.append("數值超過1000")
    if not answer: reasons.append("無法確定答案")
    meaningful=re.sub(r"[\s\d()（）.,，。⃝○□☐]+","",text)
    if len(meaningful) < 2 and not re.search(r"[＋+−\-×÷=＝＜＞<>]",text):
        reasons.append("題幹文字不足，無法判讀")
    return reasons

def parse_pdf(pdf_path,unit,download_record):
    try:
        import fitz
        from PIL import Image
    except ImportError as exc:
        return [],[{"unit":unit,"source_pdf":download_record["file"],"reason":"缺少本地 PyMuPDF/PIL 解析器","detail":str(exc)}],{"pages":0,"questions":0}
    mapping=[]; rejected=[]; image_root=ROOT/"source"/"ziyou_questions"/pdf_path.stem
    doc=fitz.open(pdf_path); answers={}
    for page_no,page in enumerate(doc):
        text=page.get_text().strip()
        if text.startswith("解答"):
            for match in re.finditer(r"\((\d{1,3})\)\s*([^\s]+)",text): answers[int(match.group(1))]=match.group(2)
    question_count=0
    for page_no,page in enumerate(doc):
        text=page.get_text().strip()
        if not text or text.startswith("解答"): continue
        marks=find_markers(page)
        for idx,(y0,num) in enumerate(marks):
            y1=marks[idx+1][0] if idx+1<len(marks) else page.rect.height-5
            clip=page.get_pixmap(clip=fitz.Rect(0,max(0,y0-8),page.rect.width,min(page.rect.height,y1)),matrix=fitz.Matrix(2,2),alpha=False)
            image_root.mkdir(parents=True,exist_ok=True); image_path=image_root/f"page{page_no+1:03d}_q{num:03d}.png"
            clip.save(str(image_path))
            raw_text=page.get_text("text",clip=fitz.Rect(0,max(0,y0-8),page.rect.width,min(page.rect.height,y1))).strip()
            answer=answers.get(num,""); reasons=curriculum_reasons(unit["name"],raw_text,answer)
            record={"source_pdf":download_record["file"],"page":page_no+1,"unit":unit,"question_number":num,
                    "sha256":download_record["sha256"],"raw_text":raw_text,"image_path":str(image_path.relative_to(ROOT)).replace("\\","/")}
            question_count+=1
            if reasons: rejected.append({**record,"reason":reasons})
            else: mapping.append({**record,"answer":answer})
    doc.close(); return mapping,rejected,{"pages":page_no+1 if 'page_no' in locals() else 0,"questions":question_count,"accepted":len(mapping),"rejected":len(rejected)}

def ingest():
    units=json.loads((SOURCE/"grade2_units.json").read_text(encoding="utf-8"))
    pdf_dir=SOURCE/"pdfs"; pdf_dir.mkdir(parents=True,exist_ok=True)
    opener=build_opener(HTTPCookieProcessor(CookieJar())); downloads=[]; mapping=[]; rejected=[]
    for unit in units:
        started=time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()); base=f"g2_u{unit['unit_index']:02d}_{unit['unit_id']}_{re.sub(r'[^A-Za-z0-9一-龥]+','_',unit['name'])}"
        target=pdf_dir/(base+".pdf"); record={"unit":unit,"retrieved_at":started,"file":str(target.relative_to(ROOT)).replace("\\","/")}
        try:
            url,params=generated_pdf_url(opener,unit); record.update({"url":url,"xajax":params})
            record.update(download_pdf(url,target)); record["status"]="downloaded"
            m,r,stats=parse_pdf(target,unit,record); mapping.extend(m); rejected.extend(r); record["parse"]=stats
        except (HTTPError,URLError,OSError,RuntimeError,ValueError) as exc:
            record.update({"status":"failed","reason":f"{type(exc).__name__}: {exc}"})
        downloads.append(record); atomic_json(SOURCE/"ziyou_downloads.json",downloads)
    atomic_json(ROOT/"source"/"ziyou_mapping.json",mapping); atomic_json(ROOT/"source"/"ziyou_rejected.json",rejected)
    success=sum(r.get("status")=="downloaded" for r in downloads); failed=len(downloads)-success
    parsed=sum((r.get("parse") or {}).get("questions",0) for r in downloads)
    report=("# Ziyou Grade 2 Ingestion Report\n\n"+f"- 執行時間：{time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}\n- 單元總數：{len(units)}\n- 下載成功：{success}\n- 下載失敗：{failed}\n- PDF 解析題數：{parsed}\n- 可判讀且通過 gate 題數：{len(mapping)}\n- rejected 題數：{len(rejected)}\n- 正式題庫：維持既有 seed bank，未替換\n\n## 阻塞與證據\n\n"+
            "下載紀錄見 `source/ziyou_downloads.json`；每個成功 PDF 保存在 `source/ziyou_raw/pdfs/`。"+
            ("\n目前解析器不可用，請安裝本機 PyMuPDF 後重跑 `--ingest`。" if any("缺少本地" in str(x.get("reason")) for x in rejected) else "")+
            "\n題目只有在答案可確定且通過二年級課綱 gate 時才進入 mapping；未通過者只保留於 rejected。\n")
    atomic_bytes(ROOT/"source"/"INGESTION_REPORT.md",report.encode("utf-8"))
    print(f"ingestion complete: units={len(units)} downloaded={success} failed={failed} accepted={len(mapping)} rejected={len(rejected)} seed_bank=kept")
    return 0

def fetch_probe():
    """Probe the local Ziyou xajax endpoint; raw response is saved for inspection."""
    import hashlib, tempfile
    SOURCE.mkdir(parents=True,exist_ok=True); opener=build_opener(HTTPCookieProcessor(CookieJar()))
    try:
        html=xajax(opener,"ch_unit_list",[2,"0","0,0,0,0,0"])
    except Exception as exc:
        raise RuntimeError(f"Ziyou probe failed: {exc}") from exc
    if len(html)<100 or "xajax" not in html:
        raise RuntimeError(f"Ziyou probe returned invalid response ({len(html)} bytes)")
    digest=hashlib.sha256(html.encode("utf-8")).hexdigest()
    target=SOURCE/"grade2_unit_probe.xml"
    fd,tmp=tempfile.mkstemp(prefix=".grade2_probe_",suffix=".tmp",dir=SOURCE)
    try:
        with open(fd,"w",encoding="utf-8",closefd=True) as f: f.write(html)
        Path(tmp).replace(target)
    except Exception:
        Path(tmp).unlink(missing_ok=True); raise
    metadata={"url":BASE+"drive_through.php","endpoint":BASE+"instant_theme.php","function":"ch_unit_list","grade_code":2,"bytes":len(html),"sha256":digest,"status":"raw_probe_only","retrieved_at":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime())}
    (SOURCE/"grade2_unit_probe.metadata.json").write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding="utf-8")
    units=[]
    for m in re.finditer(r"xajax_check_unit\(16,(\d+),(\d+)\).*?id='unit_ch\d+'.*?>([^<]+)<",html,re.S):
        units.append({"unit_id":int(m.group(1)),"unit_index":int(m.group(2)),"name":re.sub(r"\s+","",m.group(3))})
    if not units:
        raise RuntimeError("Ziyou probe contained no Grade 2 unit records")
    (SOURCE/"grade2_units.json").write_text(json.dumps(units,ensure_ascii=False,indent=2),encoding="utf-8")
    print(f"saved local Ziyou probe: {len(html)} bytes sha256={digest}")

if __name__ == "__main__":
    p=argparse.ArgumentParser(); p.add_argument("--probe",action="store_true"); p.add_argument("--seed",action="store_true"); p.add_argument("--ingest",action="store_true"); a=p.parse_args()
    if a.probe: fetch_probe()
    elif a.ingest: sys.exit(ingest())
    elif a.seed or not a.probe: build_seed()

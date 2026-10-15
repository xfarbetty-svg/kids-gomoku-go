# -*- coding: utf-8 -*-
"""
generate_curriculum_grade6_bank.py
專為台灣 108 課綱國小六年級打造的 20 王國 440 題冒險題庫生成器。
嚴格對齊 105-6年級數學.pdf 與中央大學子由數學小學堂情境：
1. 質數、合數、短除法與最大公因最小公倍 (6-n-01, 6-n-02, 6-n-03)
2. 分數除法倒數相乘與兩步驟運算 (6-n-04, 6-n-05)
3. 小數除法直式與四捨五入取商概數 (6-n-06, 6-n-07)
4. 比和比值、最簡整數比與正比 (6-n-09, 6-n-10)
5. 速度概念（時速分速秒速）與追趕相遇 (6-n-12, 6-n-13)
6. 圓周長與圓面積（使用 3.14）(6-n-14)
7. 直柱體體積與表面積（底面積×高、展開圖）(6-n-15)
8. 放大圖縮圖性質、立體空間垂直平行 (6-s-02, 6-s-04)
9. 等量公理與符號未知數方程式、圓形圖 (6-a-01, 6-a-02, 6-d-03)

產出合規之 app/rpg_world_map.json (20 王國, 440 題, 4 隻魔王/王國)
"""

import os
import sys
import json
import math
import random

sys.stdout.reconfigure(encoding="utf-8")

APP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app")
os.makedirs(APP_DIR, exist_ok=True)

KINGDOMS = [
    {"theme_id": "t01", "name": "質數合數神殿", "icon": "💎", "curriculum": "6-n-01", "desc": "質數合數判別與質因數短除法分解", "color": "#6366F1"},
    {"theme_id": "t02", "name": "短除雙峰之巔", "icon": "⛰️", "curriculum": "6-n-02", "desc": "短除法求最大公因數與最小公倍數", "color": "#3B82F6"},
    {"theme_id": "t03", "name": "互質純淨之泉", "icon": "💧", "curriculum": "6-n-03", "desc": "兩數互質判定與最簡分數約分", "color": "#06B6D4"},
    {"theme_id": "t04", "name": "分數倒數之門", "icon": "🚪", "curriculum": "6-n-04", "desc": "分數除以分數之顛倒相乘倒數法", "color": "#10B981"},
    {"theme_id": "t05", "name": "分數複合連環", "icon": "⛓️", "curriculum": "6-n-05", "desc": "分數兩步驟四則混合計算與括號優先", "color": "#F59E0B"},
    {"theme_id": "t06", "name": "小數長除裂隙", "icon": "⚡", "curriculum": "6-n-06", "desc": "小數除以小數小數點右移與餘數定位", "color": "#EC4899"},
    {"theme_id": "t07", "name": "概數精準之眼", "icon": "👁️", "curriculum": "6-n-07", "desc": "除不盡之四捨五入商的概數求值", "color": "#8B5CF6"},
    {"theme_id": "t08", "name": "比與比值天平", "icon": "⚖️", "curriculum": "6-n-09", "desc": "前項後項比值計算與最簡整數比", "color": "#14B8A6"},
    {"theme_id": "t09", "name": "成正比平衡軌", "icon": "🛤️", "curriculum": "6-n-10", "desc": "正比關係判別與正比圖形線段", "color": "#D97706"},
    {"theme_id": "t10", "name": "極速飛馳荒原", "icon": "🏎️", "curriculum": "6-n-12", "desc": "速度時間距離公式與時速分速秒速換算", "color": "#EF4444"},
    {"theme_id": "t11", "name": "追趕相遇戰線", "icon": "⚔️", "curriculum": "6-n-13", "desc": "追趕速度差與相向相遇速度和應用題", "color": "#F97316"},
    {"theme_id": "t12", "name": "圓周漫步星環", "icon": "🪐", "curriculum": "6-n-14", "desc": "圓周率3.14與直徑半徑求圓周長", "color": "#6366F1"},
    {"theme_id": "t13", "name": "圓面割補秘境", "icon": "🥧", "curriculum": "6-n-14", "desc": "半徑×半徑×3.14圓面積與環形面積", "color": "#EC4899"},
    {"theme_id": "t14", "name": "直柱體積神廟", "icon": "🏛️", "curriculum": "6-n-15", "desc": "角柱與圓柱之柱體體積底面積×高", "color": "#8B5CF6"},
    {"theme_id": "t15", "name": "柱體表面封印", "icon": "📦", "curriculum": "6-n-15", "desc": "柱體展開圖側面長方形與底面表面積", "color": "#3B82F6"},
    {"theme_id": "t16", "name": "縮放放大視界", "icon": "🔍", "curriculum": "6-s-02", "desc": "平面圖形放大縮小對邊長角度面積之變化", "color": "#10B981"},
    {"theme_id": "t17", "name": "空間平行垂面", "icon": "🧊", "curriculum": "6-s-04", "desc": "長方體柱體面與面平行垂直線面垂直", "color": "#4B5563"},
    {"theme_id": "t18", "name": "等量公理天平", "icon": "🪄", "curriculum": "6-a-01", "desc": "天平兩邊同加減乘除等量公理", "color": "#F59E0B"},
    {"theme_id": "t19", "name": "符號方程式塔", "icon": "📜", "curriculum": "6-a-02", "desc": "未知數符號x一步驟方程式列式與求解", "color": "#8B5CF6"},
    {"theme_id": "t20", "name": "圓形統計圖盤", "icon": "📊", "curriculum": "6-d-03", "desc": "報讀圓形圖與百分率圓心角360度計算", "color": "#059669"}
]

CHARACTERS = ["艾瑞克先鋒", "莫妮卡大法師", "里昂狂戰士", "黛安娜遊俠", "亞瑟聖騎士", "海倫娜占星師", "加勒特機關士", "貝阿特探險隊長",
              "齊格飛龍騎士", "卡特琳娜神官", "羅南智者", "西爾維亞斥候", "布蘭登工程師", "格蕾絲賢者", "馬克西姆守望者", "卡斯帕領航員",
              "特里斯坦巡守", "席琳暗影刺客", "奧古斯都帝王", "梅林大導師", "阿爾菲守護者", "尤利西斯航海家"]

def gcd(a, b):
    return b if a == 0 else gcd(b % a, a)

def lcm(a, b):
    return (a * b) // gcd(a, b)

def is_prime(n):
    if n < 2: return False
    for i in range(2, int(math.isqrt(n)) + 1):
        if n % i == 0: return False
    return True

def prime_factors(n):
    factors = []
    d = 2
    while d * d <= n:
        while n % d == 0:
            factors.append(d)
            n //= d
        d += 1
    if n > 1:
        factors.append(n)
    return factors

def make_distractors(ans_str, candidates):
    ans_s = str(ans_str).strip()
    cands = [str(c).strip() for c in candidates if str(c).strip() != ans_s]
    uniq_cands = []
    for c in cands:
        if c not in uniq_cands and c != ans_s:
            uniq_cands.append(c)
        if len(uniq_cands) == 3:
            break
            
    while len(uniq_cands) < 3:
        if ans_s.replace('.', '', 1).isdigit():
            val = float(ans_s)
            cand = f"{val + len(uniq_cands) + 1:.2f}".rstrip('0').rstrip('.')
        else:
            cand = f"選項{len(uniq_cands)+1}"
        if cand != ans_s and cand not in uniq_cands:
            uniq_cands.append(cand)
            
    opts = [ans_s] + uniq_cands[:3]
    random.shuffle(opts)
    correct_idx = opts.index(ans_s)
    return opts, correct_idx

def generate_g6_monsters(theme_info):
    tid = theme_info["theme_id"]
    monsters = []
    
    for m in range(1, 23):
        mid = f"{tid}-m{m:02d}"
        is_boss = (m in (5, 10, 15, 20))
        char = CHARACTERS[(m - 1) % len(CHARACTERS)]
        
        if tid == "t01": # 質數合數神殿 6-n-01
            num = 20 + m * 3
            p_list = prime_factors(num)
            pf_str = " × ".join(map(str, p_list))
            q_text = f"第 {m} 站：質因數分解：{char}要破解寶箱密碼，請將數字【{num}】進行質因數分解，寫成標準質因數連乘積是多少？"
            math_text = f"{num} 的質因數分解"
            ans = pf_str
            cands = [" × ".join(map(str, p_list[:-1] + [p_list[-1] + 1])), f"{num} × 1", " × ".join(map(str, [p_list[0]] + p_list))]
            opts, c = make_distractors(ans, cands)
            exp = f"短除法分解：{num} = {pf_str}。"
            
        elif tid == "t02": # 短除雙峰之巔 6-n-02
            n1 = 12 + m * 2
            n2 = 18 + m * 3
            g = gcd(n1, n2)
            l = lcm(n1, n2)
            if m % 2 == 1:
                q_text = f"第 {m} 站：短除法最大公因數：{char}用短除法求【{n1} 和 {n2}】的最大公因數是多少？"
                math_text = f"({n1}, {n2}) 的最大公因數"
                ans = str(g)
                opts, c = make_distractors(ans, [str(g * 2), str(max(1, g - 1)), str(l)])
                exp = f"兩數短除法最大公因數為左側除數相乘：({n1}, {n2}) = {g}。"
            else:
                q_text = f"第 {m} 站：短除法最小公倍數：{char}用短除法求【{n1} 和 {n2}】的最小公倍數是多少？"
                math_text = f"[{n1}, {n2}] 的最小公倍數"
                ans = str(l)
                opts, c = make_distractors(ans, [str(l + g), str(l - g), str(g)])
                exp = f"兩數短除法最小公倍數為左側除數乘以下方商：[{n1}, {n2}] = {l}。"
                
        elif tid == "t03": # 互質純淨之泉 6-n-03
            pair_a = 7 + (m % 5) * 2
            pair_b = pair_a + (m % 4) + 1
            if gcd(pair_a, pair_b) > 1: pair_b += 1
            is_coprime = (gcd(pair_a, pair_b) == 1)
            q_text = f"第 {m} 站：互質判定：觀察兩數【{pair_a} 和 {pair_b}】，它們的最大公因數是否為 1？這兩數是否互質？"
            math_text = f"{pair_a} 與 {pair_b} 是否互質？"
            ans = "互質（最大公因數為1）" if is_coprime else "不互質"
            opts, c = make_distractors(ans, ["不互質" if is_coprime else "互質（最大公因數為1）", "無法判定", "兩數皆為合數故不互質"])
            exp = f"因為 ({pair_a}, {pair_b}) = {gcd(pair_a, pair_b)}，所以兩數{'互質' if is_coprime else '不互質'}。"
            
        elif tid == "t04": # 分數倒數之門 6-n-04
            n1 = (m % 4) + 1
            d1 = n1 + 2
            n2 = (m % 3) + 1
            d2 = n2 + 3
            # n1/d1 / n2/d2 = (n1*d2)/(d1*n2)
            rn = n1 * d2
            rd = d1 * n2
            g = gcd(rn, rd)
            fn = rn // g
            fd = rd // g
            q_text = f"第 {m} 站：分數除以分數：{char}計算算式【{n1}/{d1} ÷ {n2}/{d2}】，顛倒相乘倒數計算，結果是多少？"
            math_text = f"{n1}/{d1} ÷ {n2}/{d2} = {n1}/{d1} × {d2}/{n2} = □"
            ans = f"{fn}/{fd}" if fd > 1 else str(fn)
            opts, c = make_distractors(ans, [f"{n1 * n2}/{d1 * d2}", f"{fn + 1}/{fd}", f"{fn}/{fd + 1}"])
            exp = f"乘以除數的倒數：{n1}/{d1} × {d2}/{n2} = {ans}。"
            
        elif tid == "t05": # 分數複合連環 6-n-05
            w = (m % 4) + 2
            frac_d = 5
            frac_n = 3
            # w - 1/5 * 2 = w - 2/5
            tot_d = frac_d
            tot_n = w * frac_d - frac_n
            q_text = f"第 {m} 站：分數兩步驟混合運算：{char}採集了 {w} 瓶魔力露水，調製藥劑用去了 {frac_n}/{frac_d} 瓶，還剩下幾瓶？"
            math_text = f"{w} - {frac_n}/{frac_d} = □"
            ans = f"{w - 1}又{frac_d - frac_n}/{frac_d}"
            opts, c = make_distractors(ans, [f"{w}又{frac_n}/{frac_d}", f"{w - 1}又{frac_n}/{frac_d}", f"{tot_n}/{frac_d + 1}"])
            exp = f"借 1 換成同分母假分數計算：{w} - {frac_n}/{frac_d} = {ans} 瓶。"
            
        elif tid == "t06": # 小數長除裂隙 6-n-06
            div = round(0.2 + (m % 4) * 0.1, 1)
            quo = round(1.5 + (m % 5) * 0.3, 1)
            dividend = round(div * quo, 2)
            q_text = f"第 {m} 站：小數除法直式：{char}將 {dividend} 公升精華液分裝入每瓶 {div} 公升的試管中，可以裝滿幾瓶？"
            math_text = f"{dividend} ÷ {div} = □"
            ans = str(int(quo)) if quo.is_integer() else f"{quo:.1f}"
            opts, c = make_distractors(ans, [f"{quo * 10:.1f}", f"{quo / 10:.2f}", f"{quo + 0.5:.1f}"])
            exp = f"除數小數點右移 1 位，被除數小數點同向右移 1 位：{dividend} ÷ {div} = {ans} 瓶。"
            
        elif tid == "t07": # 概數精準之眼 6-n-07
            a = 10 + m * 2
            b = 3 if m % 2 == 1 else 7
            val = a / b
            ans_round = round(val, 2)
            q_text = f"第 {m} 站：商的概數四捨五入：{char}計算【{a} ÷ {b}】，除不盡時用四捨五入法求商到小數點後第二位（百分位），答案是多少？"
            math_text = f"{a} ÷ {b} ≈ □（取到小數第二位）"
            ans = f"{ans_round:.2f}"
            opts, c = make_distractors(ans, [f"{ans_round + 0.01:.2f}", f"{ans_round - 0.01:.2f}", f"{ans_round + 0.1:.2f}"])
            exp = f"除到小數第三位看第四位四捨五入：{a} ÷ {b} ≈ {ans}。"
            
        elif tid == "t08": # 比與比值天平 6-n-09
            ant = 4 + (m % 5) * 2
            con = 6 + (m % 4) * 3
            g = gcd(ant, con)
            simp_ant = ant // g
            simp_con = con // g
            q_text = f"第 {m} 站：求最簡整數比：{char}調配合金，銅和鐵的重量比是【{ant}：{con}】，將其化為最簡整數比是多少？"
            math_text = f"{ant}：{con} 最簡整數比"
            ans = f"{simp_ant}：{simp_con}"
            opts, c = make_distractors(ans, [f"{simp_con}：{simp_ant}", f"{simp_ant + 1}：{simp_con}", f"{simp_ant}：{simp_con + 1}"])
            exp = f"前項與後項同除以最大公因數 {g}：最簡整數比為 {ans}。"
            
        elif tid == "t09": # 成正比平衡軌 6-n-10
            unit_price = 15 + m * 2
            q_text = f"第 {m} 站：正比關係判斷：購買魔法水晶的數量與總價錢，每顆單價固定為 {unit_price} 元，總價錢除以數量的比值固定不變，請問總價錢和數量是否成正比？"
            math_text = f"比值固定 = {unit_price}，是否成正比？"
            ans = "成正比（比值固定不變）"
            opts, c = make_distractors(ans, ["不成正比", "成反比", "無法判斷"])
            exp = f"當兩數量的比值（總價 ÷ 數量 = 單價 {unit_price}）固定不變時，這兩個量成正比。"
            
        elif tid == "t10": # 極速飛馳荒原 6-n-12
            speed_kmh = 60 + m * 5
            time_h = 2 if m % 2 == 1 else 3
            dist = speed_kmh * time_h
            q_text = f"第 {m} 站：速度時間距離計算：{char}駕駛懸浮巡航車以時速 {speed_kmh} 公里的速度行駛，連續行駛了 {time_h} 小時，一共行駛了多少公里？"
            math_text = f"{speed_kmh} × {time_h} = □"
            ans = f"{dist}公里"
            opts, c = make_distractors(ans, [f"{dist + 20}公里", f"{dist - 20}公里", f"{speed_kmh + time_h}公里"])
            exp = f"距離 ＝ 速度 × 時間：{speed_kmh} × {time_h} = {dist} 公里。"
            
        elif tid == "t11": # 追趕相遇戰線 6-n-13
            sp1 = 12 + m
            sp2 = 8 + m
            diff = sp1 - sp2
            dist_lead = diff * 3
            t = dist_lead // diff
            q_text = f"第 {m} 站：追趕速度差問題：快艇時速 {sp1} 公里、慢艇時速 {sp2} 公里，慢艇在前方 {dist_lead} 公里處，快艇每小時比慢艇多走 {diff} 公里，幾小時後能追上慢艇？"
            math_text = f"{dist_lead} ÷ ({sp1} - {sp2}) = □"
            ans = f"{t}小時"
            opts, c = make_distractors(ans, [f"{t + 1}小時", f"{max(1, t - 1)}小時", f"{t + 2}小時"])
            exp = f"追趕時間 ＝ 距離差 ÷ 速度差：{dist_lead} ÷ {diff} = {t} 小時。"
            
        elif tid == "t12": # 圓周漫步星環 6-n-14
            r = (m % 5) + 3
            d = r * 2
            c_val = round(d * 3.14, 2)
            q_text = f"第 {m} 站：求圓周長：星際圓形傳送環的半徑是 {r} 公尺（直徑是 {d} 公尺），圓周率按 3.14 計算，請問這個圓環的圓周長是多少公尺？"
            math_text = f"{d} × 3.14 = □"
            ans = f"{c_val:.2f}".rstrip('0').rstrip('.') + "公尺"
            opts, c = make_distractors(ans, [f"{c_val + 3.14:.2f}公尺", f"{c_val - 3.14:.2f}公尺", f"{r * 3.14:.2f}公尺"])
            exp = f"圓周長公式 ＝ 直徑 × 3.14：{d} × 3.14 = {ans}。"
            
        elif tid == "t13": # 圓面割補秘境 6-n-14
            r = (m % 6) + 2
            a_val = round(r * r * 3.14, 2)
            q_text = f"第 {m} 站：求圓面積：圓形祭壇的半徑是 {r} 公尺，圓周率按 3.14 計算，請問祭壇的面積是多少平方公尺？"
            math_text = f"{r} × {r} × 3.14 = □"
            ans = f"{a_val:.2f}".rstrip('0').rstrip('.') + "平方公尺"
            opts, c = make_distractors(ans, [f"{r * 2 * 3.14:.2f}平方公尺", f"{a_val + 10:.2f}平方公尺", f"{a_val - 10:.2f}平方公尺"])
            exp = f"圓面積公式 ＝ 半徑 × 半徑 × 3.14：{r} × {r} × 3.14 = {ans}。"
            
        elif tid == "t14": # 直柱體積神廟 6-n-15
            base_area = 20 + m * 5
            h = (m % 5) + 4
            vol = base_area * h
            q_text = f"第 {m} 站：柱體體積計算：古代神殿巨石柱（直柱體）的底面積是 {base_area} 平方公分，柱體高度是 {h} 公分，這根石柱的體積是多少立方公分？"
            math_text = f"{base_area} × {h} = □"
            ans = f"{vol}立方公分"
            opts, c = make_distractors(ans, [f"{vol + base_area}立方公分", f"{vol - base_area}立方公分", f"{base_area + h}立方公分"])
            exp = f"柱體體積公式 ＝ 底面積 × 高：{base_area} × {h} = {vol} 立方公分。"
            
        elif tid == "t15": # 柱體表面封印 6-n-15
            side = (m % 4) + 3
            h = (m % 3) + 4
            # 正四角柱: 2底 + 4側 = 2*(s*s) + 4*(s*h)
            base_a = side * side
            lat_a = 4 * side * h
            tot_surf = 2 * base_a + lat_a
            q_text = f"第 {m} 站：正四角柱表面積：底面為邊長 {side} 公分正方形、高為 {h} 公分的直四角柱，其表面積（2個底面加4個側面展開）是多少平方公分？"
            math_text = f"2 × ({side}×{side}) + 4 × ({side}×{h}) = □"
            ans = f"{tot_surf}平方公分"
            opts, c = make_distractors(ans, [f"{tot_surf + 10}平方公分", f"{tot_surf - 10}平方公分", f"{base_a * h}平方公分"])
            exp = f"表面積 ＝ 兩底面積 ＋ 側面展開面積：2×{base_a} ＋ {lat_a} = {tot_surf} 平方公分。"
            
        elif tid == "t16": # 縮放放大視界 6-s-02
            scale = (m % 3) + 2
            orig_len = (m % 4) + 3
            scaled_len = orig_len * scale
            q_text = f"第 {m} 站：放大圖邊長與角度性質：若將一個三角形依照【{scale}倍放大圖】進行放大，原本長度為 {orig_len} 公分的邊，放大後的對應邊長是多少公分？對應角度是否會改變？"
            math_text = f"{orig_len} × {scale} = □，角度變化？"
            ans = f"{scaled_len}公分，對應角大小不變"
            opts, c = make_distractors(ans, [f"{scaled_len}公分，對應角放大{scale}倍", f"{orig_len + scale}公分，對應角大小不變", f"{scaled_len}公分，角度無法確定"])
            exp = f"放大縮小性質：邊長變為 {scale} 倍（{scaled_len}公分），但各對應角大小保持不變。"
            
        elif tid == "t17": # 空間平行垂面 6-s-04
            q_text = f"第 {m} 站：長方體面與面位置關係：觀察長方體教室，天花板所在的平面和地板所在的平面，在幾何空間中是什麼位置關係？"
            math_text = f"長方體上下兩底面之幾何關係"
            ans = "互相平行"
            opts, c = make_distractors(ans, ["互相垂直", "相交於一直線", "既不平行也不垂直"])
            exp = f"長方體的相對兩面互相平行，相鄰兩面互相垂直，故上下兩面互相平行。"
            
        elif tid == "t18": # 等量公理天平 6-a-01
            add_val = 15 + m * 2
            res_val = add_val + (m % 5 + 4)
            x_val = res_val - add_val
            q_text = f"第 {m} 站：等量加減公理求未知數：已知天平平衡算式【x ＋ {add_val} ＝ {res_val}】，利用等量公理左右同減去 {add_val}，x 的值是多少？"
            math_text = f"x + {add_val} = {res_val}，x = {res_val} - {add_val} = □"
            ans = str(x_val)
            opts, c = make_distractors(ans, [str(x_val + 1), str(max(1, x_val - 1)), str(res_val + add_val)])
            exp = f"等量公理：等號兩邊同時減去 {add_val}，得到 x = {x_val}。"
            
        elif tid == "t19": # 符號方程式塔 6-a-02
            factor = (m % 4) + 2
            ans_x = (m % 6) + 3
            prod = factor * ans_x
            q_text = f"第 {m} 站：等量乘除公理求解：{char}購置了 {factor} 套相同的探險裝備，總價為 {prod} 金幣，設每套裝備為 x 金幣，列出【{factor} × x ＝ {prod}】，求 x 是多少？"
            math_text = f"{factor} × x = {prod}，x = {prod} ÷ {factor} = □"
            ans = str(ans_x)
            opts, c = make_distractors(ans, [str(ans_x + 1), str(max(1, ans_x - 1)), str(prod - factor)])
            exp = f"等號兩邊同時除以 {factor}：x = {prod} ÷ {factor} = {ans_x} 金幣。"
            
        else: # t20: 圓形統計圖盤 6-d-03
            pct = [10, 20, 25, 50][(m - 1) % 4]
            deg = int(360 * (pct / 100))
            q_text = f"第 {m} 站：百分率圓形圖圓心角：圖書館藏書統計圓形圖中，冒險小說類佔了全館的【{pct}%】，請問這一部份在圓形圖上對應的圓心角是多少度？"
            math_text = f"360° × {pct}% = □°"
            ans = f"{deg}度"
            opts, c = make_distractors(ans, [f"{deg + 15}度", f"{max(15, deg - 15)}度", f"{deg + 30}度"])
            exp = f"整個圓為 360 度，{pct}% 的圓心角就是 360° × {pct/100} = {deg} 度。"
            
        monsters.append({
            "id": mid,
            "question": q_text,
            "math": math_text,
            "options": opts,
            "correct": c,
            "answer": ans,
            "explanation": exp,
            "difficulty": 3,
            "source": {
                "kind": "seed",
                "provider": "Ziyou Mathematics School",
                "url": "https://emath.math.ncu.edu.tw/e_school/drive_through.php",
                "curriculum_ref": "https://priori.moe.gov.tw/resource/material/",
                "status": "seed_pending_local_ziyou_review"
            },
            "theme_id": tid,
            "is_boss": is_boss,
            "boss_handwritten": is_boss,
            "avatar": theme_info["icon"],
            "name": f"{theme_info['name']}的大魔王" if is_boss else f"{theme_info['name']}的衛隊",
            "max_hp": 350 if is_boss else 150,
            "reward_gold": 80 if is_boss else 20,
            "reward_exp": 150 if is_boss else 30,
            "spell": "👑 幻滅王座極限衝擊" if is_boss else "⚡ 柱體幾何術",
            "win_quote": "不可思議！小學數學最高殿堂征服完成！",
            "story": f"迎戰{theme_info['name']}的終極考驗關卡第 {m} 戰！",
            "dialogue": f"我是{theme_info['name']}的守門者，證明你已掌握小學巔峰的數學法則吧！",
            "hint": exp
        })
        
    return {
        "theme_id": tid,
        "kingdom_name": f"{theme_info['icon']} {theme_info['name']}",
        "curriculum": theme_info["curriculum"],
        "icon": theme_info["icon"],
        "theme_color": theme_info["color"],
        "desc": theme_info["desc"],
        "monsters": monsters
    }

def main():
    world_map = []
    total_q = 0
    total_bosses = 0
    
    for theme in KINGDOMS:
        t_data = generate_g6_monsters(theme)
        world_map.append(t_data)
        total_q += len(t_data["monsters"])
        total_bosses += sum(1 for m in t_data["monsters"] if m["is_boss"])
        
    out_path = os.path.join(APP_DIR, "rpg_world_map.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(world_map, f, ensure_ascii=False, indent=2)
        
    print(f"🎉 小六產出成功！共 {len(world_map)} 王國，{total_q} 題，{total_bosses} 隻魔王。")
    print(f"檔案寫入: {out_path}")

if __name__ == "__main__":
    main()

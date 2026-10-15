# -*- coding: utf-8 -*-
"""
generate_curriculum_grade5_bank.py
專為台灣 108 課綱國小五年級打造的 22 王國 484 題冒險題庫生成器。
嚴格對齊 105-5年級數學.pdf 與中央大學子由數學小學堂情境：
1. 多位整數乘除直式與運算性質 (5-n-01, 5-a-01, 5-a-03)
2. 因數倍數、公因公倍與短除法 (5-n-04, 5-n-05)
3. 等值分數、約分擴分、通分加減 (5-n-06, 5-n-07)
4. 分數乘法與分數除以整數 (5-n-08, 5-n-09)
5. 多位小數加減、小數乘法、除法商為小數 (5-n-10, 5-n-11, 5-n-12)
6. 分數小數數線定位與比率百分率 (5-n-13, 5-n-14)
7. 時間乘除、公噸、公畝公頃平方公里 (5-n-15, 5-n-16, 5-n-17)
8. 三角形平行四邊形梯形面積、體積容積 (5-n-18, 5-n-19, 5-n-20, 5-n-21)
9. 扇形圓心角與線對稱圖形 (5-s-03, 5-s-04)

產出合規之 app/rpg_world_map.json (22 王國, 484 題, 4 隻魔王/王國)
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
    {"theme_id": "t01", "name": "多位乘除聖殿", "icon": "⚡", "curriculum": "5-n-01", "desc": "多位整數直式乘法與長除法試商", "color": "#3B82F6"},
    {"theme_id": "t02", "name": "運算定律之城", "icon": "🏛️", "curriculum": "5-a-01", "desc": "乘法分配律結合律與簡化巧算", "color": "#6366F1"},
    {"theme_id": "t03", "name": "因數倍數密室", "icon": "🗝️", "curriculum": "5-n-04", "desc": "列舉因數與2,3,5,10倍數判別", "color": "#8B5CF6"},
    {"theme_id": "t04", "name": "公因公倍神樹", "icon": "🌳", "curriculum": "5-n-05", "desc": "最大公因數與最小公倍數生活平分", "color": "#10B981"},
    {"theme_id": "t05", "name": "約分擴分工坊", "icon": "⚖️", "curriculum": "5-n-06", "desc": "等值分數換算與最簡分數", "color": "#14B8A6"},
    {"theme_id": "t06", "name": "通分加減之塔", "icon": "🗼", "curriculum": "5-n-07", "desc": "異分母分數通分加法與減法", "color": "#06B6D4"},
    {"theme_id": "t07", "name": "分數相乘祭壇", "icon": "✨", "curriculum": "5-n-08", "desc": "整數乘分數與分數乘分數運算", "color": "#F59E0B"},
    {"theme_id": "t08", "name": "分數均分之泉", "icon": "💧", "curriculum": "5-n-09", "desc": "分數除以整數的生活平分情境", "color": "#0284C7"},
    {"theme_id": "t09", "name": "多位小數星河", "icon": "🌌", "curriculum": "5-n-10", "desc": "千分位與萬分位小數加減位值", "color": "#6366F1"},
    {"theme_id": "t10", "name": "小數乘法光階", "icon": "🌠", "curriculum": "5-n-11", "desc": "乘數是小數之小數點位數定位", "color": "#EC4899"},
    {"theme_id": "t11", "name": "除法轉化幻境", "icon": "🔮", "curriculum": "5-n-12", "desc": "整數除以整數商為小數補零運算", "color": "#8B5CF6"},
    {"theme_id": "t12", "name": "數線定位羅盤", "icon": "🧭", "curriculum": "5-n-13", "desc": "分數與小數在數線上的精確刻度", "color": "#D97706"},
    {"theme_id": "t13", "name": "百分率商會島", "icon": "🪙", "curriculum": "5-n-14", "desc": "比率、百分率折扣與生活應用", "color": "#10B981"},
    {"theme_id": "t14", "name": "時光穿梭輪盤", "icon": "⏳", "curriculum": "5-n-15", "desc": "日日時分秒時間之乘除計算", "color": "#F59E0B"},
    {"theme_id": "t15", "name": "萬鈞公噸地脈", "icon": "⛰️", "curriculum": "5-n-16", "desc": "重量單位公噸與公斤生活換算", "color": "#4B5563"},
    {"theme_id": "t16", "name": "廣袤大地界碑", "icon": "🗺️", "curriculum": "5-n-17", "desc": "公畝、公頃、平方公里土地面積換算", "color": "#059669"},
    {"theme_id": "t17", "name": "幾何面積秘境", "icon": "📐", "curriculum": "5-n-18", "desc": "三角形、平行四邊形與梯形面積公式", "color": "#3B82F6"},
    {"theme_id": "t18", "name": "立方公尺天域", "icon": "🧊", "curriculum": "5-n-19", "desc": "體積立方公尺與立方公分換算", "color": "#06B6D4"},
    {"theme_id": "t19", "name": "長方正方體積堡", "icon": "🏰", "curriculum": "5-n-20", "desc": "長方體與正方體體積公式計算", "color": "#8B5CF6"},
    {"theme_id": "t20", "name": "容積容量水晶宮", "icon": "🏺", "curriculum": "5-n-21", "desc": "容積容量與體積毫升公升換算", "color": "#14B8A6"},
    {"theme_id": "t21", "name": "扇形圓心角星宿", "icon": "🍕", "curriculum": "5-s-03", "desc": "扇形、圓心角度數與幾分之幾圓", "color": "#F59E0B"},
    {"theme_id": "t22", "name": "對稱鏡射幻境", "icon": "🪞", "curriculum": "5-s-04", "desc": "線對稱圖形、對稱軸與對稱點邊角", "color": "#EC4899"}
]

CHARACTERS = ["艾倫隊長", "米拉法師", "雷歐遊俠", "索菲亞學者", "凱爾騎士", "露娜牧師", "巴德工匠", "希爾達探險家",
              "諾亞領航員", "賽琳娜守衛", "奧斯丁商人", "克洛伊藥劑師", "費利克斯哨兵", "薇薇安植物學家", "加百列石匠", "伊芙琳天文家",
              "達米安鍛造師", "比阿特麗斯地圖師", "萊恩學者", "卡蜜拉信使", "瓦倫丁學者", "提摩太守望者"]

def gcd(a, b):
    return b if a == 0 else gcd(b % a, a)

def lcm(a, b):
    return (a * b) // gcd(a, b)

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

def generate_g5_monsters(theme_info):
    tid = theme_info["theme_id"]
    monsters = []
    
    for m in range(1, 23):
        mid = f"{tid}-m{m:02d}"
        is_boss = (m in (5, 10, 15, 20))
        char = CHARACTERS[(m - 1) % len(CHARACTERS)]
        
        if tid == "t01": # 多位乘除聖殿 5-n-01
            if m % 2 == 1:
                a = 1200 + m * 85
                b = 15 + m * 3
                val = a * b
                q_text = f"第 {m} 站：星際物資運輸：{char}調配物資，每艘太空貨船載運 {a} 公斤礦石，共派出 {b} 艘貨船，請問一共載運多少公斤礦石？"
                math_text = f"{a} × {b} = □"
                ans = str(val)
                opts, c = make_distractors(ans, [val + 100, val - 100, a * (b - 1), (a + 10) * b])
                exp = f"利用整數直式乘法：{a} × {b} = {val} 公斤。"
            else:
                b = 25 + m * 2
                val = 40 + m * 5
                rem = (m % 10) + 2
                a = b * val + rem
                q_text = f"第 {m} 站：古代金幣平分：{char}挖掘出 {a} 枚金幣，平均分裝給 {b} 位冒險者，每人分得幾枚金幣？還剩下幾枚？"
                math_text = f"{a} ÷ {b} = □ ... □"
                ans = f"每人{val}枚，剩下{rem}枚"
                opts, c = make_distractors(ans, [f"每人{val-1}枚，剩下{rem+b}枚", f"每人{val+1}枚，剩下{rem}枚", f"每人{val}枚，剩下{rem+1}枚"])
                exp = f"整數長除法試商：{a} ÷ {b} = {val} 餘 {rem}。"
                
        elif tid == "t02": # 運算定律之城 5-a-01
            a = 25 if m % 2 == 1 else 125
            c_val = 4 if m % 2 == 1 else 8
            b = 13 + m * 2
            val = a * b * c_val
            q_text = f"第 {m} 站：乘法結合律巧算：{char}計算算式【{a} × {b} × {c_val}】，利用乘法交換律與結合律，先算 {a} × {c_val} = {a * c_val}，總積是多少？"
            math_text = f"({a} × {c_val}) × {b} = □"
            ans = str(val)
            opts, c = make_distractors(ans, [val + 100, val - 100, val + 1000, val - 1000])
            exp = f"利用乘法結合律：先算 {a} × {c_val} = {a * c_val}，再乘 {b} 得到 {val}。"
            
        elif tid == "t03": # 因數倍數密室 5-n-04
            num = 18 + m * 2
            factors = [i for i in range(1, num + 1) if num % i == 0]
            f_count = len(factors)
            q_text = f"第 {m} 站：因數密碼門：{char}需要解開數字【{num}】的所有因數，請問 {num} 一共有幾個因數？"
            math_text = f"{num} 的因數個數"
            ans = f"{f_count}個"
            opts, c = make_distractors(ans, [f"{f_count + 1}個", f"{max(1, f_count - 1)}個", f"{f_count + 2}個"])
            exp = f"{num} 的因數有：{', '.join(map(str, factors))}，共 {f_count} 個。"
            
        elif tid == "t04": # 公因公倍神樹 5-n-05
            n1 = 12 + (m % 5) * 4
            n2 = 18 + (m % 4) * 6
            g = gcd(n1, n2)
            q_text = f"第 {m} 站：彩帶平分剪裁：{char}有兩條長度分別為 {n1} 公分和 {n2} 公分的鍛帶，想剪成一樣長且沒有剩餘的最長小段，每段是幾公分？"
            math_text = f"({n1}, {n2}) 的最大公因數"
            ans = f"{g}公分"
            opts, c = make_distractors(ans, [f"{g * 2}公分", f"{max(1, g - 1)}公分", f"{g + 2}公分"])
            exp = f"求 {n1} 與 {n2} 的最大公因數：({n1}, {n2}) = {g} 公分。"
            
        elif tid == "t05": # 約分擴分工坊 5-n-06
            factor = (m % 4) + 2
            simp_n = (m % 5) + 1
            simp_d = simp_n + (m % 3) + 1
            if gcd(simp_n, simp_d) > 1: simp_d += 1
            big_n = simp_n * factor
            big_d = simp_d * factor
            q_text = f"第 {m} 站：等值分數約分：{char}需要將分數【{big_n}/{big_d}】化為最簡分數，請問分子與分母同除以最大公因數 {factor} 後是多少？"
            math_text = f"{big_n}/{big_d} 約分"
            ans = f"{simp_n}/{simp_d}"
            opts, c = make_distractors(ans, [f"{simp_n + 1}/{simp_d}", f"{simp_n}/{simp_d + 1}", f"{big_n // 2}/{big_d // 2}"])
            exp = f"分子分母同除以最大公因數 {factor}：{big_n}/{big_d} = {simp_n}/{simp_d}。"
            
        elif tid == "t06": # 通分加減之塔 5-n-07
            d1 = 3 if m % 2 == 1 else 4
            d2 = 5 if m % 2 == 1 else 6
            n1 = 1
            n2 = 1
            comm = lcm(d1, d2)
            m1 = comm // d1
            m2 = comm // d2
            sum_n = n1 * m1 + n2 * m2
            g = gcd(sum_n, comm)
            fin_n = sum_n // g
            fin_d = comm // g
            q_text = f"第 {m} 站：異分母分數通分加法：{char}調配魔藥，先倒入 {n1}/{d1} 杯露水，再加入 {n2}/{d2} 杯泉水，合起來共有幾杯？"
            math_text = f"{n1}/{d1} + {n2}/{d2} = □"
            ans = f"{fin_n}/{fin_d}"
            opts, c = make_distractors(ans, [f"{n1 + n2}/{d1 + d2}", f"{fin_n + 1}/{fin_d}", f"{fin_n}/{fin_d + 2}"])
            exp = f"分母通分為最小公倍數 {comm}：{n1*m1}/{comm} + {n2*m2}/{comm} = {fin_n}/{fin_d} 杯。"
            
        elif tid == "t07": # 分數相乘祭壇 5-n-08
            num = (m % 4) + 1
            den = num + (m % 3) + 2
            w = (m % 5) + 2
            prod_n = num * w
            g = gcd(prod_n, den)
            fin_n = prod_n // g
            fin_d = den // g
            q_text = f"第 {m} 站：整數乘分數：一袋魔法果乾重 {num}/{den} 公斤，{char}買了 {w} 袋，一共重多少公斤？"
            math_text = f"{num}/{den} × {w} = □"
            ans = f"{fin_n}/{fin_d}公斤" if fin_d > 1 else f"{fin_n}公斤"
            opts, c = make_distractors(ans, [f"{prod_n + 1}/{den}公斤", f"{num}/{den * w}公斤", f"{fin_n + 2}/{fin_d}公斤"])
            exp = f"整數乘分數：分子乘整數，分母不變，約分後得到 {ans}。"
            
        elif tid == "t08": # 分數均分之泉 5-n-09
            n = (m % 4) + 2
            d = n + 3
            divisor = (m % 3) + 2
            fin_d = d * divisor
            q_text = f"第 {m} 站：分數除以整數：一壺容量為 {n}/{d} 公升的花茶，{char}平均分倒成 {divisor} 杯，每杯花茶有多少公升？"
            math_text = f"({n}/{d}) ÷ {divisor} = □"
            ans = f"{n}/{fin_d}公升"
            opts, c = make_distractors(ans, [f"{n * divisor}/{d}公升", f"{n}/{d + divisor}公升", f"{n + 1}/{fin_d}公升"])
            exp = f"分數除以整數等於乘以該整數的倒數：{n}/{d} × 1/{divisor} = {n}/{fin_d} 公升。"
            
        elif tid == "t09": # 多位小數星河 5-n-10
            v1 = round(12.345 + m * 0.412, 3)
            v2 = round(5.123 + (m % 4) * 0.321, 3)
            tot = round(v1 + v2, 3)
            q_text = f"第 {m} 站：千分位小數加法：第一顆彗星質量為 {v1} 單位，第二顆為 {v2} 單位，兩顆彗星合起來的質量是多少？"
            math_text = f"{v1} + {v2} = □"
            ans = f"{tot:.3f}".rstrip('0').rstrip('.')
            opts, c = make_distractors(ans, [f"{tot + 0.1:.3f}".rstrip('0'), f"{tot - 0.01:.3f}".rstrip('0'), f"{tot + 0.002:.3f}".rstrip('0')])
            exp = f"小數點對齊後相加：{v1} + {v2} = {ans}。"
            
        elif tid == "t10": # 小數乘法光階 5-n-11
            a = round(2.5 + (m % 5) * 0.4, 1)
            b = round(1.2 + (m % 4) * 0.3, 1)
            val = round(a * b, 2)
            q_text = f"第 {m} 站：小數乘小數：長方形魔法符咒的長是 {a} 公尺，寬是 {b} 公尺，符咒的面積是多少平方公尺？"
            math_text = f"{a} × {b} = □"
            ans = f"{val:.2f}".rstrip('0').rstrip('.')
            opts, c = make_distractors(ans, [f"{val * 10:.2f}".rstrip('0'), f"{val / 10:.3f}".rstrip('0'), f"{val + 0.2:.2f}".rstrip('0')])
            exp = f"先按整數相乘，兩數小數位數共 1+1=2 位，積的小數點向左移 2 位：{ans} 平方公尺。"
            
        elif tid == "t11": # 除法轉化幻境 5-n-12
            dividend = 15 + m * 3
            divisor = 4 if m % 2 == 1 else 8
            val = round(dividend / divisor, 3)
            q_text = f"第 {m} 站：商為小數的除法：{char}將 {dividend} 公尺長的彩帶平分給 {divisor} 位同學，每人分得幾公尺彩帶？"
            math_text = f"{dividend} ÷ {divisor} = □"
            ans = f"{val:.3f}".rstrip('0').rstrip('.')
            opts, c = make_distractors(ans, [f"{val + 0.5:.2f}".rstrip('0'), f"{val - 0.25:.2f}".rstrip('0'), f"{val + 1:.2f}".rstrip('0')])
            exp = f"整數除以整數，不夠除補 0 繼續除：{dividend} ÷ {divisor} = {ans} 公尺。"
            
        elif tid == "t12": # 數線定位羅盤 5-n-13
            base = m % 6 + 1
            frac_num = (m % 3) + 1
            q_text = f"第 {m} 站：數線刻度定位：數線上從 {base} 到 {base + 1} 之間被等分成 4 格，指針指向第 {frac_num} 個刻度，這個數是多少？"
            math_text = f"{base} 又 4分之{frac_num}"
            ans = f"{base}又{frac_num}/4"
            opts, c = make_distractors(ans, [f"{base}又{frac_num + 1}/4", f"{base + 1}又{frac_num}/4", f"{base}/4"])
            exp = f"整數為 {base}，每格為 1/4，走過 {frac_num} 格，所以是 {base}又{frac_num}/4。"
            
        elif tid == "t13": # 百分率商會島 5-n-14
            total = 100 if m % 2 == 1 else 50
            part = (m * 4) % 36 + 10
            pct = int((part / total) * 100)
            q_text = f"第 {m} 站：百分率計算：{char}進行弓箭射靶訓練，總共射出 {total} 箭，命中目標 {part} 箭，請問命中率是多少百分率（%）？"
            math_text = f"({part} ÷ {total}) × 100% = □"
            ans = f"{pct}%"
            opts, c = make_distractors(ans, [f"{pct + 5}%", f"{max(1, pct - 5)}%", f"{pct + 10}%"])
            exp = f"部分量除以全部量：{part} ÷ {total} = {pct / 100} = {pct}%。"
            
        elif tid == "t14": # 時光穿梭輪盤 5-n-15
            hours = (m % 4) + 1
            minutes = (m % 5 + 1) * 10
            repeat = (m % 3) + 2
            tot_min = (hours * 60 + minutes) * repeat
            res_h = tot_min // 60
            res_m = tot_min % 60
            q_text = f"第 {m} 站：時間的乘法：{char}每天冥想修煉 {hours} 小時 {minutes} 分鐘，連續修煉 {repeat} 天，一共修煉了多少時間？"
            math_text = f"({hours}小時{minutes}分) × {repeat} = □"
            ans = f"{res_h}小時{res_m}分" if res_m > 0 else f"{res_h}小時"
            opts, c = make_distractors(ans, [f"{res_h + 1}小時{res_m}分", f"{max(1, res_h - 1)}小時{res_m}分", f"{res_h}小時{res_m + 10}分"])
            exp = f"分別相乘後進位：總共等於 {ans}。"
            
        elif tid == "t15": # 萬鈞公噸地脈 5-n-16
            t_val = (m % 5) + 2
            kg_val = t_val * 1000
            q_text = f"第 {m} 站：重量單位換算：採礦重型卡車滿載重量為 {t_val} 公噸，請問等於多少公斤？"
            math_text = f"{t_val} 公噸 = □ 公斤"
            ans = f"{kg_val}公斤"
            opts, c = make_distractors(ans, [f"{kg_val // 10}公斤", f"{kg_val * 10}公斤", f"{kg_val + 500}公斤"])
            exp = f"1 公噸 = 1000 公斤，所以 {t_val} 公噸 = {kg_val} 公斤。"
            
        elif tid == "t16": # 廣袤大地界碑 5-n-17
            ha_val = (m % 6) + 3
            a_val = ha_val * 100
            q_text = f"第 {m} 站：面積公頃公畝換算：國家森林保護區的面積是 {ha_val} 公頃，請問等於多少公畝？"
            math_text = f"{ha_val} 公頃 = □ 公畝"
            ans = f"{a_val}公畝"
            opts, c = make_distractors(ans, [f"{a_val // 10}公畝", f"{a_val * 10}公畝", f"{ha_val * 1000}公畝"])
            exp = f"1 公頃 = 100 公畝，所以 {ha_val} 公頃 = {a_val} 公畝。"
            
        elif tid == "t17": # 幾何面積秘境 5-n-18
            base = (m % 7) + 6
            height = (m % 5) + 4
            area = (base * height) // 2
            q_text = f"第 {m} 站：三角形面積計算：三角魔法結界的底是 {base} 公分，高是 {height} 公分，請問面積是多少平方公分？"
            math_text = f"({base} × {height}) ÷ 2 = □"
            ans = f"{area}平方公分"
            opts, c = make_distractors(ans, [f"{base * height}平方公分", f"{area + 4}平方公分", f"{max(1, area - 4)}平方公分"])
            exp = f"三角形面積公式為（底 × 高）÷ 2：({base} × {height}) ÷ 2 = {area} 平方公分。"
            
        elif tid == "t18": # 立方公尺天域 5-n-19
            m3_val = (m % 4) + 1
            cm3_val = m3_val * 1000000
            q_text = f"第 {m} 站：體積單位換算：蓄水池的體積是 {m3_val} 立方公尺，請問等於多少立方公分？"
            math_text = f"{m3_val} 立方公尺 = □ 立方公分"
            ans = f"{cm3_val}立方公分"
            opts, c = make_distractors(ans, [f"{m3_val * 1000}立方公分", f"{m3_val * 10000}立方公分", f"{m3_val * 100000}立方公分"])
            exp = f"1 立方公尺 = 1000000 立方公分，故 {m3_val} 立方公尺 = {cm3_val} 立方公分。"
            
        elif tid == "t19": # 長方正方體積堡 5-n-20
            l = (m % 4) + 4
            w = (m % 3) + 3
            h = (m % 3) + 2
            vol = l * w * h
            q_text = f"第 {m} 站：長方體體積計算：寶箱的長度為 {l} 公分、寬度為 {w} 公分、高度為 {h} 公分，這個寶箱的體積是多少立方公分？"
            math_text = f"{l} × {w} × {h} = □"
            ans = f"{vol}立方公分"
            opts, c = make_distractors(ans, [f"{vol + 10}立方公分", f"{vol - 10}立方公分", f"{(l + w + h) * 2}立方公分"])
            exp = f"長方體體積公式為 長 × 寬 × 高：{l} × {w} × {h} = {vol} 立方公分。"
            
        elif tid == "t20": # 容積容量水晶宮 5-n-21
            cap_l = (m % 4) + 2
            vol_cm3 = cap_l * 1000
            q_text = f"第 {m} 站：容量與容積換算：魔法水壺裝滿剛好是 {cap_l} 公升的水，請問這壺水的體積是多少立方公分？"
            math_text = f"{cap_l} 公升 = □ 立方公分"
            ans = f"{vol_cm3}立方公分"
            opts, c = make_distractors(ans, [f"{cap_l * 100}立方公分", f"{cap_l * 10}立方公分", f"{vol_cm3 + 500}立方公分"])
            exp = f"1 公升 = 1000 毫升 = 1000 立方公分，因此 {cap_l} 公升 = {vol_cm3} 立方公分。"
            
        elif tid == "t21": # 扇形圓心角星宿 5-s-03
            frac_name, deg = [("四分之一圓", 90), ("半圓（二分之一圓）", 180), ("六分之一圓", 60), ("三分之一圓", 120)][(m - 1) % 4]
            q_text = f"第 {m} 站：扇形圓心角度數：星空中的扇形星座恰好是【{frac_name}】，請問這個扇形的圓心角是多少度？"
            math_text = f"360° 的 {frac_name} = □°"
            ans = f"{deg}度"
            opts, c = make_distractors(ans, [f"{deg + 30}度", f"{max(15, deg - 30)}度", f"{deg + 45}度"])
            exp = f"整個圓周為 360 度，{frac_name} 的圓心角就是 360° 乘以對應比例，得到 {deg} 度。"
            
        else: # t22: 對稱鏡射幻境 5-s-04
            shape_name, axis_count = [
                ("正方形", 4), ("長方形", 2), ("等腰三角形", 1), ("正三角形", 3), ("圓形", "無限多條")
            ][(m - 1) % 5]
            q_text = f"第 {m} 站：線對稱圖形對稱軸：{char}觀察幾何鏡面，平面圖形【{shape_name}】一共有幾條對稱軸？"
            math_text = f"{shape_name} 的對稱軸條數"
            ans = f"{axis_count}條" if isinstance(axis_count, int) else axis_count
            cands = ["1條", "2條", "3條", "4條", "無限多條"]
            opts, c = make_distractors(ans, cands)
            exp = f"【{shape_name}】對折完全重合的對稱軸共有 {ans}。"
            
        monsters.append({
            "id": mid,
            "question": q_text,
            "math": math_text,
            "options": opts,
            "correct": c,
            "answer": ans,
            "explanation": exp,
            "difficulty": 2 if m <= 10 else 3,
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
            "name": f"{theme_info['name']}的領主" if is_boss else f"{theme_info['name']}的守衛",
            "max_hp": 300 if is_boss else 120,
            "reward_gold": 60 if is_boss else 15,
            "reward_exp": 120 if is_boss else 25,
            "spell": "🔥 天域算術烈焰" if is_boss else "⚡ 幾何魔力箭",
            "win_quote": "太精彩了！高階運算思維過關！",
            "story": f"踏上{theme_info['name']}的第 {m} 道試煉！",
            "dialogue": f"我是{theme_info['name']}的考驗者，能解開這個五級謎題嗎？",
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
        t_data = generate_g5_monsters(theme)
        world_map.append(t_data)
        total_q += len(t_data["monsters"])
        total_bosses += sum(1 for m in t_data["monsters"] if m["is_boss"])
        
    out_path = os.path.join(APP_DIR, "rpg_world_map.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(world_map, f, ensure_ascii=False, indent=2)
        
    print(f"🎉 小五產出成功！共 {len(world_map)} 王國，{total_q} 題，{total_bosses} 隻魔王。")
    print(f"檔案寫入: {out_path}")

if __name__ == "__main__":
    main()

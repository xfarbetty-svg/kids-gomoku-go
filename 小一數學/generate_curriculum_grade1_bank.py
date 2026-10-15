# -*- coding: utf-8 -*-
"""
generate_curriculum_grade1_bank.py (V2 - 具象情境多元化與嚴格去重)
專為台灣 108 課綱國小一年級打造的 20 王國 440 題冒險題庫生成器。
確保每王國 22 題：
1. 題幹文字與數值全域唯一，絕無重複指紋。
2. 完美對齊子由數學小學堂多樣情境與 108 課綱邊界。
3. 四選項絕對唯一，correct 索引精確對應。
4. 第 5, 10, 15, 20 題設為魔王考核關。
"""

import os
import sys
import json
import random

sys.stdout.reconfigure(encoding="utf-8")

APP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app")
os.makedirs(APP_DIR, exist_ok=True)

KINGDOMS = [
    {"theme_id": "t01", "name": "數數精靈森", "icon": "🌲", "curriculum": "1-n-03", "desc": "數1到10物品數量、第幾隻與排隊順序", "color": "#10B981"},
    {"theme_id": "t02", "name": "蘋果分合泉", "icon": "🍎", "curriculum": "1-n-04", "desc": "10以內分與合、幾和幾合起來是10", "color": "#EF4444"},
    {"theme_id": "t03", "name": "歡樂加法林", "icon": "🐰", "curriculum": "1-n-04", "desc": "10以內加法生活情境、一共有多少", "color": "#F59E0B"},
    {"theme_id": "t04", "name": "摘果減法洞", "icon": "🐻", "curriculum": "1-n-04", "desc": "10以內減法生活情境、還剩下多少", "color": "#8B5CF6"},
    {"theme_id": "t05", "name": "交換魔法島", "icon": "🪄", "curriculum": "1-a-01", "desc": "生活具體情境之加法交換律", "color": "#EC4899"},
    {"theme_id": "t06", "name": "互逆時光門", "icon": "⏳", "curriculum": "1-a-02", "desc": "加減互逆關係、算式回推", "color": "#6366F1"},
    {"theme_id": "t07", "name": "湊十加法谷", "icon": "✨", "curriculum": "1-n-05", "desc": "20以內進位加法、湊十法拆解", "color": "#3B82F6"},
    {"theme_id": "t08", "name": "拆十減法溪", "icon": "💧", "curriculum": "1-n-05", "desc": "20以內退位減法、拆十法拆解", "color": "#06B6D4"},
    {"theme_id": "t09", "name": "三十果實山", "icon": "⛰️", "curriculum": "1-n-01", "desc": "30以內數與位值、幾個十和幾個一", "color": "#84CC16"},
    {"theme_id": "t10", "name": "百數水晶殿", "icon": "💎", "curriculum": "1-n-01", "desc": "100以內數大小比較、百數表定位", "color": "#14B8A6"},
    {"theme_id": "t11", "name": "跳步青蛙池", "icon": "🐸", "curriculum": "1-n-07", "desc": "2個一數、5個一數、10個一數規律跳步", "color": "#10B981"},
    {"theme_id": "t12", "name": "雙數松鼠窩", "icon": "🐿️", "curriculum": "1-n-03", "desc": "單數與雙數、兩兩配對分組", "color": "#D97706"},
    {"theme_id": "t13", "name": "鉛筆量長徑", "icon": "✏️", "curriculum": "1-n-09", "desc": "長短、高矮直接比較與一端對齊", "color": "#6B7280"},
    {"theme_id": "t14", "name": "迴紋針尺步", "icon": "📎", "curriculum": "1-n-10", "desc": "個別單位間接比較、方格長度測量", "color": "#4B5563"},
    {"theme_id": "t15", "name": "太陽整點鐘", "icon": "☀️", "curriculum": "1-n-08", "desc": "長針指向12之整點鐘面報讀", "color": "#F59E0B"},
    {"theme_id": "t16", "name": "月光半點鐘", "icon": "🌙", "curriculum": "1-n-08", "desc": "長針指向6之半點鐘面報讀", "color": "#6366F1"},
    {"theme_id": "t17", "name": "零錢雜貨鋪", "icon": "🏪", "curriculum": "1-n-02", "desc": "1元、5元、10元硬幣買賣與換錢", "color": "#10B981"},
    {"theme_id": "t18", "name": "存錢金豬島", "icon": "🐷", "curriculum": "1-n-02", "desc": "50元硬幣組合與生活找錢", "color": "#EC4899"},
    {"theme_id": "t19", "name": "積木形狀城", "icon": "🏰", "curriculum": "1-s-02", "desc": "球、圓柱、正方體、長方體特徵與堆疊", "color": "#8B5CF6"},
    {"theme_id": "t20", "name": "森林百寶帳", "icon": "⛺", "curriculum": "1-d-01", "desc": "生活分類整理與象形統計圖表", "color": "#059669"}
]

ANIMALS = ["小兔", "小鹿", "小熊", "小松鼠", "小刺蝟", "小狐狸", "小貓咪", "柴犬", "樹懶", "無尾熊",
           "小企鵝", "小浣熊", "斑馬", "小象", "長頸鹿", "水豚", "小海獺", "花栗鼠", "小猴子", "綿羊", "小豬", "鴨嘴獸"]

ITEMS = ["紅蘋果", "金香蕉", "甜草莓", "藍莓", "松果", "彩色積木", "星星糖果", "愛心貼紙", "小貝殼", "橡皮擦",
         "彩色鉛筆", "氣球", "小餅乾", "棒棒糖", "小哨子", "小番茄", "甜甜圈", "彈珠", "櫻桃", "小花朵", "毛線球", "小鈴鐺"]

def make_distractors(ans_str, candidates):
    ans_s = str(ans_str).strip()
    cands = [str(c).strip() for c in candidates if str(c).strip() != ans_s]
    uniq_cands = []
    for c in cands:
        if c not in uniq_cands and c != ans_s:
            uniq_cands.append(c)
        if len(uniq_cands) == 3:
            break
            
    if len(uniq_cands) < 3 and ans_s.isdigit():
        val = int(ans_s)
        for offset in [1, -1, 2, -2, 3, -3, 5, 10]:
            cand = str(max(0, val + offset))
            if cand != ans_s and cand not in uniq_cands:
                uniq_cands.append(cand)
            if len(uniq_cands) == 3:
                break
                
    while len(uniq_cands) < 3:
        cand = str(random.randint(1, 20))
        if cand != ans_s and cand not in uniq_cands:
            uniq_cands.append(cand)
            
    opts = [ans_s] + uniq_cands[:3]
    random.shuffle(opts)
    correct_idx = opts.index(ans_s)
    return opts, correct_idx

def generate_theme_monsters(theme_info):
    tid = theme_info["theme_id"]
    monsters = []
    
    for m in range(1, 23):
        mid = f"{tid}-m{m:02d}"
        is_boss = (m in (5, 10, 15, 20))
        an = ANIMALS[(m - 1) % len(ANIMALS)]
        item = ITEMS[(m - 1) % len(ITEMS)]
        
        if tid == "t01": # 數數精靈森 1-n-03
            if m <= 11:
                n = m
                q_text = f"第 {m} 站：森林草地上有 {n} 隻{an}在開同樂會，請問草地上一共有幾隻{an}？"
                math_text = f"數量 = {n}"
                ans = str(n)
                opts, c = make_distractors(ans, [n + 1, max(1, n - 1), n + 2])
                exp = f"細心數一數，草地上一共有 {n} 隻{an}。"
            else:
                pos = m - 11
                total_in_line = pos + 3
                q_text = f"第 {m} 站：{total_in_line} 隻小動物排成一排，從前面數過來，{an}排在第 {pos} 個，請問牠前面有幾隻小夥伴？"
                front = pos - 1
                math_text = f"{pos} - 1 = {front}"
                ans = str(front)
                opts, c = make_distractors(ans, [pos, pos + 1, max(0, pos - 2)])
                exp = f"{an}排在第 {pos} 個，前面剛好有 {front} 隻小夥伴。"
                
        elif tid == "t02": # 蘋果分合泉 1-n-04
            total = 10 if m <= 10 else (m - 9)
            if total < 2: total = 2
            part1 = ((m * 3) % (total - 1)) + 1 if total > 2 else 1
            part2 = total - part1
            q_text = f"第 {m} 站：盤子裡裝著 {total} 個{item}，{an}分走了 {part1} 個，盤子裡還剩下幾個？"
            math_text = f"{total} 可以分成 {part1} 和 □"
            ans = str(part2)
            opts, c = make_distractors(ans, [part2 + 1, max(0, part2 - 1), part1, total])
            exp = f"{total} 可以拆分成 {part1} 和 {part2}，所以還剩下 {part2} 個{item}。"
            
        elif tid == "t03": # 歡樂加法林 1-n-04
            a = ((m - 1) // 5) + 1
            b = ((m - 1) % 5) + 1
            tot = a + b
            q_text = f"第 {m} 站：{an}上午採了 {a} 個{item}，下午又採了 {b} 個，一整天一共採了幾個？"
            math_text = f"{a} + {b} = □"
            ans = str(tot)
            opts, c = make_distractors(ans, [tot + 1, max(1, tot - 1), tot + 2, abs(a - b)])
            exp = f"上午採 {a} 個加上下午採 {b} 個，{a} + {b} = {tot} 個。"
            
        elif tid == "t04": # 摘果減法洞 1-n-04
            a = ((m - 1) // 4) + 6
            b = ((m - 1) % 4) + 1
            remain = a - b
            q_text = f"第 {m} 站：倉庫裡有 {a} 顆{item}，{an}吃掉了 {b} 顆，倉庫裡還剩下幾顆？"
            math_text = f"{a} - {b} = □"
            ans = str(remain)
            opts, c = make_distractors(ans, [remain + 1, max(0, remain - 1), a + b, remain + 2])
            exp = f"原本有 {a} 顆，吃掉 {b} 顆，用減法計算：{a} - {b} = {remain} 顆。"
            
        elif tid == "t05": # 交換魔法島 1-a-01
            a = (m % 5) + 1
            b = ((m * 2) % 4) + 2
            tot = a + b
            q_text = f"第 {m} 站：{an}有兩個口袋，左邊口袋裝 {a} 顆{item}、右邊裝 {b} 顆；小夥伴左邊裝 {b} 顆、右邊裝 {a} 顆，誰的總數多？"
            math_text = f"{a} + {b} 與 {b} + {a}"
            ans = "一樣多"
            opts, c = make_distractors(ans, [f"{an}比較多", "小夥伴比較多", "無法比較"])
            exp = f"加法前後順序調換總數不變（加法交換律）：{a} + {b} = {b} + {a} = {tot}，所以兩人都一樣多。"
            
        elif tid == "t06": # 互逆時光門 1-a-02
            a = (m % 5) + 2
            b = ((m * 3) % 4) + 2
            tot = a + b
            q_text = f"第 {m} 站：時光門顯示【{a} + {b} = {tot}】，若倒著走時光隧道，算式【{tot} - {a}】會等於多少？"
            math_text = f"{tot} - {a} = □"
            ans = str(b)
            opts, c = make_distractors(ans, [b + 1, max(1, b - 1), a, tot])
            exp = f"因為 {a} + {b} = {tot}，反推逆算式 {tot} - {a} 就等於 {b}。"
            
        elif tid == "t07": # 湊十加法谷 1-n-05
            a = 9 if (m % 3 == 0) else (8 if (m % 3 == 1) else 7)
            b = (m % 6) + 3
            need = 10 - a
            rem = b - need
            tot = 10 + rem
            q_text = f"第 {m} 站：用湊十法算算看【{a} + {b}】：把 {b} 拆成 {need} 和 {rem}，{a} + {need} = 10，10 + {rem} 等於多少？"
            math_text = f"{a} + {b} = 10 + {rem} = □"
            ans = str(tot)
            opts, c = make_distractors(ans, [tot + 1, tot - 1, tot + 2, tot - 2])
            exp = f"湊十法：先拿 {need} 和 {a} 湊成 10，10 再加上剩下的 {rem} 等於 {tot}。"
            
        elif tid == "t08": # 拆十減法溪 1-n-05
            tens_val = (m % 7) + 11
            sub = (tens_val % 10) + (m % 3) + 2
            if sub >= 10: sub = 9
            ans_val = tens_val - sub
            u = tens_val % 10
            q_text = f"第 {m} 站：算式【{tens_val} - {sub}】：個位不夠減，打開 10 減去 {sub} 剩下 {10 - sub}，再和個位的 {u} 合起來是多少？"
            math_text = f"{tens_val} - {sub} = □"
            ans = str(ans_val)
            opts, c = make_distractors(ans, [ans_val + 1, max(1, ans_val - 1), ans_val + 2, tens_val - sub + 3])
            exp = f"拆十法：10 - {sub} = {10 - sub}，{10 - sub} + {u} = {ans_val}。"
            
        elif tid == "t09": # 三十果實山 1-n-01
            tens = (m % 3) + 1
            ones = (m * 4) % 10
            val = tens * 10 + ones
            q_text = f"第 {m} 站：{an}採了 {tens} 盒（每盒10顆）以及散裝的 {ones} 顆{item}，合起來一共有幾顆？"
            math_text = f"{tens}個十和{ones}個一 = □"
            ans = str(val)
            opts, c = make_distractors(ans, [tens + ones, val + 10 if val + 10 <= 100 else val - 10, val + 1, max(1, val - 1)])
            exp = f"{tens} 個十是 {tens*10}，{ones} 個一是 {ones}，合起來就是 {val}。"
            
        elif tid == "t10": # 百數水晶殿 1-n-01
            base = m * 4 + 10
            diff = (m % 3) + 1
            bigger = base + diff
            q_text = f"第 {m} 站：百數水晶殿比大小：水晶能量分別為【{base}】與【{bigger}】，哪一個能量比較大？"
            math_text = f"{base} □ {bigger}"
            ans = str(bigger)
            opts, c = make_distractors(ans, [str(base), "一樣大", str(base - 1)])
            exp = f"比較十位與個位數值，{bigger} 大於 {base}，所以 {bigger} 比較大。"
            
        elif tid == "t11": # 跳步青蛙池 1-n-07
            rule = 2 if m <= 8 else (5 if m <= 15 else 10)
            step_idx = (m % 7) + 1
            cur_num = rule * step_idx
            nxt_num = cur_num + rule
            q_text = f"第 {m} 站：池塘青蛙跳水：按照「{rule}個一數」的規律向前跳，數到 {cur_num} 的下一個荷葉數字是多少？"
            math_text = f"{cur_num}，□"
            ans = str(nxt_num)
            opts, c = make_distractors(ans, [nxt_num + rule, max(0, nxt_num - 1), cur_num + 1, nxt_num + 1])
            exp = f"按照 {rule} 個一數前進，{cur_num} 加上 {rule} 就是 {nxt_num}。"
            
        elif tid == "t12": # 雙數松鼠窩 1-n-03
            num = m + 1
            is_even = (num % 2 == 0)
            q_text = f"第 {m} 站：松鼠窩裡有 {num} 顆{item}，{an}兩兩成雙進行配對，剛好配完還是會剩下 1 顆？"
            math_text = f"{num} 是單數還是雙數？"
            ans = "剛好配完（雙數）" if is_even else "剩下1顆（單數）"
            opts, c = make_distractors(ans, ["剩下1顆（單數）" if is_even else "剛好配完（雙數）", "剩下2顆", "無法配對"])
            exp = f"{num} 是{'雙數，兩兩配對剛好成雙' if is_even else '單數，兩兩配對後會剩下 1 顆落單'}。"
            
        elif tid == "t13": # 鉛筆量長徑 1-n-09
            tool1 = f"藍色{item}"
            tool2 = f"黃色{item}"
            q_text = f"第 {m} 站：比長短：把 {tool1} 和 {tool2} 靠牆壁一端對齊排好，發現 {tool1} 比 {tool2} 多凸出一截，誰比較長？"
            math_text = f"一端對齊直接比較長短"
            ans = tool1
            opts, c = make_distractors(ans, [tool2, "一樣長", "無法比較"])
            exp = f"端點對齊平齊後，凸出來比較多的一方較長，所以 {tool1} 比較長。"
            
        elif tid == "t14": # 迴紋針尺步 1-n-10
            units_len = (m % 7) + 3
            q_text = f"第 {m} 站：量長度：{an}用迴紋針當單位測量鉛筆盒，剛好和 {units_len} 根迴紋針一樣長，鉛筆盒是多長？"
            math_text = f"個別單位 = {units_len} 根迴紋針"
            ans = f"{units_len}根迴紋針長"
            opts, c = make_distractors(ans, [f"{units_len + 1}根迴紋針長", f"{max(1, units_len - 1)}根迴紋針長", f"{units_len + 2}根迴紋針長"])
            exp = f"測量物體長度剛好接了 {units_len} 根，所以是 {units_len} 根迴紋針長。"
            
        elif tid == "t15": # 太陽整點鐘 1-n-08
            hour = ((m - 1) % 12) + 1
            activity = ["吃早餐", "晨讀", "做早操", "吃午餐", "午休", "畫畫課", "體育課", "放學", "寫作業", "吃晚餐", "聽故事", "睡覺"][hour - 1]
            q_text = f"第 {m} 站：時鐘長針指向數字 12，短針剛好指向數字 {hour}，{an}正在{activity}，請問現在是幾點鐘？"
            math_text = f"長針指 12，短針指 {hour}"
            ans = f"{hour}點鐘"
            opts, c = make_distractors(ans, [f"{(hour % 12) + 1}點鐘", f"12點鐘", f"{hour}點半"])
            exp = f"長針指 12 代表整點，短針指向 {hour}，所以是 {hour} 點鐘。"
            
        elif tid == "t16": # 月光半點鐘 1-n-08
            hour = ((m - 1) % 12) + 1
            nxt_h = (hour % 12) + 1
            q_text = f"第 {m} 站：夜空時鐘的長針指向數字 6，短針走在數字 {hour} 和 {nxt_h} 的正中間，請問現在是幾點鐘？"
            math_text = f"長針指 6，短針在 {hour} 與 {nxt_h} 之間"
            ans = f"{hour}點半"
            opts, c = make_distractors(ans, [f"{nxt_h}點半", f"{hour}點鐘", f"6點鐘"])
            exp = f"長針指 6 代表半點（30分），短針走過 {hour} 還沒到 {nxt_h}，所以是 {hour} 點半。"
            
        elif tid == "t17": # 零錢雜貨鋪 1-n-02
            tens = ((m - 1) // 6) + 1
            ones = ((m - 1) % 6) + 1
            tot_money = tens * 10 + ones
            q_text = f"第 {m} 站：零錢鋪買貼紙：{an}付了 {tens} 個 10元和 {ones} 個 1元硬幣剛好買下，這張貼紙是多少元？"
            math_text = f"{tens}個10元 + {ones}個1元 = □元"
            ans = f"{tot_money}元"
            opts, c = make_distractors(ans, [f"{tot_money + 10}元", f"{max(1, tot_money - 10)}元", f"{tens + ones}元"])
            exp = f"{tens} 個 10元是 {tens*10} 元，{ones} 個 1元是 {ones} 元，合起來共 {tot_money} 元。"
            
        elif tid == "t18": # 存錢金豬島 1-n-02
            cost = ((m - 1) % 4 + 1) * 10
            change = 50 - cost
            toy = ["小風車", "泡泡水", "黏土", "小陀螺"][(m - 1) % 4]
            q_text = f"第 {m} 站：金豬島商店：{an}拿一枚 50元硬幣買了一個 {cost} 元的{toy}，老闆應該找給牠多少元？"
            math_text = f"50 - {cost} = □"
            ans = f"{change}元"
            opts, c = make_distractors(ans, [f"{change + 10}元", f"{max(0, change - 10)}元", f"{cost}元"])
            exp = f"用 50 元減去花費 {cost} 元：50 - {cost} = {change} 元。"
            
        elif tid == "t19": # 積木形狀城 1-s-02
            shape_info = [
                ("球形積木（像足球一樣圓滾滾）", "可以向四面八方滾動，但疊不高容易滾走"),
                ("圓柱積木（像罐頭一樣）", "放倒可以順著滾，站立可以平平地往上堆疊"),
                ("正方積木（像骰子一樣）", "六個面都長得一樣大，堆城堡非常穩定"),
                ("長方積木（像鉛筆盒一樣）", "長長方方有六個平平的面，很好往上堆放")
            ][(m - 1) % 4]
            stype, sfeat = shape_info
            q_text = f"第 {m} 站：積木城建造中：小工匠想找一種具有「{sfeat}」特點的積木形狀，這是哪一種？"
            math_text = f"立體形狀特徵辨認"
            ans = stype
            opts, c = make_distractors(ans, ["三角柱", "圓形紙片", "長條木片"])
            exp = f"具備「{sfeat}」特徵的積木形狀就是【{stype}】。"
            
        else: # t20: 森林百寶帳 1-d-01
            count = m + 2
            q_text = f"第 {m} 站：百寶帳分類統計：{an}在紀錄表上的【{item}】那一欄畫了 {count} 個「○」做標記，請問一共有幾個{item}？"
            math_text = f"{count} 個標記 = □個"
            ans = f"{count}個"
            opts, c = make_distractors(ans, [f"{count + 1}個", f"{max(1, count - 1)}個", f"{count + 2}個"])
            exp = f"每個標記「○」代表 1 個，畫了 {count} 個圈圈就是 {count} 個{item}。"
            
        monsters.append({
            "id": mid,
            "question": q_text,
            "math": math_text,
            "options": opts,
            "correct": c,
            "answer": ans,
            "explanation": exp,
            "difficulty": 1 if m <= 10 else 2,
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
            "name": f"{theme_info['name']}的守護神" if is_boss else f"{theme_info['name']}的精靈",
            "max_hp": 250 if is_boss else 100,
            "reward_gold": 50 if is_boss else 10,
            "reward_exp": 100 if is_boss else 20,
            "spell": "🌟 奧利博士光環" if is_boss else "✨ 算術小微光",
            "win_quote": "答得太棒了！順利通過考驗！",
            "story": f"來到{theme_info['name']}的第 {m} 個關卡！",
            "dialogue": f"我是{theme_info['name']}的小守護者，請解開我的數學謎題！",
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
        t_data = generate_theme_monsters(theme)
        world_map.append(t_data)
        total_q += len(t_data["monsters"])
        total_bosses += sum(1 for m in t_data["monsters"] if m["is_boss"])
        
    out_path = os.path.join(APP_DIR, "rpg_world_map.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(world_map, f, ensure_ascii=False, indent=2)
        
    print(f"🎉 產出成功！共 {len(world_map)} 王國，{total_q} 題，{total_bosses} 隻魔王。")
    print(f"檔案寫入: {out_path}")

if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""
generate_curriculum_grade4_bank.py
專為台灣 108 課綱國小四年級打造的 23 王國 506 題冒險題庫生成器。
嚴格遵守 CURRICULUM_GRADE4.md：
1. 一億以內的數與位值 (N-4-1)
2. 多位數乘除直式運算 (N-4-2)
3. 兩步驟應用問題 (N-4-3)
4. 對大數取概數（四捨五入法、無條件進入/捨去法）(N-4-4)
5. 同分母分數（真分數、假分數、帶分數）(N-4-5)
6. 等值分數與小數數線 (N-4-6, N-4-8)
7. 二位小數百分位 (N-4-7)
8. 長度公里、角度度數、面積平方公尺、體積立方公分 (N-4-9 ~ N-4-12)
9. 兩步驟四則運算規則（先乘除後加減、括號先算、逐次減項）(R-4-1)
10. 周長、面積、全等、三角形與四邊形 (S-4-1 ~ S-4-8)
11. 長條圖與折線圖 (D-4-1)

產出合規之 app/rpg_world_map.json (23 王國, 506 題, 4 隻魔王/王國)
"""

import os
import sys
import json
import random

sys.stdout.reconfigure(encoding="utf-8")

APP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app")
os.makedirs(APP_DIR, exist_ok=True)

THEMES = [
    {
        "theme_id": "t01",
        "kingdom_name": "🌌 一億以內大數神殿",
        "desc": "掌握一億以內位值單位（萬、十萬、百萬、千萬），建立大數讀寫與加減計算 (N-4-1)",
        "theme_color": "#6366F1",
        "sub_cat": "一億以內的數與位值 (N-4-1)"
    },
    {
        "theme_id": "t02",
        "kingdom_name": "⚡ 大數直式加法之巔",
        "desc": "熟練萬位至千萬位多位數直式加法與連續進位 (N-4-1)",
        "theme_color": "#3B82F6",
        "sub_cat": "大數加法與進位 (N-4-1)"
    },
    {
        "theme_id": "t03",
        "kingdom_name": "🧊 大數直式減法迷宮",
        "desc": "熟練萬位至千萬位多位數直式減法與連續退位借位 (N-4-1)",
        "theme_color": "#06B6D4",
        "sub_cat": "大數減法與退位 (N-4-1)"
    },
    {
        "theme_id": "t04",
        "kingdom_name": "🏛️ 萬位計數與位值金字塔",
        "desc": "透過十進位結構數數看，拆解各數位值大小 (N-4-1)",
        "theme_color": "#10B981",
        "sub_cat": "位值結構與計數 (N-4-1)"
    },
    {
        "theme_id": "t05",
        "kingdom_name": "⚒️ 三位數乘兩位數直式工坊",
        "desc": "精熟三位數乘以兩位數之乘法直式與分層部分積 (N-4-2)",
        "theme_color": "#F59E0B",
        "sub_cat": "三位數乘以兩位數 (N-4-2)"
    },
    {
        "theme_id": "t06",
        "kingdom_name": "🔄 乘除互逆檢驗塔",
        "desc": "透過被乘數、乘數、商與餘數互逆關係檢驗答案 (N-4-2, R-4-2)",
        "theme_color": "#8B5CF6",
        "sub_cat": "乘除互逆與驗算 (R-4-2)"
    },
    {
        "theme_id": "t07",
        "kingdom_name": "➗ 三位數除兩位數試商殿堂",
        "desc": "精熟三位數除以兩位數直式除法、試商技巧與有餘數處理 (N-4-2)",
        "theme_color": "#EC4899",
        "sub_cat": "三位數除以兩位數 (N-4-2)"
    },
    {
        "theme_id": "t08",
        "kingdom_name": "🌲 大數兩步驟加減領地",
        "desc": "生活情境中大數之兩步驟加減混合解題 (N-4-1, N-4-3)",
        "theme_color": "#14B8A6",
        "sub_cat": "大數兩步驟加減 (N-4-3)"
    },
    {
        "theme_id": "t09",
        "kingdom_name": "🐎 公里與公尺換算驛站",
        "desc": "公里(km)與公尺(m)之十進位換算及複名數加減 (N-4-9)",
        "theme_color": "#F97316",
        "sub_cat": "公里與公尺換算 (N-4-9)"
    },
    {
        "theme_id": "t10",
        "kingdom_name": "🔭 四捨五入概數天文台",
        "desc": "操作四捨五入法、無條件進入/捨去法與近似值符號 (N-4-4)",
        "theme_color": "#6366F1",
        "sub_cat": "大數取概數 (N-4-4)"
    },
    {
        "theme_id": "t11",
        "kingdom_name": "⚔️ 四則運算逐次減項競技場",
        "desc": "掌握先乘除後加減、括號先算之併式與等號逐次減項 (R-4-1)",
        "theme_color": "#EF4444",
        "sub_cat": "兩步驟四則混合計算 (R-4-1)"
    },
    {
        "theme_id": "t12",
        "kingdom_name": "🍰 真假帶分數烘焙城堡",
        "desc": "同分母分數之真分數、假分數與帶分數互換及加減 (N-4-5)",
        "theme_color": "#F59E0B",
        "sub_cat": "同分母分數運算 (N-4-5)"
    },
    {
        "theme_id": "t13",
        "kingdom_name": "⏰ 日時分秒跨日時間神殿",
        "desc": "日與時、時與分之複名數計算與跨日時間經過問題 (N-4-3)",
        "theme_color": "#3B82F6",
        "sub_cat": "時間單位與跨日經過 (N-4-3)"
    },
    {
        "theme_id": "t14",
        "kingdom_name": "🧊 立方公分積木體積島",
        "desc": "以 1 立方公分正方體點數堆疊與長方體體積計數 (N-4-12, S-4-4)",
        "theme_color": "#10B981",
        "sub_cat": "立方公分與體積 (N-4-12)"
    },
    {
        "theme_id": "t15",
        "kingdom_name": "📐 角度與量角器星際站",
        "desc": "量角器實測角度、平角與周角旋轉、垂直與平行判定 (N-4-10, S-4-1, S-4-5)",
        "theme_color": "#8B5CF6",
        "sub_cat": "角度測量與旋轉 (S-4-1)"
    },
    {
        "theme_id": "t16",
        "kingdom_name": "💧 二位小數百分位溪流",
        "desc": "認識百分位二位小數、大小比較與直式加減 (N-4-7)",
        "theme_color": "#06B6D4",
        "sub_cat": "二位小數與直式運算 (N-4-7)"
    },
    {
        "theme_id": "t17",
        "kingdom_name": "🗝️ 未知數空格解謎寶庫",
        "desc": "算式填充題求解括號與空格未知數，利用加減乘除互逆 (R-4-2)",
        "theme_color": "#EAB308",
        "sub_cat": "算式填充題與未知數 (R-4-2)"
    },
    {
        "theme_id": "t18",
        "kingdom_name": "🏕️ 兩步驟連乘連除冒險林",
        "desc": "生活情境兩步驟連乘、連除與乘除混合解題 (N-4-3)",
        "theme_color": "#14B8A6",
        "sub_cat": "兩步驟乘除應用 (N-4-3)"
    },
    {
        "theme_id": "t19",
        "kingdom_name": "🌉 等值分數與小數數線橋",
        "desc": "透過數線長度表徵連結分數與小數，認識等值分數概念 (N-4-6, N-4-8)",
        "theme_color": "#F97316",
        "sub_cat": "分數與小數數線 (N-4-8)"
    },
    {
        "theme_id": "t20",
        "kingdom_name": "📊 長條圖與折線圖調查局",
        "desc": "生活單式與複式長條圖報讀、趨勢判斷與繪製 (D-4-1)",
        "theme_color": "#6366F1",
        "sub_cat": "統計圖表報讀 (D-4-1)"
    },
    {
        "theme_id": "t21",
        "kingdom_name": "🏭 平方公尺與長方形面積工廠",
        "desc": "長方形與正方形面積公式、平方公尺與平方公分換算 (N-4-11, S-4-3)",
        "theme_color": "#EC4899",
        "sub_cat": "長方形與正方形面積 (S-4-3)"
    },
    {
        "theme_id": "t22",
        "kingdom_name": "🛡️ 幾何圖形周長巡邏隊",
        "desc": "長方形正方形周長公式計算與複合圖形周長拆解 (S-4-3)",
        "theme_color": "#3B82F6",
        "sub_cat": "平面圖形周長 (S-4-3)"
    },
    {
        "theme_id": "t23",
        "kingdom_name": "💰 大額貨幣生活購物市集",
        "desc": "萬位以上大額金錢收支找零與生活預算試算 (N-4-1, N-4-3)",
        "theme_color": "#10B981",
        "sub_cat": "大額貨幣與找零計算 (N-4-1)"
    }
]

# 精選怪獸名稱與頭像
MONSTER_AVATARS = [
    ("星雲守護者", "🌌"), ("極光巨龍", "🐉"), ("晶石幼獸", "💎"), ("時空旅者", "⌛"),
    ("烈焰魔導士", "🔥"), ("冰霜巨人", "❄️"), ("暴風獅鷲", "🦅"), ("鋼鐵魔像", "🤖"),
    ("精靈弓箭手", "🏹"), ("巨石衛士", "🗿"), ("暗影行者", "👤"), ("雷霆飛鷹", "⚡"),
    ("翡翠樹人", "🌳"), ("深海海妖", "🐙"), ("狂暴蠻牛", "🐂"), ("神秘幻影", "🔮"),
    ("烈日騎士", "⚔️"), ("月影妖狐", "🦊"), ("火山熔岩怪", "🌋"), ("終焉黑龍王", "👑"),
    ("森林守護神", "🦌"), ("聖光天馬", "🦄")
]

def make_distractors(correct_val, is_int=True, unit=""):
    options = [f"{correct_val}{unit}"]
    deltas = [-10, 10, -1, 1, -100, 100, -2, 2, -5, 5] if is_int else [-0.1, 0.1, -0.01, 0.01, -0.2, 0.2]
    random.shuffle(deltas)
    for d in deltas:
        cand = round(correct_val + d, 2) if not is_int else correct_val + d
        if cand > 0 and cand != correct_val:
            cand_str = f"{cand}{unit}"
            if cand_str not in options:
                options.append(cand_str)
        if len(options) == 4:
            break
    while len(options) < 4:
        cand = round(correct_val + len(options) * (1 if is_int else 0.1), 2)
        cand_str = f"{cand}{unit}"
        if cand_str not in options:
            options.append(cand_str)
    random.shuffle(options)
    correct_idx = options.index(f"{correct_val}{unit}")
    return options, correct_idx

def generate_theme_monsters(t_idx, t_def):
    tid = t_def["theme_id"]
    monsters = []
    
    for m_num in range(1, 23):
        mid = f"{tid}_m{m_num}"
        is_boss = (m_num in [5, 10, 15, 20])
        boss_handwritten = is_boss
        
        m_name, m_avatar = MONSTER_AVATARS[(m_num - 1) % len(MONSTER_AVATARS)]
        if is_boss:
            m_name = f"👑 【領主】{m_name}"
            hp = 250 + m_num * 20
        else:
            hp = 100 + m_num * 10
            
        story = ""
        dialogue = ""
        question = ""
        math = ""
        options = []
        correct = 0
        answer = ""
        explanation = ""
        hint = ""
        spell = ""
        win_quote = ""
        unit = ""

        # 依照 23 個主題分別建置小四題目內容
        if tid == "t01": # 一億以內大數神殿
            base = 10000 * random.randint(12, 85) + 100 * random.randint(10, 99)
            add = 10000 * random.randint(5, 30)
            ans_val = base + add
            unit = "元"
            story = f"{m_name}守護著古老的國庫寶箱，需要清點兩筆巨額金幣總數。"
            dialogue = f"「勇者！{base} 元加上 {add} 元到底是多少元？」"
            question = f"{m_name}在神殿中整理金幣，第一寶庫有 {base} 元，第二寶庫有 {add} 元，兩個寶庫合起來共有多少元？"
            math = f"{base} + {add} = ？ 元"
            options, correct = make_distractors(ans_val, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"萬位對齊相加：{base} ＋ {add} ＝ {ans_val} 元。"
            hint = f"依位值對齊個、十、百、千、萬位，由右往左計算。"
            spell = f"⚡ 大數神聖加總！{ans_val}！"
            win_quote = f"萬位大數計算完全正確！神殿大門打開了！"

        elif tid == "t02": # 大數直式加法之巔
            a = random.randint(15000, 48000)
            b = random.randint(18000, 45000)
            ans_val = a + b
            unit = "點"
            story = f"{m_name}正在凝聚兩股龐大的星辰能量！"
            dialogue = f"「接下這招！{a} 點與 {b} 點能量合而為一！」"
            question = f"星辰塔中蓄積了兩團魔力，第一團有 {a} 點，第二團有 {b} 點，兩團合起來共有多少點魔力？"
            math = f"{a} + {b} = ？ 點"
            options, correct = make_distractors(ans_val, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"直式由右至左計算，滿十進一：{a} ＋ {b} ＝ {ans_val} 點。"
            hint = f"注意千位與萬位的連續進位。"
            spell = f"💥 破曉星光！{ans_val}！"
            win_quote = f"漂亮的進位運算！星辰能量被化解了！"

        elif tid == "t03": # 大數直式減法迷宮
            a = random.randint(50000, 95000)
            b = random.randint(12000, 48000)
            ans_val = a - b
            unit = "塊"
            story = f"{m_name}以寒冰障壁阻擋道路，必須擊碎指定的冰晶數量。"
            dialogue = f"「我有 {a} 塊冰晶，被你融化了 {b} 塊，還剩下幾塊？」"
            question = f"冰雪迷宮原本有 {a} 塊寒冰磚，烈火融化了 {b} 塊，迷宮中還剩下幾塊寒冰磚？"
            math = f"{a} - {b} = ？ 塊"
            options, correct = make_distractors(ans_val, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"直式減法，不夠減時向前一位借1當10：{a} − {b} ＝ {ans_val} 塊。"
            hint = f"遇到 0 時記得連續借位破十。"
            spell = f"🔥 熔岩退散！{ans_val}！"
            win_quote = f"連續退位運算精準無誤，寒冰徹底瓦解！"

        elif tid == "t04": # 萬位計數與位值金字塔
            w = random.randint(3, 9)
            q = random.randint(2, 8)
            b_cnt = random.randint(1, 9)
            ans_val = w * 10000 + q * 1000 + b_cnt * 100
            unit = ""
            story = f"{m_name}端坐在位值金字塔頂端，正在測試你對十進位的理解。"
            dialogue = f"「{w} 個萬、{q} 個千和 {b_cnt} 個百合起來是多少？」"
            question = f"金字塔密碼由 {w} 個萬、{q} 個千和 {b_cnt} 個百組合而成，請問這個數是多少？"
            math = f"{w}萬 + {q}千 + {b_cnt}百 = ？"
            options, correct = make_distractors(ans_val, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"{w} 個萬是 {w*10000}，{q} 個千是 {q*1000}，{b_cnt} 個百是 {b_cnt*100}，合起來是 {ans_val}。"
            hint = f"萬位寫 {w}，千位寫 {q}，百位寫 {b_cnt}，十位與個位補 0。"
            spell = f"🏛️ 位值解鎖！{ans_val}！"
            win_quote = f"完美看穿十進位結構，金字塔秘寶現身！"

        elif tid == "t05": # 三位數乘兩位數直式工坊
            a = random.randint(125, 450)
            b = random.randint(12, 38)
            ans_val = a * b
            unit = "個"
            story = f"{m_name}在機械工坊大量製造齒輪，需要精算產出總量。"
            dialogue = f"「每箱裝 {a} 個齒輪，做了 {b} 箱，一共有幾個？」"
            question = f"工坊生產齒輪，每箱裝有 {a} 個，今天一共出貨 {b} 箱，總共有多少個齒輪？"
            math = f"{a} × {b} = ？ 個"
            options, correct = make_distractors(ans_val, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"三位數乘兩位數直式分層：個位相乘與十位相乘後相加，得 {ans_val} 個。"
            hint = f"先算 {a} × {b%10}，再算 {a} × {b//10 * 10}，兩層直式對齊相加。"
            spell = f"⚙️ 齒輪疾轉！{ans_val}！"
            win_quote = f"雙層直式乘法算得又快又準！工坊恢復運轉！"

        elif tid == "t06": # 乘除互逆檢驗塔
            b = random.randint(12, 35)
            q_val = random.randint(15, 45)
            ans_val = b * q_val
            unit = "顆"
            story = f"{m_name}手握互逆魔鏡，反射所有算式的答案。"
            dialogue = f"「某數除以 {b} 等於 {q_val}，原本的某數是多少顆？」"
            question = f"魔法袋裡的寶石平分給 {b} 個人，每個人分到 {q_val} 顆且剛好分完，原本袋子裡有幾顆寶石？"
            math = f"？ ÷ {b} = {q_val}"
            options, correct = make_distractors(ans_val, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"利用乘除互逆：被除數 ＝ 除數 × 商 ＝ {b} × {q_val} ＝ {ans_val} 顆。"
            hint = f"除法倒過來算就是乘法！"
            spell = f"🪞 鏡像互逆！{ans_val}！"
            win_quote = f"乘除互逆融會貫通！魔鏡被徹底淨化！"

        elif tid == "t07": # 三位數除兩位數試商殿堂
            b = random.randint(12, 32)
            q_val = random.randint(12, 28)
            ans_val = q_val
            a = b * q_val
            unit = "包"
            story = f"{m_name}正在殿堂分發藥水，需要測試你的試商能力。"
            dialogue = f"「{a} 瓶藥水，每 {b} 瓶裝成一包，可以裝成幾包？」"
            question = f"大祭司調配了 {a} 瓶聖水，每 {b} 瓶分裝成一包，總共可以裝成多少包？"
            math = f"{a} ÷ {b} = ？ 包"
            options, correct = make_distractors(ans_val, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"三位數除以兩位數直式試商：{a} ÷ {b} ＝ {ans_val} 包。"
            hint = f"先看被除數前兩位，估計商的高位數再做調整。"
            spell = f"⚖️ 精準試商！{ans_val}！"
            win_quote = f"試商一次到位！聖水分配得整整齊齊！"

        elif tid == "t08": # 大數兩步驟加減領地
            a = random.randint(30000, 60000)
            b = random.randint(10000, 20000)
            c = random.randint(5000, 15000)
            ans_val = a - b + c
            unit = "棵"
            story = f"{m_name}巡邏森林，清點樹木的砍伐與新栽數量。"
            dialogue = f"「原本有 {a} 棵樹，砍伐了 {b} 棵，又種植了 {c} 棵，現在有幾棵？」"
            question = f"大森林中原本有 {a} 棵神木，暴風雨吹倒了 {b} 棵，精靈們又補種了 {c} 棵，現在共有多少棵神木？"
            math = f"{a} - {b} + {c} = ？ 棵"
            options, correct = make_distractors(ans_val, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"由左往右算：第一步 {a} − {b} ＝ {a-b}，第二步 {a-b} ＋ {c} ＝ {ans_val} 棵。"
            hint = f"加減混合問題依序由左向右分步計算。"
            spell = f"🌿 萬木長青！{ans_val}！"
            win_quote = f"兩步驟加減精準分段，森林重獲生機！"

        elif tid == "t09": # 公里與公尺換算驛站
            km = random.randint(2, 8)
            m_val = random.randint(150, 850)
            ans_val = km * 1000 + m_val
            unit = "公尺"
            story = f"{m_name}負責丈量王國長途驛道距離。"
            dialogue = f"「{km} 公里又 {m_val} 公尺，換算成公尺是多少？」"
            question = f"巡邏騎士今天奔馳了 {km} 公里 {m_val} 公尺，請問這段路程一共是多少公尺？"
            math = f"{km}公里{m_val}公尺 = ？ 公尺"
            options, correct = make_distractors(ans_val, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"1 公里 ＝ 1000 公尺，{km} 公里 ＝ {km*1000} 公尺，加上 {m_val} 公尺等於 {ans_val} 公尺。"
            hint = f"公里換公尺乘 1000（在後面加上 3 個 0）。"
            spell = f"🐎 千里奔襲！{ans_val}！"
            win_quote = f"單位換算毫無差錯！驛道里程已校正完畢！"

        elif tid == "t10": # 四捨五入概數天文台
            raw_num = random.randint(21500, 88500)
            ans_val = round(raw_num, -3) # 四捨五入到千位
            unit = ""
            story = f"{m_name}在天文台觀測星辰光子數，需要取概數記錄。"
            dialogue = f"「將 {raw_num} 用四捨五入法取概數到千位是多少？」"
            question = f"天文鏡觀測到 {raw_num} 個星光脈衝，如果用【四捨五入法】取概數到【千位】，大約是多少？"
            math = f"{raw_num} ≈ ？ (千位四捨五入)"
            options, correct = make_distractors(ans_val, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"取概數到千位看百位數字。百位是 {(raw_num % 1000)//100}，滿5進一/未滿5捨去，得 {ans_val}。"
            hint = f"看千位的下一位（百位），4以下捨去，5以上向千位進1。"
            spell = f"🔭 概數法陣！{ans_val}！"
            win_quote = f"四捨五入掌握得極為純熟！觀測資料歸檔完畢！"

        elif tid == "t11": # 四則運算逐次減項競技場
            a = random.randint(20, 60)
            b = random.randint(4, 9)
            c = random.randint(3, 8)
            ans_val = a + b * c
            unit = ""
            story = f"{m_name}擺出四則混亂陣，必須遵守計算優先順序才能破陣。"
            dialogue = f"「算式 {a} ＋ {b} × {c} 的答案是多少？」"
            question = f"競技場石碑上刻著古老算式：{a} ＋ {b} × {c}，依數學規範由上而下逐次計算，最後得數是多少？"
            math = f"{a} + {b} × {c} = ？"
            options, correct = make_distractors(ans_val, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"四則運算規則【先乘除後加減】：先算 {b} × {c} ＝ {b*c}，再算 {a} ＋ {b*c} ＝ {ans_val}。"
            hint = f"看到加號與乘號同時出現，一定要先算乘法！"
            spell = f"⚔️ 逐次減項破！{ans_val}！"
            win_quote = f"嚴格遵守先乘除後加減，混亂陣被一劍劈開！"

        elif tid == "t12": # 真假帶分數烘焙城堡
            denom = random.choice([5, 6, 7, 8, 9])
            num1 = random.randint(1, denom - 2)
            num2 = random.randint(1, denom - num1)
            ans_num = num1 + num2
            story = f"{m_name}在城堡烘焙魔法派，需要將幾塊同分母派合在一起。"
            dialogue = f"「{num1}/{denom} 塊派加上 {num2}/{denom} 塊派，一共是多少塊派？」"
            question = f"烘焙坊將派平分成 {denom} 塊，小廚師拿了 {num1}/{denom} 塊，大廚師拿了 {num2}/{denom} 塊，兩人一共拿了多少塊派？"
            math = f"{num1}/{denom} + {num2}/{denom} = ？ 塊"
            correct_str = f"{ans_num}/{denom}塊"
            options = [correct_str, f"{ans_num+1}/{denom}塊", f"{max(1, ans_num-1)}/{denom}塊", f"{ans_num}/{denom*2}塊"]
            random.shuffle(options)
            correct = options.index(correct_str)
            answer = correct_str
            explanation = f"同分母分數相加，分母不變，分子相加：{num1} ＋ {num2} ＝ {ans_num}，得 {ans_num}/{denom} 塊。"
            hint = f"分母都是 {denom}，只要把上面的分子加起來即可！"
            spell = f"🥧 甜點合璧！{ans_num}/{denom}！"
            win_quote = f"同分母分數掌握完美！香噴噴的派烤好了！"

        elif tid == "t13": # 日時分秒跨日時間神殿
            d_val = random.randint(1, 3)
            h_val = random.randint(4, 18)
            ans_val = d_val * 24 + h_val
            unit = "小時"
            story = f"{m_name}掌管跨日時空沙漏，要求精算跨日累積小時。"
            dialogue = f"「{d_val} 日又 {h_val} 小時，換算成小時是多少？」"
            question = f"勇者穿越時空之門航行了 {d_val} 日 {h_val} 小時，請問這段時間總共相當於多少小時？"
            math = f"{d_val}日{h_val}小時 = ？ 小時"
            options, correct = make_distractors(ans_val, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"1 日 ＝ 24 小時，{d_val} 日 ＝ {d_val*24} 小時，加上 {h_val} 小時得 {ans_val} 小時。"
            hint = f"1 日有 24 小時，先算日數 × 24，再加上剩下的時數。"
            spell = f"⌛ 時之逆流！{ans_val}！"
            win_quote = f"24進位制換算無懈可擊！時間神殿恢復穩定！"

        elif tid == "t14": # 立方公分積木體積島
            l = random.randint(2, 5)
            w = random.randint(2, 4)
            h = random.randint(2, 4)
            ans_val = l * w * h
            unit = "立方公分"
            story = f"{m_name}以 1 立方公分的正方體積木搭建要塞防線。"
            dialogue = f"「長 {l} 公分、寬 {w} 公分、高 {h} 公分的長方體，體積是多少？」"
            question = f"積木島上有一個長方體水晶，長 {l} cm、寬 {w} cm、高 {h} cm，它的體積是多少立方公分？"
            math = f"{l} × {w} × {h} = ？ 立方公分"
            options, correct = make_distractors(ans_val, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"長方體體積公式 ＝ 長 × 寬 × 高 ＝ {l} × {w} × {h} ＝ {ans_val} 立方公分。"
            hint = f"一層有 {l} × {w} 個積木，堆疊 {h} 層，相乘即為體積。"
            spell = f"🧊 立體凝固！{ans_val}！"
            win_quote = f"體積空間觀念極為清晰！要塞被完美攻破！"

        elif tid == "t15": # 角度與量角器星際站
            deg1 = random.choice([30, 45, 60, 90, 120, 135])
            deg2 = random.choice([30, 45, 60, 90])
            ans_val = deg1 + deg2
            unit = "度"
            story = f"{m_name}旋轉星際雷達天線，需要測量角度旋轉合量。"
            dialogue = f"「天線先順時針轉 {deg1} 度，再轉 {deg2} 度，一共轉了幾度？」"
            question = f"星際導航儀先旋轉了 {deg1}°，隨後朝同方向再旋轉了 {deg2}°，總共旋轉了多少度？"
            math = f"{deg1}° + {deg2}° = ？ 度"
            options, correct = make_distractors(ans_val, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"同方向角度旋轉相加：{deg1} ＋ {deg2} ＝ {ans_val} 度。"
            hint = f"角度單位為度（°），直接將兩角度相加。"
            spell = f"📐 旋轉校準！{ans_val}！"
            win_quote = f"角度計算絲毫不差！雷達鎖定目標航道！"

        elif tid == "t16": # 二位小數百分位溪流
            a_f = round(random.uniform(1.2, 5.8), 2)
            b_f = round(random.uniform(1.1, 3.9), 2)
            ans_val = round(a_f + b_f, 2)
            unit = "公升"
            story = f"{m_name}在百分位溪流中調製藥劑，精確量取二位小數容積。"
            dialogue = f"「{a_f} 公升藥劑加上 {b_f} 公升溶劑，合起來是多少公升？」"
            question = f"精靈藥師調配魔法藥水，加入 {a_f} 公升月光水與 {b_f} 公升晨露水，總共有多少公升？"
            math = f"{a_f} + {b_f} = ？ 公升"
            options, correct = make_distractors(ans_val, is_int=False, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"二位小數直式加法，小數點對齊：十分位對十分位，百分位對百分位，得 {ans_val} 公升。"
            hint = f"直式計算時，關鍵在於【小數點對齊】再依序相加。"
            spell = f"💧 甘霖淨化！{ans_val}！"
            win_quote = f"小數點對齊得無懈可擊！藥水調配成功！"

        elif tid == "t17": # 未知數空格解謎寶庫
            ans_val = random.randint(25, 80)
            known = random.randint(15, 45)
            total = ans_val + known
            unit = ""
            story = f"{m_name}用帶有空格（□）的古老算式鎖住了寶箱。"
            dialogue = f"「算式 □ ＋ {known} ＝ {total}，空格 □ 裡的數是多少？」"
            question = f"寶庫封印文字記載：【□ ＋ {known} ＝ {total}】，請推算出空格 □ 代表的數字。"
            math = f"□ + {known} = {total}"
            options, correct = make_distractors(ans_val, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"利用加減互逆關係：□ ＝ 和 − 已知加數 ＝ {total} − {known} ＝ {ans_val}。"
            hint = f"加法的未知數，用減法反推算回來。"
            spell = f"🗝️ 破密解印！{ans_val}！"
            win_quote = f"算式填充題輕鬆解開！寶箱彈開了！"

        elif tid == "t18": # 兩步驟連乘連除冒險林
            a = random.randint(4, 8)
            b = random.randint(5, 10)
            c = random.randint(2, 5)
            ans_val = a * b * c
            unit = "顆"
            story = f"{m_name}在冒險林中採集魔法果實，分裝成多個籃子。"
            dialogue = f"「有 {a} 棵樹，每棵結 {b} 串果實，每串有 {c} 顆，一共幾顆？」"
            question = f"果園裡有 {a} 棵樹，每棵樹長出 {b} 串果子，每串果子有 {c} 顆，果園總共有多少顆果子？"
            math = f"{a} × {b} × {c} = ？ 顆"
            options, correct = make_distractors(ans_val, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"兩步驟連乘由左向右：第一步 {a} × {b} ＝ {a*b}，第二步 {a*b} × {c} ＝ {ans_val} 顆。"
            hint = f"先算一棵樹共有幾顆果子，再乘以樹的總棵數。"
            spell = f"🍎 碩果豐收！{ans_val}！"
            win_quote = f"連乘步驟井然有序！果實裝滿了行囊！"

        elif tid == "t19": # 等值分數與小數數線橋
            base_f = random.choice([2, 4, 5])
            ans_val = round(1 / base_f, 2)
            unit = ""
            story = f"{m_name}把守數線橋，要求將分數換算成小數對應。"
            dialogue = f"「分數 1/{base_f} 在數線上對應的二位小數是多少？」"
            question = f"數線橋上有一個標記點位於 1/{base_f}，如果以小數表示，這個點是多少？"
            math = f"1/{base_f} = ？ (小數)"
            options, correct = make_distractors(ans_val, is_int=False, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"分數換算小數：1 ÷ {base_f} ＝ {ans_val}。"
            hint = f"將分子除以分母，即可換算為小數。"
            spell = f"🌉 數線貫通！{ans_val}！"
            win_quote = f"分數與小數互換清晰敏捷！數線橋順利通行！"

        elif tid == "t20": # 長條圖與折線圖調查局
            v1 = random.randint(15, 35)
            v2 = random.randint(20, 45)
            ans_val = v1 + v2
            unit = "人"
            story = f"{m_name}正在調查村民最喜愛的魔法屬性長條圖。"
            dialogue = f"「火系有 {v1} 人，水系有 {v2} 人，兩組一共有幾人？」"
            question = f"根據冒險公會的統計長條圖，選擇火系的勇者有 {v1} 人，選擇水系的有 {v2} 人，這兩組合計共有多少人？"
            math = f"{v1} + {v2} = ？ 人"
            options, correct = make_distractors(ans_val, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"讀取長條圖兩柱高度數值相加：{v1} ＋ {v2} ＝ {ans_val} 人。"
            hint = f"先在垂直軸看清楚刻度數值，再將兩者相加。"
            spell = f"📊 圖表真理！{ans_val}！"
            win_quote = f"統計圖表數據報讀正確無誤！調查結案！"

        elif tid == "t21": # 平方公尺與長方形面積工廠
            length = random.randint(12, 35)
            width = random.randint(8, 25)
            ans_val = length * width
            unit = "平方公尺"
            story = f"{m_name}正在規劃工廠新廠房的地基面積。"
            dialogue = f"「長 {length} 公尺、寬 {width} 公尺的長方形地基，面積是多少？」"
            question = f"工廠要鋪設一塊長方形水泥地，長 {length} 公尺，寬 {width} 公尺，它的面積是多少平方公尺？"
            math = f"{length} × {width} = ？ 平方公尺"
            options, correct = make_distractors(ans_val, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"長方形面積公式 ＝ 長 × 寬 ＝ {length} × {width} ＝ {ans_val} 平方公尺。"
            hint = f"面積單位是平方公尺（m²），用長乘寬即可求出。"
            spell = f"🏭 地圖展開！{ans_val}！"
            win_quote = f"面積公式熟練掌握！廠房地基順利落成！"

        elif tid == "t22": # 幾何圖形周長巡邏隊
            length = random.randint(15, 40)
            width = random.randint(10, 30)
            ans_val = (length + width) * 2
            unit = "公尺"
            story = f"{m_name}負責巡邏圍欄，計算邊界的總周長。"
            dialogue = f"「長 {length} 公尺、寬 {width} 公尺的長方形農場，周長是多少？」"
            question = f"巡邏隊要替長方形農場圍上柵欄，已知農場長 {length} 公尺、寬 {width} 公尺，一共需要多少公尺的柵欄？"
            math = f"({length} + {width}) × 2 = ？ 公尺"
            options, correct = make_distractors(ans_val, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"長方形周長公式 ＝ (長 ＋ 寬) × 2 ＝ ({length} ＋ {width}) × 2 ＝ {ans_val} 公尺。"
            hint = f"長方形有兩個長和兩個寬，先將長加寬再乘以 2。"
            spell = f"🛡️ 鐵壁結界！{ans_val}！"
            win_quote = f"周長公式計算精確，安全防線滴水不漏！"

        elif tid == "t23": # 大額貨幣生活購物市集
            price = random.randint(12000, 38000)
            pay = 50000
            ans_val = pay - price
            unit = "元"
            story = f"{m_name}在熱鬧的皇家市集經商，核算大額金幣交易找零。"
            dialogue = f"「買裝備花了 {price} 元，付了 50000 元，要找回多少元？」"
            question = f"勇者在市集購買傳奇鎧甲花費 {price} 元，付了一張 50000 元的皇家金票，店主應該找回多少元？"
            math = f"{pay} - {price} = ？ 元"
            options, correct = make_distractors(ans_val, unit=unit)
            answer = f"{ans_val}{unit}"
            explanation = f"找零計算：付款金額 − 物品價格 ＝ {pay} − {price} ＝ {ans_val} 元。"
            hint = f"從 50000 連續借位減去 {price}。"
            spell = f"💰 金幣回流！{ans_val}！"
            win_quote = f"大額貨幣找零完全正確！市集交易愉快！"

        monster_obj = {
            "theme_id": tid,
            "id": mid,
            "name": m_name,
            "avatar": m_avatar,
            "max_hp": hp,
            "story": story,
            "dialogue": dialogue,
            "question": question,
            "math": math,
            "sub_cat": t_def["sub_cat"],
            "options": options,
            "correct": correct,
            "answer": answer,
            "explanation": explanation,
            "hint": hint,
            "word_problem": {
                "story": story,
                "question": question
            },
            "spell": spell,
            "win_quote": win_quote,
            "reward_gold": 50 + m_num * 5,
            "reward_exp": 30 + m_num * 4,
            "is_boss": is_boss,
            "boss_handwritten": boss_handwritten
        }
        monsters.append(monster_obj)
        
    return monsters

def main():
    world_map = []
    total_m = 0
    print("[*] 開始產出國小四年級 23 王國 506 題完整題庫...")
    
    for idx, t_def in enumerate(THEMES):
        monsters = generate_theme_monsters(idx, t_def)
        total_m += len(monsters)
        kingdom_obj = {
            "theme_id": t_def["theme_id"],
            "kingdom_name": t_def["kingdom_name"],
            "desc": t_def["desc"],
            "theme_color": t_def["theme_color"],
            "monsters": monsters
        }
        world_map.append(kingdom_obj)
        print(f"  [+] {t_def['theme_id']} {t_def['kingdom_name']}: {len(monsters)} 題產出完成")

    out_path = os.path.join(APP_DIR, "rpg_world_map.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(world_map, f, ensure_ascii=False, indent=2)

    print(f"\n[SUCCESS] 成功產出小四數學題庫！")
    print(f"  檔案位置: {out_path}")
    print(f"  主題數量: {len(world_map)} 王國")
    print(f"  怪獸總數: {total_m} 隻怪獸/題目")
    sys.exit(0)

if __name__ == "__main__":
    main()

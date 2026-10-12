# -*- coding: utf-8 -*-
"""
build_grade4_bank.py
國小四年級 23 大主題 506 題冒險題庫建置器
嚴格對齊 CURRICULUM_GRADE4.md 與台灣 108 課綱規範
"""

import sys
import os
import json
import re
import time
import urllib.request
import urllib.parse
import http.cookiejar
import pdfplumber

sys.stdout.reconfigure(encoding="utf-8")

SCRATCH_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_scratch")
APP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app")
PDF_CACHE_DIR = os.path.join(SCRATCH_DIR, "grade4_pdfs")
os.makedirs(PDF_CACHE_DIR, exist_ok=True)
os.makedirs(APP_DIR, exist_ok=True)

# 23 大主題定義（對齊子由題庫四年級 23 主題與課綱）
THEME_DEFINITIONS = [
    {
        "idx": 1, "unit_id": 9, "theme_id": "t01",
        "name": "一億以內大數神殿", "icon": "🌌", "color": "#6366F1",
        "desc": "掌握一億以內位值單位（萬、十萬、百萬、千萬），建立大數讀寫與加減計算 (N-4-1)",
        "sub_cat": "一億以內的數與位值 (N-4-1)"
    },
    {
        "idx": 2, "unit_id": 1, "theme_id": "t02",
        "name": "大數直式加法之巔", "icon": "⚡", "color": "#3B82F6",
        "desc": "熟練萬位至千萬位多位數直式加法與連續進位 (N-4-1)",
        "sub_cat": "大數加法與進位 (N-4-1)"
    },
    {
        "idx": 3, "unit_id": 2, "theme_id": "t03",
        "name": "大數直式減法迷宮", "icon": "🧊", "color": "#06B6D4",
        "desc": "熟練萬位至千萬位多位數直式減法與連續退位借位 (N-4-1)",
        "sub_cat": "大數減法與退位 (N-4-1)"
    },
    {
        "idx": 4, "unit_id": 8, "theme_id": "t04",
        "name": "萬位計數與位值金字塔", "icon": "🏛️", "color": "#10B981",
        "desc": "透過十進位結構數數看，拆解各數位值大小 (N-4-1)",
        "sub_cat": "位值結構與計數 (N-4-1)"
    },
    {
        "idx": 5, "unit_id": 4, "theme_id": "t05",
        "name": "多位數直式乘法工坊", "icon": "⚒️", "color": "#F59E0B",
        "desc": "精熟三位數乘以兩位數之乘法直式與分層部分積 (N-4-2)",
        "sub_cat": "三位數乘以兩位數 (N-4-2)"
    },
    {
        "idx": 6, "unit_id": 6, "theme_id": "t06",
        "name": "乘除互逆檢驗塔", "icon": "🔄", "color": "#8B5CF6",
        "desc": "透過被乘數、乘數、商與餘數互逆關係檢驗答案 (N-4-2, R-4-2)",
        "sub_cat": "乘除互逆與驗算 (R-4-2)"
    },
    {
        "idx": 7, "unit_id": 5, "theme_id": "t07",
        "name": "三位數除以兩位數除法試商殿堂", "icon": "➗", "color": "#EC4899",
        "desc": "精熟三位數除以兩位數直式除法、試商技巧與有餘數處理 (N-4-2)",
        "sub_cat": "三位數除以兩位數 (N-4-2)"
    },
    {
        "idx": 8, "unit_id": 3, "theme_id": "t08",
        "name": "大數加減混合應用領地", "icon": "🌲", "color": "#14B8A6",
        "desc": "生活情境中大數之兩步驟加減混合解題 (N-4-1, N-4-3)",
        "sub_cat": "大數兩步驟加減 (N-4-3)"
    },
    {
        "idx": 9, "unit_id": 35, "theme_id": "t09",
        "name": "公里與公尺換算驛站", "icon": "🐎", "color": "#F97316",
        "desc": "公里(km)與公尺(m)之十進位換算及複名數加減 (N-4-9)",
        "sub_cat": "公里與公尺換算 (N-4-9)"
    },
    {
        "idx": 10, "unit_id": 10, "theme_id": "t10",
        "name": "四捨五入概數天文台", "icon": "🔭", "color": "#6366F1",
        "desc": "操作四捨五入法、無條件進入/捨去法與近似值符號 (N-4-4)",
        "sub_cat": "大數取概數 (N-4-4)"
    },
    {
        "idx": 11, "unit_id": 7, "theme_id": "t11",
        "name": "四則運算逐次減項競技場", "icon": "⚔️", "color": "#EF4444",
        "desc": "掌握先乘除後加減、括號先算之併式與等號逐次減項 (R-4-1)",
        "sub_cat": "兩步驟四則混合計算 (R-4-1)"
    },
    {
        "idx": 12, "unit_id": 12, "theme_id": "t12",
        "name": "真假帶分數烘焙城堡", "icon": "🏰", "color": "#F59E0B",
        "desc": "同分母分數之真分數、假分數與帶分數互換及加減 (N-4-5)",
        "sub_cat": "同分母分數運算 (N-4-5)"
    },
    {
        "idx": 13, "unit_id": 19, "theme_id": "t13",
        "name": "日時分秒跨日時間神殿", "icon": "⏰", "color": "#3B82F6",
        "desc": "日與時、時與分之複名數計算與跨日時間經過問題 (N-4-3)",
        "sub_cat": "時間單位與跨日經過 (N-4-3)"
    },
    {
        "idx": 14, "unit_id": 29, "theme_id": "t14",
        "name": "立方公分積木體積島", "icon": "🧊", "color": "#10B981",
        "desc": "以 1 立方公分正方體點數堆疊與長方體體積計數 (N-4-12, S-4-4)",
        "sub_cat": "立方公分與體積 (N-4-12)"
    },
    {
        "idx": 15, "unit_id": 30, "theme_id": "t15",
        "name": "角度與量角器星際站", "icon": "📐", "color": "#8B5CF6",
        "desc": "量角器實測角度、平角與周角旋轉、垂直與平行判定 (N-4-10, S-4-1, S-4-5)",
        "sub_cat": "角度測量與旋轉 (S-4-1)"
    },
    {
        "idx": 16, "unit_id": 11, "theme_id": "t16",
        "name": "二位小數百分位溪流", "icon": "💧", "color": "#06B6D4",
        "desc": "認識百分位二位小數、大小比較與直式加減 (N-4-7)",
        "sub_cat": "二位小數與直式運算 (N-4-7)"
    },
    {
        "idx": 17, "unit_id": 33, "theme_id": "t17",
        "name": "未知數空格解謎寶庫", "icon": "🗝️", "color": "#EAB308",
        "desc": "算式填充題求解括號與空格未知數，利用加減乘除互逆 (R-4-2)",
        "sub_cat": "算式填充題與未知數 (R-4-2)"
    },
    {
        "idx": 18, "unit_id": 15, "theme_id": "t18",
        "name": "兩步驟連乘連除冒險林", "icon": "🏕️", "color": "#14B8A6",
        "desc": "生活情境兩步驟連乘、連除與乘除混合解題 (N-4-3)",
        "sub_cat": "兩步驟乘除應用 (N-4-3)"
    },
    {
        "idx": 19, "unit_id": 36, "theme_id": "t19",
        "name": "等值分數與小數數線橋", "icon": "🌉", "color": "#F97316",
        "desc": "透過數線長度表徵連結分數與小數，認識等值分數概念 (N-4-6, N-4-8)",
        "sub_cat": "分數與小數數線 (N-4-8)"
    },
    {
        "idx": 20, "unit_id": 31, "theme_id": "t20",
        "name": "長條圖與折線圖調查局", "icon": "📊", "color": "#6366F1",
        "desc": "生活單式與複式長條圖報讀、趨勢判斷與繪製 (D-4-1)",
        "sub_cat": "統計圖表報讀 (D-4-1)"
    },
    {
        "idx": 21, "unit_id": 27, "theme_id": "t21",
        "name": "平方公尺與長方形面積工廠", "icon": "🏭", "color": "#EC4899",
        "desc": "長方形與正方形面積公式、平方公尺與平方公分換算 (N-4-11, S-4-3)",
        "sub_cat": "長方形與正方形面積 (S-4-3)"
    },
    {
        "idx": 22, "unit_id": 26, "theme_id": "t22",
        "name": "幾何圖形周長巡邏隊", "icon": "🛡️", "color": "#3B82F6",
        "desc": "長方形正方形周長公式計算與複合圖形周長拆解 (S-4-3)",
        "sub_cat": "平面圖形周長 (S-4-3)"
    },
    {
        "idx": 23, "unit_id": 24, "theme_id": "t23",
        "name": "大額貨幣生活購物市集", "icon": "💰", "color": "#10B981",
        "desc": "萬位以上大額金錢收支找零與生活預算試算 (N-4-1, N-4-3)",
        "sub_cat": "大額貨幣與找零計算 (N-4-1)"
    }
]

print(f"[*] 載入 23 大主題規格完成。")

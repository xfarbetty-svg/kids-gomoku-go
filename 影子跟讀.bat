@echo off
chcp 65001 >nul
title 影子跟讀 - Shadowing Studio
cd /d "%~dp0"
echo 🎙️ 啟動影子跟讀本地伺服器...
echo.
echo 🎙️ http://localhost:8090/learn.html
echo 🌠 http://localhost:8090/toeic.html
echo 🏠 http://localhost:8090/index.html
echo.
echo 關閉此視窗 = 停止伺服器
echo ========================================
start "" "http://localhost:8090/learn.html"
python -m http.server 8090 --bind 127.0.0.1

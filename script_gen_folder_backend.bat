@echo off
REM Tạo folder gốc
mkdir backend

REM Di chuyển vào folder backend
cd backend

REM Tạo các folder con
mkdir controllers
mkdir models
mkdir routes
mkdir middleware
mkdir config

REM Tạo file server.js rỗng
type nul > server.js

echo ================================
echo   Backend folder đã được tạo
echo ================================
pause

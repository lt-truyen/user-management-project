@echo off
REM Tạo folder gốc
mkdir frontend

REM Di chuyển vào folder frontend
cd frontend

REM Tạo folder components
mkdir components

REM Tạo các file trong components
type nul > components\Login.js
type nul > components\UserList.js
type nul > components\UserForm.js

REM Tạo file App.js và index.js
type nul > App.js
type nul > index.js

echo ================================
echo   Frontend folder đã được tạo
echo ================================
pause

@echo off
setlocal enabledelayedexpansion

REM Paths
set FRONTEND_DIR=frontend
set FRONTEND_BUILD_DIR=%FRONTEND_DIR%\dist
set VENV_DIR=venv
set ENTRY_SCRIPT=app.py

echo 🔧 Starting setup...
REM Step 1: Build React frontend
echo 📦 Building React frontend...
cd %FRONTEND_DIR%
call npm install
call npm run build
cd ..

REM Step 2: Create virtual environment if not exists
if not exist %VENV_DIR% (
    echo ❗ Virtual environment not found. Creating one...
    python -m venv %VENV_DIR%
)
REM Step 3: Activate virtual environment
call %VENV_DIR%\Scripts\activate.bat
REM Step 4: Install Python dependencies
echo 🐍 Installing Python dependencies...
pip install --upgrade pip
pip install -r requirements.txt
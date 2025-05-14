@echo off
setlocal enabledelayedexpansion

REM Paths
set FRONTEND_DIR=frontend
set FRONTEND_BUILD_DIR=%FRONTEND_DIR%\dist
set VENV_DIR=venv
set ENTRY_SCRIPT=main.py
set SPEC_FILE=main.spec

echo 🔧 Starting full build...

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
pip install pyinstaller pywebview PyQt5 PyQtWebEngine qtpy flask

REM Step 5: Run PyInstaller
echo 🛠️ Packaging with PyInstaller...
pyinstaller --onefile %SPEC_FILE%

echo ✅ Build complete. Executable located at: dist\clinical-trial-dashboard\

endlocal
pause

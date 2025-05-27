@echo off
SETLOCAL

REM Minimum required versions
set MIN_PYTHON=3.9
set MIN_NPM=7.0.0

REM Check for Python
where python >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH.
    pause
    goto :eof
)

REM Check for npm
where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm is not installed or not in PATH.
    pause
    goto :eof
)

REM Check Python version
for /f "tokens=2 delims= " %%v in ('python --version 2^>^&1') do set PY_VER=%%v
for /f "tokens=1,2 delims=." %%a in ("%PY_VER%") do (
    set PY_MAJOR=%%a
    set PY_MINOR=%%b
)
if %PY_MAJOR% LSS 3 (
    echo [ERROR] Python version 3.9 or higher is required. Found: %PY_VER%
    pause
    goto :eof
)
if %PY_MAJOR%==3 if %PY_MINOR% LSS 9 (
    echo [ERROR] Python version 3.9 or higher is required. Found: %PY_VER%
    pause
    goto :eof
)

REM Check npm version
for /f "tokens=1 delims=." %%a in ('npm -v') do set NPM_MAJOR=%%a
for /f "tokens=2 delims=." %%a in ('npm -v') do set NPM_MINOR=%%a
if %NPM_MAJOR% LSS 7 (
    echo [ERROR] npm version 7.0.0 or higher is required.
    pause
    goto :eof
)

cd frontend
echo 📦 Building frontend...
call npm install
call npm run build
cd ..

REM Ensure backend/static exists
if not exist backend\static (
    mkdir backend\static
)

REM Copy frontend build files to backend/static
xcopy /E /Y /I frontend\dist\* backend\static\

cd backend
echo 📦 Building backend...
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
echo Activating virtual environment...
call venv\Scripts\activate
echo Installing dependencies...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

REM Use ; as separator for --add-data on Windows
pyinstaller --add-data "static;static" main.py --name "Clinical Trial Dashboard" --onefile --clean

ENDLOCAL
pause
@echo off
REM Exit on error (not as strict as bash, but will stop on error)
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

echo 📦 Building frontend...
cd frontend
call npm install
call npm run build
cd ..

echo 🚀 Starting FastAPI backend with uvicorn...
cd backend

REM Create a virtual environment if it doesn't exist
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate the virtual environment and install dependencies
echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

uvicorn main:app --host 0.0.0.0 --port 8000 --reload

ENDLOCAL
pause
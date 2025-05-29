echo 📦 Building frontend...
cd frontend
call npm install

REM Properly remove the dist directory (Windows compatible)
if exist dist (
    echo Removing old dist directory...
    rmdir /S /Q dist
) else (
    echo No old dist directory found.
)

call npm run build
cd ..

if exist backend\static (
    echo Static directory already exists. Deleting old static files...
    rmdir /S /Q backend\static
    echo Creating new static directory...
    mkdir backend\static
) else (
    echo Creating static directory...
    mkdir backend\static
)

echo 📂 Copying built frontend files to backend static directory...
xcopy frontend\dist\* backend\static\ /s /e

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
#!/bin/bash

cd frontend
echo "📦 Building frontend..."
npm install
npm run build
cd ..

mkdir -p backend/static
cp -r frontend/dist/* backend/static/

cd backend
echo "📦 Building backend..."
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi
echo "Activating virtual environment..."
source venv/bin/activate
echo "Installing dependencies..."
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
pyinstaller --add-data "static:static" main.py --name "Clinical Trial Dashboard" --onefile --clean
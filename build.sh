#!/bin/bash

# set -e  # Exit immediately if any command fails

# Activate virtual environment
if [ ! -d "venv" ]; then
#   echo "❌ Virtual environment not found. Run: python -m venv venv && source venv/bin/activate"
  echo "📦 Virtual environment not found. Setting up venv"
  python -m venv venv
#   exit 1
fi



source venv/bin/activate

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "📦 Installing frontend dependencies and building React app..."
cd frontend
npm install
npm run build
cd ..

echo "🛠 Building executable with PyInstaller..."
pyinstaller main.spec

echo "✅ Build complete! Executable is in: dist/"

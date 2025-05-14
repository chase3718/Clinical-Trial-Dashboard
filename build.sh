#!/bin/bash

set -e

# Paths
FRONTEND_DIR="./frontend"
FRONTEND_BUILD_DIR="$FRONTEND_DIR/dist"
VENV_DIR="./venv"
ENTRY_SCRIPT="main.py"
SPEC_FILE="main.spec"

echo "🔧 Starting full build..."

# Step 1: Build React frontend
echo "📦 Building React frontend..."
cd "$FRONTEND_DIR"
npm install
npm run build
cd ..

# Step 2: Activate Python virtual environment
if [ ! -d "$VENV_DIR" ]; then
  echo "❗ Virtual environment not found. Creating one..."
  python -m venv "$VENV_DIR"
fi

source "$VENV_DIR/bin/activate"

# Step 3: Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip install --upgrade pip
pip install pyinstaller pywebview PyQt5 PyQtWebEngine qtpy flask

# Step 4: Run PyInstaller
echo "🛠️ Packaging with PyInstaller..."
pyinstaller --onfile "$SPEC_FILE"

echo "✅ Build complete. Executable located at: dist/clinical-trial-dashboard/"

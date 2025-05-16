#!/bin/bash

# Check if virtual environment exists
if [ ! -d "venv" ]; then
  echo "📦 Virtual environment not found. Setting up venv"
  python -m venv venv
else
  echo "📦 Virtual environment found. Activating..."
fi
# Activate virtual environment
source venv/bin/activate
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt
echo "📦 Installing frontend dependencies and building React app..."
cd frontend
npm install
npm run build
cd ..

echo "Setup complete! You can begin development."
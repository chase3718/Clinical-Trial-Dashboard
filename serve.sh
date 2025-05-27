#!/bin/bash

# Exit on any error
# set -e

echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "🚀 Starting FastAPI backend with uvicorn..."
cd backend
# Create a virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi
# Activate the virtual environment and install dependencies

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
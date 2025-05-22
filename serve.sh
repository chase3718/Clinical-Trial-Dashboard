#!/bin/bash

# Exit on any error
# set -e

echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

echo "🚀 Starting FastAPI backend with uvicorn..."
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
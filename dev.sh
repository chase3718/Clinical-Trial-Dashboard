#!/bin/bash

# Exit on any error
# set -e

echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Set environment variables for Flask
export FLASK_APP=backend.app
export FLASK_ENV=development

echo "🚀 Starting Flask backend..."
# Run Flask in background on port 5000
flask run &

FLASK_PID=$!

# Wait for Flask to start
sleep 1

# Optional: Start React dev server (uncomment to enable)
echo "🌐 Starting React frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Run main.py (in dev mode, it should open a browser or webview)
echo "🖼️ Starting app frontend (via PyWebView or browser)..."
python backend/app.py

# Clean up on exit
trap "kill $FLASK_PID" EXIT

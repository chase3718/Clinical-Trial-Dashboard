#!/bin/bash

# Move into backend directory
cd "$(dirname "$0")/backend"

# Activate your virtual environment (adjust the path if needed)
source venv/bin/activate

# Run FastAPI with uvicorn
uvicorn main:app --reload --port 8000

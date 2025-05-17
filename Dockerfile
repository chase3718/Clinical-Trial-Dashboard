# Build frontend
FROM node:18 AS frontend
WORKDIR /app
COPY frontend/ .
RUN npm install && npm run build

# Build backend
FROM python:3.11-slim
WORKDIR /app

# Install Python deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and built frontend
COPY backend/ ./backend/
COPY --from=frontend /app/dist ./frontend/dist

# Expose and run
WORKDIR /app/backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

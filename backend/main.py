from fastapi import FastAPI
from routers import files
from models.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import sys
import os

app = FastAPI()
app.include_router(files.router, prefix="/api/files")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# Helper to get static path (works with PyInstaller and normal run)
def get_static_path():
    if getattr(sys, 'frozen', False):
        # Running in a PyInstaller bundle
        return os.path.join(sys._MEIPASS, "static")
    # Running in normal Python environment
    return os.path.join(os.path.dirname(__file__), "static")

frontend_dist = Path(get_static_path())

app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="assets")

# Serve index.html for frontend routes
@app.get("/api")
@app.get("/api/{full_path:path}")
async def serve_spa(full_path: str):
    index_file = frontend_dist / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"detail": "Frontend not built yet."}

@app.get("/api/ping")
async def ping():
    return {"message": "pong"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False
    )
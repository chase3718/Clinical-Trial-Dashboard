from fastapi import FastAPI
from routers import files
from models.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path



app = FastAPI()
app.include_router(files.router, prefix="/files")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
# Serve static frontend
frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="assets")

# Serve index.html for frontend routes
@app.get("/")
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    index_file = frontend_dist / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"detail": "Frontend not built yet."}


@app.get("/ping")
async def ping():
    return {"message": "pong"}
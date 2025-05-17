import os
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import SessionLocal
from models.file_record import FileRecord
from uuid import uuid4
from pathlib import Path

UPLOAD_DIR = Path("uploaded_files")
UPLOAD_DIR.mkdir(exist_ok=True)

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith((".csv", ".xlsx")):
        raise HTTPException(status_code=400, detail="Only CSV or XLSX files are supported.")

    unique_name = f"{uuid4()}_{file.filename}"
    file_path = UPLOAD_DIR / unique_name

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    record = FileRecord(filename=unique_name, displayname=file.filename)
    db.add(record)
    db.commit()
    db.refresh(record)

    return {"filename": file.filename, "id": record.id}

@router.get("/ping")
async def ping():
    return {"message": "pong"}
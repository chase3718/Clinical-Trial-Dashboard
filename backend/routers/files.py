import os
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import SessionLocal
from models.file_record import FileRecord
from uuid import uuid4
from pathlib import Path
import pandas as pd  

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

    # Save file to disk
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # Parse file to JSON
    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(file_path)
        elif file.filename.endswith(".xlsx"):
            df = pd.read_excel(file_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing file: {e}")

    data_json = df.to_dict(orient="records")  # List of dicts (rows)

    record = FileRecord(filename=unique_name, displayname=file.filename)
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "filename": file.filename,
        "id": record.id,
        "data": data_json
    }

@router.get("/all")
def list_uploaded_files(db: Session = Depends(get_db)):
    files = db.query(FileRecord).all()
    # Return a list of dicts with id and displayname for each file
    return [
        {"id": file.id, "displayname": file.displayname}
        for file in files
    ]

@router.get("/data/{file_id}")
def get_file_data(file_id: int, db: Session = Depends(get_db)):
    record = db.query(FileRecord).filter(FileRecord.id == file_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    file_path = UPLOAD_DIR / record.filename
    try:
        if record.displayname.endswith(".csv"):
            df = pd.read_csv(file_path)
        elif record.displayname.endswith(".xlsx"):
            df = pd.read_excel(file_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing file: {e}")
    return {"id": record.id, "filename": record.displayname, "data": df.to_dict(orient="records")}

@router.get("/ping")
async def ping():
    return {"message": "pong"}

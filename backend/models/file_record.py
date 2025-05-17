from sqlalchemy import Column, Integer, String, DateTime
from .database import Base
import time


class FileRecord(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, unique=True, index=True)
    displayname = Column(String, unique=False, index=False)
    upload_time = Column(DateTime, default=time.time())

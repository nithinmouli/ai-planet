from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class DocumentBase(BaseModel):
    filename: str
    original_filename: str
    content_type: Optional[str] = None
    doc_metadata: Optional[Dict[str, Any]] = None  # Updated field name
    workflow_id: Optional[int] = None  # Link to workflow

class DocumentCreate(DocumentBase):
    file_path: str
    file_size: Optional[int] = None
    text_content: Optional[str] = None

class DocumentUpdate(BaseModel):
    filename: Optional[str] = None
    doc_metadata: Optional[Dict[str, Any]] = None 
    text_content: Optional[str] = None
    workflow_id: Optional[int] = None 

class Document(DocumentBase):
    id: int
    file_path: str
    file_size: Optional[int] = None
    text_content: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_size: Optional[int] = None
    content_type: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
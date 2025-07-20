from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from pathlib import Path
import uuid

from app.database import get_db
from app.models.document import Document
from app.schemas.document import Document as DocumentResponse, DocumentCreate
from app.services.document_processor import document_processor

router = APIRouter(prefix="/documents", tags=["documents"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    workflow_id: int = None,  # Optional workflow association
    db: Session = Depends(get_db)
):
    """Upload and process a document, optionally linking it to a workflow"""
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    try:
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process file
        processing_result = await document_processor.process_file(
            str(file_path), 
            file.filename
        )
        
        # Create document record
        document_data = DocumentCreate(
            filename=unique_filename,
            original_filename=file.filename,
            file_path=str(file_path),
            file_size=file_path.stat().st_size,
            content_type=processing_result["content_type"],
            text_content=processing_result["text_content"],
            workflow_id=workflow_id,  # Link to workflow
            doc_metadata={  # Updated field name
                "word_count": processing_result["word_count"],
                "char_count": processing_result["char_count"]
            }
        )
        
        db_document = Document(**document_data.dict())
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        
        # Index document in vector database
        chunk_count = await document_processor.index_document(
            document_id=db_document.id,
            text_content=processing_result["text_content"],
            metadata={
                "filename": file.filename,
                "document_id": db_document.id,
                "workflow_id": workflow_id  # Include workflow_id in vector metadata
            }
        )
        
        # Update metadata with chunk count
        db_document.doc_metadata["chunk_count"] = chunk_count  # Updated field name
        db.commit()
        
        return DocumentResponse.from_orm(db_document)
        
    except Exception as e:
        # Clean up file if database operation fails
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error processing document: {str(e)}"
        )

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    workflow_id: int = None,  # Optional filter by workflow
    db: Session = Depends(get_db)
):
    """Get list of all documents, optionally filtered by workflow"""
    query = db.query(Document)
    
    if workflow_id is not None:
        query = query.filter(Document.workflow_id == workflow_id)
    
    documents = query.all()
    return documents

@router.get("/workflow/{workflow_id}", response_model=List[DocumentResponse])
async def get_workflow_documents(workflow_id: int, db: Session = Depends(get_db)):
    """Get all documents for a specific workflow"""
    documents = db.query(Document).filter(Document.workflow_id == workflow_id).all()
    return documents

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: int, db: Session = Depends(get_db)):
    """Get a specific document"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    return document

@router.delete("/{document_id}")
async def delete_document(document_id: int, db: Session = Depends(get_db)):
    """Delete a document"""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Delete file
    file_path = Path(document.file_path)
    if file_path.exists():
        file_path.unlink()
    
    # Delete from database
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"}
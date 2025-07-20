import fitz  # PyMuPDF
import os
from typing import List, Dict, Any
import mimetypes
from pathlib import Path
import aiofiles
from .chroma_service import chroma_service

class DocumentProcessor:
    def __init__(self):
        self.supported_types = [
            'application/pdf',
            'text/plain',
            'text/markdown'
        ]
    
    async def process_file(self, file_path: str, filename: str) -> Dict[str, Any]:
        """Process a file and extract text content"""
        file_extension = Path(filename).suffix.lower()
        content_type = mimetypes.guess_type(filename)[0]
        
        if content_type not in self.supported_types:
            raise ValueError(f"Unsupported file type: {content_type}")
        
        text_content = ""
        
        if content_type == 'application/pdf':
            text_content = await self._extract_pdf_text(file_path)
        elif content_type in ['text/plain', 'text/markdown']:
            text_content = await self._extract_text_content(file_path)
        
        return {
            "text_content": text_content,
            "content_type": content_type,
            "word_count": len(text_content.split()),
            "char_count": len(text_content)
        }
    
    async def _extract_pdf_text(self, file_path: str) -> str:
        """Extract text from PDF using PyMuPDF"""
        text_content = ""
        
        try:
            doc = fitz.open(file_path)
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text_content += page.get_text()
            doc.close()
        except Exception as e:
            raise ValueError(f"Error processing PDF: {str(e)}")
        
        return text_content
    
    async def _extract_text_content(self, file_path: str) -> str:
        """Extract text from plain text files"""
        try:
            async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
                content = await f.read()
            return content
        except Exception as e:
            raise ValueError(f"Error reading text file: {str(e)}")
    
    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 100) -> List[str]:
        """Split text into smaller chunks for free tier models"""
        words = text.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size - overlap):
            chunk = ' '.join(words[i:i + chunk_size])
            chunks.append(chunk)
            
            if i + chunk_size >= len(words):
                break
        
        return chunks
    
    async def index_document(self, document_id: int, text_content: str, metadata: Dict[str, Any]):
        """Index document content in vector database"""
        collection_name = f"documents"
        
        chunks = self.chunk_text(text_content)
        
        chunk_metadatas = []
        chunk_ids = []
        
        for i, chunk in enumerate(chunks):
            chunk_metadata = {
                **metadata,
                "document_id": document_id,
                "chunk_index": i,
                "chunk_count": len(chunks)
            }
            chunk_metadatas.append(chunk_metadata)
            chunk_ids.append(f"doc_{document_id}_chunk_{i}")
        
        chroma_service.add_documents(
            collection_name=collection_name,
            documents=chunks,
            metadatas=chunk_metadatas,
            ids=chunk_ids
        )
        
        return len(chunks)

document_processor = DocumentProcessor()
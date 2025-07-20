from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path

os.environ["ANONYMIZED_TELEMETRY"] = "False"
os.environ["CHROMA_SERVER_AUTHN_CREDENTIALS_FILE"] = ""

from app.routers.documents import router as documents_router
from app.routers.workflows import router as workflows_router
from app.routers.chat import router as chat_router
from app.routers.components import router as components_router

app = FastAPI(
    title="No-Code Workflow Builder API",
    description="API for building and executing intelligent workflows",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents_router)
app.include_router(workflows_router)
app.include_router(chat_router)
app.include_router(components_router)

uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "No-Code Workflow Builder API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "API is running"}

@app.on_event("startup")
async def startup_event():
    """Create database tables on startup"""
    try:
        from app.database import engine, Base
        from app.models import Document, Workflow, WorkflowExecution, ChatSession, ChatMessage
        
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
        
    except Exception as e:
        print(f"Error creating database tables: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )

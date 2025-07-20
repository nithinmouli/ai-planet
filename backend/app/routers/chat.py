from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.database import get_db
from app.models.chat import ChatSession, ChatMessage
from app.models.workflow import Workflow
from app.schemas.chat import (
    ChatRequest, ChatResponse,
    ChatSession as ChatSessionSchema,
    ChatMessage as ChatMessageSchema
)
from app.services.workflow_executor import workflow_executor

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/", response_model=ChatResponse)
async def send_message(
    chat_request: ChatRequest,
    db: Session = Depends(get_db)
):
    """Send a message and get response from workflow"""
    
    session_id = chat_request.session_id
    if not session_id:
        session_id = str(uuid.uuid4())
        
        db_session = ChatSession(
            workflow_id=chat_request.workflow_id,
            session_id=session_id
        )
        db.add(db_session)
        db.commit()
    else:
        db_session = db.query(ChatSession).filter(
            ChatSession.session_id == session_id
        ).first()
        if not db_session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found"
            )
    
    workflow = db.query(Workflow).filter(
        Workflow.id == chat_request.workflow_id
    ).first()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    if not workflow.is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Workflow is not valid"
        )
    
    user_message = ChatMessage(
        session_id=session_id,
        message_type="user",
        content=chat_request.message
    )
    db.add(user_message)
    db.commit()
    
    try:
        from app.schemas.workflow import ComponentConfig, WorkflowConnection
        components = [ComponentConfig(**comp) for comp in workflow.components]
        connections = [WorkflowConnection(**conn) for conn in workflow.connections]
        
        result = await workflow_executor.execute_workflow(
            components=components,
            connections=connections,
            user_query=chat_request.message,
            workflow_id=chat_request.workflow_id
        )
        
        response_text = result["final_response"]
        
        assistant_message = ChatMessage(
            session_id=session_id,
            message_type="assistant",
            content=response_text,
            msg_metadata={
                "execution_success": result["success"],
                "execution_steps": len(result.get("execution_steps", [])),
                "workflow_id": chat_request.workflow_id
            }
        )
        db.add(assistant_message)
        db.commit()
        
        return ChatResponse(
            message=response_text,
            session_id=session_id,
            metadata={
                "execution_success": result["success"],
                "steps_executed": len(result.get("execution_steps", []))
            }
        )
        
    except Exception as e:
        error_message = f"Error processing message: {str(e)}"
        
        error_response = ChatMessage(
            session_id=session_id,
            message_type="assistant",
            content=error_message,
            msg_metadata={
                "error": True,
                "workflow_id": chat_request.workflow_id
            }
        )
        db.add(error_response)
        db.commit()
        
        return ChatResponse(
            message=error_message,
            session_id=session_id,
            metadata={"error": True}
        )

@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageSchema])
async def get_chat_history(session_id: str, db: Session = Depends(get_db)):
    """Get chat history for a session"""
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).all()
    
    return messages

@router.get("/sessions/{session_id}", response_model=ChatSessionSchema)
async def get_chat_session(session_id: str, db: Session = Depends(get_db)):
    """Get chat session details"""
    session = db.query(ChatSession).filter(
        ChatSession.session_id == session_id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    
    return ChatSessionSchema.from_orm(session)

@router.get("/workflows/{workflow_id}/sessions", response_model=List[ChatSessionSchema])
async def get_workflow_sessions(workflow_id: int, db: Session = Depends(get_db)):
    """Get all chat sessions for a workflow"""
    sessions = db.query(ChatSession).filter(
        ChatSession.workflow_id == workflow_id
    ).order_by(ChatSession.updated_at.desc()).all()
    
    return sessions
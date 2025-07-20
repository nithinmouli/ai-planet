from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class ChatMessageBase(BaseModel):
    content: str
    message_type: str
    msg_metadata: Optional[Dict[str, Any]] = None 

class ChatMessageCreate(ChatMessageBase):
    session_id: str

class ChatMessage(ChatMessageBase):
    id: int
    session_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionBase(BaseModel):
    workflow_id: int

class ChatSessionCreate(ChatSessionBase):
    session_id: str

class ChatSession(ChatSessionBase):
    id: int
    session_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    workflow_id: int

class ChatResponse(BaseModel):
    message: str
    session_id: str
    execution_id: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class ComponentType(str, Enum):
    USER_QUERY = "user_query"
    KNOWLEDGE_BASE = "knowledge_base"
    LLM_ENGINE = "llm_engine"
    WEB_SEARCH = "web_search"
    OUTPUT = "output"

class ComponentConfig(BaseModel):
    id: str
    type: ComponentType
    label: str
    position: Dict[str, float] 
    data: Dict[str, Any] 

class WorkflowConnection(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None

class WorkflowCreate(WorkflowBase):
    components: List[ComponentConfig]
    connections: List[WorkflowConnection]

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    components: Optional[List[ComponentConfig]] = None
    connections: Optional[List[WorkflowConnection]] = None

class Workflow(WorkflowBase):
    id: int
    components: List[ComponentConfig]
    connections: List[WorkflowConnection]
    is_valid: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WorkflowExecutionBase(BaseModel):
    workflow_id: int
    input_query: str

class WorkflowExecutionCreate(WorkflowExecutionBase):
    pass

class WorkflowExecution(WorkflowExecutionBase):
    id: int
    output_response: Optional[str] = None
    execution_steps: Optional[List[Dict[str, Any]]] = None
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json

from app.database import get_db
from app.models.workflow import Workflow, WorkflowExecution
from app.schemas.workflow import (
    WorkflowCreate, WorkflowUpdate, Workflow as WorkflowSchema,
    WorkflowExecutionCreate, WorkflowExecution as WorkflowExecutionSchema
)
from app.services.workflow_executor import workflow_executor

router = APIRouter(prefix="/workflows", tags=["workflows"])

@router.post("/", response_model=WorkflowSchema)
async def create_workflow(
    workflow: WorkflowCreate,
    db: Session = Depends(get_db)
):
    """Create a new workflow"""
    
    # Validate workflow
    is_valid = workflow_executor._validate_workflow(
        workflow.components, 
        workflow.connections
    )
    
    db_workflow = Workflow(
        name=workflow.name,
        description=workflow.description,
        components=json.loads(json.dumps([comp.dict() for comp in workflow.components])),
        connections=json.loads(json.dumps([conn.dict() for conn in workflow.connections])),
        is_valid=is_valid
    )
    
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)
    
    return WorkflowSchema.from_orm(db_workflow)

@router.get("/", response_model=List[WorkflowSchema])
async def list_workflows(db: Session = Depends(get_db)):
    """Get list of all workflows"""
    workflows = db.query(Workflow).all()
    return workflows

@router.get("/{workflow_id}", response_model=WorkflowSchema)
async def get_workflow(workflow_id: int, db: Session = Depends(get_db)):
    """Get a specific workflow"""
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    return WorkflowSchema.from_orm(workflow)

@router.put("/{workflow_id}", response_model=WorkflowSchema)
async def update_workflow(
    workflow_id: int,
    workflow_update: WorkflowUpdate,
    db: Session = Depends(get_db)
):
    """Update a workflow"""
    db_workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not db_workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    update_data = workflow_update.dict(exclude_unset=True)
    
    # Convert Pydantic models to dict for JSON storage
    if "components" in update_data:
        update_data["components"] = json.loads(json.dumps([comp.dict() for comp in workflow_update.components]))
        
    if "connections" in update_data:
        update_data["connections"] = json.loads(json.dumps([conn.dict() for conn in workflow_update.connections]))
    
    # Revalidate workflow if components or connections changed
    if "components" in update_data or "connections" in update_data:
        components = update_data.get("components", db_workflow.components)
        connections = update_data.get("connections", db_workflow.connections)
        
        # Convert back to Pydantic for validation
        from app.schemas.workflow import ComponentConfig, WorkflowConnection
        component_objects = [ComponentConfig(**comp) for comp in components]
        connection_objects = [WorkflowConnection(**conn) for conn in connections]
        
        update_data["is_valid"] = workflow_executor._validate_workflow(
            component_objects, 
            connection_objects
        )
    
    for field, value in update_data.items():
        setattr(db_workflow, field, value)
    
    db.commit()
    db.refresh(db_workflow)
    
    return WorkflowSchema.from_orm(db_workflow)

@router.delete("/{workflow_id}")
async def delete_workflow(workflow_id: int, db: Session = Depends(get_db)):
    """Delete a workflow"""
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    db.delete(workflow)
    db.commit()
    
    return {"message": "Workflow deleted successfully"}

@router.post("/{workflow_id}/execute", response_model=WorkflowExecutionSchema)
async def execute_workflow(
    workflow_id: int,
    execution: WorkflowExecutionCreate,
    db: Session = Depends(get_db)
):
    """Execute a workflow"""
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
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
    
    # Create execution record
    db_execution = WorkflowExecution(
        workflow_id=workflow_id,
        input_query=execution.input_query,
        status="running"
    )
    db.add(db_execution)
    db.commit()
    db.refresh(db_execution)
    
    try:
        # Convert stored JSON back to Pydantic objects
        from app.schemas.workflow import ComponentConfig, WorkflowConnection
        components = [ComponentConfig(**comp) for comp in workflow.components]
        connections = [WorkflowConnection(**conn) for conn in workflow.connections]
        
        # Execute workflow
        result = await workflow_executor.execute_workflow(
            components=components,
            connections=connections,
            user_query=execution.input_query
        )
        
        # Update execution record
        db_execution.status = "completed" if result["success"] else "failed"
        db_execution.output_response = result["final_response"]
        db_execution.execution_steps = result["execution_steps"]
        if not result["success"]:
            db_execution.error_message = result.get("error", "Unknown error")
        
        db.commit()
        db.refresh(db_execution)
        
        return WorkflowExecutionSchema.from_orm(db_execution)
        
    except Exception as e:
        db_execution.status = "failed"
        db_execution.error_message = str(e)
        db.commit()
        db.refresh(db_execution)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Workflow execution failed: {str(e)}"
        )

@router.get("/{workflow_id}/executions", response_model=List[WorkflowExecutionSchema])
async def get_workflow_executions(workflow_id: int, db: Session = Depends(get_db)):
    """Get execution history for a workflow"""
    executions = db.query(WorkflowExecution).filter(
        WorkflowExecution.workflow_id == workflow_id
    ).order_by(WorkflowExecution.created_at.desc()).all()
    
    return executions
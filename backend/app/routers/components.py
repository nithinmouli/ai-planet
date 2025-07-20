from fastapi import APIRouter
from typing import List, Dict, Any
from app.schemas.workflow import ComponentType

router = APIRouter(prefix="/components", tags=["components"])
COMPONENT_DEFINITIONS = {
    ComponentType.USER_QUERY: {
        "type": ComponentType.USER_QUERY,
        "label": "User Query",
        "description": "Accepts user queries and serves as the entry point for the workflow",
        "inputs": [],
        "outputs": ["query"],
        "config_schema": {
            "type": "object",
            "properties": {
                "placeholder": {
                    "type": "string",
                    "title": "Placeholder Text",
                    "default": "Enter your question..."
                }
            }
        },
        "icon": "search",
        "color": "#3B82F6"
    },
    ComponentType.KNOWLEDGE_BASE: {
        "type": ComponentType.KNOWLEDGE_BASE,
        "label": "Knowledge Base",
        "description": "Retrieves relevant context from uploaded documents using vector search",
        "inputs": ["query"],
        "outputs": ["context", "retrieved_documents"],
        "config_schema": {
            "type": "object",
            "properties": {
                "collection_name": {
                    "type": "string",
                    "title": "Collection Name",
                    "default": "documents"
                },
                "max_results": {
                    "type": "integer",
                    "title": "Max Results",
                    "default": 3,  # Reduced for free tier
                    "minimum": 1,
                    "maximum": 10  # Limited for free tier
                },
                "similarity_threshold": {
                    "type": "number",
                    "title": "Similarity Threshold",
                    "default": 0.7,
                    "minimum": 0.0,
                    "maximum": 1.0
                }
            }
        },
        "icon": "book",
        "color": "#10B981"
    },
    ComponentType.LLM_ENGINE: {
        "type": ComponentType.LLM_ENGINE,
        "label": "LLM Engine",
        "description": "Generates responses using language models like OpenAI GPT or Google Gemini",
        "inputs": ["query", "context"],
        "outputs": ["response"],
        "config_schema": {
            "type": "object",
            "properties": {
                "provider": {
                    "type": "string",
                    "title": "LLM Provider",
                    "enum": ["openai", "gemini"],
                    "default": "gemini"
                },
                "model": {
                    "type": "string",
                    "title": "Model",
                    "default": "gemini-1.5-flash"
                },
                "custom_prompt": {
                    "type": "string",
                    "title": "Custom Prompt",
                    "default": "You are a helpful AI assistant. Answer the user's question based on the provided context and your knowledge."
                },
                "use_web_search": {
                    "type": "boolean",
                    "title": "Use Web Search",
                    "default": False
                },
                "temperature": {
                    "type": "number",
                    "title": "Temperature",
                    "default": 0.7,
                    "minimum": 0.0,
                    "maximum": 2.0
                },
                "max_tokens": {
                    "type": "integer",
                    "title": "Max Tokens",
                    "default": 500, 
                    "minimum": 1,
                    "maximum": 1000  
                }
            }
        },
        "icon": "bot",
        "color": "#8B5CF6"
    },
    ComponentType.WEB_SEARCH: {
        "type": ComponentType.WEB_SEARCH,
        "label": "Web Search",
        "description": "Searches the web for real-time information using Google or Bing",
        "inputs": ["query"],
        "outputs": ["search_results", "context"],
        "config_schema": {
            "type": "object",
            "properties": {
                "search_engine": {
                    "type": "string",
                    "title": "Search Engine",
                    "enum": ["google", "bing"],
                    "default": "google"
                },
                "max_results": {
                    "type": "integer",
                    "title": "Max Results",
                    "default": 3,
                    "minimum": 1,
                    "maximum": 10
                },
                "search_type": {
                    "type": "string",
                    "title": "Search Type",
                    "enum": ["general", "news", "academic"],
                    "default": "general"
                }
            }
        },
        "icon": "globe",
        "color": "#06B6D4"
    },
    ComponentType.OUTPUT: {
        "type": ComponentType.OUTPUT,
        "label": "Output",
        "description": "Displays the final response in a chat interface",
        "inputs": ["response"],
        "outputs": [],
        "config_schema": {
            "type": "object",
            "properties": {
                "format": {
                    "type": "string",
                    "title": "Output Format",
                    "enum": ["text", "markdown", "json"],
                    "default": "text"
                },
                "show_metadata": {
                    "type": "boolean",
                    "title": "Show Metadata",
                    "default": False
                }
            }
        },
        "icon": "message",
        "color": "#F59E0B"
    }
}

@router.get("/", response_model=List[Dict[str, Any]])
async def get_available_components():
    """Get list of available workflow components"""
    return list(COMPONENT_DEFINITIONS.values())

@router.get("/{component_type}", response_model=Dict[str, Any])
async def get_component_definition(component_type: ComponentType):
    """Get definition for a specific component type"""
    if component_type not in COMPONENT_DEFINITIONS:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component type '{component_type}' not found"
        )
    
    return COMPONENT_DEFINITIONS[component_type]

@router.post("/validate/workflow")
async def validate_workflow_structure(
    workflow_data: Dict[str, Any]
):
    """Validate a workflow structure"""
    from app.services.workflow_executor import workflow_executor
    from app.schemas.workflow import ComponentConfig, WorkflowConnection
    
    try:
        components = workflow_data.get("components", [])
        connections = workflow_data.get("connections", [])
        
        component_objects = [ComponentConfig(**comp) for comp in components]
        connection_objects = [WorkflowConnection(**conn) for conn in connections]
        
        is_valid = workflow_executor._validate_workflow(component_objects, connection_objects)
        
        validation_result = {
            "is_valid": is_valid,
            "component_count": len(component_objects),
            "connection_count": len(connection_objects),
            "errors": []
        }
        
        if not is_valid:
            component_types = [c.type for c in component_objects]
            required_types = [ComponentType.USER_QUERY, ComponentType.OUTPUT]
            
            for required_type in required_types:
                if required_type not in component_types:
                    validation_result["errors"].append(f"Missing required component: {required_type}")
        
        return validation_result
        
    except Exception as e:
        return {
            "is_valid": False,
            "component_count": 0,
            "connection_count": 0,
            "errors": [f"Validation error: {str(e)}"]
        }
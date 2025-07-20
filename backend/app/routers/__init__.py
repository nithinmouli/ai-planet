from .documents import router as documents_router
from .workflows import router as workflows_router
from .chat import router as chat_router
from .components import router as components_router

__all__ = [
    "documents_router",
    "workflows_router", 
    "chat_router",
    "components_router"
]
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime
from .llm_service import llm_service, LLMProvider
from .chroma_service import chroma_service
from app.schemas.workflow import ComponentType, ComponentConfig, WorkflowConnection

class WorkflowExecutor:
    def __init__(self):
        self.execution_steps = []
    
    async def execute_workflow(self, 
                             components: List[ComponentConfig], 
                             connections: List[WorkflowConnection], 
                             user_query: str,
                             workflow_id: Optional[int] = None) -> Dict[str, Any]:
        """Execute a workflow with the given components and connections"""
        self.execution_steps = []
        
        try:
            # Validate workflow
            if not self._validate_workflow(components, connections):
                raise ValueError("Invalid workflow configuration")
            
            execution_order = self._get_execution_order(components, connections)
            current_data = {"query": user_query, "workflow_id": workflow_id}
            
            for component_id in execution_order:
                component = next(c for c in components if c.id == component_id)
                
                step_result = await self._execute_component(component, current_data)
                
                self.execution_steps.append({
                    "component_id": component_id,
                    "component_type": component.type,
                    "timestamp": datetime.now().isoformat(),
                    "input": current_data.copy(),
                    "output": step_result,
                    "success": step_result.get("success", True)
                })
                
                current_data.update(step_result)
                
                if not step_result.get("success", True):
                    break
            
            return {
                "success": True,
                "final_response": current_data.get("response", "No response generated"),
                "execution_steps": self.execution_steps,
                "metadata": {
                    "total_steps": len(self.execution_steps),
                    "execution_time": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "execution_steps": self.execution_steps,
                "final_response": f"Workflow execution failed: {str(e)}"
            }
    
    def _validate_workflow(self, components: List[ComponentConfig], connections: List[WorkflowConnection]) -> bool:
        """Validate that the workflow is properly configured"""
        component_types = [c.type for c in components]
        required_types = [ComponentType.USER_QUERY, ComponentType.OUTPUT]
        
        for required_type in required_types:
            if required_type not in component_types:
                return False
        
        component_ids = [c.id for c in components]
        
        for connection in connections:
            if connection.source not in component_ids or connection.target not in component_ids:
                return False
        
        return True
    
    def _get_execution_order(self, components: List[ComponentConfig], connections: List[WorkflowConnection]) -> List[str]:
        """Determine the order of component execution based on connections"""
        graph = {comp.id: [] for comp in components}
        in_degree = {comp.id: 0 for comp in components}
        
        for connection in connections:
            graph[connection.source].append(connection.target)
            in_degree[connection.target] += 1
        
        # Topological sort
        queue = [comp_id for comp_id, degree in in_degree.items() if degree == 0]
        execution_order = []
        
        while queue:
            current = queue.pop(0)
            execution_order.append(current)
            
            for neighbor in graph[current]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
        
        return execution_order
    
    async def _execute_component(self, component: ComponentConfig, current_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single component"""
        
        if component.type == ComponentType.USER_QUERY:
            return await self._execute_user_query_component(component, current_data)
        
        elif component.type == ComponentType.KNOWLEDGE_BASE:
            return await self._execute_knowledge_base_component(component, current_data)
        
        elif component.type == ComponentType.LLM_ENGINE:
            return await self._execute_llm_engine_component(component, current_data)
        
        elif component.type == ComponentType.OUTPUT:
            return await self._execute_output_component(component, current_data)
        
        else:
            return {
                "success": False,
                "error": f"Unknown component type: {component.type}"
            }
    
    async def _execute_user_query_component(self, component: ComponentConfig, current_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute user query component"""
        return {
            "success": True,
            "query": current_data.get("query", ""),
            "component_output": "Query received and processed"
        }
    
    async def _execute_knowledge_base_component(self, component: ComponentConfig, current_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute knowledge base component"""
        try:
            query = current_data.get("query", "")
            workflow_id = current_data.get("workflow_id")
            config = component.data
            
            collection_name = config.get("collection_name", "documents")
            max_results = config.get("max_results", 3) 
            
            results = chroma_service.query_documents(
                collection_name=collection_name,
                query=query,
                n_results=max_results,
                workflow_id=workflow_id 
            )
            
            context = "\n\n".join(results["documents"])
            
            return {
                "success": True,
                "context": context,
                "retrieved_documents": len(results["documents"]),
                "component_output": f"Retrieved {len(results['documents'])} relevant documents for workflow {workflow_id if workflow_id else 'all'}"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Knowledge base component error: {str(e)}",
                "context": ""
            }
    
    async def _execute_llm_engine_component(self, component: ComponentConfig, current_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute LLM engine component"""
        try:
            query = current_data.get("query", "")
            context = current_data.get("context", "")
            config = component.data
            
            # Get configuration with smart provider detection
            provider_name = config.get("provider")
            model = config.get("model")
            
            # Auto-detect provider if not specified
            if not provider_name and model:
                if "gemini" in model.lower() or "bard" in model.lower():
                    provider_name = "gemini"
                elif "gpt" in model.lower() or "davinci" in model.lower() or "curie" in model.lower():
                    provider_name = "openai"
                else:
                    provider_name = "gemini"  # Default to free Gemini
            elif not provider_name:
                provider_name = "gemini"  # Default to free Gemini
                
            provider = LLMProvider(provider_name)
            custom_prompt = config.get("custom_prompt")
            use_web_search = config.get("use_web_search", False)
            
            # Generate response
            llm_result = await llm_service.generate_response(
                query=query,
                context=context if context else None,
                custom_prompt=custom_prompt,
                provider=provider,
                model=model,
                use_web_search=use_web_search
            )
            
            return {
                "success": llm_result["metadata"]["success"],
                "response": llm_result["response"],
                "llm_metadata": llm_result["metadata"],
                "component_output": "LLM response generated"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"LLM engine component error: {str(e)}",
                "response": f"Error: {str(e)}"
            }
    
    async def _execute_output_component(self, component: ComponentConfig, current_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute output component"""
        response = current_data.get("response", "No response available")
        
        return {
            "success": True,
            "final_response": response,
            "component_output": "Response formatted for output"
        }

# Global instance
workflow_executor = WorkflowExecutor()
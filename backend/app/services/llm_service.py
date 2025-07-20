from openai import OpenAI
import google.generativeai as genai
import requests
import os
from typing import Dict, Any, Optional, List
from enum import Enum

class LLMProvider(str, Enum):
    OPENAI = "openai"
    GEMINI = "gemini"

class LLMService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.google_api_key = os.getenv("GOOGLE_API_KEY")
        self.serpapi_key = os.getenv("SERPAPI_KEY")
        
        if self.openai_api_key:
            pass
        
        if self.google_api_key:
            genai.configure(api_key=self.google_api_key)
    
    async def generate_response(self, 
                              query: str, 
                              context: Optional[str] = None,
                              custom_prompt: Optional[str] = None,
                              provider: LLMProvider = LLMProvider.GEMINI,
                              model: Optional[str] = None,
                              use_web_search: bool = False) -> Dict[str, Any]:
        """Generate response using specified LLM provider"""
        
        prompt = self._build_prompt(query, context, custom_prompt)
        
        if use_web_search:
            web_context = await self._get_web_search_context(query)
            if web_context:
                prompt += f"\n\nAdditional web search context:\n{web_context}"
        
        response = None
        metadata = {
            "provider": provider,
            "model": model,
            "use_web_search": use_web_search,
            "context_provided": context is not None
        }
        
        try:
            if provider == LLMProvider.OPENAI:
                response = await self._generate_openai_response(prompt, model)
            elif provider == LLMProvider.GEMINI:
                response = await self._generate_gemini_response(prompt, model)
            
            metadata["success"] = True
            return {
                "response": response,
                "metadata": metadata
            }
            
        except Exception as e:
            metadata["success"] = False
            metadata["error"] = str(e)
            return {
                "response": f"Error generating response: {str(e)}",
                "metadata": metadata
            }
    
    def _build_prompt(self, query: str, context: Optional[str], custom_prompt: Optional[str]) -> str:
        """Build the complete prompt for the LLM"""
        base_prompt = custom_prompt or "You are a helpful AI assistant. Answer the user's question based on the provided context and your knowledge."
        
        prompt_parts = [base_prompt]
        
        if context:
            prompt_parts.append(f"\nContext:\n{context}")
        
        prompt_parts.append(f"\nUser Question: {query}")
        prompt_parts.append("\nResponse:")
        
        return "\n".join(prompt_parts)
    
    async def _generate_openai_response(self, prompt: str, model: Optional[str] = None) -> str:
        """Generate response using OpenAI - Free tier models"""
        if not self.openai_api_key:
            raise ValueError("OpenAI API key not configured")
        
        model = model or "gpt-3.5-turbo"
        
        client = OpenAI(api_key=self.openai_api_key)
        
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    
    async def _generate_gemini_response(self, prompt: str, model: Optional[str] = None) -> str:
        """Generate response using Google Gemini - Free tier"""
        if not self.google_api_key:
            raise ValueError("Google API key not configured")
        
        model_name = model or "gemini-1.5-flash"
        model = genai.GenerativeModel(model_name)
        
        generation_config = genai.types.GenerationConfig(
            max_output_tokens=500,
            temperature=0.7,
        )
        
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        return response.text.strip()
    
    async def _get_web_search_context(self, query: str) -> Optional[str]:
        """Get additional context from web search using SerpAPI"""
        if not self.serpapi_key:
            return None
        
        try:
            url = "https://serpapi.com/search"
            params = {
                "engine": "google",
                "q": query,
                "api_key": self.serpapi_key,
                "num": 3
            }
            
            response = requests.get(url, params=params)
            data = response.json()
            
            if "organic_results" in data:
                results = []
                for result in data["organic_results"][:3]:
                    snippet = result.get("snippet", "")
                    title = result.get("title", "")
                    results.append(f"Title: {title}\nSnippet: {snippet}")
                
                return "\n\n".join(results)
            
        except Exception as e:
            print(f"Web search error: {e}")
        
        return None

llm_service = LLMService()
import chromadb
from chromadb.config import Settings
import os
from typing import List, Dict, Any, Optional
import uuid
import hashlib

class ChromaService:
    def __init__(self):
        self.persist_directory = os.getenv("CHROMA_PERSIST_DIRECTORY", "./chroma_db")
        
        os.environ["ANONYMIZED_TELEMETRY"] = "False"
        os.environ["CHROMA_SERVER_AUTHN_CREDENTIALS_FILE"] = ""
        
        try:
            import chromadb.telemetry
            chromadb.telemetry.Telemetry.capture = lambda *args, **kwargs: None
        except:
            pass
            
        settings = Settings(
            anonymized_telemetry=False,
            allow_reset=True,
            is_persistent=True
        )
        
        self.client = chromadb.PersistentClient(path=self.persist_directory, settings=settings)
        
    def simple_embedding(self, text: str) -> List[float]:
        """Simple hash-based embedding for testing (replace with proper embeddings in production)"""
        text_hash = hashlib.md5(text.encode()).hexdigest()
        embedding = []
        for i in range(0, len(text_hash), 2):
            val = int(text_hash[i:i+2], 16) / 255.0
            embedding.append(val)
        
        while len(embedding) < 384:
            embedding.append(0.0)
        
        return embedding[:384]
        
    def get_or_create_collection(self, name: str):
        """Get or create a collection for storing document embeddings"""
        try:
            collection = self.client.get_collection(name=name)
        except:
            collection = self.client.create_collection(
                name=name,
                metadata={"hnsw:space": "cosine"}
            )
        return collection
    
    def add_documents(self, collection_name: str, documents: List[str], 
                     metadatas: List[Dict[str, Any]], ids: Optional[List[str]] = None):
        """Add documents to a collection"""
        collection = self.get_or_create_collection(collection_name)
        
        if ids is None:
            ids = [str(uuid.uuid4()) for _ in documents]
        
        embeddings = [self.simple_embedding(doc) for doc in documents]
        
        collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
        
        return ids
    
    def query_documents(self, collection_name: str, query: str, n_results: int = 5, workflow_id: Optional[int] = None):
        """Query documents from a collection, optionally filtered by workflow_id"""
        try:
            collection = self.client.get_collection(name=collection_name)
            
            query_embedding = self.simple_embedding(query)
            
            where_clause = None
            if workflow_id is not None:
                where_clause = {"workflow_id": workflow_id}
            
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                where=where_clause
            )
            
            return {
                "documents": results["documents"][0] if results["documents"] else [],
                "metadatas": results["metadatas"][0] if results["metadatas"] else [],
                "distances": results["distances"][0] if results["distances"] else [],
                "ids": results["ids"][0] if results["ids"] else []
            }
        except Exception as e:
            print(f"Error querying collection {collection_name}: {e}")
            return {
                "documents": [],
                "metadatas": [],
                "distances": [],
                "ids": []
            }
    
    def delete_collection(self, name: str):
        """Delete a collection"""
        try:
            self.client.delete_collection(name=name)
            return True
        except Exception as e:
            print(f"Error deleting collection {name}: {e}")
            return False
    
    def list_collections(self):
        """List all collections"""
        return self.client.list_collections()

chroma_service = ChromaService()
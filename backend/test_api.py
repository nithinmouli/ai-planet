#!/usr/bin/env python3
"""
Test document upload functionality with SQLite
"""
import requests
import os
from pathlib import Path

def test_document_upload():
    """Test the document upload endpoint"""
    
    # Create a test text file
    test_content = """
    This is a test document for our No-Code/Low-Code workflow application.
    
    The application allows users to:
    1. Upload documents to the knowledge base
    2. Create intelligent workflows with drag-and-drop interface
    3. Chat with the system using natural language
    4. Execute complex workflows automatically
    
    Key Features:
    - Document processing and indexing
    - Vector search capabilities
    - LLM integration (Google Gemini and OpenAI)
    - Workflow execution engine
    - Real-time chat interface
    
    This document will be processed and stored in the vector database
    for future retrieval and question answering.
    """
    
    test_file_path = "test_document.txt"
    with open(test_file_path, "w", encoding="utf-8") as f:
        f.write(test_content)
    
    try:
        # Test the document upload endpoint
        url = "http://localhost:8000/documents/upload"
        
        with open(test_file_path, "rb") as f:
            files = {"file": ("test_document.txt", f, "text/plain")}
            data = {"title": "Test Document", "description": "A test document for the workflow app"}
            
            print("Uploading test document...")
            response = requests.post(url, files=files, data=data, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                print("Document upload successful!")
                print(f"Document ID: {result['id']}")
                print(f"Title: {result['title']}")
                print(f"Status: {result['status']}")
                print(f"Chunks created: {result.get('chunks_count', 'Unknown')}")
                return True
            else:
                print(f"Upload failed with status {response.status_code}")
                print(f"Error: {response.text}")
                return False
                
    except requests.exceptions.ConnectionError:
        print("Connection failed - make sure the FastAPI server is running on localhost:8000")
        return False
    except Exception as e:
        print(f"Upload failed: {e}")
        return False
    finally:
        if os.path.exists(test_file_path):
            os.remove(test_file_path)

def test_health_endpoint():
    """Test the health endpoint"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("Health check passed")
            return True
        else:
            print(f"Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_documents_list():
    """Test listing documents"""
    try:
        response = requests.get("http://localhost:8000/documents/", timeout=10)
        if response.status_code == 200:
            documents = response.json()
            print(f"Documents list retrieved: {len(documents)} documents found")
            for doc in documents[:3]:
                print(f"  {doc['title']} (ID: {doc['id']})")
            return True, documents
        else:
            print(f"Documents list failed: {response.status_code}")
            return False, []
    except Exception as e:
        print(f"Documents list failed: {e}")
        return False, []

def test_chat_session_creation():
    """Test creating a new chat session"""
    try:
        url = "http://localhost:8000/chat/sessions/"
        data = {
            "title": "Test Chat Session",
            "system_prompt": "You are a helpful assistant for the No-Code/Low-Code workflow application."
        }
        
        print("Creating chat session...")
        response = requests.post(url, json=data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print("Chat session created successfully!")
            print(f"Session ID: {result['id']}")
            print(f"Title: {result['title']}")
            return True, result['id']
        else:
            print(f"Chat session creation failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"Chat session creation failed: {e}")
        return False, None

def test_chat_message(session_id, message_content):
    """Test sending a message to a chat session"""
    try:
        url = f"http://localhost:8000/chat/{session_id}/messages"
        data = {
            "content": message_content,
            "message_type": "user"
        }
        
        print(f"Sending message: '{message_content[:50]}...'")
        response = requests.post(url, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print("Message sent successfully!")
            print(f"AI Response: {result['content'][:100]}...")
            return True, result
        else:
            print(f"Message failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"Message failed: {e}")
        return False, None

def test_chat_history(session_id):
    """Test retrieving chat history"""
    try:
        url = f"http://localhost:8000/chat/{session_id}/messages"
        
        print("Retrieving chat history...")
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            messages = response.json()
            print(f"Chat history retrieved: {len(messages)} messages")
            for i, msg in enumerate(messages[-3:], 1):
                role = "User" if msg['message_type'] == 'user' else "AI"
                content = msg['content'][:60] + "..." if len(msg['content']) > 60 else msg['content']
                print(f"  {role} Message {i}: {content}")
            return True, messages
        else:
            print(f"Chat history failed: {response.status_code}")
            return False, []
            
    except Exception as e:
        print(f"Chat history failed: {e}")
        return False, []

def test_document_search_chat(session_id, documents):
    """Test asking questions about uploaded documents"""
    if not documents:
        print("No documents available for search testing")
        return False
    test_questions = [
        "What documents do you have access to?",
        "Can you summarize the content of the uploaded PDF?",
        "What are the key features of the workflow application?",
        "How does the document processing work?"
    ]
    
    success_count = 0
    for question in test_questions:
        print(f"\nTesting document search with: '{question}'")
        success, response = test_chat_message(session_id, question)
        if success:
            success_count += 1
        
    return success_count > 0

def test_workflow_chat_integration(session_id):
    """Test workflow-related chat functionality"""
    workflow_questions = [
        "How do I create a new workflow?",
        "What workflow components are available?",
        "Can you help me design a document processing workflow?",
        "Explain how the workflow execution engine works"
    ]
    
    success_count = 0
    for question in workflow_questions:
        print(f"\nTesting workflow chat: '{question}'")
        success, response = test_chat_message(session_id, question)
        if success:
            success_count += 1
        
    return success_count > 0

if __name__ == "__main__":
    print("Testing API endpoints with SQLite database...\n")
    
    print("1. Testing health endpoint...")
    health_ok = test_health_endpoint()
    print()
    
    if health_ok:
        print("2. Testing documents list...")
        list_ok, documents = test_documents_list()
        print()
        
        print("3. Testing document upload...")
        upload_ok = test_document_upload()
        print()
        
        if upload_ok:
            print("4. Testing documents list after upload...")
            test_documents_list()
            print()
        
        print("5. Testing chat session creation...")
        chat_session_ok, session_id = test_chat_session_creation()
        print()
        
        if chat_session_ok and session_id:
            print("6. Testing basic chat message...")
            basic_chat_ok, _ = test_chat_message(session_id, "Hello! Can you help me understand this workflow application?")
            print()
            
            print("7. Testing chat history retrieval...")
            history_ok, _ = test_chat_history(session_id)
            print()
            
            print("8. Testing document search via chat...")
            doc_search_ok = test_document_search_chat(session_id, documents)
            print()
            
            print("9. Testing workflow-related chat...")
            workflow_chat_ok = test_workflow_chat_integration(session_id)
            print()
    
    print("Test Summary:")
    print(f"Health endpoint: {'PASS' if health_ok else 'FAIL'}")
    if health_ok:
        print(f"Documents list: {'PASS' if list_ok else 'FAIL'}")
        print(f"Document upload: {'PASS' if upload_ok else 'FAIL'}")
        if 'chat_session_ok' in locals():
            print(f"Chat session creation: {'PASS' if chat_session_ok else 'FAIL'}")
        if 'basic_chat_ok' in locals():
            print(f"Basic chat messaging: {'PASS' if basic_chat_ok else 'FAIL'}")
        if 'history_ok' in locals():
            print(f"Chat history: {'PASS' if history_ok else 'FAIL'}")
        if 'doc_search_ok' in locals():
            print(f"Document search chat: {'PASS' if doc_search_ok else 'FAIL'}")
        if 'workflow_chat_ok' in locals():
            print(f"Workflow chat: {'PASS' if workflow_chat_ok else 'FAIL'}")
    
    print("\nNext steps:")
    print("1. Test workflow creation and execution")
    print("2. Develop the React frontend with chat interface")
    print("3. Add real-time WebSocket support for chat")
    print("4. Deploy to production with PostgreSQL")

# No-Code Workflow Builder API (Backend)

A FastAPI-based backend for building and executing intelligent workflows with document processing, vector search, and LLM integration.

## Features

- **Document Processing**: Upload and process PDF, TXT, DOC, DOCX files
- **Vector Search**: ChromaDB integration for document similarity search
- **LLM Integration**: Support for OpenAI GPT and Google Gemini
- **Workflow Engine**: Execute complex workflows with multiple components
- **Chat Interface**: Real-time chat with workflow-powered responses
- **RESTful API**: Complete CRUD operations for workflows and documents

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

## Installation

1. **Clone the repository and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended)**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   # Database Configuration
   USE_SQLITE=true
   DATABASE_URL=sqlite:///./workflow_app.db
   
   # LLM API Keys (Optional - for advanced features)
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_API_KEY=your_google_api_key_here
   SERPAPI_KEY=your_serpapi_key_here
   
   # ChromaDB Configuration
   CHROMA_PERSIST_DIRECTORY=./chroma_db
   ```

## Running the Application

1. **Start the FastAPI server**
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

2. **Access the API**
   - API Server: http://localhost:8000
   - Interactive API Documentation: http://localhost:8000/docs
   - Alternative API Docs: http://localhost:8000/redoc

## Testing

1. **Quick Health Check**
   ```bash
   python quick_test.py
   ```

2. **Comprehensive API Testing**
   ```bash
   python test_api.py
   ```

3. **Workflow Chat Testing**
   ```bash
   python test_workflow_chat.py
   ```

## API Endpoints

### Core Endpoints
- `GET /` - Root endpoint with API information
- `GET /health` - Health check endpoint

### Documents
- `POST /documents/upload` - Upload a document
- `GET /documents/` - List all documents
- `GET /documents/{id}` - Get specific document
- `DELETE /documents/{id}` - Delete document

### Workflows
- `POST /workflows/` - Create workflow
- `GET /workflows/` - List workflows
- `GET /workflows/{id}` - Get workflow
- `PUT /workflows/{id}` - Update workflow
- `DELETE /workflows/{id}` - Delete workflow

### Components
- `GET /components/` - List available components
- `GET /components/{type}` - Get component definition
- `POST /components/validate/workflow` - Validate workflow

### Chat
- `POST /chat/` - Send chat message
- `GET /chat/sessions/{session_id}/messages` - Get chat history

## Architecture

### Core Components

1. **Document Processor** (`app/services/document_processor.py`)
   - Extracts text from various file formats
   - Chunks text for vector storage
   - Processes metadata

2. **ChromaDB Service** (`app/services/chroma_service.py`)
   - Vector database operations
   - Document similarity search
   - Embedding generation

3. **LLM Service** (`app/services/llm_service.py`)
   - OpenAI GPT integration
   - Google Gemini integration
   - Web search capabilities

4. **Workflow Executor** (`app/services/workflow_executor.py`)
   - Workflow validation
   - Component execution
   - Data flow management

### Database Models

- **Document**: File metadata and processing status
- **Workflow**: Workflow definitions and components
- **ChatSession**: Chat conversation tracking
- **ChatMessage**: Individual chat messages

## Configuration

### Database Options

**SQLite (Default)**
```env
USE_SQLITE=true
DATABASE_URL=sqlite:///./workflow_app.db
```

**PostgreSQL (Production)**
```env
USE_SQLITE=false
DATABASE_URL=postgresql://user:password@localhost/dbname
```

### LLM Providers

**OpenAI**
```env
OPENAI_API_KEY=sk-your-key-here
```

**Google Gemini**
```env
GOOGLE_API_KEY=your-google-api-key
```

## Troubleshooting

### Common Issues

1. **Import Errors**
   - Ensure all dependencies are installed: `pip install -r requirements.txt`
   - Check Python version compatibility

2. **Database Connection Issues**
   - Verify database configuration in `.env`
   - Check file permissions for SQLite

3. **LLM API Errors**
   - Verify API keys are correct
   - Check API usage limits

4. **File Upload Issues**
   - Ensure `uploads/` directory exists
   - Check file size limits (default: 10MB)

### Logs and Debugging

- Enable debug mode: Set `reload=True` in uvicorn
- Check console output for error messages
- Use `/health` endpoint to verify service status

## Deployment

### Production Checklist

1. **Environment Variables**
   - Set production database URL
   - Configure proper API keys
   - Set CORS origins for production

2. **Database Migration**
   - Switch from SQLite to PostgreSQL
   - Run database migrations

3. **Security**
   - Enable HTTPS
   - Configure proper CORS settings
   - Set up authentication if needed

4. **Performance**
   - Configure proper connection pooling
   - Set up caching for embeddings
   - Monitor resource usage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests to ensure functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

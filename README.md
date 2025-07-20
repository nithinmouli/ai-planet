# No-Code Workflow Builder

A full-stack intelligent workflow automation platform that enables users to create, manage, and execute AI-powered workflows through an intuitive drag-and-drop interface.

## Project Overview

This application combines a **React.js frontend** with a **FastAPI backend** to deliver a comprehensive no-code solution for building intelligent workflows that can process documents, interact with language models, and provide automated responses.

### Key Features

- **Visual Workflow Builder**: Drag-and-drop interface for creating complex AI workflows
- **Document Management**: Upload and process various document formats (PDF, TXT, DOC, DOCX)
- **Multi-LLM Support**: Integration with OpenAI GPT and Google Gemini models
- **Vector Database**: ChromaDB for semantic document search and retrieval
- **Real-time Chat**: Interactive testing interface for workflows
- **Component Library**: Pre-built workflow components for common AI tasks

## Architecture

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   React.js      │ ◄──────────────► │   FastAPI       │
│   Frontend      │                 │   Backend       │
│   (Port 5173)   │                 │   (Port 8000)   │
└─────────────────┘                 └─────────────────┘
                                           │
                                           ▼
                                    ┌─────────────────┐
                                    │   Data Layer    │
                                    │                 │
                                    │ • SQLite/PostgreSQL │
                                    │ • ChromaDB      │
                                    │ • File Storage  │
                                    └─────────────────┘
```

## Technology Stack

### Frontend
- **React.js** - UI framework
- **React Flow** - Drag-and-drop workflow builder
- **Tailwind CSS** - Styling framework
- **Vite** - Build tool and development server
- **Axios** - HTTP client

### Backend
- **FastAPI** - Python web framework
- **SQLAlchemy** - Database ORM
- **ChromaDB** - Vector database for embeddings
- **PyMuPDF** - Document processing
- **OpenAI & Google Gemini APIs** - Language model integration

### Database & Storage
- **SQLite** (development) / **PostgreSQL** (production)
- **ChromaDB** - Vector embeddings storage
- **Local file system** - Document uploads

## Quick Start

### Prerequisites
- **Node.js** 16.0+ and npm/yarn
- **Python** 3.8+ and pip
- **Git** for version control

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "AI Planet"
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```
**Backend will run on**: http://localhost:8000

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
**Frontend will run on**: http://localhost:5173

### 4. Access the Application
Open your browser and navigate to http://localhost:5173

## Detailed Setup Guides

For comprehensive setup instructions, refer to the specific README files:

- **[Backend Setup Guide](./backend/README.md)** - Complete backend configuration, API documentation, and deployment
- **[Frontend Setup Guide](./frontend/README.md)** - Frontend development, building, and deployment instructions

## Project Structure

```
AI Planet/
├── README.md                   # This file - project overview
├── backend/                    # FastAPI backend application
│   ├── README.md              # Backend-specific setup guide
│   ├── main.py                # Application entry point
│   ├── requirements.txt       # Python dependencies
│   ├── app/                   # Application modules
│   │   ├── models/           # Database models
│   │   ├── routers/          # API route handlers
│   │   ├── schemas/          # Pydantic schemas
│   │   └── services/         # Business logic services
│   ├── chroma_db/            # Vector database storage
│   └── uploads/              # Uploaded documents
├── frontend/                   # React.js frontend application
│   ├── README.md              # Frontend-specific setup guide
│   ├── package.json           # Node.js dependencies
│   ├── src/                   # Source code
│   │   ├── components/       # Reusable React components
│   │   ├── pages/            # Page components
│   │   └── services/         # API integration
│   └── public/               # Static assets
```

## Core Workflows

### 1. Document Processing Workflow
```
User Upload → Document Parser → Text Extraction → Vector Embeddings → ChromaDB Storage
```

### 2. AI Query Workflow
```
User Query → Knowledge Base Search → Context Retrieval → LLM Processing → Response Generation
```

### 3. Workflow Execution
```
User Input → Component Pipeline → Data Processing → Output Generation → Result Display
```

## API Overview

The backend provides RESTful APIs for:

- **Workflows**: CRUD operations for workflow management
- **Documents**: File upload, processing, and retrieval
- **Chat**: Real-time conversation with AI workflows
- **Components**: Available workflow building blocks

**API Documentation**: Available at http://localhost:8000/docs when backend is running

## Environment Configuration

### Backend Environment Variables
```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost/dbname  # PostgreSQL
# DATABASE_URL=sqlite:///./workflow_app.db                # SQLite (default)

# AI Service API Keys
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: External Services
SERPER_API_KEY=your_serper_api_key_for_web_search
```

### Frontend Environment Variables
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=No-Code Workflow Builder
```

## Development Workflow

### 1. Local Development
1. Start backend: `cd backend && python main.py`
2. Start frontend: `cd frontend && npm run dev`
3. Access application at http://localhost:5173

### 2. Making Changes
- **Backend changes**: FastAPI auto-reloads on file changes
- **Frontend changes**: Vite provides hot module replacement

### 3. Testing
- **Backend**: Run `python test_api.py` for API testing
- **Frontend**: Manual testing through the UI

## Deployment

### Backend Deployment
- **Railway/Heroku**: Direct deployment with PostgreSQL
- **AWS/GCP**: Container deployment with managed database
- **VPS**: Docker deployment with reverse proxy

### Frontend Deployment
- **Vercel/Netlify**: Zero-config static deployment
- **AWS S3 + CloudFront**: Scalable static hosting
- **Traditional hosting**: Build and upload dist folder

## Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Follow existing code style** and documentation patterns
4. **Test your changes** thoroughly
5. **Submit a pull request** with clear description

### Code Style Guidelines
- **Backend**: Follow PEP 8 for Python code
- **Frontend**: Use ESLint configuration provided
- **Documentation**: Update README files for significant changes
- **Commits**: Use clear, descriptive commit messages

## Troubleshooting

### Common Issues

1. **CORS errors**: Ensure backend CORS is configured for your frontend URL
2. **API connection failed**: Verify backend is running on port 8000
3. **Database errors**: Check database connection and migrations
4. **File upload issues**: Verify upload directory permissions

### Getting Help

- **Check the specific README files** in `/backend` and `/frontend` directories
- **Review API documentation** at http://localhost:8000/docs
- **Examine console logs** for detailed error messages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **OpenAI** for GPT API integration
- **Google** for Gemini API support
- **React Flow** for workflow visualization
- **FastAPI** for the excellent Python web framework
- **ChromaDB** for vector database functionality

---

**Ready to build intelligent workflows?** Start with the [Backend Setup Guide](./backend/README.md) and [Frontend Setup Guide](./frontend/README.md) for detailed instructions.

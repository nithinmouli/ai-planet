# No-Code Workflow Builder (Frontend)

A React-based frontend for visually creating and interacting with intelligent workflows. Features drag-and-drop workflow building, document management, and real-time chat interface.

## Features

- **Visual Workflow Builder**: Drag-and-drop interface using React Flow
- **Component Library**: Pre-built workflow components (User Query, Knowledge Base, LLM Engine, Output)
- **Document Management**: Upload and manage knowledge base documents
- **Real-time Chat**: Interactive chat interface for testing workflows
- **Responsive Design**: Modern UI with Tailwind CSS
- **Route Management**: Multi-page application with React Router

## Prerequisites

- Node.js 16.0 or higher
- npm or yarn package manager

## Installation

1. **Clone the repository and navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   Or using yarn:
   ```bash
   yarn install
   ```

## Development Setup

1. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Or using yarn:
   ```bash
   yarn dev
   ```

2. **Access the application**
   - Frontend: http://localhost:5173
   - The application will automatically reload when you make changes

## Building for Production

1. **Create production build**
   ```bash
   npm run build
   ```

2. **Preview production build**
   ```bash
   npm run preview
   ```

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable components
│   │   ├── Layout.jsx     # Main layout wrapper
│   │   ├── Navigation.jsx # Navigation component
│   │   ├── Toast.jsx      # Toast notifications
│   │   └── workflow/      # Workflow-specific components
│   │       ├── ComponentPalette.jsx
│   │       ├── WorkflowNode.jsx
│   │       └── ...
│   ├── pages/             # Page components
│   │   ├── Dashboard.jsx  # Main dashboard
│   │   ├── Workflows.jsx  # Workflow management
│   │   ├── WorkflowBuilder.jsx # Workflow builder
│   │   ├── Documents.jsx  # Document management
│   │   ├── DocumentViewer.jsx # Document viewer
│   │   └── Chat.jsx       # Chat interface
│   ├── services/          # API services
│   │   └── api.js         # Backend API integration
│   ├── App.jsx            # Main app component
│   ├── App.css            # Global styles
│   ├── main.jsx           # Application entry point
│   └── index.css          # Tailwind imports
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md             # This file
```

## Key Dependencies

### Core Dependencies
- **React**: UI library
- **React Router**: Client-side routing
- **React Flow**: Drag-and-drop workflow builder
- **Axios**: HTTP client for API calls
- **Lucide React**: Icon library

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

### Development Tools
- **Vite**: Fast build tool and dev server
- **ESLint**: Code linting

## Configuration

### Backend API Connection

The frontend connects to the backend API. Update the API base URL in `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://127.0.0.1:8000';
```

For production, update this to your deployed backend URL.

### Environment Variables

Create a `.env` file in the frontend directory for environment-specific configurations:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=No-Code Workflow Builder
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Pages and Features

### Dashboard (`/`)
- Overview of workflows and documents
- Quick access to main features
- System status indicators

### Workflows (`/workflows`)
- List all created workflows
- Create new workflows
- Edit existing workflows
- Test workflows in chat

### Workflow Builder (`/workflows/new`, `/workflows/:id/edit`)
- Visual drag-and-drop interface
- Component palette with available workflow components
- Real-time workflow validation
- Save and test workflows

### Documents (`/documents`)
- Upload documents to knowledge base
- View document details
- Delete documents
- Search and filter documents

### Chat (`/chat`)
- Interactive chat interface
- Select workflow for conversation
- Real-time message exchange
- Chat history

## Workflow Components

### Available Components

1. **User Query Component**
   - Entry point for user input
   - Configurable placeholder text

2. **Knowledge Base Component**
   - Document search and retrieval
   - Configurable similarity threshold
   - Maximum results setting

3. **LLM Engine Component**
   - AI response generation
   - Multiple provider support (OpenAI, Gemini)
   - Custom prompt configuration
   - Web search integration

4. **Output Component**
   - Display final results
   - Multiple output formats
   - Metadata display options

### Building Workflows

1. **Drag components** from the palette to the canvas
2. **Connect components** by dragging between connection points
3. **Configure components** by clicking on them
4. **Validate workflow** to ensure proper connections
5. **Save workflow** to make it available for chat

## Styling and Theming

### Tailwind CSS

The application uses Tailwind CSS for styling. Key configuration:

- Custom color palette
- Responsive design utilities
- Component-specific styles

### Custom Styles

Additional styles are defined in:
- `src/App.css` - Global application styles
- `src/index.css` - Base styles and Tailwind imports

## API Integration

### Service Layer

All backend communication is handled through `src/services/api.js`:

```javascript
// Example API usage
import { workflowAPI, documentAPI, chatAPI } from '../services/api';

// Create workflow
const workflow = await workflowAPI.createWorkflow(workflowData);

// Upload document
const document = await documentAPI.uploadDocument(file);

// Send chat message
const response = await chatAPI.sendMessage(message);
```

### Error Handling

- Automatic retry for failed requests
- User-friendly error messages
- Toast notifications for feedback

## Drag and Drop Features

### File Upload
- Drag PDF, TXT, DOC, DOCX files to upload areas
- Visual feedback during drag operations
- Progress indicators for uploads

### Workflow Building
- Drag components from palette to canvas
- Drag to connect components
- Visual connection indicators

## Troubleshooting

### Common Issues

1. **Development server won't start**
   - Check Node.js version (16+ required)
   - Delete `node_modules` and run `npm install`
   - Check for port conflicts (default: 5173)

2. **API connection issues**
   - Verify backend is running on http://localhost:8000
   - Check API base URL in `api.js`
   - Verify CORS configuration in backend

3. **Build failures**
   - Check for TypeScript/JavaScript errors
   - Verify all dependencies are installed
   - Check Vite configuration

4. **Styling issues**
   - Ensure Tailwind CSS is properly configured
   - Check for conflicting CSS classes
   - Verify PostCSS configuration

### Performance Tips

1. **Bundle Size Optimization**
   - Use dynamic imports for large components
   - Optimize images and assets
   - Enable tree shaking

2. **React Performance**
   - Use React.memo for expensive components
   - Implement proper key props for lists
   - Avoid unnecessary re-renders

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Deployment

### Build Process

1. **Install dependencies**
   ```bash
   npm ci
   ```

2. **Build application**
   ```bash
   npm run build
   ```

3. **Deploy `dist/` folder** to your hosting service

### Popular Deployment Options

- **Vercel**: Zero-config deployment
- **Netlify**: Continuous deployment from Git
- **GitHub Pages**: Free static hosting
- **AWS S3 + CloudFront**: Scalable hosting

### Environment Variables for Production

Update environment variables for production:

```env
VITE_API_BASE_URL=https://your-backend-api.com
VITE_APP_NAME=No-Code Workflow Builder
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the existing code style
4. Test your changes thoroughly
5. Submit a pull request

### Code Style

- Use functional components with hooks
- Follow ESLint configuration
- Use meaningful component and variable names
- Add comments for complex logic

## License

This project is licensed under the MIT License.

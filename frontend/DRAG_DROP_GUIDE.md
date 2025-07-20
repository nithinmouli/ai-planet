# Drag and Drop Guide for Workflow Builder

## File Upload Drag & Drop (Documents Page)

### How to Upload Files:
1. **Go to Documents page** (`/documents`)
2. **Drag files from your computer** into the upload area
3. **Or click "Choose File"** to browse
4. **Supported formats**: PDF, TXT, DOC, DOCX (up to 10MB)

### Visual Feedback:
- Upload area **turns blue** when dragging files over it
- **"Uploading..."** spinner shows during processing
- **Success message** appears when complete

## Workflow Component Drag & Drop (Workflow Builder)

### How to Build Workflows:
1. **Go to Workflows → Create Workflow** (`/workflows/new`)
2. **Drag components** from the left panel to the canvas:
   - **User Query** - Entry point
   - **Knowledge Base** - Document search
   - **LLM Engine** - AI processing
   - **Output** - Final result

### Drag & Drop Process:
1. **Hover over component** in the left panel
2. **Click and hold** to start dragging
3. **Drag to canvas area** (right side)
4. **Release to drop** the component

### Connecting Components:
1. **Hover over component** to see connection handles (small circles)
2. **Click and drag** from output handle (right side)
3. **Connect to input handle** (left side) of next component
4. **Line appears** showing the connection

## Visual Workflow Example:

```
[User Query] --query--> [Knowledge Base] --context--> [LLM Engine] --response--> [Output]
  User Query              Knowledge Base               LLM Engine                Output
```

## Troubleshooting Drag & Drop:

### If Drag & Drop Not Working:

1. **Check Browser Compatibility**:
   - Use Chrome, Firefox, Safari, or Edge
   - Enable JavaScript

2. **Clear Browser Cache**:
   - Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

3. **Check Console for Errors**:
   - Press `F12` → Console tab
   - Look for error messages

4. **File Upload Issues**:
   - File size must be under 10MB
   - Use supported formats: PDF, TXT, DOC, DOCX
   - Check internet connection

5. **Workflow Builder Issues**:
   - Ensure ReactFlow is loaded (check for component palette)
   - Try refreshing the page
   - Clear browser cache

## Alternative Methods:

### If Drag & Drop Fails:
1. **File Upload**: Click "Choose File" button
2. **Workflow Building**: Double-click components to add them

## Step-by-Step Workflow Creation:

### 1. Basic Document Q&A Workflow:
```
1. Drag "User Query" to canvas
2. Drag "Knowledge Base" to canvas
3. Drag "LLM Engine" to canvas
4. Drag "Output" to canvas
5. Connect: User Query → Knowledge Base
6. Connect: Knowledge Base → LLM Engine (context)
7. Connect: User Query → LLM Engine (query)
8. Connect: LLM Engine → Output
9. Click "Save" and name your workflow
```

### 2. Testing Your Workflow:
```
1. Go to Chat page
2. Select your workflow from dropdown
3. Type a question about your uploaded document
4. See the AI response!
```

## Current Features Status:

**Working Features**:
- Document upload drag & drop
- Workflow component drag & drop
- Component connections
- File upload with progress
- Visual feedback
- Route for viewing documents (`/documents/:id`)

**New Routes Added**:
- `/documents` - List all documents
- `/documents/:id` - View specific document details
- `/workflows/new` - Create new workflow
- `/workflows/:id/edit` - Edit existing workflow

## Quick Start:

1. **Upload a document** (drag PDF to Documents page)
2. **Create workflow** (drag components: User Query → Knowledge Base → LLM Engine → Output)
3. **Connect components** (drag between handles)
4. **Save workflow** (click Save button)
5. **Test in Chat** (select workflow, ask questions)

Your drag and drop functionality is fully implemented and ready to use!

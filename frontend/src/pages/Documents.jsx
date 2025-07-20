import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Download, 
  Search,
  Filter,
  Calendar,
  HardDrive,
  Eye
} from 'lucide-react';
import { documentAPI } from '../services/api';
import useToast from '../components/Toast';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { success, error, ToastContainer } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await documentAPI.getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files) => {
    const file = files[0];
    if (!file) return;

    setUploading(true);
    try {
      console.log('Uploading file:', file.name, file.size, file.type);
      const uploadedDoc = await documentAPI.uploadDocument(file);
      console.log('Upload successful:', uploadedDoc);
      setDocuments([uploadedDoc, ...documents]);
      success(`Document "${file.name}" uploaded successfully!`);
    } catch (err) {
      console.error('Error uploading document:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          err.message || 
                          'Unknown error occurred';
      
      error(`Failed to upload document: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await documentAPI.deleteDocument(id);
      setDocuments(documents.filter(d => d.id !== id));
      success('Document deleted successfully');
    } catch (err) {
      console.error('Error deleting document:', err);
      error('Failed to delete document');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc =>
    doc.original_filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-2">
            Upload and manage your knowledge base documents
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div 
        className={`bg-white rounded-lg border-2 border-dashed p-8 mb-8 text-center transition-colors duration-200 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.txt,.doc,.docx"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upload Document
        </h3>
        <p className="text-gray-600 mb-4">
          Drag and drop your file here, or click to browse
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Supports PDF, TXT, DOC, DOCX files up to 10MB
        </p>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span>Choose File</span>
            </>
          )}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocuments.length > 0 ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {document.original_filename}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <HardDrive className="h-3 w-3" />
                          <span>{formatFileSize(document.file_size)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(document.created_at).toLocaleDateString()}</span>
                        </div>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {document.content_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/documents/${document.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-200"
                      title="View document"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button 
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                      title="Download document"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => deleteDocument(document.id)}
                      className="p-2 text-red-400 hover:text-red-600 rounded-md hover:bg-red-50"
                      title="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Document Metadata */}
                {document.doc_metadata && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    {document.doc_metadata.word_count && (
                      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                        <span className="text-gray-600">Words</span>
                        <span className="font-medium text-gray-900">
                          {document.doc_metadata.word_count.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {document.doc_metadata.char_count && (
                      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                        <span className="text-gray-600">Characters</span>
                        <span className="font-medium text-gray-900">
                          {document.doc_metadata.char_count.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {document.doc_metadata.chunk_count && (
                      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                        <span className="text-gray-600">Chunks</span>
                        <span className="font-medium text-gray-900">
                          {document.doc_metadata.chunk_count}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No documents found' : 'No documents yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'Upload your first document to start building your knowledge base.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Document</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;

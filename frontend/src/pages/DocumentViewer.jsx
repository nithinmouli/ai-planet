import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Download,
  Calendar,
  HardDrive,
  Eye,
  BookOpen
} from 'lucide-react';
import { documentAPI } from '../services/api';

const DocumentViewer = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const data = await documentAPI.getDocument(id);
      setDocument(data);
    } catch (error) {
      console.error('Error fetching document:', error);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error || 'Document not found'}
          </h3>
          <Link
            to="/documents"
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Documents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Link
          to="/documents"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Documents</span>
        </Link>
      </div>

      {/* Document Header */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {document.original_filename}
                </h1>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <HardDrive className="h-4 w-4" />
                    <span>{formatFileSize(document.file_size)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(document.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {document.content_type}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Metadata */}
      {document.doc_metadata && (
        <div className="bg-white rounded-lg shadow border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Document Statistics</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {document.doc_metadata.word_count && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {document.doc_metadata.word_count.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Words</div>
                </div>
              )}
              {document.doc_metadata.char_count && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {document.doc_metadata.char_count.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Characters</div>
                </div>
              )}
              {document.doc_metadata.chunk_count && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {document.doc_metadata.chunk_count}
                  </div>
                  <div className="text-sm text-gray-500">Chunks</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Content Preview */}
      {document.text_content && (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Content Preview</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                {document.text_content.substring(0, 2000)}
                {document.text_content.length > 2000 && '...'}
              </pre>
            </div>
            {document.text_content.length > 2000 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Showing first 2000 characters. Download the full document to see all content.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;

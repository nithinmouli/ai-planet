import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Trash2, Eye, AlertCircle } from 'lucide-react';
import { documentAPI } from '../../services/api';
import useToast from '../Toast';

const WorkflowDocuments = ({ workflowId, onDocumentsChange }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { success, error, ToastContainer } = useToast();

  useEffect(() => {
    if (workflowId) {
      fetchWorkflowDocuments();
    } else {
      setDocuments([]);
      setLoading(false);
    }
  }, [workflowId]);

  const fetchWorkflowDocuments = async () => {
    try {
      const data = await documentAPI.getWorkflowDocuments(workflowId);
      setDocuments(data);
      if (onDocumentsChange) {
        onDocumentsChange(data);
      }
    } catch (error) {
      console.error('Error fetching workflow documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files) => {
    const file = files[0];
    if (!file) return;

    if (!workflowId) {
      error('Please save the workflow first before uploading documents');
      return;
    }

    setUploading(true);
    try {
      console.log('Uploading file to workflow:', file.name, workflowId);
      const uploadedDoc = await documentAPI.uploadDocument(file, workflowId);
      console.log('Upload successful:', uploadedDoc);
      const newDocuments = [uploadedDoc, ...documents];
      setDocuments(newDocuments);
      if (onDocumentsChange) {
        onDocumentsChange(newDocuments);
      }
      success(`Document "${file.name}" uploaded successfully`);
    } catch (error) {
      console.error('Upload failed:', error);
      error('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!workflowId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="text-yellow-800">
            Save your workflow first to upload documents
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ToastContainer />
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
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
        
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload documents'}
            </button>
            <p className="text-sm text-gray-500 mt-1">
              or drag and drop files here
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Supports PDF, TXT, DOC, DOCX files
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900">
          Workflow Documents ({documents.length})
        </h3>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No documents uploaded for this workflow
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {doc.original_filename}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(doc.file_size)} • {formatDate(doc.created_at)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View document"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowDocuments;

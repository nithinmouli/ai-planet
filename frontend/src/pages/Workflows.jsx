import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Play,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  Zap,
  Settings,
  Copy,
  Eye,
  Download,
  Share2
} from 'lucide-react';
import { workflowAPI } from '../services/api';

const Workflows = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const data = await workflowAPI.getWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkflow = async (id) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    
    try {
      await workflowAPI.deleteWorkflow(id);
      setWorkflows(workflows.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error deleting workflow:', error);
      alert('Error deleting workflow');
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'valid' && workflow.is_valid) ||
                         (filterStatus === 'invalid' && !workflow.is_valid);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
          <p className="text-gray-600 mt-2">
            Manage your intelligent workflows
          </p>
        </div>
        <Link
          to="/workflows/new"
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Create Workflow</span>
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Workflows</option>
              <option value="valid">Valid Only</option>
              <option value="invalid">Invalid Only</option>
            </select>
          </div>
        </div>
      </div>
      {filteredWorkflows.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => (
            <div key={workflow.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {workflow.name}
                      </h3>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        workflow.is_valid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {workflow.is_valid ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        <span>{workflow.is_valid ? 'Valid' : 'Invalid'}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {workflow.description || 'No description provided'}
                    </p>
                  </div>
                  
                  <div className="relative ml-2">
                    <button className="p-1 rounded hover:bg-gray-100">
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Components</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {workflow.components?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Connections</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {workflow.connections?.length || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-xs text-gray-500 mb-4">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Created {new Date(workflow.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/chat?workflow=${workflow.id}`}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      workflow.is_valid
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-sm hover:shadow-md'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Zap className="h-4 w-4" />
                    <span>Run</span>
                  </Link>
                  
                  <Link
                    to={`/workflows/${workflow.id}/edit`}
                    className="flex items-center space-x-1 px-3 py-2 border border-blue-200 rounded-md text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Edit</span>
                  </Link>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => navigator.clipboard.writeText(workflow.id)}
                      className="flex items-center justify-center p-2 border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-800 transition-all duration-200"
                      title="Copy Workflow ID"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    
                    <Link
                      to={`/workflows/${workflow.id}/view`}
                      className="flex items-center justify-center p-2 border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-800 transition-all duration-200"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    
                    <button
                      onClick={() => deleteWorkflow(workflow.id)}
                      className="flex items-center justify-center p-2 border border-red-200 text-red-500 rounded-md hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-200"
                      title="Delete Workflow"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' ? 'No workflows found' : 'No workflows yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first workflow to get started with intelligent automation.'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Link
                to="/workflows/new"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>Create Your First Workflow</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Workflows;

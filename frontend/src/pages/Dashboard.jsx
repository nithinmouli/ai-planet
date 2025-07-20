import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Workflow, 
  FileText, 
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import { workflowAPI, documentAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    workflows: 0,
    documents: 0,
    executions: 0,
    chats: 0
  });
  const [recentWorkflows, setRecentWorkflows] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [workflows, documents] = await Promise.all([
        workflowAPI.getWorkflows(),
        documentAPI.getDocuments()
      ]);

      setStats({
        workflows: workflows.length,
        documents: documents.length,
        executions: workflows.reduce((acc, w) => acc + (w.execution_count || 0), 0),
        chats: 0 // This would need to be calculated from chat sessions
      });

      setRecentWorkflows(workflows.slice(0, 5));
      setRecentDocuments(documents.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [];

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to your No-Code Workflow Builder
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          to="/workflows/new"
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 group"
        >
          <div className="flex items-center">
            <Plus className="h-8 w-8 mr-3 group-hover:scale-110 transition-transform duration-200" />
            <div>
              <h3 className="text-lg font-semibold">Create Workflow</h3>
              <p className="text-blue-100">Build a new intelligent workflow</p>
            </div>
          </div>
        </Link>

        <Link
          to="/documents"
          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 group"
        >
          <div className="flex items-center">
            <FileText className="h-8 w-8 mr-3 group-hover:scale-110 transition-transform duration-200" />
            <div>
              <h3 className="text-lg font-semibold">Upload Document</h3>
              <p className="text-green-100">Add knowledge to your workflows</p>
            </div>
          </div>
        </Link>

        <Link
          to="/chat"
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 group"
        >
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 mr-3 group-hover:scale-110 transition-transform duration-200" />
            <div>
              <h3 className="text-lg font-semibold">Start Chat</h3>
              <p className="text-purple-100">Interact with your workflows</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                <span className="text-gray-600 text-sm ml-1">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Workflows */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Workflows</h3>
              <Link
                to="/workflows"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentWorkflows.length > 0 ? (
              <div className="space-y-4">
                {recentWorkflows.map((workflow) => (
                  <div key={workflow.id} className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${workflow.is_valid ? 'bg-green-100' : 'bg-yellow-100'}`}>
                      {workflow.is_valid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/workflows/${workflow.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {workflow.name}
                      </Link>
                      <p className="text-xs text-gray-500 truncate">
                        {workflow.description}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(workflow.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No workflows yet. Create your first workflow to get started!
              </p>
            )}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Documents</h3>
              <Link
                to="/documents"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentDocuments.length > 0 ? (
              <div className="space-y-4">
                {recentDocuments.map((document) => (
                  <div key={document.id} className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-blue-100">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {document.original_filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(document.file_size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(document.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No documents uploaded yet. Upload your first document to get started!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

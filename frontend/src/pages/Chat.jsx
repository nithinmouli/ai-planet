import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Send, 
  Bot, 
  User, 
  Workflow,
  MessageSquare,
  Clock,
  Loader2
} from 'lucide-react';
import { chatAPI, workflowAPI } from '../services/api';

const Chat = () => {
  const [searchParams] = useSearchParams();
  const workflowIdParam = searchParams.get('workflow');
  
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(workflowIdParam || '');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  useEffect(() => {
    if (workflowIdParam) {
      setSelectedWorkflow(workflowIdParam);
    }
  }, [workflowIdParam]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchWorkflows = async () => {
    try {
      const data = await workflowAPI.getWorkflows();
      const validWorkflows = data.filter(w => w.is_valid);
      setWorkflows(validWorkflows);
      
      if (validWorkflows.length > 0 && !selectedWorkflow) {
        setSelectedWorkflow(validWorkflows[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedWorkflow) return;

    const userMessage = {
      id: Date.now(),
      content: inputMessage,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage(
        inputMessage,
        parseInt(selectedWorkflow),
        sessionId
      );

      if (!sessionId) {
        setSessionId(response.session_id);
      }

      const botMessage = {
        id: Date.now() + 1,
        content: response.message,
        type: 'assistant',
        timestamp: new Date(),
        metadata: response.metadata
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        content: 'Sorry, there was an error processing your message. Please try again.',
        type: 'assistant',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
  };

  const selectedWorkflowData = workflows.find(w => w.id.toString() === selectedWorkflow);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)]">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-80 bg-white rounded-lg shadow border border-gray-200 mr-6 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Workflow Chat
            </h2>
            
            {/* Workflow Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Workflow
              </label>
              <select
                value={selectedWorkflow}
                onChange={(e) => {
                  setSelectedWorkflow(e.target.value);
                  clearChat();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a workflow...</option>
                {workflows.map(workflow => (
                  <option key={workflow.id} value={workflow.id}>
                    {workflow.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {selectedWorkflowData && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <Workflow className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">
                  {selectedWorkflowData.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {selectedWorkflowData.description || 'No description available'}
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-500">Components</p>
                  <p className="font-medium text-gray-900">
                    {selectedWorkflowData.components?.length || 0}
                  </p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-500">Connections</p>
                  <p className="font-medium text-gray-900">
                    {selectedWorkflowData.connections?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chat Info */}
          <div className="p-6 flex-1">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {messages.length} messages
                </span>
              </div>
              
              {sessionId && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Session active
                  </span>
                </div>
              )}
              
              <button
                onClick={clearChat}
                className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-lg shadow border border-gray-200 flex flex-col">
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {selectedWorkflowData ? selectedWorkflowData.name : 'Select a Workflow'}
                </h1>
                <p className="text-sm text-gray-600">
                  {selectedWorkflowData 
                    ? 'Start chatting with your workflow'
                    : 'Choose a workflow from the sidebar to begin'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!selectedWorkflow ? (
              <div className="text-center py-12">
                <Workflow className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Workflow Selected
                </h3>
                <p className="text-gray-600">
                  Please select a valid workflow from the sidebar to start chatting.
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Start the Conversation
                </h3>
                <p className="text-gray-600">
                  Send a message to begin interacting with your workflow.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : message.isError
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div className={`rounded-lg px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.isError
                        ? 'bg-red-50 text-red-900 border border-red-200'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs mt-1 opacity-75">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex space-x-3 max-w-3xl">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={selectedWorkflow ? "Type your message..." : "Select a workflow first..."}
                  disabled={!selectedWorkflow || isLoading}
                  rows={1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || !selectedWorkflow || isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

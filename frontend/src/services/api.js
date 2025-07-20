import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export const documentAPI = {
  uploadDocument: async (file, workflowId = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const url = workflowId 
        ? `/documents/upload?workflow_id=${workflowId}`
        : '/documents/upload';
      
      console.log('Sending upload request for:', file.name, workflowId ? `(workflow: ${workflowId})` : '');
      
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error('API Upload Error:', error);
      throw error;
    }
  },
  
  getDocuments: async (workflowId = null) => {
    const url = workflowId 
      ? `/documents/?workflow_id=${workflowId}`
      : '/documents/';
    const response = await api.get(url);
    return response.data;
  },

  getWorkflowDocuments: async (workflowId) => {
    const response = await api.get(`/documents/workflow/${workflowId}`);
    return response.data;
  },
  
  getDocument: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },
  
  deleteDocument: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
};

export const workflowAPI = {
  createWorkflow: async (workflow) => {
    const response = await api.post('/workflows/', workflow);
    return response.data;
  },
  
  getWorkflows: async () => {
    const response = await api.get('/workflows/');
    return response.data;
  },
  
  getWorkflow: async (id) => {
    const response = await api.get(`/workflows/${id}`);
    return response.data;
  },
  
  updateWorkflow: async (id, workflow) => {
    const response = await api.put(`/workflows/${id}`, workflow);
    return response.data;
  },
  
  deleteWorkflow: async (id) => {
    const response = await api.delete(`/workflows/${id}`);
    return response.data;
  },
  
  executeWorkflow: async (id, inputQuery) => {
    const response = await api.post(`/workflows/${id}/execute`, {
      input_query: inputQuery,
    });
    return response.data;
  },
  
  getWorkflowExecutions: async (id) => {
    const response = await api.get(`/workflows/${id}/executions`);
    return response.data;
  },
};

export const chatAPI = {
  sendMessage: async (message, workflowId, sessionId = null) => {
    const response = await api.post('/chat/', {
      message,
      workflow_id: workflowId,
      session_id: sessionId,
    });
    return response.data;
  },
  
  getChatHistory: async (sessionId) => {
    const response = await api.get(`/chat/sessions/${sessionId}/messages`);
    return response.data;
  },
  
  getChatSession: async (sessionId) => {
    const response = await api.get(`/chat/sessions/${sessionId}`);
    return response.data;
  },
  
  getWorkflowSessions: async (workflowId) => {
    const response = await api.get(`/chat/workflows/${workflowId}/sessions`);
    return response.data;
  },
};

export const componentsAPI = {
  getComponents: async () => {
    const response = await api.get('/components/');
    return response.data;
  },
  
  getComponent: async (type) => {
    const response = await api.get(`/components/${type}`);
    return response.data;
  },
  
  validateWorkflow: async (components, connections) => {
    const response = await api.post('/components/validate/workflow', {
      components,
      connections
    });
    return response.data;
  },
};

export default api;

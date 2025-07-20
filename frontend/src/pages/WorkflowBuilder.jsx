import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import ComponentPalette from '../components/workflow/ComponentPalette';
import WorkflowNode from '../components/workflow/WorkflowNode';
import ComponentConfigPanel from '../components/workflow/ComponentConfigPanel';
import SaveWorkflowModal from '../components/workflow/SaveWorkflowModal';
import WorkflowDocuments from '../components/workflow/WorkflowDocuments';
import { componentsAPI, workflowAPI } from '../services/api';
import { Save, Play, Settings, FileText } from 'lucide-react';

const nodeTypes = {
  workflowNode: WorkflowNode,
};

const WorkflowBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [components, setComponents] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [savedWorkflowId, setSavedWorkflowId] = useState(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const [workflowDocuments, setWorkflowDocuments] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  useEffect(() => {
    fetchComponents();
  }, []);

  useEffect(() => {
    validateWorkflow();
  }, [nodes, edges]);

  const fetchComponents = async () => {
    try {
      console.log('Fetching components from API...');
      const componentData = await componentsAPI.getComponents();
      console.log('Components fetched:', componentData);
      setComponents(componentData);
    } catch (error) {
      console.error('Error fetching components:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const validateWorkflow = async () => {
    if (nodes.length === 0) {
      setIsValid(false);
      return;
    }

    try {
      const workflowComponents = nodes.map(node => ({
        id: node.id,
        type: node.data.componentType,
        label: node.data.label,
        position: node.position,
        data: node.data.config || {}
      }));

      const workflowConnections = edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || 'output',
        targetHandle: edge.targetHandle || 'input'
      }));

      const validation = await componentsAPI.validateWorkflow(
        workflowComponents,
        workflowConnections
      );

      setIsValid(validation.is_valid);
    } catch (error) {
      console.error('Error validating workflow:', error);
      setIsValid(false);
    }
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const componentType = event.dataTransfer.getData('application/reactflow');
      const component = components.find(c => c.type === componentType);

      if (!component) return;

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode = {
        id: `${componentType}-${Date.now()}`,
        type: 'workflowNode',
        position,
        data: {
          label: component.label,
          componentType: component.type,
          icon: component.icon,
          color: component.color,
          inputs: component.inputs,
          outputs: component.outputs,
          config: {},
          configSchema: component.config_schema
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [components, setNodes]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setShowConfigPanel(true);
  }, []);
  const handleNodeConfigUpdate = useCallback((nodeId, newConfig) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              config: newConfig,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleCloseConfigPanel = useCallback(() => {
    setShowConfigPanel(false);
    setSelectedNode(null);
  }, []);

  const handleSaveWorkflow = async () => {
    if (!workflowName.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    try {
      const workflowComponents = nodes.map(node => ({
        id: node.id,
        type: node.data.componentType,
        label: node.data.label,
        position: node.position,
        data: node.data.config || {}
      }));

      const workflowConnections = edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || 'output',
        targetHandle: edge.targetHandle || 'input'
      }));

      const workflowData = {
        name: workflowName,
        description: workflowDescription,
        components: workflowComponents,
        connections: workflowConnections
      };

      const savedWorkflow = await workflowAPI.createWorkflow(workflowData);
      setSavedWorkflowId(savedWorkflow.id);
      alert('Workflow saved successfully! You can now upload documents.');
      setShowSaveModal(false);
      setWorkflowName('');
      setWorkflowDescription('');
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Error saving workflow. Please try again.');
    }
  };

  const handleTestWorkflow = async () => {
    if (!isValid) {
      alert('Please fix workflow validation errors before testing');
      return;
    }

    alert('Test functionality coming soon! Save the workflow and test it in the Chat section.');
  };

  return (
    <div className="h-screen flex">
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <ComponentPalette components={components} />
      </div>
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center space-x-2">
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={!isValid}
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
              isValid
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>
          
          <button
            onClick={handleTestWorkflow}
            disabled={!isValid}
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
              isValid
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Play className="h-4 w-4" />
            <span>Test</span>
          </button>

          <button
            onClick={() => setShowDocuments(!showDocuments)}
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium ${
              showDocuments
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Documents</span>
            {workflowDocuments.length > 0 && (
              <span className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded-full">
                {workflowDocuments.length}
              </span>
            )}
          </button>

          <div className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm ${
            isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isValid ? 'Valid' : 'Invalid'}</span>
          </div>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-50"
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
      {showDocuments && (
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Workflow Documents
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Upload documents to be used by this workflow
            </p>
          </div>
          <div className="p-4">
            <WorkflowDocuments 
              workflowId={savedWorkflowId}
              onDocumentsChange={setWorkflowDocuments}
            />
          </div>
        </div>
      )}
      {showConfigPanel && selectedNode && (
        <ComponentConfigPanel
          node={selectedNode}
          onUpdate={handleNodeConfigUpdate}
          onClose={handleCloseConfigPanel}
        />
      )}
      {showSaveModal && (
        <SaveWorkflowModal
          workflowName={workflowName}
          setWorkflowName={setWorkflowName}
          workflowDescription={workflowDescription}
          setWorkflowDescription={setWorkflowDescription}
          onSave={handleSaveWorkflow}
          onCancel={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
};

const WorkflowBuilderWrapper = () => (
  <ReactFlowProvider>
    <WorkflowBuilder />
  </ReactFlowProvider>
);

export default WorkflowBuilderWrapper;

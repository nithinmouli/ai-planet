import React from 'react';
import { Plus } from 'lucide-react';

const ComponentPalette = ({ components }) => {
  console.log('ComponentPalette rendering with components:', components);
  
  const onDragStart = (event, componentType) => {
    event.dataTransfer.setData('application/reactflow', componentType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="p-6 bg-gray-50 h-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Components</h2>
        <p className="text-sm text-gray-600">
          Drag components to the canvas to build your workflow
        </p>
      </div>
      
      {!components || components.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-3xl mb-4">⟳</div>
          <div className="text-lg font-medium mb-2">Loading components...</div>
          <div className="text-sm">
            Components count: {components ? components.length : 'undefined'}
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {components.map((component) => (
              <div
                key={component.type}
                className="bg-white border border-gray-200 rounded-xl p-4 cursor-grab hover:shadow-lg hover:border-gray-300 transition-all duration-200 group"
                draggable
                onDragStart={(event) => onDragStart(event, component.type)}
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-semibold shadow-sm group-hover:scale-105 transition-transform duration-200"
                    style={{ backgroundColor: component.color, color: 'white' }}
                  >
                    {component.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      {component.label}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {component.description}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Plus className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">Inputs:</span>
                    <span>{component.inputs?.length || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">Outputs:</span>
                    <span>{component.outputs?.length || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="text-blue-500 text-lg">ⓘ</div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Getting Started</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Start with a User Query component, add processing components like Knowledge Base or LLM Engine, and finish with an Output component.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ComponentPalette;

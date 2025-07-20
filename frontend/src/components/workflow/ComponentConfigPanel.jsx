import React, { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';

const ComponentConfigPanel = ({ node, onUpdate, onClose }) => {
  const [config, setConfig] = useState(node?.data?.config || {});

  useEffect(() => {
    setConfig(node?.data?.config || {});
  }, [node]);

  if (!node) return null;

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdate(node.id, newConfig);
  };

  const renderConfigField = (key, field) => {
    const currentValue = config[key] ?? field.default;

    switch (field.type) {
      case 'string':
        if (field.enum) {
          return (
            <select
              value={currentValue}
              onChange={(e) => handleConfigChange(key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {field.enum.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          );
        }
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleConfigChange(key, e.target.value)}
            placeholder={field.default}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'integer':
        return (
          <input
            type="number"
            value={currentValue}
            onChange={(e) => handleConfigChange(key, parseInt(e.target.value))}
            min={field.minimum}
            max={field.maximum}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            step="0.1"
            value={currentValue}
            onChange={(e) => handleConfigChange(key, parseFloat(e.target.value))}
            min={field.minimum}
            max={field.maximum}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={currentValue}
              onChange={(e) => handleConfigChange(key, e.target.checked)}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Enable</span>
          </label>
        );

      default:
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleConfigChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  const componentSchema = node.data.configSchema;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-50 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: node.data.color }}
            >
              {node.data.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{node.data.label}</h3>
              <p className="text-sm text-gray-500">{node.data.componentType}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="h-4 w-4 text-gray-500" />
          <h4 className="text-sm font-medium text-gray-900">Configuration</h4>
        </div>

        {componentSchema && componentSchema.properties ? (
          <div className="space-y-4">
            {Object.entries(componentSchema.properties).map(([key, field]) => (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {field.title || key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                {renderConfigField(key, field)}
                {field.description && (
                  <p className="text-xs text-gray-500">{field.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Settings className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No configuration options available</p>
          </div>
        )}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Node Information</h4>
          
          {node.data.inputs && node.data.inputs.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 mb-1">Inputs:</p>
              <div className="space-y-1">
                {node.data.inputs.map((input, index) => (
                  <div key={index} className="text-xs text-gray-600 flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    {input}
                  </div>
                ))}
              </div>
            </div>
          )}

          {node.data.outputs && node.data.outputs.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Outputs:</p>
              <div className="space-y-1">
                {node.data.outputs.map((output, index) => (
                  <div key={index} className="text-xs text-gray-600 flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    {output}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComponentConfigPanel;

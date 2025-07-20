import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, Info, MoreVertical } from 'lucide-react';

const WorkflowNode = ({ data, selected, id }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const handleColor = '#6b7280';
  
  return (
    <div className={`bg-white rounded-lg border-2 shadow-lg min-w-[240px] transition-all duration-200 ${
      selected ? 'border-blue-500 shadow-xl' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div 
        className="p-4 rounded-t-lg flex items-center justify-between"
        style={{ backgroundColor: data.color + '15' }}
      >
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-semibold shadow-sm"
            style={{ backgroundColor: data.color, color: 'white' }}
          >
            {data.icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{data.label}</h3>
            <p className="text-xs text-gray-500 capitalize">{data.componentType?.replace('_', ' ')}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-1.5 rounded-md hover:bg-white/50 transition-colors"
          >
            <Settings className="h-4 w-4 text-gray-500" />
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-md hover:bg-white/50 transition-colors"
          >
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
      <div className="p-4 pt-3">
        {data.inputs && data.inputs.map((input, index) => (
          <Handle
            key={`input-${index}`}
            type="target"
            position={Position.Left}
            id={input}
            style={{ 
              top: `${40 + (index * 25)}px`,
              backgroundColor: handleColor,
              width: '10px',
              height: '10px',
              border: '2px solid white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }}
          />
        ))}
        {data.outputs && data.outputs.map((output, index) => (
          <Handle
            key={`output-${index}`}
            type="source"
            position={Position.Right}
            id={output}
            style={{ 
              top: `${40 + (index * 25)}px`,
              backgroundColor: data.color,
              width: '10px',
              height: '10px',
              border: '2px solid white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }}
          />
        ))}
        <div className="space-y-3">
          {data.inputs && data.inputs.length > 0 && (
            <div>
              <div className="space-y-2">
                {data.inputs.map((input, index) => (
                  <div key={index} className="flex items-center text-xs text-gray-600">
                    <div 
                      className="w-2 h-2 rounded-full mr-3 ml-1"
                      style={{ backgroundColor: handleColor }}
                    ></div>
                    <span className="font-medium capitalize">{input.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.outputs && data.outputs.length > 0 && (
            <div>
              <div className="space-y-2">
                {data.outputs.map((output, index) => (
                  <div key={index} className="flex items-center justify-end text-xs text-gray-600">
                    <span className="font-medium capitalize mr-3">{output.replace('_', ' ')}</span>
                    <div 
                      className="w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: data.color }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {data.config && Object.keys(data.config).length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              <Settings className="h-3 w-3 inline mr-1" />
              Configured
            </div>
          </div>
        )}
      </div>
      {showConfig && (
        <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-lg">
          <p className="text-xs text-gray-600 mb-2">Configuration:</p>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Component name"
              className="w-full text-xs p-2 border border-gray-300 rounded"
              defaultValue={data.label}
            />
            {data.componentType === 'llm_engine' && (
              <>
                <select className="w-full text-xs p-2 border border-gray-300 rounded">
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI GPT</option>
                </select>
                <input
                  type="number"
                  placeholder="Max tokens"
                  className="w-full text-xs p-2 border border-gray-300 rounded"
                  defaultValue="500"
                />
              </>
            )}
            {data.componentType === 'knowledge_base' && (
              <>
                <input
                  type="number"
                  placeholder="Max results"
                  className="w-full text-xs p-2 border border-gray-300 rounded"
                  defaultValue="3"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Similarity threshold"
                  className="w-full text-xs p-2 border border-gray-300 rounded"
                  defaultValue="0.7"
                />
              </>
            )}
            {data.componentType === 'web_search' && (
              <>
                <select className="w-full text-xs p-2 border border-gray-300 rounded">
                  <option value="google">Google Search</option>
                  <option value="bing">Bing Search</option>
                </select>
                <input
                  type="number"
                  placeholder="Max results"
                  className="w-full text-xs p-2 border border-gray-300 rounded"
                  defaultValue="3"
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowNode;

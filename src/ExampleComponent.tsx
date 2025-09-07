import React from 'react';
import AIFlowCanvas from './AIFlowCanvas';
import './index.css'; // Import the styles

/**
 * ExampleComponent - A simple example demonstrating how to use formmy-actions
 * This component shows the AI Flow Canvas with default configuration
 */
export default function ExampleComponent() {
  const handleSave = (flowData: any) => {
    console.log('Flow saved:', flowData);
  };

  const handleExecute = async (flowData: any) => {
    console.log('Flow executed:', flowData);
    return { success: true, result: 'Execution completed' };
  };

  return (
    <div className="example-container">
      <div className="example-header">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          🚀 formmy-actions Example
        </h1>
        <p className="text-gray-600 mb-4">
          Visual AI workflow builder component - Drag components from the sidebar to create workflows
        </p>
      </div>
      
      <div className="example-canvas" style={{ width: '100%', height: '600px' }}>
        <AIFlowCanvas
          onSave={handleSave}
          onExecute={handleExecute}
          theme="light"
          readonly={false}
          showToaster={false}
          forceIsolation={false}
          showBetaRibbon={true}
          customStyles={{
            height: '100%'
          }}
        />
      </div>

      <div className="example-info mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">How to use:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>Drag components from the left sidebar to the canvas</li>
          <li>Connect nodes by dragging from output handles to input handles</li>
          <li>Configure each node by clicking on it</li>
          <li>Use Cmd/Ctrl+S to save your workflow</li>
          <li>Click "Ejecutar Flujo" to run the complete workflow</li>
        </ul>
      </div>
    </div>
  );
}
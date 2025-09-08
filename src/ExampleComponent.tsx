import React from 'react';
import AIFlowCanvas from './AIFlowCanvas';
import './index.css'; // Import the styles

/**
 * ExampleComponent - Fullscreen AI Flow Canvas
 * This component shows the AI Flow Canvas using the entire viewport
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
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      margin: 0,
      padding: 0
    }}>
      <AIFlowCanvas
        onSave={handleSave}
        onExecute={handleExecute}
        theme="light"
        readonly={false}
        showToaster={true}
        style={{
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
}
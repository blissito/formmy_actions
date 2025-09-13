/**
 * Workflow Execution Context
 * Global state management for workflow execution across all nodes
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface NodeExecutionState {
  status: 'idle' | 'running' | 'completed' | 'error';
  result?: any;
  error?: string;
  startTime?: Date;
  endTime?: Date;
  logs?: string[];
}

export interface Variable {
  name: string;
  value: string;
  type: 'static' | 'runtime' | 'dynamic';
  description?: string;
  category?: string;
}

export interface WorkflowState {
  isExecuting: boolean;
  currentNodeId?: string;
  executionId: string;
  nodeStates: Record<string, NodeExecutionState>;
  globalData: Record<string, any>;
  // Flowise-style global state management
  flowState: Record<string, any>;
  persistState: boolean;
  ephemeralMemory: boolean;
  runtimeState?: Record<string, any>;
  executionOrder: string[];
  startTime?: Date;
  endTime?: Date;
  // Variables management (integrated like Flowise)
  variables: Variable[];
  workflowVariables: Record<string, any>;
}

export interface WorkflowExecutionContextType {
  // State
  workflowState: WorkflowState;

  // Actions
  startExecution: (startNodeId: string) => Promise<void>;
  stopExecution: () => void;
  executeNode: (nodeId: string, nodeType: string, inputs: any) => Promise<any>;
  updateNodeState: (nodeId: string, state: Partial<NodeExecutionState>) => void;
  setGlobalData: (key: string, value: any) => void;
  getGlobalData: (key: string) => any;

  // Flowise-style state management
  setFlowState: (key: string, value: any) => void;
  getFlowState: (key?: string) => any;
  initializeFlowState: (initialState: Record<string, any>, persistState?: boolean, ephemeralMemory?: boolean) => void;
  mergeRuntimeState: (runtimeState: Record<string, any>) => void;

  // Utilities
  isNodeExecuting: (nodeId: string) => boolean;
  getNodeState: (nodeId: string) => NodeExecutionState;
  canExecuteNode: (nodeId: string) => boolean;

  // Variables management (Flowise-style integrated)
  setVariable: (name: string, value: string, type?: Variable['type'], description?: string) => void;
  getVariable: (name: string) => Variable | undefined;
  deleteVariable: (name: string) => void;
  replaceVariables: (text: string) => string;
  getAvailableVariables: () => Variable[];
  setWorkflowVariable: (name: string, value: any) => void;
  getWorkflowVariable: (name: string) => any;
}

const WorkflowExecutionContext = createContext<WorkflowExecutionContextType | null>(null);

export function useWorkflowExecution() {
  const context = useContext(WorkflowExecutionContext);
  if (!context) {
    throw new Error('useWorkflowExecution must be used within WorkflowExecutionProvider');
  }
  return context;
}

interface WorkflowExecutionProviderProps {
  children: ReactNode;
}

export function WorkflowExecutionProvider({ children }: WorkflowExecutionProviderProps) {
  const [workflowState, setWorkflowState] = useState<WorkflowState>(() => {
    // Initialize with system variables like Flowise
    const systemVariables: Variable[] = [
      {
        name: 'currentDate',
        value: new Date().toLocaleDateString(),
        type: 'dynamic',
        description: 'Current date in local format',
        category: 'System'
      },
      {
        name: 'currentTime',
        value: new Date().toLocaleTimeString(),
        type: 'dynamic',
        description: 'Current time in local format',
        category: 'System'
      },
      {
        name: 'timestamp',
        value: Date.now().toString(),
        type: 'dynamic',
        description: 'Current timestamp in milliseconds',
        category: 'System'
      },
      {
        name: 'sessionId',
        value: `session_${Date.now()}`,
        type: 'dynamic',
        description: 'Unique session identifier',
        category: 'Session'
      }
    ];

    return {
      isExecuting: false,
      executionId: '',
      nodeStates: {},
      globalData: {},
      // Flowise-style state initialization
      flowState: {},
      persistState: false,
      ephemeralMemory: false,
      executionOrder: [],
      // Variables integrated like Flowise
      variables: systemVariables,
      workflowVariables: {}
    };
  });

  const startExecution = useCallback(async (startNodeId: string) => {
    const executionId = `exec_${Date.now()}`;
    const startTime = new Date();

    setWorkflowState({
      isExecuting: true,
      currentNodeId: startNodeId,
      executionId,
      nodeStates: {},
      globalData: {},
      executionOrder: [],
      startTime
    });

    console.log(`🚀 Started workflow execution ${executionId} from node ${startNodeId}`);
  }, []);

  const stopExecution = useCallback(() => {
    setWorkflowState(prev => ({
      ...prev,
      isExecuting: false,
      currentNodeId: undefined,
      endTime: new Date()
    }));
    console.log('⏹️ Stopped workflow execution');
  }, []);

  const executeNode = useCallback(async (
    nodeId: string,
    nodeType: string,
    inputs: any
  ): Promise<any> => {
    console.log(`🔄 Executing node ${nodeId} (${nodeType})`);

    // Update node state to running
    updateNodeState(nodeId, {
      status: 'running',
      startTime: new Date(),
      logs: [`Started execution of ${nodeType}`]
    });

    // Add to execution order
    setWorkflowState(prev => ({
      ...prev,
      currentNodeId: nodeId,
      executionOrder: [...prev.executionOrder, nodeId]
    }));

    try {
      // Simulate node execution based on type
      let result: any;

      switch (nodeType) {
        case 'start':
          result = { message: 'Workflow started', timestamp: new Date().toISOString() };
          break;

        case 'input':
          result = {
            text: inputs.text || 'Default input',
            processedAt: new Date().toISOString()
          };
          break;

        case 'conversational-agent':
        case 'react-agent':
          // Simulate agent processing
          await new Promise(resolve => setTimeout(resolve, 2000));
          result = {
            response: `Agent processed: ${inputs.message || inputs.task || 'default task'}`,
            reasoning: ['Analyzed input', 'Generated response', 'Validated output'],
            toolsUsed: ['reasoning', 'language_model']
          };
          break;

        case 'chat':
          result = {
            message: `Chat received: ${JSON.stringify(inputs)}`,
            timestamp: new Date().toISOString(),
            ready: true
          };
          break;

        default:
          result = {
            message: `Executed ${nodeType}`,
            inputs,
            timestamp: new Date().toISOString()
          };
      }

      // Store result in global data
      setGlobalData(`node_${nodeId}_result`, result);

      // Update node state to completed
      updateNodeState(nodeId, {
        status: 'completed',
        result,
        endTime: new Date(),
        logs: [`Started execution of ${nodeType}`, 'Execution completed successfully']
      });

      console.log(`✅ Completed node ${nodeId}:`, result);
      return result;

    } catch (error: any) {
      console.error(`❌ Failed to execute node ${nodeId}:`, error);

      updateNodeState(nodeId, {
        status: 'error',
        error: error.message,
        endTime: new Date(),
        logs: [`Started execution of ${nodeType}`, `Error: ${error.message}`]
      });

      throw error;
    }
  }, []);

  const updateNodeState = useCallback((
    nodeId: string,
    state: Partial<NodeExecutionState>
  ) => {
    setWorkflowState(prev => ({
      ...prev,
      nodeStates: {
        ...prev.nodeStates,
        [nodeId]: {
          ...prev.nodeStates[nodeId],
          ...state
        }
      }
    }));
  }, []);

  const setGlobalData = useCallback((key: string, value: any) => {
    setWorkflowState(prev => ({
      ...prev,
      globalData: {
        ...prev.globalData,
        [key]: value
      }
    }));
    console.log(`📝 Set global data: ${key} =`, value);
  }, []);

  const getGlobalData = useCallback((key: string) => {
    return workflowState.globalData[key];
  }, [workflowState.globalData]);

  // Flowise-style flow state management
  const initializeFlowState = useCallback((
    initialState: Record<string, any>,
    persistState: boolean = false,
    ephemeralMemory: boolean = false
  ) => {
    console.log('🌐 Initializing Flow State (Flowise pattern):', initialState);

    setWorkflowState(prev => {
      let newFlowState = { ...initialState };

      // If persistState is true and we have runtime state, merge it
      if (persistState && prev.runtimeState && Object.keys(prev.runtimeState).length > 0) {
        console.log('🔄 Merging with runtime state:', prev.runtimeState);
        newFlowState = { ...newFlowState, ...prev.runtimeState };
      }

      // If ephemeralMemory is true, start fresh (ignore runtime state)
      if (ephemeralMemory) {
        console.log('🔄 Starting with ephemeral memory (fresh state)');
        newFlowState = { ...initialState };
      }

      return {
        ...prev,
        flowState: newFlowState,
        persistState,
        ephemeralMemory
      };
    });
  }, []);

  const setFlowState = useCallback((key: string, value: any) => {
    setWorkflowState(prev => ({
      ...prev,
      flowState: {
        ...prev.flowState,
        [key]: value
      }
    }));
    console.log(`🌐 Flow State updated: ${key} =`, value);
  }, []);

  const getFlowState = useCallback((key?: string) => {
    if (key) {
      return workflowState.flowState[key];
    }
    return workflowState.flowState;
  }, [workflowState.flowState]);

  const mergeRuntimeState = useCallback((runtimeState: Record<string, any>) => {
    console.log('🔄 Merging runtime state:', runtimeState);
    setWorkflowState(prev => ({
      ...prev,
      runtimeState: { ...prev.runtimeState, ...runtimeState },
      flowState: prev.persistState
        ? { ...prev.flowState, ...runtimeState }
        : prev.flowState
    }));
  }, []);

  const isNodeExecuting = useCallback((nodeId: string) => {
    return workflowState.nodeStates[nodeId]?.status === 'running';
  }, [workflowState.nodeStates]);

  const getNodeState = useCallback((nodeId: string): NodeExecutionState => {
    return workflowState.nodeStates[nodeId] || { status: 'idle' };
  }, [workflowState.nodeStates]);

  const canExecuteNode = useCallback((nodeId: string) => {
    const state = workflowState.nodeStates[nodeId];
    return !state || state.status === 'idle' || state.status === 'completed';
  }, [workflowState.nodeStates]);

  // Variables management functions (integrated like Flowise)
  const setVariable = useCallback((name: string, value: string, type: Variable['type'] = 'static', description?: string) => {
    setWorkflowState(prev => {
      const existingIndex = prev.variables.findIndex(v => v.name === name);
      if (existingIndex >= 0) {
        // Update existing variable
        const newVariables = [...prev.variables];
        newVariables[existingIndex] = { ...newVariables[existingIndex], value, type, description: description || newVariables[existingIndex].description };
        return { ...prev, variables: newVariables };
      }
      // Add new variable
      return {
        ...prev,
        variables: [...prev.variables, { name, value, type, description, category: 'User' }]
      };
    });
  }, []);

  const getVariable = useCallback((name: string) => {
    return workflowState.variables.find(v => v.name === name);
  }, [workflowState.variables]);

  const deleteVariable = useCallback((name: string) => {
    setWorkflowState(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v.name !== name || v.type === 'dynamic')
    }));
  }, []);

  const replaceVariables = useCallback((text: string): string => {
    let result = text;

    // Replace {{variableName}} or {{flowState.key}} syntax (true Flowise style)
    const variableRegex = /\{\{([a-zA-Z0-9_.]+)\}\}/g;
    result = result.replace(variableRegex, (match, varName) => {
      // First check in defined variables
      const variable = workflowState.variables.find(v => v.name === varName);
      if (variable) {
        return variable.value;
      }

      // Check if it's a flowState variable (e.g., flowState.topic)
      if (varName.startsWith('flowState.')) {
        const flowKey = varName.substring(10); // Remove 'flowState.' prefix
        const flowValue = workflowState.flowState[flowKey];
        if (flowValue !== undefined) {
          return String(flowValue);
        }
      }

      // Then check in workflow/runtime variables
      const value = workflowState.workflowVariables[varName];
      if (value !== undefined) {
        return String(value);
      }

      // Return unchanged if not found
      return match;
    });

    return result;
  }, [workflowState.variables, workflowState.workflowVariables, workflowState.flowState]);

  const getAvailableVariables = useCallback(() => {
    // Start with base variables
    let allVariables = [...workflowState.variables];

    // Add flowState variables dynamically
    Object.entries(workflowState.flowState).forEach(([key, value]) => {
      // Don't add if it already exists in base variables
      if (!allVariables.find(v => v.name === `flowState.${key}`)) {
        allVariables.push({
          name: `flowState.${key}`,
          value: String(value || ''),
          type: 'runtime',
          description: `Flow state variable: ${key}`,
          category: 'Flow State'
        });
      }
    });

    // Add workflowVariables as well
    Object.entries(workflowState.workflowVariables).forEach(([key, value]) => {
      if (!allVariables.find(v => v.name === key)) {
        allVariables.push({
          name: key,
          value: String(value || ''),
          type: 'runtime',
          description: `Workflow variable: ${key}`,
          category: 'Workflow'
        });
      }
    });

    return allVariables.sort((a, b) => {
      // Sort by category, then by name
      if (a.category !== b.category) {
        return (a.category || 'User').localeCompare(b.category || 'User');
      }
      return a.name.localeCompare(b.name);
    });
  }, [workflowState.variables, workflowState.flowState, workflowState.workflowVariables]);

  const setWorkflowVariable = useCallback((name: string, value: any) => {
    setWorkflowState(prev => ({
      ...prev,
      workflowVariables: { ...prev.workflowVariables, [name]: value }
    }));
  }, []);

  const getWorkflowVariable = useCallback((name: string) => {
    return workflowState.workflowVariables[name];
  }, [workflowState.workflowVariables]);

  const contextValue: WorkflowExecutionContextType = {
    workflowState,
    startExecution,
    stopExecution,
    executeNode,
    updateNodeState,
    setGlobalData,
    getGlobalData,
    // Flowise-style state methods
    setFlowState,
    getFlowState,
    initializeFlowState,
    mergeRuntimeState,
    isNodeExecuting,
    getNodeState,
    canExecuteNode,
    // Variables management (integrated like Flowise)
    setVariable,
    getVariable,
    deleteVariable,
    replaceVariables,
    getAvailableVariables,
    setWorkflowVariable,
    getWorkflowVariable
  };

  return (
    <WorkflowExecutionContext.Provider value={contextValue}>
      {children}
    </WorkflowExecutionContext.Provider>
  );
}
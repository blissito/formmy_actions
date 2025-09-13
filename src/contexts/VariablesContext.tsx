import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Variable {
  name: string;
  value: string;
  type: 'static' | 'runtime' | 'dynamic';
  description?: string;
  category?: string;
}

interface VariablesContextType {
  variables: Variable[];
  setVariable: (name: string, value: string, type?: Variable['type'], description?: string) => void;
  getVariable: (name: string) => Variable | undefined;
  deleteVariable: (name: string) => void;
  replaceVariables: (text: string) => string;
  getAvailableVariables: () => Variable[];
  addRuntimeVariable: (name: string, envKey: string, description?: string) => void;
  // Workflow context variables
  setWorkflowVariable: (name: string, value: any) => void;
  getWorkflowVariable: (name: string) => any;
}

const VariablesContext = createContext<VariablesContextType | undefined>(undefined);

export function VariablesProvider({ children }: { children: React.ReactNode }) {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [workflowVariables, setWorkflowVariables] = useState<Record<string, any>>({});

  // Initialize with common system variables
  useEffect(() => {
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

    setVariables(prev => [...prev, ...systemVariables]);

    // Auto-update dynamic variables every minute
    const interval = setInterval(() => {
      setVariables(prev => prev.map(variable => {
        if (variable.type === 'dynamic') {
          switch (variable.name) {
            case 'currentDate':
              return { ...variable, value: new Date().toLocaleDateString() };
            case 'currentTime':
              return { ...variable, value: new Date().toLocaleTimeString() };
            case 'timestamp':
              return { ...variable, value: Date.now().toString() };
            default:
              return variable;
          }
        }
        return variable;
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const setVariable = (name: string, value: string, type: Variable['type'] = 'static', description?: string) => {
    setVariables(prev => {
      const existing = prev.find(v => v.name === name);
      if (existing) {
        return prev.map(v => v.name === name ? { ...v, value, type, description: description || v.description } : v);
      }
      return [...prev, { name, value, type, description, category: 'User' }];
    });
  };

  const getVariable = (name: string) => {
    return variables.find(v => v.name === name);
  };

  const deleteVariable = (name: string) => {
    setVariables(prev => prev.filter(v => v.name !== name || v.type === 'dynamic'));
  };

  const addRuntimeVariable = (name: string, envKey: string, description?: string) => {
    const value = process.env[envKey] || `$${envKey}`;
    setVariable(name, value, 'runtime', description || `Runtime variable from ${envKey}`);
  };

  const replaceVariables = (text: string): string => {
    let result = text;

    // Replace {{$vars.variableName}} syntax
    const variableRegex = /\{\{\$vars\.([a-zA-Z0-9_]+)\}\}/g;
    result = result.replace(variableRegex, (match, varName) => {
      const variable = getVariable(varName);
      return variable ? variable.value : match;
    });

    // Replace workflow variables {{workflowVar}} syntax
    const workflowRegex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
    result = result.replace(workflowRegex, (match, varName) => {
      if (varName.startsWith('$vars.')) return match; // Skip already processed
      const value = workflowVariables[varName];
      return value !== undefined ? String(value) : match;
    });

    return result;
  };

  const getAvailableVariables = () => {
    return variables.sort((a, b) => {
      // Sort by category, then by name
      if (a.category !== b.category) {
        return (a.category || 'User').localeCompare(b.category || 'User');
      }
      return a.name.localeCompare(b.name);
    });
  };

  const setWorkflowVariable = (name: string, value: any) => {
    setWorkflowVariables(prev => ({ ...prev, [name]: value }));
  };

  const getWorkflowVariable = (name: string) => {
    return workflowVariables[name];
  };

  return (
    <VariablesContext.Provider
      value={{
        variables,
        setVariable,
        getVariable,
        deleteVariable,
        replaceVariables,
        getAvailableVariables,
        addRuntimeVariable,
        setWorkflowVariable,
        getWorkflowVariable
      }}
    >
      {children}
    </VariablesContext.Provider>
  );
}

export function useVariables() {
  const context = useContext(VariablesContext);
  if (context === undefined) {
    throw new Error('useVariables must be used within a VariablesProvider');
  }
  return context;
}
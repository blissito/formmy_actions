import React, { useState } from 'react';
import { FiPlus, FiCopy } from 'react-icons/fi';
import { useWorkflowExecution, type Variable } from '../runtime/WorkflowExecutionContext';

interface VariablesListProps {
  onVariableSelect?: (variable: Variable) => void;
  showAddVariable?: boolean;
  compact?: boolean;
}

export default function VariablesList({
  onVariableSelect,
  showAddVariable = true,
  compact = false
}: VariablesListProps) {
  const { getAvailableVariables, setVariable } = useWorkflowExecution();
  const [selectedVariable, setSelectedVariable] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVariable, setNewVariable] = useState({ name: '', value: '', description: '' });

  const variables = getAvailableVariables();

  const handleVariableSelect = (variableName: string) => {
    setSelectedVariable(variableName);
    const variable = variables.find(v => v.name === variableName);
    if (variable && onVariableSelect) {
      onVariableSelect(variable);
    }
  };

  const copyVariableSyntax = async (variableName: string) => {
    const syntax = `{{${variableName}}}`;
    try {
      await navigator.clipboard.writeText(syntax);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleAddVariable = () => {
    if (newVariable.name && newVariable.value) {
      setVariable(newVariable.name, newVariable.value, 'static', newVariable.description);
      setNewVariable({ name: '', value: '', description: '' });
      setShowAddForm(false);
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <select
          value={selectedVariable}
          onChange={(e) => handleVariableSelect(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Select a variable...</option>
          {variables.map((variable) => (
            <option key={variable.name} value={variable.name}>
              {variable.name} - {variable.value?.substring(0, 50)}...
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-800">Variables</h3>
        {showAddVariable && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
          >
            <FiPlus size={10} />
            Add
          </button>
        )}
      </div>

      {/* Simple Select Dropdown */}
      <select
        value={selectedVariable}
        onChange={(e) => handleVariableSelect(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-lg text-sm mb-3"
      >
        <option value="">Select a variable...</option>
        {variables.map((variable) => (
          <option key={variable.name} value={variable.name}>
            {variable.category} - {variable.name}
          </option>
        ))}
      </select>

      {/* Selected Variable Details */}
      {selectedVariable && (
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          {(() => {
            const variable = variables.find(v => v.name === selectedVariable);
            return variable ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{variable.name}</span>
                    <span className={`text-xs px-1 py-0.5 rounded ${
                      variable.type === 'static' ? 'bg-blue-100 text-blue-800' :
                      variable.type === 'runtime' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {variable.type}
                    </span>
                  </div>
                  <div className="w-[16px] h-[16px] flex items-center justify-center">
                    <button
                      onClick={() => copyVariableSyntax(variable.name)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy syntax"
                    >
                      <FiCopy size={12} />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  <strong>Value:</strong> {variable.value}
                </div>
                {variable.description && (
                  <div className="text-xs text-gray-500">
                    {variable.description}
                  </div>
                )}
                <div className="mt-2 text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                  {`{{${variable.name}}}`}
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}

      {/* Add Variable Form */}
      {showAddForm && (
        <div className="mt-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Variable name"
              value={newVariable.name}
              onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded text-xs"
            />
            <input
              type="text"
              placeholder="Variable value"
              value={newVariable.value}
              onChange={(e) => setNewVariable(prev => ({ ...prev, value: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded text-xs"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newVariable.description}
              onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded text-xs"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddVariable}
                className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                disabled={!newVariable.name || !newVariable.value}
              >
                Add
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-xs bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {variables.length === 0 && (
        <div className="text-xs text-gray-500 text-center py-4">
          No variables available
        </div>
      )}
    </div>
  );
}
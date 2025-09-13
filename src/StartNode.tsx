/**
 * Start Node Component - Flowise Agentflow v2 Architecture
 * Exact copy of Flowise Start component patterns with React Flow UI
 * Based on: FlowiseAI/Flowise/packages/components/nodes/agentflow/Start/Start.ts
 */

import React, { useState, useEffect } from 'react';
import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react';
import { useWorkflowExecution } from './runtime/WorkflowExecutionContext';
import { useTranslation } from './i18n';
import {
  FiPlay,
  FiSettings,
  FiZap,
  FiCheck,
  FiAlertTriangle,
  FiPlus,
  FiX,
} from 'react-icons/fi';

export interface StartNodeData {
  // Flowise Start inputs
  startInputType?: 'chatInput' | 'formInput';
  formTitle?: string;
  formDescription?: string;
  formInputTypes?: Array<{
    type: 'string' | 'number' | 'boolean' | 'options';
    label: string;
    name: string;
    addOptions?: Array<{ option: string }>;
  }>;
  startEphemeralMemory?: boolean;
  startState?: Array<{ key: string; value?: string }>;
  startPersistState?: boolean;
}

export function StartNode({ data, id }: NodeProps<StartNodeData>) {
  const {
    workflowState,
    startExecution,
    setGlobalData,
    getNodeState,
    initializeFlowState,
    getFlowState
  } = useWorkflowExecution();

  const { updateNodeData } = useReactFlow();
  const { t } = useTranslation();

  // Flowise configuration state - exactly as in original
  const [startInputType, setStartInputType] = useState<'chatInput' | 'formInput'>(
    data?.startInputType || 'chatInput'
  );
  const [formTitle, setFormTitle] = useState(data?.formTitle || t('startNode.formTitlePlaceholder'));
  const [formDescription, setFormDescription] = useState(
    data?.formDescription || t('startNode.formDescPlaceholder')
  );
  const [formInputTypes, setFormInputTypes] = useState<StartNodeData['formInputTypes']>(
    data?.formInputTypes || []
  );
  const [startState, setStartState] = useState<StartNodeData['startState']>(
    data?.startState || []
  );
  const [startEphemeralMemory, setStartEphemeralMemory] = useState(
    data?.startEphemeralMemory || false
  );
  const [startPersistState, setStartPersistState] = useState(
    data?.startPersistState || false
  );
  const [showConfig, setShowConfig] = useState(false);

  // Get current node state
  const nodeState = getNodeState(id);
  const isExecuting = workflowState.isExecuting && workflowState.currentNodeId === id;
  const status = nodeState.status;

  // Update node data when configuration changes
  useEffect(() => {
    updateNodeData(id, {
      startInputType,
      formTitle,
      formDescription,
      formInputTypes,
      startState,
      startEphemeralMemory,
      startPersistState,
    });
  }, [startInputType, formTitle, formDescription, formInputTypes, startState, startEphemeralMemory, startPersistState, id, updateNodeData]);

  // Initialize Flow State - Following Flowise pattern exactly
  useEffect(() => {
    const flowState: Record<string, any> = {};

    // Build flow state from startState array (Flowise pattern)
    if (startState && startState.length > 0) {
      for (const state of startState) {
        if (state.key && state.key.trim()) {
          flowState[state.key] = state.value || '';
        }
      }
    }

    // Initialize flow state using Flowise-style methods
    initializeFlowState(flowState, startPersistState, startEphemeralMemory);

    // Set global data following Flowise pattern for backward compatibility
    setGlobalData('flowState', flowState);
    setGlobalData('startConfig', {
      inputType: startInputType,
      ephemeralMemory: startEphemeralMemory,
      persistState: startPersistState,
      form: startInputType === 'formInput' ? {
        title: formTitle,
        description: formDescription,
        inputs: formInputTypes
      } : undefined
    });

    console.log('🌐 StartNode initialized flow state:', flowState);
  }, [startState, startInputType, startEphemeralMemory, startPersistState, formTitle, formDescription, formInputTypes, setGlobalData, initializeFlowState]);

  const handleStartWorkflow = async () => {
    if (isExecuting || workflowState.isExecuting) return;

    try {
      // Flowise run method pattern
      const inputData: any = {};
      const outputData: any = {};

      if (startInputType === 'chatInput') {
        const question = 'Hello! Starting workflow...'; // Default input
        inputData.question = question;
        outputData.question = question;
      }

      if (startInputType === 'formInput') {
        inputData.form = {
          title: formTitle,
          description: formDescription,
          inputs: formInputTypes
        };
        outputData.form = {}; // Empty form to be filled
      }

      if (startEphemeralMemory) {
        outputData.ephemeralMemory = true;
      }

      if (startPersistState) {
        outputData.persistState = true;
      }

      // Set the Flowise-style return output
      const returnOutput = {
        id: id,
        name: 'startAgentflow',
        input: inputData,
        output: outputData,
        state: startState?.reduce((acc, state) => {
          acc[state.key] = state.value;
          return acc;
        }, {} as Record<string, any>) || {}
      };

      setGlobalData('startOutput', returnOutput);
      await startExecution(id);
    } catch (error) {
      console.error('Failed to start workflow:', error);
    }
  };

  const addFormInput = () => {
    setFormInputTypes([
      ...(formInputTypes || []),
      {
        type: 'string',
        label: '',
        name: '',
        addOptions: []
      }
    ]);
  };

  const updateFormInput = (index: number, field: string, value: any) => {
    const newInputs = [...(formInputTypes || [])];
    newInputs[index] = { ...newInputs[index], [field]: value };
    setFormInputTypes(newInputs);
  };

  const removeFormInput = (index: number) => {
    setFormInputTypes(formInputTypes?.filter((_, i) => i !== index) || []);
  };

  const addStateVariable = () => {
    setStartState([...(startState || []), { key: '', value: '' }]);
  };

  const updateStateVariable = (index: number, field: 'key' | 'value', value: string) => {
    const newState = [...(startState || [])];
    newState[index] = { ...newState[index], [field]: value };
    setStartState(newState);
  };

  const removeStateVariable = (index: number) => {
    setStartState(startState?.filter((_, i) => i !== index) || []);
  };

  const getStatusIcon = () => {
    if (isExecuting) return <FiZap className="animate-pulse text-blue-600" size={16} />;
    if (status === 'completed') return <FiCheck className="text-green-600" size={16} />;
    if (status === 'error') return <FiAlertTriangle className="text-red-600" size={16} />;
    return <FiPlay className="text-gray-600" size={16} />;
  };

  const getStatusColor = () => {
    if (isExecuting) return 'border-blue-300 bg-blue-50';
    if (status === 'completed') return 'border-green-300 bg-green-50';
    if (status === 'error') return 'border-red-300 bg-red-50';
    return 'border-gray-300 bg-white';
  };

  return (
    <div className={`min-w-80 bg-white border-2 rounded-lg shadow-sm transition-all duration-200 ${getStatusColor()}`}>

      {/* Header - Flowise Style */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="text-sm font-semibold text-gray-800">{t('startNode.title')}</h3>
              <p className="text-xs text-gray-500">{t('startNode.description')}</p>
            </div>
          </div>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiSettings size={16} />
          </button>
        </div>
      </div>

      {/* Configuration Panel - Following Flowise inputs */}
      {showConfig && (
        <div className="p-4 bg-gray-50 border-b border-gray-200 max-h-96 overflow-y-auto">
          <div className="space-y-4">

            {/* Input Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">{t('startNode.inputType')}</label>
              <select
                value={startInputType}
                onChange={(e) => setStartInputType(e.target.value as 'chatInput' | 'formInput')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="chatInput">{t('startNode.chatInput')} - {t('startNode.chatInputDesc')}</option>
                <option value="formInput">{t('startNode.formInput')} - {t('startNode.formInputDesc')}</option>
              </select>
            </div>

            {/* Form Configuration */}
            {startInputType === 'formInput' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('startNode.formTitle')}</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                    placeholder={t('startNode.formTitlePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('startNode.formDescription')}</label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                    placeholder={t('startNode.formDescPlaceholder')}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-gray-700">{t('startNode.formInputTypes')}</label>
                    <button
                      onClick={addFormInput}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>

                  {formInputTypes?.map((input, index) => (
                    <div key={index} className="p-2 border border-gray-200 rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Input {index + 1}</span>
                        <button
                          onClick={() => removeFormInput(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiX size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={input.type}
                          onChange={(e) => updateFormInput(index, 'type', e.target.value)}
                          className="px-2 py-1 text-xs border border-gray-300 rounded"
                        >
                          <option value="string">{t('formTypes.string')}</option>
                          <option value="number">{t('formTypes.number')}</option>
                          <option value="boolean">{t('formTypes.boolean')}</option>
                          <option value="options">{t('formTypes.options')}</option>
                        </select>

                        <input
                          type="text"
                          value={input.label}
                          onChange={(e) => updateFormInput(index, 'label', e.target.value)}
                          placeholder={t('formTypes.label')}
                          className="px-2 py-1 text-xs border border-gray-300 rounded"
                        />
                      </div>

                      <input
                        type="text"
                        value={input.name}
                        onChange={(e) => updateFormInput(index, 'name', e.target.value)}
                        placeholder={t('formTypes.variableName')}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Global Flow State - Flowise Style */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    🌐 Estado Global (Flow State)
                  </label>
                  <span className="block text-xs text-gray-600 mt-1">
                    Variables compartidas por todo el flujo de trabajo - Patrón Flowise v2
                  </span>
                </div>
                <button
                  onClick={addStateVariable}
                  className="bg-blue-600 text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <FiPlus size={12} />
                  Agregar Variable
                </button>
              </div>

              {startState && startState.length > 0 ? (
                <div className="space-y-3">
                  {startState.map((state, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Variable #{index + 1}
                        </span>
                        <button
                          onClick={() => removeStateVariable(index)}
                          className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                        >
                          <FiX size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Clave (Key)</label>
                          <input
                            type="text"
                            value={state.key}
                            onChange={(e) => updateStateVariable(index, 'key', e.target.value)}
                            placeholder="ej: username, config, data"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Valor (Value)</label>
                          <input
                            type="text"
                            value={state.value || ''}
                            onChange={(e) => updateStateVariable(index, 'value', e.target.value)}
                            placeholder="ej: admin, true, 42"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        Accesible como: <code className="bg-gray-100 px-1 py-0.5 rounded">flowState.{state.key || '[clave]'}</code>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-2xl mb-2">📝</div>
                  <div className="text-sm font-medium">No hay variables globales configuradas</div>
                  <div className="text-xs mt-1">Click "Agregar Variable" para crear el estado global</div>
                </div>
              )}

              {startState && startState.length > 0 && (
                <div className="mt-3 p-2 bg-blue-100 rounded text-xs">
                  <strong>💡 Tip:</strong> Estas variables estarán disponibles en todos los nodos del flujo como <code>flowState.nombreVariable</code>
                </div>
              )}
            </div>

            {/* Memory Options */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={startEphemeralMemory}
                  onChange={(e) => setStartEphemeralMemory(e.target.checked)}
                  className="rounded"
                />
                <span>{t('startNode.ephemeralMemory')} - {t('startNode.ephemeralMemoryDesc')}</span>
              </label>

              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={startPersistState}
                  onChange={(e) => setStartPersistState(e.target.checked)}
                  className="rounded"
                />
                <span>{t('startNode.persistState')} - {t('startNode.persistStateDesc')}</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4">
        <button
          onClick={handleStartWorkflow}
          disabled={isExecuting}
          className={`w-full py-3 px-4 rounded-md text-sm font-medium transition-all ${
            isExecuting
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
          }`}
          style={{ backgroundColor: isExecuting ? undefined : '#7EE787' }} // Flowise green
        >
          {isExecuting ? (
            <div className="flex items-center justify-center gap-2">
              <FiZap className="animate-spin" size={16} />
{t('startNode.startingWorkflow')}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <FiPlay size={16} />
{t('startNode.startAgentflow')}
            </div>
          )}
        </button>

        {/* Flow State Preview */}
        {startState && startState.length > 0 && (
          <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="text-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-700 font-semibold">🌐 Estado Global Configurado</span>
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  {startState.length} variables
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {startState.map((state, index) => (
                  state.key && (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <code className="bg-white px-1.5 py-0.5 rounded border text-blue-700 font-mono">
                        {state.key}
                      </code>
                      <span className="text-gray-400">=</span>
                      <span className="text-gray-700 truncate max-w-24">
                        {state.value || '<vacío>'}
                      </span>
                    </div>
                  )
                ))}
              </div>
              <div className="mt-2 text-xs text-green-600">
                ✓ Disponibles en todos los nodos como <code className="bg-white px-1 py-0.5 rounded">flowState.*</code>
              </div>
            </div>
          </div>
        )}

        {/* Workflow Status */}
        {workflowState.executionId && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <div className="text-xs text-gray-600">
              <div>{t('startNode.executionId')}: {workflowState.executionId.slice(-8)}</div>
              <div>{t('startNode.inputType')}: {startInputType === 'chatInput' ? t('startNode.chatInput') : t('startNode.formInput')}</div>
              {startState && startState.length > 0 && (
                <div>{t('startNode.flowStateVars')}: {startState.length}</div>
              )}
              {startEphemeralMemory && (
                <div className="text-orange-600">⚡ Memoria efímera activa</div>
              )}
              {startPersistState && (
                <div className="text-blue-600">💾 Estado persistente activo</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Output Handle - Flowise pattern */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 border-2 border-white shadow-sm"
        style={{
          right: -6,
          backgroundColor: '#7EE787' // Flowise green
        }}
      />
    </div>
  );
}
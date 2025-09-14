import React, { useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiChevronRight, FiCopy, FiCheck, FiX } from 'react-icons/fi';
import type { FlowExecution, ExecutionResult } from '../runtime/ExecutionEngine';

// Tipos basados en Flowise WorkflowTreeView
export type WorkflowNode = {
  nodeId: string;
  nodeLabel: string;
  data: any;
  previousNodeIds: string[];
  status: 'FINISHED' | 'PENDING' | 'RUNNING' | 'ERROR' | 'INPROGRESS' | 'STOPPED';
};

interface ExecutionTracerProps {
  execution?: FlowExecution;
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
}

// Componentes de iconos exactos de Flowise
const FinishedIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#4CAF50"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const PendingIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#FFC107"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const RunningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2196F3"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16l4-4-4-4" />
    <path d="M8 12h8" />
  </svg>
);

const ErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#F44336"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Función para obtener el icono correcto según el status
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'FINISHED':
    case 'success':
      return <FinishedIcon />;
    case 'PENDING':
    case 'idle':
      return <PendingIcon />;
    case 'RUNNING':
    case 'INPROGRESS':
    case 'running':
      return <RunningIcon />;
    case 'ERROR':
    case 'error':
      return <ErrorIcon />;
    default:
      return <PendingIcon />;
  }
};

// Función de highlight de sintaxis JSON exacta de Flowise
function syntaxHighlight(json: string) {
  if (!json) return '';

  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      let cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    },
  );
}

// Remover credenciales como en Flowise
const FLOWISE_CREDENTIAL_ID = 'FLOWISE_CREDENTIAL_ID';
const removeFlowiseCredentialId = (data: any): any => {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => removeFlowiseCredentialId(item));
  }

  const cleanedData = { ...data };
  for (const key in cleanedData) {
    if (key === FLOWISE_CREDENTIAL_ID) {
      delete cleanedData[key];
    } else if (typeof cleanedData[key] === 'object' && cleanedData[key] !== null) {
      cleanedData[key] = removeFlowiseCredentialId(cleanedData[key]);
    }
  }
  return cleanedData;
};

export const ExecutionTracer: React.FC<ExecutionTracerProps> = ({
  execution,
  isVisible,
  onToggle,
  className = ''
}) => {
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);

  // Convertir execution a formato de nodos de Flowise
  useEffect(() => {
    if (!execution) {
      setTreeData([]);
      return;
    }

    const nodes: any[] = [];

    // Handle both ExecutionEngine format and SimpleFlowiseExecutor format
    const results = execution.results || execution.nodeResults;
    if (!results) {
      return nodes;
    }

    const resultsMap = results instanceof Map ? results : new Map(Object.entries(results));
    resultsMap.forEach((result, nodeId) => {
      // Handle both ExecutionEngine format and SimpleFlowiseExecutor format
      let status = 'FINISHED'; // Default for SimpleFlowiseExecutor

      if (result && result.status) {
        // ExecutionEngine format
        switch (result.status) {
          case 'success':
            status = 'FINISHED';
            break;
          case 'error':
            status = 'ERROR';
            break;
          case 'running':
            status = 'RUNNING';
            break;
          default:
            status = 'PENDING';
        }
      }

      // Handle both result formats
      const outputData = result?.outputs || result || {};

      nodes.push({
        id: nodeId,
        label: outputData.nodeLabel || `Node ${nodeId}`,
        name: outputData.nodeType || nodeId,
        status,
        data: {
          ...outputData,
          inputs: outputData.inputs || {},
          outputs: outputData,
          logs: result?.logs || [],
          executionTime: result?.executionTime,
          error: result?.error,
        },
        children: [],
      });
    });

    setTreeData(nodes);

    // Expandir todos los nodos por defecto
    setExpandedNodes(nodes.map(node => node.id));

    // Determinar status general (handle both formats)
    if (execution.status === 'error' || execution.success === false) {
      setExecutionStatus('ERROR');
    } else if (execution.status === 'running') {
      setExecutionStatus('RUNNING');
    } else if (execution.status === 'completed' || execution.success === true) {
      setExecutionStatus('FINISHED');
    } else {
      setExecutionStatus('PENDING');
    }
  }, [execution]);

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNode(nodeId);
  };

  const togglePanel = () => {
    setIsPanelExpanded(!isPanelExpanded);
  };

  const copyToClipboard = async () => {
    const nodeDetails = getSelectedNodeDetails();
    if (!nodeDetails) return;

    try {
      await navigator.clipboard.writeText(JSON.stringify(nodeDetails.data || {}, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getSelectedNodeDetails = () => {
    if (!selectedNode) return null;

    const node = treeData.find(n => n.id === selectedNode);
    if (node) {
      return {
        nodeLabel: node.label,
        data: removeFlowiseCredentialId(node.data),
        status: node.status,
      };
    }
    return null;
  };

  const getHighlightedJson = () => {
    const nodeDetails = getSelectedNodeDetails();
    if (!nodeDetails) return '';
    return syntaxHighlight(JSON.stringify(nodeDetails.data || {}, null, 2));
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 w-96 max-h-[80vh] bg-white shadow-2xl rounded-lg border border-gray-200 z-50 flex flex-col ${className}`}
      style={{ backgroundColor: '#f7f8ff' }}
    >
      {/* Estilos CSS inline exactos de Flowise */}
      <style>{`
        .json-viewer .string { color: #7ac35c; }
        .json-viewer .number { color: #e08331; }
        .json-viewer .boolean { color: #326dc3; }
        .json-viewer .null { color: #a951ad; }
        .json-viewer .key { color: #d73e3e; font-weight: bold; }

        .tree-item-content.selected {
          background-color: rgba(25, 118, 210, 0.15);
          font-weight: 500;
          border-left: 3px solid #1976d2;
          padding-left: calc(0.25rem - 3px) !important;
          box-shadow: 0 0 0 1px rgba(25, 118, 210, 0.05);
          transform: translateX(2px);
        }
        .tree-item-content.selected:hover {
          background-color: rgba(25, 118, 210, 0.25);
        }
        .tree-item-content {
          border-left: 3px solid transparent;
          transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }

        .node-details-panel {
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .status-icon {
          filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));
        }
      `}</style>

      {/* Header con formato exacto de Flowise */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
        onClick={togglePanel}
        style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
      >
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            {isPanelExpanded ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />}
          </div>
          <h2 className="font-semibold flex items-center text-gray-800">
            Process Flow
            {executionStatus && (
              <span className="ml-2 status-icon" title={`Execution Status: ${executionStatus}`}>
                {getStatusIcon(executionStatus)}
              </span>
            )}
          </h2>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <FiX size={16} />
        </button>
      </div>

      {/* Contenido expandible */}
      {isPanelExpanded && (
        <div className="border-t flex-1 flex flex-col overflow-hidden">
          {/* Lista de nodos */}
          <div className="p-4 mb-2 flex-1 overflow-y-auto">
            {treeData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No execution data available</p>
                <p className="text-xs">Execute a workflow to see traces</p>
              </div>
            ) : (
              treeData.map((node) => (
                <div key={node.id} className="mb-2">
                  <div
                    className={`flex items-center p-3 cursor-pointer rounded tree-item-content ${
                      selectedNode === node.id ? 'selected' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleNodeSelect(node.id)}
                  >
                    <div className="status-icon mr-2">{getStatusIcon(node.status)}</div>
                    <span className="font-medium">{node.label}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Panel de detalles del nodo seleccionado */}
          {selectedNode && (
            <div
              className="mx-4 mb-4 p-4 rounded border node-details-panel"
              style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start mb-3">
                <div className="flex items-center mb-2 md:mb-0">
                  <span className="mr-2 status-icon">
                    {getStatusIcon(getSelectedNodeDetails()?.status || 'PENDING')}
                  </span>
                  <h3 className="font-medium">
                    <span className="font-bold">{getSelectedNodeDetails()?.nodeLabel}</span>
                  </h3>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100"
                  title="Copy to clipboard"
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>

              <div
                className="json-viewer text-xs overflow-auto max-h-60 p-2 rounded font-mono"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
                dangerouslySetInnerHTML={{ __html: getHighlightedJson() }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
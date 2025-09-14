import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FiChevronDown,
  FiChevronRight,
  FiCopy,
  FiCheck,
  FiFolder,
  FiFile,
  FiCheckCircle,
  FiClock,
  FiPlay,
  FiAlertCircle,
  FiSquare,
  FiRefreshCw
} from 'react-icons/fi';

// Types for workflow nodes
export type WorkflowNodeStatus = 'FINISHED' | 'PENDING' | 'RUNNING' | 'ERROR' | 'INPROGRESS' | 'STOPPED';

export type WorkflowNode = {
  nodeId: string;
  nodeLabel: string;
  data: any;
  previousNodeIds: string[];
  status: WorkflowNodeStatus;
};

// Tree node structure for internal use
type TreeNode = {
  id: string;
  label: string;
  name?: string;
  status: WorkflowNodeStatus;
  data: any;
  children: TreeNode[];
  executionIndex?: number;
};

// Props for the main component
type WorkflowTreeViewProps = {
  workflowData: WorkflowNode[];
  className?: string;
  indentationLevel?: number;
  initiallyExpanded?: boolean;
  title?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
};

// Default values
const defaultBackgroundColor = '#f7f8ff';
const defaultTextColor = '#303235';
const defaultFontSize = 14;
const FLOWISE_CREDENTIAL_ID = 'FLOWISE_CREDENTIAL_ID';

// Utility to remove sensitive credential data
const removeFlowiseCredentialId = (data: any): any => {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => removeFlowiseCredentialId(item));
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

// Status icons
const StatusIcons: Record<WorkflowNodeStatus, React.ComponentType> = {
  FINISHED: () => <FiCheckCircle className="text-green-500 w-4 h-4" />,
  PENDING: () => <FiClock className="text-yellow-500 w-4 h-4" />,
  RUNNING: () => <FiPlay className="text-blue-500 w-4 h-4 animate-pulse" />,
  INPROGRESS: () => <FiRefreshCw className="text-blue-500 w-4 h-4 animate-spin" />,
  ERROR: () => <FiAlertCircle className="text-red-500 w-4 h-4" />,
  STOPPED: () => <FiSquare className="text-orange-500 w-4 h-4" />
};

// Syntax highlighting for JSON
const syntaxHighlight = (json: string) => {
  if (!json) return '';

  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let className = 'text-orange-600'; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          className = 'text-red-600 font-semibold'; // key
        } else {
          className = 'text-green-600'; // string
        }
      } else if (/true|false/.test(match)) {
        className = 'text-blue-600'; // boolean
      } else if (/null/.test(match)) {
        className = 'text-purple-600'; // null
      }
      return `<span class="${className}">${match}</span>`;
    }
  );
};

// Tree item component
interface TreeItemProps {
  node: TreeNode;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  indentationLevel: number;
}

const TreeItem: React.FC<TreeItemProps> = ({
  node,
  level,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  indentationLevel
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const StatusIcon = StatusIcons[node.status];

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id);
    if (hasChildren) {
      onToggle(node.id);
    }
  }, [node.id, hasChildren, onSelect, onToggle]);

  return (
    <div className="mb-0.5">
      <div
        className={`
          flex items-center py-1.5 px-1 rounded cursor-pointer transition-all duration-150
          ${isSelected
            ? 'bg-blue-100 border-l-2 border-blue-500 font-medium shadow-sm'
            : 'hover:bg-gray-50'
          }
        `}
        style={{ paddingLeft: level * indentationLevel + 8 }}
        onClick={handleClick}
      >
        {/* Expand/Collapse Icon */}
        <div className="w-5 h-5 mr-1 flex items-center justify-center">
          {hasChildren ? (
            isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />
          ) : null}
        </div>

        {/* Status Icon */}
        <div className="w-5 h-5 mr-2 flex items-center justify-center">
          <StatusIcon />
        </div>

        {/* Label */}
        <div className="flex-grow text-sm">
          {node.label}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="border-l border-dashed border-gray-300 ml-6">
          {node.children.map((child) => (
            <TreeItemContainer
              key={child.id}
              node={child}
              level={level + 1}
              indentationLevel={indentationLevel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Container for tree item with context
interface TreeItemContainerProps {
  node: TreeNode;
  level: number;
  indentationLevel: number;
}

const TreeItemContainer: React.FC<TreeItemContainerProps> = ({ node, level, indentationLevel }) => {
  const { expandedNodes, selectedNode, toggleNode, selectNode } = useTreeContext();

  return (
    <TreeItem
      node={node}
      level={level}
      isExpanded={expandedNodes.includes(node.id)}
      isSelected={selectedNode === node.id}
      onToggle={toggleNode}
      onSelect={selectNode}
      indentationLevel={indentationLevel}
    />
  );
};

// Tree context
interface TreeContextType {
  expandedNodes: string[];
  selectedNode: string | null;
  toggleNode: (id: string) => void;
  selectNode: (id: string) => void;
}

const TreeContext = React.createContext<TreeContextType | null>(null);

const useTreeContext = () => {
  const context = React.useContext(TreeContext);
  if (!context) throw new Error('useTreeContext must be used within TreeProvider');
  return context;
};

// Main WorkflowTreeView component
export const WorkflowTreeView: React.FC<WorkflowTreeViewProps> = ({
  workflowData,
  className = '',
  indentationLevel = 20,
  initiallyExpanded = true,
  title = 'Process Flow',
  backgroundColor = defaultBackgroundColor,
  textColor = defaultTextColor,
  fontSize = defaultFontSize
}) => {
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(initiallyExpanded);
  const [copied, setCopied] = useState(false);

  // Build tree data from workflow nodes
  const treeData = useMemo(() => {
    if (!workflowData || workflowData.length === 0) return [];

    // Clean credential data
    const cleanedNodes = workflowData.map(node => ({
      ...node,
      data: removeFlowiseCredentialId(node.data)
    }));

    // Create node map
    const nodeMap = new Map<string, TreeNode>();
    cleanedNodes.forEach((node, index) => {
      const uniqueId = `${node.nodeId}_${index}`;
      nodeMap.set(uniqueId, {
        id: uniqueId,
        label: node.nodeLabel,
        name: node.data?.name,
        status: node.status,
        data: node.data,
        children: [],
        executionIndex: index
      });
    });

    // Build tree structure
    const rootNodes: TreeNode[] = [];
    const processedNodes = new Set<string>();

    cleanedNodes.forEach((node, index) => {
      const uniqueId = `${node.nodeId}_${index}`;
      const treeNode = nodeMap.get(uniqueId)!;

      if (node.previousNodeIds.length === 0) {
        rootNodes.push(treeNode);
      } else {
        // Find the most recent parent
        let mostRecentParentIndex = -1;
        let parentId = '';

        node.previousNodeIds.forEach(prevId => {
          for (let i = 0; i < index; i++) {
            if (cleanedNodes[i].nodeId === prevId && i > mostRecentParentIndex) {
              mostRecentParentIndex = i;
              parentId = `${prevId}_${i}`;
            }
          }
        });

        if (parentId && nodeMap.has(parentId)) {
          nodeMap.get(parentId)!.children.push(treeNode);
          processedNodes.add(uniqueId);
        }
      }
    });

    return rootNodes;
  }, [workflowData]);

  // Get execution status
  const executionStatus = useMemo(() => {
    if (!treeData.length) return null;

    const getAllStatuses = (nodes: TreeNode[]): WorkflowNodeStatus[] => {
      let statuses: WorkflowNodeStatus[] = [];
      nodes.forEach(node => {
        statuses.push(node.status);
        if (node.children.length > 0) {
          statuses = [...statuses, ...getAllStatuses(node.children)];
        }
      });
      return statuses;
    };

    const statuses = getAllStatuses(treeData);
    if (statuses.includes('ERROR')) return 'ERROR';
    if (statuses.includes('RUNNING') || statuses.includes('INPROGRESS')) return 'INPROGRESS';
    if (statuses.includes('STOPPED')) return 'STOPPED';
    if (statuses.every(status => status === 'FINISHED')) return 'FINISHED';
    return 'PENDING';
  }, [treeData]);

  // Initialize expanded nodes
  useEffect(() => {
    if (treeData.length > 0 && expandedNodes.length === 0) {
      setExpandedNodes(treeData.map(node => node.id));
    }
  }, [treeData, expandedNodes.length]);

  const toggleNode = useCallback((id: string) => {
    setExpandedNodes(prev =>
      prev.includes(id)
        ? prev.filter(nodeId => nodeId !== id)
        : [...prev, id]
    );
  }, []);

  const selectNode = useCallback((id: string) => {
    setSelectedNode(id);
  }, []);

  const togglePanel = useCallback(() => {
    setIsPanelExpanded(!isPanelExpanded);
  }, [isPanelExpanded]);

  // Get selected node details
  const getSelectedNodeDetails = useCallback(() => {
    if (!selectedNode) return null;

    const findNode = (nodes: TreeNode[], id: string): TreeNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        const found = findNode(node.children, id);
        if (found) return found;
      }
      return null;
    };

    return findNode(treeData, selectedNode);
  }, [selectedNode, treeData]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async () => {
    const nodeDetails = getSelectedNodeDetails();
    if (!nodeDetails) return;

    try {
      await navigator.clipboard.writeText(JSON.stringify(nodeDetails.data || {}, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [getSelectedNodeDetails]);

  const contextValue: TreeContextType = {
    expandedNodes,
    selectedNode,
    toggleNode,
    selectNode
  };

  const StatusIcon = executionStatus ? StatusIcons[executionStatus] : null;

  return (
    <TreeContext.Provider value={contextValue}>
      <div
        className={`border rounded-lg shadow-sm overflow-hidden ${className}`}
        style={{
          backgroundColor,
          color: textColor,
          fontSize: `${fontSize}px`
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors border-b"
          onClick={togglePanel}
        >
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              {isPanelExpanded ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
            </div>
            <h3 className="font-semibold text-sm flex items-center">
              {title}
              {StatusIcon && (
                <span className="ml-2" title={`Status: ${executionStatus}`}>
                  <StatusIcon />
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* Content */}
        {isPanelExpanded && (
          <div>
            <div className="p-3">
              {treeData.length > 0 ? (
                treeData.map(rootNode => (
                  <TreeItemContainer
                    key={rootNode.id}
                    node={rootNode}
                    level={0}
                    indentationLevel={indentationLevel}
                  />
                ))
              ) : (
                <div className="text-gray-500 text-sm italic text-center py-4">
                  No workflow data available
                </div>
              )}
            </div>

            {/* Selected node details */}
            {selectedNode && getSelectedNodeDetails() && (
              <div className="mx-3 mb-3 p-3 bg-gray-50 rounded border">
                <div className="flex flex-col md:flex-row justify-between items-start mb-2">
                  <div className="flex items-center mb-2 md:mb-0">
                    <span className="mr-2">
                      {StatusIcons[getSelectedNodeDetails()!.status] &&
                        React.createElement(StatusIcons[getSelectedNodeDetails()!.status])}
                    </span>
                    <h4 className="font-medium text-sm">
                      {getSelectedNodeDetails()!.label}
                    </h4>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100"
                    title="Copy to clipboard"
                  >
                    {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                  </button>
                </div>

                <div
                  className="text-xs font-mono bg-white p-2 rounded border overflow-auto max-h-40"
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  dangerouslySetInnerHTML={{
                    __html: syntaxHighlight(
                      JSON.stringify(getSelectedNodeDetails()!.data || {}, null, 2)
                    )
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </TreeContext.Provider>
  );
};

export default WorkflowTreeView;
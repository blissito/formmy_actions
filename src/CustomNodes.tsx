import React from "react";
import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";
import {
  FiEdit,
  FiFileText,
  FiZap,
  FiSettings,
  FiCopy,
  FiTool,
  FiMaximize2,
  FiMinimize2,
  FiCheck,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { TbRobot } from "react-icons/tb";
import { ModelService, type ModelInfo } from './services/modelService';
import toast from 'react-hot-toast';

interface BaseCardProps {
  children: React.ReactNode;
  bgGradient: string;
  borderColor: string;
  hasTargetHandle?: boolean;
  hasSourceHandle?: boolean;
  handleColor: string;
}

function BaseCard({
  children,
  bgGradient,
  borderColor,
  hasTargetHandle,
  hasSourceHandle,
  handleColor,
}: BaseCardProps) {
  return (
    <div
      className={`min-w-[180px] p-4 ${bgGradient} border-2 ${borderColor} rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-200`}
    >
      {children}
      {hasTargetHandle && (
        <Handle
          type="target"
          position={Position.Left}
          className={`w-4 h-4 ${handleColor} border-2 border-white shadow-md`}
        />
      )}
      {hasSourceHandle && (
        <Handle
          type="source"
          position={Position.Right}
          className={`w-4 h-4 ${handleColor} border-2 border-white shadow-md`}
        />
      )}
    </div>
  );
}

export function InputNode({ data, id }: NodeProps) {
  const [text, setText] = React.useState<string>(String(data?.text ?? ""));
  const [isFocused, setIsFocused] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { getNodes, setNodes } = useReactFlow();

  const handleDuplicate = () => {
    const nodes = getNodes();
    const currentNode = nodes.find((n) => n.id === id);

    if (currentNode) {
      const newNode = {
        ...currentNode,
        id: `${currentNode.type}_${Date.now()}`,
        position: {
          x: currentNode.position.x + 50,
          y: currentNode.position.y + 50,
        },
        selected: false,
        data: {
          ...currentNode.data,
          text: text,
        },
      };

      setNodes((prev) => [...prev, newNode]);
    }
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Determinar el número de filas basado en el estado
  const getRows = () => {
    if (isExpanded) return 12; // Mucho más grande para 3-4 párrafos
    if (isFocused) return 5; // Tamaño focus
    return 3; // Tamaño normal
  };

  return (
    <>
      <div className="w-48 bg-blue-100 border border-blue-400 rounded-2xl p-3">
        {/* Header with icon and title */}
        <div className="flex flex-col items-center justify-center mb-3">
          <FiEdit className="text-blue-600 mb-2" size={16} />
          <span className="text-blue-800 text-xs font-medium">
            Entrada de Texto
          </span>
        </div>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full p-2 border border-blue-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none text-xs transition-all duration-200"
          rows={getRows()}
          placeholder="Escribe tu prompt aquí..."
        />

        {/* Action bar */}
        <div className="flex justify-between mt-3">
          <button
            onClick={handleToggleExpand}
            className="w-6 h-6 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center hover:bg-blue-50 transition-colors"
            title={isExpanded ? "Contraer" : "Expandir"}
          >
            {isExpanded ? (
              <FiMinimize2 size={12} className="text-blue-600" />
            ) : (
              <FiMaximize2 size={12} className="text-blue-600" />
            )}
          </button>
          <button
            onClick={handleDuplicate}
            className="w-6 h-6 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center hover:bg-blue-50 transition-colors"
            title="Duplicar nodo"
          >
            <FiCopy size={12} className="text-blue-600" />
          </button>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="prompt"
        className="w-3 h-3 bg-blue-500 border-2 border-white !important"
        style={{ backgroundColor: "#3b82f6" }}
      />
    </>
  );
}

export function AgentNode({ data, id }: NodeProps) {
  const [isConfigOpen, setIsConfigOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [availableModels, setAvailableModels] = React.useState<ModelInfo[]>([]);
  const [isLoadingModels, setIsLoadingModels] = React.useState(false);
  const { getNodes, setNodes } = useReactFlow();
  
  // Execution state
  const executionStatus = data?.executionStatus || 'idle'; // idle, running, success, error

  // Cargar configuración global desde localStorage
  const globalConfig = React.useMemo(() => {
    try {
      const saved = localStorage.getItem("ai-flow-global-config");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }, []);

  const [config, setConfig] = React.useState({
    model: String(data?.model || globalConfig.defaultModel || "gpt-3.5-turbo"),
    temperature: data?.temperature ?? globalConfig.defaultTemperature ?? 0.7,
    stream: data?.stream ?? globalConfig.defaultStream ?? true,
    agentType: String(data?.agentType || "openai"), // openai, anthropic, llamaindex
  });

  // Cargar modelos disponibles cuando se abre la configuración
  React.useEffect(() => {
    if (isConfigOpen && !isLoadingModels && availableModels.length === 0) {
      setIsLoadingModels(true);
      ModelService.getAvailableModels(
        globalConfig.openaiApiKey,
        globalConfig.anthropicApiKey
      ).then((models) => {
        setAvailableModels(models);
        setIsLoadingModels(false);
      }).catch((error) => {
        console.warn('Error loading models:', error);
        setIsLoadingModels(false);
      });
    }
  }, [isConfigOpen, globalConfig.openaiApiKey, globalConfig.anthropicApiKey, isLoadingModels, availableModels.length]);

  // Tools se determinan por las conexiones, no por configuración
  const hasToolsConnected = data?.toolsConnected || false;

  // Determinar el proveedor basado en el modelo seleccionado
  const getProviderFromModel = (modelId: string): 'openai' | 'anthropic' | 'unknown' => {
    if (modelId.includes('gpt-') || modelId.includes('GPT')) {
      return 'openai';
    }
    if (modelId.includes('claude-') || modelId.includes('Claude')) {
      return 'anthropic';
    }
    return 'unknown';
  };

  const currentProvider = getProviderFromModel(config.model);
  
  // Colores según el proveedor
  const getProviderColors = () => {
    switch (currentProvider) {
      case 'openai':
        return {
          background: '#d1fae5', // green-100
          border: 'border-green-400',
          iconBg: 'from-green-500 to-emerald-500',
          iconColor: 'text-green-600',
          textColor: 'text-green-800'
        };
      case 'anthropic':
        return {
          background: '#fef3c7', // amber-100  
          border: 'border-amber-400',
          iconBg: 'from-amber-500 to-orange-500',
          iconColor: 'text-amber-600',
          textColor: 'text-amber-800'
        };
      default:
        return {
          background: '#f3f4f6', // gray-100
          border: 'border-gray-400',
          iconBg: 'from-gray-500 to-slate-500',
          iconColor: 'text-gray-600',
          textColor: 'text-gray-800'
        };
    }
  };

  const colors = getProviderColors();

  // Get status-based styling
  const getStatusStyling = () => {
    if (executionStatus === 'running') {
      return {
        borderStyle: 'animate-pulse border-4 border-blue-400',
        bgOverlay: 'absolute inset-0 bg-blue-100 bg-opacity-20 rounded-3xl'
      };
    } else if (executionStatus === 'success') {
      return {
        borderStyle: 'border-2 border-green-400',
        bgOverlay: 'absolute inset-0 bg-green-100 bg-opacity-10 rounded-3xl'
      };
    } else if (executionStatus === 'error') {
      return {
        borderStyle: 'border-2 border-red-400',
        bgOverlay: 'absolute inset-0 bg-red-100 bg-opacity-20 rounded-3xl'
      };
    }
    return {
      borderStyle: `border-2 ${colors.border}`,
      bgOverlay: ''
    };
  };

  const statusStyling = getStatusStyling();

  const handleDuplicate = () => {
    const nodes = getNodes();
    const currentNode = nodes.find((n) => n.id === id);

    if (currentNode) {
      const newNode = {
        ...currentNode,
        id: `${currentNode.type}_${Date.now()}`,
        position: {
          x: currentNode.position.x + 50,
          y: currentNode.position.y + 50,
        },
        selected: false,
        data: {
          ...currentNode.data,
          ...config, // Include current configuration
        },
      };

      setNodes((prev) => [...prev, newNode]);
      console.log("Node duplicated:", newNode);
    }
  };

  return (
    <>
      <div
        className={`min-w-[200px] p-4 ${statusStyling.borderStyle} rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-200 relative`}
        style={{ backgroundColor: colors.background }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Status overlay */}
        {statusStyling.bgOverlay && <div className={statusStyling.bgOverlay}></div>}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-[30px] h-8 rounded-xl bg-gradient-to-br ${colors.iconBg} flex items-center justify-center text-white shadow-md relative`}>
              <TbRobot size={16} />
              {executionStatus === 'running' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              )}
              {executionStatus === 'success' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
              )}
              {executionStatus === 'error' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </div>
            <div className={`${colors.textColor} font-bold text-sm`}>
              Agente IA
              {executionStatus === 'running' && (
                <span className="ml-1 text-blue-600 text-xs">(ejecutando...)</span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            {isHovered && (
              <button
                onClick={handleDuplicate}
                className="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                style={{ backgroundColor: colors.background }}
                title="Duplicar nodo"
              >
                <FiCopy size={12} className={colors.textColor} />
              </button>
            )}
            <button
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
              style={{ backgroundColor: colors.background }}
            >
              <FiSettings size={12} className={colors.textColor} />
            </button>
          </div>
        </div>

        {isConfigOpen && (
          <div className={`mb-3 p-3 bg-white/60 rounded-2xl border ${colors.border.replace('border-', 'border-')} space-y-2`}>
            <div>
              <label className={`text-xs ${colors.textColor} font-medium`}>
                Modelo:
              </label>
              <select
                value={config.model}
                onChange={(e) =>
                  setConfig({ ...config, model: e.target.value })
                }
                className="w-full text-xs p-1 rounded bg-white border border-amber-200"
                disabled={isLoadingModels}
              >
                {isLoadingModels ? (
                  <option value="">Cargando modelos...</option>
                ) : (
                  availableModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className={`text-xs ${colors.textColor} font-medium`}>
                Temperatura: {config.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    temperature: parseFloat(e.target.value),
                  })
                }
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="w-full pointer-events-auto"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.stream}
                onChange={(e) =>
                  setConfig({ ...config, stream: e.target.checked })
                }
                className="rounded"
              />
              <label className="text-xs text-amber-700 font-medium">
                Stream
              </label>
            </div>

            <div>
              <label className="text-xs text-amber-700 font-medium">
                Agent Type:
              </label>
              <select
                value={config.agentType}
                onChange={(e) =>
                  setConfig({ ...config, agentType: e.target.value })
                }
                className="w-full text-xs p-1 rounded bg-white border border-amber-200"
              >
                <option value="openai">OpenAI (Function Calling)</option>
                <option value="anthropic">Anthropic (Tool Use)</option>
                <option value="llamaindex">LlamaIndex (ReActAgent)</option>
              </select>
            </div>
          </div>
        )}

        <div className="text-gray-600 text-xs text-center font-medium">
          {String(config.agentType).toUpperCase()}: {config.model}
        </div>
        <div className="text-gray-500 text-xs text-center">
          T: {config.temperature} | Stream: {config.stream ? "ON" : "OFF"}
        </div>
        {hasToolsConnected && (
          <div className="text-gray-500 text-xs text-center flex items-center justify-center gap-1">
            <FiTool size={10} />
            Tools Connected
          </div>
        )}
      </div>

      {/* Input Handles con labels */}
      <Handle
        type="target"
        position={Position.Left}
        id="prompt"
        className="w-4 h-4 bg-amber-500 border-2 border-white shadow-md"
        style={{ backgroundColor: "#f59e0b", top: "30%" }}
      />
      <div className="absolute left-[-40px] top-[35%] text-[10px] text-gray-500 bg-white px-1 rounded shadow-sm border opacity-60 z-[-1]">
        prompt
      </div>

      <Handle
        type="target"
        position={Position.Top}
        id="system"
        className="w-4 h-4 bg-amber-600 border-2 border-white shadow-md"
        style={{ backgroundColor: "#d97706" }}
      />
      <div className="absolute top-[-35px] left-1/2 transform -translate-x-1/2 text-[10px] text-gray-500 bg-white px-1 rounded shadow-sm border opacity-60 z-[-1]">
        system
      </div>

      {/* Output Handles con labels */}
      <Handle
        type="source"
        position={Position.Right}
        id="response"
        className="w-4 h-4 bg-amber-500 border-2 border-white shadow-md"
        style={{ backgroundColor: "#f59e0b", top: "40%" }}
      />
      <div className="absolute right-[-50px] top-[45%] text-[10px] text-gray-500 bg-white px-1 rounded shadow-sm border opacity-60 z-[-1]">
        response
      </div>

      {/* Handle para tools en la izquierda - se activa cuando se conecta */}
      <Handle
        type="target"
        position={Position.Left}
        id="tools"
        className={`w-4 h-4 border-2 border-white shadow-md ${hasToolsConnected ? "bg-orange-500" : "bg-gray-300"}`}
        style={{
          backgroundColor: hasToolsConnected ? "#f97316" : "#d1d5db",
          top: "70%",
        }}
      />
      <div className="absolute left-[-35px] top-[75%] text-[10px] text-gray-500 bg-white px-1 rounded shadow-sm border opacity-60 z-[-1]">
        tools
      </div>
    </>
  );
}

export function OutputNode({ data }: NodeProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [result, setResult] = React.useState(data?.result || null);
  const [copied, setCopied] = React.useState(false);

  // Update result when data changes
  React.useEffect(() => {
    if (data?.result) {
      setResult(data.result);
    }
  }, [data?.result]);

  const hasResult = result !== null && result !== undefined;

  const handleCopy = async () => {
    if (!result) return;
    
    try {
      const textToCopy = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Show success toast
      toast.success('¡Resultado copiado al portapapeles! 📋', {
        duration: 2000,
        icon: '📋',
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Error al copiar al portapapeles');
    }
  };

  return (
    <>
      <div className={`min-w-[200px] ${isExpanded ? 'min-h-[300px]' : 'min-h-[80px]'} bg-green-100 border border-green-400 rounded-2xl p-3 transition-all duration-200`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HiOutlineSparkles className="text-green-600" size={16} />
            <span className="text-green-800 text-xs font-medium">Resultado</span>
          </div>
          {hasResult && (
            <div className="flex gap-1">
              <button
                onClick={handleCopy}
                className="w-6 h-6 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center hover:bg-green-50 transition-colors"
                title={copied ? "¡Copiado!" : "Copiar al portapapeles"}
              >
                {copied ? (
                  <FiCheck size={12} className="text-green-600" />
                ) : (
                  <FiCopy size={12} className="text-green-600" />
                )}
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-6 h-6 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center hover:bg-green-50 transition-colors"
                title={isExpanded ? "Contraer" : "Expandir"}
              >
                {isExpanded ? (
                  <FiMinimize2 size={12} className="text-green-600" />
                ) : (
                  <FiMaximize2 size={12} className="text-green-600" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Result Display */}
        {hasResult ? (
          <div className={`bg-white rounded-lg p-2 border border-green-200 ${isExpanded ? 'max-h-[250px]' : 'max-h-[40px]'} overflow-y-auto transition-all duration-200`}>
            <div className="text-xs text-gray-700">
              {isExpanded ? (
                <pre className="whitespace-pre-wrap font-mono text-[10px]">
                  {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                </pre>
              ) : (
                <div className="truncate">
                  {typeof result === 'string' 
                    ? result.substring(0, 50) + (result.length > 50 ? '...' : '')
                    : JSON.stringify(result).substring(0, 50) + '...'
                  }
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-gray-500 text-xs">Esperando resultado...</div>
          </div>
        )}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-3 h-3 bg-green-500 border-2 border-white !important"
        style={{ backgroundColor: "#10b981" }}
      />
    </>
  );
}

// Nodo Prompt personalizado
export function PromptNode({ }: NodeProps) {
  return (
    <div className="min-w-[180px] p-4 bg-gradient-to-br from-purple-50 to-violet-100 border-2 border-purple-400 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-200">
      <div className="text-center mb-3">
        <div className="w-10 h-10 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white shadow-md mb-2">
          <FiFileText size={16} />
        </div>
        <div className="text-purple-800 font-bold text-sm">
          Plantilla de Prompt
        </div>
      </div>
      <div className="text-purple-600 text-xs text-center">
        Prompt estructurado con variables
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="w-4 h-4 bg-purple-500 border-2 border-white shadow-md"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-4 h-4 bg-purple-500 border-2 border-white shadow-md"
      />
    </div>
  );
}

// Nodo Function personalizado
export function FunctionNode({ }: NodeProps) {
  return (
    <BaseCard
      bgGradient="bg-gradient-to-br from-red-50 to-pink-100"
      borderColor="border-red-400"
      hasTargetHandle={true}
      hasSourceHandle={true}
      handleColor="bg-red-500"
    >
      <div className="text-center mb-3">
        <div className="w-10 h-10 mx-auto rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white shadow-md mb-2">
          <FiZap size={16} />
        </div>
        <div className="text-red-800 font-bold text-sm">
          Función Personalizada
        </div>
      </div>
      <div className="text-red-600 text-xs text-center">
        Ejecuta funciones personalizadas
      </div>
    </BaseCard>
  );
}

// Nodo Tool para conectar herramientas a agentes
export function ToolNode({ data }: NodeProps) {
  const config = {
    toolName: data?.toolName || "custom_tool",
    description: data?.description || "Una herramienta personalizada",
    parameters: data?.parameters || {},
  };

  return (
    <BaseCard
      bgGradient="bg-gradient-to-br from-orange-50 to-red-100"
      borderColor="border-orange-400"
      hasTargetHandle={false}
      hasSourceHandle={true}
      handleColor="bg-orange-500"
    >
      <div className="text-center mb-3">
        <div className="w-10 h-10 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-md mb-2">
          <FiSettings size={16} />
        </div>
        <div className="text-orange-800 font-bold text-sm">Tool</div>
      </div>
      <div className="text-orange-600 text-xs text-center">
        {String(config.toolName)}
      </div>
      <div className="text-orange-500 text-[10px] text-center mt-1">
        {String(config.description)}
      </div>
    </BaseCard>
  );
}

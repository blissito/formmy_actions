import {
  useCallback,
  useRef,
  useState,
  useEffect,
  type DragEvent,
} from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  ReactFlow,
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  ConnectionMode,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type OnConnect,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  InputNode,
  AgentNode,
  OutputNode,
  PromptNode,
  FunctionNode,
  ToolNode,
} from "./CustomNodes";
import { FFmpegNode } from "./tools/FFmpegTool";
import { ImageGeneratorNode } from "./tools/ImageGeneratorTool";
import {
  ReactAgentNode,
  ConversationalAgentNode,
  WorkflowGeneratorNode,
} from "./AgentNodes";
import { ChatNode } from "./ChatNode";
import { StartNode } from "./StartNode";
import { GlobalSettings, useGlobalConfig } from "./components/GlobalSettings";
import { ExecutionEngine } from "./runtime/ExecutionEngine";
import { FlowExporter } from "./tools/FlowExporter";
import {
  FiEdit,
  FiFileText,
  FiZap,
  FiPlay,
  FiSettings,
  FiSave,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { RiRobot2Line } from "react-icons/ri";
import InlineBetaBadge from "./InlineBetaBadge";
import FrameworkSidebar from "./components/FrameworkSidebar";
import BarraDeHerramientas from "./components/BarraDeHerramientas";
import { ChatPopup } from "./components/ChatPopup";

import { cn } from './utils/cn';
import { WorkflowExecutionProvider } from './runtime/WorkflowExecutionContext';

// Initialize executors
import './runtime/ExecutorRegistry';

// Tipos de nodos disponibles para arrastrar
const nodeTypes = [
  {
    type: "input",
    icon: FiEdit,
    title: "Entrada de Texto",
    description: "Ingresa tu texto o datos aquí",
    gradient: "from-blue-500 to-blue-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
    borderColor: "border-blue-400",
    textColor: "text-blue-800",
  },
  {
    type: "agent",
    icon: RiRobot2Line,
    title: "Agente IA",
    description: "Procesamiento inteligente con IA",
    gradient: "from-amber-500 to-orange-500",
    bgColor: "bg-gradient-to-br from-amber-50 to-orange-100",
    borderColor: "border-amber-400",
    textColor: "text-amber-800",
  },
  {
    type: "output",
    icon: HiOutlineSparkles,
    title: "Resultado",
    description: "Salida final del procesamiento",
    gradient: "from-green-500 to-emerald-500",
    bgColor: "bg-gradient-to-br from-green-50 to-emerald-100",
    borderColor: "border-green-400",
    textColor: "text-green-800",
  },
  {
    type: "prompt",
    icon: FiFileText,
    title: "Plantilla de Prompt",
    description: "Prompt estructurado con variables",
    gradient: "from-purple-500 to-violet-500",
    bgColor: "bg-gradient-to-br from-purple-50 to-violet-100",
    borderColor: "border-purple-400",
    textColor: "text-purple-800",
  },
  {
    type: "ffmpeg",
    icon: FiZap,
    title: "FFmpeg Video",
    description: "Crear videos con FFmpeg",
    gradient: "from-purple-500 to-purple-600",
    bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
    borderColor: "border-purple-400",
    textColor: "text-purple-800",
  },
  {
    type: "imageGenerator",
    icon: HiOutlineSparkles,
    title: "Generador de Imágenes",
    description: "Genera imágenes con AI",
    gradient: "from-indigo-500 to-indigo-600",
    bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100",
    borderColor: "border-indigo-400",
    textColor: "text-indigo-800",
  },
  {
    type: "function",
    icon: FiZap,
    title: "Función Personalizada",
    description: "Ejecuta funciones personalizadas",
    gradient: "from-red-500 to-pink-500",
    bgColor: "bg-gradient-to-br from-red-50 to-pink-100",
    borderColor: "border-red-400",
    textColor: "text-red-800",
  },
  {
    type: "tool",
    icon: FiSettings,
    title: "Tool",
    description: "Herramientas para agentes IA",
    gradient: "from-orange-500 to-red-500",
    bgColor: "bg-gradient-to-br from-orange-50 to-red-100",
    borderColor: "border-orange-400",
    textColor: "text-orange-800",
  },
];

// Mapeo de tipos de nodos custom
const customNodeTypes = {
  input: InputNode,
  agent: AgentNode,
  output: OutputNode,
  prompt: PromptNode,
  function: FunctionNode,
  tool: ToolNode,
  ffmpeg: FFmpegNode,
  imageGenerator: ImageGeneratorNode,
  // Agent nodes
  'react-agent': ReactAgentNode,
  'conversational-agent': ConversationalAgentNode,
  'workflow-generator': WorkflowGeneratorNode,
  // Workflow nodes
  chat: ChatNode,
  start: StartNode,
};

let id = 0;
const getId = () => `dndnode_${id++}`;

// Nodos iniciales
const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: { label: "Entrada de Texto" },
    position: { x: 300, y: 50 },
  },
  {
    id: "2",
    type: "agent",
    data: { label: "Agente IA" },
    position: { x: 300, y: 200 },
  },
  {
    id: "3",
    type: "output",
    data: { label: "Resultado" },
    position: { x: 500, y: 200 },
  },
];

// Color unificado para todas las conexiones
const connectionStyle = { stroke: "#6366f1", strokeWidth: 2 };

// Conexiones iniciales con mejor styling
const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    style: connectionStyle,
    animated: true,
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    style: connectionStyle,
    animated: true,
  },
];

interface FlowCanvasProps {
  onSave?: (flowData: any) => void;
  onExecute?: (flowData: any) => Promise<any>;
  readonly?: boolean;
}

function FlowCanvas({
  onSave: onSaveCallback,
  onExecute: onExecuteCallback,
  readonly,
}: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();

  // Estado para ejecución del flujo
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);

  // Variables globales y configuración
  const { config: globalConfig, saveConfig: saveGlobalConfig } =
    useGlobalConfig();
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);

  // Estado para cambios no guardados
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Instancia del ExecutionEngine
  const executionEngine = useRef(new ExecutionEngine()).current;

  // Función para duplicar nodo
  const duplicateNode = useCallback(
    (nodeId: string) => {
      const nodeToDuplicate = nodes.find((n) => n.id === nodeId);
      if (nodeToDuplicate) {
        const newNode = {
          ...nodeToDuplicate,
          id: `${nodeToDuplicate.type}_${Date.now()}`,
          position: {
            x: nodeToDuplicate.position.x + 50,
            y: nodeToDuplicate.position.y + 50,
          },
          selected: false,
        };
        setNodes((prevNodes) => [...prevNodes, newNode]);
      }
    },
    [nodes, setNodes]
  );

  const onConnect: OnConnect = useCallback(
    (params) => {
      console.log("Conectando:", params);
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            style: connectionStyle,
            animated: true,
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onDragStart = (
    event: DragEvent,
    nodeType: string,
    framework?: string,
    componentInfo?: any
  ) => {
    const dragData = {
      nodeType,
      framework: framework || 'legacy', // Default to legacy for old nodes
      componentInfo: componentInfo || null,
    };
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(dragData)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const dragDataString = event.dataTransfer.getData(
        "application/reactflow"
      );
      if (!dragDataString) return;

      let dragData;
      try {
        dragData = JSON.parse(dragDataString);
      } catch {
        // Fallback for old format
        dragData = { nodeType: dragDataString, componentInfo: null };
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let newNode: Node;

      if (dragData.nodeType === "generated" && dragData.componentInfo) {
        // Generated component
        const component = dragData.componentInfo;
        newNode = {
          id: getId(),
          type: "generated", // Custom type for generated components
          position,
          data: {
            label: `${component.ui.icon} ${component.name}`,
            component: component.name,
            framework: component.framework,
            category: component.category,
            description: component.description,
            parameters: {}, // Initialize with defaults later
            ui: component.ui,
          },
          style: {
            background: "white",
            border: `2px solid ${component.ui.color}`,
            borderRadius: "12px",
            minWidth: "200px",
          },
        };
      } else {
        // Built-in component or framework tool
        const nodeTypeConfig = nodeTypes.find(
          (nt) => nt.type === dragData.nodeType
        );
        newNode = {
          id: getId(),
          type: dragData.nodeType,
          position,
          data: {
            label: nodeTypeConfig ? nodeTypeConfig.title : dragData.nodeType,
            framework: dragData.framework || 'legacy', // Store framework info
            toolId: dragData.nodeType, // Store tool ID for new framework tools
          },
        };
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  // Función para ejecutar el flujo completo
  const executeFlow = useCallback(async () => {
    if (isExecuting) return;

    setIsExecuting(true);
    setExecutionResult(null);
    setExecutionLogs([]);

    try {
      console.log("🚀 Iniciando ejecución del flujo...");
      console.log("Nodos:", nodes);
      console.log("Conexiones:", edges);

      // Obtener datos del nodo Input si existe
      const inputNode = nodes.find((n) => n.type === "input");
      const inputText =
        inputNode?.data?.text ||
        inputNode?.data?.label ||
        "Hello, how are you today?";

      const initialInputs = {
        prompt: inputText,
        input: inputText,
      };

      // Marcar todos los nodos como idle al inicio
      setNodes((prevNodes) =>
        prevNodes.map((node) => ({
          ...node,
          data: { ...node.data, executionStatus: "idle" },
        }))
      );

      // Crear un callback para actualizar el estado de los nodos
      const updateNodeStatus = (
        nodeId: string,
        status: "running" | "success" | "error",
        result?: any
      ) => {
        setNodes((prevNodes) =>
          prevNodes.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    executionStatus: status,
                    result: result,
                  },
                }
              : node
          )
        );
      };

      // Ejecutar flujo usando el ExecutionEngine con seguimiento de estado
      const flowId = `flow_${Date.now()}`;

      // Mostrar que estamos iniciando
      toast.loading("Ejecutando flujo...", { id: "flow-execution" });

      const execution = await executionEngine.executeFlow(
        flowId,
        nodes,
        edges,
        initialInputs,
        updateNodeStatus
      );

      console.log("✅ Ejecución completada:", execution);

      // Actualizar Output nodes con resultados
      const outputNodes = nodes.filter((n) => n.type === "output");
      if (outputNodes.length > 0 && execution.results.size > 0) {
        const lastResult = Array.from(execution.results.values()).pop();
        if (lastResult && lastResult.outputs.response) {
          setNodes((prevNodes) =>
            prevNodes.map((node) =>
              node.type === "output"
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      result: lastResult.outputs.response,
                      executionStatus: "success",
                    },
                  }
                : node
            )
          );
        }
      }

      // Recopilar logs de todos los nodos
      const allLogs: string[] = [];
      execution.results.forEach((result, nodeId) => {
        allLogs.push(`=== Nodo ${nodeId} ===`);
        allLogs.push(...result.logs);
        if (result.error) {
          allLogs.push(`❌ Error: ${result.error}`);
        }
      });

      setExecutionResult(execution);
      setExecutionLogs(allLogs);

      // Success toast
      toast.success("¡Flujo ejecutado exitosamente!", { id: "flow-execution" });

      // Call external callback if provided
      if (onExecuteCallback) {
        try {
          await onExecuteCallback({ nodes, edges });
        } catch (callbackError) {
          console.warn("External onExecute callback failed:", callbackError);
        }
      }
    } catch (error) {
      console.error("💥 Error ejecutando flujo:", error);
      setExecutionLogs((prev) => [
        ...prev,
        `💥 Error: ${error instanceof Error ? error.message : String(error)}`,
      ]);
      toast.error(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
        { id: "flow-execution" }
      );

      // Mark all nodes as error
      setNodes((prevNodes) =>
        prevNodes.map((node) => ({
          ...node,
          data: { ...node.data, executionStatus: "error" },
        }))
      );
    } finally {
      setIsExecuting(false);
    }
  }, [nodes, edges, executionEngine, isExecuting, setNodes, onExecuteCallback]);

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Handler para click en nodos con Option key
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (event.altKey) {
        // altKey es Option en Mac
        event.preventDefault();
        duplicateNode(node.id);
      }
    },
    [duplicateNode]
  );

  // Función para guardar el flujo usando React Flow best practices
  const { toObject } = useReactFlow();

  const saveFlow = useCallback(() => {
    const flow = toObject();
    localStorage.setItem("ai-flow-canvas-state", JSON.stringify(flow));
    setLastSavedState(JSON.stringify(flow));
    setHasUnsavedChanges(false);

    // Call external callback if provided
    if (onSaveCallback) {
      onSaveCallback(flow);
    }

    toast.success("Flujo guardado exitosamente! 💾");
  }, [toObject, onSaveCallback]);

  // Detectar cambios en el flujo (solo después de cargar)
  useEffect(() => {
    if (!isLoaded || !lastSavedState) return;

    const currentState = JSON.stringify(toObject());
    const hasChanges = currentState !== lastSavedState;
    setHasUnsavedChanges(hasChanges);
  }, [nodes, edges, lastSavedState, toObject, isLoaded]);

  // Alerta de salida sin guardar (solo si hay cambios)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue =
          "¿Estás seguro de que quieres salir? Hay cambios sin guardar.";
        return event.returnValue;
      }
      // Si no hay cambios, permitir salida sin alerta
    };

    const handlePopState = () => {
      if (hasUnsavedChanges) {
        const confirm = window.confirm(
          "¿Estás seguro de que quieres salir? Hay cambios sin guardar."
        );
        if (!confirm) {
          window.history.pushState(null, "", window.location.href);
        }
      }
      // Si no hay cambios, permitir navegación sin alerta
    };

    // Solo agregar listeners si hay cambios sin guardar
    if (hasUnsavedChanges) {
      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("popstate", handlePopState);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);

  // Cargar estado guardado al inicio usando React Flow format
  useEffect(() => {
    const savedFlow = localStorage.getItem("ai-flow-canvas-state");
    if (savedFlow) {
      try {
        const flow = JSON.parse(savedFlow);
        if (flow.nodes && flow.edges) {
          setNodes(flow.nodes);
          setEdges(flow.edges);
          setLastSavedState(savedFlow);
        }
      } catch (error) {
        console.warn("Error cargando flujo guardado:", error);
      }
    } else {
      // Si no hay estado guardado, usar inicial y marcarlo como guardado
      const initialState = JSON.stringify({
        nodes: initialNodes,
        edges: initialEdges,
      });
      setLastSavedState(initialState);
    }
    setIsLoaded(true);
  }, [setNodes, setEdges]);

  // Atajo de teclado Cmd+S / Ctrl+S para guardar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+S en Mac o Ctrl+S en Windows/Linux
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault(); // Prevenir el save del navegador

        // Solo guardar si hay cambios
        if (hasUnsavedChanges) {
          saveFlow();
        } else {
          toast("No hay cambios para guardar", {
            icon: "💾",
            style: {
              background: "#f3f4f6",
              color: "#6b7280",
            },
          });
        }
      }
    };

    // Agregar event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasUnsavedChanges, saveFlow]);

  return (
    <div className="flex w-screen h-screen bg-gray-50">
      {/* Nueva Barra de Herramientas en Español - Estilo Flowise */}
      <BarraDeHerramientas
        isExecuting={isExecuting}
        onExecuteFlow={executeFlow}
        onShowGlobalSettings={() => setShowGlobalSettings(true)}
        onDragStart={onDragStart}
        executionResult={executionResult}
        executionLogs={executionLogs}
      />

      {/* Main Canvas */}
      <div
        className="flex-1 react-flow-container"
        ref={reactFlowWrapper}
        style={{ width: "calc(100vw - 288px)", height: "100vh" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={customNodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          fitView
          snapToGrid={true}
          snapGrid={[16, 16]}
          connectionMode={ConnectionMode.Strict}
          defaultEdgeOptions={{ type: "smoothstep", animated: true }}
          style={{ width: "100%", height: "100%" }}
          fitViewOptions={{ padding: 0.1 }}
        >
          <Controls
            className="bg-white shadow-2xl border border-gray-200 rounded-3xl backdrop-blur-sm"
            showZoom={true}
            showFitView={true}
            showInteractive={true}
          />
          <MiniMap
            className="bg-white/90 border border-gray-200 rounded-3xl shadow-2xl backdrop-blur-sm"
            nodeColor={(node) => {
              switch (node.type) {
                case "input":
                  return "#3b82f6";
                case "agent":
                  return "#f59e0b";
                case "output":
                  return "#10b981";
                case "prompt":
                  return "#8b5cf6";
                case "function":
                  return "#ef4444";
                default:
                  return "#6b7280";
              }
            }}
            maskColor="rgba(139, 92, 246, 0.1)"
            pannable={true}
            zoomable={true}
          />
          <Background
            variant={BackgroundVariant.Dots}
            gap={16}
            size={1.5}
            color="#e5e7eb"
          />

          {/* Panel superior derecho con botones */}
          <Panel position="top-right">
            <div className="flex items-center gap-3">
              {/* Botón Guardar */}
              <button
                data-save-btn
                className={`px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all hover:shadow-lg ${
                  hasUnsavedChanges
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
                onClick={saveFlow}
                disabled={!hasUnsavedChanges}
                title={
                  hasUnsavedChanges
                    ? "Guardar cambios (Cmd+S / Ctrl+S)"
                    : "No hay cambios para guardar"
                }
              >
                <FiSave size={16} />
                Guardar
              </button>

              {/* Botón Exportar */}
              <button
                className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all hover:shadow-lg"
                onClick={() => {
                  FlowExporter.downloadFlow(nodes, edges, 'yaml', `flow-${new Date().toISOString().split('T')[0]}.yaml`);
                  toast.success('Flow exported successfully!');
                }}
              >
                <FiSave size={16} />
                Exportar
              </button>

              {/* Botón Importar */}
              <label className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all hover:shadow-lg cursor-pointer">
                <FiFileText size={16} />
                Importar
                <input
                  type="file"
                  accept=".yaml,.yml,.json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const { nodes: importedNodes, edges: importedEdges } = await FlowExporter.loadFlowFromFile(file);
                        setNodes(importedNodes);
                        setEdges(importedEdges);
                        toast.success('Flow imported successfully!');
                      } catch (error) {
                        toast.error('Failed to import flow');
                      }
                    }
                  }}
                />
              </label>

              {/* Botón Ejecutar */}
              <button
                data-panel-execute-btn
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all hover:shadow-lg"
                onClick={executeFlow}
                disabled={isExecuting}
              >
                <FiPlay size={16} />
                {isExecuting ? "Ejecutando..." : "Ejecutar"}
              </button>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Global Settings Modal */}
      <GlobalSettings
        isOpen={showGlobalSettings}
        onClose={() => setShowGlobalSettings(false)}
        globalConfig={globalConfig}
        onSave={saveGlobalConfig}
      />

      {/* Toast notifications handled by AIFlowCanvas 
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#333",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "500",
            padding: "12px 16px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
        }}
      /> */}

      {/* Chat Popup - Flowise Style */}
      <ChatPopup
        workflowId="current"
        onOpenChange={(isOpen) => {
          // Optional: Handle chat state changes
          console.log('Chat is now:', isOpen ? 'open' : 'closed');
        }}
      />
    </div>
  );
}

interface AppProps {
  onSave?: (flowData: any) => void;
  onExecute?: (flowData: any) => Promise<any>;
  readonly?: boolean;
}

function App({ onSave, onExecute, readonly }: AppProps) {
  return (
    <ReactFlowProvider>
      <WorkflowExecutionProvider>
        <FlowCanvas onSave={onSave} onExecute={onExecute} readonly={readonly} />
      </WorkflowExecutionProvider>
    </ReactFlowProvider>
  );
}

export default App;

/**
 * Barra de Herramientas - formmy-actions
 * Basada en Flowise AddNodes.jsx con arquitectura española
 * Siguiendo exactamente los patrones de Flowise
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../i18n';
import SelectorDeIdioma from './SelectorDeIdioma';
import {
  FiSearch,
  FiPlus,
  FiMinus,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiZap,
  FiPlay,
  FiSettings,
  FiSave,
  FiDownload,
  FiUpload,
  FiMessageCircle,
  FiCpu,
  FiDatabase,
  FiCode,
  FiGlobe,
  FiTool,
  FiStar
} from 'react-icons/fi';
import { TbRobot } from 'react-icons/tb';

interface BarraDeHerramientasProps {
  isExecuting: boolean;
  onExecuteFlow: () => void;
  onShowGlobalSettings: () => void;
  onDragStart: (event: React.DragEvent, nodeType: string, framework?: string, componentInfo?: any) => void;
  executionResult?: any;
  executionLogs?: string[];
}

// Estructura de nodos siguiendo patrón Flowise
const categoriesES = {
  'flujo-control': {
    name: 'Control de Flujo',
    icon: FiPlay,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    expanded: true,
    nodes: [
      {
        id: 'start',
        name: 'Inicio',
        description: 'Punto de inicio del flujo de trabajo',
        icon: '▶️',
        framework: 'core'
      },
      {
        id: 'chat',
        name: 'Chat',
        description: 'Interfaz de conversación interactiva',
        icon: '💬',
        framework: 'core'
      }
    ]
  },
  'agentes-ia': {
    name: 'Agentes IA',
    icon: TbRobot,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    expanded: false,
    nodes: [
      {
        id: 'react-agent',
        name: 'Agente ReAct',
        description: 'Razonamiento y acción para tareas complejas',
        icon: '🤖',
        framework: 'agents'
      },
      {
        id: 'conversational-agent',
        name: 'Agente Conversacional',
        description: 'Conversación natural con memoria',
        icon: '💭',
        framework: 'agents'
      },
      {
        id: 'workflow-generator',
        name: 'Generador de Flujos',
        description: 'Genera flujos desde lenguaje natural',
        icon: '⚡',
        framework: 'agents'
      }
    ]
  },
  'frameworks': {
    name: 'Frameworks IA',
    icon: FiCpu,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    expanded: false,
    nodes: []
  },
  'herramientas': {
    name: 'Herramientas',
    icon: FiTool,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    expanded: false,
    nodes: [
      {
        id: 'input',
        name: 'Entrada de Texto',
        description: 'Captura entrada del usuario',
        icon: '📝',
        framework: 'core'
      },
      {
        id: 'output',
        name: 'Salida',
        description: 'Muestra resultados del procesamiento',
        icon: '📄',
        framework: 'core'
      },
      {
        id: 'ffmpeg',
        name: 'FFmpeg Video',
        description: 'Procesamiento de video con FFmpeg',
        icon: '🎬',
        framework: 'tools'
      }
    ]
  }
};

// Tabs principales siguiendo patrón Flowise
const tabsES = [
  {
    id: 0,
    name: 'Todos',
    icon: FiStar,
    color: 'text-gray-600'
  },
  {
    id: 1,
    name: 'Agentes',
    icon: TbRobot,
    color: 'text-purple-600'
  },
  {
    id: 2,
    name: 'Herramientas',
    icon: FiTool,
    color: 'text-orange-600'
  }
];

export default function BarraDeHerramientas({
  isExecuting,
  onExecuteFlow,
  onShowGlobalSettings,
  onDragStart,
  executionResult,
  executionLogs
}: BarraDeHerramientasProps) {
  const { t } = useTranslation();

  // Estados siguiendo patrón Flowise
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'flujo-control': true,
    'agentes-ia': false,
    'frameworks': false,
    'herramientas': false
  });
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Filtrar nodos basado en búsqueda y tab activo
  const getFilteredNodes = () => {
    let filteredCategories = { ...categoriesES };

    // Filtrar por tab
    if (activeTab === 1) { // Solo Agentes
      filteredCategories = {
        'agentes-ia': categoriesES['agentes-ia']
      };
    } else if (activeTab === 2) { // Solo Herramientas
      filteredCategories = {
        'herramientas': categoriesES['herramientas'],
        'flujo-control': categoriesES['flujo-control']
      };
    }

    // Filtrar por búsqueda
    if (searchValue) {
      Object.keys(filteredCategories).forEach(categoryId => {
        filteredCategories[categoryId].nodes = filteredCategories[categoryId].nodes.filter(node =>
          node.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          node.description.toLowerCase().includes(searchValue.toLowerCase())
        );
      });
    }

    return filteredCategories;
  };

  // Toggle categoría expandida
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Handle drag start - siguiendo patrón Flowise
  const handleDragStart = (event: React.DragEvent, nodeType: string, framework: string) => {
    onDragStart(event, nodeType, framework);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">

      {/* Header - Estilo Flowise */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FiStar className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">formmy-actions</h1>
              <p className="text-xs text-gray-500">Constructor Visual de Flujos IA</p>
            </div>
          </div>
        </div>

        {/* Botones de Acción Principal */}
        <div className="space-y-2">
          <button
            onClick={onExecuteFlow}
            disabled={isExecuting}
            className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
              isExecuting
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl'
            }`}
            data-execute-btn
          >
            {isExecuting ? (
              <>
                <FiZap className="animate-spin" size={16} />
                Ejecutando Flujo...
              </>
            ) : (
              <>
                <FiPlay size={16} />
                Ejecutar Flujo
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onShowGlobalSettings}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1 text-sm"
            >
              <FiSettings size={14} />
              Config
            </button>
            <button
              onClick={() => setShowExecutionPanel(!showExecutionPanel)}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1 text-sm"
            >
              <FiDatabase size={14} />
              Logs
            </button>
          </div>
        </div>
      </div>

      {/* Panel de Ejecución */}
      {showExecutionPanel && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-3">
            {executionResult && (
              <div className="text-xs">
                <div className="font-medium text-gray-700 mb-1">Último Resultado:</div>
                <div className="bg-white p-2 rounded border text-gray-600 max-h-20 overflow-y-auto">
                  {JSON.stringify(executionResult, null, 2)}
                </div>
              </div>
            )}

            {executionLogs && executionLogs.length > 0 && (
              <div className="text-xs">
                <div className="font-medium text-gray-700 mb-1">Logs de Ejecución:</div>
                <div className="bg-gray-900 text-green-400 p-2 rounded font-mono max-h-32 overflow-y-auto space-y-1">
                  {executionLogs.map((log, index) => (
                    <div key={index}>{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs - Estilo Flowise */}
      <div className="px-6 pt-4 border-b border-gray-200">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {tabsES.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon size={14} className={tab.color} />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Búsqueda - Estilo Flowise */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Buscar nodos..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Lista de Nodos - Accordion Style Flowise */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef} data-sidebar>
        <div className="px-4 pb-4">
          {Object.entries(getFilteredNodes()).map(([categoryId, category]) => {
            if (category.nodes.length === 0) return null;

            const CategoryIcon = category.icon;
            const isExpanded = expandedCategories[categoryId];

            return (
              <div key={categoryId} className="mb-3">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(categoryId)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                    isExpanded
                      ? `${category.bgColor} border border-gray-200`
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CategoryIcon className={category.color} size={18} />
                    <span className="font-medium text-gray-800 text-sm">{category.name}</span>
                  </div>
                  {isExpanded ? (
                    <FiChevronDown className="text-gray-400" size={16} />
                  ) : (
                    <FiChevronRight className="text-gray-400" size={16} />
                  )}
                </button>

                {/* Category Nodes */}
                {isExpanded && (
                  <div className="mt-2 space-y-1">
                    {category.nodes.map((node) => (
                      <div
                        key={node.id}
                        draggable
                        onDragStart={(event) => handleDragStart(event, node.id, node.framework)}
                        className="flex items-center gap-3 p-3 ml-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
                        data-node-item
                      >
                        <div className="text-lg">{node.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800 text-sm group-hover:text-blue-600 transition-colors">
                            {node.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {node.description}
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <FiPlus className="text-blue-500" size={14} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
        {/* Selector de Idioma */}
        <div className="flex justify-center">
          <SelectorDeIdioma />
        </div>

        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">
            🤖 Desarrollado con ❤️ por Fixter.org
          </div>
          <div className="text-xs text-gray-400">
            Arquitectura Flowise v2 • En Mexicano 🇲🇽
          </div>
        </div>
      </div>
    </div>
  );
}
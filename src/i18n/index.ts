/**
 * Sistema de Internacionalización - formmy-actions
 * Idioma por defecto: Español
 * Plugin-ready para agregar idiomas adicionales
 */

export type LanguageCode = 'es' | 'en';

export interface LanguagePlugin {
  code: LanguageCode;
  name: string;
  nativeName: string;
  translations: Record<string, string | Record<string, string>>;
}

// Traducciones base en mexicano (idioma por defecto)
const spanishTranslations = {
  // Navegación y UI General
  workflow: 'Flujo de Trabajo',
  start: 'Iniciar',
  execute: 'Ejecutar',
  save: 'Guardar',
  export: 'Exportar',
  import: 'Importar',
  settings: 'Configuración',
  cancel: 'Cancelar',
  delete: 'Eliminar',
  duplicate: 'Duplicar',
  edit: 'Editar',
  add: 'Agregar',
  remove: 'Quitar',

  // Estados de ejecución
  idle: 'Inactivo',
  running: 'Ejecutando',
  completed: 'Completado',
  error: 'Error',
  paused: 'Pausado',

  // StartNode
  startNode: {
    title: 'Inicio',
    description: 'Punto de inicio del flujo de trabajo',
    startAgentflow: 'Iniciar Flujo de Agentes',
    startingWorkflow: 'Iniciando Flujo de Trabajo...',
    configuration: 'Configuración',

    inputType: 'Tipo de Entrada',
    chatInput: 'Entrada de Chat',
    chatInputDesc: 'Iniciar la conversación con entrada de chat',
    formInput: 'Entrada de Formulario',
    formInputDesc: 'Iniciar el flujo de trabajo con formularios',

    formTitle: 'Título del Formulario',
    formTitlePlaceholder: 'Por favor Complete el Formulario',
    formDescription: 'Descripción del Formulario',
    formDescPlaceholder: 'Complete todos los campos para continuar',
    formInputTypes: 'Tipos de Entrada del Formulario',

    flowState: 'Estado del Flujo',
    flowStateDesc: 'Estado durante la ejecución del flujo de trabajo',

    ephemeralMemory: 'Memoria Temporal',
    ephemeralMemoryDesc: 'Empezar fresco en cada ejecución sin historial de chat previo',
    persistState: 'Persistir Estado',
    persistStateDesc: 'Persistir el estado en la misma sesión',

    executionId: 'ID de Ejecución',
    flowStateVars: 'Variables de Estado del Flujo'
  },

  // ChatNode
  chatNode: {
    title: 'Interfaz de Chat',
    noMessages: 'No hay mensajes aún',
    startConversation: 'Inicia una conversación abajo',
    connectInput: 'Conecta una entrada para comenzar',
    typeMessage: 'Escribe tu mensaje...',
    connectFirst: 'Conecta una entrada primero',
    clearChat: 'Limpiar Chat',
    expand: 'Expandir',
    collapse: 'Contraer',
    workflowRunning: 'Flujo de Trabajo Ejecutándose',
    messages: 'mensajes',
    user: 'usuario',
    assistant: 'asistente',
    workflow: 'Flujo de trabajo'
  },

  // AgentNodes
  agentNodes: {
    reactAgent: 'Agente ReAct',
    conversationalAgent: 'Agente Conversacional',
    workflowGenerator: 'Generador de Flujos de Trabajo',

    taskDescription: 'Descripción de la Tarea',
    taskPlaceholder: 'Describe lo que el agente debe realizar...',
    maxIterations: 'Máximo de Iteraciones',
    executeAgent: 'Ejecutar Agente',
    executing: 'Ejecutando...',
    processing: 'Procesando...',

    message: 'Mensaje',
    messagePlaceholder: '¿Qué quieres preguntarle al agente?',
    systemMessage: 'Mensaje del Sistema',
    systemMessagePlaceholder: 'Instrucciones personalizadas para el agente...',
    lastResponse: 'Última Respuesta',

    status: 'Estado',
    result: 'Resultado'
  },

  // Sidebar
  sidebar: {
    aiAgents: 'Agentes IA',
    frameworks: 'Frameworks',
    vercelAI: 'Vercel AI',
    llamaIndex: 'LlamaIndex',
    custom: 'Personalizado',

    executeFlow: 'Ejecutar Flujo',
    executionResult: 'Resultado de Ejecución',
    executionLogs: 'Logs de Ejecución',
    globalSettings: 'Configuración Global'
  },

  // Mensajes del sistema
  system: {
    workflowSaved: 'Flujo de trabajo guardado exitosamente! 💾',
    workflowExecuted: '¡Flujo ejecutado exitosamente!',
    executingFlow: 'Ejecutando flujo...',
    noChangesToSave: 'No hay cambios para guardar',
    unsavedChanges: '¿Estás seguro de que quieres salir? Hay cambios sin guardar.',

    flowExported: '¡Flujo exportado exitosamente!',
    flowImported: '¡Flujo importado exitosamente!',
    failedToImport: 'Error al importar flujo',

    executionFailed: 'Error en la ejecución',
    nodeExecutionFailed: 'Error al ejecutar el nodo'
  },

  // Tipos de formulario
  formTypes: {
    string: 'Texto',
    number: 'Número',
    boolean: 'Verdadero/Falso',
    options: 'Opciones',

    label: 'Etiqueta',
    labelPlaceholder: 'Etiqueta para la entrada',
    variableName: 'Nombre de Variable',
    variableNamePlaceholder: 'Nombre de variable (camelCase)',
    variableNameDesc: 'El nombre de variable debe estar en camelCase. Por ejemplo: nombre, apellido, etc.'
  }
};

// Sistema de plugins de idioma
class I18nSystem {
  private currentLanguage: LanguageCode = 'es';
  private languages: Map<LanguageCode, LanguagePlugin> = new Map();

  constructor() {
    // Registrar mexicano como idioma por defecto
    this.registerLanguage({
      code: 'es',
      name: 'Mexicano',
      nativeName: 'Mexicano',
      translations: spanishTranslations
    });
  }

  // Registrar un nuevo plugin de idioma
  registerLanguage(plugin: LanguagePlugin) {
    this.languages.set(plugin.code, plugin);
  }

  // Cambiar idioma actual
  setLanguage(code: LanguageCode) {
    if (this.languages.has(code)) {
      this.currentLanguage = code;
    }
  }

  // Obtener idioma actual
  getCurrentLanguage(): LanguageCode {
    return this.currentLanguage;
  }

  // Obtener idiomas disponibles
  getAvailableLanguages(): LanguagePlugin[] {
    return Array.from(this.languages.values());
  }

  // Función de traducción principal
  t(key: string, params?: Record<string, string>): string {
    const currentPlugin = this.languages.get(this.currentLanguage);
    if (!currentPlugin) return key;

    const keys = key.split('.');
    let translation: any = currentPlugin.translations;

    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        return key; // Devolver la clave si no se encuentra la traducción
      }
    }

    if (typeof translation === 'string') {
      // Reemplazar parámetros si se proporcionan
      if (params) {
        return Object.keys(params).reduce((result, param) => {
          return result.replace(new RegExp(`\\{\\{${param}\\}\\}`, 'g'), params[param]);
        }, translation);
      }
      return translation;
    }

    return key;
  }
}

// Instancia global del sistema i18n
export const i18n = new I18nSystem();

// Hook para usar en componentes React
import { useState, useEffect } from 'react';

export function useTranslation() {
  const [, setForceUpdate] = useState({});

  const forceUpdate = () => setForceUpdate({});

  return {
    t: i18n.t.bind(i18n),
    currentLanguage: i18n.getCurrentLanguage(),
    availableLanguages: i18n.getAvailableLanguages(),
    setLanguage: (code: LanguageCode) => {
      i18n.setLanguage(code);
      forceUpdate();
    },
    registerLanguage: i18n.registerLanguage.bind(i18n)
  };
}
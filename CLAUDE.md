# formmy-actions - Visual AI Workflow Builder

## 🚀 Estado del Proyecto: PRODUCTION READY ✅

**formmy-actions** es un componente React embebible para construcción de flujos de trabajo AI visuales. **Desarrollado originalmente para [formmy.app](https://formmy.app), ahora disponible como librería independiente en npm**.

### 📦 NPM Package Information
- **Package**: `formmy-actions@1.0.4`
- **NPM URL**: https://www.npmjs.com/package/formmy-actions
- **Install**: `npm install formmy-actions`
- **Status**: ✅ PUBLISHED & READY

### 🏗️ Arquitectura Distribuida

**IMPORTANTE**: Este sistema está diseñado como una **librería de componentes distribuidos**:
- ✅ **Autocontenidos**: Cada componente funciona independientemente
- ✅ **Embebible**: Se integra en cualquier aplicación React
- ✅ **NPM Package**: Disponible como `formmy-actions@1.0.4`
- ✅ **Microservicios**: Compatible con arquitecturas distribuidas

### 🔓 **NUEVO: No Vendor Lock-in Philosophy**

**VALOR FUNDAMENTAL**: Cada función que desarrollamos se diseña con representación visual y puede ser usada por múltiples frameworks AI:

- 🎯 **Multi-Framework Support**: Vercel AI, LlamaIndex, LangChain y futuros frameworks
- 🔧 **Function = Visual Tool**: Cada función tiene su representación visual drag-and-drop
- 🔄 **Interoperabilidad**: Mezcla herramientas de diferentes frameworks en un solo workflow
- 📊 **Estándares Abiertos**: Export/import en formato YAML compatible con la comunidad
- 🚀 **Futuro-Proof**: Nuevos frameworks se integran sin romper workflows existentes

## 🏗️ **REGLA FUNDAMENTAL: Arquitectura Flowise v2**

**NO REINVENTAMOS LA RUEDA**: Seguimos estrictamente las arquitecturas probadas de Flowise:

- 🎯 **Flowise Agents v2/v3**: Base arquitectónica para todos los agentes y workflows
- 🔧 **Patrones Flowise**: UI, estados, configuración y ejecución siguen los patrones de Flowise
- 🎨 **Componentes Flowise**: Adaptamos componentes existentes, no creamos desde cero
- 📊 **Estado Global Flowise**: Sistema de estado global inspirado en Flowise workflows
- 🚀 **Evolución No Revolución**: Mejoramos sobre Flowise, no reemplazamos

### 🎨 **Sistema Multi-Framework con Tabs**
- **Tab "Vercel AI"**: OpenAI, Anthropic, Google Gemini tools
- **Tab "LlamaIndex"**: Multi-Agent workflows, RAG pipelines, Code interpreter, Web tools
- **Tab "Custom"**: Herramientas específicas como FFmpeg, Storage, etc.
- **Ejecución unificada**: Un solo botón ejecuta workflows que mezclan frameworks

## 🎯 FASE 1 COMPLETADA ✅

### ✅ Core Functionality Working
- **Input → Agent → Output** workflow completamente funcional
- **Integración OpenAI** con respuestas reales de la API
- **Sistema de ejecución** con ExecutionEngine y VercelAIExecutor
- **Save/load automático** con localStorage y Cmd/Ctrl+S
- **UI profesional** con conexiones visuales React Flow

### 🎨 OutputNode Rediseñado  
- **UX moderna** estilo ChatGPT/Claude (320-500px width)
- **Texto legible** (14px en lugar de 12px microscópico)
- **Layout profesional** con cards, headers con iconos gradientes
- **Estados claros** (loading, error, success con animaciones)
- **Detalles expandibles** para metadata y logs

### ✨ **NUEVO: Sistema de Estilos Moderno v1.1**
- **tailwind-merge + clsx**: Resolución automática de conflictos de clases
- **Data attributes**: Targeting preciso para customización (`[data-execute-btn]`, `[data-sidebar]`, etc.)
- **Una sola prop `className`**: Reemplaza múltiples props específicas
- **Estándar shadcn/ui**: Compatibilidad total con el ecosistema actual
- **Beta badge inline**: Movido junto al título, más sutil y professional

### 🔧 **ACTUALIZADO: Base Técnica Multi-Framework**
- **ExecutorRegistry**: Registry central para todos los frameworks AI
- **ExecutorFramework**: Interfaz común para Vercel AI, LlamaIndex, LangChain
- **FrameworkSidebar**: UI con tabs que carga tools dinámicamente
- **Streaming Support**: Real-time updates especialmente para LlamaIndex workflows
- **Tool Validation**: Validación específica por framework y herramienta
- **TypeScript** completo con tipos unificados
- **Error handling** robusto por framework

## 🚀 Uso del Package

### Instalación
```bash
npm install formmy-actions
```

### Uso Básico
```tsx
import { AIFlowCanvas } from 'formmy-actions';
import 'formmy-actions/style.css'; // Requerido

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <AIFlowCanvas />
    </div>
  );
}
```

### Configuración Avanzada
```tsx
<AIFlowCanvas 
  apiKeys={{
    openai: 'your-openai-api-key'
  }}
  onSave={(flowData) => {
    console.log('Flow saved:', flowData);
  }}
  onExecute={(flowData) => {
    console.log('Flow executed:', flowData);
  }}
  readonly={false}
  showToaster={true}  // Control notificaciones toast
/>
```

### 🎨 Customización de Estilos (v1.1)
```tsx
{/* Botón ejecutar en púrpura */}
<AIFlowCanvas 
  className="[&_[data-execute-btn]]:bg-purple-500 [&_[data-execute-btn]:hover]:bg-purple-600"
  apiKeys={{ openai: 'your-key' }}
/>

{/* Sidebar oscuro */}
<AIFlowCanvas 
  className="[&_[data-sidebar]]:bg-gray-900 [&_[data-sidebar]]:text-white"
  apiKeys={{ openai: 'your-key' }}
/>

{/* Múltiples customizaciones */}
<AIFlowCanvas 
  className="[&_[data-execute-btn]]:bg-red-500 [&_[data-node-item]]:border-blue-500 [&_[data-save-btn]]:bg-orange-500"
  apiKeys={{ openai: 'your-key' }}
/>
```

## ⚡ Sistema de Ejecución Runtime

### Ejecutores Disponibles
1. **Vercel AI SDK**: Para LLMs y generación de texto ✅
2. **TypeScript**: Para lógica custom y transformaciones ✅
3. **LangChain.js**: Para chains complejos (pendiente)

### Ejemplo de Ejecución
```typescript
const engine = new ExecutionEngine();

// Registrar ejecutores
engine.registerExecutor(new VercelAIExecutor());
engine.registerExecutor(new TypeScriptExecutor());

// Ejecutar workflow completo
const result = await engine.executeFlow('my-flow', nodes, edges, inputs);
```

## 🎨 UI y Canvas

### Sidebar Dinámica
- **Componentes Built-in**: Entrada, Agente IA, Resultado ✅
- **Categorización**: Por tipo de nodo
- **Drag & Drop**: Funcional

### Canvas Interactivo  
- **Drag & Drop**: Arrastrar componentes al canvas ✅
- **Conexiones**: Conectar inputs/outputs visualmente ✅
- **Ejecución**: Botón "Ejecutar Flujo" para run completo ✅
- **Save/Load**: Ctrl/Cmd+S para guardar ✅

## 🎯 **ACTUALIZADA: FASE 2 COMPLETADA ✅**

### ✅ **Multi-Framework Architecture - COMPLETADO**
```
⭐ PRIORIDAD: ALTA → ✅ COMPLETADO
🎯 IMPACTO: No Vendor Lock-in achieved

Tareas Completadas:
- [x] ExecutorFramework interface con soporte multi-framework
- [x] ExecutorRegistry para gestionar múltiples frameworks
- [x] FrameworkSidebar con tabs dinámicas
- [x] VercelAIExecutor refactorizado para nueva arquitectura
- [x] LlamaIndexExecutor con 10+ herramientas y streaming
- [x] Sistema de validación por framework
- [x] OutputNode con soporte para videos
```

### ✅ **Tool Ecosystem Expansion - COMPLETADO**
```
⭐ PRIORIDAD: ALTA → ✅ COMPLETADO  
🎯 IMPACTO: Huge tool library available

LlamaIndex Tools Implementadas:
- [x] Multi-Agent Workflows con handoffs
- [x] Natural Language Workflows  
- [x] RAG Pipelines con vector search
- [x] Code Interpreter (Python/JS)
- [x] Wikipedia, Web Scraper, Google Drive, Notion tools
- [x] Vector Store y Document Loader
- [x] Streaming real-time con event system
```

## 🎯 **ACTUALIZADA: FASE 3 COMPLETADA ✅**

### ✅ **RAG Visual Integration - COMPLETADO** 
```
⭐ PRIORIDAD: CRÍTICA → ✅ COMPLETADO
🎯 IMPACTO: RAG nodes now fully visual and functional

Tareas Completadas:
- [x] Integrated RAG components into React Flow interface
- [x] Fixed node type mapping between LlamaIndexExecutor and customNodeTypes  
- [x] RAG nodes now appear with proper styling, handlers, and edges
- [x] FrameworkSidebar shows 5 RAG tools in LlamaIndex tab
- [x] Full drag-and-drop functionality from sidebar to canvas
- [x] Backend-frontend integration with comprehensive APIs
```

### ✅ **Available RAG Tools in LlamaIndex Tab**
- 📄 **Document Loader** - Load documents from various sources
- 🔍 **Vector Index** - Create vector embeddings and index  
- ❓ **Vector Query** - Query vector index for relevant documents
- 🔄 **Workflow Node** - Orchestrate complex multi-step workflows
- 🤖 **Multi-Agent System** - Coordinate multiple specialized agents

## 🎯 **NUEVA: FASE 4 COMPLETADA ✅**

### ✅ **Agent System Integration - COMPLETADO**
```
⭐ PRIORIDAD: CRÍTICA → ✅ COMPLETADO
🎯 IMPACTO: Intelligent agent workflows now available

Tareas Completadas:
- [x] AgentFlow v2 Generator extraído de Flowise
- [x] ReAct Agent adaptado con streaming support
- [x] Conversational Agent con memoria persistente
- [x] AgentExecutor integrado con ExecutorFramework
- [x] Sistema de generación automática de workflows
- [x] Arquitectura híbrida Flowise + formmy-actions
```

### ✅ **Componentes Clave Implementados**
- 🤖 **ReAct Agent** - Reasoning + Acting para tareas complejas
- 💬 **Conversational Agent** - Conversaciones naturales con memoria
- ⚡ **Workflow Generator** - Creación automática desde lenguaje natural
- 🔄 **Streaming Support** - Updates en tiempo real
- 🧠 **Memory Management** - Contexto persistente entre interacciones

## 🎯 **NUEVA: FASE 5 COMPLETADA ✅**

### ✅ **Chat & SystemPrompt Integration - COMPLETADO**
```
⭐ PRIORIDAD: CRÍTICA → ✅ COMPLETADO
🎯 IMPACTO: Chat now fully functional with custom system prompts

Problemas Resueltos:
- [x] CRÍTICO: SystemPrompt personalizado no se usaba
- [x] Chat usaba hardcodeado "You are a helpful AI assistant."
- [x] Multiple executors causaban confusión
- [x] Logs de debugging saturaban consola
- [x] UI del chat necesitaba mejoras visuales
```

### ✅ **Soluciones Implementadas**
- 🔧 **SystemPrompt Fix** - FlowiseSimpleExecutor ahora lee `systemMessage` del nodo
- 🎨 **UI Mejorada** - Badge con hora del mensaje + texto más pequeño (`text-xs`)
- 🧹 **Chat Unificado** - Eliminado SimpleChatAgent, solo FlowiseSimpleExecutor
- 📝 **Logs Limpios** - Removidos todos los logs de debugging innecesarios
- ⚡ **Trace Ready** - AgentReasoningBubble preparado para traces de ejecución

### ✅ **Funcionalidades Nuevas**
- 💬 **SystemPrompt Personalizado** - El chat ahora usa el prompt configurado en el nodo
- 🕒 **Badge de Tiempo** - Cada mensaje muestra la hora en un badge estilizado
- 📱 **UI Responsiva** - Texto más legible y componentes mejor proporcionados
- 🔄 **Trace Preparation** - UI preparada para mostrar traces de ejecución (AgentReasoningBubble)

## 🚀 **SIGUIENTE: FASE 6 - FLOWSTATE INTEGRATION**

### 🎯 **Objetivo: FlowState Management como Flowise**
```
⭐ PRIORIDAD: ALTA
🎯 IMPACTO: State management between workflow nodes
🏆 DIFERENCIADOR: Context passing between agent executions

Tareas Planificadas:
- [ ] FlowState persistence entre ejecuciones
- [ ] Variable passing entre nodos
- [ ] Memory context management
- [ ] State visualization en UI
- [ ] Export/import de workflow state
```

## 🚀 **FASE 7 - FLOWISE NODE EXTRACTION PLAN**

### 🎯 **Objetivo: AI Agents Tab Basado en Flowise Research**

**Basado en investigación exhaustiva de 100+ nodos de Flowise, implementar versión simplificada con máximo impacto.**

## 🔥 **PLAN DE IMPLEMENTACIÓN FLOWISE NODES**

### 🚨 **PASO 0: Motor de Ejecuciones (CRÍTICO - Debe resolverse PRIMERO)**
```
⭐ PRIORIDAD: MÁXIMA - BLOCKER
🎯 PROBLEMA: Múltiples problemas en la ejecución actual
🏆 IMPACTO: Sin esto, ningún nodo funcionará correctamente

PROBLEMAS IDENTIFICADOS:
- [ ] ExecutionEngine tiene inconsistencias de estado
- [ ] AgentExecutor no se integra correctamente con ExecutorFramework
- [ ] Streaming events no se propagan correctamente
- [ ] Error handling es inconsistente entre executors
- [ ] Memory management no persiste entre ejecuciones
- [ ] Node state updates no se reflejan en UI
- [ ] Tool validation falla silenciosamente
- [ ] Async execution chains se rompen

SOLUCIONES REQUERIDAS:
- [ ] Refactor ExecutionEngine para consistencia de estado
- [ ] Unificar AgentExecutor con ExecutorFramework interface
- [ ] Implementar event system robusto para streaming
- [ ] Standardizar error propagation across all executors
- [ ] Fix memory persistence y state management
- [ ] Ensure UI updates reflect real execution state
- [ ] Add comprehensive tool validation with clear errors
- [ ] Implement proper async/await chains sin race conditions
```

### 🛠️ **PASO 0.1: Diagnóstico Completo del Motor Actual**
```
⭐ AUDIT COMPLETO DEL SISTEMA DE EJECUCIÓN

Archivos a revisar y diagnosticar:
- [ ] /src/runtime/ExecutionEngine.ts - Motor legacy
- [ ] /src/runtime/ExecutorFramework.ts - Interfaces base
- [ ] /src/runtime/ExecutorRegistry.ts - Registry central
- [ ] /src/runtime/executors/AgentExecutor.ts - Agent execution
- [ ] /src/runtime/executors/SimpleAgentExecutor.ts - Simple agents
- [ ] /src/runtime/executors/VercelAIExecutor.ts - Vercel integration
- [ ] /src/runtime/executors/LlamaIndexExecutor.ts - LlamaIndex integration

Problemas específicos a identificar:
- [ ] Race conditions en async operations
- [ ] Memory leaks en streaming
- [ ] State inconsistencies entre UI y backend
- [ ] Error swallowing sin propagation
- [ ] Missing cleanup en failed executions
```

### 🔧 **PASO 0.2: Arquitectura Motor Unificado**
```
⭐ DISEÑO DE MOTOR ROBUSTO BASADO EN FLOWISE

Patrones a implementar de Flowise:
- [ ] Unified Execution Context - Estado global consistente
- [ ] Event-Driven Architecture - Eventos claros para streaming
- [ ] Executor Chain Pattern - Ejecución secuencial robusta
- [ ] Error Recovery System - Retry logic y fallbacks
- [ ] Memory State Management - Persistencia entre ejecuciones
- [ ] Tool Validation Layer - Validación antes de execution
- [ ] Real-time UI Updates - Sincronización UI-backend
- [ ] Cancellation Support - Ability to stop ejecutions

Estructura propuesta:
/src/runtime/
├── core/
│   ├── ExecutionContext.ts      # Estado global unificado
│   ├── ExecutionOrchestrator.ts # Coordinador principal
│   ├── EventSystem.ts           # Sistema de eventos
│   └── StateManager.ts          # Gestión estado UI
├── validation/
│   ├── NodeValidator.ts         # Validación nodos
│   └── FlowValidator.ts         # Validación workflows
└── executors/
    ├── BaseExecutor.ts          # Base class común
    └── [existing executors]     # Refactored to new base
```

### 🥇 **SEMANA 1: Tools Básicos (6 nodos críticos)**
```
⭐ PRIORIDAD: CRÍTICA
🎯 IMPACTO: Agents can actually DO things
🏆 ROI: 80% del valor con 20% de la complejidad

Nodos a Implementar:
- [ ] WebBrowser       → Navegación web completa
- [ ] Calculator       → Operaciones matemáticas
- [ ] ReadFile         → Lectura de archivos
- [ ] WriteFile        → Escritura de archivos
- [ ] CurrentDateTime  → Utilidades de tiempo/fecha
- [ ] CustomFunction   → Ejecución JavaScript custom
```

### 🥈 **SEMANA 2: Agent Workflows (4 nodos AgentFlow v2)**
```
⭐ PRIORIDAD: ALTA
🎯 IMPACTO: Professional agent orchestration
🏆 DIFERENCIADOR: Unique Flowise workflow patterns

Nodos AgentFlow v2:
- [ ] HumanInput      → Human-in-the-loop (CRÍTICO)
- [ ] Condition       → Branching lógico
- [ ] ExecuteFlow     → Sub-workflows anidados
- [ ] ToolAgent       → Agent enfocado en tools
```

### 🥉 **SEMANA 3: Integration & Memory (4 nodos avanzados)**
```
⭐ PRIORIDAD: MEDIA
🎯 IMPACTO: Enterprise-ready capabilities
🏆 ESCALABILIDAD: Production-ready features

Nodos Avanzados:
- [ ] GoogleSearchAPI           → Búsqueda web
- [ ] WebScraperTool           → Extracción contenido web
- [ ] RequestsGet/Post         → HTTP calls
- [ ] ConversationSummaryBufferMemory → Memoria eficiente
```

## 📊 **TOP 10 NODOS - MÁXIMO IMPACTO**

```typescript
const topPriorityNodes = [
  // 🤖 Agents (2)
  'ToolAgent',           // Agent enfocado en herramientas
  'CustomFunction',      // JavaScript execution

  // 🔧 Tools (4)
  'WebBrowser',          // Web navigation
  'Calculator',          // Math operations
  'ReadFile',            // File reading
  'WriteFile',           // File writing

  // 🔄 Workflow (3)
  'HumanInput',          // 🔥 CRÍTICO: Human-in-the-loop
  'Condition',           // Conditional branching
  'ExecuteFlow',         // Sub-workflows

  // 🌐 Integration (1)
  'GoogleSearchAPI'      // Web search
];
```

## 🎨 **PATRONES DE SIMPLIFICACIÓN**

### **1. Consolidar Categorías**
```
Flowise: 25+ categorías → formmy: 4 categorías simplificadas

✅ "Core Agents"     → ConversationalAgent, ReActAgent, ToolAgent
✅ "Essential Tools" → Web, File, Math, API tools
✅ "Memory Systems"  → Buffer, Summary, Redis
✅ "Workflow Logic"  → Start, Condition, HumanInput
```

### **2. Defaults Inteligentes**
```typescript
// En lugar de exponer todas las configuraciones de Flowise
const simplifiedAgentConfig = {
  type: 'ConversationalAgent',
  memory: 'auto',        // Auto-select mejor memoria
  tools: 'suggested',    // Suggest herramientas relevantes
  streaming: true,       // Siempre streaming
  humanInLoop: false     // Configurable human intervention
};
```

### **3. AgentFlow v2 Pattern**
```typescript
// Implementar workflow pattern único de Flowise
const agentFlowNodes = {
  Start: 'Punto entrada workflow',
  HumanInput: 'Pausa para input humano',
  Condition: 'Branching basado en condiciones',
  ToolAgent: 'Ejecuta herramientas específicas',
  ExecuteFlow: 'Invoca sub-workflows',
  DirectReply: 'Respuesta terminal'
};
```

## 🔥 **NODO GAME-CHANGER: HumanInput**

**🏆 ÚNICO EN EL MERCADO:**
- Permite **human-in-the-loop** workflows
- **Pausa** ejecución para input humano
- **Resume** con contexto completo preservado
- **Diferenciador clave** vs competencia
- **Casos de uso**: Aprovaciones, validaciones, inputs complejos

## 🎯 **MILESTONE TARGETS**

### **PASO 0 Success Metrics (PREREQUISITO):**
- [ ] ✅ Motor de ejecución 100% confiable
- [ ] ✅ Zero race conditions en async operations
- [ ] ✅ Error handling consistente en todos los executors
- [ ] ✅ UI state sync perfecto con backend
- [ ] ✅ Memory persistence funcional
- [ ] ✅ Streaming events propagándose correctamente
- [ ] ✅ Tool validation con errores claros
- [ ] ✅ Cancellation/cleanup funcionando

## 🚨 **CRÍTICO: IMPLEMENTAR EJECUCIONES VISUALES**

**PROBLEMA ACTUAL**: Los traces de ejecución NO aparecen visualmente en los nodos como en Flowise
**IMPACTO**: Los usuarios no ven feedback visual durante ejecución de workflows

### ✅ **PROGRESO ACTUAL**:
- [x] Sistema de states implementado (idle, running, success, error)
- [x] Spinner amarillo durante ejecución en AgentNode
- [x] onNodeUpdate callback conectado a updateNodeData
- [x] Badge de feedback simplificado sin texto "visual_agent"

### 🚨 **PENDIENTES CRÍTICOS**:
- [ ] System prompt no funciona - revisar FlowiseSimpleExecutor línea 177
- [ ] Verificar que updates llegan correctamente a los nodos
- [ ] Test completo del flujo: Input → Agent → Output con traces visuales
- [ ] Debugging de la cadena: FlowiseSimpleExecutor → ChatSidebar → updateNodeData → AgentNode

**🚨 SIN ESTO COMPLETADO, NO CONTINUAR A SEMANA 1**

### **Semana 1 Success Metrics:**
- [ ] 6 herramientas básicas funcionando SOBRE motor robusto
- [ ] Agents pueden usar Calculator, Files, Web, DateTime sin errores
- [ ] CustomFunction ejecuta JavaScript arbitrary de forma confiable

### **Semana 2 Success Metrics:**
- [ ] HumanInput workflow funcional con pause/resume perfecto
- [ ] Conditional branching operativo sin state corruption
- [ ] Sub-workflows con ExecuteFlow sin memory leaks
- [ ] ToolAgent especializados con validation completa

### **Semana 3 Success Metrics:**
- [ ] GoogleSearch integrado con retry logic
- [ ] WebScraper extrayendo contenido con timeout handling
- [ ] HTTP requests funcionales con proper error propagation
- [ ] Memory management avanzado enterprise-ready

## 📈 **IMPACTO PROYECTADO**

**🎯 Con estos 14 nodos tendremos:**
- **90% funcionalidad** de Flowise agents
- **10% complejidad** de implementación
- **100% compatibilidad** con patrones Flowise
- **Único sistema** con HumanInput visual
- **Primera librería** con multi-framework + Flowise patterns

**💡 REGLAS DE ORO:**
1. **Seguir arquitecturas probadas de Flowise, no reinventar**
2. **🚨 PASO 0 ES BLOCKER - No agregar features sin motor sólido**
3. **Motor robusto primero, features después**
4. **Cada executor debe pasar integration tests antes de production**

## 🎯 **OBJETIVO FINAL - FORMMY AGENTS PLATFORM**

**🦾 Visión:** El primer sistema visual que combina:
1. **Flowise Agent Intelligence** - Poder de los agentes más avanzados
2. **formmy-actions Simplicity** - UX simplificada para usuarios finales
3. **Multi-Framework Freedom** - Sin vendor lock-in, máxima flexibilidad

**🏆 Diferenciadores Únicos:**
- ✅ **Hybrid Architecture**: Mejor de Flowise + innovations propias
- ✅ **Visual Agent Workflows**: Drag-and-drop agent orchestration
- ✅ **NPM Embeddable**: Se integra en cualquier aplicación
- ✅ **Streaming Everything**: Real-time agent execution
- 🔄 **Multi-Agent Coordination**: Agents que colaboran entre sí
- 🧠 **Persistent Memory**: Context que persiste sesiones

## 🔧 Comandos de Desarrollo

### Comandos Básicos
```bash
# Desarrollo
npm run dev                 # Servidor de desarrollo
npm run build              # Build de la app
npm run build:lib          # Build de la librería
npm run build:all          # Build completo

# NPM
npm run prepublishOnly     # Pre-publish build
npm publish                # Publicar a npm
```

## 🛠️ Desarrollo Local

### Setup
```bash
git clone https://github.com/blissito/formmy_actions.git
cd formmy_actions
npm install
npm run dev
```

### **ACTUALIZADA: Estructura del Proyecto Multi-Framework**
```
formmy-actions/
├── src/
│   ├── AIFlowCanvas.tsx              # Componente principal embebible
│   ├── CustomNodes.tsx               # Componentes de nodos (con soporte video)
│   ├── App.tsx                       # App demo
│   ├── components/
│   │   └── FrameworkSidebar.tsx      # ✅ Sidebar con tabs por framework
│   ├── runtime/
│   │   ├── ExecutorFramework.ts      # ✅ Interfaces base multi-framework
│   │   ├── ExecutorRegistry.ts       # ✅ Registry central de executores
│   │   ├── ExecutionEngine.ts        # Motor de ejecución legacy
│   │   └── executors/                # Ejecutores por framework
│   │       ├── VercelAIExecutor.ts   # ✅ Vercel AI SDK refactorizado
│   │       └── LlamaIndexExecutor.ts # ✅ LlamaIndex con streaming
│   └── services/
│       └── modelService.ts           # Servicios AI
├── dist/                             # Build output
├── package.json                      # NPM config
└── README.md                         # Documentación npm
```

## 📊 Bundle Stats
- **ES Module**: ~103KB (~24KB gzipped)
- **UMD**: ~72KB (~21KB gzipped)  
- **CSS**: ~16KB (~3KB gzipped)

## 🔗 Links Importantes

- 📦 **NPM**: https://www.npmjs.com/package/formmy-actions
- 🐙 **GitHub**: https://github.com/blissito/formmy_actions
- 🌐 **formmy.app**: https://formmy.app (origen del proyecto)
- 🏢 **Fixter.org**: https://fixter.org (desarrolladores)
- 🔍 **FlowiseChatEmbed** (referencia): `/tmp/flowise-repo/` - Repositorio clonado para referencia de componentes de chat

## 📝 Estado de Tareas

### ✅ COMPLETADAS - Fase 1
- [x] Core workflow Input → Agent → Output
- [x] OpenAI integration con API real
- [x] Sistema de ejecución robusto
- [x] Save/load con localStorage
- [x] OutputNode rediseñado profesionalmente
- [x] NPM package configurado y publicado
- [x] README completo con documentación
- [x] Build system funcionando
- [x] Repository actualizado

### 🚧 PENDIENTES - Fase 2 
- [ ] Prompt Template node
- [ ] Function node (custom logic)
- [ ] Tool integration node
- [ ] Anthropic/Claude support
- [ ] TypeScript declarations
- [ ] Testing suite

---

**🎉 MILESTONE FASE 3: formmy-actions COMPLETÓ la integración visual RAG. Los nodos RAG ahora aparecen con styling completo, handlers, edges y full funcionalidad drag-and-drop.**

## 🏆 **Logros Únicos en el Mercado:**
- 🔓 **Primera plataforma** con verdadero "No Vendor Lock-in" para AI tools
- 🎨 **Único sistema** que permite mezclar Vercel AI + LlamaIndex en un workflow
- 🚀 **15+ herramientas LlamaIndex** listas para usar visualmente (incluyendo 5 RAG tools)
- 📱 **Streaming real-time** con updates visuales en tiempo real
- 🛠️ **Function = Visual Tool** philosophy implementada
- ✅ **RAG Pipeline Visual** completamente funcional con componentes drag-and-drop

**🤖 Desarrollado con ❤️ por [Fixter.org](https://fixter.org) para [formmy.app](https://formmy.app)**
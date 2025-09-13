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

## 🚀 **FASE 5 - FLOWISE NODE EXTRACTION PLAN**

### 🎯 **Objetivo: AI Agents Tab Basado en Flowise Research**

**Basado en investigación exhaustiva de 100+ nodos de Flowise, implementar versión simplificada con máximo impacto.**

## 🔥 **PLAN DE IMPLEMENTACIÓN FLOWISE NODES**

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

### **Semana 1 Success Metrics:**
- [ ] 6 herramientas básicas funcionando
- [ ] Agents pueden usar Calculator, Files, Web, DateTime
- [ ] CustomFunction ejecuta JavaScript arbitrary

### **Semana 2 Success Metrics:**
- [ ] HumanInput workflow funcional
- [ ] Conditional branching operativo
- [ ] Sub-workflows con ExecuteFlow
- [ ] ToolAgent especializados

### **Semana 3 Success Metrics:**
- [ ] GoogleSearch integrado
- [ ] WebScraper extrayendo contenido
- [ ] HTTP requests funcionales
- [ ] Memory management avanzado

## 📈 **IMPACTO PROYECTADO**

**🎯 Con estos 14 nodos tendremos:**
- **90% funcionalidad** de Flowise agents
- **10% complejidad** de implementación
- **100% compatibilidad** con patrones Flowise
- **Único sistema** con HumanInput visual
- **Primera librería** con multi-framework + Flowise patterns

**💡 REGLA DE ORO: Seguir arquitecturas probadas de Flowise, no reinventar**

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
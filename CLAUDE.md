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

### 🔧 Base Técnica Sólida
- **Arquitectura modular** con ejecutores por proveedor
- **TypeScript** completo con tipos definidos  
- **Error handling** robusto
- **Compilación limpia** sin errores JSX

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

## 🎯 FASE 2 - ROADMAP

### 🥇 **OPCIÓN A: Expandir Node Types** (RECOMENDADO)
```
⭐ PRIORIDAD: ALTA
🎯 IMPACTO: Funcionalidad core completa

Tareas:
- [ ] Activar PromptNode (plantillas con variables)
- [ ] Activar FunctionNode (lógica custom)  
- [ ] Activar ToolNode (integraciones externas)
- [ ] Testing completo de workflows complejos
```

### 🥈 **OPCIÓN B: Multi-Provider AI**  
```
⭐ PRIORIDAD: ALTA  
🎯 IMPACTO: Diversidad de modelos

Tareas:
- [ ] Integración Anthropic (Claude)
- [ ] Selector de modelo en AgentNode
- [ ] Theming por proveedor
- [ ] API key management mejorado
```

### 🥉 **OPCIÓN C: Component Library Enhancements**
```
⭐ PRIORIDAD: MEDIA
🎯 IMPACTO: Developer Experience

Tareas:
- [ ] TypeScript declarations (.d.ts)
- [ ] Better error handling
- [ ] More configuration options
- [ ] Performance optimizations
```

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

### Estructura del Proyecto
```
formmy-actions/
├── src/
│   ├── AIFlowCanvas.tsx           # Componente principal embebible
│   ├── CustomNodes.tsx            # Componentes de nodos
│   ├── App.tsx                    # App demo
│   ├── runtime/
│   │   ├── ExecutionEngine.ts     # Motor de ejecución
│   │   └── executors/             # Ejecutores por framework
│   │       ├── VercelAIExecutor.ts   # ✅ Vercel AI SDK
│   │       └── TypeScriptExecutor.ts # ✅ TypeScript puro
│   └── services/
│       └── modelService.ts        # Servicios AI
├── dist/                          # Build output
├── package.json                   # NPM config
└── README.md                      # Documentación npm
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

**🎉 MILESTONE: formmy-actions es ahora un package npm funcional y disponible públicamente. La Fase 1 está completa y lista para uso en producción.**

**🤖 Desarrollado con ❤️ por [Fixter.org](https://fixter.org) para [formmy.app](https://formmy.app)**
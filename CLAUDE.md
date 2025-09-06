# AI Flow Canvas - Generador Auto-mejorable de Componentes

## 🚀 Descripción del Sistema

Este proyecto implementa un **generador auto-mejorable** que puede crear y mejorar componentes React Flow usando su propia tecnología. Es un sistema meta que se construye a sí mismo.

### 🏗️ Arquitectura Distribuida

**IMPORTANTE**: Este sistema está diseñado como una **librería de componentes distribuidos**:
- ✅ **Autocontenidos**: Cada componente funciona independientemente
- ✅ **Comunicación via Fetch**: Los componentes se comunican usando API calls
- ✅ **Embebibles**: Pueden integrarse en otras aplicaciones
- ✅ **Microservicios**: Cada agente/componente puede ejecutarse en servicios separados

## 🎯 Arquitectura del Generador

### 1. **Definición YAML → Componente React**
- **Input**: Archivos YAML simples con definiciones de componentes
- **Output**: Componentes React Flow completamente funcionales
- **Validación**: Sistema inteligente con loop de regeneración

### 2. **Componentes del Sistema**

```
components/                 # Definiciones YAML de componentes
├── llamaindex-vectorstore.yaml
├── langchain-chatgpt.yaml
├── custom-rag-pipeline.yaml
└── meta-generator.yaml    # ¡El generador se define a sí mismo!

src/
├── generator/
│   ├── BootstrapGenerator.ts     # Generador base
│   ├── IntelligentGenerator.ts   # Con validación y mejora
│   └── SelfImprovementWorkflow.ts # Workflow completo
├── validator/
│   └── ComponentValidator.ts     # Validación inteligente
├── runtime/
│   ├── ExecutionEngine.ts        # Motor de ejecución
│   └── executors/               # Ejecutores por framework
│       ├── VercelAIExecutor.ts   # Vercel AI SDK
│       ├── LangChainExecutor.ts  # LangChain.js
│       └── TypeScriptExecutor.ts # TypeScript puro
└── components/
    └── GeneratedComponentsSidebar.tsx # UI generada
```

## 🔄 Comandos del Generador

### Comandos Básicos
```bash
# Generación básica
npm run meta-gen bootstrap    # El generador se genera a sí mismo
npm run meta-gen generate     # Genera todos los componentes
npm run meta-gen validate     # Valida componentes generados

# Generación Inteligente (con validación y mejora)
npm run meta-gen intelligent  # Loop de validación y regeneración
npm run meta-gen improve      # Auto-mejora del generador

# Workflows Completos
npm run meta-gen all          # Bootstrap → Generate → Validate → Improve
npm run meta-gen full         # Bootstrap → Intelligent → Validate → Improve
```

### Ejemplo de Uso
```bash
# 1. Crear nuevo componente YAML
cat > components/mi-componente.yaml << EOF
name: MiComponente
framework: custom
category: processor
description: Mi componente personalizado
inputs:
  - name: input_data
    type: any
    required: true
outputs:
  - name: result
    type: any
    required: true
parameters:
  setting:
    type: string
    default: "default"
ui:
  icon: "🔧"
  color: "#6366f1"
  position: [200, 200]
EOF

# 2. Generar con validación inteligente
npm run meta-gen intelligent

# 3. El componente aparece automáticamente en la sidebar
```

## 🧠 Sistema de Validación Inteligente

### Checks Automáticos
1. **YAML Structure**: Validación de campos requeridos
2. **TypeScript Compilation**: Compilación sin errores
3. **React Component**: Estructura JSX válida
4. **React Flow Handles**: Inputs/outputs correctos
5. **Styling**: CSS y Tailwind válidos

### Loop de Regeneración
```typescript
// Hasta 3 intentos de mejora automática
while (iterations < 3 && !isValid) {
  component = generateComponent(yaml);
  validation = validateComponent(component);
  
  if (!validation.valid) {
    improvements = analyzeErrors(validation);
    yaml = applyImprovements(yaml, improvements);
  }
}
```

## ⚡ Sistema de Ejecución Runtime

### Ejecutores Disponibles
1. **Vercel AI SDK**: Para LLMs y generación de texto
2. **LangChain.js**: Para chains y pipelines complejos  
3. **TypeScript**: Para lógica custom y transformaciones

### Ejemplo de Ejecución
```typescript
const engine = new ExecutionEngine();

// Registrar ejecutores
engine.registerExecutor(new VercelAIExecutor());
engine.registerExecutor(new LangChainExecutor());
engine.registerExecutor(new TypeScriptExecutor());

// Ejecutar workflow completo
const result = await engine.executeFlow('my-flow', nodes, edges, inputs);
```

## 🎨 UI y Canvas

### Sidebar Dinámica
- **Componentes Built-in**: Entrada, Agente IA, Resultado, etc.
- **Componentes Generados**: Se cargan automáticamente desde los YAMLs
- **Categorización**: Por framework (LangChain, LlamaIndex, Custom, Meta)

### Canvas Interactivo  
- **Drag & Drop**: Arrastrar componentes al canvas
- **Conexiones**: Conectar inputs/outputs visualmente
- **Ejecución**: Botón "Ejecutar Flujo" para run completo
- **Visual**: Animaciones, colores por tipo, snap-to-grid

## 📝 Ejemplo de Componente YAML

```yaml
name: ChatOpenAI
framework: langchain
category: processor
description: OpenAI Chat model for conversational AI

inputs:
  - name: messages
    type: BaseMessage[]
    required: true
    description: Input chat messages
  - name: system_prompt
    type: string
    required: false
    description: System prompt override

outputs:
  - name: response
    type: BaseMessage
    required: true
    description: AI response message
  - name: token_usage
    type: TokenUsage
    required: false
    description: Token consumption info

parameters:
  model_name:
    type: string
    default: "gpt-3.5-turbo"
    options: ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo", "gpt-4o"]
  temperature:
    type: number
    default: 0.7
    min: 0
    max: 2
    description: Sampling temperature

ui:
  icon: "🤖"
  color: "#f59e0b"
  position: [500, 100]
```

## 🔄 Flujo Meta (Auto-mejora)

### El Ciclo Completo
1. **Bootstrap**: El generador lee su propio YAML y se genera a sí mismo
2. **Generation**: Lee otros YAMLs y genera componentes React
3. **Validation**: Valida todos los componentes generados
4. **Improvement**: Identifica mejoras y crea versiones mejoradas
5. **Repeat**: El ciclo se repite con la nueva versión

### Auto-referencia
```yaml
# meta-generator.yaml - ¡El generador se describe a sí mismo!
name: BootstrapGenerator
framework: meta
category: tool
description: Generates React Flow components from YAML definitions - the tool that builds itself!

# ... El generador usa este YAML para crear su propia representación visual
```

## 💡 Casos de Uso

### 1. Desarrollo de Pipelines AI
```bash
# Crear componentes de LlamaIndex
npm run meta-gen bootstrap
# → Aparecen en sidebar: VectorStore, QueryEngine, etc.
```

### 2. Workflows LangChain
```bash
# Generar componentes LangChain  
npm run meta-gen generate
# → Aparecen: PromptTemplate, RetrievalQA, VectorStore, etc.
```

### 3. Componentes Custom
```bash
# Crear lógica personalizada
npm run meta-gen intelligent  
# → Validación automática + mejoras
```

## 🛠️ Desarrollo

### Agregar Nuevo Framework
1. Crear ejecutor en `src/runtime/executors/`
2. Registrar en `ExecutionEngine`
3. Crear componentes YAML en `components/`
4. Ejecutar `npm run meta-gen intelligent`

### Extender Validación
1. Modificar `ComponentValidator.ts`
2. Agregar nuevos checks en `validateComponent()`
3. El sistema aplicará mejoras automáticamente

### Mejorar Generador
1. Modificar `BootstrapGenerator.ts`
2. Actualizar `meta-generator.yaml`
3. Ejecutar `npm run meta-gen improve`
4. ¡El generador se mejora usando su propia tecnología!

## 🎯 Roadmap

- [ ] Soporte para más frameworks (Haystack, Semantic Kernel)
- [ ] Editor visual de YAMLs
- [ ] Marketplace de componentes
- [ ] Ejecución distribuida
- [ ] IA generativa para crear YAMLs automáticamente
- [ ] Exportar/importar workflows completos

## 🔧 Tareas Pendientes

### Próximas Tareas de Desarrollo
- [ ] **Revisar todos los componentes existentes**: Verificar que todos los nodos (InputNode, AgentNode, OutputNode, PromptNode, FunctionNode, ToolNode) funcionen sin errores de import/export/JSX
- [ ] **Migrar componentes al SDK**: Una vez que todos estén funcionando correctamente, mutar cada componente para integrarse completamente con el sistema de ejecutores y el ExecutionEngine
- [ ] **Validar handles y conexiones**: Asegurar que cada nodo tenga los handles correctos y que las conexiones funcionen apropiadamente
- [ ] **Testing de ejecución completa**: Probar workflows end-to-end con diferentes tipos de nodos conectados

### Mejoras de Seguridad Futuras
- [ ] **Encriptación de API Keys**: Migrar el almacenamiento de API keys desde localStorage a una base de datos con encriptación AES-256
  - Actualmente las API keys se guardan en `localStorage` como texto plano
  - Implementar sistema de autenticación de usuarios
  - Encriptar API keys antes de almacenar en BD
  - Usar variables de entorno para claves de encriptación
  - Considerar integración con servicios como AWS Secrets Manager o HashiCorp Vault

---

**Este es un sistema verdaderamente meta: una herramienta que se construye y mejora a sí misma usando su propia tecnología. ¡Como Rust compilándose con Rust, pero para componentes React Flow!** 🤖✨
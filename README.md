# 🚀 AI Flow Canvas - Generador Auto-mejorable

Un generador **meta** que crea componentes React Flow usando su propia tecnología. Se auto-construye, auto-valida y auto-mejora.

![AI Flow Canvas](https://img.shields.io/badge/Status-✅%20Funcionando-success)
![Meta Level](https://img.shields.io/badge/Meta%20Level-🤖%20Auto--mejorable-purple)
![Framework](https://img.shields.io/badge/Framework-React%20Flow-blue)

## ✨ Características Principales

- **🔄 Auto-generación**: El generador se construye a sí mismo desde YAML
- **🧠 Validación Inteligente**: Loop automático de mejora con hasta 3 iteraciones
- **⚡ Ejecución Multi-runtime**: Vercel AI SDK + LangChain.js + TypeScript
- **🎨 UI Dinámica**: Componentes aparecen automáticamente en sidebar
- **📝 Definición Simple**: YAMLs fáciles → Componentes React complejos

## 🎯 Demo Rápido

```bash
# 1. Clonar y setup
git clone [repo-url]
cd ai-flow-canvas
npm install

# 2. Generar componentes con validación inteligente
npm run meta-gen intelligent

# 3. Ver el canvas
npm run dev
# → http://localhost:5174
```

## 🔧 Sistema de Generación

### YAML → Componente React
```yaml
# components/mi-componente.yaml
name: MiComponente
framework: custom
category: processor
description: Mi componente personalizado

inputs:
  - name: data
    type: any
    required: true

outputs:
  - name: result
    type: any
    required: true

ui:
  icon: "🔧"
  color: "#6366f1"
```

```bash
npm run meta-gen intelligent
# → Genera componente React con validación automática
# → Aparece en sidebar listo para drag & drop
```

## 🎨 Canvas Interactivo

<div align="center">
  <h3>🖱️ Drag & Drop</h3>
  <p>Arrastra componentes desde la paleta al canvas</p>
  
  <h3>🔗 Conexiones Visuales</h3>
  <p>Conecta inputs/outputs arrastrando entre nodos</p>
  
  <h3>▶️ Ejecución Completa</h3>
  <p>Ejecuta workflows completos con un click</p>
</div>

## 🧠 Validación Inteligente

El sistema valida automáticamente cada componente generado:

- ✅ **YAML Structure**: Campos requeridos y sintaxis
- ✅ **TypeScript**: Compilación sin errores
- ✅ **React**: Estructura JSX válida
- ✅ **Handles**: Inputs/outputs correctos
- ✅ **Styling**: CSS y Tailwind válidos

Si encuentra errores, **regenera automáticamente** hasta 3 veces con mejoras.

## 🚀 Comandos Disponibles

### Generación Básica
```bash
npm run meta-gen bootstrap    # El generador se construye a sí mismo
npm run meta-gen generate     # Genera todos los componentes
npm run meta-gen validate     # Valida componentes existentes
```

### Generación Inteligente
```bash
npm run meta-gen intelligent  # Con validación y regeneración automática
npm run meta-gen improve      # Mejora el generador usando sí mismo
```

### Workflows Completos  
```bash
npm run meta-gen all          # Workflow básico completo
npm run meta-gen full         # Workflow inteligente completo
```

## 🔄 El Ciclo Meta

1. **📝 YAML Definition**: Describes el componente en YAML simple
2. **⚡ Code Generation**: Genera código React TypeScript
3. **🔍 Intelligent Validation**: Valida estructura, compilación, React, handles
4. **🔄 Auto-improvement**: Si hay errores, mejora y regenera automáticamente  
5. **🎨 UI Integration**: Aparece automáticamente en sidebar del canvas
6. **▶️ Execution**: Listo para ejecutar en workflows reales

## 📦 Frameworks Soportados

### LangChain.js
- `ChatOpenAI` - Modelos de chat de OpenAI
- `PromptTemplate` - Templates con variables  
- `VectorStore` - Base de datos vectorial
- `RetrievalQA` - Q&A con retrieval

### LlamaIndex  
- `VectorStoreIndex` - Índices vectoriales
- `QueryEngine` - Motor de consultas
- `SimpleDirectoryReader` - Lector de documentos

### Custom/TypeScript
- `RAGPipeline` - Pipeline RAG completo
- `DataProcessor` - Procesamiento de datos
- `APICall` - Llamadas a APIs
- Cualquier lógica custom

### Meta
- `BootstrapGenerator` - ¡El generador mismo!

## 💡 Casos de Uso

### 🤖 Pipelines de IA
```bash
# Crea workflows LLM completos
Entrada → PromptTemplate → ChatOpenAI → Resultado
```

### 📚 RAG Systems  
```bash
# Sistemas de retrieval augmented generation
Documentos → VectorStore → RAGPipeline → Respuesta
```

### 🔧 Lógica Custom
```bash
# Cualquier procesamiento personalizado
Input → DataProcessor → Function → Output
```

### 🎯 Auto-mejora
```bash
# El generador mejora sus propios componentes
YAML → Bootstrap → Validation → Improvement → Better Component
```

## 🛠️ Arquitectura

```
ai-flow-canvas/
├── components/                    # 📝 Definiciones YAML
│   ├── langchain-chatgpt.yaml   # LangChain components
│   ├── llamaindex-vectorstore.yaml
│   ├── custom-rag-pipeline.yaml  # Custom components  
│   └── meta-generator.yaml       # 🤖 Self-definition
├── src/
│   ├── generator/                 # ⚡ Code generation
│   │   ├── BootstrapGenerator.ts
│   │   ├── IntelligentGenerator.ts
│   │   └── SelfImprovementWorkflow.ts
│   ├── validator/                 # 🔍 Validation
│   │   └── ComponentValidator.ts
│   ├── runtime/                   # ▶️ Execution
│   │   ├── ExecutionEngine.ts
│   │   └── executors/
│   │       ├── VercelAIExecutor.ts
│   │       ├── LangChainExecutor.ts
│   │       └── TypeScriptExecutor.ts
│   └── components/                # 🎨 UI
│       ├── GeneratedComponentsSidebar.tsx
│       └── generated/             # Generated components appear here
└── CLAUDE.md                     # 📚 Documentación completa
```

## 🚦 Getting Started

### Prerequisitos
- Node.js 18+
- npm o yarn

### Instalación
```bash
# 1. Clonar repositorio
git clone [repo-url]
cd ai-flow-canvas

# 2. Instalar dependencias
npm install

# 3. Generar componentes iniciales
npm run meta-gen intelligent

# 4. Iniciar desarrollo
npm run dev
```

### Crear Tu Primer Componente
```bash
# 1. Crear YAML
cat > components/mi-primer-componente.yaml << EOF
name: MiPrimerComponente
framework: custom  
category: processor
description: Mi primer componente generado

inputs:
  - name: input_text
    type: string
    required: true

outputs:
  - name: processed_text
    type: string
    required: true

parameters:
  prefix:
    type: string
    default: "Procesado: "

ui:
  icon: "🎉"
  color: "#10b981"
  position: [200, 100]
EOF

# 2. Generar con validación
npm run meta-gen intelligent

# 3. ¡Ya está disponible en el canvas!
```

## 🤝 Contribuir

### Agregar Nuevo Framework
1. Crear ejecutor en `src/runtime/executors/NuevoFrameworkExecutor.ts`
2. Registrar en `ExecutionEngine` 
3. Crear componentes YAML en `components/`
4. Ejecutar `npm run meta-gen intelligent`

### Extender Validación
1. Modificar `ComponentValidator.ts`
2. Agregar checks en `validateComponent()`
3. El sistema aplicará mejoras automáticamente

### Mejorar el Generador
1. Editar `BootstrapGenerator.ts`
2. Actualizar `meta-generator.yaml`  
3. Ejecutar `npm run meta-gen improve`
4. ¡El generador se mejora a sí mismo!

## 📈 Roadmap

- [ ] 🎨 Editor visual de YAMLs
- [ ] 🌐 Marketplace de componentes  
- [ ] 🚀 Ejecución distribuida
- [ ] 🤖 IA generativa para crear YAMLs
- [ ] 📤 Export/import workflows
- [ ] 🔧 Más frameworks (Haystack, Semantic Kernel)

## 📄 Licencia

MIT License - ve [LICENSE](LICENSE) para detalles.

---

<div align="center">
  <h3>🤖 Un sistema verdaderamente meta</h3>
  <p><em>Una herramienta que se construye y mejora a sí misma usando su propia tecnología</em></p>
  <p><strong>Como Rust compilándose con Rust, pero para componentes React Flow</strong> ✨</p>
</div>

## 🔗 Enlaces

- 📚 [Documentación Completa](CLAUDE.md)
- 🎯 [Demo en Vivo](http://localhost:5174) (después de `npm run dev`)
- 🐛 [Reportar Bug](issues/new)
- 💡 [Solicitar Feature](issues/new)

**¡Hecho con ❤️ y mucha meta-programación!**
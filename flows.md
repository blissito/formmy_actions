# 🎬 Video Pipeline Design

## Arquitectura del Sistema de Export/Import

### 1. Export Format (YAML + Code Bundle)

```yaml
# flow-export.yaml
flow:
  id: "video-generator-v1"
  name: "Vertical Video Generator"
  version: "1.0.0"
  
  # Metadata
  meta:
    created: "2025-01-07"
    author: "formmy"
    description: "Genera videos verticales con AI"
    
  # Node Definitions
  nodes:
    - id: "input-1"
      type: "input"
      position: { x: 50, y: 100 }
      data:
        label: "Prompt del Video"
        defaultValue: "Un gato jugando"
        
    - id: "images-1"
      type: "imageGenerator"
      position: { x: 400, y: 100 }
      executor: "image-generator"
      config:
        provider: "static"  # Fase 1: imágenes pre-generadas
        images: 
          - "/assets/frame1.jpg"
          - "/assets/frame2.jpg"
          - "/assets/frame3.jpg"
        # Fase 2:
        # provider: "dalle-3"
        # count: 5
        # style: "cinematic"
        
    - id: "ffmpeg-1"
      type: "ffmpeg"
      position: { x: 750, y: 100 }
      executor: "ffmpeg-processor"
      config:
        resolution: "1080x1920"
        fps: 30
        duration: 3
        format: "mp4"
        transition: "fade"
          
    - id: "output-1"
      type: "output"
      position: { x: 1100, y: 100 }
      
  # Connections
  edges:
    - source: "input-1"
      target: "images-1"
      sourceHandle: "output"
      targetHandle: "prompt"
      
    - source: "images-1"
      target: "ffmpeg-1"
      sourceHandle: "images"
      targetHandle: "input"
      
    - source: "ffmpeg-1"
      target: "output-1"
      sourceHandle: "video"
      targetHandle: "result"
      
  # Tool Executors (el código que ejecuta cada herramienta)
  executors:
    image-generator:
      runtime: "typescript"
      code: |
        export async function execute(context) {
          const { prompt } = context.inputs;
          
          // Fase 1: Retornar imágenes estáticas
          if (context.config.provider === 'static') {
            return {
              images: context.config.images,
              metadata: { source: 'static', count: 3 }
            };
          }
          
          // Fase 2: Generar con DALL-E
          // const images = await generateWithDalle(prompt);
          // return { images, metadata: { ... } };
        }
        
    ffmpeg-processor:
      runtime: "subprocess"
      code: |
        export async function execute(context) {
          const { images } = context.inputs;
          const { commands } = context.config;
          
          // 1. Guardar imágenes temporales
          const tempDir = await createTempDir();
          for (let i = 0; i < images.length; i++) {
            await saveImage(images[i], `${tempDir}/frame${i+1}.jpg`);
          }
          
          // 2. Ejecutar FFmpeg
          const ffmpegCmd = commands.join(' ');
          const result = await exec(`cd ${tempDir} && ${ffmpegCmd}`);
          
          // 3. Retornar video
          return {
            video: `${tempDir}/output.mp4`,
            metadata: { 
              duration: images.length * 3,
              resolution: '1080x1920',
              fps: 30
            }
          };
        }
```

## 2. Sistema de Tools Modulares

```typescript
// src/tools/ToolRegistry.ts
interface Tool {
  id: string;
  name: string;
  category: 'media' | 'ai' | 'transform' | 'output';
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  executor: ToolExecutor;
  dimensions?: { width: number; height: number }; // Para evitar solapamiento
}

// Registro de Tools disponibles
const AVAILABLE_TOOLS = {
  // Media Tools
  'ffmpeg-video': {
    name: 'FFmpeg Video Creator',
    category: 'media',
    dimensions: { width: 320, height: 280 }, // Tamaño del nodo
    inputs: [
      { name: 'images', type: 'image[]' },
      { name: 'audio', type: 'audio', optional: true },
      { name: 'subtitles', type: 'srt', optional: true }
    ],
    outputs: [
      { name: 'video', type: 'video' }
    ]
  },
  
  // AI Tools
  'image-generator': {
    name: 'AI Image Generator',
    category: 'ai', 
    dimensions: { width: 300, height: 260 },
    inputs: [
      { name: 'prompt', type: 'string' },
      { name: 'style', type: 'string', optional: true }
    ],
    outputs: [
      { name: 'images', type: 'image[]' }
    ]
  },
  
  // Input/Output Tools
  'input': {
    name: 'Text Input',
    category: 'input',
    dimensions: { width: 280, height: 120 },
    inputs: [],
    outputs: [{ name: 'text', type: 'string' }]
  },
  
  'output': {
    name: 'Result Display', 
    category: 'output',
    dimensions: { width: 320, height: 400 }, // Más alto para mostrar resultados
    inputs: [{ name: 'result', type: 'any' }],
    outputs: []
  },
  
  // Subtitle Tools
  'subtitle-generator': {
    name: 'Subtitle Generator',
    category: 'transform',
    dimensions: { width: 290, height: 200 },
    inputs: [
      { name: 'text', type: 'string' },
      { name: 'timing', type: 'timing[]', optional: true }
    ],
    outputs: [
      { name: 'subtitles', type: 'srt' }
    ]
  }
};

// Layout Calculator para evitar solapamiento
class LayoutCalculator {
  static calculatePositions(nodes: Tool[]): Position[] {
    const positions: Position[] = [];
    let currentX = 50;
    let currentY = 100;
    const MARGIN_X = 50; // Margen horizontal entre nodos
    const MARGIN_Y = 50; // Margen vertical
    
    nodes.forEach((node, index) => {
      positions.push({ x: currentX, y: currentY });
      
      // Calcular siguiente posición
      currentX += (node.dimensions?.width || 280) + MARGIN_X;
      
      // Si se sale del ancho, bajar fila
      if (currentX > 1200) {
        currentX = 50;
        currentY += Math.max(...nodes.slice(0, index + 1).map(n => n.dimensions?.height || 200)) + MARGIN_Y;
      }
    });
    
    return positions;
  }
}
```

## 3. Alternativas a ASS para Subtítulos

### Opción A: SRT (Simple & Universal)
```srt
1
00:00:00,000 --> 00:00:03,000
Este es el primer subtítulo

2
00:00:03,000 --> 00:00:06,000
Y este es el segundo
```

### Opción B: WebVTT (Web-friendly)
```vtt
WEBVTT

00:00:00.000 --> 00:00:03.000
Este es el primer subtítulo

00:00:03.000 --> 00:00:06.000
<b>Con soporte para estilos HTML</b>
```

### Opción C: Burn-in con FFmpeg
```bash
# Quemar subtítulos directamente en el video
ffmpeg -i input.mp4 -vf "subtitles=subs.srt:force_style='FontSize=24,PrimaryColour=&HFFFFFF&'" output.mp4
```

## 4. Ejemplos de GitHub para Inspiración ✅

### 🎥 Video Generation Tools (2024)
- **editly**: Declarative video editing & API (https://github.com/mifi/editly)
  - Slideshow creation: `editly title:'My slideshow' img1.jpg img2.jpg`
  - Supports 4K, custom dimensions (Instagram 1:1, Story 9:16, YouTube 16:9)
  - Text overlays, custom HTML5 Canvas, GL shaders
  
- **slideshow-video**: Automated TikTok-style slideshows (https://github.com/0x464e/slideshow-video)
  - "One config fits all" approach
  - NodeJS + FFmpeg powered
  - Cross-platform with bundled binaries
  
- **videoshow**: Simple slideshow utility (https://github.com/h2non/videoshow)
  - Images → video with audio and effects
  - Pure FFmpeg integration
  
- **Creatomate examples**: Professional video rendering (https://github.com/Creatomate/video-rendering-nodejs-ffmpeg)
  - Dynamic video generation tutorial
  - Bulk rendering with JavaScript
  
- **@mmomtchev/ffmpeg**: Modern FFmpeg bindings (https://github.com/mmomtchev/ffmpeg)
  - Streams API compatible
  - Async/await support
  - Performance identical to CLI

### 📄 Subtítulos (2024 Solutions)
- **subtitle.js**: Stream-based parser (https://github.com/gsantiago/subtitle.js)
  - ✅ TypeScript support
  - ✅ SRT + WebVTT support  
  - ✅ Stream API for performance
  - ✅ Actively maintained
  
- **subsrt**: Multi-format converter (https://github.com/papnkukn/subsrt)
  - Supports: srt, vtt, sbv, lrc, smi, ssa, ass, json
  - CLI + programmatic API
  - Universal subtitle converter
  
- **srt-webvtt**: Browser-friendly converter (https://github.com/imshaikot/srt-webvtt)
  - SRT → WebVTT conversion
  - Works in HTML5/browser environment
  - Blob/File API compatible
  
- **vtt-creator**: Simple WebVTT generator (https://lmammino.github.io/vtt-creator/)
  - Focused specifically on VTT creation
  - Minimal and lightweight
  
- **AssemblyAI + Deepgram**: AI-powered transcription
  - Auto-generate subtitles from audio/video
  - Built-in SRT/WebVTT export
  - API integration examples

## 5. Pipeline Completo en YAML

```yaml
# video-pipeline.yaml  
pipeline:
  name: "TikTok Style Video Generator"
  version: "1.0.0"
  canvas:
    width: 1920    # Fullscreen width (1920px)
    height: 1080   # Fullscreen height (1080px) 
    grid: true     # Mostrar grilla para posicionamiento
    viewport: "fullscreen"  # Usar toda la pantalla disponible
  
  # Fase 1: MVP con distribución fullscreen
  phase1:
    layout: "fullscreen"   # Usar toda la pantalla
    spacing: 400           # Más espacio entre nodos
    margin: { x: 100, y: 150 }  # Márgenes desde bordes
    
    steps:
      - name: "Load Static Images"
        tool: "input-node"
        position: { x: 100, y: 200 }     # Más centrado verticalmente
        size: { width: 280, height: 120 }
        config:
          placeholder: "Describe tu video..."
          examples: ["Un gato jugando", "Paisaje de montaña", "Comida deliciosa"]
          
      - name: "Generate Images" 
        tool: "image-generator"
        position: { x: 500, y: 150 }     # x: 100 + 280 + 120 = 500
        size: { width: 320, height: 300 } # Más alto para configuración
        input: "${step[0].output}"
        config:
          provider: "static"
          count: 5
          style: "cinematic"
          resolution: "1080x1920"
          
      - name: "Create Video"
        tool: "ffmpeg-processor"
        position: { x: 950, y: 120 }     # x: 500 + 320 + 130 = 950
        size: { width: 350, height: 320 } # Más ancho para configuración FFmpeg
        input: "${step[1].output}"
        config:
          resolution: "1080x1920"
          fps: 30
          duration_per_image: 3
          transition: "fade"
          audio: "optional"
          subtitles: "optional"
          
      - name: "Display Result"
        tool: "output-display"
        position: { x: 1430, y: 100 }    # x: 950 + 350 + 130 = 1430
        size: { width: 380, height: 500 } # Más grande para mostrar preview
        input: "${step[2].output}"
        preview: "video-player"
        
  # Layout alternativo para pantallas más pequeñas
  phase1_compact:
    layout: "responsive"    # Layout que se adapta
    breakpoint: 1366        # Cambiar layout si screen < 1366px
    
    steps:
      - name: "Row 1 - Input + Images"
        position: { x: 50, y: 100 }
        tools: ["input-node", "image-generator"] 
        spacing: 350
        
      - name: "Row 2 - Video + Output" 
        position: { x: 50, y: 500 }
        tools: ["ffmpeg-processor", "output-display"]
        spacing: 400
          
  # Fase 2: AI-Powered
  phase2:
    steps:
      - name: "Enhance Prompt"
        tool: "gpt-4"
        input: "${pipeline.input.prompt}"
        config:
          system: "Transform this into 5 cinematic scene descriptions"
          
      - name: "Generate Images"
        tool: "dalle-3"
        input: "${step[0].output}"
        config:
          count: 5
          style: "cinematic vertical"
          
      - name: "Create Advanced Video"
        tool: "ffmpeg-advanced"
        input: 
          images: "${step[1].output}"
          subtitles: "${step[3].output}"
        config:
          effects: ["ken_burns", "smooth_transitions"]
          music: "auto_generate"
          
  # Fase 3: Production
  phase3:
    steps:
      - name: "Multi-format Export"
        tool: "export-manager"
        config:
          formats:
            - tiktok: "9:16 @ 60fps"
            - instagram: "9:16 @ 30fps"
            - youtube_shorts: "9:16 @ 60fps"
```

## 6. Arquitectura de Ejecución

```typescript
// Como se conectan los nodos entre sí
class PipelineExecutor {
  async execute(pipeline: Pipeline) {
    const context = new ExecutionContext();
    
    for (const step of pipeline.steps) {
      // 1. Resolver inputs (pueden venir de steps anteriores)
      const inputs = this.resolveInputs(step.input, context);
      
      // 2. Ejecutar el tool
      const tool = this.toolRegistry.get(step.tool);
      const output = await tool.execute(inputs, step.config);
      
      // 3. Guardar output para siguientes steps
      context.setStepOutput(step.name, output);
      
      // 4. Stream resultado si es necesario
      if (step.stream) {
        await this.streamOutput(output);
      }
    }
    
    return context.getFinalOutput();
  }
}
```

## 7. Roadmap de Implementación

### 🏃 Sprint 1 (2 horas)
- [ ] Crear ToolNode básico
- [ ] Implementar FFmpegTool simple
- [ ] Test con imágenes estáticas → video

### 🚀 Sprint 2 (1.5 horas)  
- [ ] Sistema de export/import YAML
- [ ] UI para configurar tools
- [ ] Preview del pipeline

### 🎯 Sprint 3 (30 min)
- [ ] Integración de subtítulos SRT
- [ ] Test completo del flujo
- [ ] Demo funcional

## Ideas para el Desayuno 🥞

1. **¿Por qué YAML?**
   - Legible para humanos
   - Fácil de versionar en git
   - Permite comentarios
   - Estándar en CI/CD

2. **¿Por qué no JSON?**
   - Menos legible
   - No soporta comentarios
   - Más verboso

3. **Tool Registry Pattern**
   - Cada tool es independiente
   - Se pueden añadir sin tocar el core
   - Versionado independiente

4. **FFmpeg vs Remotion**
   - FFmpeg: Server-side, rápido, no requiere browser
   - Remotion: React-based, más control, requiere Chrome

5. **Subtítulos: SRT wins**
   - Universal support
   - Simple format
   - FFmpeg compatible
   - No requiere librerías complejas

## 🎉 RESUMEN DE LA SESIÓN DOMINICAL

### ✅ **COMPLETADO EN 4 HORAS**

#### 🚀 **Nuevos Components Listos**
1. **FFmpegTool** - Componente completo con UI configurable
   - Resolución vertical (1080x1920, 720x1280)
   - FPS configurable (15-60)
   - Duración por imagen
   - Transiciones (fade, dissolve, wipe, slide)
   - Inputs para imágenes, audio, subtítulos

2. **ImageGeneratorTool** - Sistema AI/Static flexible
   - **Fase 1**: Imágenes estáticas para demo
   - **Fase 2**: DALL-E, Midjourney, Stable Diffusion
   - Configuración de estilo, resolución, cantidad
   - Preview de configuración

3. **FlowExporter** - Sistema completo de export/import
   - Export a YAML y JSON
   - Import desde archivos
   - Metadatos completos
   - Botones integrados en UI

#### 🏗️ **Arquitectura Técnica**
- **Ejecutores registrados** en ExecutionEngine
- **TypeScript tipado** completo
- **React Flow integrado** con nuevos nodeTypes
- **Sistema modular** - cada tool independiente
- **YAML como formato estándar** para portabilidad

#### 📚 **Research Completado**
- **5 herramientas de video** identificadas y documentadas
- **5 librerías de subtítulos** evaluadas
- **Editly** como referencia principal
- **subtitle.js** como solución de subtítulos
- **SRT format** validado como estándar

#### 🎯 **Roadmap Definido**
- **Fase 1**: MVP con imágenes estáticas ✅
- **Fase 2**: AI generation + editly integration
- **Fase 3**: Production con multi-formato

### 🍳 **PRÓXIMOS PASOS (Post-Desayuno)**
1. **Test del pipeline completo**
   - Crear flujo: Input → ImageGen → FFmpeg → Output
   - Exportar a YAML
   - Importar y ejecutar
   
2. **Integración real con editly**
   - `npm install editly`
   - Reemplazar mock con llamadas reales
   
3. **Subtítulos con subtitle.js**
   - `npm install subtitle`
   - Crear SubtitleTool component

### 🤔 **DECISIONES TÉCNICAS TOMADAS**
- **YAML > JSON**: Para legibilidad humana y comentarios
- **SRT > ASS**: Para simplicidad y compatibilidad universal
- **Editly > Remotion**: Para server-side sin browser dependency
- **Modular Tools > Monolith**: Para extensibilidad y mantenimiento

### 💡 **INSIGHTS DOMINICALES**
1. **Export/Import era más crítico** de lo pensado inicialmente
2. **GitHub 2024 ecosystem** está maduro para video automation
3. **Tool Registry pattern** permite scaling infinito
4. **YAML format** será clave para community sharing

### 🎨 **Estado Visual**
- **Canvas integrado** con nuevos tools
- **Botones Export/Import** funcionales  
- **UI profesional** estilo formmy.app
- **Iconografía consistente** con Lucide React

**🎯 Total: 7 todos completados, arquitectura sólida, roadmap claro.**
**Domingo productivo que establece las bases para el video pipeline completo.** ⚡️
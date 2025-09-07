# 🚀 formmy-actions

**Visual AI workflow builder as an embeddable React component**

[![npm version](https://img.shields.io/npm/v/formmy-actions.svg)](https://www.npmjs.com/package/formmy-actions)
[![React](https://img.shields.io/badge/React-18+-61dafb?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![React Flow](https://img.shields.io/badge/React%20Flow-12+-ff0072?style=flat&logo=react)](https://reactflow.dev/)

**An embeddable React Flow component** for building visual AI agent workflows. Originally developed for [formmy.app](https://formmy.app), now available as a standalone library.

> 🎓 **Herramienta Educativa**: Este proyecto es una herramienta de aprendizaje creada para enseñar visualmente el funcionamiento de agentes de IA. Está diseñada como un ejercicio educativo para explorar y comprender la construcción de flujos de trabajo de IA de manera visual e interactiva.

## ✨ Features

- 🎨 **Visual workflow builder** with drag & drop interface
- 🤖 **AI integration** with OpenAI support (GPT-3.5, GPT-4, etc.)
- 🔄 **Real-time execution** with live status updates  
- 💾 **Auto-save** workflows with localStorage persistence
- 🎯 **Embeddable** - drop into any React app
- 🎨 **Professional UI** with modern, responsive design

## 🚀 Installation

```bash
npm install formmy-actions
```

## 📖 Quick Start

```tsx
// Option 1: Named import (recommended)
import { AIFlowCanvas } from 'formmy-actions';
import 'formmy-actions/style.css'; // Required CSS

// Option 2: Default import
import AIFlowCanvas from 'formmy-actions';
import 'formmy-actions/style.css'; // Required CSS

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <AIFlowCanvas />
    </div>
  );
}
```

## 🎮 How to Use

1. **Add Input node** - Write your message/prompt
2. **Add Agent node** - Configure AI model (requires OpenAI API key)  
3. **Add Output node** - View AI responses
4. **Connect nodes** - Drag from output handles to input handles
5. **Execute flow** - Click "Ejecutar Flujo" button
6. **Save/Load** - Automatic save with Ctrl/Cmd+S

## ⚙️ Configuration

### Basic Usage

```tsx
import { AIFlowCanvas } from 'formmy-actions';
import 'formmy-actions/style.css';

<AIFlowCanvas />
```

### With API Keys

```tsx
<AIFlowCanvas 
  apiKeys={{
    openai: 'your-openai-api-key'
  }}
/>
```

### With Callbacks

```tsx
<AIFlowCanvas 
  apiKeys={{
    openai: process.env.REACT_APP_OPENAI_API_KEY
  }}
  onSave={(flowData) => {
    console.log('Flow saved:', flowData);
    // Save to your backend
  }}
  onExecute={(flowData) => {
    console.log('Flow executed:', flowData);
    // Handle execution result
  }}
  readonly={false}
/>
```

### Custom Styling with Tailwind

```tsx
{/* Change button colors */}
<AIFlowCanvas 
  className="[&_[data-execute-btn]]:bg-purple-500 [&_[data-execute-btn]:hover]:bg-purple-600"
  apiKeys={{ openai: 'your-key' }}
/>

{/* Change sidebar background */}
<AIFlowCanvas 
  className="[&_[data-sidebar]]:bg-gray-100 [&_[data-sidebar]]:border-gray-300"
  apiKeys={{ openai: 'your-key' }}
/>

{/* Multiple customizations */}
<AIFlowCanvas 
  className="[&_[data-execute-btn]]:bg-red-500 [&_[data-node-item]]:border-blue-500 [&_[data-save-btn]]:bg-orange-500"
  apiKeys={{ openai: 'your-key' }}
/>
```

**Available data attributes for styling:**
- `[data-sidebar]`: The left sidebar container
- `[data-execute-btn]`: The main execute button in sidebar
- `[data-save-btn]`: The save button in top panel  
- `[data-panel-execute-btn]`: The execute button in top panel
- `[data-node-item]`: Individual draggable node items

### Without Toast Notifications (for embedded use)

```tsx
<AIFlowCanvas 
  apiKeys={{
    openai: process.env.REACT_APP_OPENAI_API_KEY
  }}
  showToaster={false}
  onSave={(flowData) => {
    // Handle your own notifications
    showMyCustomNotification('Flow saved!');
  }}
/>
```

### Style Isolation (prevents CSS conflicts)

By default, formmy-actions uses isolated styles to prevent conflicts with your existing CSS. If you need additional isolation, you can also import the isolated stylesheet:

```tsx
import { AIFlowCanvas } from 'formmy-actions';
import 'formmy-actions/style.css';          // Standard styles
import 'formmy-actions/isolated.css';       // Additional isolation

<AIFlowCanvas 
  className="my-custom-wrapper"  // Your styles won't interfere
  showToaster={false}
/>
```

### Full Configuration

```tsx
<AIFlowCanvas 
  apiKeys={{
    openai: 'your-openai-api-key'
  }}
  onSave={(flowData) => {
    // Called when user saves (Ctrl/Cmd+S)
    saveToDatabase(flowData);
  }}
  onExecute={(flowData) => {
    // Called after successful execution
    return Promise.resolve();
  }}
  readonly={false}
  showToaster={true}
  className="my-flow-canvas"
  style={{ border: '1px solid #ccc' }}
/>
```

## 📋 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiKeys` | `{ openai?: string }` | `{}` | AI provider API keys |
| `onSave` | `(flowData: any) => void` | `undefined` | Called when flow is saved |
| `onExecute` | `(flowData: any) => Promise<any>` | `undefined` | Called after execution |
| `readonly` | `boolean` | `false` | Whether canvas is read-only |
| `showToaster` | `boolean` | `true` | Show toast notifications |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `React.CSSProperties` | `{}` | Inline styles |

## 🎯 Node Types

### Input Node
- Text input for prompts/messages
- Auto-expanding textarea
- Connects to Agent nodes

### Agent Node  
- AI model configuration
- OpenAI integration (GPT-3.5, GPT-4, etc.)
- Configurable temperature, tokens, etc.
- Real-time execution status

### Output Node
- Professional result display  
- Expandable details view
- Copy-to-clipboard functionality
- Execution metadata and logs

## 🔧 Requirements

- React 18+
- Modern browser with ES2020 support

## 📦 Bundle Size

- **ES Module**: ~103KB (~24KB gzipped)
- **UMD**: ~72KB (~21KB gzipped)  
- **CSS**: ~16KB (~3KB gzipped)

## 🎨 Styling

The component includes all necessary CSS. Simply import the styles:

```tsx
import 'formmy-actions/style.css';
```

**Tailwind CSS Customization**: formmy-actions uses `tailwind-merge` for seamless style overrides. Use the `className` prop with data attribute selectors to customize specific parts:

```tsx
// Purple execute button
<AIFlowCanvas className="[&_[data-execute-btn]]:bg-purple-500" />

// Dark sidebar
<AIFlowCanvas className="[&_[data-sidebar]]:bg-gray-900 [&_[data-sidebar]]:text-white" />
```

**Built-in Style Isolation**: Styles are automatically isolated and won't conflict with your app's CSS, even with aggressive CSS frameworks like Tailwind or Bootstrap.

## 🤖 AI Integration

Currently supports:
- ✅ **OpenAI** (GPT-3.5-turbo, GPT-4, GPT-4-turbo, etc.)
- 🚧 **Anthropic** (Coming in v1.1)
- 🚧 **Local models** (Coming in v1.1)

### OpenAI Setup

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Pass it via props or set in the UI:

```tsx
<AIFlowCanvas 
  apiKeys={{ openai: 'sk-...' }}
/>
```

Or users can click the ⚙️ settings button to configure API keys in the UI.

## 📂 Project Structure

```
formmy-actions/
├── src/
│   ├── AIFlowCanvas.tsx    # Main component
│   ├── CustomNodes.tsx     # Node components  
│   ├── runtime/            # Execution engine
│   └── services/           # AI integrations
├── dist/                   # Built files
└── README.md
```

## 🚧 Roadmap

**v1.1 - Advanced Nodes**
- [ ] Prompt Template node
- [ ] Function node (custom logic)
- [ ] Tool integration node

**v1.2 - Multi-Provider**  
- [ ] Anthropic/Claude support
- [ ] Provider comparison mode
- [ ] Custom model endpoints

**v1.3 - Advanced Features**
- [ ] Flow templates
- [ ] Export/import flows
- [ ] Collaborative editing

## 🤝 Contributing

This is an open-source project. Contributions welcome!

```bash
# Development setup
git clone https://github.com/blissito/formmy_actions.git
cd formmy_actions
npm install
npm run dev
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🔗 Links

- 📦 [npm package](https://www.npmjs.com/package/formmy-actions)
- 🐙 [GitHub repo](https://github.com/blissito/formmy_actions)
- 🌐 [formmy.app](https://formmy.app) - Where this was born
- 🏢 [Fixter.org](https://fixter.org) - Made with ❤️

---

**🤖 Made with ❤️ by [Fixter.org](https://fixter.org) for [formmy.app](https://formmy.app)**
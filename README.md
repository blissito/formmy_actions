# 🚀 Formmy Actions - AI Flow Canvas

**Visual AI workflow builder as an embeddable React component**

[![React](https://img.shields.io/badge/React-18+-61dafb?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![React Flow](https://img.shields.io/badge/React%20Flow-12+-ff0072?style=flat&logo=react)](https://reactflow.dev/)

## ✨ What it is

An **embeddable React Flow component** for building visual AI agent workflows. Originally developed for [formmy.app](https://formmy.app), now available as a standalone library.

## 🎯 Current Features

- ✅ **Visual workflow builder** with drag & drop
- ✅ **Input/Agent/Output nodes** with execution engine  
- ✅ **OpenAI integration** with API key configuration
- ✅ **Real-time execution** with status updates
- ✅ **Save/load workflows** with localStorage persistence
- ✅ **Professional UI** with improved OutputNode design

## 🚀 Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## 🎮 How to use

1. **Add Input node** - Write your message
2. **Add Agent node** - Configure AI model (requires OpenAI API key)
3. **Add Output node** - View results  
4. **Connect nodes** - Drag from output handles to input handles
5. **Execute flow** - Click "Ejecutar Flujo" button
6. **Save/Load** - Cmd/Ctrl+S to save, auto-loads on refresh

## 🔧 Development Status

**Phase 1: Core Functionality** ✅ COMPLETED
- [x] Basic node types (Input, Agent, Output)
- [x] Execution engine with VercelAI/OpenAI integration
- [x] Visual connections and flow execution  
- [x] Save/load system
- [x] Professional OutputNode redesign

**Phase 2: Advanced Features** 🚧 NEXT
- [ ] Additional node types (Prompt, Function, Tool)
- [ ] Multiple AI providers (Anthropic, etc.)
- [ ] Advanced execution features
- [ ] Component library extraction

## 🤖 Made with ❤️ by [Fixter.org](https://fixter.org) for [formmy.app](https://formmy.app)
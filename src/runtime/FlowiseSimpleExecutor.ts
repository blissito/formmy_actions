import type { Node, Edge } from '@xyflow/react';
import OpenAI from 'openai';

// EXACTAMENTE como Flowise - el chat ES el output
export class FlowiseSimpleExecutor {

  async executeChat(
    nodes: Node[],
    edges: Edge[],
    userMessage: string,
    onNodeUpdate: (nodeId: string, status: 'running' | 'success' | 'error', result?: any) => void
  ) {

    // En Flowise, el chat busca el último nodo conectado (típicamente un agent)
    // No necesita un output node - el chat ES el output

    // Encuentra el nodo agent o el último nodo del flujo
    const agentNode = nodes.find(n =>
      n.type === 'agent' ||
      n.type === 'conversational-agent' ||
      n.type === 'react-agent'
    ) || nodes[nodes.length - 1]; // Si no hay agent, usa el último nodo

    if (!agentNode) {
      return {
        success: false,
        message: 'No nodes in workflow. Add an Agent node.',
      };
    }

    // Ejecuta el flujo hasta llegar al agent
    const executionPath = this.findExecutionPath(nodes, edges, agentNode.id);

    let currentData = { message: userMessage, text: userMessage, input: userMessage };

    // Primero, marca todos los nodos como idle
    for (const node of nodes) {
      onNodeUpdate(node.id, 'idle', null);
    }

    // Ejecuta cada nodo en el path con feedback visual
    for (const node of executionPath) {

      // IMPORTANTE: Actualizar estado a 'running' con delay para que se vea
      onNodeUpdate(node.id, 'running');
      await this.delay(100); // Pequeño delay para que React actualice la UI

      // Tiempo de procesamiento según tipo de nodo
      const processingTime = node.type === 'agent' || node.type.includes('agent') ? 1500 : 500;
      await this.delay(processingTime);

      // Procesa según el tipo de nodo
      if (node.type === 'input') {
        currentData = {
          ...currentData,
          text: node.data?.text || userMessage,
          nodeType: 'input'
        };
      } else if (node.type === 'agent' || node.type.includes('agent')) {
        // EJECUTAR EL AGENTE REAL con el modelo configurado
        // Mostrar trace de ejecución estilo Flowise
        onNodeUpdate(node.id, 'running', {
          ...currentData,
          isThinking: true,
          nodeType: 'agent',
          agentReasoning: [{
            agentName: '',
            messages: ['🤔 Analyzing...'],
            usedTools: [],
            sourceDocuments: []
          }]
        });
        await this.delay(500); // Delay para mostrar el reasoning

        // Trace: Iniciando generación
        onNodeUpdate(node.id, 'running', {
          ...currentData,
          nodeType: 'agent',
          agentReasoning: [{
            agentName: '',
            messages: ['⚡ Generando...'],
            usedTools: [],
            sourceDocuments: []
          }]
        });

        // Parar de mostrar "thinking" cuando empiece el streaming
        let hasStartedStreaming = false;
        let streamingResponse = '';

        const agentResponse = await this.executeRealAgent(
          node,
          currentData.text || userMessage,
          // Token callback para streaming en tiempo real - patrón Flowise
          (token: string) => {
            if (!hasStartedStreaming) {
              hasStartedStreaming = true;
              streamingResponse = token;
            } else {
              streamingResponse += token;
            }

            // Actualizar con el contenido streaming en tiempo real
            onNodeUpdate(node.id, 'running', {
              ...currentData,
              isThinking: false,
              nodeType: 'agent',
              response: streamingResponse,
              isStreaming: true
            });
          }
        );

        currentData = {
          ...currentData,
          response: agentResponse,
          nodeType: 'agent',
          isThinking: false,
          isStreaming: false
        };
      }

      // IMPORTANTE: Actualizar estado a 'success' después del procesamiento
      // Limpiar el reasoning trace cuando termina la ejecución
      onNodeUpdate(node.id, 'success', {
        ...currentData,
        agentReasoning: undefined, // Limpiar trace
        isThinking: false,
        isStreaming: false,
        isProcessing: false
      });
      await this.delay(100); // Pequeño delay para que se vea el cambio
    }

    // El chat muestra la respuesta del último nodo (típicamente el agent)
    return {
      success: true,
      message: currentData.response || currentData.text || 'Workflow completed',
    };
  }

  private findExecutionPath(nodes: Node[], edges: Edge[], targetNodeId: string): Node[] {
    // Encuentra el camino desde el inicio hasta el nodo objetivo
    const path: Node[] = [];
    const visited = new Set<string>();

    // Construye un mapa de conexiones inversas (target -> source)
    const reverseEdges = new Map<string, string[]>();
    edges.forEach(edge => {
      if (!reverseEdges.has(edge.target)) {
        reverseEdges.set(edge.target, []);
      }
      reverseEdges.get(edge.target)!.push(edge.source);
    });

    // Recorre desde el target hacia atrás
    const buildPath = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const sources = reverseEdges.get(nodeId) || [];
      sources.forEach(sourceId => buildPath(sourceId));

      const node = nodes.find(n => n.id === nodeId);
      if (node) path.push(node);
    };

    buildPath(targetNodeId);
    return path;
  }

  private async executeRealAgent(node: Node, input: string, onTokenUpdate?: (token: string) => void): Promise<string> {

    try {
      // Obtener configuración del agente DESDE SU ESTADO LOCAL
      const model = node.data?.model || 'gpt-3.5-turbo';
      const temperature = parseFloat(node.data?.temperature) || 0.7;
      const systemPrompt = node.data?.systemPrompt || node.data?.systemMessage || node.data?.prompt || 'You are a helpful AI assistant.';
      const streaming = node.data?.stream !== false; // Default to true (Flowise pattern)


      // Obtener API key desde localStorage
      const globalConfig = JSON.parse(localStorage.getItem('ai-flow-global-config') || '{}');
      const apiKey = globalConfig.openaiApiKey || import.meta.env.VITE_OPENAI_API_KEY;

      if (!apiKey) {
        console.warn('⚠️ No OpenAI API key configured');
        return `Please configure your OpenAI API key in settings to enable AI responses. Your message: "${input}"`;
      }

      // Inicializar OpenAI
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Solo para desarrollo
      });


      if (streaming && onTokenUpdate) {
        // STREAMING RESPONSE - Flowise pattern
        let fullResponse = '';
        const stream = await openai.chat.completions.create({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: input }
          ],
          temperature: temperature,
          max_tokens: 1000,
          stream: true
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullResponse += content;
            onTokenUpdate(content); // Send token update for real-time streaming
          }
        }

        return fullResponse;
      } else {
        // NON-STREAMING RESPONSE - fallback
        const completion = await openai.chat.completions.create({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: input }
          ],
          temperature: temperature,
          max_tokens: 1000
        });

        const response = completion.choices[0]?.message?.content || 'No response generated';
        return response;
      }

    } catch (error) {
      console.error('❌ Agent execution error:', error);

      if (error instanceof Error && error.message.includes('401')) {
        return 'Invalid OpenAI API key. Please check your API key in settings.';
      }

      if (error instanceof Error && error.message.includes('429')) {
        return 'Rate limit exceeded. Please wait a moment and try again.';
      }

      return `Agent error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
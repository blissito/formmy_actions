import type { Node, Edge } from '@xyflow/react';
import OpenAI from 'openai';

// Simplificar - callback directo
type FlowiseNodeUpdateCallback = (nodeId: string, status: 'running' | 'success' | 'error', result?: any) => void;

/**
 * VERSIÓN ULTRA SIMPLIFICADA que debería funcionar
 */
export class FlowisePatternExecutor {

  async executeChat(
    nodes: Node[],
    edges: Edge[],
    userMessage: string,
    onNodeUpdate: FlowiseNodeUpdateCallback
  ): Promise<{ success: boolean; message: string }> {

    // Log solo crítico removido

    // Buscar agente
    const agentNode = nodes.find(n =>
      n.type === 'agent' ||
      n.type === 'conversational-agent' ||
      n.type === 'react-agent'
    );
    if (!agentNode) {
      return { success: false, message: 'No agent found' };
    }

    try {
      // PASO 1: Reset todos los nodos
      for (const node of nodes) {
        onNodeUpdate(node.id, 'idle');
      }

      // PASO 2: Mostrar "processing"
      onNodeUpdate(agentNode.id, 'running', { isProcessing: true });
      await this.delay(1000); // Tiempo visible para processing

      // PASO 3: Ejecutar REAL OpenAI
      const response = await this.executeRealOpenAI(agentNode, userMessage, onNodeUpdate);

      // PASO 4: Success final
      onNodeUpdate(agentNode.id, 'success', { response });

      return { success: true, message: response };

    } catch (error) {
      onNodeUpdate(agentNode.id, 'error', { error: String(error) });
      return { success: false, message: String(error) };
    }
  }

  private async executeRealOpenAI(
    agentNode: Node,
    userMessage: string,
    onNodeUpdate: FlowiseNodeUpdateCallback
  ): Promise<string> {

    // Leer configuración del agente
    const model = agentNode.data?.model || 'gpt-3.5-turbo';
    const temperature = parseFloat(agentNode.data?.temperature) || 0.7;
    const systemPrompt = agentNode.data?.systemPrompt || 'You are a helpful AI assistant.';



    // API Key
    const globalConfig = JSON.parse(localStorage.getItem('ai-flow-global-config') || '{}');
    const apiKey = globalConfig.openaiApiKey || import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('No OpenAI API key configured');
    }

    // Cambiar a streaming
    onNodeUpdate(agentNode.id, 'running', { isStreaming: true, response: '' });

    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });

    // Stream OpenAI con system prompt correcto
    const stream = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: temperature,
      max_tokens: 1000,
      stream: true
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;

        // Update UI with streaming response
        onNodeUpdate(agentNode.id, 'running', {
          isStreaming: true,
          response: fullResponse
        });

        // Small delay to make streaming visible
        await this.delay(50);
      }
    }
    return fullResponse;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
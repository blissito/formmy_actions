import { ComponentExecutor, type ExecutionContext, type ExecutionResult, type RuntimeType } from '../ComponentExecutor';

export class BasicNodesExecutor extends ComponentExecutor {
  runtime: RuntimeType = 'custom';

  canExecute(context: ExecutionContext): boolean {
    const nodeType = context.componentName.toLowerCase();
    // Handle basic nodes only (NO start node - that's causing issues)
    return ['input', 'agent', 'output', 'prompt', 'function', 'tool'].includes(nodeType);
  }

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const startTime = Date.now();
    const nodeType = context.componentName.toLowerCase();
    const logs: string[] = [];

    try {
      logs.push(`🔧 Executing ${nodeType} node: ${context.nodeId}`);
      logs.push(`🔍 DEBUG - Original componentName: "${context.componentName}", framework: "${context.framework}"`);

      let outputs: Record<string, any> = {};

      switch (nodeType) {
        case 'input':
          // Input node: return the text/prompt as output
          const inputText = context.inputs.text || context.inputs.prompt || context.inputs.input || 'Default input';
          outputs = {
            response: inputText,
            text: inputText,
            prompt: inputText,
            input: inputText,
            nodeType: 'input',
            nodeLabel: 'Input Node'
          };
          logs.push(`📝 Input text: ${inputText}`);
          break;

        case 'agent':
          // Agent node: intelligent mock responses
          const agentInput = context.inputs.prompt || context.inputs.input || context.inputs.text || 'Hello';

          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Generate more intelligent mock responses based on input
          const intelligentResponse = this.generateIntelligentResponse(agentInput);

          outputs = {
            response: intelligentResponse,
            result: intelligentResponse,
            nodeType: 'agent',
            nodeLabel: 'AI Agent (Demo Mode)'
          };
          logs.push(`🤖 AI Agent input: "${agentInput}"`);
          logs.push(`🧠 AI Agent response: ${intelligentResponse}`);
          logs.push(`ℹ️ Demo mode - configure OpenAI API key for real AI responses`);
          break;

        case 'output':
          // Output node: display the final result
          const outputData = context.inputs.response || context.inputs.result || context.inputs.input || 'No output';
          outputs = {
            response: outputData,
            result: outputData,
            display: outputData,
            nodeType: 'output',
            nodeLabel: 'Output Node'
          };
          logs.push(`📤 Final output: ${outputData}`);
          break;

        case 'prompt':
          // Prompt node: format prompt with variables
          const promptTemplate = context.inputs.template || context.inputs.prompt || 'Default prompt template';
          const processedPrompt = this.processPromptTemplate(promptTemplate, context.inputs);
          outputs = {
            response: processedPrompt,
            prompt: processedPrompt,
            nodeType: 'prompt',
            nodeLabel: 'Prompt Template'
          };
          logs.push(`📝 Prompt template: ${promptTemplate}`);
          logs.push(`✨ Processed prompt: ${processedPrompt}`);
          break;

        case 'function':
          // Function node: execute custom logic
          const functionResult = this.executeCustomFunction(context);
          outputs = {
            response: functionResult,
            result: functionResult,
            nodeType: 'function',
            nodeLabel: 'Custom Function'
          };
          logs.push(`⚡ Function executed: ${functionResult}`);
          break;

        case 'tool':
          // Tool node: simulate tool execution
          const toolResult = `Tool executed with input: ${JSON.stringify(context.inputs)}`;
          outputs = {
            response: toolResult,
            result: toolResult,
            nodeType: 'tool',
            nodeLabel: 'Tool Node'
          };
          logs.push(`🔨 Tool execution result: ${toolResult}`);
          break;


        default:
          // Unknown node type
          outputs = {
            response: `Unknown node type: ${nodeType}`,
            error: `Unsupported node type: ${nodeType}`,
            nodeType: nodeType,
            nodeLabel: `Unknown Node (${nodeType})`
          };
          logs.push(`⚠️ Unknown node type: ${nodeType}`);
      }

      const executionTime = Date.now() - startTime;
      logs.push(`✅ ${nodeType} node completed in ${executionTime}ms`);

      return {
        nodeId: context.nodeId,
        outputs,
        status: 'success',
        executionTime,
        logs
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      logs.push(`❌ Error in ${nodeType} node: ${error}`);

      return {
        nodeId: context.nodeId,
        outputs: {},
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        executionTime,
        logs
      };
    }
  }

  private processPromptTemplate(template: string, inputs: Record<string, any>): string {
    let processed = template;

    // Replace {{variable}} patterns with actual values
    Object.entries(inputs).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processed = processed.replace(regex, String(value));
    });

    return processed;
  }

  private executeCustomFunction(context: ExecutionContext): string {
    // Simulate custom function execution
    const inputData = JSON.stringify(context.inputs);
    return `Custom function processed: ${inputData}`;
  }

  private generateIntelligentResponse(input: string): string {
    const lowerInput = input.toLowerCase();

    // Pattern-based intelligent responses
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hola')) {
      return `Hello! I'm an AI assistant in demo mode. You said: "${input}". I'd love to help you with any questions or tasks!`;
    }

    if (lowerInput.includes('how are you') || lowerInput.includes('¿cómo estás') || lowerInput.includes('como estas')) {
      return `I'm doing great, thank you for asking! I'm ready to help you test this workflow. You asked: "${input}"`;
    }

    if (lowerInput.includes('what') || lowerInput.includes('qué') || lowerInput.includes('que')) {
      return `That's an interesting question about "${input}". In demo mode, I provide contextual responses. Configure an OpenAI API key to get real AI-powered answers!`;
    }

    if (lowerInput.includes('help') || lowerInput.includes('ayuda')) {
      return `I'm here to help! You mentioned: "${input}". This workflow is working perfectly - I can see your message and respond accordingly. Try configuring real AI models for even better responses!`;
    }

    if (lowerInput.includes('test') || lowerInput.includes('prueba')) {
      return `Great! Testing workflow with: "${input}". ✅ Input received ✅ Agent processing ✅ Response generated. Everything is working correctly!`;
    }

    // Default intelligent response
    return `I understand you said: "${input}". This is a smart demo response showing the workflow is functioning properly. Each node is executing in sequence with visual feedback. Add an OpenAI API key in settings for real AI conversations!`;
  }
}
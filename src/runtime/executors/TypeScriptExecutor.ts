import { ComponentExecutor, type ExecutionContext, type ExecutionResult, type RuntimeType } from '../ComponentExecutor';

export class TypeScriptExecutor extends ComponentExecutor {
  runtime: RuntimeType = 'typescript';

  canExecute(context: ExecutionContext): boolean {
    const typescriptComponents = [
      'DataProcessor',
      'JSONTransformer', 
      'FilterFunction',
      'Validator',
      'CustomFunction',
      'APICall',
      'WebhookTrigger'
    ];
    
    return typescriptComponents.includes(context.componentName) ||
           context.framework === 'typescript';
  }

  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const logs: string[] = [];
    const startTime = Date.now();

    try {
      logs.push(`Executing TypeScript component: ${context.componentName}`);
      
      switch (context.componentName) {
        case 'DataProcessor':
          return await this.executeDataProcessor(context, logs);
        case 'JSONTransformer':
          return await this.executeJSONTransformer(context, logs);
        case 'FilterFunction':
          return await this.executeFilterFunction(context, logs);
        case 'APICall':
          return await this.executeAPICall(context, logs);
        case 'RAGPipeline': // Our custom component
          return await this.executeRAGPipeline(context, logs);
        default:
          return await this.executeGenericFunction(context, logs);
      }
      
    } catch (error) {
      return {
        nodeId: context.nodeId,
        outputs: {},
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
        logs
      };
    }
  }

  private async executeDataProcessor(
    context: ExecutionContext, 
    logs: string[]
  ): Promise<ExecutionResult> {
    logs.push('Processing data transformation...');
    
    const data = context.inputs.data || [];
    const operation = context.parameters.operation || 'passthrough';
    
    logs.push(`Operation: ${operation} on ${Array.isArray(data) ? data.length : 'non-array'} items`);

    let result;
    switch (operation) {
      case 'map':
        result = Array.isArray(data) ? data.map((item, index) => ({ ...item, index })) : data;
        break;
      case 'filter':
        result = Array.isArray(data) ? data.filter(item => item !== null && item !== undefined) : data;
        break;
      case 'reduce':
        result = Array.isArray(data) ? data.reduce((acc, item) => ({ ...acc, [`item_${Object.keys(acc).length}`]: item }), {}) : data;
        break;
      default:
        result = data;
    }

    logs.push(`Processed data: ${typeof result} with ${Array.isArray(result) ? result.length : Object.keys(result).length} items`);

    return {
      nodeId: context.nodeId,
      outputs: {
        processed_data: result,
        operation_used: operation,
        metadata: {
          input_type: Array.isArray(data) ? 'array' : typeof data,
          output_type: Array.isArray(result) ? 'array' : typeof result
        }
      },
      status: 'success',
      executionTime: 0,
      logs
    };
  }

  private async executeJSONTransformer(
    context: ExecutionContext, 
    logs: string[]
  ): Promise<ExecutionResult> {
    logs.push('Transforming JSON data...');
    
    const input = context.inputs.json_data || context.inputs.data;
    const transformations = context.parameters.transformations || {};
    
    logs.push(`Transforming object with ${Object.keys(transformations).length} rules`);

    try {
      let transformed = typeof input === 'string' ? JSON.parse(input) : input;
      
      // Apply transformations
      Object.entries(transformations).forEach(([key, transform]) => {
        if (typeof transform === 'string' && transform.startsWith('$.')) {
          // JSONPath-like transformation (simplified)
          const path = transform.substring(2);
          if (path in transformed) {
            transformed[key] = transformed[path];
          }
        }
      });

      logs.push(`Transformation completed successfully`);

      return {
        nodeId: context.nodeId,
        outputs: {
          transformed_data: transformed,
          original_keys: Object.keys(input || {}),
          new_keys: Object.keys(transformed || {})
        },
        status: 'success',
        executionTime: 0,
        logs
      };
      
    } catch (error) {
      logs.push(`JSON transformation failed: ${error}`);
      throw error;
    }
  }

  private async executeFilterFunction(
    context: ExecutionContext, 
    logs: string[]
  ): Promise<ExecutionResult> {
    logs.push('Executing filter function...');
    
    const data = context.inputs.data || [];
    const condition = context.parameters.condition || 'true';
    const field = context.parameters.field;

    logs.push(`Filtering ${Array.isArray(data) ? data.length : 'non-array'} items`);
    logs.push(`Condition: ${condition}${field ? ` on field: ${field}` : ''}`);

    let filtered;
    if (Array.isArray(data)) {
      filtered = data.filter(item => {
        if (field && item[field] !== undefined) {
          return this.evaluateCondition(item[field], condition);
        }
        return this.evaluateCondition(item, condition);
      });
    } else {
      filtered = this.evaluateCondition(data, condition) ? [data] : [];
    }

    logs.push(`Filtered to ${filtered.length} items`);

    return {
      nodeId: context.nodeId,
      outputs: {
        filtered_data: filtered,
        original_count: Array.isArray(data) ? data.length : 1,
        filtered_count: filtered.length,
        filter_ratio: Array.isArray(data) ? filtered.length / data.length : filtered.length
      },
      status: 'success',
      executionTime: 0,
      logs
    };
  }

  private async executeAPICall(
    context: ExecutionContext, 
    logs: string[]
  ): Promise<ExecutionResult> {
    logs.push('Making API call...');
    
    const url = context.parameters.url || context.inputs.url;
    const method = context.parameters.method || 'GET';
    // const headers = context.parameters.headers || {};
    const body = context.inputs.body || context.parameters.body;

    logs.push(`${method} ${url}`);

    try {
      // Simulate API call (replace with actual fetch in real implementation)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockResponse = {
        status: 200,
        data: {
          message: `Mock response for ${method} ${url}`,
          timestamp: new Date().toISOString(),
          request_body: body
        },
        headers: {
          'content-type': 'application/json',
          'x-mock-api': 'true'
        }
      };

      logs.push(`API call completed with status: ${mockResponse.status}`);

      return {
        nodeId: context.nodeId,
        outputs: {
          response: mockResponse.data,
          status_code: mockResponse.status,
          response_headers: mockResponse.headers,
          request_info: { method, url, body }
        },
        status: 'success',
        executionTime: 0,
        logs
      };
      
    } catch (error) {
      logs.push(`API call failed: ${error}`);
      throw error;
    }
  }

  private async executeRAGPipeline(
    context: ExecutionContext, 
    logs: string[]
  ): Promise<ExecutionResult> {
    logs.push('Executing RAG Pipeline...');
    
    const query = context.inputs.query || '';
    // const documents = context.inputs.documents || [];
    const additionalContext = context.inputs.context || '';
    
    const retrievalCount = context.parameters.retrieval_count || 5;
    const modelName = context.parameters.model_name || 'gpt-4';
    const temperature = context.parameters.temperature || 0.1;
    const includeSources = context.parameters.include_sources || true;

    logs.push(`Query: "${query}"`);
    logs.push(`Using model: ${modelName}, retrieving ${retrievalCount} docs`);

    // Simulate RAG pipeline execution
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock retrieved documents
    const mockSources = Array.from({ length: Math.min(retrievalCount, 3) }, (_, i) => ({
      id: `doc_${i}`,
      title: `Document ${i + 1}`,
      content: `Relevant content for query "${query}" from document ${i + 1}`,
      score: 0.95 - (i * 0.1),
      metadata: { source: `rag_doc_${i}.txt`, timestamp: new Date().toISOString() }
    }));

    const mockAnswer = `Based on the analysis of ${mockSources.length} relevant documents, here's a comprehensive answer to your query "${query}":

This is a generated response that would normally combine information from multiple sources with contextual understanding. The system retrieved the most relevant documents and synthesized them to provide this answer.${additionalContext ? `\n\nAdditional context was considered: ${additionalContext}` : ''}`;

    const confidence = 0.87 + (Math.random() * 0.1); // Mock confidence score

    logs.push(`Generated answer with confidence: ${(confidence * 100).toFixed(1)}%`);
    logs.push(`Used ${mockSources.length} source documents`);

    const outputs: Record<string, any> = {
      answer: mockAnswer,
      confidence: confidence,
      query_metadata: {
        original_query: query,
        model_used: modelName,
        temperature: temperature,
        retrieval_count: mockSources.length
      }
    };

    if (includeSources) {
      outputs.sources = mockSources;
    }

    return {
      nodeId: context.nodeId,
      outputs,
      status: 'success',
      executionTime: 0,
      logs
    };
  }

  private async executeGenericFunction(
    context: ExecutionContext, 
    logs: string[]
  ): Promise<ExecutionResult> {
    logs.push(`Executing generic TypeScript function: ${context.componentName}`);
    
    const inputKeys = Object.keys(context.inputs);
    const paramKeys = Object.keys(context.parameters);
    
    logs.push(`Inputs: ${inputKeys.join(', ')}`);
    logs.push(`Parameters: ${paramKeys.join(', ')}`);

    // Generic processing
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      nodeId: context.nodeId,
      outputs: {
        result: `Function ${context.componentName} executed successfully`,
        inputs_processed: inputKeys,
        parameters_used: paramKeys,
        execution_info: {
          component: context.componentName,
          framework: context.framework,
          timestamp: new Date().toISOString()
        }
      },
      status: 'success',
      executionTime: 0,
      logs
    };
  }

  private evaluateCondition(value: any, condition: string): boolean {
    // Simple condition evaluation (in real implementation, use a safe eval or expression parser)
    switch (condition) {
      case 'truthy':
        return !!value;
      case 'not_null':
        return value !== null && value !== undefined;
      case 'not_empty':
        return value !== null && value !== undefined && value !== '';
      case 'is_string':
        return typeof value === 'string';
      case 'is_number':
        return typeof value === 'number';
      default:
        return true; // Default to pass-through
    }
  }
}
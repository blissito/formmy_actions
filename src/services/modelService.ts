export interface ModelInfo {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic';
  description?: string;
}

// Modelos por defecto como fallback
const DEFAULT_MODELS: ModelInfo[] = [
  // OpenAI
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  
  // Anthropic
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'anthropic' },
  { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'anthropic' },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
];

export class ModelService {
  private static cache: ModelInfo[] | null = null;
  private static lastFetch: number = 0;
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  static async getAvailableModels(openaiApiKey?: string, anthropicApiKey?: string): Promise<ModelInfo[]> {
    // Usar caché si es reciente
    if (this.cache && Date.now() - this.lastFetch < this.CACHE_DURATION) {
      return this.cache;
    }

    const models: ModelInfo[] = [];

    try {
      // Fetchear modelos de OpenAI si hay API key
      if (openaiApiKey && openaiApiKey.trim()) {
        const openaiModels = await this.fetchOpenAIModels(openaiApiKey);
        models.push(...openaiModels);
      }

      // Fetchear modelos de Anthropic si hay API key
      if (anthropicApiKey && anthropicApiKey.trim()) {
        const anthropicModels = await this.fetchAnthropicModels(anthropicApiKey);
        models.push(...anthropicModels);
      }

      // Si no hay modelos dinámicos, usar los por defecto
      if (models.length === 0) {
        return DEFAULT_MODELS;
      }

      // Combinar con modelos por defecto para asegurar cobertura
      const combinedModels = [...models];
      
      // Agregar modelos por defecto que no estén ya presentes
      DEFAULT_MODELS.forEach(defaultModel => {
        if (!models.find(m => m.id === defaultModel.id)) {
          combinedModels.push(defaultModel);
        }
      });

      // Actualizar caché
      this.cache = combinedModels;
      this.lastFetch = Date.now();

      return combinedModels;

    } catch (error) {
      console.warn('Error fetching models from APIs, using defaults:', error);
      return DEFAULT_MODELS;
    }
  }

  private static async fetchOpenAIModels(apiKey: string): Promise<ModelInfo[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const models: ModelInfo[] = [];

      // Filtrar solo modelos de chat relevantes
      const chatModels = data.data.filter((model: any) => 
        model.id.includes('gpt-') && 
        !model.id.includes('instruct') &&
        !model.id.includes('edit') &&
        !model.id.includes('embedding')
      );

      chatModels.forEach((model: any) => {
        models.push({
          id: model.id,
          name: this.formatModelName(model.id, 'openai'),
          provider: 'openai',
          description: `Created: ${new Date(model.created * 1000).toLocaleDateString()}`
        });
      });

      return models;
    } catch (error) {
      console.warn('Failed to fetch OpenAI models:', error);
      return DEFAULT_MODELS.filter(m => m.provider === 'openai');
    }
  }

  private static async fetchAnthropicModels(apiKey: string): Promise<ModelInfo[]> {
    // Anthropic no tiene un endpoint público para listar modelos
    // Retornamos los modelos conocidos por defecto
    try {
      // Verificar que la API key es válida haciendo una llamada simple
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        })
      });

      // Si la respuesta es válida (incluso error 400 es ok - significa API key válida)
      if (response.status === 400 || response.status === 200) {
        return DEFAULT_MODELS.filter(m => m.provider === 'anthropic');
      }

      throw new Error('Invalid Anthropic API key');
    } catch (error) {
      console.warn('Failed to verify Anthropic API key:', error);
      return [];
    }
  }

  private static formatModelName(modelId: string, provider: 'openai' | 'anthropic'): string {
    if (provider === 'openai') {
      const formatted = modelId
        .replace('gpt-', 'GPT-')
        .replace('-turbo', ' Turbo')
        .replace('-', '.')
        .replace('GPT.3.5', 'GPT-3.5')
        .replace('GPT.4', 'GPT-4');
      return formatted;
    }

    if (provider === 'anthropic') {
      return modelId
        .replace('claude-', 'Claude ')
        .replace('-20240307', ' (Haiku)')
        .replace('-20240229', '')
        .replace('-20241022', ' (Latest)');
    }

    return modelId;
  }

  static clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
  }
}
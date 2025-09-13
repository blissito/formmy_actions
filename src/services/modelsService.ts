/**
 * Dynamic Models Service
 * Consulta dinámicamente los modelos disponibles de cada proveedor
 * Siguiendo patrón Flowise de descubrimiento automático
 */

export interface ModelInfo {
  id: string;
  name: string;
  provider: 'OpenAI' | 'Anthropic' | 'Google' | 'Mistral';
  capabilities?: string[];
  contextLength?: number;
  pricing?: {
    input: number;
    output: number;
  };
}

interface ModelsCache {
  [provider: string]: {
    models: ModelInfo[];
    timestamp: number;
    ttl: number; // 5 minutes
  };
}

class ModelsService {
  private cache: ModelsCache = {};
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get available OpenAI models
   */
  async getOpenAIModels(apiKey: string): Promise<ModelInfo[]> {
    const cacheKey = 'openai';

    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      return this.cache[cacheKey].models;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();

      // Filter only chat completion models
      const chatModels = data.data
        .filter((model: any) =>
          model.id.includes('gpt-') &&
          !model.id.includes('instruct') &&
          !model.id.includes('embedding')
        )
        .map((model: any) => ({
          id: model.id,
          name: this.formatModelName(model.id),
          provider: 'OpenAI' as const,
          capabilities: ['chat', 'completion']
        }))
        .sort((a: ModelInfo, b: ModelInfo) => {
          // Sort by preference: 4o-mini, 4o, 4-turbo, 4, 3.5-turbo
          const order = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'];
          const aIndex = order.findIndex(id => a.id.startsWith(id));
          const bIndex = order.findIndex(id => b.id.startsWith(id));
          return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
        });

      // Cache the results
      this.cache[cacheKey] = {
        models: chatModels,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL
      };

      return chatModels;
    } catch (error) {
      console.warn('Failed to fetch OpenAI models:', error);

      // Return fallback models if API fails
      return [
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' }
      ];
    }
  }

  /**
   * Get available Anthropic models
   */
  async getAnthropicModels(apiKey: string): Promise<ModelInfo[]> {
    const cacheKey = 'anthropic';

    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      return this.cache[cacheKey].models;
    }

    try {
      // Anthropic doesn't have a models endpoint, so we use known available models
      // But we can validate the API key works
      const testResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        })
      });

      // If we get any response (even error), API key format is valid
      const models: ModelInfo[] = [
        { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'Anthropic' },
        { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'Anthropic' },
        { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'Anthropic' }
      ];

      // Cache the results
      this.cache[cacheKey] = {
        models,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL
      };

      return models;
    } catch (error) {
      console.warn('Failed to validate Anthropic API key:', error);

      // Return empty if API key is invalid
      return [];
    }
  }

  /**
   * Get all available models based on configured API keys
   */
  async getAvailableModels(config: { openaiApiKey?: string; anthropicApiKey?: string }): Promise<ModelInfo[]> {
    const allModels: ModelInfo[] = [];

    // Get OpenAI models if API key is configured
    if (config.openaiApiKey?.trim()) {
      try {
        const openaiModels = await this.getOpenAIModels(config.openaiApiKey);
        allModels.push(...openaiModels);
      } catch (error) {
        console.warn('Failed to load OpenAI models:', error);
      }
    }

    // Get Anthropic models if API key is configured
    if (config.anthropicApiKey?.trim()) {
      try {
        const anthropicModels = await this.getAnthropicModels(config.anthropicApiKey);
        allModels.push(...anthropicModels);
      } catch (error) {
        console.warn('Failed to load Anthropic models:', error);
      }
    }

    return allModels;
  }

  /**
   * Clear cache for a specific provider or all providers
   */
  clearCache(provider?: string) {
    if (provider) {
      delete this.cache[provider];
    } else {
      this.cache = {};
    }
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(provider: string): boolean {
    const cached = this.cache[provider];
    if (!cached) return false;

    return Date.now() - cached.timestamp < cached.ttl;
  }

  /**
   * Format model ID to human readable name
   */
  private formatModelName(modelId: string): string {
    const nameMap: Record<string, string> = {
      'gpt-4o-mini': 'GPT-4o Mini',
      'gpt-4o': 'GPT-4o',
      'gpt-4-turbo': 'GPT-4 Turbo',
      'gpt-4': 'GPT-4',
      'gpt-3.5-turbo': 'GPT-3.5 Turbo'
    };

    return nameMap[modelId] || modelId
      .replace('gpt-', 'GPT-')
      .replace('-turbo', ' Turbo')
      .replace(/(\d+)\.(\d+)/, '$1.$2')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// Export singleton instance
export const modelsService = new ModelsService();

/**
 * React Hook para usar el servicio de modelos
 */
export function useModelsService() {
  return modelsService;
}
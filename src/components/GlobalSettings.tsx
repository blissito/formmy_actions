import React, { useState } from 'react';
import { FiSettings, FiKey, FiX, FiSave, FiZap } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';

interface GlobalSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  globalConfig: GlobalConfig;
  onSave: (config: GlobalConfig) => void;
}

export interface GlobalConfig {
  openaiApiKey: string;
  anthropicApiKey: string;
  defaultTemperature: number;
  defaultMaxTokens: number | 'unlimited';
}

export function GlobalSettings({ isOpen, onClose, globalConfig, onSave }: GlobalSettingsProps) {
  const [config, setConfig] = useState<GlobalConfig>(globalConfig);
  
  // Handle ESC key press
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const handleMaxTokensChange = (value: string) => {
    if (value === 'unlimited' || value === '') {
      setConfig({ ...config, defaultMaxTokens: 'unlimited' });
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue > 0) {
        setConfig({ ...config, defaultMaxTokens: numValue });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleOverlayClick}>
      <div className="bg-white rounded-3xl shadow-2xl w-[600px] max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
              <FiSettings size={22} />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-800">Variables Globales</h2>
              <p className="text-sm text-gray-500 leading-relaxed">Configuración compartida para todos los flujos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-8">
          {/* API Keys Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <FiKey size={20} />
              API Keys
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <FiZap size={16} className="text-green-600" />
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={config.openaiApiKey}
                  onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="sk-..."
                />
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Para modelos GPT-3.5, GPT-4, GPT-4 Turbo, etc.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <RiRobot2Line size={16} className="text-orange-600" />
                  Anthropic API Key
                </label>
                <input
                  type="password"
                  value={config.anthropicApiKey}
                  onChange={(e) => setConfig({ ...config, anthropicApiKey: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="sk-ant-..."
                />
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Para modelos Claude 3 (Haiku, Sonnet, Opus)
                </p>
              </div>
              
              <p className="text-xs text-gray-500 leading-relaxed">
                Las API keys se guardan de forma segura y encriptada
              </p>
            </div>
          </div>

          {/* Default Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
              Configuración Predeterminada
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Temperatura: {config.defaultTemperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.defaultTemperature}
                  onChange={(e) => setConfig({ ...config, defaultTemperature: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(config.defaultTemperature / 2) * 100}%, #e5e7eb ${(config.defaultTemperature / 2) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 (Conservador)</span>
                  <span>1 (Balanceado)</span>
                  <span>2 (Creativo)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Max Tokens
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={config.defaultMaxTokens === 'unlimited' ? 'unlimited' : config.defaultMaxTokens.toString()}
                    onChange={(e) => handleMaxTokensChange(e.target.value)}
                    className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="1000 o 'unlimited'"
                  />
                  <button
                    onClick={() => setConfig({ ...config, defaultMaxTokens: 'unlimited' })}
                    className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                      config.defaultMaxTokens === 'unlimited'
                        ? 'bg-purple-100 text-purple-700 border border-purple-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ∞
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Usar "unlimited" para sin límites
                </p>
              </div>


            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200 border border-blue-600"
            >
              <FiSave size={16} />
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook para usar las configuraciones globales
export function useGlobalConfig() {
  const [config, setConfig] = useState<GlobalConfig>(() => {
    // Cargar desde localStorage
    try {
      const saved = localStorage.getItem('ai-flow-global-config');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Error loading global config:', error);
    }

    // Configuración por defecto
    return {
      openaiApiKey: '',
      anthropicApiKey: '',
      defaultTemperature: 0.7,
      defaultMaxTokens: 1000
    };
  });

  const saveConfig = (newConfig: GlobalConfig) => {
    setConfig(newConfig);
    localStorage.setItem('ai-flow-global-config', JSON.stringify(newConfig));
  };

  return { config, saveConfig };
}
/**
 * Selector de Idioma - formmy-actions
 * Componente para cambiar entre idiomas disponibles
 */

import React, { useState } from 'react';
import { useTranslation } from '../i18n';
import { englishPlugin, type LanguagePlugin } from '../i18n/plugins/english';
import { FiGlobe, FiChevronDown } from 'react-icons/fi';

interface SelectorDeIdiomaProps {
  className?: string;
}

export default function SelectorDeIdioma({ className = '' }: SelectorDeIdiomaProps) {
  const { t, currentLanguage, availableLanguages, setLanguage, registerLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Registrar plugin de inglés si no está ya registrado
  React.useEffect(() => {
    if (!availableLanguages.find(lang => lang.code === 'en')) {
      registerLanguage(englishPlugin as any);
    }
  }, [availableLanguages, registerLanguage]);

  const handleLanguageChange = (languageCode: 'es' | 'en') => {
    setLanguage(languageCode);
    setIsOpen(false);
  };

  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
      >
        <FiGlobe size={16} className="text-gray-500" />
        <span className="text-gray-700">
          {currentLang?.nativeName || 'Mexicano'}
        </span>
        <FiChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Overlay para cerrar */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-full min-w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            {availableLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code as 'es' | 'en')}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  currentLanguage === language.code
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{language.nativeName}</span>
                  {currentLanguage === language.code && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {language.name}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
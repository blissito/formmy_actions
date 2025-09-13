import React, { useState, useRef } from 'react';
import { FiCode, FiX } from 'react-icons/fi';
import { useWorkflowExecution, type Variable } from '../runtime/WorkflowExecutionContext';
import VariablesList from './VariablesList';

interface TextInputWithVariablesProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  showVariables?: boolean;
}

export default function TextInputWithVariables({
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
  showVariables = true
}: TextInputWithVariablesProps) {
  const [showVariablesList, setShowVariablesList] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { replaceVariables } = useWorkflowExecution();

  const handleVariableSelect = (variable: Variable) => {
    const syntax = `{{${variable.name}}}`;

    // Insert variable at cursor position
    const beforeCursor = value.slice(0, cursorPosition);
    const afterCursor = value.slice(cursorPosition);
    const newValue = beforeCursor + syntax + afterCursor;

    onChange(newValue);

    // Update cursor position after variable insertion
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = cursorPosition + syntax.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);

    setShowVariablesList(false);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCursorPosition(e.target.selectionStart);
    onChange(newValue);
  };

  const handleCursorPositionChange = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
  };

  // Preview with variables replaced (for display purposes)
  const previewValue = replaceVariables(value);
  const hasVariables = value.includes('{{') && value.includes('}}');

  return (
    <div className="relative">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onSelect={handleCursorPositionChange}
          onClick={handleCursorPositionChange}
          onKeyUp={handleCursorPositionChange}
          placeholder={placeholder}
          rows={rows}
          className={`w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none text-sm transition-all duration-200 ${className} ${
            showVariables ? 'pr-10' : ''
          }`}
        />

        {showVariables && (
          <button
            type="button"
            onClick={() => setShowVariablesList(!showVariablesList)}
            className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-blue-50 transition-colors shadow-sm"
            title="Insert variable"
          >
            <FiCode size={12} className="text-blue-600" />
          </button>
        )}
      </div>

      {/* Variables preview */}
      {hasVariables && previewValue !== value && (
        <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs font-medium text-blue-800 mb-1">Preview with variables:</div>
          <div className="text-xs text-blue-700 whitespace-pre-wrap">{previewValue}</div>
        </div>
      )}

      {/* Variables dropdown */}
      {showVariablesList && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
          <div className="bg-white rounded-lg border border-gray-200 p-3 max-h-80 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-700">📝 Insert Variable</div>
              <button
                onClick={() => setShowVariablesList(false)}
                className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <FiX size={12} />
              </button>
            </div>

            <VariablesList
              onVariableSelect={handleVariableSelect}
              showAddVariable={false}
              compact={true}
            />

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                <div className="mb-1">💡 <strong>How to use variables:</strong></div>
                <div>• Click any variable above to insert it</div>
                <div>• Use syntax: <code className="bg-gray-100 px-1 rounded">{'{{variableName}}'}</code></div>
                <div>• Variables are replaced during execution</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
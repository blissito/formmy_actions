import React from 'react';
import './aggressive-isolation.css';

interface AggressiveStyleIsolatorProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * AggressiveStyleIsolator - Complete CSS isolation for formmy-actions
 * 
 * This component creates a complete CSS boundary to prevent ANY external styles
 * from interfering with formmy-actions components. Uses aggressive CSS resets
 * and !important declarations to override even the most specific external styles.
 * 
 * Features:
 * - Complete CSS reset with 'all: initial'
 * - Aggressive !important overrides
 * - Protection against Tailwind, Bootstrap, and other CSS frameworks
 * - Re-establishment of necessary base styles
 * - React Flow specific style isolation
 */
export default function AggressiveStyleIsolator({ 
  children, 
  className = '', 
  style = {} 
}: AggressiveStyleIsolatorProps) {
  const isolatedStyle: React.CSSProperties = {
    // Complete style isolation
    all: 'initial',
    boxSizing: 'border-box',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#374151',
    background: 'transparent',
    margin: 0,
    padding: 0,
    border: 'none',
    textAlign: 'initial',
    textDecoration: 'none',
    textTransform: 'none',
    textIndent: 0,
    letterSpacing: 'normal',
    wordSpacing: 'normal',
    textShadow: 'none',
    listStyle: 'none',
    verticalAlign: 'baseline',
    position: 'static',
    // Merge with user provided styles
    ...style,
  };

  return (
    <div 
      className={`formmy-actions-isolated ${className}`}
      style={isolatedStyle}
    >
      <div 
        style={{ 
          width: '100%', 
          height: '100%',
          display: 'block',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          color: 'inherit',
        }}
      >
        {children}
      </div>
    </div>
  );
}
import React from 'react';

interface StyleIsolatorProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * StyleIsolator - Wraps children with isolated CSS context
 * Prevents external styles from interfering with formmy-actions components
 */
export default function StyleIsolator({ children, className = '', style = {} }: StyleIsolatorProps) {
  return (
    <div 
      className={`formmy-actions-container ${className}`}
      style={{
        // Base isolation styles
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: '14px',
        lineHeight: '1.5',
        color: '#374151',
        boxSizing: 'border-box',
        // Reset any potential inherited styles
        margin: 0,
        padding: 0,
        border: 'none',
        background: 'transparent',
        textAlign: 'initial',
        textDecoration: 'none',
        textTransform: 'none',
        letterSpacing: 'normal',
        wordSpacing: 'normal',
        textIndent: 0,
        textShadow: 'none',
        listStyle: 'none',
        verticalAlign: 'baseline',
        ...style
      }}
    >
      {children}
    </div>
  );
}
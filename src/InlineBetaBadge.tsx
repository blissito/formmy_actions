import React from 'react';
import { FiGithub } from 'react-icons/fi';

interface InlineBetaBadgeProps {
  show?: boolean;
  repoUrl?: string;
  className?: string;
}

/**
 * InlineBetaBadge - A small inline badge that sits next to titles
 */
export default function InlineBetaBadge({ 
  show = true, 
  repoUrl = 'https://github.com/blissito/formmy_actions',
  className = ''
}: InlineBetaBadgeProps) {
  if (!show) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(repoUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <span 
      className={`formmy-inline-beta-badge ${className}`}
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        padding: '2px 6px',
        borderRadius: '8px',
        fontSize: '9px',
        fontWeight: '600',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        cursor: 'pointer',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.15s ease-in-out',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        textDecoration: 'none',
        outline: 'none',
        marginLeft: '8px',
        verticalAlign: 'middle',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.1)';
      }}
      title="View on GitHub - formmy-actions beta"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e);
        }
      }}
    >
      <FiGithub size={10} />
      <span>BETA</span>
    </span>
  );
}
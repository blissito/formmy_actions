import React from 'react';
import { FiGithub } from 'react-icons/fi';

interface BetaRibbonProps {
  show?: boolean;
  repoUrl?: string;
  className?: string;
}

/**
 * BetaRibbon - A small ribbon indicator showing beta status with GitHub link
 */
export default function BetaRibbon({ 
  show = true, 
  repoUrl = 'https://github.com/blissito/formmy_actions',
  className = ''
}: BetaRibbonProps) {
  if (!show) return null;

  const handleClick = () => {
    window.open(repoUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className={`formmy-beta-ribbon ${className}`}
      onClick={handleClick}
      style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(4px)',
        transition: 'all 0.2s ease-in-out',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        textDecoration: 'none',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
      }}
      title="View on GitHub - formmy-actions beta"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <FiGithub size={12} />
      <span>BETA</span>
    </div>
  );
}

// CSS for the ribbon (included inline to ensure isolation)
const ribbonStyles = `
.formmy-actions-container .formmy-beta-ribbon {
  position: absolute !important;
  top: 8px !important;
  left: 8px !important;
  z-index: 1000 !important;
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: #ffffff !important;
  padding: 4px 8px !important;
  border-radius: 12px !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
  cursor: pointer !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(4px) !important;
  transition: all 0.2s ease-in-out !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  text-decoration: none !important;
  outline: none !important;
  margin: 0 !important;
  text-align: center !important;
  text-transform: none !important;
  letter-spacing: normal !important;
  word-spacing: normal !important;
  text-indent: 0 !important;
  text-shadow: none !important;
  list-style: none !important;
  vertical-align: baseline !important;
}

.formmy-actions-container .formmy-beta-ribbon:hover {
  transform: scale(1.05) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25) !important;
}

.formmy-actions-container .formmy-beta-ribbon:active {
  transform: scale(0.98) !important;
}

.formmy-actions-container .formmy-beta-ribbon svg {
  width: 12px !important;
  height: 12px !important;
  color: inherit !important;
  fill: currentColor !important;
  display: inline-block !important;
  vertical-align: middle !important;
}
`;

// Inject styles into head if not already present
if (typeof document !== 'undefined' && !document.getElementById('formmy-beta-ribbon-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'formmy-beta-ribbon-styles';
  styleSheet.textContent = ribbonStyles;
  document.head.appendChild(styleSheet);
}
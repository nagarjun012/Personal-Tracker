import React from 'react';

export function Card({ children, style, className = '', onClick, hoverable = true }) {
  return (
    <div
      onClick={onClick}
      className={`glass-panel ${className}`}
      style={{
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all var(--transition-fast)',
        cursor: onClick ? 'pointer' : 'default',
        transform: onClick && hoverable ? 'translateY(0)' : 'none',
        ...style
      }}
      onMouseEnter={(e) => {
        if (onClick && hoverable) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = 'var(--border-color-hover)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick && hoverable) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }
      }}
    >
      {children}
    </div>
  );
}

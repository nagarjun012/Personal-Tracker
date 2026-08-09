import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  const getToastStyle = (type) => {
    const styles = {
      success: {
        borderLeft: '4px solid var(--accent-green)',
        color: 'var(--accent-green)',
        backgroundColor: 'var(--bg-secondary)'
      },
      error: {
        borderLeft: '4px solid var(--accent-red)',
        color: 'var(--accent-red)',
        backgroundColor: 'var(--bg-secondary)'
      },
      warning: {
        borderLeft: '4px solid var(--accent-amber)',
        color: 'var(--accent-amber)',
        backgroundColor: 'var(--bg-secondary)'
      },
      info: {
        borderLeft: '4px solid var(--accent-blue)',
        color: 'var(--accent-blue)',
        backgroundColor: 'var(--bg-secondary)'
      }
    };
    return styles[type] || styles.info;
  };

  const getIcon = (type) => {
    if (type === 'success') return <CheckCircle2 size={18} />;
    if (type === 'error' || type === 'warning') return <AlertCircle size={18} />;
    return <Info size={18} />;
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      zIndex: 3000,
      pointerEvents: 'none',
      width: '100%',
      maxWidth: '350px'
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            borderTop: '1px solid var(--border-color)',
            borderRight: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)',
            pointerEvents: 'auto',
            animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            ...getToastStyle(toast.type)
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {getIcon(toast.type)}
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {toast.message}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Sun, 
  Plus, 
  BarChart3, 
  Settings 
} from 'lucide-react';

export default function BottomNav() {
  const { activeTab, setActiveTab, setShowQuickAdd, user } = useApp();

  if (!user) return null;

  const handleQuickAddClick = (e) => {
    e.stopPropagation();
    setShowQuickAdd(true);
  };

  return (
    <nav className="glass-panel" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '70px',
      display: 'none', // Shown only on mobile in CSS (media query)
      alignItems: 'center',
      justifyContent: 'space-around',
      borderRadius: '0',
      borderTop: '1px solid var(--border-color)',
      background: 'var(--bg-sidebar)',
      zIndex: 90
    }}
    id="mobile-bottom-nav"
    >
      <button
        onClick={() => setActiveTab('dashboard')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          color: activeTab === 'dashboard' ? 'var(--accent-primary)' : 'var(--text-tertiary)',
          fontSize: '0.75rem',
          fontWeight: activeTab === 'dashboard' ? 600 : 500,
          cursor: 'pointer'
        }}
      >
        <LayoutDashboard size={20} />
        <span>Home</span>
      </button>

      <button
        onClick={() => setActiveTab('myday')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          color: activeTab === 'myday' ? 'var(--accent-primary)' : 'var(--text-tertiary)',
          fontSize: '0.75rem',
          fontWeight: activeTab === 'myday' ? 600 : 500,
          cursor: 'pointer'
        }}
      >
        <Sun size={20} />
        <span>My Day</span>
      </button>

      {/* Floating Center Plus button */}
      <button
        onClick={handleQuickAddClick}
        style={{
          width: '50px',
          height: '50px',
          borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-purple))',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
          cursor: 'pointer',
          marginTop: '-25px',
          border: '4px solid var(--bg-sidebar)',
          transition: 'transform var(--transition-fast)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Plus size={24} />
      </button>

      <button
        onClick={() => setActiveTab('analytics')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          color: activeTab === 'analytics' ? 'var(--accent-primary)' : 'var(--text-tertiary)',
          fontSize: '0.75rem',
          fontWeight: activeTab === 'analytics' ? 600 : 500,
          cursor: 'pointer'
        }}
      >
        <BarChart3 size={20} />
        <span>Analytics</span>
      </button>

      <button
        onClick={() => setActiveTab('settings')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          color: activeTab === 'settings' ? 'var(--accent-primary)' : 'var(--text-tertiary)',
          fontSize: '0.75rem',
          fontWeight: activeTab === 'settings' ? 600 : 500,
          cursor: 'pointer'
        }}
      >
        <Settings size={20} />
        <span>Profile</span>
      </button>
    </nav>
  );
}

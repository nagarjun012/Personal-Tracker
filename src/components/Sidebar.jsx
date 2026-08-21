import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Sun, 
  CheckSquare, 
  Calendar, 
  Flame, 
  Target, 
  Timer, 
  BookOpen, 
  BarChart3, 
  Sparkles, 
  Settings, 
  LogOut,
  Award
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, logout, user, xpData } = useApp();

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'myday', name: 'My Day', icon: Sun },
    { id: 'tasks', name: 'Tasks', icon: CheckSquare },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'habits', name: 'Habits', icon: Flame },
    { id: 'goals', name: 'Goals', icon: Target },
    { id: 'tracker', name: 'Time Tracker', icon: Timer },
    { id: 'journal', name: 'Journal', icon: BookOpen },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'coach', name: 'AI Coach', icon: Sparkles },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  if (!user) return null;

  // Calculate XP Percentage for the sidebar progress bar
  const xpRange = xpData.xpForNext - xpData.prevLevelXp;
  const currentXpProgress = xpData.totalXp - xpData.prevLevelXp;
  const xpPercent = xpRange > 0 ? Math.min(100, Math.round((currentXpProgress / xpRange) * 100)) : 100;

  return (
    <aside className="glass-panel" style={{
      width: '260px',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--border-color)',
      borderRadius: '0',
      zIndex: 100,
      background: 'var(--bg-sidebar)',
      backdropFilter: 'blur(var(--glass-blur))'
    }}>
      {/* App Branding */}
      <div style={{
        padding: '2rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-purple))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)'
        }}>
          P
        </div>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: '1.35rem',
          background: 'linear-gradient(90deg, var(--text-primary), var(--accent-primary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Personal Tracker
        </span>
      </div>

      {/* Navigation List */}
      <nav style={{
        flex: 1,
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        overflowY: 'auto'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(var(--accent-primary-rgb), 0.08)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                borderRadius: isActive ? '0 var(--radius-sm) var(--radius-sm) 0' : 'var(--radius-sm)',
                transition: 'all var(--transition-fast)'
              }}
              className="nav-btn"
            >
              <Icon size={18} style={{
                color: isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                transition: 'color var(--transition-fast)'
              }} />
              <span style={{ fontSize: '0.95rem' }}>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Profile & XP Widget */}
      <div style={{
        padding: '1.25rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        background: 'rgba(0,0,0,0.01)'
      }}>
        {/* XP Progress Card */}
        <div className="glass-panel badge-glow" style={{
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <Award size={14} style={{ color: 'var(--accent-purple)' }} />
              Level {xpData.level}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
              {xpData.totalXp} XP
            </span>
          </div>
          <div style={{
            height: '6px',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            width: '100%'
          }}>
            <div style={{
              width: `${xpPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-purple))',
              borderRadius: 'var(--radius-full)',
              transition: 'width var(--transition-slow)'
            }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textAlign: 'right' }}>
            {xpData.xpForNext - xpData.totalXp > 0 ? `${xpData.xpForNext - xpData.totalXp} XP to next level` : 'Max Level'}
          </span>
        </div>

        {/* User Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              flexShrink: 0
            }}>
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </span>
            </div>
          </div>
          <button 
            onClick={logout}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              color: 'var(--text-tertiary)'
            }}
            title="Log Out"
            className="btn-secondary"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

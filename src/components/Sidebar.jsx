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
  Award,
  Info,
  Zap
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
    { id: 'about', name: 'About App', icon: Info },
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
      <div 
        onClick={() => setActiveTab('about')}
        style={{
          padding: '1.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          borderBottom: '1px solid var(--border-color)',
          cursor: 'pointer'
        }}
      >
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 0 14px rgba(99, 102, 241, 0.4)'
        }}>
          <Zap size={20} fill="#ffffff" color="#ffffff" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '1.25rem',
            background: 'linear-gradient(90deg, var(--text-primary), var(--accent-primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.1
          }}>
            Aura Life OS
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.05em' }}>
            PERSONAL EDITION
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{
        flex: 1,
        padding: '1.25rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
        overflowY: 'auto'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                border: 'none',
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer'
              }}
            >
              <Icon size={18} color={isActive ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Section: Gamification Level & Logout */}
      <div style={{
        padding: '1.25rem 1rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* XP Level Card */}
        <div style={{
          padding: '0.85rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
              <Award size={15} />
              <span>Level {xpData.level}</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{xpData.totalXp} XP</span>
          </div>

          <div style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: 'var(--border-color)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${xpPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-purple))',
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* User Profile & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              flexShrink: 0
            }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

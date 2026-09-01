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
  Info,
  X,
  Award
} from 'lucide-react';

export default function MobileDrawer({ isOpen, onClose }) {
  const { activeTab, setActiveTab, logout, user, xpData } = useApp();

  if (!isOpen || !user) return null;

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

  // Calculate XP Percentage
  const xpRange = xpData.xpForNext - xpData.prevLevelXp;
  const currentXpProgress = xpData.totalXp - xpData.prevLevelXp;
  const xpPercent = xpRange > 0 ? Math.min(100, Math.round((currentXpProgress / xpRange) * 100)) : 100;

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      display: 'flex'
    }}>
      {/* Backdrop Overlay */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Slide-out Drawer Panel */}
      <div style={{
        position: 'relative',
        width: '300px',
        maxWidth: '85vw',
        height: '100%',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 201,
        boxShadow: 'var(--shadow-lg)',
        animation: 'slideRight 0.25s ease-out'
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div 
            onClick={() => handleNavClick('about')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          >
            <img 
              src="/favicon.svg" 
              alt="DAILY TRACKER" 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                boxShadow: '0 0 14px rgba(99, 102, 241, 0.4)'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '1.15rem',
                background: 'linear-gradient(90deg, #ffffff, var(--accent-primary), var(--accent-purple))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1
              }}>
                DAILY TRACKER
              </span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.08em' }}>
                PERSONAL SYSTEM
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Gamification Level Banner */}
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(99, 102, 241, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Award size={14} /> Level {xpData.level}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              {xpData.totalXp} XP
            </span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${xpPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-purple))', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <nav style={{
          flex: 1,
          padding: '1rem 0.75rem',
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
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={18} style={{ color: isActive ? '#ffffff' : 'var(--text-tertiary)' }} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User Footer Profile & Logout */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-tertiary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-purple))',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem'
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '140px', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.email}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            style={{
              padding: '0.5rem',
              color: 'var(--accent-red)',
              cursor: 'pointer'
            }}
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

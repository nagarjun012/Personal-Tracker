import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import MobileDrawer from './components/MobileDrawer';
import ToastContainer from './components/ToastContainer';
import QuickAddModal from './components/QuickAddModal';
import CommandPalette from './components/CommandPalette';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import MyDay from './pages/MyDay';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Habits from './pages/Habits';
import Goals from './pages/Goals';
import TimeTracker from './pages/TimeTracker';
import Journal from './pages/Journal';
import Analytics from './pages/Analytics';
import AICoach from './pages/AICoach';
import Settings from './pages/Settings';
import About from './pages/About';

import { Plus, Search, Menu } from 'lucide-react';
import './App.css';

function MainAppContent() {
  const { 
    user, 
    settings, 
    loading, 
    activeTab, 
    setActiveTab,
    setShowQuickAdd, 
    setShowCommandPalette 
  } = useApp();

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Loading DAILY TRACKER...</span>
        </div>
      </div>
    );
  }

  // 1. If not logged in, show login/signup screen
  if (!user) {
    return <Auth />;
  }

  // 2. If new user (onboarding incomplete: main_focus is null/empty), show onboarding flow
  const onboardingIncomplete = settings && !settings.main_focus;
  if (onboardingIncomplete) {
    return <Onboarding />;
  }

  // 3. Main layout router
  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'myday':
        return <MyDay />;
      case 'tasks':
        return <Tasks />;
      case 'calendar':
        return <Calendar />;
      case 'habits':
        return <Habits />;
      case 'goals':
        return <Goals />;
      case 'tracker':
        return <TimeTracker />;
      case 'journal':
        return <Journal />;
      case 'analytics':
        return <Analytics />;
      case 'coach':
        return <AICoach />;
      case 'settings':
        return <Settings />;
      case 'about':
        return <About />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Top Header Bar */}
      <div 
        id="mobile-top-header"
        className="glass-panel"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          zIndex: 90,
          background: 'var(--bg-sidebar)',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        <div 
          onClick={() => setActiveTab('about')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
        >
          <img 
            src="/favicon.svg" 
            alt="DAILY TRACKER" 
            style={{ width: '32px', height: '32px', borderRadius: '10px' }} 
          />
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '1.1rem',
            background: 'linear-gradient(90deg, #ffffff, var(--accent-primary), var(--accent-purple))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            DAILY TRACKER
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setShowCommandPalette(true)}
            style={{
              padding: '0.4rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <Search size={20} />
          </button>

          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            style={{
              padding: '0.4rem',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Navigation Layout */}
      <Sidebar />
      <BottomNav onOpenDrawer={() => setIsMobileDrawerOpen(true)} />
      <MobileDrawer isOpen={isMobileDrawerOpen} onClose={() => setIsMobileDrawerOpen(false)} />

      {/* Main viewport area */}
      <main className="main-content">
        {renderActivePage()}
      </main>

      {/* Desktop Global Floating Plus & Search buttons */}
      <div 
        id="desktop-floating-actions"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 80
        }}
      >
        {/* Command Palette search helper */}
        <button
          onClick={() => setShowCommandPalette(true)}
          className="glass-panel"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)',
            transition: 'transform var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Command Palette (Ctrl + K)"
        >
          <Search size={18} />
        </button>

        {/* Floating Quick Add */}
        <button
          onClick={() => setShowQuickAdd(true)}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-purple))',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            transition: 'transform var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Quick Add Entry"
        >
          <Plus size={22} />
        </button>
      </div>

      {/* Global Overlays */}
      <QuickAddModal />
      <CommandPalette />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

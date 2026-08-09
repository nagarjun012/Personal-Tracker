import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { 
  Search, 
  ChevronRight, 
  Terminal, 
  CheckSquare, 
  Flame, 
  Target, 
  BookOpen,
  Settings,
  Calendar
} from 'lucide-react';

export default function CommandPalette() {
  const { showCommandPalette, setShowCommandPalette, setActiveTab, addToast } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (showCommandPalette) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [showCommandPalette]);

  // Static Navigation items
  const navCommands = [
    { type: 'nav', title: 'Go to Dashboard', subtitle: 'Open main overview board', tab: 'dashboard', icon: Calendar },
    { type: 'nav', title: 'Go to My Day', subtitle: 'View daily schedule vertical planner', tab: 'myday', icon: Calendar },
    { type: 'nav', title: 'Go to Tasks', subtitle: 'View task checklist manager', tab: 'tasks', icon: CheckSquare },
    { type: 'nav', title: 'Go to Habits', subtitle: 'View streaks and annual heatmap', tab: 'habits', icon: Flame },
    { type: 'nav', title: 'Go to Goals', subtitle: 'Check milestones progress', tab: 'goals', icon: Target },
    { type: 'nav', title: 'Go to Time Tracker', subtitle: 'Start focus stopwatch timer', tab: 'tracker', icon: Clock },
    { type: 'nav', title: 'Go to Journal', subtitle: 'Read/Write daily diary reflections', tab: 'journal', icon: BookOpen },
    { type: 'nav', title: 'Go to Settings', subtitle: 'Modify scoring weights & themes', tab: 'settings', icon: Settings }
  ];

  // Fetch search matches when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults(navCommands);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      // If starts with >, filter nav commands
      if (query.startsWith('>')) {
        const term = query.slice(1).trim().toLowerCase();
        const filtered = navCommands.filter(c => c.title.toLowerCase().includes(term));
        setResults(filtered);
        return;
      }

      try {
        const res = await api.get(`/api/search?q=${query}`);
        // Combine nav shortcuts + search matches
        const localFiltered = navCommands.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));
        setResults([...localFiltered, ...res.results]);
      } catch (err) {
        console.error('Palette search failure:', err);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Handle keyboard selections (Arrow keys + Enter)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showCommandPalette) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, results.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(1, results.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          triggerAction(results[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommandPalette, results, selectedIndex]);

  const triggerAction = (cmd) => {
    if (cmd.type === 'nav') {
      setActiveTab(cmd.tab);
      addToast(`Navigated to ${cmd.title.split('Go to ')[1]}`, 'info');
    } else {
      // Search matches navigation
      if (cmd.type === 'task') {
        setActiveTab('tasks');
      } else if (cmd.type === 'habit') {
        setActiveTab('habits');
      } else if (cmd.type === 'goal') {
        setActiveTab('goals');
      } else if (cmd.type === 'journal') {
        setActiveTab('journal');
      }
      addToast(`Opening matched ${cmd.type}`, 'info');
    }
    setShowCommandPalette(false);
  };

  if (!showCommandPalette) return null;

  return (
    <div
      onClick={() => setShowCommandPalette(false)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        animation: 'fadeIn 0.15s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '400px',
          overflow: 'hidden',
          animation: 'slideUp 0.2s ease-out'
        }}
      >
        {/* Search bar input row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          flexShrink: 0
        }}>
          <Search size={18} style={{ color: 'var(--text-tertiary)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type search terms or '>' for quick actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              fontSize: '1.05rem',
              color: 'var(--text-primary)',
              background: 'none',
              border: 'none',
              outline: 'none'
            }}
          />
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            backgroundColor: 'var(--bg-tertiary)',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            ESC
          </span>
        </div>

        {/* Results list */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.5rem'
        }}>
          {results.length === 0 ? (
            <div style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              fontSize: '0.9rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span>🔍</span>
              <span>No results found for "{query}"</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {results.map((cmd, idx) => {
                const isSelected = selectedIndex === idx;
                
                // Determine icon
                let Icon = Terminal;
                if (cmd.type === 'task') Icon = CheckSquare;
                else if (cmd.type === 'habit') Icon = Flame;
                else if (cmd.type === 'goal') Icon = Target;
                else if (cmd.type === 'journal') Icon = BookOpen;
                else if (cmd.icon) Icon = cmd.icon;

                return (
                  <button
                    key={idx}
                    onClick={() => triggerAction(cmd)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'rgba(var(--accent-primary-rgb), 0.08)' : 'transparent',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                      <div style={{
                        padding: '0.35rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isSelected ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-tertiary)'
                      }}>
                        <Icon size={16} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                          {cmd.title}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cmd.subtitle}
                        </span>
                      </div>
                    </div>
                    {isSelected && <ChevronRight size={16} style={{ color: 'var(--accent-primary)' }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple clock icon definition fallback for command palette
function Clock({ size, style }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      style={style}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

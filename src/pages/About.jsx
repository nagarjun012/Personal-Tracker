import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Database, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  Download, 
  Flame, 
  Target, 
  Timer, 
  BookOpen, 
  BarChart3, 
  Zap,
  Globe,
  Award,
  Crown,
  Code2,
  Mail
} from 'lucide-react';
import { api } from '../utils/api';

export default function About() {
  const { user, addToast } = useApp();

  const handleExport = async () => {
    try {
      const data = await api.get('/api/export');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `aura_life_os_backup_${new Date().toLocaleDateString('sv')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addToast('Data backup downloaded successfully!', 'success');
    } catch (err) {
      addToast('Failed to export data backup.', 'error');
    }
  };

  const featureCards = [
    {
      title: 'Local-First Engine',
      icon: Database,
      color: '#6366f1',
      desc: 'Runs 100% inside your browser using IndexedDB & LocalStorage. Zero cloud tracking, zero server latency, and 100% privacy.'
    },
    {
      title: 'Smart Life Coaching',
      icon: Sparkles,
      color: '#a855f7',
      desc: 'Heuristic weekly analytics analyze habit trends, task volume, and focus session durations to recommend optimal schedules.'
    },
    {
      title: 'Habit Matrix & Heatmap',
      icon: Flame,
      color: '#f59e0b',
      desc: 'Annual streak tracking, completion rates, and custom reminders to build long-term discipline.'
    },
    {
      title: 'Goal Milestones',
      icon: Target,
      color: '#10b981',
      desc: 'Break down major monthly and annual objectives into actionable progress milestones.'
    },
    {
      title: 'Focus Stopwatch',
      icon: Timer,
      color: '#ec4899',
      desc: 'Track deep work sessions by category with SVG charts and automated XP rewards.'
    },
    {
      title: 'Journal & Mood Logs',
      icon: BookOpen,
      color: '#3b82f6',
      desc: 'Morning intentions, evening reflections, mood scores, and energy correlations.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }} className="animate-fade">
      {/* Brand Hero Header */}
      <div className="glass-panel" style={{
        padding: '2.5rem',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.08), rgba(236, 72, 153, 0.05))',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1.25rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 24px rgba(99, 102, 241, 0.4)'
        }}>
          <Zap size={38} color="#ffffff" />
        </div>

        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            Aura Life OS
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.25rem', maxWidth: '600px' }}>
            Unified Personal Life Management, Habit Analytics & Focus System
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span className="badge" style={{ padding: '0.4rem 0.85rem', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
            v2.5.0 Professional Edition
          </span>
          <span className="badge" style={{ padding: '0.4rem 0.85rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
            100% Offline & Private
          </span>
          <span className="badge" style={{ padding: '0.4rem 0.85rem', background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
            Netlify Edge CDN Ready
          </span>
        </div>
      </div>

      {/* Creator & Architect Credit Card */}
      <div className="glass-panel hover-lift" style={{
        padding: '2rem 2.5rem',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.05))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
          }}>
            <Crown size={28} />
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
              Created & Engineered By
            </span>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              background: 'linear-gradient(90deg, #ffffff, var(--accent-primary), var(--accent-purple))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginTop: '2px'
            }}>
              NAGARJUN S S
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Chief System Architect & Software Engineer • Aura Life OS
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.85rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '20px', color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
            <Award size={16} />
            <span>Verified Official Release</span>
          </div>

          <a 
            href="mailto:nagarjunarjun612@gmail.com"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'transform 0.2s ease, background 0.2s ease'
            }}
          >
            <Mail size={16} />
            <span>For Queries: nagarjunarjun612@gmail.com</span>
          </a>
        </div>
      </div>

      {/* System Features Grid */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          Core System Capabilities
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {featureCards.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="glass-panel hover-lift" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${feat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: feat.color }}>
                  <Icon size={22} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{feat.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Specifications & Architecture */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} color="var(--accent-primary)" />
          Privacy & Security Standards
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <CheckCircle2 size={18} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '0.875rem' }}>
              <strong>Zero External Telemetry:</strong> No analytics trackers, no third-party scripts, and no personal data transmission to remote servers.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <CheckCircle2 size={18} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '0.875rem' }}>
              <strong>Local Data Ownership:</strong> All tasks, habits, and journals remain securely encrypted inside your browser database.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <CheckCircle2 size={18} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '0.875rem' }}>
              <strong>Instant Portability:</strong> Export your full dataset anytime as a structured JSON file for backups or hardware migration.
            </div>
          </div>
        </div>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            System Architecture: <strong>React 18 + Vite + Local-First IndexedDB Engine</strong>
          </div>

          <button
            onClick={handleExport}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Download size={16} />
            Export Backup (JSON)
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { Card } from '../components/Card';
import { 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function AICoach() {
  const { addToast } = useApp();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adopting, setAdopting] = useState(false);

  const fetchCoachData = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/ai-coach');
      setInsights(data);
    } catch (err) {
      addToast('Failed to retrieve coach analysis.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoachData();
  }, []);

  const handleAdoptSchedule = async () => {
    if (!insights || !insights.proposedSchedule) return;
    setAdopting(true);

    try {
      // Adopt for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      // Fetch tomorrow's activities to check for duplicates
      const existing = await api.get(`/api/activities?date=${tomorrowStr}`);
      if (existing.length > 0) {
        if (!window.confirm('You already have scheduled activities for tomorrow. Adopt anyway and add these slots?')) {
          setAdopting(false);
          return;
        }
      }

      // Schedule each slot
      for (const slot of insights.proposedSchedule) {
        await api.post('/api/activities', {
          title: slot.title,
          category: slot.category,
          start_time: slot.start_time,
          end_time: slot.end_time,
          date: tomorrowStr,
          priority: 'medium',
          reminder: false
        });
      }

      addToast("Tomorrow's schedule adopted successfully! Check your My Day panel. 📅", 'success');
    } catch (err) {
      addToast('Failed to schedule recommended slots.', 'error');
    } finally {
      setAdopting(false);
    }
  };

  if (loading || !insights) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade">
        <div className="skeleton" style={{ height: '80px', borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ height: '220px', borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade">
      
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          padding: '0.5rem',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))',
          color: 'var(--accent-purple)'
        }}>
          <Sparkles size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>AI Daily Coach</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Statistical insights and behavioral schedule coaching.</p>
        </div>
      </div>

      {/* Weekly Brief Card */}
      <Card style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.02), rgba(168,85,247,0.02))',
        border: '1px solid var(--accent-primary)',
        padding: '1.5rem 2rem'
      }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          Weekly Brief Summary
        </h3>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.5' }}>
          {insights.summary}
        </p>
      </Card>

      {/* Split Columns: Warnings + Positives vs Proposed schedule */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '1.5rem',
        alignItems: 'flex-start'
      }}
      className="dashboard-grid"
      >
        {/* Left Column: Recommendations & insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Positives Card */}
          {insights.positives.length > 0 && (
            <Card style={{ borderLeft: '4px solid var(--accent-green)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} /> Positives & Wins
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                {insights.positives.map((pos, i) => (
                  <p key={i} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{pos}</p>
                ))}
              </div>
            </Card>
          )}

          {/* Warnings Card */}
          {insights.warnings.length > 0 && (
            <Card style={{ borderLeft: '4px solid var(--accent-amber)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={14} /> Warnings & Deviances
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                {insights.warnings.map((warn, i) => (
                  <p key={i} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{warn}</p>
                ))}
              </div>
            </Card>
          )}

          {/* Insights / Advice */}
          <Card style={{ borderLeft: '4px solid var(--accent-primary)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={14} /> Heuristic Pattern Insights
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
              {insights.insights.map((ins, i) => (
                <p key={i} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{ins}</p>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Recommended schedule for tomorrow */}
        <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={16} style={{ color: 'var(--accent-purple)' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Coached Plan</h3>
            </div>
          </div>
          
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            Recommended schedule optimized based on sleep hours and high priority backlogs.
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '12px', marginLeft: '6px' }}>
            {insights.proposedSchedule.map((slot, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px', position: 'relative' }}>
                {/* Visual marker dot */}
                <div style={{
                  position: 'absolute',
                  left: '-17px',
                  top: '4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-primary)'
                }} />
                
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                  {slot.start_time} - {slot.end_time}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {slot.title}
                </span>
              </div>
            ))}
          </div>

          <button 
            onClick={handleAdoptSchedule}
            disabled={adopting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', gap: '4px', fontSize: '0.85rem' }}
          >
            Adopt Tomorrow's Schedule
            <ArrowRight size={14} />
          </button>
        </Card>
      </div>

    </div>
  );
}

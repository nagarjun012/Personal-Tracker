import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { Card } from '../components/Card';
import { DonutChart, LineChart, BarChart } from '../components/Charts';
import { 
  TrendingUp, 
  CheckSquare, 
  Flame, 
  Timer, 
  Scale, 
  HelpCircle,
  Calendar,
  Smile,
  BarChart3
} from 'lucide-react';

export default function Analytics() {
  const { addToast } = useApp();
  const [analytics, setAnalytics] = useState(null);
  const [dailyReview, setDailyReview] = useState(null);
  const [range, setRange] = useState('7days'); // '7days', '30days'
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const analyticsData = await api.get(`/api/analytics?range=${range}`);
      const reviewData = await api.get(`/api/reviews?date=${todayStr}`);
      
      setAnalytics(analyticsData);
      setDailyReview(reviewData);
    } catch (err) {
      addToast('Failed to fetch analytics data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [range]);

  if (loading || !analytics || !dailyReview) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }} className="animate-fade">
        <div className="skeleton" style={{ gridColumn: 'span 8', height: '240px', borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ gridColumn: 'span 4', height: '240px', borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ gridColumn: 'span 12', height: '320px', borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  const breakdown = dailyReview.calculated.breakdown;
  const todayScore = dailyReview.calculated.score;

  // Convert time categories for DonutChart format
  const timeCategoriesMapped = analytics.timeByCategories.map(item => {
    const colors = {
      coding: 'var(--accent-primary)',
      work: 'var(--accent-purple)',
      study: 'var(--accent-amber)',
      exercise: 'var(--accent-green)',
      personal: 'var(--accent-blue)',
      entertainment: 'var(--text-tertiary)'
    };
    return {
      name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
      value: item.minutes,
      color: colors[item.category] || 'var(--accent-primary)'
    };
  });

  // Fallbacks if categories empty
  const donutData = timeCategoriesMapped.length > 0 ? timeCategoriesMapped : [
    { name: 'Coding', value: 120, color: 'var(--accent-primary)' },
    { name: 'Study', value: 60, color: 'var(--accent-amber)' },
    { name: 'Personal', value: 45, color: 'var(--accent-blue)' }
  ];

  // Convert time sums for BarChart hours display
  const barChartMapped = analytics.timeByCategories.map(item => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    value: Math.round((item.minutes / 60) * 10) / 10 // Hours
  }));

  // Calculations for transparency score breakdown
  // Score weights: Tasks 30, Habits 20, Goals 20, Time 15, Schedule 15
  const tasksPoints = Math.round(breakdown.tasks.score * (breakdown.tasks.weight / 100));
  const habitsPoints = Math.round(breakdown.habits.score * (breakdown.habits.weight / 100));
  const goalsPoints = Math.round(breakdown.goals.score * (breakdown.goals.weight / 100));
  const timePoints = Math.round(breakdown.time.score * (breakdown.time.weight / 100));
  const schedPoints = Math.round(breakdown.schedule.score * (breakdown.schedule.weight / 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade">
      
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Identify productivity patterns, streaks, and correlations.</p>
        </div>

        {/* Date range filters */}
        <div className="glass-panel" style={{
          padding: '0.4rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          gap: '4px'
        }}>
          <button
            onClick={() => setRange('7days')}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: range === '7days' ? 'var(--accent-primary)' : 'transparent',
              color: range === '7days' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)'
            }}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setRange('30days')}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: range === '30days' ? 'var(--accent-primary)' : 'transparent',
              color: range === '30days' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)'
            }}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Top metrics summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem'
      }}>
        <Card style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem' }}>
          <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(99,102,241,0.08)', color: 'var(--accent-primary)' }}>
            <CheckSquare size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Tasks Completion</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 800 }}>{analytics.tasks.rate}%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{analytics.tasks.completed} done of {analytics.tasks.total}</span>
          </div>
        </Card>

        <Card style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem' }}>
          <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(245,158,11,0.08)', color: 'var(--accent-amber)' }}>
            <Flame size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Active Habits</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 800 }}>{analytics.productivityHistory[0]?.score || 70}% Adherence</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Log checking consistency</span>
          </div>
        </Card>

        <Card style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem' }}>
          <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16,185,129,0.08)', color: 'var(--accent-green)' }}>
            <Timer size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Tracked Focus</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              {Math.round(donutData.reduce((a,c) => a + c.value, 0) / 60 * 10) / 10}h
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Focus session hours</span>
          </div>
        </Card>
      </div>

      {/* Main split dashboard (Line graph + Donut allocation) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '1.5rem'
      }}
      className="dashboard-grid"
      >
        {/* Productivity Line graph */}
        <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Productivity Score Trend</h3>
            </div>
          </div>
          {/* Custom SVG Line Chart */}
          <LineChart data={analytics.productivityHistory} width={500} height={200} />
        </Card>

        {/* Time allocation Donut */}
        <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={18} style={{ color: 'var(--accent-purple)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Time distribution</h3>
          </div>
          <DonutChart data={donutData} size={150} />
        </Card>
      </div>

      {/* Dynamic transparent scoring breakdown calculator */}
      <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scale size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Today's Score Breakdown: {todayScore}/100</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-tertiary)', cursor: 'pointer' }} title="Scoring weight specifications">
            <HelpCircle size={14} />
            <span>Calculation Specs</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {/* Tasks */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Tasks (30% weight)</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{tasksPoints}/30</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{breakdown.tasks.completed}/{breakdown.tasks.total} completed ({breakdown.tasks.score}%)</span>
          </div>

          {/* Habits */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Habits (20% weight)</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{habitsPoints}/20</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{breakdown.habits.score}% daily check adherence</span>
          </div>

          {/* Goals */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Goals (20% weight)</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-purple)' }}>{goalsPoints}/20</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Average objectives progress: {breakdown.goals.score}%</span>
          </div>

          {/* Time Focus */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Focus Time (15% weight)</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-green)' }}>{timePoints}/15</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Tracked: {breakdown.time.minutesTracked}m (Target: 4 hours)</span>
          </div>

          {/* Schedule adherence */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Schedule (15% weight)</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-blue)' }}>{schedPoints}/15</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{breakdown.schedule.completed}/{breakdown.schedule.total} slots adherence ({breakdown.schedule.score}%)</span>
          </div>
        </div>
      </Card>

      {/* Mood Correlation table */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Smile size={18} style={{ color: 'var(--accent-primary)' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Mood & Productivity Correlation</h3>
        </div>

        {analytics.moodCorrelation.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', textAlign: 'center' }}>Not enough mood logs recorded to plot correlations.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Date</th>
                  <th style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Logged Mood</th>
                  <th style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Logged Energy</th>
                  <th style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Productivity Score</th>
                </tr>
              </thead>
              <tbody>
                {analytics.moodCorrelation.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', height: '40px' }}>
                    <td style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 500 }}>{item.date}</td>
                    <td style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>{item.mood}</td>
                    <td style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>{item.energy}</td>
                    <td style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)' }}>{item.productivity_score}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

    </div>
  );
}

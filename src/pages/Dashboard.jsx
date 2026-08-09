import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { Card } from '../components/Card';
import ProgressRing from '../components/ProgressRing';
import { DonutChart } from '../components/Charts';
import { 
  Sun, 
  CheckSquare, 
  Flame, 
  Timer, 
  Sparkles, 
  Calendar,
  ChevronRight,
  TrendingUp,
  Award,
  ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const { user, settings, setActiveTab, addToast } = useApp();
  const [data, setData] = useState(null);
  const [coachInsight, setCoachInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const todayStr = new Date().toLocaleDateString('sv');
      
      // 1. Fetch daily review (contains scores and completions)
      const reviewRes = await api.get(`/api/reviews?date=${todayStr}`);
      
      // 2. Fetch today's activities schedule
      const activs = await api.get(`/api/activities?date=${todayStr}`);
      
      // 3. Fetch habits to count completions
      const habits = await api.get('/api/habits');

      // 4. Fetch AI coach insight summary
      const coach = await api.get('/api/ai-coach');
      setCoachInsight(coach);

      // Fetch yesterday's review dynamically to calculate progress comparison
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('sv');
      let yesterdayScore = 75; // Default fallback baseline
      try {
        const yesterdayRes = await api.get(`/api/reviews?date=${yesterdayStr}`);
        if (yesterdayRes && yesterdayRes.calculated) {
          yesterdayScore = yesterdayRes.calculated.score;
        }
      } catch (e) {
        console.error('Failed to retrieve yesterday score scorecard:', e);
      }

      setData({
        review: reviewRes,
        activities: activs,
        habits,
        yesterdayScore
      });
    } catch (err) {
      console.error('Failed to retrieve dashboard summaries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1. Greeting string
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // 2. Day Progress calculation
  const getDayProgress = () => {
    const wake = settings?.wake_time || '07:00';
    const sleep = settings?.sleep_time || '22:30';

    const [wakeH, wakeM] = wake.split(':').map(Number);
    const [sleepH, sleepM] = sleep.split(':').map(Number);

    const totalMin = (sleepH * 60 + sleepM) - (wakeH * 60 + wakeM);
    if (totalMin <= 0) return 50; // Fallback

    const currentMin = (currentTime.getHours() * 60 + currentTime.getMinutes()) - (wakeH * 60 + wakeM);
    
    if (currentMin <= 0) return 0;
    if (currentMin >= totalMin) return 100;
    
    return Math.round((currentMin / totalMin) * 100);
  };

  if (loading || !data) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }} className="animate-fade">
        <div className="skeleton" style={{ gridColumn: 'span 12', height: '120px', borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ gridColumn: 'span 4', height: '220px', borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ gridColumn: 'span 4', height: '220px', borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ gridColumn: 'span 4', height: '220px', borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ gridColumn: 'span 8', height: '300px', borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ gridColumn: 'span 4', height: '300px', borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  const reviewBreakdown = data.review.calculated.breakdown;
  const todayScore = data.review.calculated.score;

  // Compare score with yesterday dynamically
  const scoreDiff = todayScore - data.yesterdayScore;

  // Donut category mapping
  const donutCategories = [
    { name: 'Coding', value: reviewBreakdown.time.minutesTracked > 0 ? reviewBreakdown.time.minutesTracked : 0, color: 'var(--accent-primary)' },
    { name: 'Study', value: 30, color: 'var(--accent-amber)' }, // Sample fallbacks if zero
    { name: 'Exercise', value: 50, color: 'var(--accent-green)' },
    { name: 'Personal', value: 45, color: 'var(--accent-blue)' }
  ];

  // If time tracked exists, override with real data
  if (reviewBreakdown.time.minutesTracked > 0) {
    donutCategories[0].value = reviewBreakdown.time.minutesTracked;
  }

  // Habits completed today count
  const habitsCompletedCount = data.habits.filter(h => {
    const todayStr = new Date().toLocaleDateString('sv');
    const loggedToday = h.logs?.find(l => l.date === todayStr);
    return loggedToday && loggedToday.status === 'completed';
  }).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade">
      
      {/* 1. Header Greeting & Day Progress bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>
            {getGreeting()}, {user?.name.split(' ')[0]} 👋
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            <Calendar size={16} />
            <span>
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            <span>•</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Day Progress container */}
        <div className="glass-panel" style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          width: '100%',
          maxWidth: '300px',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Day Progress</span>
            <span style={{ color: 'var(--accent-primary)' }}>{getDayProgress()}%</span>
          </div>
          <div style={{
            height: '6px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${getDayProgress()}%`,
              height: '100%',
              backgroundColor: 'var(--accent-primary)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 1s ease'
            }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
            You're {getDayProgress()}% through your planned day.
          </span>
        </div>
      </div>

      {/* 2. Top Stats row (Productivity, Tasks, Habits) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Productivity score card */}
        <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Productivity Score
            </span>
            <span style={{ fontSize: '2rem', fontWeight: 800 }}>{todayScore}%</span>
            <span style={{ fontSize: '0.8rem', color: scoreDiff >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
              <TrendingUp size={12} />
              {scoreDiff >= 0 ? `↑ ${scoreDiff}%` : `↓ ${Math.abs(scoreDiff)}%`} vs yesterday
            </span>
          </div>
          <ProgressRing size={80} strokeWidth={8} progress={todayScore} color="var(--accent-primary)" />
        </Card>

        {/* Today's Tasks completed */}
        <Card 
          onClick={() => setActiveTab('tasks')}
          style={{ display: 'flex', flexDirection: 'column', justify: 'space-between', padding: '1.25rem 1.5rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Tasks Completed
              </span>
              <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                {reviewBreakdown.tasks.completed} / {reviewBreakdown.tasks.total}
              </span>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(99,102,241,0.08)', color: 'var(--accent-primary)' }}>
              <CheckSquare size={20} />
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{
                width: `${reviewBreakdown.tasks.total > 0 ? (reviewBreakdown.tasks.completed / reviewBreakdown.tasks.total) * 100 : 100}%`,
                height: '100%',
                backgroundColor: 'var(--accent-green)',
                borderRadius: 'var(--radius-full)'
              }} />
            </div>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
              <span>View task board</span>
              <ChevronRight size={14} />
            </span>
          </div>
        </Card>

        {/* Habits Progress card */}
        <Card 
          onClick={() => setActiveTab('habits')}
          style={{ display: 'flex', flexDirection: 'column', justify: 'space-between', padding: '1.25rem 1.5rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Daily Habits
              </span>
              <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                {habitsCompletedCount} / {data.habits.length}
              </span>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(245,158,11,0.08)', color: 'var(--accent-amber)' }}>
              <Flame size={20} />
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{
                width: `${data.habits.length > 0 ? (habitsCompletedCount / data.habits.length) * 100 : 0}%`,
                height: '100%',
                backgroundColor: 'var(--accent-amber)',
                borderRadius: 'var(--radius-full)'
              }} />
            </div>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
              <span>View streak boards</span>
              <ChevronRight size={14} />
            </span>
          </div>
        </Card>
      </div>

      {/* 3. Main Dashboard Body: Timeline + Time distribution + AI summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '1.5rem'
      }}
      className="dashboard-grid"
      >
        {/* Daily timeline schedule summary */}
        <Card style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sun size={18} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Today's Timeline</h3>
            </div>
            <button 
              onClick={() => setActiveTab('myday')}
              className="btn-secondary" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
            >
              Full Schedule
            </button>
          </div>

          {data.activities.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <span>📭</span>
              <span style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>No schedule activities created for today.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
              {data.activities.slice(0, 5).map(act => (
                <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-tertiary)', width: '90px' }}>
                    {act.start_time} - {act.end_time}
                  </span>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: act.completed === 1 ? 'var(--accent-green)' : 'var(--text-tertiary)' }} />
                  <div style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, textDecoration: act.completed === 1 ? 'line-through' : 'none', opacity: act.completed === 1 ? 0.6 : 1 }}>
                      {act.title}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase'
                    }}>
                      {act.category}
                    </span>
                  </div>
                </div>
              ))}
              {data.activities.length > 5 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                  + {data.activities.length - 5} more items scheduled
                </span>
              )}
            </div>
          )}
        </Card>

        {/* Side column: Time tracked categories + AI recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Time tracked category Donut */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Timer size={18} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Time Allocation</h3>
            </div>
            <DonutChart size={130} strokeWidth={16} data={donutCategories} />
          </Card>

          {/* AI Insight Box */}
          <Card 
            onClick={() => setActiveTab('coach')}
            style={{ 
              background: 'linear-gradient(135deg, rgba(99,102,241,0.03), rgba(168,85,247,0.03))',
              border: '1px dashed var(--accent-primary)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Sparkles size={18} style={{ color: 'var(--accent-purple)' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-purple)' }}>AI Coach Brief</h3>
            </div>

            {coachInsight && (coachInsight.positives.length > 0 || coachInsight.warnings.length > 0) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ fontSize: '0.85rem', lineHeight: '1.4', color: 'var(--text-secondary)' }}>
                  {coachInsight.warnings[0] || coachInsight.positives[0] || coachInsight.insights[0]}
                </p>
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', marginTop: '0.25rem' }}>
                  Open AI Coach panel
                  <ArrowRight size={12} />
                </span>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                Analyzing focus patterns... Track code or habits to generate coaching cards.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

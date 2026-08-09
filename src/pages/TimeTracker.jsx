import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { Card } from '../components/Card';
import { BarChart } from '../components/Charts';
import { 
  Play, 
  Square, 
  Clock, 
  Trash2, 
  TrendingUp, 
  FolderGit2,
  Calendar
} from 'lucide-react';

export default function TimeTracker() {
  const { runningTimer, timerSeconds, startTimer, stopTimer, addToast } = useApp();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [activityName, setActivityName] = useState('');
  const [category, setCategory] = useState('coding');

  const fetchEntries = async () => {
    try {
      const data = await api.get('/api/time-entries');
      setEntries(data);
    } catch (err) {
      addToast('Failed to fetch time logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [runningTimer]); // Re-fetch list when timer starts/stops

  const handleStart = (e) => {
    e.preventDefault();
    if (!activityName.trim()) {
      addToast('Please enter what you are working on.', 'warning');
      return;
    }
    startTimer(activityName, category);
    setActivityName('');
  };

  const formatDuration = (sec) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getCategoryColor = (cat) => {
    const colors = {
      coding: 'var(--accent-primary)',
      work: 'var(--accent-purple)',
      study: 'var(--accent-amber)',
      exercise: 'var(--accent-green)',
      personal: 'var(--accent-blue)',
      entertainment: 'var(--text-tertiary)'
    };
    return colors[cat] || 'var(--accent-primary)';
  };

  // Compile weekly bar chart data
  const getWeeklyStats = () => {
    const categories = ['coding', 'study', 'work', 'exercise', 'personal', 'entertainment'];
    const sums = { coding: 0, study: 0, work: 0, exercise: 0, personal: 0, entertainment: 0 };
    
    // Filter last 7 days entries
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - 7);

    entries.forEach(entry => {
      if (entry.duration && new Date(entry.start_time) >= limitDate) {
        if (sums[entry.category] !== undefined) {
          sums[entry.category] += entry.duration;
        }
      }
    });

    return categories.map(cat => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: Math.round((sums[cat] || 0) / 3600 * 10) / 10 // Hours rounded to 1 decimal
    }));
  };

  const barChartData = getWeeklyStats();
  const totalTrackedSeconds = entries.reduce((acc, curr) => acc + (curr.duration || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade">
      
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Time Tracker</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track focused sessions and log daily productivity metrics.</p>
      </div>

      {/* Main split grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '1.5rem',
        alignItems: 'flex-start'
      }}
      className="dashboard-grid"
      >
        {/* Timer Control Panel & History list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Active Timer Box */}
          <Card style={{
            background: runningTimer ? 'linear-gradient(135deg, rgba(99,102,241,0.02), rgba(168,85,247,0.02))' : 'var(--bg-secondary)',
            border: runningTimer ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            {runningTimer ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: getCategoryColor(runningTimer.category),
                    backgroundColor: `${getCategoryColor(runningTimer.category)}15`,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    width: 'max-content',
                    margin: '0 auto'
                  }}>
                    {runningTimer.category}
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem' }}>{runningTimer.activity_name}</h2>
                </div>

                {/* Animated Clock Display */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '3rem',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  color: 'var(--text-primary)',
                  animation: 'pulseScale 2s infinite ease-in-out'
                }}>
                  <Clock size={36} style={{ color: 'var(--accent-primary)' }} />
                  {formatDuration(timerSeconds)}
                </div>

                <button 
                  onClick={stopTimer}
                  className="btn btn-danger"
                  style={{ padding: '0.8rem 2rem', borderRadius: 'var(--radius-full)', gap: '6px' }}
                >
                  <Square size={16} fill="white" />
                  Stop & Log Session
                </button>
              </>
            ) : (
              <form onSubmit={handleStart} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, textAlign: 'left' }}>Start Focus Session</h3>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>What are you focusing on?</label>
                  <input
                    type="text"
                    placeholder="e.g. Debugging server.js endpoints"
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    className="input-field"
                  >
                    <option value="coding">Coding</option>
                    <option value="work">Work</option>
                    <option value="study">Study</option>
                    <option value="exercise">Exercise</option>
                    <option value="personal">Personal</option>
                    <option value="entertainment">Entertainment</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-md)' }}
                >
                  <Play size={16} fill="white" />
                  Start Timer
                </button>
              </form>
            )}
          </Card>

          {/* History list */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Calendar size={18} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Focus Session Log</h3>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: '60px', borderRadius: 'var(--radius-sm)' }} />)}
              </div>
            ) : entries.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                No recorded sessions. Start tracking to build focus graphs.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {entries.map(entry => {
                  const durationFormatted = entry.duration 
                    ? `${Math.floor(entry.duration / 3600)}h ${Math.floor((entry.duration % 3600) / 60)}m`
                    : 'Running...';
                  const dateObj = new Date(entry.start_time);
                  const formattedDate = dateObj.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                  return (
                    <div 
                      key={entry.id} 
                      style={{ 
                        padding: '0.75rem 1rem', 
                        borderRadius: 'var(--radius-md)', 
                        backgroundColor: 'var(--bg-tertiary)',
                        borderLeft: `4px solid ${getCategoryColor(entry.category)}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{entry.activity_name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{formattedDate}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          fontSize: '0.8rem', 
                          fontWeight: 700, 
                          color: 'var(--text-primary)',
                          backgroundColor: 'var(--bg-primary)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)'
                        }}>
                          {durationFormatted}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Side Panel: Focus graph charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Quick Stats overview */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <TrendingUp size={18} style={{ color: 'var(--accent-purple)' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Weekly Summary</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Tracked Focus</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {Math.round(totalTrackedSeconds / 3600)} hrs
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tracked Sessions</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{entries.length}</span>
              </div>
            </div>
          </Card>

          {/* Bar Chart mapping hours per category */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <FolderGit2 size={18} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Focus categories</h3>
            </div>
            <BarChart data={barChartData} size={150} width={290} height={200} />
          </Card>
        </div>

      </div>
    </div>
  );
}

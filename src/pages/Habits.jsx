import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { Card } from '../components/Card';
import Modal from '../components/Modal';
import { HabitHeatmap } from '../components/Charts';
import { 
  Plus, 
  Flame, 
  Award, 
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  Smile,
  Trash2
} from 'lucide-react';

export default function Habits() {
  const { refreshXp, addToast } = useApp();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Habit Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('dumbbell');
  const [color, setColor] = useState('#6366f1');
  const [target, setTarget] = useState(1);
  const [reminder, setReminder] = useState('08:00');

  // Fetch habits
  const fetchHabits = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/habits');
      setHabits(data);
    } catch (err) {
      addToast('Failed to load habits.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  // Generate last 7 dates for the weekly tracking grid
  const getWeeklyDates = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toLocaleDateString('sv'));
    }
    return dates;
  };

  const weeklyDates = getWeeklyDates();

  const handleToggleLog = async (habitId, date, isLogged) => {
    const newStatus = isLogged ? 'missed' : 'completed';
    try {
      await api.post('/api/habits/log', {
        habit_id: habitId,
        date,
        status: newStatus
      });
      addToast(
        newStatus === 'completed' 
          ? 'Habit checked! +5 XP earned! ⭐' 
          : 'Habit unchecked.', 
        'success'
      );
      fetchHabits();
      refreshXp();
    } catch (err) {
      addToast('Failed to log habit.', 'error');
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.post('/api/habits', {
        name,
        icon,
        color,
        frequency: 'daily',
        target: parseInt(target) || 1,
        reminder_time: reminder || null
      });
      addToast('New habit created! Start building your streak. 🔥', 'success');
      setIsAddOpen(false);
      setName('');
      fetchHabits();
    } catch (err) {
      addToast('Failed to create habit.', 'error');
    }
  };

  const handleDeleteHabit = async (id) => {
    if (!window.confirm('Delete this habit permanently? All historic completion logs will be lost.')) return;
    try {
      await api.delete(`/api/habits/${id}`);
      addToast('Habit deleted.', 'info');
      fetchHabits();
    } catch (err) {
      addToast('Failed to delete habit.', 'error');
    }
  };

  // Compile all logs from all habits into a single array for the contribution heatmap!
  const allHabitLogs = habits.flatMap(h => {
    return (h.logs || []).map(l => ({ ...l, habitName: h.name }));
  });

  const iconOptions = ['dumbbell', 'code', 'book-open', 'droplet', 'sparkles', 'check-circle'];
  const colorOptions = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#a855f7', '#ef4444'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade">
      
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Habit Tracker</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track daily routines, build streaks, and form positive behaviors.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="btn btn-primary"
          style={{ padding: '0.75rem 1.25rem' }}
        >
          <Plus size={18} />
          Create Habit
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          <div className="skeleton" style={{ height: '220px', borderRadius: 'var(--radius-lg)' }} />
          <div className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-lg)' }} />
        </div>
      ) : habits.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <span style={{ fontSize: '2.5rem' }}>🔥</span>
          <h3 style={{ fontSize: '1.25rem', marginTop: '1rem', fontWeight: 600 }}>Form positive daily routines</h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>Add habits like workout, coding or meditation to earn XP streaks.</p>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="btn btn-secondary" 
            style={{ marginTop: '1.25rem' }}
          >
            Create Your First Habit
          </button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Weekly Tracker Grid card */}
          <Card style={{ overflowX: 'auto', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Calendar size={18} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Weekly Log Checklist</h3>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Habit</th>
                  {weeklyDates.map(date => {
                    const dateObj = new Date(date);
                    const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', timeZone: 'UTC' });
                    const isToday = date === new Date().toLocaleDateString('sv');
                    return (
                      <th key={date} style={{ 
                        padding: '0.75rem', 
                        fontSize: '0.8rem', 
                        color: isToday ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                        fontWeight: isToday ? 700 : 500
                      }}>
                        {label}
                      </th>
                    );
                  })}
                  <th style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Stats</th>
                  <th style={{ padding: '0.75rem', width: '50px' }} />
                </tr>
              </thead>
              <tbody>
                {habits.map(h => (
                  <tr key={h.id} style={{ borderBottom: '1px solid var(--border-color)', height: '58px' }}>
                    {/* Habit details */}
                    <td style={{ padding: '0.5rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: `${h.color}15`,
                          color: h.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.85rem'
                        }}>
                          {h.name[0].toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{h.name}</span>
                          {h.reminder_time && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <Clock size={8} /> {h.reminder_time}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Completion checkboxes */}
                    {weeklyDates.map(date => {
                      const log = h.logs?.find(l => l.date === date);
                      const isLogged = log && log.status === 'completed';

                      return (
                        <td key={date} style={{ textAlign: 'center', padding: '0.5rem' }}>
                          <button
                            onClick={() => handleToggleLog(h.id, date, isLogged)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: 'var(--radius-sm)',
                              border: isLogged ? 'none' : '2px solid var(--border-color)',
                              backgroundColor: isLogged ? h.color : 'transparent',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              transition: 'all var(--transition-fast)'
                            }}
                          >
                            {isLogged && <CheckCircle size={16} />}
                          </button>
                        </td>
                      );
                    })}

                    {/* Streak & stats readout */}
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justify: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600, color: 'var(--accent-amber)' }}>
                          <Flame size={12} />
                          {h.currentStreak}
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {h.completionRate}%
                        </span>
                      </div>
                    </td>

                    {/* Delete action */}
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleDeleteHabit(h.id)}
                        style={{ color: 'var(--text-tertiary)', cursor: 'pointer' }}
                        className="btn-danger-hover"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* GitHub style heatmaps summary card */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Award size={18} style={{ color: 'var(--accent-purple)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Habit Consistency Heatmap</h3>
            </div>
            <HabitHeatmap logs={allHabitLogs} />
          </Card>
        </div>
      )}

      {/* Create Habit Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Habit">
        <form onSubmit={handleCreateHabit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label>Habit Name</label>
            <input
              type="text"
              placeholder="e.g. Morning Meditation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Icon Style</label>
              <select value={icon} onChange={(e) => setIcon(e.target.value)} className="input-field">
                {iconOptions.map(ico => <option key={ico} value={ico}>{ico}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Accent Color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', height: '40px' }}>
                {colorOptions.map(col => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setColor(col)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: col,
                      border: color === col ? '2px solid var(--text-primary)' : '1px solid transparent',
                      cursor: 'pointer',
                      transform: color === col ? 'scale(1.15)' : 'none',
                      transition: 'transform var(--transition-fast)'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Daily Target Quantity</label>
              <input
                type="number"
                min="1"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label>Reminder Time</label>
              <input
                type="time"
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            Create Habit
          </button>
        </form>
      </Modal>
    </div>
  );
}

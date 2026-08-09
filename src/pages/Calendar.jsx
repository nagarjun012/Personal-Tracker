import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { Card } from '../components/Card';
import Modal from '../components/Modal';
import ProgressRing from '../components/ProgressRing';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  BookOpen,
  Smile,
  Activity
} from 'lucide-react';

export default function Calendar() {
  const { addToast } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 9)); // Default to seeded date (Aug 9, 2026)
  
  // Dynamic Month data
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Scorecard modal state
  const [selectedDate, setSelectedDate] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [scorecardLoading, setScorecardLoading] = useState(false);

  const fetchMonthData = async () => {
    try {
      // Fetch all logs to plot on calendar cells
      const tData = await api.get('/api/tasks');
      const hData = await api.get('/api/habits');
      setTasks(tData);
      setHabits(hData);
    } catch (err) {
      console.error('Failed to sync calendar logs:', err);
    }
  };

  useEffect(() => {
    fetchMonthData();
  }, []);

  // Load complete day history details when clicking cell
  const handleDateClick = async (dateStr) => {
    setSelectedDate(dateStr);
    setScorecardLoading(true);
    setScorecard(null);
    
    try {
      // 1. Fetch calculated daily review score
      const scoreRes = await api.get(`/api/reviews?date=${dateStr}`);
      
      // 2. Fetch journal entry for this date
      const journalRes = await api.get(`/api/journal?date=${dateStr}`);
      
      // 3. Fetch mood log for this date
      const moodRes = await api.get(`/api/mood?date=${dateStr}`);

      // 4. Fetch tasks due on this date
      const dayTasks = tasks.filter(t => t.due_date === dateStr);

      // 5. Fetch habits completed on this date
      const dayHabits = habits.map(h => {
        const completed = h.logs?.some(l => l.date === dateStr && l.status === 'completed');
        return { name: h.name, completed, color: h.color };
      });

      // 6. Fetch activities for this date
      const dayActivities = await api.get(`/api/activities?date=${dateStr}`);

      setScorecard({
        score: scoreRes.calculated.score,
        breakdown: scoreRes.calculated.breakdown,
        savedReview: scoreRes.savedReview,
        journal: journalRes.length > 0 ? journalRes[0] : null,
        mood: moodRes.length > 0 ? moodRes[0] : null,
        tasks: dayTasks,
        habits: dayHabits,
        activities: dayActivities
      });

    } catch (err) {
      addToast('Failed to retrieve day details.', 'error');
    } finally {
      setScorecardLoading(false);
    }
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Calendar math functions
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // Day index of 1st day (0=Sun, 6=Sat)
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate(); // Count of days

  // Grid array construction
  const calendarCells = [];
  
  // Previous month padding cells
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const padDate = new Date(year, month - 1, prevMonthDays - i);
    calendarCells.push({ date: padDate, isCurrentMonth: false });
  }

  // Current month active cells
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const cellDate = new Date(year, month, d);
    calendarCells.push({ date: cellDate, isCurrentMonth: true });
  }

  // Next month padding cells to round out the 6-row grid (42 cells)
  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const padDate = new Date(year, month + 1, d);
    calendarCells.push({ date: padDate, isCurrentMonth: false });
  }

  const getDayMetrics = (dateStr) => {
    const dayTasks = tasks.filter(t => t.due_date === dateStr);
    
    // Count habit completions
    let habitCount = 0;
    habits.forEach(h => {
      if (h.logs?.some(l => l.date === dateStr && l.status === 'completed')) {
        habitCount++;
      }
    });

    return {
      tasksCount: dayTasks.length,
      tasksCompleted: dayTasks.filter(t => t.status === 'Completed').length,
      habitsCount: habitCount
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade">
      
      {/* Calendar Header Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Calendar</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Browse schedule milestones and review past scorecards.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={prevMonth} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={nextMonth} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <Card style={{ padding: '1rem' }}>
        {/* Days of week */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <span key={d} style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{d}</span>
          ))}
        </div>

        {/* Calendar days cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {calendarCells.map((cell, idx) => {
            const dateStr = cell.date.toISOString().split('T')[0];
            const isToday = dateStr === new Date().toLocaleDateString('sv');
            const metrics = getDayMetrics(dateStr);

            return (
              <div
                key={idx}
                onClick={() => handleDateClick(dateStr)}
                style={{
                  minHeight: '90px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: cell.isCurrentMonth ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                  border: isToday ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: cell.isCurrentMonth ? 1 : 0.45,
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.borderColor = 'var(--text-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = isToday ? 'var(--accent-primary)' : 'var(--border-color)';
                }}
              >
                {/* Cell Number */}
                <span style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: isToday ? 800 : 600, 
                  color: isToday ? 'var(--accent-primary)' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: isToday ? '50%' : 'none',
                  backgroundColor: isToday ? 'rgba(99,102,241,0.1)' : 'transparent'
                }}>
                  {cell.date.getDate()}
                </span>

                {/* Event Dots/Indicators */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '0.5rem' }}>
                  {metrics.tasksCount > 0 && (
                    <span style={{ 
                      fontSize: '0.65rem', 
                      backgroundColor: 'rgba(99,102,241,0.1)', 
                      color: 'var(--accent-primary)',
                      padding: '1px 4px',
                      borderRadius: '2px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden'
                    }}>
                      📝 {metrics.tasksCompleted}/{metrics.tasksCount} Tasks
                    </span>
                  )}

                  {metrics.habitsCount > 0 && (
                    <span style={{ 
                      fontSize: '0.65rem', 
                      backgroundColor: 'rgba(245,158,11,0.1)', 
                      color: 'var(--accent-amber)',
                      padding: '1px 4px',
                      borderRadius: '2px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden'
                    }}>
                      🔥 {metrics.habitsCount} Habits
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Historic scorecard review modal */}
      <Modal 
        isOpen={selectedDate !== null} 
        onClose={() => setSelectedDate(null)} 
        title={`Daily Scorecard — ${selectedDate}`}
        maxWidth="580px"
      >
        {scorecardLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
            <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
            <div className="skeleton" style={{ width: '200px', height: '20px' }} />
            <div className="skeleton" style={{ width: '100%', height: '100px' }} />
          </div>
        ) : scorecard ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Score circle + Mood */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-tertiary)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Productivity Performance</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>Score: {scorecard.score}/100</span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '0.25rem' }}>
                  {scorecard.mood && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      Mood: {scorecard.mood.mood}
                    </span>
                  )}
                  {scorecard.mood && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      Energy: {scorecard.mood.energy}
                    </span>
                  )}
                </div>
              </div>
              <ProgressRing size={65} strokeWidth={6} progress={scorecard.score} color="var(--accent-primary)" />
            </div>

            {/* Tasks Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tasks Due</span>
              {scorecard.tasks.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>No tasks scheduled.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {scorecard.tasks.map(t => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                      {t.status === 'Completed' ? (
                        <CheckCircle size={14} style={{ color: 'var(--accent-green)' }} />
                      ) : (
                        <Clock size={14} style={{ color: 'var(--text-tertiary)' }} />
                      )}
                      <span style={{ textDecoration: t.status === 'Completed' ? 'line-through' : 'none', opacity: t.status === 'Completed' ? 0.6 : 1 }}>
                        {t.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Habits Completed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Habits Tracker</span>
              {scorecard.habits.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>No active habits found.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {scorecard.habits.map((h, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: h.completed ? `${h.color}15` : 'var(--bg-tertiary)',
                        color: h.completed ? h.color : 'var(--text-tertiary)',
                        border: h.completed ? `1px solid ${h.color}` : '1px solid var(--border-color)',
                      }}
                    >
                      {h.completed ? '✓ ' : '○ '} {h.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Journal Notes */}
            {scorecard.journal && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <BookOpen size={14} style={{ color: 'var(--accent-purple)' }} />
                  Journal Reflection
                </span>
                {scorecard.journal.notes && (
                  <p style={{ fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    "{scorecard.journal.notes}"
                  </p>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  {scorecard.journal.went_well && (
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-green)' }}>What went well:</span>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{scorecard.journal.went_well}</p>
                    </div>
                  )}
                  {scorecard.journal.grateful_for && (
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-blue)' }}>Grateful for:</span>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{scorecard.journal.grateful_for}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        ) : (
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', textAlign: 'center' }}>No historical logs available for this date.</p>
        )}
      </Modal>

    </div>
  );
}

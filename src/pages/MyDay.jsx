import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { Card } from '../components/Card';
import Modal from '../components/Modal';
import { 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  Activity, 
  AlertCircle, 
  Tag, 
  ArrowRight, 
  ListTodo
} from 'lucide-react';

export default function MyDay() {
  const { settings, refreshXp, addToast } = useApp();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDate, setActiveDate] = useState(new Date().toLocaleDateString('sv'));

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('personal');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [priority, setPriority] = useState('medium');
  const [reminder, setReminder] = useState(false);
  const [notes, setNotes] = useState('');

  // Fetch activities
  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/activities?date=${activeDate}`);
      setActivities(data);
    } catch (err) {
      addToast('Failed to fetch schedule.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [activeDate]);

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) return;

    // Validation: end time after start time
    if (startTime >= endTime) {
      addToast('End time must be after start time.', 'warning');
      return;
    }

    try {
      await api.post('/api/activities', {
        title,
        description,
        category,
        start_time: startTime,
        end_time: endTime,
        date: activeDate,
        priority,
        reminder,
        notes
      });
      addToast('Activity scheduled! ⏱️', 'success');
      setIsAddOpen(false);
      resetForm();
      fetchActivities();
    } catch (err) {
      addToast('Failed to schedule activity.', 'error');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('personal');
    setStartTime('09:00');
    setEndTime('10:00');
    setPriority('medium');
    setReminder(false);
    setNotes('');
  };

  const handleToggleComplete = async (act) => {
    const nextCompleted = act.completed === 1 ? 0 : 1;
    try {
      await api.put(`/api/activities/${act.id}`, {
        completed: nextCompleted
      });
      
      if (nextCompleted === 1) {
        addToast('Activity completed! Adherence bonus earned! ⭐', 'success');
        refreshXp();
      } else {
        addToast('Activity marked incomplete.', 'info');
      }
      fetchActivities();
    } catch (err) {
      addToast('Failed to update activity.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scheduled slot?')) return;
    try {
      await api.delete(`/api/activities/${id}`);
      addToast('Activity removed.', 'info');
      fetchActivities();
    } catch (err) {
      addToast('Failed to delete activity.', 'error');
    }
  };

  const wakeTime = settings?.wake_time || '07:00';
  const sleepTime = settings?.sleep_time || '22:30';

  const wakeHour = parseInt(wakeTime.split(':')[0]);
  const sleepHour = parseInt(sleepTime.split(':')[0]);

  // Generate Hour blocks for the visual timeline
  const timelineHours = [];
  for (let h = wakeHour; h <= Math.min(23, sleepHour + 1); h++) {
    timelineHours.push(h);
  }

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

  // Convert time string "HH:MM" to numerical decimal hours (e.g. "09:30" -> 9.5)
  const timeToDecimal = (tStr) => {
    const [h, m] = tStr.split(':').map(Number);
    return h + m / 60;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade">
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>My Day</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Schedule and structure your day for maximum focus.
          </p>
        </div>
        
        {/* Date Selector and Add block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="date"
            value={activeDate}
            onChange={(e) => setActiveDate(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '0.6rem 1rem' }}
          />
          <button 
            onClick={() => setIsAddOpen(true)}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.25rem' }}
          >
            <Plus size={18} />
            Add Slot
          </button>
        </div>
      </div>

      {/* Main planner grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '1.5rem',
        alignItems: 'flex-start'
      }}
      className="dashboard-grid"
      >
        {/* Visual Timeline Panel */}
        <Card style={{ padding: '1.5rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
            <Activity size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Day Schedule Timeline</h3>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '70px', borderRadius: 'var(--radius-sm)' }} />)}
            </div>
          ) : (
            <div style={{ position: 'relative', minHeight: `${timelineHours.length * 70}px`, paddingLeft: '50px' }}>
              {/* Hour Lines */}
              {timelineHours.map((hour, idx) => {
                const hourStr = `${String(hour).padStart(2, '0')}:00`;
                return (
                  <div key={hour} style={{
                    position: 'absolute',
                    top: `${idx * 70}px`,
                    left: 0,
                    right: 0,
                    height: '1px',
                    borderTop: '1px dashed var(--border-color)',
                    display: 'flex',
                    alignItems: 'flex-start'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: '-50px',
                      top: '-9px',
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                      fontWeight: 600,
                      width: '45px',
                      textAlign: 'right'
                    }}>
                      {hourStr}
                    </span>
                  </div>
                );
              })}

              {/* Absolutely-positioned Activity cards spanning exact time heights! */}
              {activities.map(act => {
                const decStart = timeToDecimal(act.start_time);
                const decEnd = timeToDecimal(act.end_time);

                // Skip drawing if outside wake/sleep limits
                if (decStart < wakeHour || decStart > sleepHour + 1) return null;

                const topPos = (decStart - wakeHour) * 70;
                const cardHeight = Math.max(45, (decEnd - decStart) * 70 - 4); // Subtract 4px for spacing margin
                const isCompleted = act.completed === 1;

                return (
                  <div
                    key={act.id}
                    className="glass-panel"
                    style={{
                      position: 'absolute',
                      top: `${topPos}px`,
                      left: '10px',
                      right: '10px',
                      height: `${cardHeight}px`,
                      borderRadius: 'var(--radius-md)',
                      borderLeft: `5px solid ${getCategoryColor(act.category)}`,
                      backgroundColor: isCompleted ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      overflow: 'hidden',
                      opacity: isCompleted ? 0.7 : 1,
                      transition: 'all var(--transition-fast)',
                      borderTop: '1px solid var(--border-color)',
                      borderRight: '1px solid var(--border-color)',
                      borderBottom: '1px solid var(--border-color)',
                      zIndex: 5
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                      <button
                        onClick={() => handleToggleComplete(act)}
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: 'var(--radius-full)',
                          border: isCompleted ? 'none' : '1px solid var(--text-tertiary)',
                          backgroundColor: isCompleted ? 'var(--accent-green)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        {isCompleted && <Check size={12} />}
                      </button>

                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <span style={{
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {act.title}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={10} />
                          {act.start_time} - {act.end_time}
                        </span>
                      </div>
                    </div>

                    {/* Delete block trigger */}
                    <button
                      onClick={() => handleDelete(act.id)}
                      style={{ color: 'var(--text-tertiary)', cursor: 'pointer', opacity: 0.6 }}
                      className="btn-danger-hover"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Side Panel: Scheduled Lists view (useful for mobile conversion or quick reference) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <ListTodo size={18} style={{ color: 'var(--accent-purple)' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Agenda Checklist</h3>
            </div>
            
            {activities.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                Your schedule is empty for today.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activities.map(act => (
                  <div 
                    key={act.id} 
                    style={{ 
                      padding: '0.75rem', 
                      borderRadius: 'var(--radius-sm)', 
                      backgroundColor: 'var(--bg-tertiary)',
                      borderLeft: `3px solid ${getCategoryColor(act.category)}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleToggleComplete(act)}
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: 'var(--radius-full)',
                          border: act.completed === 1 ? 'none' : '1px solid var(--text-tertiary)',
                          backgroundColor: act.completed === 1 ? 'var(--accent-green)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        {act.completed === 1 && <Check size={10} />}
                      </button>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, textDecoration: act.completed === 1 ? 'line-through' : 'none', opacity: act.completed === 1 ? 0.6 : 1 }}>
                          {act.title}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                          {act.start_time} - {act.end_time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Add Slot Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Schedule Daily Activity Slot">
        <form onSubmit={handleCreateActivity} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label>Activity Title</label>
            <input
              type="text"
              placeholder="e.g. Exercise or Client Coding session"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              placeholder="e.g. Cardio workout at local park"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                <option value="personal">Personal</option>
                <option value="coding">Coding</option>
                <option value="work">Work</option>
                <option value="study">Study</option>
                <option value="exercise">Exercise</option>
                <option value="entertainment">Entertainment</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input-field">
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              id="reminder"
              checked={reminder}
              onChange={(e) => setReminder(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="reminder" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>Send notification reminder</label>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              placeholder="Any quick reference checklist notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              style={{ minHeight: '80px', resize: 'none' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Add Activity Block
          </button>
        </form>
      </Modal>
    </div>
  );
}

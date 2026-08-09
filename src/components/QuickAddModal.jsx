import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import Modal from './Modal';
import { 
  CheckSquare, 
  Flame, 
  Target, 
  BookOpen, 
  Calendar, 
  Smile, 
  Battery, 
  Save, 
  Sparkles 
} from 'lucide-react';

export default function QuickAddModal() {
  const { showQuickAdd, setShowQuickAdd, refreshXp, addToast } = useApp();
  const [activeTab, setActiveTab] = useState('task'); // 'task', 'habit', 'goal', 'activity', 'mood'

  // 1. Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskCategory, setTaskCategory] = useState('personal');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toLocaleDateString('sv'));

  // 2. Habit Form State
  const [habitName, setHabitName] = useState('');
  const [habitColor, setHabitColor] = useState('#6366f1');

  // 3. Goal Form State
  const [goalTitle, setGoalTitle] = useState('');
  const [goalType, setGoalType] = useState('monthly');

  // 4. Activity Form State
  const [actTitle, setActTitle] = useState('');
  const [actStart, setActStart] = useState('09:00');
  const [actEnd, setActEnd] = useState('10:00');

  // 5. Mood Form State
  const [mood, setMood] = useState('Good');
  const [energy, setEnergy] = useState('Medium');
  const [moodNotes, setMoodNotes] = useState('');

  const resetForms = () => {
    setTaskTitle('');
    setHabitName('');
    setGoalTitle('');
    setActTitle('');
    setMoodNotes('');
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    try {
      const todayStr = new Date().toLocaleDateString('sv');

      if (activeTab === 'task') {
        if (!taskTitle.trim()) return;
        await api.post('/api/tasks', {
          title: taskTitle,
          priority: taskPriority,
          category: taskCategory,
          due_date: taskDueDate
        });
        addToast('Task created! 📝', 'success');
      } else if (activeTab === 'habit') {
        if (!habitName.trim()) return;
        await api.post('/api/habits', {
          name: habitName,
          color: habitColor,
          frequency: 'daily'
        });
        addToast('Habit tracking initialized! 🔥', 'success');
      } else if (activeTab === 'goal') {
        if (!goalTitle.trim()) return;
        await api.post('/api/goals', {
          title: goalTitle,
          type: goalType,
          category: 'personal',
          milestones: ['Set first milestone objective']
        });
        addToast('Goal tracker created! 🎯', 'success');
      } else if (activeTab === 'activity') {
        if (!actTitle.trim()) return;
        await api.post('/api/activities', {
          title: actTitle,
          start_time: actStart,
          end_time: actEnd,
          date: todayStr
        });
        addToast('Scheduled block added! ⏱️', 'success');
      } else if (activeTab === 'mood') {
        await api.post('/api/mood', {
          date: todayStr,
          mood,
          energy,
          notes: moodNotes
        });
        addToast('Daily Mood & Energy logged! +5 XP earned! ⭐', 'success');
        refreshXp();
      }

      setShowQuickAdd(false);
      resetForms();
    } catch (err) {
      addToast('Quick Add failed.', 'error');
    }
  };

  const moodOptions = [
    { value: 'Excellent', emoji: '😀' },
    { value: 'Good', emoji: '🙂' },
    { value: 'Normal', emoji: '😐' },
    { value: 'Low', emoji: '😕' },
    { value: 'Very Low', emoji: '😔' }
  ];

  const energyOptions = [
    { value: 'High', label: 'High ⚡' },
    { value: 'Medium', label: 'Medium 🔋' },
    { value: 'Low', label: 'Low 🪫' }
  ];

  return (
    <Modal isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} title="Global Quick Add Panel" maxWidth="450px">
      
      {/* Tab selectors */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '4px',
        backgroundColor: 'var(--bg-tertiary)',
        padding: '4px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.5rem'
      }}>
        {[
          { id: 'task', icon: CheckSquare, label: 'Task' },
          { id: 'habit', icon: Flame, label: 'Habit' },
          { id: 'goal', icon: Target, label: 'Goal' },
          { id: 'activity', icon: Calendar, label: 'Slot' },
          { id: 'mood', icon: Smile, label: 'Mood' }
        ].map(tab => {
          const Icon = tab.icon;
          const isSel = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                padding: '0.4rem 0',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: isSel ? 'var(--accent-primary)' : 'transparent',
                color: isSel ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleQuickAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* TASK TAB FORM */}
        {activeTab === 'task' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-slide-up">
            <div className="form-group">
              <label>Task Title</label>
              <input
                type="text"
                placeholder="What needs to be done?"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="input-field"
                required
                autoFocus
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label>Priority</label>
                <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)} className="input-field">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={taskCategory} onChange={(e) => setTaskCategory(e.target.value)} className="input-field">
                  <option value="personal">Personal</option>
                  <option value="coding">Coding</option>
                  <option value="work">Work</option>
                  <option value="study">Study</option>
                  <option value="exercise">Exercise</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        )}

        {/* HABIT TAB FORM */}
        {activeTab === 'habit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-slide-up">
            <div className="form-group">
              <label>Habit Name</label>
              <input
                type="text"
                placeholder="e.g. Code 1 hour or Go for a run"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                className="input-field"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Accent Color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#a855f7'].map(col => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setHabitColor(col)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: col,
                      border: habitColor === col ? '2px solid var(--text-primary)' : '1px solid transparent',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* GOAL TAB FORM */}
        {activeTab === 'goal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-slide-up">
            <div className="form-group">
              <label>Goal Target</label>
              <input
                type="text"
                placeholder="e.g. Learn Java or Read 3 Books"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                className="input-field"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Goal Period</label>
              <select value={goalType} onChange={(e) => setGoalType(e.target.value)} className="input-field">
                <option value="weekly">Weekly Target</option>
                <option value="monthly">Monthly Milestone</option>
                <option value="yearly">Yearly Objective</option>
              </select>
            </div>
          </div>
        )}

        {/* ACTIVITY TAB FORM */}
        {activeTab === 'activity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-slide-up">
            <div className="form-group">
              <label>Activity Title</label>
              <input
                type="text"
                placeholder="What schedule block to add today?"
                value={actTitle}
                onChange={(e) => setActTitle(e.target.value)}
                className="input-field"
                required
                autoFocus
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={actStart}
                  onChange={(e) => setActStart(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={actEnd}
                  onChange={(e) => setActEnd(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* MOOD & ENERGY TAB FORM */}
        {activeTab === 'mood' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-slide-up">
            <div className="form-group">
              <label>How is your mood today?</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginTop: '0.25rem' }}>
                {moodOptions.map(opt => {
                  const isSel = mood === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setMood(opt.value)}
                      style={{
                        padding: '0.6rem 0',
                        borderRadius: 'var(--radius-md)',
                        border: isSel ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        backgroundColor: isSel ? 'rgba(99,102,241,0.08)' : 'var(--bg-tertiary)',
                        fontSize: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <span>{opt.emoji}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{opt.value}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label>Energy Level</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '0.25rem' }}>
                {energyOptions.map(opt => {
                  const isSel = energy === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEnergy(opt.value)}
                      style={{
                        padding: '0.6rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSel ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        backgroundColor: isSel ? 'rgba(99,102,241,0.08)' : 'var(--bg-tertiary)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label>Quick reflections notes</label>
              <textarea
                placeholder="Write any thoughts, sleep quality notes, or sluggish factor..."
                value={moodNotes}
                onChange={(e) => setMoodNotes(e.target.value)}
                className="input-field"
                style={{ minHeight: '80px', resize: 'none' }}
              />
            </div>
          </div>
        )}

        {/* Submit quick-add */}
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
          Create Entry
        </button>
      </form>

    </Modal>
  );
}

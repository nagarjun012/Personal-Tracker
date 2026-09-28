import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { Card } from '../components/Card';
import Modal from '../components/Modal';
import { 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square, 
  Calendar
} from 'lucide-react';

export default function Goals() {
  const { refreshXp, addToast, dataRevision, notifyDataChanged } = useApp();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tab/Filter timeframe
  const [timeframeFilter, setTimeframeFilter] = useState('monthly'); // 'daily', 'weekly', 'monthly', 'yearly'

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('monthly');
  const [category, setCategory] = useState('personal');
  const [deadline, setDeadline] = useState('');
  const [milestonesInput, setMilestonesInput] = useState('');

  // Fetch Goals
  const fetchGoals = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/goals');
      setGoals(data);
    } catch (err) {
      addToast('Failed to load goals.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [dataRevision]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title.trim() || !type) return;

    try {
      const miles = milestonesInput.split('\n').filter(m => m.trim() !== '');
      await api.post('/api/goals', {
        title,
        description,
        type,
        category,
        deadline: deadline || null,
        milestones: miles
      });

      addToast('Goal initialized! Aim high. 🎯', 'success');
      setIsAddOpen(false);
      resetForm();
      fetchGoals();
      notifyDataChanged();
    } catch (err) {
      addToast('Failed to create goal.', 'error');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('monthly');
    setCategory('personal');
    setDeadline('');
    setMilestonesInput('');
  };

  const handleToggleMilestone = async (milestone) => {
    const isCompleted = milestone.status === 'completed';
    const nextStatus = isCompleted ? 'pending' : 'completed';

    try {
      await api.put(`/api/goals/milestones/${milestone.id}`, {
        status: nextStatus
      });
      addToast(
        nextStatus === 'completed' 
          ? 'Milestone completed! XP earned! ⭐' 
          : 'Milestone reopened.', 
        'success'
      );
      fetchGoals();
      refreshXp();
      notifyDataChanged();
    } catch (err) {
      addToast('Failed to update milestone.', 'error');
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Delete this goal permanently?')) return;
    try {
      await api.delete(`/api/goals/${id}`);
      addToast('Goal removed.', 'info');
      fetchGoals();
      notifyDataChanged();
    } catch (err) {
      addToast('Failed to delete goal.', 'error');
    }
  };

  const filteredGoals = goals.filter(g => g.type === timeframeFilter);

  const getCategoryColor = (cat) => {
    const colors = {
      coding: 'var(--accent-primary)',
      work: 'var(--accent-purple)',
      study: 'var(--accent-amber)',
      exercise: 'var(--accent-green)',
      personal: 'var(--accent-blue)',
    };
    return colors[cat] || 'var(--accent-primary)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade">
      
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Goals</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Define, monitor, and achieve your key milestones.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="btn btn-primary"
          style={{ padding: '0.75rem 1.25rem' }}
        >
          <Plus size={18} />
          Create Goal
        </button>
      </div>

      {/* Timeframe Tab filters */}
      <div className="glass-panel scroll-touch" style={{
        padding: '0.4rem',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        gap: '0.35rem',
        maxWidth: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        {[
          { id: 'daily', name: 'Daily' },
          { id: 'weekly', name: 'Weekly' },
          { id: 'monthly', name: 'Monthly' },
          { id: 'yearly', name: 'Yearly' }
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => setTimeframeFilter(opt.id)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: timeframeFilter === opt.id ? 'var(--accent-primary)' : 'transparent',
              color: timeframeFilter === opt.id ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)'
            }}
          >
            {opt.name}
          </button>
        ))}
      </div>

      {/* Goals Display Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: '180px', borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : filteredGoals.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <span style={{ fontSize: '2.5rem' }}>🎯</span>
          <h3 style={{ fontSize: '1.25rem', marginTop: '1rem', fontWeight: 600 }}>Set clear milestones</h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>Focus your daily tasks on high-level objectives.</p>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="btn btn-secondary" 
            style={{ marginTop: '1.25rem' }}
          >
            Create Your First Goal
          </button>
        </Card>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredGoals.map(goal => (
            <Card key={goal.id} hoverable={false} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Header: Title + delete */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: getCategoryColor(goal.category),
                    backgroundColor: `${getCategoryColor(goal.category)}15`,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    width: 'max-content'
                  }}>
                    {goal.category}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.25rem' }}>{goal.title}</h3>
                  {goal.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{goal.description}</p>
                  )}
                </div>

                <button 
                  onClick={() => handleDeleteGoal(goal.id)}
                  style={{ color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}
                  className="btn-danger-hover"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Progress bar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Goal Progress</span>
                  <span style={{ color: 'var(--accent-primary)' }}>{goal.progress}%</span>
                </div>
                <div style={{
                  height: '8px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${goal.progress}%`,
                    height: '100%',
                    backgroundColor: goal.progress === 100 ? 'var(--accent-green)' : 'var(--accent-primary)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width var(--transition-slow)'
                  }} />
                </div>
                {goal.deadline && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.25rem' }}>
                    <Calendar size={12} /> Deadline: {goal.deadline}
                  </span>
                )}
              </div>

              {/* Milestones list */}
              {goal.milestones && goal.milestones.length > 0 && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Milestone Objectives
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {goal.milestones.map(m => {
                      const isComp = m.status === 'completed';
                      return (
                        <button
                          key={m.id}
                          onClick={() => handleToggleMilestone(m)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                            color: isComp ? 'var(--text-tertiary)' : 'var(--text-primary)',
                            fontSize: '0.85rem'
                          }}
                        >
                          {isComp ? (
                            <CheckSquare size={16} style={{ color: 'var(--accent-green)' }} />
                          ) : (
                            <Square size={16} style={{ color: 'var(--text-tertiary)' }} />
                          )}
                          <span style={{ textDecoration: isComp ? 'line-through' : 'none' }}>
                            {m.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Goal creation modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Goal">
        <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label>Goal Title</label>
            <input
              type="text"
              placeholder="e.g. Master Full-stack Node & React"
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
              placeholder="Provide context on your target"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Goal Period</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="input-field">
                <option value="daily">Daily Target</option>
                <option value="weekly">Weekly Target</option>
                <option value="monthly">Monthly Milestone</option>
                <option value="yearly">Yearly Objective</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                <option value="personal">Personal</option>
                <option value="coding">Coding</option>
                <option value="work">Work</option>
                <option value="study">Study</option>
                <option value="exercise">Exercise</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Target Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label>Milestones Checklist (One per line)</label>
            <textarea
              placeholder="Objective 1&#10;Objective 2&#10;Objective 3"
              value={milestonesInput}
              onChange={(e) => setMilestonesInput(e.target.value)}
              className="input-field"
              style={{ minHeight: '100px', resize: 'none' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            Initialize Goal
          </button>
        </form>
      </Modal>
    </div>
  );
}

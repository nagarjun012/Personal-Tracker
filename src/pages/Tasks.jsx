import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { Card } from '../components/Card';
import Modal from '../components/Modal';
import { 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  AlertCircle, 
  Tag, 
  ChevronDown, 
  ChevronUp,
  FileText
} from 'lucide-react';

export default function Tasks() {
  const { refreshXp, addToast } = useApp();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter State
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'today', 'upcoming', 'high-priority', 'Completed'
  const [sortBy, setSortBy] = useState('due_date'); // 'due_date', 'priority', 'title'

  // Expandable tasks for subtasks
  const [expandedTasks, setExpandedTasks] = useState({});

  // Add Task Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('personal');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [estDuration, setEstDuration] = useState(30);
  const [recurrence, setRecurrence] = useState('none');
  const [notes, setNotes] = useState('');
  const [subtasksInput, setSubtasksInput] = useState('');

  // Fetch tasks on mount and when filters change
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/tasks');
      setTasks(data);
    } catch (err) {
      addToast('Failed to fetch tasks.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const created = await api.post('/api/tasks', {
        title,
        description,
        priority,
        category,
        due_date: dueDate || null,
        due_time: dueTime || null,
        estimated_duration: parseInt(estDuration) || 0,
        recurrence,
        notes
      });

      // Handle subtasks creation
      if (subtasksInput.trim()) {
        const subTitles = subtasksInput.split('\n').filter(s => s.trim() !== '');
        for (const subTitle of subTitles) {
          await api.post('/api/tasks', {
            title: subTitle,
            parent_task_id: created.id,
            category: created.category,
            due_date: created.due_date
          });
        }
      }

      addToast('Task created successfully! ⭐', 'success');
      setIsAddModalOpen(false);
      resetForm();
      fetchTasks();
      refreshXp();
    } catch (err) {
      addToast('Failed to create task.', 'error');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory('personal');
    setDueDate('');
    setDueTime('');
    setEstDuration(30);
    setRecurrence('none');
    setNotes('');
    setSubtasksInput('');
  };

  const handleToggleComplete = async (task) => {
    const isCompleted = task.status === 'Completed';
    const newStatus = isCompleted ? 'Not Started' : 'Completed';
    
    try {
      await api.put(`/api/tasks/${task.id}`, {
        status: newStatus,
        due_date: task.due_date // Persist original date constraints
      });
      addToast(isCompleted ? 'Task reopened.' : 'Task completed! +10 XP earned! ⭐', 'success');
      fetchTasks();
      refreshXp();
    } catch (err) {
      addToast('Failed to update task.', 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/api/tasks/${taskId}`);
      addToast('Task deleted.', 'info');
      fetchTasks();
    } catch (err) {
      addToast('Failed to delete task.', 'error');
    }
  };

  const toggleExpand = (id) => {
    setExpandedTasks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddSubtaskInline = async (parentTask, subtitle) => {
    if (!subtitle.trim()) return;
    try {
      await api.post('/api/tasks', {
        title: subtitle,
        parent_task_id: parentTask.id,
        category: parentTask.category,
        due_date: parentTask.due_date
      });
      addToast('Subtask added.', 'success');
      fetchTasks();
    } catch (err) {
      addToast('Failed to add subtask.', 'error');
    }
  };

  // Filter and Sort Processing
  const todayStr = new Date().toLocaleDateString('sv');

  const processedTasks = tasks
    .filter(t => {
      // 1. Search Query
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                            (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
      if (!matchesSearch) return false;

      // 2. Category Filter
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

      // 3. Status Filters
      if (statusFilter === 'Completed' && t.status !== 'Completed') return false;
      if (statusFilter === 'today' && t.due_date !== todayStr) return false;
      if (statusFilter === 'high-priority' && t.priority !== 'high') return false;
      if (statusFilter === 'upcoming') {
        if (!t.due_date || t.due_date <= todayStr || t.status === 'Completed') return false;
      }
      if (statusFilter === 'all' && t.status === 'Completed' && t.parent_task_id === null) {
        // By default, hide completed parent tasks from the main list unless explicitly viewing completed
        return false;
      }

      // Hide subtasks from parent mapping list (they are loaded nested)
      if (t.parent_task_id !== null) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'priority') {
        const priorityVal = { high: 3, medium: 2, low: 1 };
        return priorityVal[b.priority] - priorityVal[a.priority];
      }
      // due date sorting
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    });

  // Fetch subtasks helper
  const getSubtasks = (parentId) => {
    return tasks.filter(t => t.parent_task_id === parentId);
  };

  const getPriorityColor = (p) => {
    if (p === 'high') return 'var(--accent-red)';
    if (p === 'medium') return 'var(--accent-amber)';
    return 'var(--accent-blue)';
  };

  const getCategoryColor = (cat) => {
    const colors = {
      coding: '#6366f1',
      work: '#a855f7',
      study: '#f59e0b',
      exercise: '#10b981',
      personal: '#3b82f6',
      entertainment: '#64748b'
    };
    return colors[cat] || '#6366f1';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade">
      {/* Top Header Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Tasks</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Organize, plan, and complete your projects.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary"
          style={{ padding: '0.75rem 1.25rem' }}
        >
          <Plus size={18} />
          Add New Task
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-panel" style={{
        padding: '1.25rem',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '38px' }}
          />
        </div>

        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '2px' }}>
          {[
            { id: 'all', name: 'Active' },
            { id: 'today', name: 'Today' },
            { id: 'upcoming', name: 'Upcoming' },
            { id: 'high-priority', name: 'Priority' },
            { id: 'Completed', name: 'Completed' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setStatusFilter(opt.id)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: statusFilter === opt.id ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: statusFilter === opt.id ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)'
              }}
            >
              {opt.name}
            </button>
          ))}
        </div>

        {/* Sort and Dropdowns */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field"
            style={{ padding: '0.5rem 1rem', width: 'auto', fontSize: '0.85rem' }}
          >
            <option value="all">All Categories</option>
            <option value="coding">Coding</option>
            <option value="work">Work</option>
            <option value="study">Study</option>
            <option value="exercise">Exercise</option>
            <option value="personal">Personal</option>
            <option value="entertainment">Entertainment</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
            style={{ padding: '0.5rem 1rem', width: 'auto', fontSize: '0.85rem' }}
          >
            <option value="due_date">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Task List Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '90px', borderRadius: 'var(--radius-md)' }} />)}
        </div>
      ) : processedTasks.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <span style={{ fontSize: '2.5rem' }}>✨</span>
          <h3 style={{ fontSize: '1.25rem', marginTop: '1rem', fontWeight: 600 }}>Your day is clear</h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>No pending tasks found. Time to relax or schedule a new one!</p>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-secondary" 
            style={{ marginTop: '1.25rem' }}
          >
            Create First Task
          </button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {processedTasks.map(task => {
            const isExpanded = expandedTasks[task.id];
            const subtasks = getSubtasks(task.id);
            const completedSubtasks = subtasks.filter(s => s.status === 'Completed').length;
            const hasSubtasks = subtasks.length > 0;

            return (
              <Card key={task.id} hoverable={false} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  {/* Left toggle + details */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                    <button
                      onClick={() => handleToggleComplete(task)}
                      style={{ cursor: 'pointer', color: task.status === 'Completed' ? 'var(--accent-green)' : 'var(--text-tertiary)', marginTop: '3px' }}
                    >
                      {task.status === 'Completed' ? (
                        <CheckCircle2 size={22} fill="var(--accent-green)" stroke="white" />
                      ) : (
                        <Circle size={22} />
                      )}
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ 
                        fontSize: '1.05rem', 
                        fontWeight: 600, 
                        color: 'var(--text-primary)',
                        textDecoration: task.status === 'Completed' ? 'line-through' : 'none',
                        opacity: task.status === 'Completed' ? 0.6 : 1
                      }}>
                        {task.title}
                      </span>
                      {task.description && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {task.description}
                        </span>
                      )}

                      {/* Meta Tags details */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                        {/* Due Date */}
                        {task.due_date && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: task.due_date < todayStr && task.status !== 'Completed' ? 'var(--accent-red)' : 'var(--text-tertiary)', fontWeight: 500 }}>
                            <Calendar size={12} />
                            {task.due_date} {task.due_time || ''}
                          </span>
                        )}
                        {/* Estimated Duration */}
                        {task.estimated_duration > 0 && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                            <Clock size={12} />
                            {task.estimated_duration}m est
                          </span>
                        )}
                        {/* Priority Badge */}
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px', 
                          fontSize: '0.75rem', 
                          color: getPriorityColor(task.priority),
                          backgroundColor: `${getPriorityColor(task.priority)}12`,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}>
                          <AlertCircle size={10} />
                          {task.priority}
                        </span>
                        {/* Category tag */}
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          color: getCategoryColor(task.category),
                          backgroundColor: `${getCategoryColor(task.category)}12`,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}>
                          <Tag size={10} />
                          {task.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Subtasks dropdown toggle */}
                    {(hasSubtasks || true) && (
                      <button 
                        onClick={() => toggleExpand(task.id)}
                        className="btn-secondary"
                        style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                        title="Subtasks"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="btn-danger"
                      style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Expanded Subtasks List Area */}
                {isExpanded && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '3px solid var(--accent-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    marginTop: '0.5rem',
                    animation: 'fadeIn var(--transition-fast) forwards'
                  }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Subtasks {hasSubtasks ? `(${completedSubtasks}/${subtasks.length})` : ''}
                    </span>

                    {/* Subtasks display */}
                    {hasSubtasks && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {subtasks.map(sub => (
                          <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justify: 'space-between', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleToggleComplete(sub)}
                                style={{ cursor: 'pointer', color: sub.status === 'Completed' ? 'var(--accent-green)' : 'var(--text-tertiary)' }}
                              >
                                {sub.status === 'Completed' ? (
                                  <CheckCircle2 size={16} fill="var(--accent-green)" stroke="white" />
                                ) : (
                                  <Circle size={16} />
                                )}
                              </button>
                              <span style={{ 
                                fontSize: '0.875rem', 
                                color: 'var(--text-primary)',
                                textDecoration: sub.status === 'Completed' ? 'line-through' : 'none',
                                opacity: sub.status === 'Completed' ? 0.6 : 1
                              }}>
                                {sub.title}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteTask(sub.id)}
                              style={{ color: 'var(--text-tertiary)', cursor: 'pointer', padding: '2px' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline Subtask addition input */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <input
                        type="text"
                        placeholder="Add quick subtask..."
                        className="input-field"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddSubtaskInline(task, e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Task Creation Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Add New Task"
        maxWidth="500px"
      >
        <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label>Task Title</label>
            <input
              type="text"
              placeholder="e.g. Implement API route testing"
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
              placeholder="Provide a brief context (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input-field">
                <option value="high">Urgent (High)</option>
                <option value="medium">Standard (Medium)</option>
                <option value="low">Secondary (Low)</option>
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
                <option value="entertainment">Entertainment</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>Due Time</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Est Duration (mins)</label>
              <input
                type="number"
                min="0"
                value={estDuration}
                onChange={(e) => setEstDuration(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>Recurrence</label>
              <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} className="input-field">
                <option value="none">One-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Subtasks (One per line)</label>
            <textarea
              placeholder="Subtask 1&#10;Subtask 2&#10;Subtask 3"
              value={subtasksInput}
              onChange={(e) => setSubtasksInput(e.target.value)}
              className="input-field"
              style={{ minHeight: '80px', resize: 'none' }}
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              placeholder="Any additional details or reference links"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              style={{ minHeight: '80px', resize: 'none' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
            Create Task
          </button>
        </form>
      </Modal>
    </div>
  );
}

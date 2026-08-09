import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { api } from '../utils/api';
import { 
  Settings as SettingsIcon, 
  User, 
  Palette, 
  Bell, 
  Scale, 
  Database,
  Download,
  Trash2,
  AlertCircle
} from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings, logout, user, addToast } = useApp();

  // Local Form state
  const [theme, setTheme] = useState('system');
  const [notifications, setNotifications] = useState(true);
  const [xpEnabled, setXpEnabled] = useState(true);
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('22:30');
  const [focus, setFocus] = useState('');

  // Weights state
  const [tasksW, setTasksW] = useState(30);
  const [habitsW, setHabitsW] = useState(20);
  const [goalsW, setGoalsW] = useState(20);
  const [timeW, setTimeW] = useState(15);
  const [schedW, setSchedW] = useState(15);

  // Sync settings when context loads
  useEffect(() => {
    if (settings) {
      setTheme(settings.theme);
      setNotifications(settings.notifications_enabled === 1);
      setXpEnabled(settings.xp_enabled === 1);
      setWakeTime(settings.wake_time || '07:00');
      setSleepTime(settings.sleep_time || '22:30');
      setFocus(settings.main_focus || '');

      if (settings.score_weights) {
        setTasksW(settings.score_weights.tasks || 30);
        setHabitsW(settings.score_weights.habits || 20);
        setGoalsW(settings.score_weights.goals || 20);
        setTimeW(settings.score_weights.time || 15);
        setSchedW(settings.score_weights.schedule || 15);
      }
    }
  }, [settings]);

  const totalWeights = parseInt(tasksW) + parseInt(habitsW) + parseInt(goalsW) + parseInt(timeW) + parseInt(schedW);
  const weightsValid = totalWeights === 100;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!weightsValid) {
      addToast('Scoring weights must add up to exactly 100%.', 'error');
      return;
    }

    const payload = {
      theme,
      notifications_enabled: notifications,
      xp_enabled: xpEnabled,
      score_weights: {
        tasks: parseInt(tasksW),
        habits: parseInt(habitsW),
        goals: parseInt(goalsW),
        time: parseInt(timeW),
        schedule: parseInt(schedW)
      },
      wake_time: wakeTime,
      sleep_time: sleepTime,
      main_focus: focus
    };

    await updateSettings(payload);
  };

  const handleExport = () => {
    const token = localStorage.getItem('token');
    // Open backing download route directly in browser
    window.open(`/api/data/export?token=${token}`, '_blank');
    addToast('Database backup downloaded successfully. 💾', 'success');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: Are you absolutely sure you want to delete your account? This will permanently wipe all tasks, habits, journals, and history logs.')) {
      return;
    }
    
    try {
      await api.delete('/api/data/delete-account');
      addToast('Account deleted successfully.', 'info');
      logout();
    } catch (err) {
      addToast('Failed to delete account.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade">
      
      {/* Header section */}
      <div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configure scoring parameters, backups, and appearance settings.</p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Profile Card */}
        <Card style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 800
          }}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{user?.name}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user?.email}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Account isolation active 🔒</span>
          </div>
        </Card>

        {/* Form Fields split */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '1.5rem',
          alignItems: 'flex-start'
        }}
        className="dashboard-grid"
        >
          {/* Preferences */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Appearance settings */}
            <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <Palette size={18} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Appearance & Themes</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Select Theme</label>
                  <select value={theme} onChange={(e) => setTheme(e.target.value)} className="input-field">
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                    <option value="system">Adapt to System</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Main Focus Theme</label>
                  <input
                    type="text"
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                    placeholder="e.g. Software Engineering & Fitness"
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Routine Wake Hour</label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Routine Sleep Hour</label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </Card>

            {/* Productivity Scoring Weights */}
            <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Scale size={18} style={{ color: 'var(--accent-purple)' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Scoring Preference weights</h3>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: weightsValid ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  Total: {totalWeights}% {weightsValid ? '✓' : '(Must equal 100%)'}
                </span>
              </div>

              {!weightsValid && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 0.8rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-red)', fontSize: '0.75rem', fontWeight: 600 }}>
                  <AlertCircle size={14} />
                  <span>The combined sum is currently {totalWeights}%. Adjust values to reach exactly 100%.</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Tasks (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={tasksW}
                    onChange={(e) => setTasksW(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Habits (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={habitsW}
                    onChange={(e) => setHabitsW(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Goals (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={goalsW}
                    onChange={(e) => setGoalsW(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Focus Time (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={timeW}
                    onChange={(e) => setTimeW(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Schedule (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={schedW}
                    onChange={(e) => setSchedW(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </Card>

            <button
              type="submit"
              disabled={!weightsValid}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', opacity: weightsValid ? 1 : 0.6 }}
            >
              Save Configuration Settings
            </button>
          </div>

          {/* Side Panel: Notifications and Data controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Notification triggers */}
            <Card style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <Bell size={16} style={{ color: 'var(--accent-amber)' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Notifications</h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <label htmlFor="notif" style={{ cursor: 'pointer', fontWeight: 500, color: 'var(--text-secondary)' }}>Enable daily reminders</label>
                <input
                  type="checkbox"
                  id="notif"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <label htmlFor="xp" style={{ cursor: 'pointer', fontWeight: 500, color: 'var(--text-secondary)' }}>Enable XP gamification</label>
                <input
                  type="checkbox"
                  id="xp"
                  checked={xpEnabled}
                  onChange={(e) => setXpEnabled(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </div>
            </Card>

            {/* Backups & Actions */}
            <Card style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <Database size={16} style={{ color: 'var(--accent-blue)' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Data Management</h3>
              </div>

              <button
                type="button"
                onClick={handleExport}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.6rem 0.8rem', display: 'flex', justify: 'center', gap: '6px', fontSize: '0.85rem' }}
              >
                <Download size={14} />
                Export JSON Backup
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                className="btn btn-danger"
                style={{ width: '100%', padding: '0.6rem 0.8rem', display: 'flex', justify: 'center', gap: '6px', fontSize: '0.85rem' }}
              >
                <Trash2 size={14} />
                Delete Account
              </button>
            </Card>
          </div>
        </div>

      </form>
    </div>
  );
}

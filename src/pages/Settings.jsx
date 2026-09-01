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
  AlertCircle,
  RotateCcw
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

  const handleExportJSON = async () => {
    try {
      const data = await api.get('/api/export');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `aura_life_os_backup_${new Date().toLocaleDateString('sv')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addToast('Database backup downloaded successfully. 💾', 'success');
    } catch (err) {
      addToast('Failed to export data backup.', 'error');
    }
  };

  const handleResetAllData = async () => {
    if (!window.confirm('RESET WARNING: Are you sure you want to reset all application data to default from the beginning? This will restore initial demo records and clear custom data.')) {
      return;
    }
    try {
      await api.post('/api/reset-data');
      addToast('All data reset to defaults! Reloading application...', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      addToast('Failed to reset data.', 'error');
    }
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
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Customize your experience, score weighting algorithms, and personal goals
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Save Bar Banner */}
        <div className="glass-panel" style={{
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: '20px',
          zIndex: 50,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            {!weightsValid ? (
              <span style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <AlertCircle size={16} /> Total score weight must equal 100% (Current: {totalWeights}%)
              </span>
            ) : (
              <span style={{ color: 'var(--text-secondary)' }}>System configurations ready to apply</span>
            )}
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!weightsValid}
            style={{ padding: '0.5rem 1.5rem', fontWeight: 600 }}
          >
            Save Changes
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
          
          {/* Main Config Column */}
          <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* User Profile Card */}
            <Card style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <User size={18} style={{ color: 'var(--accent-primary)' }} />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Profile Overview</h2>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-purple))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '1.5rem',
                  fontWeight: 800
                }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{user?.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user?.email}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Account ID: {user?.id}</span>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0, marginTop: '0.5rem' }}>
                <label>Main Focus / Primary Goal Statement</label>
                <input
                  type="text"
                  placeholder="e.g. Master Fullstack Web Development & Fitness"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  className="input-field"
                />
              </div>
            </Card>

            {/* Score Weights Algorithm Config */}
            <Card style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Scale size={18} style={{ color: 'var(--accent-purple)' }} />
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Productivity Score Weights</h2>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: weightsValid ? '#10b981' : 'var(--accent-red)' }}>
                  Total: {totalWeights}% / 100%
                </span>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Customize how your daily productivity score is calculated based on personal priorities.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Tasks Weight ({tasksW}%)</label>
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
                  <label>Habits Weight ({habitsW}%)</label>
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
                  <label>Goals Weight ({goalsW}%)</label>
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
                  <label>Focus Time Weight ({timeW}%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={timeW}
                    onChange={(e) => setTimeW(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                  <label>Schedule Adherence Weight ({schedW}%)</label>
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

            {/* Routine Timings */}
            <Card style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                Daily Routine Target Hours
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Wake-Up Target Time</label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Sleep Target Time</label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column Config */}
          <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Theme Config */}
            <Card style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <Palette size={16} style={{ color: 'var(--accent-pink)' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Appearance</h3>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Theme Preset</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="input-field"
                >
                  <option value="system">System Mode</option>
                  <option value="dark">Dark Mode (Default)</option>
                  <option value="light">Light Mode</option>
                </select>
              </div>
            </Card>

            {/* Notifications & XP */}
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

            {/* Data Management & Factory Reset */}
            <Card style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <Database size={16} style={{ color: 'var(--accent-blue)' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Data Management</h3>
              </div>

              <button
                type="button"
                onClick={handleExportJSON}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.6rem 0.8rem', display: 'flex', justify: 'center', gap: '6px', fontSize: '0.85rem' }}
              >
                <Download size={14} />
                Export JSON Backup
              </button>

              <button
                type="button"
                onClick={handleResetAllData}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.6rem 0.8rem', display: 'flex', justify: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--accent-amber)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
              >
                <RotateCcw size={14} />
                Reset All Data to Default
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

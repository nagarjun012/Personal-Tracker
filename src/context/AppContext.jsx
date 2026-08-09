import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../utils/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('user');
    return cached ? JSON.parse(cached) : null;
  });
  
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [settings, setSettings] = useState(null);
  const [xpData, setXpData] = useState({ totalXp: 0, level: 1, rank: 'Beginner', xpForNext: 100, prevLevelXp: 0, logs: [] });
  const [toasts, setToasts] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Timer Global State
  const [runningTimer, setRunningTimer] = useState(() => {
    const cached = localStorage.getItem('active_timer');
    return cached ? JSON.parse(cached) : null;
  });
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Search & Quick Add visibility
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Loading flag
  const [loading, setLoading] = useState(true);

  // Toast notifications creator
  const addToast = (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Automatically dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Login handler
  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      setUser(data.user);
      setToken(data.token);
      addToast(`Welcome back, ${data.user.name}! 👋`, 'success');
      await fetchUserData();
    } catch (err) {
      addToast(err.message || 'Login failed.', 'error');
      throw err;
    }
  };

  // Signup handler
  const signup = async (name, email, password) => {
    try {
      const data = await api.signup(name, email, password);
      setUser(data.user);
      setToken(data.token);
      addToast(`Account created successfully! Welcome ${name}! ✨`, 'success');
      await fetchUserData();
    } catch (err) {
      addToast(err.message || 'Signup failed.', 'error');
      throw err;
    }
  };

  // Logout handler
  const logout = () => {
    api.logout();
    setUser(null);
    setToken(null);
    setSettings(null);
    setRunningTimer(null);
    localStorage.removeItem('active_timer');
    setActiveTab('dashboard');
    addToast('Logged out successfully.', 'info');
  };

  // Fetch all user settings, gamification, timer logs
  const fetchUserData = async () => {
    if (!localStorage.getItem('token')) {
      setLoading(false);
      return;
    }
    try {
      const setts = await api.get('/api/settings');
      setSettings(setts);
      
      const xp = await api.get('/api/gamification');
      setXpData(xp);
    } catch (err) {
      console.error('Failed to sync user database logs:', err);
      // Auto logout if token is expired/invalid
      if (err.message && err.message.includes('token')) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch XP Logs manually
  const refreshXp = async () => {
    try {
      const xp = await api.get('/api/gamification');
      // If XP increased, show level up toasts!
      if (xp.level > xpData.level) {
        addToast(`🎉 LEVEL UP! You reached Level ${xp.level} (${xp.rank})!`, 'success');
      } else if (xp.totalXp > xpData.totalXp) {
        const diff = xp.totalXp - xpData.totalXp;
        if (diff > 0) addToast(`+${diff} XP earned! ⭐`, 'success');
      }
      setXpData(xp);
    } catch (err) {
      console.error('Error syncing XP:', err);
    }
  };

  // Initial Sync
  useEffect(() => {
    fetchUserData();
  }, [token]);

  // Apply Theme class
  useEffect(() => {
    if (!settings) {
      // Default fallback
      document.documentElement.setAttribute('data-theme', 'dark');
      return;
    }

    const applyTheme = (themeName) => {
      let activeTheme = themeName;
      if (themeName === 'system') {
        activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', activeTheme);
    };

    applyTheme(settings.theme);

    // If theme is system, listen to changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (settings.theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [settings]);

  // Update Settings in DB
  const updateSettings = async (newSettings) => {
    try {
      await api.put('/api/settings', newSettings);
      setSettings((prev) => ({ ...prev, ...newSettings }));
      addToast('Settings updated successfully.', 'success');
    } catch (err) {
      addToast('Failed to save settings.', 'error');
    }
  };

  // Timer Interval Hook
  useEffect(() => {
    let intervalId = null;
    if (runningTimer) {
      // Calculate active elapsed seconds based on start_time offset to handle page reloads perfectly!
      const startMs = new Date(runningTimer.start_time).getTime();
      const elapsedNow = Math.round((Date.now() - startMs) / 1000);
      setTimerSeconds(elapsedNow > 0 ? elapsedNow : 0);

      intervalId = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setTimerSeconds(0);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [runningTimer]);

  // Timer Controls
  const startTimer = async (activityName, category) => {
    try {
      const entry = await api.post('/api/time-entries', { activity_name: activityName, category });
      setRunningTimer(entry);
      localStorage.setItem('active_timer', JSON.stringify(entry));
      addToast(`Timer started: ${activityName} (${category}) ⏱️`, 'info');
    } catch (err) {
      addToast('Failed to start tracker timer.', 'error');
    }
  };

  const stopTimer = async () => {
    if (!runningTimer) return;
    try {
      const stopTime = new Date().toISOString();
      const entry = await api.put(`/api/time-entries/${runningTimer.id}`, { end_time: stopTime });
      const elapsedMin = Math.round(entry.duration / 60);
      addToast(`Stopped. Focus logged: ${elapsedMin} minutes.`, 'success');
      setRunningTimer(null);
      localStorage.removeItem('active_timer');
      await refreshXp();
    } catch (err) {
      addToast('Failed to stop timer.', 'error');
    }
  };

  // Keyboard shortcut listener (Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        settings,
        xpData,
        toasts,
        activeTab,
        runningTimer,
        timerSeconds,
        showQuickAdd,
        showCommandPalette,
        loading,
        setActiveTab,
        setShowQuickAdd,
        setShowCommandPalette,
        login,
        signup,
        logout,
        addToast,
        updateSettings,
        startTimer,
        stopTimer,
        refreshXp,
        fetchUserData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

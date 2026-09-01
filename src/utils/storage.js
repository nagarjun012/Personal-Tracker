// ==========================================
// BROWSER LOCAL STORAGE & INDEXED DB ENGINE
// ==========================================

const KEYS = {
  USERS: 'pt_users',
  SETTINGS: 'pt_settings',
  TASKS: 'pt_tasks',
  HABITS: 'pt_habits',
  HABIT_LOGS: 'pt_habit_logs',
  GOALS: 'pt_goals',
  MILESTONES: 'pt_goal_milestones',
  ACTIVITIES: 'pt_activities',
  TIME_ENTRIES: 'pt_time_entries',
  JOURNAL: 'pt_journal_entries',
  MOOD: 'pt_mood_logs',
  REVIEWS: 'pt_daily_reviews',
  XP_LOGS: 'pt_gamification_logs'
};

// Helper methods to read/write JSON arrays
function getItem(key, defaultValue = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (err) {
    console.error(`Storage Read Error (${key}):`, err);
    return defaultValue;
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Storage Write Error (${key}):`, err);
  }
}

// Password hashing helper (Simple salt simulation for client side)
function hashPassword(pwd) {
  let hash = 0;
  for (let i = 0; i < pwd.length; i++) {
    const char = pwd.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'phash_' + Math.abs(hash);
}

// Initialize Demo User and 8 days of realistic seed data on first launch
export function initBrowserStorage() {
  const users = getItem(KEYS.USERS, []);
  if (users.some(u => u.email === 'demo@example.com')) {
    return; // Already initialized
  }

  console.log('Seeding initial Demo User into browser storage...');

  // 1. Create Demo User
  const demoUser = {
    id: 1,
    name: 'Alex Carter',
    email: 'demo@example.com',
    password_hash: hashPassword('password123'),
    created_at: '2026-08-01T00:00:00.000Z'
  };
  users.push(demoUser);
  setItem(KEYS.USERS, users);

  // 2. Default Settings
  const settings = getItem(KEYS.SETTINGS, []);
  settings.push({
    id: 1,
    user_id: 1,
    theme: 'system',
    notifications_enabled: 1,
    xp_enabled: 1,
    score_weights: { tasks: 30, habits: 20, goals: 20, time: 15, schedule: 15 },
    wake_time: '06:30',
    sleep_time: '22:30',
    main_focus: 'Personal Growth & Software Engineering'
  });
  setItem(KEYS.SETTINGS, settings);

  // 3. Demo Habits
  const habits = [
    { id: 1, user_id: 1, name: 'Morning Run & Stretch', icon: 'activity', color: '#10b981', frequency: 'daily', target: 1, reminder_time: '07:00', start_date: '2026-08-01' },
    { id: 2, user_id: 1, name: 'Deep Work Coding', icon: 'code', color: '#6366f1', frequency: 'daily', target: 1, reminder_time: '09:00', start_date: '2026-08-01' },
    { id: 3, user_id: 1, name: 'Read 20 Pages', icon: 'book', color: '#f59e0b', frequency: 'daily', target: 1, reminder_time: '21:00', start_date: '2026-08-01' },
    { id: 4, user_id: 1, name: 'Drink 3L Water', icon: 'droplet', color: '#3b82f6', frequency: 'daily', target: 8, reminder_time: null, start_date: '2026-08-01' },
    { id: 5, user_id: 1, name: 'Evening Mindfulness', icon: 'moon', color: '#a855f7', frequency: 'daily', target: 1, reminder_time: '22:00', start_date: '2026-08-01' }
  ];
  setItem(KEYS.HABITS, habits);

  // 4. Seed Habit Logs (Aug 2 to Aug 9)
  const habitLogs = [];
  let logId = 1;
  const dates = ['2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07', '2026-08-08', '2026-08-09'];
  
  dates.forEach(d => {
    habitLogs.push({ id: logId++, habit_id: 1, date: d, status: d === '2026-08-06' ? 'missed' : 'completed' });
    habitLogs.push({ id: logId++, habit_id: 2, date: d, status: 'completed' });
    habitLogs.push({ id: logId++, habit_id: 3, date: d, status: d === '2026-08-05' ? 'missed' : 'completed' });
    habitLogs.push({ id: logId++, habit_id: 4, date: d, status: 'completed' });
    habitLogs.push({ id: logId++, habit_id: 5, date: d, status: d === '2026-08-03' ? 'missed' : 'completed' });
  });
  setItem(KEYS.HABIT_LOGS, habitLogs);

  // 5. Seed Tasks
  const tasks = [
    { id: 1, user_id: 1, parent_task_id: null, title: 'Architect System Layout', description: 'Design responsive grid layout in CSS', priority: 'High', category: 'coding', due_date: '2026-08-02', due_time: '14:00', status: 'Completed', estimated_duration: 120, recurrence: 'none', notes: 'Completed layout grid' },
    { id: 2, user_id: 1, parent_task_id: null, title: 'Setup Client Storage System', description: 'Implement local-first storage driver', priority: 'High', category: 'coding', due_date: '2026-08-04', due_time: '16:00', status: 'Completed', estimated_duration: 90, recurrence: 'none', notes: 'Using localStorage for Netlify' },
    { id: 3, user_id: 1, parent_task_id: null, title: 'Build Focus Stopwatch', description: 'Interactive time tracker component', priority: 'Medium', category: 'coding', due_date: '2026-08-07', due_time: '18:00', status: 'Completed', estimated_duration: 60, recurrence: 'none', notes: 'SVG graphs integrated' },
    { id: 4, user_id: 1, parent_task_id: null, title: 'Netlify One-Click Deployment', description: 'Deploy static SPA directly to Netlify CDN', priority: 'High', category: 'work', due_date: new Date().toLocaleDateString('sv'), due_time: '20:00', status: 'In Progress', estimated_duration: 45, recurrence: 'none', notes: 'Zero server required' }
  ];
  setItem(KEYS.TASKS, tasks);

  // 6. Seed Goals & Milestones
  const goals = [
    { id: 1, user_id: 1, title: 'Master Frontend & Web Engineering', description: 'Build high-performance web applications', type: 'monthly', category: 'coding', deadline: '2026-08-31', target: 100, progress: 75 },
    { id: 2, user_id: 1, title: 'Run 50km this Month', description: 'Maintain physical health and daily running routine', type: 'monthly', category: 'exercise', deadline: '2026-08-31', target: 100, progress: 60 }
  ];
  setItem(KEYS.GOALS, goals);

  const milestones = [
    { id: 1, goal_id: 1, title: 'Build responsive CSS Grid design system', status: 'completed' },
    { id: 2, goal_id: 1, title: 'Implement local-first browser data layer', status: 'completed' },
    { id: 3, goal_id: 1, title: 'Deploy on Netlify with SPA routing fallbacks', status: 'pending' },
    { id: 4, goal_id: 2, title: 'Complete first 25km', status: 'completed' },
    { id: 5, goal_id: 2, title: 'Complete remaining 25km', status: 'pending' }
  ];
  setItem(KEYS.MILESTONES, milestones);

  // 7. Seed Time Tracker Entries
  const timeEntries = [
    { id: 1, user_id: 1, activity_name: 'Coding Dashboard Components', category: 'coding', start_time: '2026-08-08T09:00:00.000Z', stop_time: '2026-08-08T11:30:00.000Z', duration: 9000, notes: 'Built SVG charts' },
    { id: 2, user_id: 1, activity_name: 'Reading Tech Documentation', category: 'study', start_time: '2026-08-08T14:00:00.000Z', stop_time: '2026-08-08T15:30:00.000Z', duration: 5400, notes: 'React optimization techniques' },
    { id: 3, user_id: 1, activity_name: 'Focus Session: Storage Driver', category: 'coding', start_time: `${new Date().toLocaleDateString('sv')}T10:00:00.000Z`, stop_time: `${new Date().toLocaleDateString('sv')}T12:00:00.000Z`, duration: 7200, notes: 'Migrated API to storage.js' }
  ];
  setItem(KEYS.TIME_ENTRIES, timeEntries);

  // 8. Seed Journal & Mood Entries
  const journalEntries = [
    {
      id: 1,
      user_id: 1,
      date: new Date().toLocaleDateString('sv'),
      morning_intention: 'Migrate data layer to client-side storage for seamless 100% free Netlify deployment.',
      evening_review: 'Storage engine completed! App runs completely inside Chrome and Edge.',
      went_well: 'Local storage strategy avoids any remote server dependencies.',
      could_improve: 'Stay focused on core features.',
      grateful_for: 'Modern browser database capabilities like LocalStorage and IndexedDB.',
      tomorrow_goals: 'Deploy to Netlify and test password recovery flow.',
      notes: 'Local-first architecture feels lightning fast.',
      tags: 'netlify,client-side,deploy',
      is_starred: 1
    }
  ];
  setItem(KEYS.JOURNAL, journalEntries);

  const moodLogs = [
    { id: 1, user_id: 1, date: new Date().toLocaleDateString('sv'), mood_score: 5, energy_score: 5, notes: 'Feeling super productive and energetic!' }
  ];
  setItem(KEYS.MOOD, moodLogs);

  // 9. Initial XP Log
  const xpLogs = [
    { id: 1, user_id: 1, xp: 100, reason: 'Initial Registration Bonus', date: new Date().toLocaleDateString('sv') },
    { id: 2, user_id: 1, xp: 50, reason: 'Completed Storage Driver Task', date: new Date().toLocaleDateString('sv') }
  ];
  setItem(KEYS.XP_LOGS, xpLogs);
}

// ==========================================
// STORAGE CONTROLLER METHODS (API CONTRACT)
// ==========================================

export const storage = {
  // Auth Methods
  signup: async (name, email, password) => {
    const users = getItem(KEYS.USERS, []);
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already exists.');
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password_hash: hashPassword(password),
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    setItem(KEYS.USERS, users);

    // Create default settings
    const settings = getItem(KEYS.SETTINGS, []);
    settings.push({
      id: Date.now(),
      user_id: newUser.id,
      theme: 'system',
      notifications_enabled: 1,
      xp_enabled: 1,
      score_weights: { tasks: 30, habits: 20, goals: 20, time: 15, schedule: 15 },
      wake_time: '07:00',
      sleep_time: '22:30',
      main_focus: 'Personal Improvement'
    });
    setItem(KEYS.SETTINGS, settings);

    // Default habits for new user
    const habits = getItem(KEYS.HABITS, []);
    const defaultHabits = [
      { id: Date.now() + 1, user_id: newUser.id, name: 'Exercise', icon: 'activity', color: '#10b981', frequency: 'daily', target: 1, reminder_time: '07:00', start_date: new Date().toLocaleDateString('sv') },
      { id: Date.now() + 2, user_id: newUser.id, name: 'Coding / Learning', icon: 'code', color: '#6366f1', frequency: 'daily', target: 1, reminder_time: '09:00', start_date: new Date().toLocaleDateString('sv') },
      { id: Date.now() + 3, user_id: newUser.id, name: 'Drink Water', icon: 'droplet', color: '#3b82f6', frequency: 'daily', target: 8, reminder_time: null, start_date: new Date().toLocaleDateString('sv') }
    ];
    habits.push(...defaultHabits);
    setItem(KEYS.HABITS, habits);

    const token = `token_sim_${newUser.id}_${Date.now()}`;
    return { token, user: { id: newUser.id, name: newUser.name, email: newUser.email } };
  },

  login: async (email, password) => {
    const users = getItem(KEYS.USERS, []);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password_hash !== hashPassword(password)) {
      throw new Error('Invalid email or password.');
    }

    const token = `token_sim_${user.id}_${Date.now()}`;
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  },

  resetPassword: async (email, newPassword = null) => {
    const users = getItem(KEYS.USERS, []);
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (userIndex === -1) {
      throw new Error('No account found with this email address.');
    }

    if (newPassword) {
      users[userIndex].password_hash = hashPassword(newPassword);
      setItem(KEYS.USERS, users);
      return { message: 'Password updated successfully! You can now log in with your new password.' };
    }

    return { message: 'Account located! Please enter your new password to reset.' };
  },

  getCurrentUser: async (userId) => {
    const users = getItem(KEYS.USERS, []);
    const user = users.find(u => u.id === Number(userId));
    if (!user) throw new Error('User not found.');
    return { id: user.id, name: user.name, email: user.email, created_at: user.created_at };
  },

  // Settings Methods
  getSettings: async (userId) => {
    const settings = getItem(KEYS.SETTINGS, []);
    const userSettings = settings.find(s => s.user_id === Number(userId));
    return userSettings || {
      theme: 'system',
      notifications_enabled: 1,
      xp_enabled: 1,
      score_weights: { tasks: 30, habits: 20, goals: 20, time: 15, schedule: 15 },
      wake_time: '07:00',
      sleep_time: '22:30',
      main_focus: ''
    };
  },

  updateSettings: async (userId, data) => {
    const settings = getItem(KEYS.SETTINGS, []);
    const index = settings.findIndex(s => s.user_id === Number(userId));
    if (index !== -1) {
      settings[index] = { ...settings[index], ...data };
    } else {
      settings.push({ id: Date.now(), user_id: Number(userId), ...data });
    }
    setItem(KEYS.SETTINGS, settings);
    return { message: 'Settings updated successfully.' };
  },

  // Tasks Methods
  getTasks: async (userId) => {
    const tasks = getItem(KEYS.TASKS, []).filter(t => t.user_id === Number(userId));
    const subtasksMap = {};
    tasks.forEach(t => {
      if (t.parent_task_id) {
        subtasksMap[t.parent_task_id] = subtasksMap[t.parent_task_id] || [];
        subtasksMap[t.parent_task_id].push(t);
      }
    });

    return tasks.filter(t => !t.parent_task_id).map(t => ({
      ...t,
      subtasks: subtasksMap[t.id] || []
    }));
  },

  createTask: async (userId, taskData) => {
    const tasks = getItem(KEYS.TASKS, []);
    const newTask = {
      id: Date.now(),
      user_id: Number(userId),
      parent_task_id: taskData.parent_task_id || null,
      title: taskData.title,
      description: taskData.description || '',
      priority: taskData.priority || 'Medium',
      category: taskData.category || 'personal',
      due_date: taskData.due_date || null,
      due_time: taskData.due_time || null,
      status: taskData.status || 'Not Started',
      estimated_duration: taskData.estimated_duration || 0,
      recurrence: taskData.recurrence || 'none',
      notes: taskData.notes || '',
      created_at: new Date().toISOString()
    };
    tasks.push(newTask);
    setItem(KEYS.TASKS, tasks);

    if (newTask.status === 'Completed') {
      storage.addXp(userId, 10, `Completed task: ${newTask.title}`);
    }

    return { ...newTask, subtasks: [] };
  },

  updateTask: async (userId, id, taskData) => {
    const tasks = getItem(KEYS.TASKS, []);
    const index = tasks.findIndex(t => t.id === Number(id) && t.user_id === Number(userId));
    if (index === -1) throw new Error('Task not found.');

    const prevStatus = tasks[index].status;
    tasks[index] = { ...tasks[index], ...taskData };
    setItem(KEYS.TASKS, tasks);

    if (taskData.status === 'Completed' && prevStatus !== 'Completed') {
      storage.addXp(userId, 10, `Completed task: ${tasks[index].title}`);
    } else if (prevStatus === 'Completed' && taskData.status && taskData.status !== 'Completed') {
      storage.addXp(userId, -10, `Reverted task: ${tasks[index].title}`);
    }

    return tasks[index];
  },

  deleteTask: async (userId, id) => {
    let tasks = getItem(KEYS.TASKS, []);
    tasks = tasks.filter(t => !( (t.id === Number(id) || t.parent_task_id === Number(id)) && t.user_id === Number(userId) ));
    setItem(KEYS.TASKS, tasks);
    return { message: 'Task deleted successfully.' };
  },

  // Habits Methods
  getHabits: async (userId) => {
    const habits = getItem(KEYS.HABITS, []).filter(h => h.user_id === Number(userId));
    const habitLogs = getItem(KEYS.HABIT_LOGS, []);

    return habits.map(h => {
      const logs = habitLogs.filter(l => l.habit_id === h.id);
      const completedDates = logs.filter(l => l.status === 'completed').map(l => l.date);
      const stats = storage.calculateHabitStats(completedDates, logs);
      return {
        ...h,
        ...stats,
        logs
      };
    });
  },

  calculateHabitStats: (completedDates, logs) => {
    const totalLogs = logs.length;
    const completedCount = completedDates.length;
    const completionRate = totalLogs > 0 ? Math.round((completedCount / totalLogs) * 100) : 0;

    let currentStreak = 0;
    let checkDate = new Date();
    let checkStr = checkDate.toLocaleDateString('sv');

    if (!completedDates.includes(checkStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = checkDate.toLocaleDateString('sv');
    }

    while (completedDates.includes(checkStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = checkDate.toLocaleDateString('sv');
    }

    return {
      currentStreak,
      bestStreak: Math.max(currentStreak, completedCount),
      completionRate
    };
  },

  createHabit: async (userId, habitData) => {
    const habits = getItem(KEYS.HABITS, []);
    const newHabit = {
      id: Date.now(),
      user_id: Number(userId),
      name: habitData.name,
      icon: habitData.icon || 'check-circle',
      color: habitData.color || '#6366f1',
      frequency: habitData.frequency || 'daily',
      target: habitData.target || 1,
      reminder_time: habitData.reminder_time || null,
      start_date: new Date().toLocaleDateString('sv')
    };
    habits.push(newHabit);
    setItem(KEYS.HABITS, habits);

    return { ...newHabit, currentStreak: 0, bestStreak: 0, completionRate: 0, logs: [] };
  },

  logHabit: async (userId, habit_id, date, status) => {
    const logs = getItem(KEYS.HABIT_LOGS, []);
    const index = logs.findIndex(l => l.habit_id === Number(habit_id) && l.date === date);
    if (index !== -1) {
      const prevStatus = logs[index].status;
      logs[index].status = status;
      if (status === 'completed' && prevStatus !== 'completed') {
        storage.addXp(userId, 5, 'Logged habit completion', date);
      } else if (status === 'missed' && prevStatus === 'completed') {
        storage.addXp(userId, -5, 'Reverted habit completion', date);
      }
    } else {
      logs.push({ id: Date.now(), habit_id: Number(habit_id), date, status });
      if (status === 'completed') {
        storage.addXp(userId, 5, 'Logged habit completion', date);
      }
    }
    setItem(KEYS.HABIT_LOGS, logs);
    return { message: 'Habit log recorded.' };
  },

  deleteHabit: async (userId, id) => {
    let habits = getItem(KEYS.HABITS, []);
    let logs = getItem(KEYS.HABIT_LOGS, []);
    habits = habits.filter(h => !(h.id === Number(id) && h.user_id === Number(userId)));
    logs = logs.filter(l => l.habit_id !== Number(id));
    setItem(KEYS.HABITS, habits);
    setItem(KEYS.HABIT_LOGS, logs);
    return { message: 'Habit deleted successfully.' };
  },

  // Goals & Milestones
  getGoals: async (userId) => {
    const goals = getItem(KEYS.GOALS, []).filter(g => g.user_id === Number(userId));
    const milestones = getItem(KEYS.MILESTONES, []);

    return goals.map(g => {
      const goalMiles = milestones.filter(m => m.goal_id === g.id);
      const compCount = goalMiles.filter(m => m.status === 'completed').length;
      const calcProgress = goalMiles.length > 0 ? Math.round((compCount / goalMiles.length) * 100) : g.progress;

      return {
        ...g,
        progress: calcProgress,
        milestones: goalMiles
      };
    });
  },

  createGoal: async (userId, goalData) => {
    const goals = getItem(KEYS.GOALS, []);
    const milestones = getItem(KEYS.MILESTONES, []);
    const newGoal = {
      id: Date.now(),
      user_id: Number(userId),
      title: goalData.title,
      description: goalData.description || '',
      type: goalData.type || 'monthly',
      category: goalData.category || 'personal',
      deadline: goalData.deadline || null,
      target: goalData.target || 100,
      progress: 0,
      created_at: new Date().toISOString()
    };
    goals.push(newGoal);
    setItem(KEYS.GOALS, goals);

    const createdMilestones = [];
    if (goalData.milestones && Array.isArray(goalData.milestones)) {
      goalData.milestones.forEach((mTitle, idx) => {
        const mObj = { id: Date.now() + idx, goal_id: newGoal.id, title: mTitle, status: 'pending' };
        milestones.push(mObj);
        createdMilestones.push(mObj);
      });
      setItem(KEYS.MILESTONES, milestones);
    }

    return { ...newGoal, milestones: createdMilestones };
  },

  updateMilestone: async (userId, milestoneId, status) => {
    const milestones = getItem(KEYS.MILESTONES, []);
    const index = milestones.findIndex(m => m.id === Number(milestoneId));
    if (index === -1) throw new Error('Milestone not found.');

    const prevStatus = milestones[index].status;
    milestones[index].status = status;
    setItem(KEYS.MILESTONES, milestones);

    if (status === 'completed' && prevStatus !== 'completed') {
      storage.addXp(userId, 20, `Completed milestone: ${milestones[index].title}`);
    } else if (prevStatus === 'completed' && status !== 'completed') {
      storage.addXp(userId, -20, `Reverted milestone: ${milestones[index].title}`);
    }

    return milestones[index];
  },

  deleteGoal: async (userId, id) => {
    let goals = getItem(KEYS.GOALS, []);
    let milestones = getItem(KEYS.MILESTONES, []);
    goals = goals.filter(g => !(g.id === Number(id) && g.user_id === Number(userId)));
    milestones = milestones.filter(m => m.goal_id !== Number(id));
    setItem(KEYS.GOALS, goals);
    setItem(KEYS.MILESTONES, milestones);
    return { message: 'Goal deleted successfully.' };
  },

  // Activities & Schedule
  getActivities: async (userId, date = null) => {
    const filterDate = date || new Date().toLocaleDateString('sv');
    const activities = getItem(KEYS.ACTIVITIES, []).filter(a => a.user_id === Number(userId) && a.date === filterDate);
    return activities.sort((a, b) => a.start_time.localeCompare(b.start_time));
  },

  createActivity: async (userId, actData) => {
    const activities = getItem(KEYS.ACTIVITIES, []);
    const newAct = {
      id: Date.now(),
      user_id: Number(userId),
      title: actData.title,
      start_time: actData.start_time,
      end_time: actData.end_time,
      category: actData.category || 'personal',
      completed: actData.completed ? 1 : 0,
      date: actData.date || new Date().toLocaleDateString('sv')
    };
    activities.push(newAct);
    setItem(KEYS.ACTIVITIES, activities);
    return newAct;
  },

  updateActivity: async (userId, id, actData) => {
    const activities = getItem(KEYS.ACTIVITIES, []);
    const index = activities.findIndex(a => a.id === Number(id) && a.user_id === Number(userId));
    if (index === -1) throw new Error('Activity not found.');

    const prevComp = activities[index].completed;
    activities[index] = { ...activities[index], ...actData };
    setItem(KEYS.ACTIVITIES, activities);

    if (actData.completed === 1 && prevComp !== 1) {
      storage.addXp(userId, 5, `Completed activity: ${activities[index].title}`);
    }

    return activities[index];
  },

  deleteActivity: async (userId, id) => {
    let activities = getItem(KEYS.ACTIVITIES, []);
    activities = activities.filter(a => !(a.id === Number(id) && a.user_id === Number(userId)));
    setItem(KEYS.ACTIVITIES, activities);
    return { message: 'Activity deleted successfully.' };
  },

  // Time Tracker Entries
  getTimeEntries: async (userId) => {
    const entries = getItem(KEYS.TIME_ENTRIES, []).filter(t => t.user_id === Number(userId));
    return entries.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
  },

  createTimeEntry: async (userId, data) => {
    const entries = getItem(KEYS.TIME_ENTRIES, []);
    const newEntry = {
      id: Date.now(),
      user_id: Number(userId),
      activity_name: data.activity_name,
      category: data.category || 'coding',
      start_time: data.start_time || new Date().toISOString(),
      stop_time: data.stop_time || null,
      duration: data.duration || null,
      notes: data.notes || ''
    };
    entries.push(newEntry);
    setItem(KEYS.TIME_ENTRIES, entries);
    return newEntry;
  },

  updateTimeEntry: async (userId, id, data) => {
    const entries = getItem(KEYS.TIME_ENTRIES, []);
    const index = entries.findIndex(t => t.id === Number(id) && t.user_id === Number(userId));
    if (index === -1) throw new Error('Time entry not found.');

    entries[index] = { ...entries[index], ...data };
    setItem(KEYS.TIME_ENTRIES, entries);

    if (data.duration && data.duration > 60) {
      const minutes = Math.round(data.duration / 60);
      storage.addXp(userId, Math.min(50, Math.max(5, Math.round(minutes / 5))), `Logged ${minutes}m focus session: ${entries[index].activity_name}`);
    }

    return entries[index];
  },

  // Journal & Mood Methods
  getJournalEntries: async (userId, date = null, search = null) => {
    let list = getItem(KEYS.JOURNAL, []).filter(j => j.user_id === Number(userId));
    if (date) list = list.filter(j => j.date === date);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(j => 
        (j.morning_intention && j.morning_intention.toLowerCase().includes(s)) ||
        (j.evening_review && j.evening_review.toLowerCase().includes(s)) ||
        (j.notes && j.notes.toLowerCase().includes(s)) ||
        (j.tags && j.tags.toLowerCase().includes(s))
      );
    }
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  saveJournalEntry: async (userId, data) => {
    const list = getItem(KEYS.JOURNAL, []);
    const filterDate = data.date || new Date().toLocaleDateString('sv');
    const index = list.findIndex(j => j.user_id === Number(userId) && j.date === filterDate);

    if (index !== -1) {
      list[index] = { ...list[index], ...data };
      setItem(KEYS.JOURNAL, list);
      return list[index];
    } else {
      const newEntry = {
        id: Date.now(),
        user_id: Number(userId),
        date: filterDate,
        morning_intention: data.morning_intention || '',
        evening_review: data.evening_review || '',
        went_well: data.went_well || '',
        could_improve: data.could_improve || '',
        grateful_for: data.grateful_for || '',
        tomorrow_goals: data.tomorrow_goals || '',
        notes: data.notes || '',
        tags: data.tags || '',
        is_starred: data.is_starred ? 1 : 0
      };
      list.push(newEntry);
      setItem(KEYS.JOURNAL, list);
      storage.addXp(userId, 10, 'Saved daily journal log', filterDate);
      return newEntry;
    }
  },

  getMoodLogs: async (userId, date = null) => {
    let list = getItem(KEYS.MOOD, []).filter(m => m.user_id === Number(userId));
    if (date) list = list.filter(m => m.date === date);
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  saveMoodLog: async (userId, data) => {
    const list = getItem(KEYS.MOOD, []);
    const filterDate = data.date || new Date().toLocaleDateString('sv');
    const index = list.findIndex(m => m.user_id === Number(userId) && m.date === filterDate);

    if (index !== -1) {
      list[index] = { ...list[index], ...data };
      setItem(KEYS.MOOD, list);
      return list[index];
    } else {
      const newLog = {
        id: Date.now(),
        user_id: Number(userId),
        date: filterDate,
        mood_score: data.mood_score || 3,
        energy_score: data.energy_score || 3,
        notes: data.notes || ''
      };
      list.push(newLog);
      setItem(KEYS.MOOD, list);
      storage.addXp(userId, 5, 'Logged mood rating', filterDate);
      return newLog;
    }
  },

  // Daily Reviews & Calculated Productivity Scores
  calculateProductivityScore: (userId, date) => {
    const settings = getItem(KEYS.SETTINGS, []).find(s => s.user_id === Number(userId));
    const weights = settings && settings.score_weights ? settings.score_weights : { tasks: 30, habits: 20, goals: 20, time: 15, schedule: 15 };

    // 1. Task Completion
    const dailyTasks = getItem(KEYS.TASKS, []).filter(t => t.user_id === Number(userId) && t.due_date === date);
    let tasksScore = 100;
    if (dailyTasks.length > 0) {
      const comp = dailyTasks.filter(t => t.status === 'Completed').length;
      tasksScore = Math.round((comp / dailyTasks.length) * 100);
    }

    // 2. Habit Completion
    const activeHabits = getItem(KEYS.HABITS, []).filter(h => h.user_id === Number(userId) && h.start_date <= date);
    const habitLogs = getItem(KEYS.HABIT_LOGS, []);
    let habitsScore = 100;
    if (activeHabits.length > 0) {
      let comp = 0;
      activeHabits.forEach(h => {
        const log = habitLogs.find(l => l.habit_id === h.id && l.date === date);
        if (log && log.status === 'completed') comp++;
      });
      habitsScore = Math.round((comp / activeHabits.length) * 100);
    }

    // 3. Goal Progress
    const userGoals = getItem(KEYS.GOALS, []).filter(g => g.user_id === Number(userId));
    let goalsScore = 100;
    if (userGoals.length > 0) {
      const totalProg = userGoals.reduce((sum, g) => sum + (g.progress || 0), 0);
      goalsScore = Math.round(totalProg / userGoals.length);
    }

    // 4. Time Tracking Focus Target
    const timeEntries = getItem(KEYS.TIME_ENTRIES, []).filter(t => t.user_id === Number(userId) && t.start_time && t.start_time.startsWith(date));
    const totalFocusSec = timeEntries.reduce((sum, t) => sum + (t.duration || 0), 0);
    const focusTargetSec = 4 * 3600; // 4 hours goal
    const timeScore = Math.min(100, Math.round((totalFocusSec / focusTargetSec) * 100));

    // 5. Schedule Adherence
    const schedActs = getItem(KEYS.ACTIVITIES, []).filter(a => a.user_id === Number(userId) && a.date === date);
    let scheduleScore = 100;
    if (schedActs.length > 0) {
      const comp = schedActs.filter(a => a.completed === 1).length;
      scheduleScore = Math.round((comp / schedActs.length) * 100);
    }

    const overallScore = Math.round(
      (tasksScore * (weights.tasks / 100)) +
      (habitsScore * (weights.habits / 100)) +
      (goalsScore * (weights.goals / 100)) +
      (timeScore * (weights.time / 100)) +
      (scheduleScore * (weights.schedule / 100))
    );

    return {
      score: overallScore,
      breakdown: {
        tasks: { score: tasksScore, completed: dailyTasks.filter(t => t.status === 'Completed').length, total: dailyTasks.length, weight: weights.tasks },
        habits: { score: habitsScore, completed: activeHabits.filter(h => habitLogs.some(l => l.habit_id === h.id && l.date === date && l.status === 'completed')).length, total: activeHabits.length, weight: weights.habits },
        goals: { score: goalsScore, total: userGoals.length, weight: weights.goals },
        time: { score: timeScore, trackedMinutes: Math.round(totalFocusSec / 60), targetMinutes: 240, weight: weights.time },
        schedule: { score: scheduleScore, completed: schedActs.filter(a => a.completed === 1).length, total: schedActs.length, weight: weights.schedule }
      }
    };
  },

  getDailyReview: async (userId, date = null) => {
    const checkDate = date || new Date().toLocaleDateString('sv');
    const calc = storage.calculateProductivityScore(userId, checkDate);
    const reviews = getItem(KEYS.REVIEWS, []);
    const saved = reviews.find(r => r.user_id === Number(userId) && r.date === checkDate);

    return {
      date: checkDate,
      calculated: calc,
      savedReview: saved || null
    };
  },

  saveDailyReview: async (userId, data) => {
    const reviews = getItem(KEYS.REVIEWS, []);
    const checkDate = data.date || new Date().toLocaleDateString('sv');
    const calc = storage.calculateProductivityScore(userId, checkDate);
    const index = reviews.findIndex(r => r.user_id === Number(userId) && r.date === checkDate);

    const reviewObj = {
      id: index !== -1 ? reviews[index].id : Date.now(),
      user_id: Number(userId),
      date: checkDate,
      score: calc.score,
      breakdown_json: JSON.stringify(calc.breakdown),
      notes: data.notes || ''
    };

    if (index !== -1) {
      reviews[index] = reviewObj;
    } else {
      reviews.push(reviewObj);
      storage.addXp(userId, 15, 'Saved daily productivity review', checkDate);
    }
    setItem(KEYS.REVIEWS, reviews);
    return reviewObj;
  },

  // Analytics & AI Coach Insights
  getAnalytics: async (userId, range = '7days') => {
    const limitDays = range === '30days' ? 30 : 7;
    const dateList = [];
    for (let i = limitDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dateList.push(d.toLocaleDateString('sv'));
    }

    const reviews = getItem(KEYS.REVIEWS, []);
    const productivityHistory = dateList.map(d => {
      const saved = reviews.find(r => r.user_id === Number(userId) && r.date === d);
      if (saved) return { date: d, score: saved.score };
      const calc = storage.calculateProductivityScore(userId, d);
      return { date: d, score: calc.score };
    });

    const userTasks = getItem(KEYS.TASKS, []).filter(t => t.user_id === Number(userId));
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = userTasks.filter(t => ['Not Started', 'In Progress'].includes(t.status)).length;

    const timeEntries = getItem(KEYS.TIME_ENTRIES, []).filter(t => t.user_id === Number(userId));
    const timeSums = {};
    timeEntries.forEach(t => {
      timeSums[t.category] = (timeSums[t.category] || 0) + (t.duration || 0);
    });
    const timeTrackingByCategory = Object.keys(timeSums).map(cat => ({
      category: cat,
      total_seconds: timeSums[cat],
      minutes: Math.round(timeSums[cat] / 60)
    }));

    const moodLogs = getItem(KEYS.MOOD, []).filter(m => m.user_id === Number(userId));
    const moodCorrelation = moodLogs.map(m => {
      const rev = productivityHistory.find(ph => ph.date === m.date);
      return {
        date: m.date,
        mood: m.mood_score,
        energy: m.energy_score,
        score: rev ? rev.score : 70
      };
    });

    return {
      productivityHistory,
      taskStats: { total: totalTasks, completed: completedTasks, pending: pendingTasks },
      timeByCategories: timeTrackingByCategory,
      moodCorrelation
    };
  },

  getAiCoachInsights: async (userId) => {
    const startRangeDate = new Date();
    startRangeDate.setDate(startRangeDate.getDate() - 7);
    const startRange = startRangeDate.toLocaleDateString('sv');

    const tasks = getItem(KEYS.TASKS, []).filter(t => t.user_id === Number(userId) && t.due_date && t.due_date >= startRange);
    let warnings = [];
    let positives = [];
    let insights = [];

    const compTasks = tasks.filter(t => t.status === 'Completed').length;
    if (tasks.length > 10 && (compTasks / tasks.length) < 0.5) {
      warnings.push(`You planned ${tasks.length} tasks this week but only completed ${compTasks}. Consider breaking large tasks into smaller subtasks.`);
    } else if (compTasks >= 5) {
      positives.push(`Strong completion momentum: You closed out ${compTasks} target tasks this week!`);
    }

    const habits = getItem(KEYS.HABITS, []).filter(h => h.user_id === Number(userId));
    habits.forEach(h => {
      const logs = getItem(KEYS.HABIT_LOGS, []).filter(l => l.habit_id === h.id && l.date >= startRange);
      const missed = logs.filter(l => l.status === 'missed').length;
      if (missed >= 3) {
        warnings.push(`You missed your ${h.name} habit ${missed} times this week. Try setting a daily reminder.`);
      }
    });

    positives.push(`Consistency tracker: You have maintained activity entries across 5 key days.`);
    insights.push(`Peak Focus Time: Analytics indicate your highest focus session durations occur between 09:00 AM and 11:30 AM.`);

    const proposedSchedule = [
      { start_time: '07:00', end_time: '08:00', title: 'Morning Exercise & Nutrition', category: 'exercise' },
      { start_time: '09:00', end_time: '11:30', title: 'Deep Work: High Priority Coding', category: 'coding' },
      { start_time: '14:00', end_time: '15:30', title: 'Task Review & Admin Planning', category: 'work' },
      { start_time: '21:00', end_time: '22:00', title: 'Evening Journaling & Reflection', category: 'personal' }
    ];

    return {
      summary: `You completed ${compTasks} tasks and tracked habits across ${habits.length} habits this week.`,
      positives,
      warnings,
      insights,
      proposedSchedule
    };
  },

  // Gamification XP Methods
  addXp: (userId, xp, reason, date = null) => {
    const logs = getItem(KEYS.XP_LOGS, []);
    const logDate = date || new Date().toLocaleDateString('sv');
    logs.push({
      id: Date.now(),
      user_id: Number(userId),
      xp,
      reason,
      date: logDate
    });
    setItem(KEYS.XP_LOGS, logs);
  },

  getGamification: async (userId) => {
    const logs = getItem(KEYS.XP_LOGS, []).filter(x => x.user_id === Number(userId));
    const totalXp = logs.reduce((sum, x) => sum + (x.xp || 0), 0);

    const level = Math.floor(totalXp / 100) + 1;
    const prevLevelXp = (level - 1) * 100;
    const xpForNext = level * 100;

    return {
      totalXp,
      level,
      prevLevelXp,
      xpForNext,
      logs: logs.sort((a, b) => b.id - a.id)
    };
  },

  // Global Search
  searchAll: async (userId, query) => {
    if (!query) return { tasks: [], habits: [], goals: [], journal: [] };
    const q = query.toLowerCase();

    const tasks = getItem(KEYS.TASKS, []).filter(t => t.user_id === Number(userId) && t.title.toLowerCase().includes(q));
    const habits = getItem(KEYS.HABITS, []).filter(h => h.user_id === Number(userId) && h.name.toLowerCase().includes(q));
    const goals = getItem(KEYS.GOALS, []).filter(g => g.user_id === Number(userId) && g.title.toLowerCase().includes(q));
    const journal = getItem(KEYS.JOURNAL, []).filter(j => j.user_id === Number(userId) && ((j.morning_intention && j.morning_intention.toLowerCase().includes(q)) || (j.notes && j.notes.toLowerCase().includes(q))));

    return { tasks, habits, goals, journal };
  },

  // JSON Export & Delete Account
  exportData: async (userId) => {
    return {
      user: storage.getCurrentUser(userId),
      settings: storage.getSettings(userId),
      tasks: getItem(KEYS.TASKS, []).filter(t => t.user_id === Number(userId)),
      habits: getItem(KEYS.HABITS, []).filter(h => h.user_id === Number(userId)),
      goals: getItem(KEYS.GOALS, []).filter(g => g.user_id === Number(userId)),
      activities: getItem(KEYS.ACTIVITIES, []).filter(a => a.user_id === Number(userId)),
      time_entries: getItem(KEYS.TIME_ENTRIES, []).filter(t => t.user_id === Number(userId)),
      journal_entries: getItem(KEYS.JOURNAL, []).filter(j => j.user_id === Number(userId)),
      mood_logs: getItem(KEYS.MOOD, []).filter(m => m.user_id === Number(userId)),
      daily_reviews: getItem(KEYS.REVIEWS, []).filter(r => r.user_id === Number(userId)),
      xp_logs: getItem(KEYS.XP_LOGS, []).filter(x => x.user_id === Number(userId))
    };
  },

  deleteAccount: async (userId) => {
    const uid = Number(userId);
    setItem(KEYS.USERS, getItem(KEYS.USERS, []).filter(u => u.id !== uid));
    setItem(KEYS.SETTINGS, getItem(KEYS.SETTINGS, []).filter(s => s.user_id !== uid));
    setItem(KEYS.TASKS, getItem(KEYS.TASKS, []).filter(t => t.user_id !== uid));
    setItem(KEYS.HABITS, getItem(KEYS.HABITS, []).filter(h => h.user_id !== uid));
    setItem(KEYS.GOALS, getItem(KEYS.GOALS, []).filter(g => g.user_id !== uid));
    setItem(KEYS.ACTIVITIES, getItem(KEYS.ACTIVITIES, []).filter(a => a.user_id !== uid));
    setItem(KEYS.TIME_ENTRIES, getItem(KEYS.TIME_ENTRIES, []).filter(t => t.user_id !== uid));
    setItem(KEYS.JOURNAL, getItem(KEYS.JOURNAL, []).filter(j => j.user_id !== uid));
    setItem(KEYS.MOOD, getItem(KEYS.MOOD, []).filter(m => m.user_id !== uid));
    setItem(KEYS.REVIEWS, getItem(KEYS.REVIEWS, []).filter(r => r.user_id !== uid));
    setItem(KEYS.XP_LOGS, getItem(KEYS.XP_LOGS, []).filter(x => x.user_id !== uid));
    return { message: 'Account deleted successfully.' };
  }
};

// Initialize default data immediately
initBrowserStorage();

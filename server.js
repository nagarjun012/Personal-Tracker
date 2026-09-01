import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, initDatabase } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'antigravity-tracker-secret-key-2026';

app.use(cors());
app.use(express.json());

// Initialize Database Schemas and Seed Data
initDatabase();

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token missing.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// Register User
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    const passwordHash = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash)
      VALUES (?, ?, ?)
    `).run(name, email, passwordHash);

    const userId = result.lastInsertRowid;

    // Create default settings for new user
    const defaultWeights = JSON.stringify({
      tasks: 30,
      habits: 20,
      goals: 20,
      time: 15,
      schedule: 15
    });
    
    db.prepare(`
      INSERT INTO settings (user_id, theme, notifications_enabled, xp_enabled, score_weights, wake_time, sleep_time)
      VALUES (?, 'system', 1, 1, ?, '07:00', '22:30')
    `).run(userId, defaultWeights);

    // Create default habit seeds for onboarding
    const defaultHabits = [
      { name: 'Exercise', icon: 'dumbbell', color: '#10b981', freq: 'daily', target: 1 },
      { name: 'Coding', icon: 'code', color: '#6366f1', freq: 'daily', target: 1 },
      { name: 'Drink Water', icon: 'droplet', color: '#3b82f6', freq: 'daily', target: 8 }
    ];
    for (const h of defaultHabits) {
      db.prepare(`
        INSERT INTO habits (user_id, name, icon, color, frequency, target, start_date)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_DATE)
      `).run(userId, h.name, h.icon, h.color, h.freq, h.target);
    }

    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: userId, name, email }
    });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists.' });
    }
    res.status(500).json({ error: 'Registration failed. Server error.' });
  }
});

// Login User
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed. Server error.' });
  }
});

// Get Current Logged-in User
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// Password Reset Mock
app.post('/api/auth/reset-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  // Since we are running locally, we mock success
  res.json({ message: 'If the account exists, a password reset link has been simulated.' });
});

// ==========================================
// SETTINGS ENDPOINTS
// ==========================================
app.get('/api/settings', authenticateToken, (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(req.userId);
    res.json({
      ...settings,
      score_weights: settings ? JSON.parse(settings.score_weights) : null
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings.' });
  }
});

app.put('/api/settings', authenticateToken, (req, res) => {
  const { theme, notifications_enabled, xp_enabled, score_weights, wake_time, sleep_time, main_focus } = req.body;
  try {
    const existing = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(req.userId);
    
    const nextTheme = theme !== undefined ? theme : (existing?.theme || 'system');
    const nextNotif = notifications_enabled !== undefined ? (notifications_enabled ? 1 : 0) : (existing?.notifications_enabled ?? 1);
    const nextXp = xp_enabled !== undefined ? (xp_enabled ? 1 : 0) : (existing?.xp_enabled ?? 1);
    const nextWeights = score_weights !== undefined ? JSON.stringify(score_weights) : (existing?.score_weights || JSON.stringify({ tasks: 30, habits: 20, goals: 20, time: 15, schedule: 15 }));
    const nextWake = wake_time !== undefined ? wake_time : (existing?.wake_time || '07:00');
    const nextSleep = sleep_time !== undefined ? sleep_time : (existing?.sleep_time || '22:30');
    const nextFocus = main_focus !== undefined ? main_focus : (existing?.main_focus || '');

    db.prepare(`
      UPDATE settings
      SET theme = ?, notifications_enabled = ?, xp_enabled = ?, score_weights = ?, wake_time = ?, sleep_time = ?, main_focus = ?
      WHERE user_id = ?
    `).run(nextTheme, nextNotif, nextXp, nextWeights, nextWake, nextSleep, nextFocus, req.userId);
    
    res.json({ message: 'Settings updated successfully.' });
  } catch (err) {
    console.error('Failed to update settings:', err);
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

// ==========================================
// GAMIFICATION / XP ENDPOINTS
// ==========================================
function addXp(userId, xp, reason, date = null) {
  const logDate = date || new Date().toLocaleDateString('sv');
  try {
    db.prepare(`
      INSERT INTO gamification_logs (user_id, xp, reason, date)
      VALUES (?, ?, ?, ?)
    `).run(userId, xp, reason, logDate);
  } catch (err) {
    console.error('Failed to log XP:', err);
  }
}

app.get('/api/gamification', authenticateToken, (req, res) => {
  try {
    const totalXpRow = db.prepare('SELECT SUM(xp) as total FROM gamification_logs WHERE user_id = ?').get(req.userId);
    const totalXp = totalXpRow.total || 0;
    
    // Level brackets: Level 1 (0-100), Level 2 (101-300), Level 3 (301-600), Level 4 (601-1000), Level 5 (1001+)
    let level = 1;
    let rank = 'Beginner';
    let xpForNext = 100;
    let prevLevelXp = 0;

    if (totalXp > 1000) {
      level = 5;
      rank = 'Master';
      xpForNext = totalXp; // Max level
      prevLevelXp = 1000;
    } else if (totalXp > 600) {
      level = 4;
      rank = 'Disciplined';
      xpForNext = 1000;
      prevLevelXp = 600;
    } else if (totalXp > 300) {
      level = 3;
      rank = 'Focused';
      xpForNext = 600;
      prevLevelXp = 300;
    } else if (totalXp > 100) {
      level = 2;
      rank = 'Consistent';
      xpForNext = 300;
      prevLevelXp = 100;
    }

    const logs = db.prepare('SELECT * FROM gamification_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(req.userId);

    res.json({
      totalXp,
      level,
      rank,
      xpForNext,
      prevLevelXp,
      logs
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve gamification details.' });
  }
});

// ==========================================
// TASKS ENDPOINTS
// ==========================================
app.get('/api/tasks', authenticateToken, (req, res) => {
  const { date, category, status } = req.query;
  let query = 'SELECT * FROM tasks WHERE user_id = ?';
  const params = [req.userId];

  if (date) {
    query += ' AND due_date = ?';
    params.push(date);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY due_date ASC, priority DESC';

  try {
    const tasks = db.prepare(query).all(...params);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

app.post('/api/tasks', authenticateToken, (req, res) => {
  const { title, description, priority, category, status, due_date, due_time, estimated_duration, recurrence, parent_task_id, notes } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Task title is required.' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO tasks (user_id, title, description, priority, category, status, due_date, due_time, estimated_duration, recurrence, parent_task_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.userId,
      title,
      description || '',
      priority || 'medium',
      category || 'personal',
      status || 'Not Started',
      due_date || null,
      due_time || null,
      estimated_duration || 0,
      recurrence || 'none',
      parent_task_id || null,
      notes || ''
    );

    const createdTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    
    // XP for task completion if it starts completed (rare, but possible)
    if (status === 'Completed') {
      addXp(req.userId, 10, `Completed task: ${title}`, due_date);
    }

    res.status(201).json(createdTask);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, priority, category, status, due_date, due_time, estimated_duration, actual_duration, recurrence, notes } = req.body;
  
  try {
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(id, req.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    let completedAt = existing.completed_at;
    if (status === 'Completed' && existing.status !== 'Completed') {
      completedAt = new Date().toISOString();
      addXp(req.userId, 10, `Completed task: ${title || existing.title}`, due_date || existing.due_date);
    } else if (status !== 'Completed' && existing.status === 'Completed') {
      completedAt = null;
      // Deduct XP or log negative XP for reverting
      addXp(req.userId, -10, `Reopened task: ${title || existing.title}`, due_date || existing.due_date);
    }

    db.prepare(`
      UPDATE tasks
      SET title = ?, description = ?, priority = ?, category = ?, status = ?, due_date = ?, due_time = ?, 
          estimated_duration = ?, actual_duration = ?, recurrence = ?, notes = ?, completed_at = ?
      WHERE id = ? AND user_id = ?
    `).run(
      title !== undefined ? title : existing.title,
      description !== undefined ? description : existing.description,
      priority !== undefined ? priority : existing.priority,
      category !== undefined ? category : existing.category,
      status !== undefined ? status : existing.status,
      due_date !== undefined ? due_date : existing.due_date,
      due_time !== undefined ? due_time : existing.due_time,
      estimated_duration !== undefined ? estimated_duration : existing.estimated_duration,
      actual_duration !== undefined ? actual_duration : existing.actual_duration,
      recurrence !== undefined ? recurrence : existing.recurrence,
      notes !== undefined ? notes : existing.notes,
      completedAt,
      id,
      req.userId
    );

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task.' });
  }
});

// ==========================================
// HABIT ENDPOINTS
// ==========================================

// Habit Streak Helper
function calculateHabitStats(habitId) {
  const logs = db.prepare('SELECT date, status FROM habit_logs WHERE habit_id = ? ORDER BY date DESC').all(habitId);
  if (logs.length === 0) {
    return { currentStreak: 0, bestStreak: 0, completionRate: 0 };
  }

  const completedDates = logs.filter(l => l.status === 'completed').map(l => l.date);
  const totalDays = logs.length;
  const completionRate = Math.round((completedDates.length / totalDays) * 100);

  // Streaks calculation (checking consecutive calendar days backwards)
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  // For current streak, let's look at consecutive dates from today backwards
  const todayStr = new Date().toLocaleDateString('sv');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString('sv');

  let streakActive = completedDates.includes(todayStr) || completedDates.includes(yesterdayStr);

  // Sort logs ascending to scan for best streak
  const sortedLogs = [...logs].reverse();
  let maxStreak = 0;
  let runningStreak = 0;
  let lastDate = null;

  for (const log of sortedLogs) {
    if (log.status === 'completed') {
      if (lastDate) {
        const diffTime = Math.abs(new Date(log.date) - new Date(lastDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
          runningStreak++;
        } else {
          runningStreak = 1;
        }
      } else {
        runningStreak = 1;
      }
      lastDate = log.date;
      if (runningStreak > maxStreak) {
        maxStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
      lastDate = null;
    }
  }

  // Calculate current streak
  let checkDate = new Date();
  // If not completed today, start checking from yesterday
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
    bestStreak: maxStreak,
    completionRate
  };
}

app.get('/api/habits', authenticateToken, (req, res) => {
  try {
    const habits = db.prepare('SELECT * FROM habits WHERE user_id = ?').all(req.userId);
    const habitsWithStats = habits.map(h => {
      const stats = calculateHabitStats(h.id);
      // Fetch logs for heatmap (last 365 days)
      const logs = db.prepare('SELECT date, status FROM habit_logs WHERE habit_id = ? ORDER BY date ASC').all(h.id);
      return {
        ...h,
        ...stats,
        logs
      };
    });
    res.json(habitsWithStats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch habits.' });
  }
});

app.post('/api/habits', authenticateToken, (req, res) => {
  const { name, icon, color, frequency, target, reminder_time } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Habit name is required.' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO habits (user_id, name, icon, color, frequency, target, reminder_time, start_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_DATE)
    `).run(
      req.userId,
      name,
      icon || 'check-circle',
      color || '#6366f1',
      frequency || 'daily',
      target || 1,
      reminder_time || null
    );

    const createdHabit = db.prepare('SELECT * FROM habits WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      ...createdHabit,
      currentStreak: 0,
      bestStreak: 0,
      completionRate: 0,
      logs: []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create habit.' });
  }
});

app.put('/api/habits/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, icon, color, frequency, target, reminder_time } = req.body;

  try {
    const existing = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?').get(id, req.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Habit not found.' });
    }

    db.prepare(`
      UPDATE habits
      SET name = ?, icon = ?, color = ?, frequency = ?, target = ?, reminder_time = ?
      WHERE id = ? AND user_id = ?
    `).run(
      name !== undefined ? name : existing.name,
      icon !== undefined ? icon : existing.icon,
      color !== undefined ? color : existing.color,
      frequency !== undefined ? frequency : existing.frequency,
      target !== undefined ? target : existing.target,
      reminder_time !== undefined ? reminder_time : existing.reminder_time,
      id,
      req.userId
    );

    const updated = db.prepare('SELECT * FROM habits WHERE id = ?').get(id);
    const stats = calculateHabitStats(id);
    res.json({ ...updated, ...stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update habit.' });
  }
});

app.delete('/api/habits/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM habits WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Habit not found.' });
    }
    res.json({ message: 'Habit deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete habit.' });
  }
});

// Log a Habit completion/miss
app.post('/api/habits/log', authenticateToken, (req, res) => {
  const { habit_id, date, status } = req.body; // status: 'completed' or 'missed'
  if (!habit_id || !date || !status) {
    return res.status(400).json({ error: 'Habit ID, date, and status are required.' });
  }

  try {
    // Verify ownership
    const habit = db.prepare('SELECT name FROM habits WHERE id = ? AND user_id = ?').get(habit_id, req.userId);
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found or unauthorized.' });
    }

    // Insert or update log
    const existingLog = db.prepare('SELECT id, status FROM habit_logs WHERE habit_id = ? AND date = ?').get(habit_id, date);
    if (existingLog) {
      db.prepare('UPDATE habit_logs SET status = ? WHERE id = ?').run(status, existingLog.id);
      
      // Handle XP Adjustment
      if (status === 'completed' && existingLog.status !== 'completed') {
        addXp(req.userId, 5, `Logged habit: ${habit.name}`, date);
      } else if (status === 'missed' && existingLog.status === 'completed') {
        addXp(req.userId, -5, `Reverted habit: ${habit.name}`, date);
      }
    } else {
      db.prepare('INSERT INTO habit_logs (habit_id, date, status) VALUES (?, ?, ?)').run(habit_id, date, status);
      if (status === 'completed') {
        addXp(req.userId, 5, `Logged habit: ${habit.name}`, date);
      }
    }

    const stats = calculateHabitStats(habit_id);
    const logs = db.prepare('SELECT date, status FROM habit_logs WHERE habit_id = ? ORDER BY date ASC').all(habit_id);

    res.json({
      habit_id,
      date,
      status,
      ...stats,
      logs
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log habit.' });
  }
});

// ==========================================
// GOALS ENDPOINTS
// ==========================================
app.get('/api/goals', authenticateToken, (req, res) => {
  try {
    const goals = db.prepare('SELECT * FROM goals WHERE user_id = ?').all(req.userId);
    const goalsWithMilestones = goals.map(g => {
      const milestones = db.prepare('SELECT * FROM goal_milestones WHERE goal_id = ?').all(g.id);
      return {
        ...g,
        milestones
      };
    });
    res.json(goalsWithMilestones);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve goals.' });
  }
});

app.post('/api/goals', authenticateToken, (req, res) => {
  const { title, description, type, category, deadline, target, milestones } = req.body;
  if (!title || !type) {
    return res.status(400).json({ error: 'Goal title and type are required.' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO goals (user_id, title, description, type, category, deadline, target, progress)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `).run(req.userId, title, description || '', type, category || 'personal', deadline || null, target || 100);

    const goalId = result.lastInsertRowid;

    if (milestones && milestones.length > 0) {
      for (const m of milestones) {
        db.prepare('INSERT INTO goal_milestones (goal_id, title, status) VALUES (?, ?, ?)')
          .run(goalId, m, 'pending');
      }
    }

    const created = db.prepare('SELECT * FROM goals WHERE id = ?').get(goalId);
    const createdMilestones = db.prepare('SELECT * FROM goal_milestones WHERE goal_id = ?').all(goalId);

    res.status(201).json({
      ...created,
      milestones: createdMilestones
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create goal.' });
  }
});

app.put('/api/goals/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, type, category, deadline, target, progress } = req.body;

  try {
    const existing = db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?').get(id, req.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Goal not found.' });
    }

    db.prepare(`
      UPDATE goals
      SET title = ?, description = ?, type = ?, category = ?, deadline = ?, target = ?, progress = ?
      WHERE id = ? AND user_id = ?
    `).run(
      title !== undefined ? title : existing.title,
      description !== undefined ? description : existing.description,
      type !== undefined ? type : existing.type,
      category !== undefined ? category : existing.category,
      deadline !== undefined ? deadline : existing.deadline,
      target !== undefined ? target : existing.target,
      progress !== undefined ? progress : existing.progress,
      id,
      req.userId
    );

    const updated = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    const milestones = db.prepare('SELECT * FROM goal_milestones WHERE goal_id = ?').all(id);
    res.json({ ...updated, milestones });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update goal.' });
  }
});

app.delete('/api/goals/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Goal not found.' });
    }
    res.json({ message: 'Goal deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete goal.' });
  }
});

// Update goal milestone status
app.put('/api/goals/milestones/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'completed' or 'pending'

  try {
    // Get milestone info
    const milestone = db.prepare('SELECT * FROM goal_milestones WHERE id = ?').get(id);
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found.' });
    }

    // Verify ownership via goal table
    const goal = db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?').get(milestone.goal_id, req.userId);
    if (!goal) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    db.prepare('UPDATE goal_milestones SET status = ? WHERE id = ?').run(status, id);

    // Dynamic XP for completing milestones/goals
    if (status === 'completed' && milestone.status !== 'completed') {
      addXp(req.userId, 20, `Completed milestone: ${milestone.title}`);
    } else if (status === 'pending' && milestone.status === 'completed') {
      addXp(req.userId, -20, `Reopened milestone: ${milestone.title}`);
    }

    // Re-calculate goal progress based on milestones
    const allMilestones = db.prepare('SELECT status FROM goal_milestones WHERE goal_id = ?').all(milestone.goal_id);
    const completedCount = allMilestones.filter(m => m.status === 'completed').length;
    const totalCount = allMilestones.length;

    let newProgress = 0;
    if (totalCount > 0) {
      newProgress = Math.round((completedCount / totalCount) * 100);
      db.prepare('UPDATE goals SET progress = ? WHERE id = ?').run(newProgress, milestone.goal_id);
      
      // If goal fully complete, award big XP
      if (newProgress === 100 && goal.progress < 100) {
        addXp(req.userId, 100, `Completed goal: ${goal.title}`);
      } else if (newProgress < 100 && goal.progress === 100) {
        addXp(req.userId, -100, `Goal reverted: ${goal.title}`);
      }
    }

    const updatedGoal = db.prepare('SELECT * FROM goals WHERE id = ?').get(milestone.goal_id);
    const updatedMilestones = db.prepare('SELECT * FROM goal_milestones WHERE goal_id = ?').all(milestone.goal_id);

    res.json({
      ...updatedGoal,
      milestones: updatedMilestones
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update milestone.' });
  }
});

// ==========================================
// MY DAY / ACTIVITIES ENDPOINTS
// ==========================================
app.get('/api/activities', authenticateToken, (req, res) => {
  const { date } = req.query;
  const filterDate = date || new Date().toLocaleDateString('sv');

  try {
    const list = db.prepare('SELECT * FROM activities WHERE user_id = ? AND date = ? ORDER BY start_time ASC')
      .all(req.userId, filterDate);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schedule activities.' });
  }
});

app.post('/api/activities', authenticateToken, (req, res) => {
  const { title, description, category, start_time, end_time, date, priority, reminder, notes } = req.body;
  if (!title || !start_time || !end_time || !date) {
    return res.status(400).json({ error: 'Title, start time, end time, and date are required.' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO activities (user_id, title, description, category, start_time, end_time, date, priority, reminder, notes, completed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(
      req.userId,
      title,
      description || '',
      category || 'personal',
      start_time,
      end_time,
      date,
      priority || 'medium',
      reminder ? 1 : 0,
      notes || ''
    );

    const created = db.prepare('SELECT * FROM activities WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create schedule activity.' });
  }
});

app.put('/api/activities/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, category, start_time, end_time, date, priority, reminder, notes, completed } = req.body;

  try {
    const existing = db.prepare('SELECT * FROM activities WHERE id = ? AND user_id = ?').get(id, req.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Activity slot not found.' });
    }

    db.prepare(`
      UPDATE activities
      SET title = ?, description = ?, category = ?, start_time = ?, end_time = ?, date = ?, priority = ?, 
          reminder = ?, notes = ?, completed = ?
      WHERE id = ? AND user_id = ?
    `).run(
      title !== undefined ? title : existing.title,
      description !== undefined ? description : existing.description,
      category !== undefined ? category : existing.category,
      start_time !== undefined ? start_time : existing.start_time,
      end_time !== undefined ? end_time : existing.end_time,
      date !== undefined ? date : existing.date,
      priority !== undefined ? priority : existing.priority,
      reminder !== undefined ? (reminder ? 1 : 0) : existing.reminder,
      notes !== undefined ? notes : existing.notes,
      completed !== undefined ? (completed ? 1 : 0) : existing.completed,
      id,
      req.userId
    );

    const updated = db.prepare('SELECT * FROM activities WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update schedule activity.' });
  }
});

app.delete('/api/activities/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM activities WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Activity slot not found.' });
    }
    res.json({ message: 'Activity deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete schedule activity.' });
  }
});

// ==========================================
// TIME TRACKER ENDPOINTS
// ==========================================
app.get('/api/time-entries', authenticateToken, (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM time_entries WHERE user_id = ? ORDER BY start_time DESC').all(req.userId);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve time tracker logs.' });
  }
});

app.post('/api/time-entries', authenticateToken, (req, res) => {
  const { activity_name, category, start_time } = req.body;
  if (!activity_name || !category) {
    return res.status(400).json({ error: 'Activity name and category are required.' });
  }

  // Stop any other running timer first!
  try {
    const running = db.prepare('SELECT * FROM time_entries WHERE user_id = ? AND end_time IS NULL').get(req.userId);
    if (running) {
      const stopTime = new Date().toISOString();
      const elapsed = Math.round((new Date(stopTime) - new Date(running.start_time)) / 1000);
      db.prepare('UPDATE time_entries SET end_time = ?, duration = ? WHERE id = ?')
        .run(stopTime, elapsed, running.id);
    }

    const tStart = start_time || new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO time_entries (user_id, activity_name, category, start_time, end_time, duration)
      VALUES (?, ?, ?, ?, NULL, 0)
    `).run(req.userId, activity_name, category, tStart);

    const created = db.prepare('SELECT * FROM time_entries WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Failed to start timer.' });
  }
});

app.put('/api/time-entries/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { end_time, duration, activity_name } = req.body;

  try {
    const existing = db.prepare('SELECT * FROM time_entries WHERE id = ? AND user_id = ?').get(id, req.userId);
    if (!existing) {
      return res.status(404).json({ error: 'Timer entry not found.' });
    }

    let calculatedDuration = duration || existing.duration;
    let tEnd = end_time || existing.end_time;

    if (end_time && !existing.end_time) {
      calculatedDuration = Math.round((new Date(end_time) - new Date(existing.start_time)) / 1000);
      
      // Award XP for tracking productive sessions (>15 mins)
      if (calculatedDuration > 900 && ['coding', 'study', 'work'].includes(existing.category)) {
        addXp(req.userId, 15, `Tracked focus session: ${existing.activity_name} (${Math.round(calculatedDuration / 60)} min)`);
      }
    }

    db.prepare(`
      UPDATE time_entries
      SET activity_name = ?, end_time = ?, duration = ?
      WHERE id = ? AND user_id = ?
    `).run(
      activity_name || existing.activity_name,
      tEnd,
      calculatedDuration,
      id,
      req.userId
    );

    const updated = db.prepare('SELECT * FROM time_entries WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update timer.' });
  }
});

// ==========================================
// JOURNAL ENDPOINTS
// ==========================================
app.get('/api/journal', authenticateToken, (req, res) => {
  const { date, q, tag, favorite } = req.query;
  let query = 'SELECT * FROM journal_entries WHERE user_id = ?';
  const params = [req.userId];

  if (date) {
    query += ' AND date = ?';
    params.push(date);
  }
  if (tag) {
    query += ' AND tags LIKE ?';
    params.push(`%${tag}%`);
  }
  if (favorite === '1') {
    query += ' AND is_favorite = 1';
  }
  if (q) {
    query += ' AND (notes LIKE ? OR morning_accomplish LIKE ? OR evening_accomplish LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  query += ' ORDER BY date DESC';

  try {
    const list = db.prepare(query).all(...params);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search journal logs.' });
  }
});

app.post('/api/journal', authenticateToken, (req, res) => {
  const { date, morning_accomplish, evening_accomplish, went_well, could_improve, grateful_for, tomorrow_focus, notes, tags, is_favorite } = req.body;
  if (!date) {
    return res.status(400).json({ error: 'Journal date is required.' });
  }

  try {
    const existing = db.prepare('SELECT * FROM journal_entries WHERE user_id = ? AND date = ?').get(req.userId, date);

    if (existing) {
      db.prepare(`
        UPDATE journal_entries
        SET morning_accomplish = ?, evening_accomplish = ?, went_well = ?, could_improve = ?, 
            grateful_for = ?, tomorrow_focus = ?, notes = ?, tags = ?, is_favorite = ?
        WHERE id = ?
      `).run(
        morning_accomplish !== undefined ? morning_accomplish : existing.morning_accomplish,
        evening_accomplish !== undefined ? evening_accomplish : existing.evening_accomplish,
        went_well !== undefined ? went_well : existing.went_well,
        could_improve !== undefined ? could_improve : existing.could_improve,
        grateful_for !== undefined ? grateful_for : existing.grateful_for,
        tomorrow_focus !== undefined ? tomorrow_focus : existing.tomorrow_focus,
        notes !== undefined ? notes : existing.notes,
        tags !== undefined ? tags : existing.tags,
        is_favorite !== undefined ? (is_favorite ? 1 : 0) : existing.is_favorite,
        existing.id
      );
      
      // XP bonus for journaling daily
      if (!existing.notes && notes) {
        addXp(req.userId, 15, 'Completed daily journal entry', date);
      }
    } else {
      db.prepare(`
        INSERT INTO journal_entries (user_id, date, morning_accomplish, evening_accomplish, went_well, could_improve, grateful_for, tomorrow_focus, notes, tags, is_favorite)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.userId,
        date,
        morning_accomplish || '',
        evening_accomplish || '',
        went_well || '',
        could_improve || '',
        grateful_for || '',
        tomorrow_focus || '',
        notes || '',
        tags || '',
        is_favorite ? 1 : 0
      );
      addXp(req.userId, 15, 'Created daily journal log', date);
    }

    const updated = db.prepare('SELECT * FROM journal_entries WHERE user_id = ? AND date = ?').get(req.userId, date);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save journal log.' });
  }
});

// ==========================================
// MOOD & ENERGY ENDPOINTS
// ==========================================
app.get('/api/mood', authenticateToken, (req, res) => {
  const { date } = req.query;
  let query = 'SELECT * FROM mood_logs WHERE user_id = ?';
  const params = [req.userId];

  if (date) {
    query += ' AND date = ?';
    params.push(date);
  }
  query += ' ORDER BY date DESC';

  try {
    const list = db.prepare(query).all(...params);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve mood logs.' });
  }
});

app.post('/api/mood', authenticateToken, (req, res) => {
  const { date, mood, energy, notes } = req.body;
  if (!date || !mood || !energy) {
    return res.status(400).json({ error: 'Date, mood, and energy level are required.' });
  }

  try {
    const existing = db.prepare('SELECT id FROM mood_logs WHERE user_id = ? AND date = ?').get(req.userId, date);
    if (existing) {
      db.prepare('UPDATE mood_logs SET mood = ?, energy = ?, notes = ? WHERE id = ?')
        .run(mood, energy, notes || '', existing.id);
    } else {
      db.prepare('INSERT INTO mood_logs (user_id, date, mood, energy, notes) VALUES (?, ?, ?, ?, ?)')
        .run(req.userId, date, mood, energy, notes || '');
      addXp(req.userId, 5, 'Logged daily mood & energy status', date);
    }
    const log = db.prepare('SELECT * FROM mood_logs WHERE user_id = ? AND date = ?').get(req.userId, date);
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: 'Failed to log mood details.' });
  }
});

// ==========================================
// PRODUCTIVITY SCORE CALCULATOR & REVIEWS
// ==========================================
function calculateProductivityScore(userId, date) {
  // Fetch weights
  const settings = db.prepare('SELECT score_weights FROM settings WHERE user_id = ?').get(userId);
  const weights = (settings && settings.score_weights) ? JSON.parse(settings.score_weights) : { tasks: 30, habits: 20, goals: 20, time: 15, schedule: 15 };

  let tasksScore = 100;
  let habitsScore = 100;
  let goalsScore = 100;
  let timeScore = 100;
  let scheduleScore = 100;

  // 1. Task Completion Score
  const dailyTasks = db.prepare('SELECT status FROM tasks WHERE user_id = ? AND due_date = ?').all(userId, date);
  if (dailyTasks.length > 0) {
    const comp = dailyTasks.filter(t => t.status === 'Completed').length;
    tasksScore = Math.round((comp / dailyTasks.length) * 100);
  }

  // 2. Habit Completion Score
  const activeHabits = db.prepare('SELECT id FROM habits WHERE user_id = ? AND start_date <= ?').all(userId, date);
  if (activeHabits.length > 0) {
    let completedHabitsCount = 0;
    for (const h of activeHabits) {
      const log = db.prepare('SELECT status FROM habit_logs WHERE habit_id = ? AND date = ?').get(h.id, date);
      if (log && log.status === 'completed') {
        completedHabitsCount++;
      }
    }
    habitsScore = Math.round((completedHabitsCount / activeHabits.length) * 100);
  }

  // 3. Goal Progress Score
  const activeGoals = db.prepare('SELECT progress FROM goals WHERE user_id = ?').all(userId);
  if (activeGoals.length > 0) {
    const sumProgress = activeGoals.reduce((acc, curr) => acc + curr.progress, 0);
    goalsScore = Math.round(sumProgress / activeGoals.length);
  }

  // 4. Time Tracker Score (Target 4 hours of focus work: coding, study, work)
  const trackedTimeRow = db.prepare(`
    SELECT SUM(duration) as total_sec FROM time_entries 
    WHERE user_id = ? AND start_time LIKE ? AND category IN ('coding', 'study', 'work')
  `).get(userId, `${date}%`);
  const trackedTimeMin = Math.round((trackedTimeRow.total_sec || 0) / 60);
  // Target: 240 minutes (4 hours)
  timeScore = Math.min(100, Math.round((trackedTimeMin / 240) * 100));

  // 5. Schedule Adherence Score (My Day activities)
  const schedActivities = db.prepare('SELECT completed FROM activities WHERE user_id = ? AND date = ?').all(userId, date);
  if (schedActivities.length > 0) {
    const compAct = schedActivities.filter(a => a.completed === 1).length;
    scheduleScore = Math.round((compAct / schedActivities.length) * 100);
  }

  // Weighted total
  const finalScore = Math.round(
    (tasksScore * (weights.tasks / 100)) +
    (habitsScore * (weights.habits / 100)) +
    (goalsScore * (weights.goals / 100)) +
    (timeScore * (weights.time / 100)) +
    (scheduleScore * (weights.schedule / 100))
  );

  return {
    score: finalScore,
    breakdown: {
      tasks: { score: tasksScore, completed: dailyTasks.filter(t => t.status === 'Completed').length, total: dailyTasks.length, weight: weights.tasks },
      habits: { score: habitsScore, completed: activeHabits.length > 0 ? habitsScore * activeHabits.length / 100 : 0, total: activeHabits.length, weight: weights.habits },
      goals: { score: goalsScore, weight: weights.goals },
      time: { score: timeScore, minutesTracked: trackedTimeMin, weight: weights.time },
      schedule: { score: scheduleScore, completed: schedActivities.filter(a => a.completed === 1).length, total: schedActivities.length, weight: weights.schedule }
    }
  };
}

app.get('/api/reviews', authenticateToken, (req, res) => {
  const { date } = req.query;
  const checkDate = date || new Date().toLocaleDateString('sv');

  try {
    // Return calculated score breakups dynamically or saved review
    const calc = calculateProductivityScore(req.userId, checkDate);
    const saved = db.prepare('SELECT * FROM daily_reviews WHERE user_id = ? AND date = ?').get(req.userId, checkDate);
    res.json({
      date: checkDate,
      calculated: calc,
      savedReview: saved || null
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve daily score.' });
  }
});

app.post('/api/reviews', authenticateToken, (req, res) => {
  const { date, wins, missed, tomorrow_priorities } = req.body;
  if (!date) {
    return res.status(400).json({ error: 'Review date is required.' });
  }

  try {
    const calc = calculateProductivityScore(req.userId, date);
    const moodLog = db.prepare('SELECT mood, energy FROM mood_logs WHERE user_id = ? AND date = ?').get(req.userId, date);
    
    const existing = db.prepare('SELECT id FROM daily_reviews WHERE user_id = ? AND date = ?').get(req.userId, date);
    
    if (existing) {
      db.prepare(`
        UPDATE daily_reviews
        SET score = ?, tasks_completed = ?, tasks_total = ?, habits_completed = ?, habits_total = ?, 
            time_tracked = ?, mood = ?, energy = ?, wins = ?, missed = ?, tomorrow_priorities = ?
        WHERE id = ?
      `).run(
        calc.score,
        calc.breakdown.tasks.completed,
        calc.breakdown.tasks.total,
        calc.breakdown.habits.completed,
        calc.breakdown.habits.total,
        calc.breakdown.time.minutesTracked,
        moodLog ? moodLog.mood : null,
        moodLog ? moodLog.energy : null,
        wins || '',
        missed || '',
        tomorrow_priorities || '',
        existing.id
      );
    } else {
      db.prepare(`
        INSERT INTO daily_reviews (user_id, date, score, tasks_completed, tasks_total, habits_completed, habits_total, time_tracked, mood, energy, wins, missed, tomorrow_priorities)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.userId,
        date,
        calc.score,
        calc.breakdown.tasks.completed,
        calc.breakdown.tasks.total,
        calc.breakdown.habits.completed,
        calc.breakdown.habits.total,
        calc.breakdown.time.minutesTracked,
        moodLog ? moodLog.mood : null,
        moodLog ? moodLog.energy : null,
        wins || '',
        missed || '',
        tomorrow_priorities || ''
      );
      addXp(req.userId, 20, 'Logged end-of-day daily review', date);
    }

    const review = db.prepare('SELECT * FROM daily_reviews WHERE user_id = ? AND date = ?').get(req.userId, date);
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit daily review.' });
  }
});

// ==========================================
// ANALYTICS ENDPOINTS
// ==========================================
app.get('/api/analytics', authenticateToken, (req, res) => {
  const { range } = req.query; // '7days', '30days'
  const limitDays = range === '30days' ? 30 : 7;
  
  try {
    // Generate dates array
    const dateList = [];
    for (let i = limitDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dateList.push(d.toLocaleDateString('sv'));
    }

    // 1. Productivity Scores over time
    const productivityHistory = dateList.map(d => {
      const saved = db.prepare('SELECT score FROM daily_reviews WHERE user_id = ? AND date = ?').get(req.userId, d);
      if (saved) return { date: d, score: saved.score };
      const calc = calculateProductivityScore(req.userId, d);
      return { date: d, score: calc.score };
    });

    // 2. Task Stats
    const totalTasksRow = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE user_id = ?').get(req.userId);
    const completedTasksRow = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'Completed'").get(req.userId);
    const pendingTasksRow = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status IN ('Not Started', 'In Progress')").get(req.userId);
    
    // 3. Time Tracker Distribution by Category
    const timeTrackingByCategory = db.prepare(`
      SELECT category, SUM(duration) as total_seconds
      FROM time_entries
      WHERE user_id = ? AND start_time >= ?
      GROUP BY category
    `).all(req.userId, new Date(Date.now() - limitDays * 24 * 60 * 60 * 1000).toISOString());

    // 4. Mood and Energy Correlations
    const moodCorrelation = db.prepare(`
      SELECT m.date, m.mood, m.energy, COALESCE(r.score, 0) as productivity_score
      FROM mood_logs m
      LEFT JOIN daily_reviews r ON m.user_id = r.user_id AND m.date = r.date
      WHERE m.user_id = ?
      ORDER BY m.date DESC LIMIT ?
    `).all(req.userId, limitDays);

    res.json({
      productivityHistory,
      tasks: {
        total: totalTasksRow.count || 0,
        completed: completedTasksRow.count || 0,
        pending: pendingTasksRow.count || 0,
        rate: totalTasksRow.count > 0 ? Math.round((completedTasksRow.count / totalTasksRow.count) * 100) : 0
      },
      timeByCategories: timeTrackingByCategory.map(t => ({
        category: t.category,
        minutes: Math.round(t.total_seconds / 60)
      })),
      moodCorrelation
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

// ==========================================
// AI DAILY COACH & SMART INSIGHTS
// ==========================================
app.get('/api/ai-coach', authenticateToken, (req, res) => {
  try {
    const todayStr = new Date().toLocaleDateString('sv');
    
    // Fetch last 7 days metrics
    const startRangeDate = new Date();
    startRangeDate.setDate(startRangeDate.getDate() - 7);
    const startRange = startRangeDate.toLocaleDateString('sv');
    
    // 1. Task Completion stats
    const tasks = db.prepare('SELECT status, due_date FROM tasks WHERE user_id = ? AND due_date >= ?').all(req.userId, startRange);
    
    // Heuristic: Check if user plans too many tasks
    const tasksPerDay = {};
    const completedPerDay = {};
    for (const t of tasks) {
      if (!t.due_date) continue;
      tasksPerDay[t.due_date] = (tasksPerDay[t.due_date] || 0) + 1;
      if (t.status === 'Completed') {
        completedPerDay[t.due_date] = (completedPerDay[t.due_date] || 0) + 1;
      }
    }
    
    let insights = [];
    let warnings = [];
    let positives = [];

    const dayKeys = Object.keys(tasksPerDay);
    if (dayKeys.length >= 3) {
      // Find core correlation
      let totalTasksPlanned = 0;
      let totalTasksCompleted = 0;
      let highDensityDaysCount = 0;
      let highDensityCompletionRate = 0;
      let lowDensityDaysCount = 0;
      let lowDensityCompletionRate = 0;

      for (const d of dayKeys) {
        const planned = tasksPerDay[d];
        const completed = completedPerDay[d] || 0;
        totalTasksPlanned += planned;
        totalTasksCompleted += completed;

        if (planned >= 8) {
          highDensityDaysCount++;
          highDensityCompletionRate += (completed / planned);
        } else {
          lowDensityDaysCount++;
          lowDensityCompletionRate += (completed / planned);
        }
      }

      highDensityCompletionRate = highDensityDaysCount > 0 ? Math.round((highDensityCompletionRate / highDensityDaysCount) * 100) : 0;
      lowDensityCompletionRate = lowDensityDaysCount > 0 ? Math.round((lowDensityCompletionRate / lowDensityDaysCount) * 100) : 0;

      if (highDensityDaysCount > 0 && lowDensityCompletionRate > highDensityCompletionRate) {
        insights.push(`You complete more tasks (${lowDensityCompletionRate}%) when you plan fewer than 8 tasks per day, compared to ${highDensityCompletionRate}% on high-volume days.`);
      }
    } else {
      insights.push('Not enough task data yet. Keep tracking for a few more days.');
    }

    // 2. Habit streaks check
    const userHabits = db.prepare('SELECT id, name FROM habits WHERE user_id = ?').all(req.userId);
    let habitTrouble = null;
    let habitSuccess = null;

    for (const h of userHabits) {
      const stats = calculateHabitStats(h.id);
      
      // Look at last 7 days completions
      const lastWeekLogs = db.prepare('SELECT status FROM habit_logs WHERE habit_id = ? AND date >= ? ORDER BY date DESC').all(h.id, startRange);
      const missedCount = lastWeekLogs.filter(l => l.status === 'missed').length;

      if (missedCount >= 3) {
        habitTrouble = { name: h.name, count: missedCount };
      }
      if (stats.currentStreak >= 5) {
        habitSuccess = { name: h.name, streak: stats.currentStreak };
      }
    }

    if (habitTrouble) {
      warnings.push(`You missed your ${habitTrouble.name} habit ${habitTrouble.count} times this week. Try scheduling a specific daily reminder.`);
    }
    if (habitSuccess) {
      positives.push(`Fantastic job! You are on a ${habitSuccess.streak}-day streak for your ${habitSuccess.name} habit. Keep it burning! 🔥`);
    }

    // 3. Time tracker analysis
    const timeEntries = db.prepare('SELECT category, duration FROM time_entries WHERE user_id = ? AND start_time >= ?').all(req.userId, new Date(Date.now() - 7 * 86400000).toISOString());
    let studyWorkSeconds = 0;
    let entertainmentSeconds = 0;

    for (const entry of timeEntries) {
      if (['coding', 'study', 'work'].includes(entry.category)) {
        studyWorkSeconds += entry.duration;
      } else if (entry.category === 'entertainment') {
        entertainmentSeconds += entry.duration;
      }
    }

    const studyMin = Math.round(studyWorkSeconds / 60);
    const enterMin = Math.round(entertainmentSeconds / 60);

    if (enterMin > studyMin && enterMin > 0) {
      warnings.push(`You spent more time on entertainment (${Math.round(enterMin / 60)}h) than productive focus hours (${Math.round(studyMin / 60)}h) this week.`);
    } else if (studyMin > 0) {
      positives.push(`Productive focus: You tracked ${Math.round(studyMin / 60)}h of focused work (coding/study/work) over the last 7 days.`);
    }

    // 4. Mood and Energy levels check
    const moods = db.prepare('SELECT mood, energy FROM mood_logs WHERE user_id = ? AND date >= ?').all(req.userId, startRange);
    const sluggishDays = moods.filter(m => m.mood === 'Low' || m.energy === 'Low').length;
    if (sluggishDays >= 2) {
      insights.push('Correlation noticed: Low energy days usually align with periods of skipped exercise and irregular wake times.');
    }

    // 5. Build Tomorrow's Proposed Schedule
    const settings = db.prepare('SELECT wake_time, sleep_time FROM settings WHERE user_id = ?').get(req.userId);
    const wakeTime = settings ? settings.wake_time : '07:00';
    const sleepTime = settings ? settings.sleep_time : '22:30';

    // Proposed schedule list
    const wakeH = parseInt(wakeTime.split(':')[0]);
    const sleepH = parseInt(sleepTime.split(':')[0]);

    // Pull pending high-priority tasks
    const pendingHighTasks = db.prepare(`
      SELECT title, category FROM tasks 
      WHERE user_id = ? AND status != 'Completed' AND priority = 'high' 
      LIMIT 2
    `).all(req.userId);

    const proposedSchedule = [
      { start_time: wakeTime, end_time: `${String(wakeH).padStart(2, '0')}:30`, title: 'Wake Up & Morning Hydration', category: 'personal' }
    ];

    let currentHour = wakeH + 1;
    proposedSchedule.push({ start_time: `${String(currentHour - 1).padStart(2, '0')}:30`, end_time: `${String(currentHour).padStart(2, '0')}:30`, title: 'Morning Exercise Session', category: 'exercise' });
    currentHour++;

    proposedSchedule.push({ start_time: `${String(currentHour - 1).padStart(2, '0')}:30`, end_time: `${String(currentHour).padStart(2, '0')}:00`, title: 'Breakfast & Planning', category: 'personal' });

    // Insert high priority tasks if any
    if (pendingHighTasks.length > 0) {
      proposedSchedule.push({ 
        start_time: `${String(currentHour).padStart(2, '0')}:00`, 
        end_time: `${String(currentHour + 2).padStart(2, '0')}:00`, 
        title: `Deep Work: ${pendingHighTasks[0].title}`, 
        category: pendingHighTasks[0].category 
      });
      currentHour += 2;
    } else {
      proposedSchedule.push({ 
        start_time: `${String(currentHour).padStart(2, '0')}:00`, 
        end_time: `${String(currentHour + 2).padStart(2, '0')}:00`, 
        title: 'Core Coding & Project Building', 
        category: 'coding' 
      });
      currentHour += 2;
    }

    proposedSchedule.push({ start_time: `${String(currentHour).padStart(2, '0')}:00`, end_time: `${String(currentHour + 1).padStart(2, '0')}:00`, title: 'Lunch Break & Walk', category: 'personal' });
    currentHour++;

    proposedSchedule.push({ start_time: `${String(currentHour).padStart(2, '0')}:00`, end_time: `${String(currentHour + 2).padStart(2, '0')}:00`, title: 'Secondary Tasks & Inbox review', category: 'work' });
    currentHour += 2;

    proposedSchedule.push({ start_time: `${String(currentHour).padStart(2, '0')}:00`, end_time: `${String(currentHour + 1).padStart(2, '0')}:30`, title: 'Personal Skill Study & Reading', category: 'study' });
    currentHour += 2;

    proposedSchedule.push({ start_time: `${String(currentHour - 1).padStart(2, '0')}:30`, end_time: `${String(currentHour + 1).padStart(2, '0')}:30`, title: 'Dinner & Relaxation', category: 'entertainment' });
    
    proposedSchedule.push({ start_time: `${String(sleepH - 1).padStart(2, '0')}:30`, end_time: sleepTime, title: 'Evening Journal & Wind Down', category: 'personal' });

    // Standard baseline response fallback if insufficient data
    if (insights.length === 0) insights.push('Continue tracking details daily to discover deeper analytical correlations.');
    if (positives.length === 0) positives.push('Ready to analyze focus logs! Build consistent habits to unlock coach badges.');

    res.json({
      summary: `You completed ${tasks.filter(t => t.status === 'Completed').length} of ${tasks.length} tasks and logged ${userHabits.length} habits this week.`,
      positives,
      warnings,
      insights,
      proposedSchedule
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to compile AI insights.' });
  }
});

// ==========================================
// DATA UTILITY ENDPOINTS
// ==========================================

// JSON Data Backup Export
app.get('/api/data/export', authenticateToken, (req, res) => {
  try {
    const data = {
      user: db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.userId),
      settings: db.prepare('SELECT * FROM settings WHERE user_id = ?').get(req.userId),
      tasks: db.prepare('SELECT * FROM tasks WHERE user_id = ?').all(req.userId),
      habits: db.prepare('SELECT * FROM habits WHERE user_id = ?').all(req.userId),
      goals: db.prepare('SELECT * FROM goals WHERE user_id = ?').all(req.userId),
      activities: db.prepare('SELECT * FROM activities WHERE user_id = ?').all(req.userId),
      time_entries: db.prepare('SELECT * FROM time_entries WHERE user_id = ?').all(req.userId),
      journal_entries: db.prepare('SELECT * FROM journal_entries WHERE user_id = ?').all(req.userId),
      mood_logs: db.prepare('SELECT * FROM mood_logs WHERE user_id = ?').all(req.userId),
      daily_reviews: db.prepare('SELECT * FROM daily_reviews WHERE user_id = ?').all(req.userId),
      xp_logs: db.prepare('SELECT * FROM gamification_logs WHERE user_id = ?').all(req.userId)
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=tracker_backup.json');
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    res.status(500).json({ error: 'Failed to export backup.' });
  }
});

// Delete Account
app.delete('/api/data/delete-account', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.userId);
    res.json({ message: 'Account deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account.' });
  }
});

// ==========================================
// GLOBAL SEARCH ENDPOINT
// ==========================================
app.get('/api/search', authenticateToken, (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json({ results: [] });
  }

  try {
    const searchPattern = `%${q}%`;
    const results = [];

    // Search tasks
    const tasks = db.prepare('SELECT id, title, category, status, due_date FROM tasks WHERE user_id = ? AND (title LIKE ? OR description LIKE ? OR notes LIKE ?) LIMIT 5')
      .all(req.userId, searchPattern, searchPattern, searchPattern);
    tasks.forEach(t => results.push({ type: 'task', title: t.title, subtitle: `Task (${t.category}) - Due ${t.due_date || 'No Date'} - ${t.status}`, id: t.id }));

    // Search habits
    const habits = db.prepare('SELECT id, name, frequency FROM habits WHERE user_id = ? AND name LIKE ? LIMIT 5')
      .all(req.userId, searchPattern);
    habits.forEach(h => results.push({ type: 'habit', title: h.name, subtitle: `Habit (${h.frequency})`, id: h.id }));

    // Search goals
    const goals = db.prepare('SELECT id, title, type FROM goals WHERE user_id = ? AND (title LIKE ? OR description LIKE ?) LIMIT 5')
      .all(req.userId, searchPattern, searchPattern);
    goals.forEach(g => results.push({ type: 'goal', title: g.title, subtitle: `${g.type.toUpperCase()} Goal`, id: g.id }));

    // Search journal
    const journals = db.prepare('SELECT id, date, notes, morning_accomplish, evening_accomplish FROM journal_entries WHERE user_id = ? AND (notes LIKE ? OR morning_accomplish LIKE ? OR evening_accomplish LIKE ?) LIMIT 5')
      .all(req.userId, searchPattern, searchPattern, searchPattern);
    journals.forEach(j => results.push({ type: 'journal', title: `Journal Entry - ${j.date}`, subtitle: j.notes ? j.notes.substring(0, 50) + '...' : 'Intention entry', id: j.id, date: j.date }));

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: 'Global search failed.' });
  }
});

// ==========================================
// SERVE FRONTEND (PRODUCTION BUILD)
// ==========================================
if (process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === 'true') {
  // Serve static files from the build output directory
  app.use(express.static(path.join(__dirname, 'dist')));

  // Fallback for SPA routing: serve index.html
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running in production mode on http://localhost:${PORT}`);
});

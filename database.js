import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';

const DB_FILE = process.env.DATABASE_PATH || 'tracker.db';
export const db = new DatabaseSync(DB_FILE);

// Enable foreign key support
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  console.log('Initializing SQLite Database...');

  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      theme TEXT NOT NULL DEFAULT 'system',
      notifications_enabled INTEGER NOT NULL DEFAULT 1,
      xp_enabled INTEGER NOT NULL DEFAULT 1,
      score_weights TEXT NOT NULL, -- JSON string
      wake_time TEXT NOT NULL DEFAULT '07:00',
      sleep_time TEXT NOT NULL DEFAULT '22:30',
      main_focus TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 3. Tasks Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT NOT NULL DEFAULT 'medium', -- 'high', 'medium', 'low'
      category TEXT NOT NULL DEFAULT 'personal', -- 'work', 'study', 'exercise', 'personal', 'coding', 'entertainment'
      status TEXT NOT NULL DEFAULT 'Not Started', -- 'Not Started', 'In Progress', 'Completed', 'Cancelled'
      due_date TEXT, -- 'YYYY-MM-DD'
      due_time TEXT, -- 'HH:MM'
      estimated_duration INTEGER DEFAULT 0, -- in minutes
      actual_duration INTEGER DEFAULT 0, -- in minutes
      recurrence TEXT NOT NULL DEFAULT 'none', -- 'none', 'daily', 'weekly', 'monthly'
      parent_task_id INTEGER, -- for subtasks
      notes TEXT,
      completed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );
  `);
  db.exec('CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(user_id, due_date);');

  // 4. Habits Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      frequency TEXT NOT NULL DEFAULT 'daily', -- 'daily', 'weekly'
      target INTEGER NOT NULL DEFAULT 1,
      reminder_time TEXT,
      start_date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 5. Habit Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      date TEXT NOT NULL, -- 'YYYY-MM-DD'
      status TEXT NOT NULL DEFAULT 'completed', -- 'completed', 'missed'
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      UNIQUE(habit_id, date)
    );
  `);
  db.exec('CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);');

  // 6. Goals Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
      category TEXT,
      deadline TEXT,
      target INTEGER NOT NULL DEFAULT 100,
      progress INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 7. Goal Milestones Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS goal_milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed'
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
    );
  `);

  // 8. Activities Table (My Day schedule)
  db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'personal',
      start_time TEXT NOT NULL, -- 'HH:MM'
      end_time TEXT NOT NULL, -- 'HH:MM'
      date TEXT NOT NULL, -- 'YYYY-MM-DD'
      priority TEXT NOT NULL DEFAULT 'medium',
      reminder INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  db.exec('CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, date);');

  // 9. Time Entries Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS time_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      activity_name TEXT NOT NULL,
      category TEXT NOT NULL,
      start_time TEXT NOT NULL, -- ISO string
      end_time TEXT, -- ISO string
      duration INTEGER DEFAULT 0, -- in seconds
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 10. Journal Entries Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL, -- 'YYYY-MM-DD'
      morning_accomplish TEXT,
      evening_accomplish TEXT,
      went_well TEXT,
      could_improve TEXT,
      grateful_for TEXT,
      tomorrow_focus TEXT,
      notes TEXT,
      tags TEXT, -- comma-separated
      is_favorite INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    );
  `);

  // 11. Mood Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS mood_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL, -- 'YYYY-MM-DD'
      mood TEXT NOT NULL, -- 'Excellent', 'Good', 'Normal', 'Low', 'Very Low'
      energy TEXT NOT NULL, -- 'High', 'Medium', 'Low'
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    );
  `);

  // 12. Daily Reviews Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL, -- 'YYYY-MM-DD'
      score INTEGER NOT NULL,
      tasks_completed INTEGER NOT NULL,
      tasks_total INTEGER NOT NULL,
      habits_completed INTEGER NOT NULL,
      habits_total INTEGER NOT NULL,
      time_tracked INTEGER NOT NULL, -- in minutes
      mood TEXT,
      energy TEXT,
      wins TEXT,
      missed TEXT,
      tomorrow_priorities TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    );
  `);

  // 13. Gamification Logs Table (XP history)
  db.exec(`
    CREATE TABLE IF NOT EXISTS gamification_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      xp INTEGER NOT NULL,
      reason TEXT NOT NULL,
      date TEXT NOT NULL, -- 'YYYY-MM-DD'
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  seedDemoUser();
}

function seedDemoUser() {
  // Check if demo user exists
  const checkUser = db.prepare('SELECT id FROM users WHERE email = ?').all('demo@example.com');
  if (checkUser.length > 0) {
    console.log('Demo user already exists. Seeding skipped.');
    return;
  }

  console.log('Seeding Demo User and mock logs...');

  // Create demo user
  const passwordHash = bcrypt.hashSync('password123', 10);
  const userInsert = db.prepare(`
    INSERT INTO users (name, email, password_hash)
    VALUES (?, ?, ?)
  `).run('Alex Carter', 'demo@example.com', passwordHash);
  
  const userId = userInsert.lastInsertRowid;

  // Insert default settings
  const defaultWeights = JSON.stringify({
    tasks: 30,
    habits: 20,
    goals: 20,
    time: 15,
    schedule: 15
  });
  
  db.prepare(`
    INSERT INTO settings (user_id, theme, notifications_enabled, xp_enabled, score_weights, wake_time, sleep_time, main_focus)
    VALUES (?, 'system', 1, 1, ?, '06:30', '22:30', 'Personal Growth & Software Engineering')
  `).run(userId, defaultWeights);

  // Define date range for mock logs (August 2, 2026 to August 9, 2026)
  const dates = [
    '2026-08-02',
    '2026-08-03',
    '2026-08-04',
    '2026-08-05',
    '2026-08-06',
    '2026-08-07',
    '2026-08-08',
    '2026-08-09'
  ];

  // 1. Insert Habits
  const habitsData = [
    { name: 'Exercise', icon: 'dumbbell', color: '#10b981', frequency: 'daily', target: 1, reminder: '07:00' },
    { name: 'Coding', icon: 'code', color: '#6366f1', frequency: 'daily', target: 1, reminder: '10:00' },
    { name: 'Reading', icon: 'book-open', color: '#f59e0b', frequency: 'daily', target: 1, reminder: '21:00' },
    { name: 'Drink Water', icon: 'droplet', color: '#3b82f6', frequency: 'daily', target: 8, reminder: '12:00' },
    { name: 'Meditation', icon: 'sparkles', color: '#a855f7', frequency: 'daily', target: 1, reminder: '22:00' }
  ];

  const habitIds = {};
  for (const h of habitsData) {
    const res = db.prepare(`
      INSERT INTO habits (user_id, name, icon, color, frequency, target, reminder_time, start_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, h.name, h.icon, h.color, h.frequency, h.target, h.reminder, '2026-08-01');
    habitIds[h.name] = res.lastInsertRowid;
  }

  // 2. Insert Habit Logs (August 2 to August 9)
  // Exercise completed on: Aug 2, 3, 4, 5, 7, 8, 9 (Missed Aug 6)
  // Coding completed on: Aug 2, 3, 4, 5, 6, 7, 8, 9 (Perfect streak)
  // Reading completed on: Aug 2, 4, 5, 8, 9 (Missed Aug 3, 6, 7)
  // Drink Water completed on: Aug 2, 3, 4, 5, 6, 7, 8, 9 (Perfect streak)
  // Meditation completed on: Aug 2, 5, 8, 9 (Missed Aug 3, 4, 6, 7)
  const habitCompletion = {
    'Exercise': ['2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05', '2026-08-07', '2026-08-08', '2026-08-09'],
    'Coding': ['2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07', '2026-08-08', '2026-08-09'],
    'Reading': ['2026-08-02', '2026-08-04', '2026-08-05', '2026-08-08', '2026-08-09'],
    'Drink Water': ['2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07', '2026-08-08', '2026-08-09'],
    'Meditation': ['2026-08-02', '2026-08-05', '2026-08-08', '2026-08-09']
  };

  const insertHabitLog = db.prepare('INSERT INTO habit_logs (habit_id, date, status) VALUES (?, ?, ?)');
  for (const [habitName, completedDates] of Object.entries(habitCompletion)) {
    const habitId = habitIds[habitName];
    for (const d of dates) {
      const isCompleted = completedDates.includes(d);
      insertHabitLog.run(habitId, d, isCompleted ? 'completed' : 'missed');
    }
  }

  // 3. Insert Goals and Milestones
  const goal1 = db.prepare(`
    INSERT INTO goals (user_id, title, description, type, category, deadline, target, progress)
    VALUES (?, 'Master React Web Development', 'Build interactive web apps using modern frameworks and tools', 'monthly', 'coding', '2026-08-31', 100, 75)
  `).run(userId);
  const goal1Id = goal1.lastInsertRowid;

  const milestones1 = [
    { title: 'Understand React hooks & lifecycle', status: 'completed' },
    { title: 'Setup global state management with Context', status: 'completed' },
    { title: 'Build responsive layouts and custom SVGs', status: 'completed' },
    { title: 'Optimize builds and deploy API server', status: 'pending' }
  ];
  for (const m of milestones1) {
    db.prepare('INSERT INTO goal_milestones (goal_id, title, status) VALUES (?, ?, ?)').run(goal1Id, m.title, m.status);
  }

  const goal2 = db.prepare(`
    INSERT INTO goals (user_id, title, description, type, category, deadline, target, progress)
    VALUES (?, 'Read 12 Books in 2026', 'Focus on personal growth, history, and technical books', 'yearly', 'personal', '2026-12-31', 12, 6)
  `).run(userId);
  const goal2Id = goal2.lastInsertRowid;

  const milestones2 = [
    { title: 'Read Atomic Habits', status: 'completed' },
    { title: 'Read Designing Data-Intensive Applications', status: 'completed' },
    { title: 'Read Deep Work', status: 'completed' },
    { title: 'Read Clean Code', status: 'completed' },
    { title: 'Read Sapiens', status: 'completed' },
    { title: 'Read Thinking, Fast and Slow', status: 'completed' },
    { title: 'Read The Pragmatic Programmer', status: 'pending' }
  ];
  for (const m of milestones2) {
    db.prepare('INSERT INTO goal_milestones (goal_id, title, status) VALUES (?, ?, ?)').run(goal2Id, m.title, m.status);
  }

  // 4. Insert Tasks
  const tasksData = [
    // Historical Tasks
    { title: 'Review last week schedule', priority: 'medium', category: 'personal', status: 'Completed', date: '2026-08-02', est: 30, act: 30, comp: '2026-08-02 09:30:00' },
    { title: 'Draft schema specs for project', priority: 'high', category: 'work', status: 'Completed', date: '2026-08-03', est: 120, act: 150, comp: '2026-08-03 14:30:00' },
    { title: 'Set up SQLite databases and indexes', priority: 'high', category: 'coding', status: 'Completed', date: '2026-08-04', est: 60, act: 50, comp: '2026-08-04 11:20:00' },
    { title: 'Design sidebar navigation panels', priority: 'medium', category: 'coding', status: 'Completed', date: '2026-08-05', est: 90, act: 100, comp: '2026-08-05 16:40:00' },
    { title: 'Purchase grocery list items', priority: 'low', category: 'personal', status: 'Completed', date: '2026-08-06', est: 40, act: 45, comp: '2026-08-06 18:30:00' },
    { title: 'Write unit tests for authentication API', priority: 'high', category: 'coding', status: 'Completed', date: '2026-08-07', est: 90, act: 80, comp: '2026-08-07 15:20:00' },
    { title: 'Polish custom SVG chart interactions', priority: 'high', category: 'coding', status: 'Completed', date: '2026-08-08', est: 120, act: 140, comp: '2026-08-08 17:50:00' },
    
    // Today's Tasks (Aug 9)
    { title: 'Morning Cardio Workout', priority: 'medium', category: 'exercise', status: 'Completed', date: '2026-08-09', est: 45, act: 50, comp: '2026-08-09 07:55:00' },
    { title: 'Integrate SQLite seeds into server.js', priority: 'high', category: 'coding', status: 'Completed', date: '2026-08-09', est: 90, act: 85, comp: '2026-08-09 11:30:00' },
    { title: 'Write AI Coach heuristic analysis route', priority: 'high', category: 'coding', status: 'In Progress', date: '2026-08-09', est: 120, act: 65, comp: null },
    { title: 'Read chapter 4 of Clean Code book', priority: 'low', category: 'study', status: 'Not Started', date: '2026-08-09', est: 30, act: 0, comp: null },
    { title: 'Schedule weekly planning review session', priority: 'medium', category: 'personal', status: 'Not Started', date: '2026-08-09', est: 30, act: 0, comp: null }
  ];

  const insertTask = db.prepare(`
    INSERT INTO tasks (user_id, title, priority, category, status, due_date, estimated_duration, actual_duration, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  for (const t of tasksData) {
    insertTask.run(userId, t.title, t.priority, t.category, t.status, t.date, t.est, t.act, t.comp);
  }

  // 5. Insert Activities (My Day timeline schedule)
  // For Aug 9
  const scheduleData = [
    { title: 'Morning Run & Workout', category: 'exercise', start: '07:00', end: '08:00', completed: 1 },
    { title: 'Healthy Breakfast & News', category: 'personal', start: '08:00', end: '09:00', completed: 1 },
    { title: 'Daily Tracker Backend Code', category: 'coding', start: '09:00', end: '12:00', completed: 1 },
    { title: 'Lunch & Break', category: 'personal', start: '12:00', end: '13:00', completed: 1 },
    { title: 'API Integration & Route Testing', category: 'coding', start: '13:00', end: '15:30', completed: 1 },
    { title: 'Reading Clean Code', category: 'study', start: '16:00', end: '17:00', completed: 0 },
    { title: 'Downtime & Cooking Dinner', category: 'entertainment', start: '18:00', end: '20:00', completed: 0 },
    { title: 'Journaling & Sleep Prep', category: 'personal', start: '21:30', end: '22:30', completed: 0 }
  ];

  const insertActivity = db.prepare(`
    INSERT INTO activities (user_id, title, category, start_time, end_time, date, completed)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const s of scheduleData) {
    insertActivity.run(userId, s.title, s.category, s.start, s.end, '2026-08-09', s.completed);
  }

  // Seed prior days schedule for timeline checks
  for (const d of dates.slice(0, -1)) {
    insertActivity.run(userId, 'Morning workout routine', 'exercise', '07:00', '08:00', d, 1);
    insertActivity.run(userId, 'Core business coding tasks', 'coding', '09:30', '12:30', d, 1);
    insertActivity.run(userId, 'Read personal development books', 'study', '15:00', '16:00', d, 1);
  }

  // 6. Insert Time Tracker Logs (August 2 to August 9)
  const timeTrackerLogs = [
    { date: '2026-08-02', category: 'coding', name: 'UI Components Mockup', duration: 10800 }, // 3h
    { date: '2026-08-02', category: 'study', name: 'Researching design patterns', duration: 3600 }, // 1h
    
    { date: '2026-08-03', category: 'coding', name: 'Database migrations setup', duration: 7200 }, // 2h
    { date: '2026-08-03', category: 'study', name: 'Reading system designs', duration: 5400 }, // 1.5h
    
    { date: '2026-08-04', category: 'coding', name: 'Vite config and React state', duration: 9000 }, // 2.5h
    { date: '2026-08-04', category: 'exercise', name: 'Cardio workout run', duration: 2700 }, // 45m
    
    { date: '2026-08-05', category: 'coding', name: 'Custom Donut and Line charts', duration: 12600 }, // 3.5h
    { date: '2026-08-05', category: 'entertainment', name: 'Gaming session', duration: 5400 }, // 1.5h
    
    { date: '2026-08-06', category: 'coding', name: 'Task Board API integration', duration: 5400 }, // 1.5h
    { date: '2026-08-06', category: 'entertainment', name: 'Watching Netflix movie', duration: 7200 }, // 2h
    
    { date: '2026-08-07', category: 'coding', name: 'Auth middleware implementation', duration: 9000 }, // 2.5h
    { date: '2026-08-07', category: 'study', name: 'Reading TypeScript docs', duration: 3600 }, // 1h
    
    { date: '2026-08-08', category: 'coding', name: 'Refactoring styling design system', duration: 14400 }, // 4h
    { date: '2026-08-08', category: 'entertainment', name: 'Hanging out with friends', duration: 10800 }, // 3h
    
    { date: '2026-08-09', category: 'coding', name: 'Database seeding integration', duration: 10800 }, // 3h
    { date: '2026-08-09', category: 'exercise', name: 'Weight training workout', duration: 3000 } // 50m
  ];

  const insertTimeEntry = db.prepare(`
    INSERT INTO time_entries (user_id, activity_name, category, start_time, end_time, duration)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const entry of timeTrackerLogs) {
    const startStr = `${entry.date}T10:00:00.000Z`;
    const endStr = new Date(new Date(startStr).getTime() + entry.duration * 1000).toISOString();
    insertTimeEntry.run(userId, entry.name, entry.category, startStr, endStr, entry.duration);
  }

  // 7. Insert Journal Entries
  const journalData = [
    {
      date: '2026-08-02',
      morning: 'Kick off personal daily tracker development today. Want to plan architecture.',
      evening: 'Managed to finalize the client layout structure. Simple progress made.',
      well: 'The React folder scaffold layout came together logically.',
      improve: 'Spent too much time detailing UI CSS instead of core mechanics.',
      grateful: 'A peaceful Sunday morning with zero distractions.',
      tomorrow: 'Create database schema configurations.',
      notes: 'Excited about the potential for custom charts. Recharts might be standard but SVG will look slicker.',
      tags: 'milestone,planning,sunday'
    },
    {
      date: '2026-08-03',
      morning: 'Draft database constraints and outline foreign key relations.',
      evening: 'Database design complete. Auth requirements reviewed.',
      well: 'Figured out node:sqlite has low memory footprint and requires no compilation.',
      improve: 'Was distracted by notifications around noon. Need to block social sites.',
      grateful: 'Great constructive talk with a dev friend.',
      tomorrow: 'Initialize Express routing setup.',
      notes: 'Focus was medium. Need to implement Pomodoro or active time logs.',
      tags: 'database,focus'
    },
    {
      date: '2026-08-04',
      morning: 'Connect Node server to the SQLite database module.',
      evening: 'Server communicates successfully with sqlite backend files.',
      well: 'Vite React starts extremely fast. Hot module reloading is working.',
      improve: 'Did not exercise today. Sitting all day makes me stiff.',
      grateful: 'Clean water and a solid workspace.',
      tomorrow: 'Start crafting custom SVG dashboard cards and rings.',
      notes: 'Need to schedule active workouts in My Day. Health first.',
      tags: 'backend,setup'
    },
    {
      date: '2026-08-05',
      morning: 'Implement basic dashboard grid styles and custom charts.',
      evening: 'The SVG donut charts are interactive! Hover effects look super crisp.',
      well: 'Custom rendering was easier than expected. Responsiveness is great.',
      improve: 'Ended up gaming for 1.5h. Need to keep entertainment bounded.',
      grateful: 'Fast internet and simple coding solutions.',
      tomorrow: 'Design Task page and filters.',
      notes: 'Visual design feels premium. Dark theme contrast checks out.',
      tags: 'frontend,design,charts'
    },
    {
      date: '2026-08-06',
      morning: 'Write core task manipulation logic: CRUD + subtasks.',
      evening: 'Main tasks CRUD is complete. Subtasks expand correctly.',
      well: 'Recursion in React components for subtasks works smoothly.',
      improve: 'Skipped morning run and felt sluggish all afternoon. Productivity fell.',
      grateful: 'Fresh groceries and cooking home-cooked food.',
      tomorrow: 'Integrate JWT Authentication tokens.',
      notes: 'Productivity was low today. Realized that exercise directly influences my coding focus.',
      tags: 'tasks,sluggish,learnings'
    },
    {
      date: '2026-08-07',
      morning: 'Set up Express JWT middleware and user registration APIs.',
      evening: 'User auth works securely. Passwords hashed correctly.',
      well: 'Bcrypt runs fast and the session token persists nicely on reloads.',
      improve: 'Spent too much time searching for icons. Use standard lucide names instead.',
      grateful: 'Cool rainy weather, perfect for programming.',
      tomorrow: 'Write UI components for Habits page.',
      notes: 'Auth was simpler than anticipated. Ready for habit heatmap design tomorrow.',
      tags: 'auth,security'
    },
    {
      date: '2026-08-08',
      morning: 'Build habit tracker layout and annual heatmap rendering grid.',
      evening: 'Heatmap is complete! Looks like a modern premium SaaS dashboard.',
      well: 'Rendered grid dynamically. Streak counters are perfectly accurate.',
      improve: 'Slept late reviewing styling tweaks. Sleeping late hurts tomorrow morning.',
      grateful: 'Family health and stable project progress.',
      tomorrow: 'Integrate dashboard details and daily reviews.',
      notes: 'Almost complete with core modules. Ready for testing tomorrow.',
      tags: 'habits,ui,progress'
    },
    {
      date: '2026-08-09',
      morning: 'Prepare Express database seeding script and verify history logs.',
      evening: 'Seeding script creates identical mock records without duplicates.',
      well: 'Everything runs natively in Node. No node-gyp compilation failures!',
      improve: 'Need to write documentation explaining how this local db runs.',
      grateful: 'Completed 90% of Phase 1 milestone requirements ahead of schedule.',
      tomorrow: 'Test AI coach insights logic.',
      notes: 'Solid day. XP system logic is fun to test. Level 2 Consistency reached!',
      tags: 'seeding,testing,milestone'
    }
  ];

  const insertJournal = db.prepare(`
    INSERT INTO journal_entries (user_id, date, morning_accomplish, evening_accomplish, went_well, could_improve, grateful_for, tomorrow_focus, notes, tags, is_favorite)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const j of journalData) {
    db.prepare('DELETE FROM journal_entries WHERE user_id = ? AND date = ?').run(userId, j.date);
    insertJournal.run(userId, j.date, j.morning, j.evening, j.well, j.improve, j.grateful, j.tomorrow, j.notes, j.tags, j.date === '2026-08-08' ? 1 : 0);
  }

  // 8. Insert Mood Logs
  const moodData = [
    { date: '2026-08-02', mood: 'Good', energy: 'High', notes: 'Excited about starting' },
    { date: '2026-08-03', mood: 'Good', energy: 'Medium', notes: 'A bit of mental fatigue' },
    { date: '2026-08-04', mood: 'Normal', energy: 'High', notes: 'Quiet and steady day' },
    { date: '2026-08-05', mood: 'Excellent', energy: 'High', notes: 'SVG charts worked perfectly' },
    { date: '2026-08-06', mood: 'Low', energy: 'Low', notes: 'Sluggish. Didn’t workout.' },
    { date: '2026-08-07', mood: 'Good', energy: 'Medium', notes: 'Auth integrated cleanly' },
    { date: '2026-08-08', mood: 'Excellent', energy: 'High', notes: 'Habits page complete. Looking premium.' },
    { date: '2026-08-09', mood: 'Good', energy: 'High', notes: 'Database seeding fully verified' }
  ];

  const insertMood = db.prepare(`
    INSERT INTO mood_logs (user_id, date, mood, energy, notes)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const m of moodData) {
    db.prepare('DELETE FROM mood_logs WHERE user_id = ? AND date = ?').run(userId, m.date);
    insertMood.run(userId, m.date, m.mood, m.energy, m.notes);
  }

  // 9. Insert Daily Reviews
  // Score formula: Tasks (30%), Habits (20%), Goals (20%), Time (15%), Schedule (15%)
  const reviewData = [
    { date: '2026-08-02', score: 85, t_comp: 1, t_tot: 1, h_comp: 3, h_tot: 5, time: 240, wins: 'Finalized client layout', missed: 'detailing styles early', tomorrow: 'Create database schema' },
    { date: '2026-08-03', score: 78, t_comp: 1, t_tot: 1, h_comp: 3, h_tot: 5, time: 210, wins: 'Finalized database specs', missed: 'social media distractions', tomorrow: 'Initialize Express routing' },
    { date: '2026-08-04', score: 82, t_comp: 1, t_tot: 1, h_comp: 3, h_tot: 5, time: 195, wins: 'Server-database link setup', missed: 'no exercise today', tomorrow: 'Start crafting custom SVG charts' },
    { date: '2026-08-05', score: 90, t_comp: 1, t_tot: 1, h_comp: 4, h_tot: 5, time: 300, wins: 'Interactive SVG donut charts', missed: 'gaming duration over limit', tomorrow: 'Design Task page and filters' },
    { date: '2026-08-06', score: 55, t_comp: 1, t_tot: 1, h_comp: 2, h_tot: 5, time: 210, wins: 'Completed core task CRUD', missed: 'skipped workout, low energy', tomorrow: 'Integrate JWT authentication' },
    { date: '2026-08-07', score: 88, t_comp: 1, t_tot: 1, h_comp: 3, h_tot: 5, time: 210, wins: 'Auth secure endpoints', missed: 'wasted time search icons', tomorrow: 'Write UI for Habits page' },
    { date: '2026-08-08', score: 92, t_comp: 1, t_tot: 1, h_comp: 4, h_tot: 5, time: 420, wins: 'Completed annual habit heatmaps', missed: 'slept late studying layout', tomorrow: 'Verify database seeding' }
  ];

  const insertReview = db.prepare(`
    INSERT INTO daily_reviews (user_id, date, score, tasks_completed, tasks_total, habits_completed, habits_total, time_tracked, wins, missed, tomorrow_priorities)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const r of reviewData) {
    db.prepare('DELETE FROM daily_reviews WHERE user_id = ? AND date = ?').run(userId, r.date);
    insertReview.run(userId, r.date, r.score, r.t_comp, r.t_tot, r.h_comp, r.h_tot, r.time, r.wins, r.missed, r.tomorrow);
  }

  // 10. Insert Gamification Logs
  const xpLogs = [
    { date: '2026-08-02', xp: 10, reason: 'Completed task: Review last week schedule' },
    { date: '2026-08-02', xp: 15, reason: 'Completed 3 habits' },
    { date: '2026-08-03', xp: 10, reason: 'Completed task: Draft schema specs for project' },
    { date: '2026-08-03', xp: 15, reason: 'Completed 3 habits' },
    { date: '2026-08-04', xp: 10, reason: 'Completed task: Set up SQLite databases and indexes' },
    { date: '2026-08-04', xp: 15, reason: 'Completed 3 habits' },
    { date: '2026-08-05', xp: 10, reason: 'Completed task: Design sidebar navigation panels' },
    { date: '2026-08-05', xp: 20, reason: 'Completed 4 habits' },
    { date: '2026-08-06', xp: 10, reason: 'Completed task: Purchase grocery list items' },
    { date: '2026-08-06', xp: 10, reason: 'Completed 2 habits' },
    { date: '2026-08-07', xp: 10, reason: 'Completed task: Write unit tests for authentication API' },
    { date: '2026-08-07', xp: 15, reason: 'Completed 3 habits' },
    { date: '2026-08-08', xp: 10, reason: 'Completed task: Polish custom SVG chart interactions' },
    { date: '2026-08-08', xp: 20, reason: 'Completed 4 habits' },
    { date: '2026-08-08', xp: 100, reason: 'Completed milestone: Build responsive layouts' },
    
    // Today
    { date: '2026-08-09', xp: 10, reason: 'Completed task: Morning Cardio Workout' },
    { date: '2026-08-09', xp: 10, reason: 'Completed task: Integrate SQLite seeds into server.js' }
  ];

  const insertXp = db.prepare(`
    INSERT INTO gamification_logs (user_id, xp, reason, date)
    VALUES (?, ?, ?, ?)
  `);

  for (const x of xpLogs) {
    insertXp.run(userId, x.xp, x.reason, x.date);
  }

  console.log('Seeding demo user complete! Seeded User ID:', userId);
}

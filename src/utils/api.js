import { storage } from './storage';

function getUserId() {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.id;
    } catch (e) {
      console.error('Error parsing user from localStorage', e);
    }
  }
  return 1; // Default to demo user
}

// Router to map URL endpoints to client-side storage methods
async function handleRequest(url, method = 'GET', body = null) {
  const userId = getUserId();
  const cleanUrl = url.split('?')[0];
  const urlParams = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');

  // Auth Routes
  if (cleanUrl === '/api/auth/login') return storage.login(body.email, body.password);
  if (cleanUrl === '/api/auth/signup') return storage.signup(body.name, body.email, body.password);
  if (cleanUrl === '/api/auth/reset-password') return storage.resetPassword(body.email, body.newPassword || body.password);
  if (cleanUrl === '/api/auth/me') return storage.getCurrentUser(userId);

  // Settings
  if (cleanUrl === '/api/settings') {
    if (method === 'GET') return storage.getSettings(userId);
    if (method === 'PUT') return storage.updateSettings(userId, body);
  }

  // Tasks
  if (cleanUrl === '/api/tasks') {
    if (method === 'GET') return storage.getTasks(userId);
    if (method === 'POST') return storage.createTask(userId, body);
  }
  if (cleanUrl.startsWith('/api/tasks/')) {
    const id = cleanUrl.replace('/api/tasks/', '');
    if (method === 'PUT') return storage.updateTask(userId, id, body);
    if (method === 'DELETE') return storage.deleteTask(userId, id);
  }

  // Habits
  if (cleanUrl === '/api/habits') {
    if (method === 'GET') return storage.getHabits(userId);
    if (method === 'POST') return storage.createHabit(userId, body);
  }
  if (cleanUrl.match(/\/api\/habits\/\d+\/log/)) {
    const id = cleanUrl.split('/')[3];
    return storage.logHabit(userId, id, body.date, body.status);
  }
  if (cleanUrl.startsWith('/api/habits/')) {
    const id = cleanUrl.replace('/api/habits/', '');
    if (method === 'DELETE') return storage.deleteHabit(userId, id);
  }

  // Goals
  if (cleanUrl === '/api/goals') {
    if (method === 'GET') return storage.getGoals(userId);
    if (method === 'POST') return storage.createGoal(userId, body);
  }
  if (cleanUrl.startsWith('/api/goals/milestones/')) {
    const id = cleanUrl.replace('/api/goals/milestones/', '');
    if (method === 'PUT') return storage.updateMilestone(userId, id, body.status);
  }
  if (cleanUrl.startsWith('/api/goals/')) {
    const id = cleanUrl.replace('/api/goals/', '');
    if (method === 'DELETE') return storage.deleteGoal(userId, id);
  }

  // Activities & Schedule
  if (cleanUrl === '/api/activities') {
    if (method === 'GET') return storage.getActivities(userId, urlParams.get('date'));
    if (method === 'POST') return storage.createActivity(userId, body);
  }
  if (cleanUrl.startsWith('/api/activities/')) {
    const id = cleanUrl.replace('/api/activities/', '');
    if (method === 'PUT') return storage.updateActivity(userId, id, body);
    if (method === 'DELETE') return storage.deleteActivity(userId, id);
  }

  // Time Entries
  if (cleanUrl === '/api/time-entries') {
    if (method === 'GET') return storage.getTimeEntries(userId);
    if (method === 'POST') return storage.createTimeEntry(userId, body);
  }
  if (cleanUrl.startsWith('/api/time-entries/')) {
    const id = cleanUrl.replace('/api/time-entries/', '');
    if (method === 'PUT') return storage.updateTimeEntry(userId, id, body);
  }

  // Journal & Mood
  if (cleanUrl === '/api/journal') {
    if (method === 'GET') return storage.getJournalEntries(userId, urlParams.get('date'), urlParams.get('search'));
    if (method === 'POST') return storage.saveJournalEntry(userId, body);
  }
  if (cleanUrl === '/api/mood') {
    if (method === 'GET') return storage.getMoodLogs(userId, urlParams.get('date'));
    if (method === 'POST') return storage.saveMoodLog(userId, body);
  }

  // Daily Reviews
  if (cleanUrl === '/api/daily-reviews') {
    if (method === 'GET') return storage.getDailyReview(userId, urlParams.get('date'));
    if (method === 'POST') return storage.saveDailyReview(userId, body);
  }

  // Analytics & AI Coach & Gamification
  if (cleanUrl === '/api/analytics') return storage.getAnalytics(userId, urlParams.get('range') || '7days');
  if (cleanUrl === '/api/ai-coach') return storage.getAiCoachInsights(userId);
  if (cleanUrl === '/api/gamification') return storage.getGamification(userId);
  if (cleanUrl === '/api/search') return storage.searchAll(userId, urlParams.get('q'));
  if (cleanUrl === '/api/export') return storage.exportData(userId);
  if (cleanUrl === '/api/account' && method === 'DELETE') return storage.deleteAccount(userId);

  console.warn(`Unhandled API Route: ${method} ${url}`);
  return { message: 'Success' };
}

export const api = {
  get: (url) => handleRequest(url, 'GET'),
  post: (url, body) => handleRequest(url, 'POST', body),
  put: (url, body) => handleRequest(url, 'PUT', body),
  delete: (url) => handleRequest(url, 'DELETE'),

  // Auth endpoints
  login: async (email, password) => {
    const data = await handleRequest('/api/auth/login', 'POST', { email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  
  signup: async (name, email, password) => {
    const data = await handleRequest('/api/auth/signup', 'POST', { name, email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  resetPassword: (email, newPassword = null) => {
    return handleRequest('/api/auth/reset-password', 'POST', { email, newPassword });
  },

  getCurrentUser: () => {
    return handleRequest('/api/auth/me', 'GET');
  }
};

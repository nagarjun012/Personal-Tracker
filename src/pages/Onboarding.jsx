import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { ArrowRight, Check, Sun, Moon, Target, Award, Sparkles } from 'lucide-react';

export default function Onboarding({ onComplete }) {
  const { user, fetchUserData, addToast } = useApp();
  const [step, setStep] = useState(1);
  
  // Onboarding Form State
  const [name, setName] = useState(user?.name || '');
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState(['Exercise', 'Coding', 'Drink Water']);
  const [wakeTime, setWakeTime] = useState('06:30');
  const [sleepTime, setSleepTime] = useState('22:30');
  const [focus, setFocus] = useState('');

  // Available options
  const goalOptions = [
    'Improve Coding Skills',
    'Build Regular Fitness Habits',
    'Read More Books',
    'Improve Sleep & Energy',
    'Better Time Management',
    'Maintain Daily Journaling'
  ];

  const habitOptions = [
    { name: 'Exercise', icon: 'dumbbell', color: '#10b981' },
    { name: 'Coding', icon: 'code', color: '#6366f1' },
    { name: 'Reading', icon: 'book-open', color: '#f59e0b' },
    { name: 'Drink Water', icon: 'droplet', color: '#3b82f6' },
    { name: 'Meditation', icon: 'sparkles', color: '#a855f7' },
    { name: 'Sleep Early', icon: 'moon', color: '#0f172a' }
  ];

  const toggleGoal = (g) => {
    setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const toggleHabit = (h) => {
    setHabits(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h]);
  };

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      addToast('Please enter your name.', 'warning');
      return;
    }
    if (step === 6 && !focus.trim()) {
      addToast('Please tell us your main focus.', 'warning');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleFinish = async () => {
    try {
      // 1. Update user settings (wake/sleep, main focus)
      const defaultWeights = {
        tasks: 30,
        habits: 20,
        goals: 20,
        time: 15,
        schedule: 15
      };

      await api.put('/api/settings', {
        theme: 'system',
        notifications_enabled: true,
        xp_enabled: true,
        score_weights: defaultWeights,
        wake_time: wakeTime,
        sleep_time: sleepTime,
        main_focus: focus
      });

      // 2. Insert any newly selected habits if they differ from initial defaults
      const habitsList = await api.get('/api/habits');
      const existingNames = habitsList.map(h => h.name);
      
      for (const hName of habits) {
        if (!existingNames.includes(hName)) {
          const matchedOpt = habitOptions.find(o => o.name === hName);
          await api.post('/api/habits', {
            name: hName,
            icon: matchedOpt?.icon || 'check-circle',
            color: matchedOpt?.color || '#6366f1',
            frequency: 'daily',
            target: hName === 'Drink Water' ? 8 : 1
          });
        }
      }

      // 3. Create initial Goals based on selected goals
      for (const selectedGoal of goals) {
        await api.post('/api/goals', {
          title: selectedGoal,
          type: 'monthly',
          category: selectedGoal.toLowerCase().includes('coding') ? 'coding' : 'personal',
          milestones: ['Setup initial milestone checklist']
        });
      }

      addToast('Onboarding complete! Personalizing your dashboard... ✨', 'success');
      
      // Refresh context and callback
      await fetchUserData();
      if (onComplete) onComplete();
    } catch (err) {
      addToast('Failed to save onboarding configuration.', 'error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.04), transparent 50%)'
    }}
    className="animate-fade"
    >
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '550px',
        padding: '3rem 2.5rem',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '440px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '2rem' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{
              flex: 1,
              height: '4px',
              backgroundColor: i <= step ? 'var(--accent-primary)' : 'var(--border-color)',
              borderRadius: 'var(--radius-full)',
              transition: 'background-color var(--transition-fast)'
            }} />
          ))}
        </div>

        {/* Dynamic Step Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {step === 1 && (
            <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>👋</span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Let's start with your name</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>What should we call you in your daily reports?</p>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                style={{ fontSize: '1.1rem', padding: '1rem' }}
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
                <Target size={24} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, uppercase: 'true' }}>Goals</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>What are your main goals?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select what you want to achieve (we'll initialize trackers for these).</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                {goalOptions.map((g) => {
                  const isSelected = goals.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => toggleGoal(g)}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'rgba(var(--accent-primary-rgb), 0.05)' : 'var(--bg-tertiary)',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        fontWeight: isSelected ? 600 : 500
                      }}
                    >
                      <span>{g}</span>
                      {isSelected && <Check size={16} style={{ color: 'var(--accent-primary)' }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)' }}>
                <Award size={24} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, uppercase: 'true' }}>Habits</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Which habits do you want to track?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Consistent habits build streaks and earn you daily XP bonuses.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                {habitOptions.map((h) => {
                  const isSelected = habits.includes(h.name);
                  return (
                    <button
                      key={h.name}
                      onClick={() => toggleHabit(h.name)}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? `2px solid ${h.color}` : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? `${h.color}12` : 'var(--bg-tertiary)',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: isSelected ? 600 : 500,
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isSelected ? h.color : 'var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <Check size={16} />
                      </div>
                      <span style={{ fontSize: '0.9rem' }}>{h.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-amber)' }}>
                <Sun size={24} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Schedule</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>What time do you usually wake up?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Used to plan your morning schedule recommendations.</p>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="input-field"
                style={{ fontSize: '1.5rem', padding: '1rem', textAlign: 'center' }}
              />
            </div>
          )}

          {step === 5 && (
            <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)' }}>
                <Moon size={24} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Schedule</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>What time do you usually sleep?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Used to schedule evening review prompts.</p>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="input-field"
                style={{ fontSize: '1.5rem', padding: '1rem', textAlign: 'center' }}
              />
            </div>
          )}

          {step === 6 && (
            <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
                <Sparkles size={24} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Primary Focus</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>What is your main focus right now?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Describe your core target (e.g. Software Engineering & Fitness, Academic Research, Career Transition).</p>
              <textarea
                placeholder="e.g. Graduating university and coding a SaaS product."
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="input-field"
                style={{ minHeight: '120px', resize: 'none', lineHeight: '1.5' }}
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Footer Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          {step > 1 ? (
            <button onClick={handleBack} className="btn btn-secondary">
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button onClick={handleNext} className="btn btn-primary">
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={handleFinish} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-purple))' }}>
              Finish Setup
              <Sparkles size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

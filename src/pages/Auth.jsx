import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Mail, User, Sparkles } from 'lucide-react';
import { api } from '../utils/api';

export default function Auth() {
  const { login, signup, addToast } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    if (isLogin) {
      if (!email || !password) {
        setAuthError('Please fill in all fields.');
        setLoading(false);
        return;
      }
      try {
        await login(email, password);
      } catch (err) {
        setAuthError(err.message || 'Login failed. Please verify credentials.');
      }
    } else {
      if (!name || !email || !password) {
        setAuthError('Please fill in all fields.');
        setLoading(false);
        return;
      }
      try {
        await signup(name, email, password);
      } catch (err) {
        setAuthError(err.message || 'Signup failed. Email might already exist.');
      }
    }
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setAuthError('');
    try {
      await login('demo@example.com', 'password123');
    } catch (err) {
      setAuthError('Demo login failed.');
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      addToast('Please enter your email address first.', 'warning');
      return;
    }
    try {
      const res = await api.resetPassword(email);
      addToast(res.message, 'success');
    } catch (err) {
      addToast('Failed to trigger password reset.', 'error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 40%)'
    }}
    className="animate-fade"
    >
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.5rem 2rem',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header Branding */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
          }}>
            A
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {isLogin ? 'Access your personal productivity dashboard' : 'Start your holistic self-improvement journey'}
          </p>
        </div>

        {/* Error Callout */}
        {authError && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-red)',
            fontSize: '0.85rem',
            fontWeight: 500
          }}>
            {authError}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!isLogin && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
                  <User size={18} />
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
                <Mail size={18} />
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Password</label>
              {isLogin && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 500, cursor: 'pointer' }}
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
                <Lock size={18} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
        </div>

        {/* Demo Account Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="btn btn-secondary"
          style={{ width: '100%', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
        >
          <Sparkles size={16} />
          Explore with Demo User
        </button>

        {/* Toggle Mode */}
        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setAuthError('');
            }}
            style={{ color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer' }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}

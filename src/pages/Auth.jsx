import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Mail, User, Sparkles, ArrowRight, ShieldCheck, CheckCircle, X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';

export default function Auth() {
  const { login, signup, addToast } = useApp();
  
  // Standard Auth Mode: true = Sign In, false = Sign Up
  const [isLogin, setIsLogin] = useState(true);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Forgot Password / Reset modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  // Submit standard Sign In / Sign Up
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (isLogin) {
      if (!email.trim() || !password) {
        setAuthError('Please enter both your email address and password.');
        return;
      }

      setLoading(true);
      try {
        await login(email.trim(), password);
      } catch (err) {
        setAuthError(err.message || 'Invalid email or password. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!name.trim()) {
        setAuthError('Please enter your full name.');
        return;
      }
      if (!email.trim()) {
        setAuthError('Please enter a valid email address.');
        return;
      }
      if (!password || password.length < 6) {
        setAuthError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setAuthError('Passwords do not match. Please verify.');
        return;
      }

      setLoading(true);
      try {
        await signup(name.trim(), email.trim(), password);
      } catch (err) {
        setAuthError(err.message || 'An account with this email already exists.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Quick-fill demo credentials for easy testing
  const handleFillDemo = (e) => {
    e.preventDefault();
    setEmail('demo@example.com');
    setPassword('password123');
    setAuthError('');
  };

  // Quick 1-click login with demo account
  const handleQuickDemoLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    try {
      await login('demo@example.com', 'password123');
    } catch (err) {
      setAuthError(err.message || 'Demo account login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Reset password handler
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetEmail.trim()) {
      setResetError('Please enter your account email.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setResetError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmResetPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await api.resetPassword(resetEmail.trim(), newPassword);
      setResetSuccess(res.message || 'Password updated successfully!');
      addToast('Password reset successfully! You can now sign in.', 'success');
      setEmail(resetEmail.trim());
      setPassword(newPassword);
      setTimeout(() => {
        setShowResetModal(false);
        setResetSuccess('');
        setResetEmail('');
        setNewPassword('');
        setConfirmResetPassword('');
      }, 1500);
    } catch (err) {
      setResetError(err.message || 'Failed to reset password. Check if email exists.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(0.75rem, 3vw, 1.5rem)',
      background: 'radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.12) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(168, 85, 247, 0.1) 0%, transparent 45%), var(--bg-primary)'
    }}
    className="animate-fade"
    >
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 3vw, 2rem)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Branding & Logo */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
          <img 
            src="/favicon.svg" 
            alt="DAILY TRACKER" 
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.35)'
            }}
          />
          <div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(90deg, #ffffff, var(--accent-primary), var(--accent-purple))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginTop: '0.2rem'
            }}>
              DAILY TRACKER
            </h1>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.08em' }}>
              PERSONAL LIFE & PRODUCTIVITY SYSTEM
            </span>
          </div>

          <div style={{ marginTop: '0.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isLogin ? 'Sign In' : 'Create an Account'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {isLogin 
                ? 'Enter your email and password to access your dashboard' 
                : 'Fill in your details to start your personal productivity system'}
            </p>
          </div>
        </div>

        {/* Standard Sign In / Sign Up Segmented Control */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: 'var(--bg-tertiary)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setAuthError('');
            }}
            style={{
              padding: '0.55rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: isLogin ? 'var(--bg-secondary)' : 'transparent',
              color: isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: isLogin ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setAuthError('');
            }}
            style={{
              padding: '0.55rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: !isLogin ? 'var(--bg-secondary)' : 'transparent',
              color: !isLogin ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: !isLogin ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {authError && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-red)',
            fontSize: '0.85rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{authError}</span>
          </div>
        )}

        {/* Normal Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          
          {/* Full Name (Sign Up only) */}
          {!isLogin && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
                  <User size={18} />
                </span>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                  required
                  autoComplete="name"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
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
                required
                autoComplete="email"
                autoFocus={isLogin}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 0 }}>Password</label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetError('');
                    setResetSuccess('');
                    setShowResetModal(true);
                  }}
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--accent-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    padding: 0
                  }}
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
                type={showPassword ? 'text' : 'password'}
                placeholder={isLogin ? '••••••••' : 'Minimum 6 characters'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Sign Up only) */}
          {!isLogin && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          {/* Primary Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '0.4rem',
              padding: '0.85rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <span>{loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
            {isLogin ? <ArrowRight size={18} /> : <Sparkles size={18} />}
          </button>

          {/* Bottom Switch Toggle */}
          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setAuthError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0
              }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Subtle Demo Account Quick Login Box (Sign In only) */}
        {isLogin && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(99, 102, 241, 0.05)',
            border: '1px dashed rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Demo Account:
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                demo@example.com / password123
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={handleFillDemo}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Fill Form
              </button>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={loading}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Quick Sign In
              </button>
            </div>
          </div>
        )}

        {/* Offline & Privacy Guarantee */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '0.74rem',
          color: 'var(--text-tertiary)',
          textAlign: 'center',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '0.75rem'
        }}>
          <ShieldCheck size={15} color="#10b981" />
          <span>100% Offline & Serverless — Private on your device</span>
        </div>
      </div>

      {/* Standard Forgot Password Modal */}
      {showResetModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(0.75rem, 3vw, 1.5rem)',
          zIndex: 999
        }}>
          <div className="glass-panel animate-fade" style={{
            width: '100%',
            maxWidth: '420px',
            padding: 'clamp(1.25rem, 3vw, 2rem)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Reset Password</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Update your local account password
                </p>
              </div>
              <button 
                onClick={() => setShowResetModal(false)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {resetSuccess ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1.5rem 0', textAlign: 'center' }}>
                <CheckCircle size={40} color="#10b981" />
                <span style={{ fontSize: '0.95rem', color: 'var(--accent-green)', fontWeight: 600 }}>{resetSuccess}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Returning to Sign In...</span>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {resetError && (
                  <div style={{
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--accent-red)',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <AlertCircle size={14} />
                    <span>{resetError}</span>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Account Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="input-field"
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>New Password</label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field"
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmResetPassword}
                    onChange={(e) => setConfirmResetPassword(e.target.value)}
                    className="input-field"
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    {resetLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

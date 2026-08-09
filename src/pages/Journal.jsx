import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import { Card } from '../components/Card';
import { 
  Save, 
  Search, 
  Star, 
  Calendar,
  BookOpen,
  Award,
  ChevronRight,
  TrendingUp,
  Hash
} from 'lucide-react';

export default function Journal() {
  const { refreshXp, addToast } = useApp();
  const [activeDate, setActiveDate] = useState(new Date().toLocaleDateString('sv'));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Journal Prompts form state
  const [morning, setMorning] = useState('');
  const [evening, setEvening] = useState('');
  const [wentWell, setWentWell] = useState('');
  const [couldImprove, setCouldImprove] = useState('');
  const [grateful, setGrateful] = useState('');
  const [focusTomorrow, setFocusTomorrow] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('write'); // 'write' or 'search'

  // Fetch journal entry for activeDate
  const fetchJournalEntry = async () => {
    setLoading(true);
    try {
      const results = await api.get(`/api/journal?date=${activeDate}`);
      if (results.length > 0) {
        const entry = results[0];
        setMorning(entry.morning_accomplish || '');
        setEvening(entry.evening_accomplish || '');
        setWentWell(entry.went_well || '');
        setCouldImprove(entry.could_improve || '');
        setGrateful(entry.grateful_for || '');
        setFocusTomorrow(entry.tomorrow_focus || '');
        setNotes(entry.notes || '');
        setTags(entry.tags || '');
        setIsFavorite(entry.is_favorite === 1);
      } else {
        // Reset inputs
        setMorning('');
        setEvening('');
        setWentWell('');
        setCouldImprove('');
        setGrateful('');
        setFocusTomorrow('');
        setNotes('');
        setTags('');
        setIsFavorite(false);
      }
    } catch (err) {
      console.error('Failed to load journal entry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournalEntry();
  }, [activeDate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/journal', {
        date: activeDate,
        morning_accomplish: morning,
        evening_accomplish: evening,
        went_well: wentWell,
        could_improve: couldImprove,
        grateful_for: grateful,
        tomorrow_focus: focusTomorrow,
        notes,
        tags,
        is_favorite: isFavorite
      });
      addToast('Daily reflection saved! +15 XP logged! ⭐', 'success');
      refreshXp();
      fetchJournalEntry();
    } catch (err) {
      addToast('Failed to save journal.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const data = await api.get(`/api/journal?q=${searchQuery}`);
      setSearchResults(data);
    } catch (err) {
      addToast('Search failed.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade">
      
      {/* Header section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Daily Journal</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Clear your mind, set daily targets, and review wins.</p>
        </div>

        {/* View toggles */}
        <div className="glass-panel" style={{
          padding: '0.4rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          gap: '4px'
        }}>
          <button
            onClick={() => setActiveTab('write')}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'write' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'write' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)'
            }}
          >
            Reflect
          </button>
          <button
            onClick={() => setActiveTab('search')}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'search' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'search' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)'
            }}
          >
            Search Logs
          </button>
        </div>
      </div>

      {activeTab === 'write' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '1.5rem',
          alignItems: 'flex-start'
        }}
        className="dashboard-grid"
        >
          {/* Main prompts sheet */}
          <form onSubmit={handleSave}>
            <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem 1.75rem' }}>
              
              {/* Date selection & Favorite */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Calendar size={18} style={{ color: 'var(--accent-primary)' }} />
                  <input
                    type="date"
                    value={activeDate}
                    onChange={(e) => setActiveDate(e.target.value)}
                    className="input-field"
                    style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: isFavorite ? 'var(--accent-amber)' : 'var(--text-tertiary)',
                    cursor: 'pointer'
                  }}
                >
                  <Star size={18} fill={isFavorite ? 'var(--accent-amber)' : 'transparent'} />
                  {isFavorite ? 'Starred reflection' : 'Star entry'}
                </button>
              </div>

              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="skeleton" style={{ height: '70px', borderRadius: 'var(--radius-sm)' }} />
                  <div className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-sm)' }} />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Morning Intention */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ☀️ Morning Intention
                    </h4>
                    <label style={{ fontSize: '0.8rem', marginTop: '2px' }}>What do I want to accomplish today?</label>
                    <textarea
                      placeholder="Define your single core task or target focus today..."
                      value={morning}
                      onChange={(e) => setMorning(e.target.value)}
                      className="input-field"
                      style={{ minHeight: '60px', resize: 'none', marginTop: '0.25rem' }}
                    />
                  </div>

                  {/* Evening reflections group */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      🌙 Evening Review
                    </h4>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>What did I accomplish today?</label>
                      <textarea
                        placeholder="Log your completed tasks or actions..."
                        value={evening}
                        onChange={(e) => setEvening(e.target.value)}
                        className="input-field"
                        style={{ minHeight: '50px', resize: 'none', marginTop: '0.25rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>What went well today?</label>
                        <input
                          type="text"
                          placeholder="A quick win or breakthrough"
                          value={wentWell}
                          onChange={(e) => setWentWell(e.target.value)}
                          className="input-field"
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>What am I grateful for?</label>
                        <input
                          type="text"
                          placeholder="A small thank-you details"
                          value={grateful}
                          onChange={(e) => setGrateful(e.target.value)}
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>What could I improve tomorrow?</label>
                        <input
                          type="text"
                          placeholder="A distraction or block to resolve"
                          value={couldImprove}
                          onChange={(e) => setCouldImprove(e.target.value)}
                          className="input-field"
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>What should I focus on tomorrow?</label>
                        <input
                          type="text"
                          placeholder="Tomorrow's single focus target"
                          value={focusTomorrow}
                          onChange={(e) => setFocusTomorrow(e.target.value)}
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>

                  {/* General Free Text Diary */}
                  <div className="form-group" style={{ marginBottom: 0, borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                    <label style={{ fontWeight: 600 }}>Free Reflections Diary Notes</label>
                    <textarea
                      placeholder="Write your general thoughts, draft ideas, or dump worries..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="input-field"
                      style={{ minHeight: '110px', resize: 'none', lineHeight: '1.5', marginTop: '0.25rem' }}
                    />
                  </div>

                  {/* Tags */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Hash size={12} /> Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="focus, wins, coding"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
              )}

              {/* Submit Save */}
              <button 
                type="submit" 
                disabled={saving}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem', marginTop: '1rem', display: 'flex', justify: 'center', gap: '6px' }}
              >
                <Save size={16} fill="white" />
                {saving ? 'Saving...' : 'Save Reflections'}
              </button>
            </Card>
          </form>

          {/* Side Column: Journal Tips / History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.02), rgba(168,85,247,0.02))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <BookOpen size={18} style={{ color: 'var(--accent-purple)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Benefits of Journaling</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Structuring your morning intention focuses attention on high-level goals. Wrapping up the evening with gratitude boosts dopamine, helps clear task backlogs, and reduces insomnia.
              </p>
            </Card>

            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Award size={18} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Daily Score Bonus</h3>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Completing your evening log awards you a +15 XP gamification bonus and syncs with your analytics board.
              </span>
            </Card>
          </div>
        </div>
      ) : (
        /* Search Journal Panel */
        <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search reflections, gratitude points, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                className="input-field"
                style={{ paddingLeft: '38px' }}
              />
            </div>
            <button onClick={handleSearch} className="btn btn-primary">
              Search
            </button>
          </div>

          {searchResults.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>
              Enter search query above to browse historical logs.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {searchResults.map(entry => (
                <div 
                  key={entry.id} 
                  onClick={() => {
                    setActiveDate(entry.date);
                    setActiveTab('write');
                  }}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-tertiary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    border: '1px solid var(--border-color)',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--text-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)' }}>
                      <Calendar size={12} />
                      {entry.date}
                    </span>
                    {entry.is_favorite === 1 && <Star size={14} fill="var(--accent-amber)" stroke="var(--accent-amber)" />}
                  </div>
                  {entry.notes && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      "{entry.notes.substring(0, 150)}{entry.notes.length > 150 ? '...' : ''}"
                    </p>
                  )}
                  {entry.tags && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {entry.tags.split(',').map(tag => (
                        <span key={tag} style={{ fontSize: '0.7rem', backgroundColor: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-tertiary)' }}>
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

    </div>
  );
}

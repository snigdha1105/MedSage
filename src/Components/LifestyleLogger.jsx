import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import '../styles/LifestyleLogger.css';

const LifestyleLogger = () => {
  const [formData, setFormData] = useState({
    water_intake_ml: '',
    steps: '',
    sleep_hours: '',
    exercise_minutes: '',
    meal_type: '',
    description: '',
    calories: ''
  });

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('log');

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/lifestyle/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitLifestyle = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/lifestyle/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          activity_type: formData.exercise_minutes ? 'Exercise' : 'Other',
          duration: parseInt(formData.exercise_minutes) || 0,
          intensity: 'medium',
          calories: 0,
          notes: `Steps: ${formData.steps}, Sleep: ${formData.sleep_hours}hrs, Water: ${formData.water_intake_ml}ml`
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Lifestyle data logged successfully');
        setFormData(prev => ({
          ...prev,
          water_intake_ml: '',
          steps: '',
          sleep_hours: '',
          exercise_minutes: ''
        }));
        fetchSummary();
      } else {
        toast.error(data.error || 'Failed to log lifestyle');
      }
    } catch (error) {
      toast.error('Error logging lifestyle data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMeal = async (e) => {
    e.preventDefault();
    if (!formData.meal_type || !formData.description) {
      toast.error('Please fill in meal type and description');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/lifestyle/meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          meal_type: formData.meal_type,
          description: formData.description,
          calories: parseInt(formData.calories) || 0
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Meal logged successfully');
        setFormData(prev => ({
          ...prev,
          meal_type: '',
          description: '',
          calories: ''
        }));
        fetchSummary();
      } else {
        toast.error(data.error || 'Failed to log meal');
      }
    } catch (error) {
      toast.error('Error logging meal');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lifestyle-logger">
      <h2>🏃 Lifestyle Tracker</h2>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'log' ? 'active' : ''}`}
          onClick={() => setActiveTab('log')}
        >
          📝 Log Data
        </button>
        <button
          className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          📊 Summary
        </button>
      </div>

      {activeTab === 'log' && (
        <div className="log-section">
          <div className="form-section">
            <h3>📱 Daily Activities</h3>
            <form onSubmit={handleSubmitLifestyle} className="form-grid">
              <div className="form-group">
                <label>💧 Water Intake (ml)</label>
                <div className="input-group">
                  <input
                    type="number"
                    name="water_intake_ml"
                    value={formData.water_intake_ml}
                    onChange={handleChange}
                    placeholder="250"
                    min="0"
                  />
                  <span className="unit">ml</span>
                </div>
              </div>

              <div className="form-group">
                <label>👟 Steps</label>
                <div className="input-group">
                  <input
                    type="number"
                    name="steps"
                    value={formData.steps}
                    onChange={handleChange}
                    placeholder="5000"
                    min="0"
                  />
                  <span className="unit">steps</span>
                </div>
              </div>

              <div className="form-group">
                <label>😴 Sleep (hours)</label>
                <div className="input-group">
                  <input
                    type="number"
                    name="sleep_hours"
                    value={formData.sleep_hours}
                    onChange={handleChange}
                    placeholder="8"
                    min="0"
                    step="0.5"
                  />
                  <span className="unit">hrs</span>
                </div>
              </div>

              <div className="form-group">
                <label>🏋️ Exercise (minutes)</label>
                <div className="input-group">
                  <input
                    type="number"
                    name="exercise_minutes"
                    value={formData.exercise_minutes}
                    onChange={handleChange}
                    placeholder="30"
                    min="0"
                  />
                  <span className="unit">min</span>
                </div>
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? '⏳ Logging...' : '✅ Log Activities'}
              </button>
            </form>
          </div>

          <div className="form-section">
            <h3>🍽️ Log Meal</h3>
            <form onSubmit={handleSubmitMeal} className="form-grid">
              <div className="form-group">
                <label>Meal Type</label>
                <select
                  name="meal_type"
                  value={formData.meal_type}
                  onChange={handleChange}
                >
                  <option value="">Select meal type</option>
                  <option value="breakfast">🌅 Breakfast</option>
                  <option value="lunch">🍽️ Lunch</option>
                  <option value="dinner">🍴 Dinner</option>
                  <option value="snack">🍿 Snack</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What did you eat?"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Calories</label>
                <div className="input-group">
                  <input
                    type="number"
                    name="calories"
                    value={formData.calories}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                  />
                  <span className="unit">kcal</span>
                </div>
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? '⏳ Logging...' : '✅ Log Meal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="summary-section">
          <h3>📊 Weekly Summary (Last 7 Days)</h3>
          
          {summary && summary.entries && summary.entries.length > 0 ? (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">💧</div>
                <div className="stat-content">
                  <h4>Avg Water Intake</h4>
                  <p className="stat-value">{summary.avg_water_intake?.toFixed(0)} ml</p>
                  <p className="stat-goal">Goal: 2000 ml/day</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👟</div>
                <div className="stat-content">
                  <h4>Avg Steps</h4>
                  <p className="stat-value">{summary.avg_steps?.toFixed(0)}</p>
                  <p className="stat-goal">Goal: 10000 steps/day</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">😴</div>
                <div className="stat-content">
                  <h4>Avg Sleep</h4>
                  <p className="stat-value">{summary.avg_sleep?.toFixed(1)} hrs</p>
                  <p className="stat-goal">Goal: 7-9 hours/day</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🏋️</div>
                <div className="stat-content">
                  <h4>Avg Exercise</h4>
                  <p className="stat-value">{summary.avg_exercise?.toFixed(0)} min</p>
                  <p className="stat-goal">Goal: 30 min/day</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>No lifestyle data logged yet. Start logging to see your summary!</p>
            </div>
          )}

          <div className="entries-list">
            <h4>📋 Recent Entries</h4>
            {summary && summary.entries && summary.entries.length > 0 ? (
              <div className="entries-grid">
                {summary.entries.slice().reverse().map((entry, idx) => (
                  <div key={idx} className="entry-card">
                    <p className="entry-date">{new Date(entry.date).toLocaleDateString()}</p>
                    {entry.water_intake_ml > 0 && <p>💧 Water: {entry.water_intake_ml} ml</p>}
                    {entry.steps > 0 && <p>👟 Steps: {entry.steps}</p>}
                    {entry.sleep_hours > 0 && <p>😴 Sleep: {entry.sleep_hours} hrs</p>}
                    {entry.exercise_minutes > 0 && <p>🏋️ Exercise: {entry.exercise_minutes} min</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p>No entries to display</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LifestyleLogger;

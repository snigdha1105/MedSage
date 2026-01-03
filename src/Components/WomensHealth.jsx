import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPills, FaCircle, FaExclamationTriangle, FaBook, FaHourglass, FaCheckCircle, FaFileAlt, FaInbox, FaLightbulb } from 'react-icons/fa';
import '../styles/WomensHealth.css';

const WomensHealth = () => {
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    flow: 'medium',
    notes: '',
    symptom_type: '',
    symptom_severity: 5
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('period');
  const [periods, setPeriods] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [viewTab, setViewTab] = useState('periods');

  useEffect(() => {
    fetchPeriodHistory();
    fetchSymptomHistory();
  }, []);

  const fetchPeriodHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/womens-health/periods', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setPeriods(data.periods || []);
      }
    } catch (error) {
      console.error('Error fetching periods:', error);
    }
  };

  const fetchSymptomHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/womens-health/symptoms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSymptoms(data.symptoms || []);
      }
    } catch (error) {
      console.error('Error fetching symptoms:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogPeriod = async (e) => {
    e.preventDefault();

    if (!formData.start_date) {
      toast.error('Please select start date');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/womens-health/period', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          start_date: formData.start_date,
          end_date: formData.end_date,
          flow: formData.flow,
          notes: formData.notes
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Period logged successfully');
        setFormData(prev => ({
          ...prev,
          start_date: '',
          end_date: '',
          flow: 'medium',
          notes: ''
        }));
        fetchPeriodHistory();
        setActiveTab('history');
      } else {
        toast.error(data.error || 'Failed to log period');
      }
    } catch (error) {
      toast.error('Error logging period');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogSymptom = async (e) => {
    e.preventDefault();

    if (!formData.symptom_type) {
      toast.error('Please select symptom type');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/womens-health/symptom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          symptom_type: formData.symptom_type,
          severity: parseInt(formData.symptom_severity),
          notes: formData.notes,
          date: new Date().toISOString()
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Symptom logged successfully');
        setFormData(prev => ({
          ...prev,
          symptom_type: '',
          symptom_severity: 5,
          notes: ''
        }));
        fetchSymptomHistory();
        setActiveTab('history');
      } else {
        toast.error(data.error || 'Failed to log symptom');
      }
    } catch (error) {
      toast.error('Error logging symptom');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="womens-health">
      <h2><FaPills /> Women's Health Tracker</h2>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'period' ? 'active' : ''}`}
          onClick={() => setActiveTab('period')}
        >
          <FaCircle /> Log Period
        </button>
        <button
          className={`tab-btn ${activeTab === 'symptoms' ? 'active' : ''}`}
          onClick={() => setActiveTab('symptoms')}
        >
          <FaExclamationTriangle /> Log Symptoms
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('history');
            setViewTab('periods');
          }}
        >
          <FaBook /> History ({periods.length + symptoms.length})
        </button>
      </div>

      {activeTab === 'period' && (
        <div className="form-section">
          <h3><FaCircle /> Log Menstrual Period</h3>
          <form onSubmit={handleLogPeriod} className="form-grid">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Flow Intensity</label>
              <select
                name="flow"
                value={formData.flow}
                onChange={handleChange}
              >
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes"
                rows="3"
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? <><FaHourglass /> Logging...</> : <><FaCheckCircle /> Log Period</>}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'symptoms' && (
        <div className="form-section">
          <h3><FaExclamationTriangle /> Log Symptoms</h3>
          <form onSubmit={handleLogSymptom} className="form-grid">
            <div className="form-group">
              <label>Symptom Type *</label>
              <select
                name="symptom_type"
                value={formData.symptom_type}
                onChange={handleChange}
                required
              >
                <option value="">Select symptom</option>
                <option value="cramps">Cramps</option>
                <option value="headache">Headache</option>
                <option value="mood_swings">Mood Swings</option>
                <option value="fatigue">Fatigue</option>
                <option value="bloating">Bloating</option>
                <option value="nausea">Nausea</option>
                <option value="back_pain">Back Pain</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Severity (1-10)</label>
              <div className="severity-container">
                <input
                  type="range"
                  name="symptom_severity"
                  min="1"
                  max="10"
                  value={formData.symptom_severity}
                  onChange={handleChange}
                  className="range-slider"
                />
                <span className="severity-display">{formData.symptom_severity}/10</span>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Describe your symptoms"
                rows="3"
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? <><FaHourglass /> Logging...</> : <><FaCheckCircle /> Log Symptom</>}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="history-section">
          <h3><FaBook /> Your Health History</h3>
          
          <div className="history-tabs">
            <button
              className={`history-tab-btn ${viewTab === 'periods' ? 'active' : ''}`}
              onClick={() => setViewTab('periods')}
            >
              <FaCircle /> Periods ({periods.length})
            </button>
            <button
              className={`history-tab-btn ${viewTab === 'symptoms' ? 'active' : ''}`}
              onClick={() => setViewTab('symptoms')}
            >
              <FaExclamationTriangle /> Symptoms ({symptoms.length})
            </button>
          </div>

          {viewTab === 'periods' && (
            <div className="data-display">
              {periods.length === 0 ? (
                <div className="empty-state">
                  <p><FaInbox /> No period logs yet</p>
                </div>
              ) : (
                <div className="records-grid">
                  {periods.map((period, idx) => (
                    <div key={idx} className="record-card period-card">
                      <div className="record-header">
                        <h4><FaCircle /> Period Log</h4>
                        <span className="record-date">{new Date(period.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="record-content">
                        <p><strong>Start:</strong> {new Date(period.start_date).toLocaleDateString()}</p>
                        {period.end_date && <p><strong>End:</strong> {new Date(period.end_date).toLocaleDateString()}</p>}
                        <p><strong>Flow:</strong> {period.flow.charAt(0).toUpperCase() + period.flow.slice(1)}</p>
                        {period.notes && (
                          <div className="record-notes">
                            <strong><FaFileAlt /> Notes:</strong> {period.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {viewTab === 'symptoms' && (
            <div className="data-display">
              {symptoms.length === 0 ? (
                <div className="empty-state">
                  <p><FaInbox /> No symptom logs yet</p>
                </div>
              ) : (
                <div className="records-grid">
                  {symptoms.map((symptom, idx) => (
                    <div key={idx} className="record-card symptom-card">
                      <div className="record-header">
                        <h4><FaExclamationTriangle /> {symptom.symptom_type.toUpperCase().replace('_', ' ')}</h4>
                        <span className="severity-badge">Severity: {symptom.severity}/10</span>
                      </div>
                      <div className="record-content">
                        <p><strong>Date:</strong> {new Date(symptom.date).toLocaleDateString()}</p>
                        <p><strong>Severity:</strong> {symptom.severity}/10</p>
                        <div className="severity-bar">
                          <div className="severity-fill" style={{ width: `${symptom.severity * 10}%` }}></div>
                        </div>
                        {symptom.notes && (
                          <div className="record-notes">
                            <strong><FaFileAlt /> Notes:</strong> {symptom.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="info-section">
        <h3><FaLightbulb /> Tips for Tracking</h3>
        <ul>
          <li>Log your period start and end dates for better predictions</li>
          <li>Track symptoms to identify patterns</li>
          <li>Note any unusual changes for your doctor</li>
          <li>Use this data to plan activities and appointments</li>
        </ul>
      </div>
    </div>
  );
};

export default WomensHealth;

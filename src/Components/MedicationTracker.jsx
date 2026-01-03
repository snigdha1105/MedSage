import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPills, FaPlus, FaList, FaSun, FaCheckCircle, FaHourglass, FaCalendar, FaInbox, FaFileAlt } from 'react-icons/fa';
import '../styles/MedicationTracker.css';

const MedicationTracker = () => {
  const [medications, setMedications] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    start_date: '',
    end_date: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('add');

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/medication/active', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMedications(data.medications);
      }
    } catch (error) {
      console.error('Error fetching medications:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.dosage || !formData.frequency) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/medication/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Medication added successfully');
        setMedications([...medications, data.medication]);
        setFormData({
          name: '',
          dosage: '',
          frequency: '',
          start_date: '',
          end_date: '',
          notes: ''
        });
        setActiveTab('view');
      } else {
        toast.error(data.error || 'Failed to add medication');
      }
    } catch (error) {
      toast.error('Error adding medication');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogDose = async (medicationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/medication/log-dose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          medication_id: medicationId,
          date: new Date().toISOString(),
          taken: true
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Dose logged successfully!');
      } else {
        toast.error(data.error || 'Failed to log dose');
      }
    } catch (error) {
      toast.error('Error logging dose');
      console.error(error);
    }
  };

  return (
    <div className="medication-tracker">
      <h2><FaPills /> Medication Manager</h2>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          <FaPlus /> Add Medication
        </button>
        <button
          className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('view');
            fetchMedications();
          }}
        >
          <FaList /> My Medications ({medications.length})
        </button>
      </div>

      {activeTab === 'add' && (
        <div className="form-section">
          <h3>Add New Medication</h3>
          <form onSubmit={handleAddMedication} className="form-grid">
            <div className="form-group">
              <label>Medication Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Aspirin, Metformin"
                required
              />
            </div>

            <div className="form-group">
              <label>Dosage *</label>
              <input
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                placeholder="e.g., 500mg, 1 tablet"
                required
              />
            </div>

            <div className="form-group">
              <label>Frequency *</label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                required
              >
                <option value="">Select frequency</option>
                <option value="once_daily">Once Daily</option>
                <option value="twice_daily">Twice Daily</option>
                <option value="three_times_daily">Three Times Daily</option>
                <option value="as_needed">As Needed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
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

            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Take with food, avoid dairy, etc."
                rows="3"
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn full-width">
              {loading ? <><FaHourglass /> Adding...</> : <><FaCheckCircle /> Add Medication</>}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'view' && (
        <div className="medications-list">
          <h3>Active Medications</h3>
          {medications.length === 0 ? (
            <div className="empty-state">
              <p><FaInbox /> No medications added yet</p>
              <small>Start by adding your first medication</small>
            </div>
          ) : (
            <div className="meds-grid">
              {medications.map(med => (
                <div key={med.id} className="med-card">
                  <div className="med-header">
                    <h4>{med.name}</h4>
                    <span className="dosage-badge">{med.dosage}</span>
                  </div>
                  
                  <div className="med-info">
                    <p><strong><FaSun /> Frequency:</strong> {med.frequency.replace('_', ' ').toUpperCase()}</p>
                    {med.start_date && <p><strong><FaCalendar /> Start:</strong> {new Date(med.start_date).toLocaleDateString()}</p>}
                    {med.end_date && <p><strong><FaCheckCircle /> End:</strong> {new Date(med.end_date).toLocaleDateString()}</p>}
                    {med.notes && <p><strong><FaFileAlt /> Notes:</strong> {med.notes}</p>}
                  </div>

                  <div className="med-footer">
                    <p className="doses-count">
                      <FaCheckCircle /> {med.doses_logged?.length || 0} doses logged
                    </p>
                    <button 
                      onClick={() => handleLogDose(med.id)}
                      className="log-dose-btn"
                    >
                      Log Dose Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicationTracker;

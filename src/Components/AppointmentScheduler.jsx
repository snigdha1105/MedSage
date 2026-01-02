import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import '../styles/AppointmentScheduler.css';

const AppointmentScheduler = () => {
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    doctor: '',
    purpose: '',
    location: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointment/upcoming', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleAppointment = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.time || !formData.doctor || !formData.purpose) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointment/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Appointment scheduled successfully!');
        setAppointments([...appointments, data.appointment]);
        setFormData({
          date: '',
          time: '',
          doctor: '',
          purpose: '',
          location: '',
          notes: ''
        });
        setActiveTab('view');
      } else {
        toast.error(data.error || 'Failed to schedule appointment');
      }
    } catch (error) {
      toast.error('Error scheduling appointment');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointments.filter(apt => new Date(apt.date) >= today).length;
  };

  return (
    <div className="appointment-scheduler">
      <h2>📅 Appointment Scheduler</h2>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          ➕ Schedule Appointment
        </button>
        <button
          className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('view');
            fetchAppointments();
          }}
        >
          📋 My Appointments ({getUpcomingCount()})
        </button>
      </div>

      {activeTab === 'schedule' && (
        <div className="form-section">
          <h3>Schedule New Appointment</h3>
          <form onSubmit={handleScheduleAppointment} className="form-grid">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Time *</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Doctor Name *</label>
              <input
                type="text"
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                placeholder="e.g., Dr. John Smith"
                required
              />
            </div>

            <div className="form-group">
              <label>Purpose of Visit *</label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                required
              >
                <option value="">Select purpose</option>
                <option value="Checkup">🩺 Checkup</option>
                <option value="Follow-up">🔄 Follow-up</option>
                <option value="Consultation">💬 Consultation</option>
                <option value="Test">🧪 Test/Lab Work</option>
                <option value="Surgery">🏥 Surgery</option>
                <option value="Vaccination">💉 Vaccination</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., City Hospital, Room 101"
              />
            </div>

            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional information..."
                rows="3"
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn full-width">
              {loading ? '⏳ Scheduling...' : '✅ Schedule Appointment'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'view' && (
        <div className="appointments-list">
          <h3>📋 Your Appointments</h3>
          
          {appointments.length === 0 ? (
            <div className="empty-state">
              <p>📭 No appointments scheduled</p>
              <small>Schedule your first appointment now</small>
            </div>
          ) : (
            <div className="appts-grid">
              {appointments
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(apt => (
                  <div key={apt.id} className="appt-card">
                    <div className="appt-header">
                      <h4>{apt.doctor}</h4>
                      <span className={`status-badge ${apt.status}`}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </div>

                    <div className="appt-info">
                      <p><strong>📅 Date:</strong> {new Date(apt.date).toLocaleDateString()}</p>
                      <p><strong>⏰ Time:</strong> {apt.time}</p>
                      <p><strong>🎯 Purpose:</strong> {apt.purpose}</p>
                      {apt.location && <p><strong>📍 Location:</strong> {apt.location}</p>}
                      {apt.notes && <p><strong>📝 Notes:</strong> {apt.notes}</p>}
                    </div>

                    <div className="appt-footer">
                      <span className="days-away">
                        {Math.max(0, Math.ceil((new Date(apt.date) - new Date()) / (1000 * 60 * 60 * 24)))} days away
                      </span>
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

export default AppointmentScheduler;

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import '../styles/MedicalReports.css';

const MedicalReports = () => {
  const [reports, setReports] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    report_type: '',
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/report/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setReports(data.reports);
      } else {
        toast.error('Failed to load reports');
      }
    } catch (error) {
      toast.error('Error loading reports');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setFileError('');
      return;
    }

    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'bmp', 'tiff', 'docx', 'doc'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedExtensions.includes(fileExtension)) {
      setFileError('Invalid file type. Allowed: PDF, JPG, PNG, BMP, TIFF, DOCX');
      setSelectedFile(null);
      return;
    }

    if (file.size > maxSize) {
      setFileError('File size exceeds 10MB limit');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setFileError('');
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.report_type) {
      toast.error('Please fill in report name and type');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Create FormData for file upload
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('name', formData.name);
      uploadFormData.append('report_type', formData.report_type);
      uploadFormData.append('notes', formData.notes);

      const response = await fetch('http://localhost:5000/api/report/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Report uploaded successfully');
        setReports([...reports, data.report]);
        setFormData({
          name: '',
          report_type: '',
          notes: ''
        });
        setSelectedFile(null);
        setActiveTab('view');
      } else {
        toast.error(data.error || 'Failed to upload report');
      }
    } catch (error) {
      toast.error('Error uploading report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchReports = async () => {
    await fetchReports();
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/report/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Report deleted successfully');
        setReports(reports.filter(r => r.id !== reportId));
      } else {
        toast.error('Failed to delete report');
      }
    } catch (error) {
      toast.error('Error deleting report');
      console.error(error);
    }
  };

  return (
    <div className="medical-reports">
      <h2>📋 Smart Health Records</h2>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          ⬆️ Upload Report
        </button>
        <button
          className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('view');
            handleFetchReports();
          }}
        >
          📁 My Reports ({reports.length})
        </button>
      </div>

      {activeTab === 'upload' && (
        <div className="form-section">
          <h3>📄 Upload Medical Report</h3>
          <form onSubmit={handleUploadReport} className="form-grid">
            <div className="form-group">
              <label>Report Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Blood Test Results"
                required
              />
            </div>

            <div className="form-group">
              <label>Report Type *</label>
              <select
                name="report_type"
                value={formData.report_type}
                onChange={handleChange}
                required
              >
                <option value="">Select report type</option>
                <option value="blood_test">🩸 Blood Test</option>
                <option value="x_ray">🖼️ X-Ray</option>
                <option value="ultrasound">🔊 Ultrasound</option>
                <option value="ct_scan">🔬 CT Scan</option>
                <option value="mri">🧲 MRI</option>
                <option value="prescription">💊 Prescription</option>
                <option value="other">📄 Other</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Upload File * (PDF, Image, or DOCX)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.bmp,.tiff,.docx,.doc"
                onChange={handleFileSelect}
                className="file-input"
                required
              />
              {selectedFile && (
                <p className="file-info">
                  ✓ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              {fileError && <p className="error-text">{fileError}</p>}
            </div>

            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes about this report"
                rows="3"
              />
            </div>

            <button type="submit" disabled={loading || !selectedFile} className="submit-btn">
              {loading ? '⏳ Uploading...' : '✅ Upload Report'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'view' && (
        <div className="reports-list">
          <h3>📁 My Medical Reports</h3>

          {reports.length === 0 ? (
            <div className="empty-state">
              <p>No reports uploaded yet. Start uploading your medical reports!</p>
            </div>
          ) : (
            <div className="reports-grid">
              {reports.map(report => (
                <div key={report.id} className="report-card">
                  <div className="report-header">
                    <h4>{report.name}</h4>
                    <span className="report-badge">{report.report_type}</span>
                  </div>
                  <div className="report-meta">
                    <p><strong>Type:</strong> {report.report_type}</p>
                    <p><strong>Uploaded:</strong> {new Date(report.uploaded_at).toLocaleDateString()}</p>
                  </div>
                  {report.file_name && (
                    <div className="report-file">
                      <p><strong>📎 File:</strong> {report.file_name}</p>
                    </div>
                  )}
                  {report.notes && (
                    <div className="report-notes">
                      <strong>Notes:</strong> {report.notes}
                    </div>
                  )}
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="delete-btn"
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicalReports;

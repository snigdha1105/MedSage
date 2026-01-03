import React, { useState, useEffect } from 'react';
import { FaHeartbeat, FaTint, FaWeight, FaDna, FaWalking, FaChartLine, FaAppleAlt } from 'react-icons/fa';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    // Get user full name from localStorage
    const fullName = localStorage.getItem('full_name');
    if (fullName) {
      setUserName(fullName);
    }
  }, []);
  const healthMetrics = [
    {
      icon: <FaHeartbeat className="metric-icon-component" />,
      label: 'Blood Pressure',
      value: '120/80',
      status: 'normal',
      color: '#10b981'
    },
    {
      icon: <FaTint className="metric-icon-component" />,
      label: 'Blood Sugar',
      value: '95 mg/dL',
      status: 'normal',
      color: '#10b981'
    },
    {
      icon: <FaWeight className="metric-icon-component" />,
      label: 'BMI',
      value: '22.5',
      status: 'normal',
      color: '#10b981'
    },
    {
      icon: <FaDna className="metric-icon-component" />,
      label: 'Cholesterol',
      value: '180 mg/dL',
      status: 'good',
      color: '#10b981'
    }
  ];

  const progressItems = [
    {
      icon: <FaTint className="progress-icon-component" />,
      label: 'glasses',
      current: 7,
      goal: 8,
      percentage: 88
    },
    {
      icon: <FaWalking className="progress-icon-component" />,
      label: 'steps',
      current: 12500,
      goal: 10000,
      percentage: 100
    }
  ];

  const insights = [
    {
      icon: <FaAppleAlt />,
      title: 'Increase Omega-3 Intake',
      severity: 'high',
      description: 'Based on your recent blood work, consider adding more fish or supplements.',
      action: 'Add 2 servings of fish this week'
    },
    {
      icon: <FaWalking />,
      title: 'Morning Cardio Routine',
      severity: 'medium',
      description: 'Your heart health metrics look good. Keep up the regular exercise routine.',
      action: 'Continue current routine'
    }
  ];

  return (
    <div className="dashboard-content">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Welcome back, {userName}!</h1>
        <p>Here's your health overview for today</p>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Health Score Card */}
        <div className="health-card health-score-card">
          <div className="card-header">
            <h2>Health Score</h2>
            <span className="trend-badge"><FaChartLine /> +5</span>
          </div>
          <div className="health-score-circle">
            <svg viewBox="0 0 200 200" className="progress-ring">
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="#10b981"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(87 / 100) * 2 * Math.PI * 90} ${2 * Math.PI * 90}`}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }}
              />
            </svg>
            <div className="score-text">
              <div className="score-number">87%</div>
            </div>
          </div>
          <div className="score-details">
            <div className="detail-row">
              <span>Physical Health</span>
              <span className="detail-value">92%</span>
            </div>
            <div className="detail-row">
              <span>Mental Wellness</span>
              <span className="detail-value">85%</span>
            </div>
            <div className="detail-row">
              <span>Lifestyle</span>
              <span className="detail-value">78%</span>
            </div>
          </div>
        </div>

        {/* Latest Health Report */}
        <div className="health-card latest-report-card">
          <h2>Latest Health Report</h2>
          <div className="metrics-grid">
            {healthMetrics.map((metric, index) => (
              <div key={index} className="metric-item">
                <div className="metric-icon">{metric.icon}</div>
                <div className="metric-value">{metric.value}</div>
                <div className="metric-label">{metric.label}</div>
                <div className="metric-status" style={{ color: metric.color }}>
                  {metric.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="dashboard-grid">
        <div className="health-card progress-card">
          <h2>Today's Progress</h2>
          <div className="progress-items">
            {progressItems.map((item, index) => (
              <div key={index} className="progress-item">
                <div className="progress-icon">{item.icon}</div>
                <div className="progress-info">
                  <div className="progress-count">
                    {item.current} <span className="progress-unit">{item.label}</span>
                  </div>
                  <div className="progress-goal">Goal: {item.goal} {item.label}</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(item.percentage, 100)}%` }}></div>
                  </div>
                </div>
                <div className="progress-percentage">{item.percentage}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Health Insights */}
        <div className="health-card insights-card">
          <div className="insights-header">
            <h2>AI Health Insights</h2>
            <span className="insight-updated">Updated 2h ago</span>
          </div>
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className="insight-item">
                <div className="insight-icon">{insight.icon}</div>
                <div className="insight-content">
                  <h3>{insight.title}</h3>
                  <span className={`severity-badge severity-${insight.severity}`}>
                    {insight.severity}
                  </span>
                  <p>{insight.description}</p>
                  <button type="button" className="insight-action" style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}>
                    {insight.action} →
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="pagination">10 of 11</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

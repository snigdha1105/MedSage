import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartBar, FaClipboard, FaHeartbeat, FaDumbbell, FaBell, FaBook, FaRobot, FaSignOutAlt } from 'react-icons/fa';
import { MdAssignmentInd } from 'react-icons/md';
import '../styles/Sidebar.css';

const Sidebar = ({ onSelectSection, activeSection }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');
  const [userInitials, setUserInitials] = useState('U');

  useEffect(() => {
    // Get user data from localStorage
    const fullName = localStorage.getItem('full_name');
    if (fullName) {
      setUserName(fullName);
      // Get initials from full name
      const initials = fullName
        .split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2);
      setUserInitials(initials);
    }
  }, []);

  const menuItems = [
    { icon: <FaChartBar />, label: 'Dashboard', id: 'dashboard' },
    { icon: <FaClipboard />, label: 'Smart Health Records', id: 'records' },
    { icon: <FaHeartbeat />, label: 'Personalized Care', id: 'care' },
    { icon: <FaDumbbell />, label: 'Body Hacking & Fitness', id: 'fitness' },
    { icon: <MdAssignmentInd />, label: "Women's Health", id: 'womens' },
    { icon: <FaBell />, label: 'Reminders & Alerts', id: 'reminders' },
    { icon: <FaBook />, label: 'Learning & Community', id: 'learning' },
    { icon: <FaRobot />, label: 'AI Doctor Assistant', id: 'ai-assistant' },
  ];

  const handleLogout = () => {
    // Clear authentication data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('full_name');
    localStorage.removeItem('email');
    // Redirect to login page
    navigate('/', { replace: true });
  };

  const handleMenuClick = (id) => {
    if (onSelectSection) {
      onSelectSection(id);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <img src="/logo.svg" alt="MedSage" className="logo-icon-img" />
          <span className="logo-text">MedSage</span>
        </div>
      </div>

      <div className="user-profile">
        <div className="user-avatar">{userInitials}</div>
        <div className="user-info">
          <h3>{userName}</h3>
          <p>20 years • India</p>
        </div>
      </div>

      <div className="health-score">
        <p className="score-label">Health Score</p>
        <div className="score-value">87%</div>
        <div className="score-bar">
          <div className="score-fill" style={{ width: '87%' }}></div>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => handleMenuClick(item.id)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </button>
        ))}
        
        <button
          onClick={handleLogout}
          className="menu-item logout-item"
          style={{ marginTop: 'auto' }}
        >
          <span className="menu-icon"><FaSignOutAlt /></span>
          <span className="menu-label">Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;

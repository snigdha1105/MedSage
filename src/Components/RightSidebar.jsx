import React from 'react';
import { FaSearch, FaStar, FaClock, FaRobot } from 'react-icons/fa';
import '../styles/RightSidebar.css';

const RightSidebar = ({ onQuestionClick }) => {
  const quickQuestions = [
    "I've been having headaches lately. What could be causing them?",
    "What foods should I eat to improve my energy levels?",
    "How can I improve my sleep quality?",
    "What exercises are best for lower back pain?",
  ];

  const aiCapabilities = [
    {
      icon: <FaSearch />,
      title: 'Symptom Analysis',
      description: 'Describe symptoms for insights',
    },
    {
      icon: <FaStar />,
      title: 'Personalized Advice',
      description: 'Tailored to your health data',
    },
    {
      icon: <FaClock />,
      title: '24/7 Availability',
      description: 'Always here when you need help',
    },
  ];

  const handleQuestionClick = (question) => {
    if (onQuestionClick) {
      onQuestionClick(question);
    }
  };

  return (
    <aside className="right-sidebar">
      {/* Quick Questions */}
      <div className="quick-questions">
        <h2 className="section-title">
          <FaStar />
          Quick Questions
        </h2>
        <ul className="questions-list">
          {quickQuestions.map((question, index) => (
            <li key={index}>
              <button
                className="question-item"
                onClick={() => handleQuestionClick(question)}
              >
                {question}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* AI Capabilities */}
      <div className="ai-capabilities">
        <h2 className="section-title"><FaRobot /> AI Capabilities</h2>
        <div className="capabilities-grid">
          {aiCapabilities.map((capability, index) => (
            <div key={index} className="capability-card">
              <div className="capability-header">
                <span className="capability-icon">{capability.icon}</span>
                <h3 className="capability-title">{capability.title}</h3>
              </div>
              <p className="capability-description">{capability.description}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;

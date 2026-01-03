import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import '../styles/ChatArea.css';

const ChatArea = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: "Hello! I'm your AI Health Assistant. I can help you with health questions, symptom analysis, and wellness advice. What would you like to know today?",
      time: '11:33',
      avatar: <img src="/logo.png" alt="MedSage Logo" className="logo-avatar" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />,
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: 'user',
        text: inputValue,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setInputValue('');

      // Simulate AI response
      setTimeout(() => {
        const aiResponses = [
          "That's a great question! Let me help you with that.",
          "Based on your symptoms, I recommend consulting with a healthcare professional.",
          "Here are some wellness tips for your health concern...",
          "I understand your concern. Let me provide some personalized advice.",
        ];
        const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
        setMessages((prev) => [...prev, {
          id: prev.length + 1,
          type: 'ai',
          text: randomResponse,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          avatar: <img src="/logo.png" alt="MedSage Logo" className="logo-avatar" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />,
        }]);
      }, 1000);
    }
  };

  return (
    <div className="chat-area">
      {/* Chat Header */}
      <div className="chat-header">
        <div>
          <h1 className="header-title">AI Health Assistant</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
            Get instant, personalized health guidance powered by AI
          </p>
        </div>
        <div className="status-badge">
          <span className="status-dot"></span>
          <span>Online</span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            {message.type === 'ai' && (
              <div className="message-avatar">{message.avatar}</div>
            )}
            <div>
              <div className="message-content">
                <p style={{ margin: 0 }}>{message.text}</p>
              </div>
              <div className="message-time">{message.time}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <div className="chat-input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about symptoms, health tips, or wellness advice..."
            className="chat-input"
          />
          <button
            onClick={handleSendMessage}
            className="send-btn"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;

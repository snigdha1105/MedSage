import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AIDoctorAssistant = () => {
  const [conversations, setConversations] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConversationHistory();
  }, []);

  const fetchConversationHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ai/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ai/consult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question: question
        })
      });

      const data = await response.json();
      if (data.success) {
        setConversations([...conversations, {
          id: data.conversation_id,
          query: question,
          response: data.response,
          timestamp: new Date().toISOString()
        }]);
        setQuestion('');
        toast.success('Response received');
      } else {
        toast.error(data.error || 'Failed to get response');
      }
    } catch (error) {
      toast.error('Error asking question');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-doctor-assistant">
      <h2>AI Doctor Assistant</h2>

      <div className="chat-container">
        <div className="conversation-history">
          <h3>Conversation History</h3>
          {conversations.length === 0 ? (
            <p>No conversations yet. Ask a health question to get started!</p>
          ) : (
            <div className="conversations-list">
              {conversations.map(conv => (
                <div key={conv.id} className="conversation-item">
                  <div className="question">
                    <strong>Q:</strong> {conv.query}
                  </div>
                  <div className="response">
                    <strong>A:</strong> {conv.response}
                  </div>
                  <small>{new Date(conv.timestamp).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Ask a Health Question</h3>
          <form onSubmit={handleAskQuestion}>
            <div className="form-group">
              <label>Your Question</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask any health-related question..."
                rows="4"
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Getting response...' : 'Ask Question'}
            </button>
          </form>

          <div className="info-box">
            <h4>Important Disclaimer</h4>
            <p>
              This AI assistant provides general health information only. 
              It should not be used as a substitute for professional medical advice, 
              diagnosis, or treatment. Always consult with a qualified healthcare provider 
              for medical concerns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDoctorAssistant;

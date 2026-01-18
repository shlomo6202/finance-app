import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterScreen = () => {
  const navigate = useNavigate();
  // הוספנו את username ל-state
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // אנחנו שולחים את המבנה בדיוק כמו שה-Java וה-SQL מצפים לו
      await axios.post('http://localhost:8080/api/auth/register', formData);
      alert("נרשמת בהצלחה! מועבר להתחברות...");
      navigate('/login');
    } catch (err) {
      alert("שגיאה בהרשמה: " + (err.response?.data || "נסה שוב"));
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col justify-center px-6 max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-900 mb-2">הרשמה</h2>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <input 
            placeholder="שם משתמש (username)" 
            className="w-full p-4 rounded-2xl border border-gray-200"
            onChange={e => setFormData({...formData, username: e.target.value})}
            required
        />
        <input 
            type="email" placeholder="אימייל" 
            className="w-full p-4 rounded-2xl border border-gray-200"
            onChange={e => setFormData({...formData, email: e.target.value})}
            required
        />
        <input 
            type="password" placeholder="סיסמה" 
            className="w-full p-4 rounded-2xl border border-gray-200"
            onChange={e => setFormData({...formData, password: e.target.value})}
            required
        />
        <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold">
            סיימתי, תרשום אותי!
        </button>
      </form>
      
      <button onClick={() => navigate('/login')} className="mt-4 w-full text-center text-gray-500 text-sm">
          כבר רשום? התחבר כאן
      </button>
    </div>
  );
};

export default RegisterScreen;
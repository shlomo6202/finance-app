import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Wallet, Mail, Lock, ArrowRight } from 'lucide-react';

const LoginScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // שולח אימייל וסיסמה לבדיקה ב-SQL
      const res = await axios.post('http://localhost:8080/api/auth/login', { email, password });
      
      // אם הכל תקין - שומר את פרטי המשתמש
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/dashboard');
      
    } catch (err) {
      // הצגת הודעה במקרה שהמשתמש לא קיים או סיסמה שגויה
      if (err.response && err.response.status === 401) {
        alert("פרטי ההתחברות שגויים. אם אין לך משתמש, אנא הירשם.");
      } else {
        alert("שגיאת מערכת, נסה שוב מאוחר יותר.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col justify-center px-6 max-w-sm mx-auto">
      {/* לוגו ואייקונים */}
      <div className="flex justify-center mb-10">
        <div className="w-20 h-20 rounded-3xl bg-gray-900 flex items-center justify-center rotate-3 shadow-xl">
          <Wallet size={40} className="text-white" />
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-900 mb-2">ברוכים הבאים</h2>
        <p className="text-gray-500">התחבר כדי לראות את הנתונים שלך</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="relative">
             <input
            type="email"
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-2xl border-0 py-4 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-primary outline-none bg-white"
            required
          />
        </div>

        <div className="relative">
          <input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-2xl border-0 py-4 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-primary outline-none bg-white"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 rounded-2xl bg-gray-900 py-4 text-white font-bold text-lg shadow-lg hover:scale-[1.02] transition-all"
        >
          התחבר
          <ArrowRight size={20} />
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-400">
        אין לך עדיין חשבון? <span onClick={() => navigate('/register')} className="text-primary font-bold cursor-pointer hover:underline">הירשם כאן</span>
      </p>
    </div>
  );
};

export default LoginScreen;
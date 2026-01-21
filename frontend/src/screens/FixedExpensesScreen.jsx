import React, { useEffect, useState } from 'react';
import { ArrowRight, Calendar, CreditCard, Trash2, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosClient'; // וודא שזה קיים מהשלבים הקודמים

const FixedExpensesScreen = () => {
  const navigate = useNavigate();
  
  // State לנתונים
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State לטופס הוספה
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ description: '', amount: '', dayOfMonth: '' });

  // --- טעינת נתונים מהשרת ---
  const fetchExpenses = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
      const res = await apiClient.get(`/fixed-expenses/user/${user.id}`);
      setExpenses(res.data);
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // --- הוספת הוראת קבע ---
  const handleAdd = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    
    try {
      await apiClient.post('/fixed-expenses/add', {
        userId: user.id,
        description: formData.description,
        amount: parseFloat(formData.amount),
        dayOfMonth: parseInt(formData.dayOfMonth)
      });
      
      setShowModal(false);
      setFormData({ description: '', amount: '', dayOfMonth: '' });
      fetchExpenses(); // רענון הרשימה
    } catch (err) {
      alert("שגיאה בהוספת הוראת קבע");
      console.error(err);
    }
  };

  // --- מחיקה ---
  const handleDelete = async (id) => {
    if (!window.confirm("למחוק הוראת קבע זו?")) return;
    try {
      await apiClient.delete(`/fixed-expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md px-5 py-4 flex items-center gap-4 shadow-sm border-b border-gray-100 dark:bg-gray-800/90 dark:border-gray-700 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowRight size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">הוראות קבע</h1>
      </header>

      <main className="p-5 space-y-4">
        {/* כפתור הוספה */}
        <button 
          onClick={() => setShowModal(true)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Plus size={20} />
          הוסף הוראת קבע חדשה
        </button>

        {/* רשימה */}
        <div className="space-y-3">
          {loading ? (
            <p className="text-center text-gray-400 mt-10">טוען נתונים...</p>
          ) : expenses.length === 0 ? (
            <p className="text-center text-gray-400 mt-10">אין הוראות קבע עדיין</p>
          ) : (
            expenses.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center dark:bg-purple-900/30 dark:text-purple-400">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{item.description}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 dark:text-gray-400">
                      <CreditCard size={12} /> יורד ב-{item.dayOfMonth} לחודש
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <span className="block font-bold text-gray-900 dark:text-white">₪{item.amount}</span>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="text-xs text-red-500 mt-1 hover:underline flex items-center gap-1 justify-end"
                  >
                    מחק <Trash2 size={10} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal - חלונית הוספה */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold dark:text-white">הוספת הוראה חדשה</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">תיאור (למשל: נטפליקס)</label>
                <input 
                  required
                  className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm outline-none dark:bg-gray-700 dark:text-white"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 mb-1 block">סכום</label>
                    <input 
                      required
                      type="number"
                      className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm outline-none dark:bg-gray-700 dark:text-white"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                    />
                </div>
                <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 mb-1 block">יום בחודש (1-31)</label>
                    <input 
                      required
                      type="number" min="1" max="31"
                      className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm outline-none dark:bg-gray-700 dark:text-white"
                      value={formData.dayOfMonth}
                      onChange={e => setFormData({...formData, dayOfMonth: e.target.value})}
                    />
                </div>
              </div>

              <button type="submit" className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold shadow-lg shadow-purple-500/30 mt-2">
                שמור
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixedExpensesScreen;
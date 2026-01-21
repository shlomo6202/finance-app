import React, { useEffect, useState } from 'react';
import { ArrowRight, Calendar, CreditCard, Trash2, Plus, X, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosClient';

const FixedExpensesScreen = () => {
  const navigate = useNavigate();
  
  // State לנתונים
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]); // רשימת קטגוריות
  const [loading, setLoading] = useState(true);
  
  // State לטופס הוספה
  const [showModal, setShowModal] = useState(false);
  const [isNewCategoryMode, setIsNewCategoryMode] = useState(false); // מצב יצירת קטגוריה חדשה

  // נתוני הטופס - הורחבו לכלול קטגוריה
  const [formData, setFormData] = useState({ 
      description: '', 
      amount: '', 
      dayOfMonth: '',
      categoryId: '',       // לקטגוריה קיימת
      newCategoryName: '',  // לקטגוריה חדשה
      newCategoryColor: '#3B82F6' // צבע דיפולטיבי (כחול)
  });

  // --- טעינת נתונים (הוראות קבע + קטגוריות) ---
  const fetchData = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
      setLoading(true);
      // שימוש ב-Promise.all כדי לטעון את שניהם במקביל
      const [expensesRes, categoriesRes] = await Promise.all([
        apiClient.get(`/fixed-expenses/user/${user.id}`),
        apiClient.get(`/categories/list?userId=${user.id}`)
      ]);
      
      setExpenses(expensesRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- הוספת הוראת קבע (כולל לוגיקת קטגוריה) ---
  const handleAdd = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    
    try {
      let finalCategoryId = formData.categoryId;

      // 1. אם המשתמש בחר ליצור קטגוריה חדשה - ניצור אותה קודם
      if (isNewCategoryMode && formData.newCategoryName) {
        const catRes = await apiClient.post('/categories/add', {
            name: formData.newCategoryName,
            color: formData.newCategoryColor,
            userId: user.id
        });
        finalCategoryId = catRes.data.id; // קבלת ה-ID של הקטגוריה החדשה
      }

      // 2. יצירת הוראת הקבע עם ה-ID (הקיים או החדש)
      await apiClient.post('/fixed-expenses/add', {
        userId: user.id,
        description: formData.description,
        amount: parseFloat(formData.amount),
        dayOfMonth: parseInt(formData.dayOfMonth),
        categoryId: finalCategoryId ? finalCategoryId : null
      });
      
      // איפוס ורענון
      setShowModal(false);
      setIsNewCategoryMode(false);
      setFormData({ 
          description: '', amount: '', dayOfMonth: '', 
          categoryId: '', newCategoryName: '', newCategoryColor: '#3B82F6' 
      });
      fetchData(); 

    } catch (err) {
      alert("שגיאה בהוספת הוראת קבע");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("למחוק הוראת קבע זו?")) return;
    try {
      await apiClient.delete(`/fixed-expenses/${id}`);
      fetchData(); // קריאה ל-fetchData המעודכן
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-gray-900 transition-colors duration-300">
      <header className="bg-white/90 backdrop-blur-md px-5 py-4 flex items-center gap-4 shadow-sm border-b border-gray-100 dark:bg-gray-800/90 dark:border-gray-700 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowRight size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">הוראות קבע</h1>
      </header>

      <main className="p-5 space-y-4">
        <button 
          onClick={() => setShowModal(true)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Plus size={20} />
          הוסף הוראת קבע חדשה
        </button>

        <div className="space-y-3">
          {loading ? (
            <p className="text-center text-gray-400 mt-10">טוען נתונים...</p>
          ) : expenses.length === 0 ? (
            <p className="text-center text-gray-400 mt-10">אין הוראות קבע עדיין</p>
          ) : (
            expenses.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  {/* הצגת צבע הקטגוריה אם קיים */}
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: item.category ? item.category.color : '#EEE' }}
                  >
                    {item.category ? (
                        <span className="text-xs font-bold">{item.category.name.charAt(0)}</span>
                    ) : (
                        <Calendar size={20} className="text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{item.description}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 dark:text-gray-400">
                      <CreditCard size={12} /> יורד ב-{item.dayOfMonth} לחודש
                      {item.category && <span className="mr-2 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-[10px]">{item.category.name}</span>}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <span className="block font-bold text-gray-900 dark:text-white">₪{item.amount}</span>
                  <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 mt-1 hover:underline flex items-center gap-1 justify-end">
                    מחק <Trash2 size={10} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal */}
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
                <label className="text-xs font-bold text-gray-500 mb-1 block">תיאור</label>
                <input required className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm outline-none dark:bg-gray-700 dark:text-white"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              {/* --- בחירת קטגוריה --- */}
              <div className="bg-gray-50 p-3 rounded-xl dark:bg-gray-700/50">
                  <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-gray-500 block flex items-center gap-1">
                          <Tag size={12}/> קטגוריה
                      </label>
                      <button 
                        type="button"
                        onClick={() => setIsNewCategoryMode(!isNewCategoryMode)}
                        className="text-xs text-purple-600 font-bold hover:underline dark:text-purple-400"
                      >
                          {isNewCategoryMode ? 'בחר מרשימה קיימת' : '+ צור חדשה'}
                      </button>
                  </div>

                  {isNewCategoryMode ? (
                      <div className="flex gap-2 animate-in slide-in-from-top-2 fade-in">
                          <input 
                              placeholder="שם הקטגוריה החדשה"
                              className="flex-1 bg-white border border-gray-200 rounded-lg p-2 text-sm outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              value={formData.newCategoryName}
                              onChange={e => setFormData({...formData, newCategoryName: e.target.value})}
                              required={isNewCategoryMode} // חובה רק אם במצב חדש
                          />
                          <input 
                              type="color"
                              className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                              value={formData.newCategoryColor}
                              onChange={e => setFormData({...formData, newCategoryColor: e.target.value})}
                          />
                      </div>
                  ) : (
                      <select 
                          className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          value={formData.categoryId}
                          onChange={e => setFormData({...formData, categoryId: e.target.value})}
                      >
                          <option value="">-- ללא קטגוריה --</option>
                          {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                      </select>
                  )}
              </div>
              {/* ------------------- */}
              
              <div className="flex gap-4">
                <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 mb-1 block">סכום</label>
                    <input required type="number" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm outline-none dark:bg-gray-700 dark:text-white"
                      value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
                <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 mb-1 block">יום (1-31)</label>
                    <input required type="number" min="1" max="31" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm outline-none dark:bg-gray-700 dark:text-white"
                      value={formData.dayOfMonth} onChange={e => setFormData({...formData, dayOfMonth: e.target.value})} />
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
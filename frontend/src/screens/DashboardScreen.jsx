import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Eye, Calendar, PiggyBank, 
  ChevronLeft, ShoppingCart, Car, Home, Zap, Star, Coffee,
  TrendingUp, TrendingDown, Trash2
} from 'lucide-react';

const DashboardScreen = () => {
  const navigate = useNavigate();
  
  // --- States ---
  const [data, setData] = useState({ totalBalance: 0, monthlyExpenses: 0, recentTransactions: [] });
  const [categories, setCategories] = useState([]);
  const [transactionType, setTransactionType] = useState('EXPENSE'); 
  const [formData, setFormData] = useState({ description: '', amount: '', categoryId: '' });
  
  // מודל להוספת קטגוריה
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // --- טעינת נתונים ---
  const fetchDashboardData = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) { navigate('/login'); return; }
 
      try {
        const [dashboardRes, catRes] = await Promise.all([
          // זה נשאר תקין (סטטיסטיקות)
          axios.get(`http://localhost:8080/api/stats/dashboard?userId=${user.id}`),

          // --- התיקון: שינוי הנתיב לקונטרולר החדש ---
          // במקום: api/stats/categories-list
          // שנה ל: api/categories/list
          axios.get(`http://localhost:8080/api/categories/list?userId=${user.id}`)
        ]);
        setData(dashboardRes.data);
        setCategories(catRes.data);
      } catch (err) { console.error("Error loading dashboard data:", err); }
  };
  
  useEffect(() => { fetchDashboardData(); }, []);

  // --- הוספת תנועה חדשה ---
  const handleSubmit = async (e) => { 
      e.preventDefault();
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;

      try {
        // התאמת ה-API לפי סוג הפעולה (הכנסה/הוצאה)
        // שים לב: וודא שיש לך את ה-Controller הזה בשרת, אחרת צריך ליצור אותו
        await axios.post('http://localhost:8080/api/transactions/add', {
            userId: user.id,
            description: formData.description,
            amount: parseFloat(formData.amount), // המרה למספר
            categoryId: formData.categoryId,
            type: transactionType // INCOME או EXPENSE
        });
        
        // איפוס הטופס ורענון הנתונים
        setFormData({ description: '', amount: '', categoryId: '' });
        fetchDashboardData(); 
      } catch (error) {
          console.error("Failed to add transaction", error);
          alert("שגיאה בהוספת תנועה");
      }
  }; 
  
  // --- הוספת קטגוריה חדשה (הלוגיקה שביקשת) ---
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
      const res = await axios.post('http://localhost:8080/api/categories/add', {
        name: newCatName,
        userId: user.id
      });
      
      // הוספה לרשימה המקומית כדי לראות מיד
      setCategories([...categories, res.data]);
      
      // בחירה אוטומטית של החדש, איפוס וסגירה
      setFormData({ ...formData, categoryId: res.data.id });
      setNewCatName("");
      setShowNewCatModal(false);
    } catch (err) {
      console.error("Failed to add category", err);
      alert("שגיאה ביצירת קטגוריה (אולי השם כבר קיים?)");
    }
  };

  // --- מחיקת תנועה ---
  const handleDelete = async (id) => { 
      if(!window.confirm("האם למחוק תנועה זו?")) return;
      try {
          await axios.delete(`http://localhost:8080/api/transactions/${id}`);
          fetchDashboardData();
      } catch (error) {
          console.error("Failed to delete", error);
      }
  };

  // --- אייקונים וצבעים לקטגוריות ---
  const getCategoryStyle = (categoryName) => {
    // אם אין שם (כמו בהכנסה כללית), נחזיר דיפולט
    const safeName = categoryName || 'General';
    
    const styles = {
      'Food': { icon: <ShoppingCart size={20} />, bg: 'bg-orange-50 text-orange-500 dark:bg-orange-900/30' },
      'Transport': { icon: <Car size={20} />, bg: 'bg-blue-50 text-blue-500 dark:bg-blue-900/30' },
      'Home': { icon: <Home size={20} />, bg: 'bg-purple-50 text-purple-500 dark:bg-purple-900/30' },
      'Rent': { icon: <Home size={20} />, bg: 'bg-purple-50 text-purple-500 dark:bg-purple-900/30' },
      'Utilities': { icon: <Zap size={20} />, bg: 'bg-yellow-50 text-yellow-500 dark:bg-yellow-900/30' },
      'Entertainment': { icon: <Coffee size={20} />, bg: 'bg-pink-50 text-pink-500 dark:bg-pink-900/30' },
      'Salary': { icon: <TrendingUp size={20} />, bg: 'bg-green-50 text-green-500 dark:bg-green-900/30' }
    };
    
    // חיפוש לפי מפתח, או החזרת ברירת מחדל
    return styles[Object.keys(styles).find(key => safeName.includes(key))] || 
           { icon: <Star size={20} />, bg: 'bg-gray-50 text-gray-500 dark:bg-gray-800' };
  };

  return (
    <div className="pb-8 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-5 py-4 flex justify-between items-center shadow-sm border-b border-gray-100 dark:bg-gray-800/90 dark:border-gray-700">
        <div>
          <span className="text-sm text-gray-500 block font-medium mb-0.5 dark:text-gray-400">שלום 👋</span>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">סקירה יומית</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-full bg-white hover:bg-gray-100 transition-colors border border-gray-100 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600">
            <Bell size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px]">
             <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-blue-600 text-sm dark:bg-gray-800 dark:text-white">SY</div>
          </button>
        </div>
      </header>

      <main className="px-5 pt-6 max-w-md mx-auto space-y-6">
        
        {/* Balance Card */}
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-500/25 overflow-hidden ring-1 ring-white/10">
           <div className="relative z-10 flex flex-col h-full justify-between gap-8">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-indigo-100 text-sm font-medium opacity-90 flex items-center gap-1"><PiggyBank size={16} /> יתרה כוללת</span>
                <Eye size={20} className="text-indigo-200" />
              </div>
              <div className="flex items-baseline gap-1" dir="ltr"><span className="text-4xl font-bold tracking-tight">₪{data.totalBalance?.toLocaleString()}</span></div>
            </div>
            <div className="flex justify-between items-end">
              <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shadow-lg">
                <span className="text-[10px] text-indigo-100 block mb-0.5">הוצאות החודש</span>
                <span className="text-sm font-bold tracking-wide">₪{Math.abs(data.monthlyExpenses || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - השקעות והוראות קבע */}
        <div className="grid grid-cols-2 gap-4">
            <QuickAction 
                icon={<Calendar size={24} />} 
                color="text-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                label="הוראות קבע" 
                onClick={() => navigate('/fixed-expenses')} 
            />
            <QuickAction 
                icon={<TrendingUp size={24} />} 
                color="text-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                label="השקעות" 
                onClick={() => navigate('/investments')} 
            />
        </div>

        {/* Add Transaction Form */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 dark:text-white">
            <div className={`p-1.5 rounded-full ${transactionType === 'INCOME' ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'}`}>
               {transactionType === 'INCOME' ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
            </div>
            {transactionType === 'INCOME' ? 'הוספת הכנסה' : 'הוספת הוצאה'}
          </h3>

          <div className="flex bg-gray-50 p-1 rounded-xl mb-4 dark:bg-gray-700">
            <button type="button" onClick={() => setTransactionType('EXPENSE')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${transactionType === 'EXPENSE' ? 'bg-white text-red-500 shadow-sm dark:bg-gray-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-400'}`}>הוצאה</button>
            <button type="button" onClick={() => setTransactionType('INCOME')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${transactionType === 'INCOME' ? 'bg-white text-green-600 shadow-sm dark:bg-gray-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-400'}`}>הכנסה</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" placeholder={transactionType === 'INCOME' ? "מקור ההכנסה" : "על מה הוצאת?"} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
            <div className="flex gap-3">
              <input type="number" className="w-1/3 bg-gray-50 border-none rounded-xl p-3 text-sm outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" placeholder="סכום" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
              
              <select 
                className="w-2/3 bg-gray-50 border-none rounded-xl p-3 text-sm outline-none dark:bg-gray-700 dark:text-white" 
                value={formData.categoryId} 
                onChange={(e) => {
                    if (e.target.value === "NEW") {
                        setShowNewCatModal(true);
                    } else {
                        setFormData({...formData, categoryId: e.target.value});
                    }
                }} 
                required
              >
                <option value="">בחר קטגוריה</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                <option value="NEW" className="font-bold text-blue-600 dark:text-indigo-400">+ הוסף קטגוריה חדשה</option>
              </select>
            </div>
            <button type="submit" className={`w-full text-white py-3.5 rounded-xl font-bold text-sm shadow-lg ${transactionType === 'INCOME' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-900 hover:bg-gray-800 dark:bg-indigo-600 dark:hover:bg-indigo-700'}`}>{transactionType === 'INCOME' ? 'שמור הכנסה' : 'שמור הוצאה'}</button>
          </form>
        </div>

        {/* Transactions List */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">תנועות אחרונות</h2>
            <button onClick={() => navigate('/history')} className="text-sm text-blue-600 font-medium flex items-center gap-0.5 hover:underline dark:text-indigo-400">לכל ההיסטוריה <ChevronLeft size={16} /></button>
          </div>
          <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 min-h-[100px] dark:bg-gray-800 dark:border-gray-700">
            {data.recentTransactions.length > 0 ? (
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {data.recentTransactions.map((tx) => {
                  const style = getCategoryStyle(tx.category?.name);
                  const isIncome = tx.amount > 0;
                  return (
                    <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-gray-50 rounded-2xl transition-colors group cursor-default dark:hover:bg-gray-700">
                        <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center ${style.bg}`}>{style.icon}</div>
                            <div><p className="font-bold text-sm text-gray-900 mb-0.5 dark:text-white">{tx.description}</p><p className="text-xs text-gray-500 font-medium dark:text-gray-400">{tx.date}</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`font-bold ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`} dir="ltr">{isIncome ? '+' : ''}₪{Math.abs(tx.amount).toLocaleString()}</span>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(tx.id); }} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 dark:text-gray-500 dark:hover:text-red-400"><Trash2 size={16} /></button>
                        </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-center text-gray-400 py-8 text-sm">אין עסקאות להצגה</p>}
          </div>
        </section>
      </main>

      {/* Add Category Modal */}
      {showNewCatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl dark:bg-gray-800">
            <h3 className="text-lg font-bold text-gray-900 mb-4 dark:text-white">קטגוריה חדשה</h3>
            <input
              autoFocus
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="שם הקטגוריה (למשל: ספורט)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewCatModal(false)}
                className="flex-1 py-2.5 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                ביטול
              </button>
              <button
                onClick={handleAddCategory}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
              >
                הוסף
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// רכיב הכפתור המהיר
const QuickAction = ({ icon, color, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 group w-full">
    <div className={`w-full h-20 rounded-2xl border border-gray-100 flex items-center justify-center shadow-sm group-hover:-translate-y-1 transition-all cursor-pointer dark:border-gray-700 ${color}`}>
      {icon}
    </div>
    <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-white">{label}</span>
  </button>
);

export default DashboardScreen;
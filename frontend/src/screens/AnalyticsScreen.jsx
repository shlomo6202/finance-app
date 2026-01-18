import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Bell, Calendar, Filter, Search, XCircle } from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend 
} from 'recharts';

const AnalyticsScreen = () => {
  const [loading, setLoading] = useState(true);
  
  // --- States לנתונים ---
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  // --- States לפילטור (Toolbar) ---
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterType, setFilterType] = useState('EXPENSE'); // ברירת מחדל: הוצאות
  const [filterCategory, setFilterCategory] = useState('ALL');

  // 1. שליפת קטגוריות (עבור ה-Select)
  useEffect(() => {
    const fetchCategories = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        try {
          const res = await axios.get(`http://localhost:8080/api/stats/categories-list?userId=${user.id}`);
          setCategories(res.data);
        } catch (err) { console.error(err); }
      }
    };
    fetchCategories();
  }, []);

  // 2. שליפת עסקאות לפי חודש (רץ כשהחודש משתנה)
  const fetchData = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    setLoading(true);

    try {
      // מושכים את הרשימה המלאה מהשרת
      const listRes = await axios.get(`http://localhost:8080/api/stats/monthly-transactions?userId=${user.id}&month=${selectedMonth}`);
      setTransactions(listRes.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  // 3. לוגיקה לסינון הלקוח (Client Side Filtering)
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // סינון לפי סוג
      if (filterType === 'INCOME' && tx.amount < 0) return false;
      if (filterType === 'EXPENSE' && tx.amount > 0) return false;

      // סינון לפי קטגוריה
      if (filterCategory !== 'ALL') {
         if (!tx.category || tx.category.id !== parseInt(filterCategory)) return false;
      }
      return true;
    });
  }, [transactions, filterType, filterCategory]);

  // 4. חישוב נתוני העוגה מתוך הרשימה המסוננת
  const chartData = useMemo(() => {
    const categoryMap = {};

    filteredTransactions.forEach(tx => {
        // מתעלמים מהסימן לצורך הגרף (גרף עוגה תמיד חיובי)
        const amount = Math.abs(tx.amount);
        const catName = tx.category ? tx.category.name : 'כללי';

        if (categoryMap[catName]) {
            categoryMap[catName] += amount;
        } else {
            categoryMap[catName] = amount;
        }
    });

    const colors = ["#6366f1", "#ec4899", "#8b5cf6", "#f59e0b", "#10b981", "#3b82f6"];
    return Object.keys(categoryMap).map((name, index) => ({
        name,
        value: categoryMap[name],
        color: colors[index % colors.length]
    }));
  }, [filteredTransactions]);

  // חישוב סה"כ לרשימה המסוננת
  const filteredTotal = filteredTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="pb-24 min-h-screen bg-background-light dark:bg-gray-900 transition-colors duration-300">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-5 py-4 flex justify-between items-center shadow-sm dark:bg-gray-800/90 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">ניתוח מתקדם</h1>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Bell size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
      </header>

      <main className="px-5 py-6 max-w-md mx-auto space-y-6">
        
        {/* --- Toolbar: סרגל כלים --- */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 space-y-3 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-gray-500 flex items-center gap-1 dark:text-gray-400">
                    <Filter size={16} /> סינון והצגה
                </h2>
                {/* כפתור איפוס */}
                {(filterType !== 'ALL' || filterCategory !== 'ALL') && (
                    <button 
                        onClick={() => { setFilterType('ALL'); setFilterCategory('ALL'); }}
                        className="text-xs text-red-500 flex items-center gap-1 hover:underline"
                    >
                        <XCircle size={14} /> אפס סינון
                    </button>
                )}
            </div>

            {/* בחירת תאריך */}
            <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400">
                    <Calendar size={18} />
                </div>
                <input 
                    type="month" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl p-3 pr-10 outline-none font-bold dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                />
            </div>

            {/* בחירת סוג וקטגוריה */}
            <div className="flex gap-2">
                <select 
                    className="w-1/2 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl p-3 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="ALL">הכל</option>
                    <option value="EXPENSE">הוצאות בלבד</option>
                    <option value="INCOME">הכנסות בלבד</option>
                </select>

                <select 
                    className="w-1/2 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl p-3 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="ALL">כל הקטגוריות</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* --- תרשים עוגה (דינמי) --- */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-800 mb-2 w-full text-right dark:text-white">התפלגות (לפי סינון)</h2>
            
            {chartData.length > 0 ? (
                <div className="relative w-full h-[220px]" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={chartData} 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={60} 
                                outerRadius={80} 
                                paddingAngle={5} 
                                dataKey="value"
                                stroke="none" // הסרת קווים לבנים במצב כהה
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            {/* עיצוב הטולטיפ למצב כהה */}
                            <RechartsTooltip 
                                formatter={(value) => `₪${value.toLocaleString()}`} 
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="py-10 text-gray-400 text-center">אין נתונים להצגה בסינון זה</div>
            )}
        </div>

        {/* --- רשימת עסקאות --- */}
        <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
                <h3 className="font-bold text-gray-900 dark:text-white">פירוט עסקאות</h3>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded-lg text-gray-600 font-bold dark:bg-gray-700 dark:text-gray-300" dir="ltr">
                    Total: ₪{Math.abs(filteredTotal).toLocaleString()}
                </span>
            </div>
            
            {filteredTransactions.length > 0 ? (
                filteredTransactions.map(tx => {
                    const isIncome = tx.amount > 0;
                    return (
                        <div key={tx.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-50 shadow-sm animate-fade-in dark:bg-gray-800 dark:border-gray-700">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{tx.description}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {tx.category ? tx.category.name : 'כללי'} • {tx.date}
                                </p>
                            </div>
                            {/* התיקון: הצגת מינוס להוצאות ופלוס להכנסות */}
                            <span 
                                className={`font-bold ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`} 
                                dir="ltr"
                            >
                                {isIncome ? '+' : '-'}₪{Math.abs(tx.amount).toLocaleString()}
                            </span>
                        </div>
                    );
                })
            ) : (
                <div className="flex flex-col items-center py-10 text-gray-400">
                    <Search size={32} className="mb-2 opacity-50" />
                    <p className="text-sm">לא נמצאו עסקאות</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default AnalyticsScreen;
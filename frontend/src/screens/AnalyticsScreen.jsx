import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { PieChart as PieIcon, BarChart2, Activity } from 'lucide-react';
import apiClient from '../api/axiosClient';

const AnalyticsScreen = () => {
  // --- States ---
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  
  // חודש נוכחי לפילוח קטגוריות (ברירת מחדל: החודש הנוכחי)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);

  // --- שליפת נתונים ---
  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
      // 1. שליפת הוצאות חודשיות (עבור גרף העמודות)
      const monthlyRes = await apiClient.get(`/stats/monthly?userId=${user.id}`);
      setMonthlyStats(monthlyRes.data);

      // 2. שליפת פילוח קטגוריות (עבור גרף העוגה) לפי החודש שנבחר
      const categoryRes = await apiClient.get(`/stats/category-breakdown?userId=${user.id}&month=${selectedMonth}`);
      setCategoryData(categoryRes.data);

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">טוען נתונים...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md px-5 py-4 shadow-sm border-b border-gray-100 dark:bg-gray-800/90 dark:border-gray-700 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="text-blue-600" />
          ניתוח נתונים
        </h1>
      </header>

      <main className="p-5 space-y-6">

        {/* --- גרף 1: הוצאות לפי חודשים (Bar Chart) --- */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 h-80">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                <BarChart2 size={20} />
            </div>
            <h2 className="font-bold text-gray-900 dark:text-white">הוצאות לפי חודשים</h2>
          </div>

          {/* חשוב: הגדרת גובה באחוזים בתוך ה-Div שעוטף */}
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#9CA3AF" />
              <Tooltip 
                cursor={{fill: 'transparent'}} 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
              />
              <Bar dataKey="amount" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* --- גרף 2: התפלגות הוצאות (Pie Chart) --- */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 h-96">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-500">
                    <PieIcon size={20} />
                </div>
                <h2 className="font-bold text-gray-900 dark:text-white">התפלגות הוצאות</h2>
            </div>
            
            {/* פילטר לבחירת חודש */}
            <div className="relative">
                <input 
                    type="month" 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none cursor-pointer"
                />
            </div>
          </div>

          <div className="h-full w-full flex flex-col items-center">
            {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                    <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    >
                    {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#cccccc'} />
                    ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm pb-10">
                    אין הוצאות בחודש זה
                </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default AnalyticsScreen;
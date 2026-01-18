import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Trash2 } from 'lucide-react';

const HistoryScreen = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");

  const fetchHistory = async () => {
    const res = await axios.get('http://localhost:8080/api/stats/history');
    setTransactions(res.data);
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("למחוק את העסקה הזו?")) {
      await axios.delete(`http://localhost:8080/api/stats/transaction/${id}`);
      fetchHistory(); // רענון הרשימה
    }
  };

  const filtered = transactions.filter(t => 
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background-light pb-24">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-5 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ChevronLeft size={24} /></button>
        <h1 className="text-xl font-bold">היסטוריית תנועות</h1>
      </header>

      <main className="px-5 py-6 max-w-md mx-auto space-y-4">
        {/* חיפוש */}
        <div className="relative">
          <Search className="absolute right-3 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="חפש לפי שם או קטגוריה..." 
            className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* רשימה */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {filtered.map(t => (
            <div key={t.id} className="p-4 border-b border-gray-50 flex justify-between items-center last:border-0 hover:bg-gray-50">
              <div>
                <p className="font-bold text-gray-900">{t.description}</p>
                <p className="text-xs text-gray-500">{t.date} • {t.category?.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900">₪{t.amount.toLocaleString()}</span>
                <button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center p-8 text-gray-400">לא נמצאו תנועות</p>}
        </div>
      </main>
    </div>
  );
};
export default HistoryScreen;
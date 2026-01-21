import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosClient';
import { Search, TrendingUp, TrendingDown, Activity, RefreshCw, X } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const InvestmentsScreen = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [symbol, setSymbol] = useState('');
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // טעינת נתונים
  const fetchData = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    try {
      // 1. נתונים חיים (מספרים)
      const portRes = await apiClient.get(`/investments/${user.id}`);
      setPortfolio(portRes.data);

      // 2. נתונים לגרף (היסטוריה)
      const histRes = await apiClient.get(`/investments/history/${user.id}`);
      const chartData = histRes.data.map(item => ({
        date: item.snapshotDate, // וודא שזה תואם לשדה ב-DTO
        value: item.totalValueUsd
      }));
      setHistoryData(chartData);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // פונקציה שמכריחה עדכון היסטוריה (כדי לראות גרף מיד אחרי קנייה)
  const handleForceUpdate = async () => {
    setLoading(true);
    try {
        await apiClient.post('/investments/snapshot/force');
        await fetchData(); // טעינה מחדש של הנתונים
    } catch (e) { alert("שגיאה ברענון"); }
  };

  // חיפוש מניה
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!symbol) return;
    setSearchLoading(true); setQuote(null);
    try {
      const res = await apiClient.get(`/investments/price?symbol=${symbol}`);
      setQuote(res.data);
    } catch (e) { alert("מניה לא נמצאה"); } finally { setSearchLoading(false); }
  };

  // קניית מניה
  const handleBuy = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    try {
        await apiClient.post('/investments/buy', {
            userId: user.id, ticker: quote.symbol, quantity: parseFloat(quantity), price: quote.price
        });
        alert("קנייה בוצעה!");
        setShowBuyModal(false); setQuote(null); setSymbol('');
        handleForceUpdate(); // רענון אוטומטי של הגרף אחרי קנייה
    } catch (e) { alert("שגיאה בקנייה"); }
  };

  if (loading && !portfolio) return <div className="p-10">טוען...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 dark:bg-gray-900 px-5 pt-5 space-y-6">
      
      {/* 1. כותרת ושווי תיק */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white flex gap-2"><Activity/> תיק השקעות</h1>
        <button onClick={handleForceUpdate} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"><RefreshCw size={20}/></button>
      </div>

      <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg shadow-blue-500/30">
        <span className="text-blue-100">שווי תיק נוכחי</span>
        <div className="text-5xl font-black mt-2">${portfolio?.totalValue?.toLocaleString() || '0.00'}</div>
        <div className="flex items-center gap-2 mt-4 bg-white/20 w-fit px-3 py-1 rounded-full text-sm">
            {portfolio?.totalGain >= 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
            <span>${Math.abs(portfolio?.totalGain || 0).toLocaleString()} ({portfolio?.totalGainPercent?.toFixed(2)}%)</span>
        </div>
      </div>

      {/* 2. גרף היסטוריה */}
      {historyData.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm h-64 border dark:border-gray-700">
            <h3 className="text-sm text-gray-500 mb-2">היסטוריית שווי תיק</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                    <defs>
                        <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" hide />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#2563eb" fillOpacity={1} fill="url(#chartColor)" />
                </AreaChart>
            </ResponsiveContainer>
          </div>
      ) : (
          <div className="text-center text-gray-400 text-sm py-4">אין עדיין היסטוריה (בצע קנייה ראשונה)</div>
      )}

      {/* 3. חיפוש וקנייה */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border dark:border-gray-700">
        <h2 className="font-bold mb-3 dark:text-white">קניית מניות</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
            <input className="flex-1 bg-gray-100 dark:bg-gray-700 dark:text-white p-3 rounded-xl outline-none" 
                   placeholder="סימול (למשל AAPL)" value={symbol} onChange={e=>setSymbol(e.target.value.toUpperCase())} />
            <button type="submit" className="bg-blue-600 text-white p-3 rounded-xl">{searchLoading ? '...' : <Search/>}</button>
        </form>

        {quote && (
            <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex justify-between items-center animate-in fade-in">
                <div>
                    <div className="font-black text-xl text-blue-900 dark:text-blue-200">{quote.symbol}</div>
                    <div className="font-bold text-gray-600 dark:text-gray-400">${quote.price}</div>
                </div>
                <button onClick={() => setShowBuyModal(true)} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold shadow-md hover:bg-blue-700">קנה</button>
            </div>
        )}
      </div>

      {/* מודל קנייה */}
      {showBuyModal && quote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between mb-4">
                    <h3 className="text-xl font-bold dark:text-white">רכישת {quote.symbol}</h3>
                    <button onClick={()=>setShowBuyModal(false)}><X/></button>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                        <span className="text-gray-500">מחיר</span><span className="font-bold dark:text-white">${quote.price}</span>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-500">כמות</label>
                        <input type="number" min="0.1" step="0.1" value={quantity} onChange={e=>setQuantity(e.target.value)} 
                               className="w-full bg-gray-100 dark:bg-gray-700 p-3 rounded-xl font-bold text-lg dark:text-white"/>
                    </div>
                    <div className="flex justify-between font-bold text-xl dark:text-white">
                        <span>סה"כ:</span><span className="text-blue-600">${(quote.price * quantity).toLocaleString()}</span>
                    </div>
                    <button onClick={handleBuy} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg">אשר רכישה</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
export default InvestmentsScreen;
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Plus, RefreshCw } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const InvestmentsScreen = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  // מזהה המשתמש - כרגע נקבע סטטית ל-1, בהמשך יבוא מהלוגין
  const userId = 1; 

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      // כאן אנו פונים לשרת שבנינו
      const response = await fetch(`http://localhost:8080/api/investments/dashboard/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data);
      } else {
        console.error("Failed to fetch portfolio");
      }
    } catch (error) {
      console.error("Error connecting to server", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  // במקרה שאין נתונים או התיק ריק
  if (!portfolio) {
    return <div className="p-4 text-center">לא ניתן לטעון נתונים</div>;
  }

  // הכנת הנתונים לגרף העוגה
  const pieData = portfolio.stocks.map(stock => ({
    name: stock.ticker,
    value: stock.marketValue
  }));

  const isPositive = portfolio.totalGain >= 0;

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm rounded-b-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">תיק השקעות</h1>
          <button onClick={fetchPortfolio} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
            <RefreshCw size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Main Value Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-100 text-sm font-medium mb-1">שווי תיק כולל</p>
            <h2 className="text-4xl font-bold mb-4">
              ${portfolio.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            
            <div className="flex items-center gap-3 bg-white/10 w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm">
              {isPositive ? <TrendingUp size={18} className="text-green-300" /> : <TrendingDown size={18} className="text-red-300" />}
              <span className={`font-semibold ${isPositive ? 'text-green-300' : 'text-red-300'}`}>
                {isPositive ? '+' : ''}{portfolio.totalGain.toLocaleString()} ({portfolio.totalGainPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          
          {/* Decorational circles */}
          <div className="absolute -right-4 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Allocation Chart */}
        {pieData.length > 0 && (
          <div className="bg-white p-5 rounded-2xl shadow-sm">
            <h3 className="font-bold text-gray-700 mb-4">הרכב התיק</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `$${value.toLocaleString()}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Stock List */}
        <div>
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="font-bold text-gray-700">המניות שלי</h3>
            <button 
                onClick={() => alert('כאן יפתח מודל קנייה בעתיד')}
                className="flex items-center gap-1 text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full"
            >
              <Plus size={16} /> קנה מניה
            </button>
          </div>

          <div className="space-y-3">
            {portfolio.stocks.map((stock, index) => {
               const stockIsPositive = stock.gain >= 0;
               return (
                <div key={index} className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs overflow-hidden">
                       {/* לוגו מניה משירות חיצוני או טקסט */}
                       <img 
                         src={`https://logo.clearbit.com/${stock.ticker.toLowerCase()}.com`} 
                         onError={(e) => {e.target.onerror = null; e.target.style.display='none'}}
                         alt={stock.ticker} 
                         className="w-full h-full object-cover"
                       />
                       <span className="absolute">{stock.ticker[0]}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{stock.ticker}</h4>
                      <p className="text-xs text-gray-500">{stock.quantity} יחידות • ${stock.currentPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <p className="font-bold text-gray-800">${stock.marketValue.toLocaleString()}</p>
                    <p className={`text-xs font-medium flex items-center justify-end ${stockIsPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {stockIsPositive ? '+' : ''}{stock.gainPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
               );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentsScreen;
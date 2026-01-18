import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CreditCard, Plus } from 'lucide-react';

const WalletScreen = () => {
  const [cards, setCards] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newCard, setNewCard] = useState({ name: '', last4Digits: '', balance: '', limitAmount: '' });

  const fetchCards = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
      const res = await axios.get(`http://localhost:8080/api/stats/cards?userId=${user.id}`);
      setCards(res.data);
    } catch (err) {
      console.error("Failed to load cards", err);
    }
  };

  useEffect(() => { fetchCards(); }, []);

  const handleAddCard = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    
    try {
      await axios.post(`http://localhost:8080/api/stats/cards/add?userId=${user.id}`, newCard);
      setNewCard({ name: '', last4Digits: '', balance: '', limitAmount: '' });
      setShowForm(false);
      fetchCards();
    } catch (err) {
      alert("שגיאה בהוספת כרטיס");
    }
  };

  return (
    // 1. מעטפת חיצונית: אחראית על הרקע המלא (משתרעת על כל הרוחב)
    <div className="min-h-screen w-full bg-background-light dark:bg-gray-900 transition-colors duration-300">
      
      {/* 2. מעטפת פנימית: אחראית על הרוחב והמרכוז */}
      <div className="max-w-md mx-auto px-5 pt-8 pb-24">
        
        <h1 className="text-2xl font-bold text-gray-900 mb-6 dark:text-white">הארנק שלי</h1>
        
        {/* רשימת כרטיסים */}
        <div className="space-y-4 mb-6">
          {cards.map(card => (
            <div key={card.id} className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden h-48 flex flex-col justify-between transform hover:scale-[1.02] transition-transform border border-gray-700">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="flex justify-between items-start z-10">
                <span className="font-mono text-xs opacity-70 uppercase">{card.name}</span>
                <CreditCard className="opacity-50" />
              </div>
              <div className="z-10">
                  <h2 className="text-3xl font-bold mb-1">₪{card.balance?.toLocaleString()}</h2>
                  <p className="font-mono text-lg tracking-widest opacity-80">**** **** **** {card.last4Digits}</p>
              </div>
              <div className="flex justify-between items-end z-10 text-xs opacity-70">
                  <div><p>Limit</p><p>₪{card.limitAmount?.toLocaleString()}</p></div>
                  <div><p>Expires</p><p>12/29</p></div>
              </div>
            </div>
          ))}
          {cards.length === 0 && <p className="text-center text-gray-400 dark:text-gray-500">אין כרטיסים להצגה</p>}
        </div>

        {/* טופס הוספה */}
        {!showForm ? (
          <button 
              onClick={() => setShowForm(true)} 
              className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-4 flex items-center justify-center gap-2 text-gray-500 font-medium hover:border-primary hover:text-primary transition-colors dark:border-gray-700 dark:text-gray-400 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
          >
            <Plus size={20} /> הוסף כרטיס חדש
          </button>
        ) : (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 animate-fade-in dark:bg-gray-800 dark:border-gray-700">
            <h3 className="font-bold mb-3 text-gray-900 dark:text-white">פרטי כרטיס חדש</h3>
            <form onSubmit={handleAddCard} className="space-y-3">
              <input 
                  placeholder="שם הכרטיס (למשל: ויזה)" 
                  className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" 
                  value={newCard.name} 
                  onChange={e => setNewCard({...newCard, name: e.target.value})} 
                  required 
              />
              <input 
                  placeholder="4 ספרות אחרונות" 
                  maxLength="4" 
                  className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" 
                  value={newCard.last4Digits} 
                  onChange={e => setNewCard({...newCard, last4Digits: e.target.value})} 
                  required 
              />
              <div className="flex gap-2">
                  <input 
                      type="number" 
                      placeholder="ניצול (חוב)" 
                      className="w-1/2 p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" 
                      value={newCard.balance} 
                      onChange={e => setNewCard({...newCard, balance: e.target.value})} 
                      required 
                  />
                  <input 
                      type="number" 
                      placeholder="מסגרת אשראי" 
                      className="w-1/2 p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" 
                      value={newCard.limitAmount} 
                      onChange={e => setNewCard({...newCard, limitAmount: e.target.value})} 
                      required 
                  />
              </div>
              <div className="flex gap-2 mt-2">
                  <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-700">שמור כרטיס</button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-3 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">ביטול</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletScreen;
import React, { useEffect, useState } from 'react';
import axios from 'axios'; // לא לשכוח לוודא שמותקן axios
import { useNavigate } from 'react-router-dom';
import { 
  User, LogOut, Settings, Bell, Shield, ChevronLeft, Camera, 
  Moon, Sun, Globe, X, Mail, Edit3 
} from 'lucide-react';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ id: null, username: 'אורח', email: 'guest@finwise.com' });
  
  // --- States למודלים ---
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false); // <--- חדש!
  
  // --- States לעריכת פרופיל ---
  const [editFormData, setEditFormData] = useState({ username: '', email: '' });

  // --- States להגדרות ---
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currency, setCurrency] = useState('ILS');

  useEffect(() => {
    // טעינת משתמש
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (!parsedUser.username) parsedUser.username = "אורח";
      setUser(parsedUser);
      // אתחול הטופס עם המידע הקיים
      setEditFormData({ username: parsedUser.username, email: parsedUser.email || '' });
    }

    // טעינת הגדרות
    const savedTheme = localStorage.getItem('theme');
    const savedCurrency = localStorage.getItem('currency');
    
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    if (savedCurrency) setCurrency(savedCurrency);
  }, []);

  // --- פונקציה לשמירת הפרופיל (החלק החדש) ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user.id) return;

    try {
      // 1. שליחה לשרת
      const res = await axios.put(`http://localhost:8080/api/users/update?userId=${user.id}`, {
        username: editFormData.username,
        email: editFormData.email
      });

      // 2. עדכון ה-State המקומי וה-localStorage
      const updatedUser = { ...user, ...res.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // 3. סגירת המודל והודעה
      setShowEditProfileModal(false);
      alert("הפרופיל עודכן בהצלחה! 🎉");

    } catch (err) {
      console.error("Failed to update profile", err);
      alert("שגיאה בעדכון הפרופיל");
    }
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  const handleLogout = () => {
    if (window.confirm('האם אתה בטוח שברצונך להתנתק?')) {
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  const SettingItem = ({ icon: Icon, title, onClick, color = "text-gray-600" }) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all active:scale-[0.99] group dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl bg-gray-50 group-hover:bg-white transition-colors dark:bg-gray-700 dark:group-hover:bg-gray-600 ${color}`}>
          <Icon size={20} className="dark:text-gray-200" />
        </div>
        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{title}</span>
      </div>
      <ChevronLeft size={18} className="text-gray-300 dark:text-gray-500" />
    </button>
  );

  return (
    <div className="min-h-screen bg-background-light pb-24 dark:bg-gray-900 transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-5 py-4 flex items-center gap-3 shadow-sm dark:bg-gray-800/90 dark:border-gray-700">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors dark:hover:bg-gray-700">
          <ChevronLeft size={24} className="text-gray-900 rotate-180 dark:text-white" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">הפרופיל שלי</h1>
      </header>

      <main className="px-5 py-8 max-w-md mx-auto space-y-8">
        {/* כרטיס משתמש */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent-purple p-[3px]">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-3xl font-bold text-primary dark:bg-gray-800 dark:text-white">
                {user.username ? user.username.charAt(0).toUpperCase() : '?'}
              </div>
            </div>
            {/* כפתור עריכה מהיר על התמונה - פותח גם הוא את המודל */}
            <button onClick={() => setShowEditProfileModal(true)} className="absolute bottom-0 right-0 p-2 bg-gray-900 text-white rounded-full shadow-lg border-2 border-white hover:bg-gray-700 dark:border-gray-800 dark:bg-indigo-600">
              <Edit3 size={14} />
            </button>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.username}</h2>
          <p className="text-gray-500 text-sm dark:text-gray-400">{user.email}</p>
        </div>

        {/* תפריטים */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 px-1">הגדרות חשבון</h3>
          {/* חיבור הכפתור למודל העריכה */}
          <SettingItem icon={User} title="פרטים אישיים" onClick={() => setShowEditProfileModal(true)} />
          <SettingItem icon={Bell} title="התראות" onClick={() => alert("בקרוב")} />
          <SettingItem icon={Shield} title="פרטיות ואבטחה" onClick={() => alert("בקרוב")} />
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 px-1">כללי</h3>
          <SettingItem icon={Settings} title="הגדרות אפליקציה" onClick={() => setShowSettingsModal(true)} />
        </section>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors mt-8 dark:bg-red-900/20 dark:text-red-400"
        >
          <LogOut size={20} />
          התנתק מהמערכת
        </button>
      </main>

      {/* --- Modal 1: הגדרות אפליקציה (מה שעשינו קודם) --- */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl dark:bg-gray-800 dark:text-white transition-colors">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2"><Settings className="text-gray-400" /> הגדרות</h3>
                    <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700"><X size={20} /></button>
                </div>
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl dark:bg-gray-700/50">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'}`}>
                                {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <div className="flex flex-col"><span className="font-bold text-sm">מצב תצוגה</span><span className="text-xs text-gray-500 dark:text-gray-400">{isDarkMode ? 'כהה (לילה)' : 'בהיר (יום)'}</span></div>
                        </div>
                        <button onClick={toggleTheme} className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 flex items-center ${isDarkMode ? 'bg-primary justify-end' : 'bg-gray-300 justify-start'}`}>
                            <div className="w-5 h-5 bg-white rounded-full shadow-md"></div>
                        </button>
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-500 px-1 flex items-center gap-1"><Globe size={14} /> מטבע ראשי</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {['ILS', 'USD', 'EUR'].map((curr) => (
                                <button key={curr} onClick={() => changeCurrency(curr)} className={`py-3 rounded-xl font-bold text-sm border-2 transition-all flex flex-col items-center gap-1 ${currency === curr ? 'border-primary bg-indigo-50 text-primary dark:bg-indigo-900/30 dark:border-indigo-400' : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300'}`}>
                                    {curr === 'ILS' && '₪'}{curr === 'USD' && '$'}{curr === 'EUR' && '€'}<span className="text-[10px]">{curr}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <button onClick={() => setShowSettingsModal(false)} className="w-full mt-8 bg-gray-900 text-white py-3 rounded-xl font-bold shadow-lg dark:bg-primary">סגור</button>
            </div>
        </div>
      )}

      {/* --- Modal 2: עריכת פרופיל (החדש!) --- */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl dark:bg-gray-800 dark:text-white">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <User className="text-primary dark:text-indigo-400" /> עריכת פרופיל
                    </h3>
                    <button onClick={() => setShowEditProfileModal(false)} className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-600 dark:text-gray-300 px-1">שם מלא</label>
                        <div className="relative">
                            <User className="absolute right-3 top-3 text-gray-400" size={18} />
                            <input 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pr-10 outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={editFormData.username}
                                onChange={e => setEditFormData({...editFormData, username: e.target.value})}
                                placeholder="הכנס שם חדש"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-600 dark:text-gray-300 px-1">כתובת אימייל</label>
                        <div className="relative">
                            <Mail className="absolute right-3 top-3 text-gray-400" size={18} />
                            <input 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pr-10 outline-none focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={editFormData.email}
                                onChange={e => setEditFormData({...editFormData, email: e.target.value})}
                                placeholder="הכנס אימייל"
                                type="email"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full mt-4 bg-primary text-white py-3 rounded-xl font-bold shadow-lg hover:bg-primary-dark transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-700"
                    >
                        שמור שינויים
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default ProfileScreen;
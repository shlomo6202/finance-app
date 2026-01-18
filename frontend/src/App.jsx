import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// ייבוא כל המסכים
import DashboardScreen from './screens/DashboardScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import WalletScreen from './screens/WalletScreen';
import AboutScreen from './screens/AboutScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';

// ייבוא התפריט התחתון
import BottomNav from './components/BottomNav';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // רשימת המסכים בהם נציג את הניווט ואת הבוט
  const showNav = [
    '/dashboard', 
    '/analytics', 
    '/wallet', 
    '/profile', 
    '/history'
  ].includes(location.pathname);

  return (
    // הוספנו כאן את הגדרות ה-Dark Mode לרקע הראשי כדי למנוע הבהובים
    <div className="min-h-screen bg-background-light pb-24 font-sans text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
      
      {/* תוכן המסך הנוכחי */}
      {children}
      
      {/* תפריט תחתון - רק במסכים פנימיים */}
      {showNav && <BottomNav />}

      
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* דף הבית */}
          <Route path="/" element={<AboutScreen />} />
          
          {/* אימות */}
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          
          {/* מסכים פנימיים */}
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/analytics" element={<AnalyticsScreen />} />
          <Route path="/wallet" element={<WalletScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          
          {/* ניתוב ברירת מחדל */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
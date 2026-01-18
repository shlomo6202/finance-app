import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Wallet } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // רכיב עזר לכפתור
  const NavItem = ({ icon: Icon, label, path }) => (
    <button 
      onClick={() => navigate(path)}
      className={`flex flex-col items-center justify-center w-16 transition-colors duration-200 ${
        isActive(path) ? 'text-primary font-bold' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <Icon size={24} strokeWidth={isActive(path) ? 2.5 : 2} />
      <span className="text-[10px] mt-1">{label}</span>
    </button>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-4 pt-2 px-6 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] flex justify-between items-center max-w-md mx-auto">
      
      {/* כפתור ראשי */}
      <NavItem icon={LayoutDashboard} label="ראשי" path="/dashboard" />
      
      {/* כפתור ארנק מרכזי בולט */}
      <div className="relative -top-6">
        <button 
          onClick={() => navigate('/wallet')}
          className="w-14 h-14 rounded-full bg-primary text-white shadow-xl shadow-primary/40 flex items-center justify-center transform hover:scale-105 transition-all active:scale-95 border-4 border-white"
        >
          <Wallet size={24} />
        </button>
      </div>
      
      {/* כפתור דוחות */}
      <NavItem icon={BarChart3} label="דוחות" path="/analytics" />

    </nav>
  );
};

export default BottomNav;
import { Home, PieChart, TrendingUp, User } from 'lucide-react'; // החלפנו את האייקון הישן ב-TrendingUp
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();

  // פונקציית עזר לבדיקה אם הנתיב פעיל
  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16">
        
        
        <Link to="/dashboard" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/dashboard') ? 'text-blue-600' : 'text-gray-500'}`}>
          <Home size={24} />
          <span className="text-xs mt-1">בית</span>
        </Link>


        <Link to="/analytics" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/analytics') ? 'text-blue-600' : 'text-gray-500'}`}>
          <PieChart size={24} />
          <span className="text-xs mt-1">ניתוח</span>
        </Link>

        
        <Link to="/profile" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/profile') ? 'text-blue-600' : 'text-gray-500'}`}>
          <User size={24} />
          <span className="text-xs mt-1">פרופיל</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;
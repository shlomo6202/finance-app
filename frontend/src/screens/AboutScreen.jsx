import React from 'react';
import { 
  ArrowRight, Wallet, Rocket, ShieldCheck, 
  Sparkles, Zap, Headphones, Mail, MessageCircle, FileText, Star, Globe, Share2, Rss,
  TrendingUp, PiggyBank, LogIn
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutScreen = () => {
  const navigate = useNavigate();

  // רכיבי עזר
  const FeatureItem = ({ icon, color, title, desc }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2 hover:border-primary/30 transition-colors">
      <div className={color}>{icon}</div>
      <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  );

  const MenuLink = ({ icon, text }) => (
    <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-right group">
      <div className="flex items-center gap-3">
        <div className="text-gray-400 group-hover:text-primary transition-colors">{icon}</div>
        <span className="text-sm font-medium text-gray-700">{text}</span>
      </div>
      <ArrowRight size={16} className="text-gray-400 rotate-180" />
    </button>
  );

  return (
    <div className="bg-background-light min-h-screen flex flex-col">
      
      {/* Header - מותאם לדף נחיתה */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-5 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <Wallet size={18} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">FinWise</h1>
        </div>
        
        {/* כפתור התחברות בראש הדף */}
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-gray-50"
        >
          <span>כניסה</span>
          <LogIn size={16} />
        </button>
      </header>

      <main className="flex-grow px-4 py-8 max-w-md mx-auto space-y-8 pb-32">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-4xl font-black text-gray-900 leading-tight mb-2">
            הכסף שלך,<br/>
            <span className="text-primary">בשליטה מלאה.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-6">הדרך החכמה לנהל הוצאות, לחסוך לעתיד ולקבל החלטות טובות יותר.</p>

          {/* 3D Card Visual */}
          <div className="relative w-full aspect-[4/3] max-w-[320px] mx-auto mb-6 perspective-1000">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-36 bg-gray-900 rounded-2xl shadow-2xl shadow-primary/20 transform -rotate-6 z-10 flex flex-col justify-between p-5 border border-gray-700 transition-transform hover:rotate-0 duration-500">
              <div className="flex justify-between items-start">
                <div className="w-10 h-7 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md opacity-90"></div>
                <div className="text-white/40"><Wallet size={20} /></div>
              </div>
              <div>
                <div className="text-white/40 text-[10px] mb-1 font-mono">יתרה נוכחית</div>
                <div className="text-white font-mono text-xl tracking-widest font-bold">₪14,520</div>
              </div>
            </div>

            {/* אלמנטים מרחפים */}
            <div className="absolute -right-2 -top-4 bg-white p-3 pr-4 rounded-2xl shadow-xl border border-gray-100 transform rotate-6 z-0 animate-bounce delay-75">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <TrendingUp size={20} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500">רווח</p>
                  <p className="text-sm font-bold text-gray-900">+12%</p>
                </div>
              </div>
            </div>

            <div className="absolute -left-4 bottom-0 bg-white px-4 py-3 rounded-2xl shadow-xl border border-gray-100 transform -rotate-3 z-20 flex items-center gap-3 animate-pulse delay-150">
              <div className="w-8 h-8 rounded-full bg-accent-purple/10 flex items-center justify-center">
                <PiggyBank size={18} className="text-accent-purple" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-gray-500">חסכת</span>
                <span className="text-xs font-bold text-gray-800">₪350</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <section>
          <div className="flex items-center gap-2 mb-4 justify-center">
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">למה FinWise?</h3>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <FeatureItem icon={<ShieldCheck size={24} />} color="text-accent-teal" title="אבטחה בנקאית" desc="הצפנה מתקדמת" />
            <FeatureItem icon={<Sparkles size={24} />} color="text-accent-purple" title="ממשק פשוט" desc="ללא סיבוכים" />
            <FeatureItem icon={<Zap size={24} />} color="text-accent-blue" title="תובנות חכמות" desc="ניתוח בזמן אמת" />
            <FeatureItem icon={<Headphones size={24} />} color="text-primary" title="תמיכה 24/7" desc="מענה מהיר" />
          </div>
        </section>

        {/* Support & Links */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            <MenuLink icon={<Mail size={20} />} text="צור קשר" />
            <MenuLink icon={<FileText size={20} />} text="תנאי שימוש" />
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center pt-4">
          <div className="flex justify-center gap-6 opacity-40">
            <Globe size={18} />
            <Share2 size={18} />
            <Rss size={18} />
          </div>
          <p className="text-[10px] text-gray-400 mt-4">© 2026 FinWise Inc.</p>
        </div>
      </main>

      {/* Sticky Bottom CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-200 z-40 pb-safe">
        <div className="max-w-md mx-auto">
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-gray-900 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-gray-900/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            התחל עכשיו בחינם
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;
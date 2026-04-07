import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import { Bell, Menu, X, Leaf } from 'lucide-react';
import api from '../../utils/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetch = () => api.get('/notifications/unread-count').then(r => setUnread(r.data.count)).catch(() => {});
    fetch();
    const id = setInterval(fetch, 30000);
    return () => clearInterval(id);
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  const dashboardLink = user?.role === 'donor' ? '/donor' : user?.role === 'receiver' ? '/receiver' : '/admin';
  const linkClass = 'text-sm font-semibold text-slate-600 hover:text-orange-600 transition-colors';

  return (
    <nav className="bg-white/95 backdrop-blur border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-950">
          <span className="w-9 h-9 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-sm shadow-orange-200">
            <Leaf className="w-5 h-5" />
          </span>
          FoodRescue
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link to={dashboardLink} className={linkClass}>Dashboard</Link>
              {user.role !== 'donor' && <Link to="/food" className={linkClass}>Browse Food</Link>}
              <Link to="/impact" className={linkClass}>Impact Passport</Link>
              <Link to="/notifications" className="relative text-slate-600 hover:text-orange-600 transition-colors">
                <Bell className="w-5 h-5" />
                {unread > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{unread}</span>}
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-700 font-bold text-sm">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-slate-700">{user.name}</span>
                <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-600 font-semibold">Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass}>Login</Link>
              <Link to="/register" className="btn-primary text-sm">Get Started</Link>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 flex flex-col gap-3">
          {user ? (
            <>
              <Link to={dashboardLink} className="text-sm font-medium" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/impact" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>Impact Passport</Link>
              <Link to="/notifications" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>Notifications {unread > 0 && `(${unread})`}</Link>
              <button onClick={handleLogout} className="text-sm text-red-500 text-left">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn-primary text-sm text-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

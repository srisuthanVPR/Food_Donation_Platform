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

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-orange-500">
          <Leaf className="w-6 h-6" /> FoodRescue
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link to={dashboardLink} className="text-sm font-medium text-gray-600 hover:text-orange-500">Dashboard</Link>
              {user.role !== 'donor' && <Link to="/food" className="text-sm font-medium text-gray-600 hover:text-orange-500">Browse Food</Link>}
              <Link to="/notifications" className="relative text-gray-600 hover:text-orange-500">
                <Bell className="w-5 h-5" />
                {unread > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{unread}</span>}
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-gray-700">{user.name}</span>
                <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-600 font-medium">Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-orange-500">Login</Link>
              <Link to="/register" className="btn-primary text-sm">Get Started</Link>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-3">
          {user ? (
            <>
              <Link to={dashboardLink} className="text-sm font-medium" onClick={() => setMenuOpen(false)}>Dashboard</Link>
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

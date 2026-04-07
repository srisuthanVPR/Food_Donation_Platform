import { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const priorityColor = { high: 'border-l-red-500', medium: 'border-l-orange-400', low: 'border-l-gray-300' };

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const fetch = () => api.get('/notifications').then(r => setNotifications(r.data)).catch(() => {});

  useEffect(() => { fetch(); }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    await api.put('/notifications/mark-all-read');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read');
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unread > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{unread}</span>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm flex items-center gap-2">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n._id} onClick={() => !n.isRead && markRead(n._id)}
              className={`card border-l-4 cursor-pointer transition-all ${priorityColor[n.priority]} ${!n.isRead ? 'bg-orange-50/50' : 'opacity-70'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                  <p className="text-gray-600 text-sm mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1"></span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

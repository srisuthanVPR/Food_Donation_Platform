import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FileText } from 'lucide-react';
import api from '../../utils/api';
import StatsCard from '../../components/shared/StatsCard';
import toast from 'react-hot-toast';

const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ef4444'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [trend, setTrend] = useState([]);
  const [topDonors, setTopDonors] = useState([]);
  const [topReceivers, setTopReceivers] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [reports, setReports] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/analytics/stats'),
      api.get('/admin/users'),
      api.get('/admin/listings'),
      api.get('/analytics/trend'),
      api.get('/analytics/top-donors'),
      api.get('/analytics/top-receivers'),
      api.get('/analytics/categories'),
      api.get('/analytics/reports')
    ]).then(([s, u, l, t, td, tr, cs, rp]) => {
      setStats(s.data); setUsers(u.data); setListings(l.data);
      setTrend(t.data.donations || []); setTopDonors(td.data);
      setTopReceivers(tr.data); setCategoryStats(cs.data); setReports(rp.data);
    }).catch(() => toast.error('Failed to load data')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = setTimeout(loadData, 0);
    return () => clearTimeout(id);
  }, [loadData]);

  const toggleUser = async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: data.isActive } : u));
      toast.success(data.message);
    } catch { toast.error('Error updating user'); }
  };

  const deleteListing = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await api.delete(`/admin/listings/${id}`);
      setListings(prev => prev.filter(l => l._id !== id));
      toast.success('Listing deleted');
    } catch { toast.error('Error deleting listing'); }
  };

  const pieData = [
    { name: 'Available', value: stats.availableNow || 0 },
    { name: 'Claimed', value: (stats.totalClaims || 0) - (stats.completedCount || 0) },
    { name: 'Completed', value: stats.completedCount || 0 },
    { name: 'Expired', value: stats.expiredCount || 0 }
  ].filter(d => d.value > 0);

  const tabs = ['overview', 'users', 'listings', 'analytics', 'reports'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm">Platform overview and management</p>
          </div>
          <button onClick={loadData} disabled={loading} className="btn-secondary text-sm flex items-center gap-2">
            {loading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap ${tab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatsCard title="Total Listings" value={stats.totalListings || 0} icon="📋" color="blue" />
            <StatsCard title="Total Claims" value={stats.totalClaims || 0} icon="🤝" color="orange" />
            <StatsCard title="Meals Rescued" value={stats.totalMealsRescued || 0} icon="🍽️" color="green" />
            <StatsCard title="Expired" value={stats.expiredCount || 0} icon="❌" color="red" subtitle={`${stats.wasteRate}% waste rate`} />
            <StatsCard title="Donors" value={stats.totalDonors || 0} icon="🏪" color="purple" />
            <StatsCard title="Receivers" value={stats.totalReceivers || 0} icon="🤝" color="blue" />
            <StatsCard title="Available Now" value={stats.availableNow || 0} icon="🟢" color="green" />
            <StatsCard title="Completed" value={stats.completedCount || 0} icon="✅" color="purple" />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="card">
              <h3 className="font-semibold mb-4">7-Day Donation Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trend}>
                  <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} name="Donations" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 className="font-semibold mb-4">Donation Status Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-3">🏆 Top Donors</h3>
              {topDonors.map((d, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm font-medium">{['🥇', '🥈', '🥉'][i] || '•'} {d.organization || d.name}</span>
                  <span className="text-xs text-gray-500">{d.count} donations · {d.totalMeals} meals</span>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 className="font-semibold mb-3">🏅 Top Receivers</h3>
              {topReceivers.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm font-medium">{['🥇', '🥈', '🥉'][i] || '•'} {r.organization || r.name}</span>
                  <span className="text-xs text-gray-500">{r.count} claims</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === 'users' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Name</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Email</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Role</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Organization</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">{u.name}</td>
                  <td className="py-3 px-2 text-gray-500">{u.email}</td>
                  <td className="py-3 px-2"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'donor' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                  <td className="py-3 px-2 text-gray-500">{u.organization || '-'}</td>
                  <td className="py-3 px-2"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="py-3 px-2">
                    <button onClick={() => toggleUser(u._id)} className={`text-xs font-medium px-3 py-1 rounded-lg ${u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'listings' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Food</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Donor</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Meals</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Expiry</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(l => (
                <tr key={l._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">{l.foodName}</td>
                  <td className="py-3 px-2 text-gray-500">{l.donor?.organization || l.donor?.name}</td>
                  <td className="py-3 px-2">{l.mealsCount}</td>
                  <td className="py-3 px-2"><span className={`badge-${l.status}`}>{l.status?.replace('_', ' ')}</span></td>
                  <td className="py-3 px-2 text-gray-500">{new Date(l.expiryTime).toLocaleString()}</td>
                  <td className="py-3 px-2">
                    <button onClick={() => deleteListing(l._id)} className="text-xs font-medium px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'analytics' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Category Claim Rates</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryStats}>
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
                <Bar dataKey="claimRate" fill="#22c55e" radius={[4, 4, 0, 0]} name="Claim Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-4">Platform Health</h3>
            <div className="space-y-4">
              {[
                { label: 'Claim Success Rate', value: stats.totalListings ? (((stats.totalClaims || 0) / stats.totalListings) * 100).toFixed(1) : 0, color: 'bg-green-500' },
                { label: 'Waste Rate', value: stats.wasteRate || 0, color: 'bg-red-500' },
                { label: 'Completion Rate', value: stats.totalClaims ? (((stats.completedCount || 0) / stats.totalClaims) * 100).toFixed(1) : 0, color: 'bg-blue-500' }
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-semibold">{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${Math.min(item.value, 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'reports' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {reports.map(report => (
            <div key={report.id} className="card">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <p className="text-xs text-gray-500">{report.period}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${report.status === 'Ready' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {report.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4">{report.summary}</p>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {report.metrics.map(metric => (
                  <div key={metric.label} className="rounded-lg bg-gray-50 p-3">
                    <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                    <p className="text-xs text-gray-500">{metric.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {report.highlights.map(item => (
                  <p key={item} className="text-sm text-gray-600 border-l-2 border-orange-200 pl-3">{item}</p>
                ))}
              </div>

              <p className="text-xs text-gray-400 mt-4">Generated: {new Date(report.generatedAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

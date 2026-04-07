import { useState, useEffect, useCallback } from 'react';
import { Filter } from 'lucide-react';
import api from '../../utils/api';
import FoodCard from '../../components/shared/FoodCard';
import FoodMap from '../../components/shared/FoodMap';
import StatsCard from '../../components/shared/StatsCard';
import toast from 'react-hot-toast';

export default function ReceiverDashboard() {
  const [listings, setListings] = useState([]);
  const [claims, setClaims] = useState([]);
  const [tab, setTab] = useState('browse');
  const [filters, setFilters] = useState({ foodType: '', category: '', search: '' });
  const [showMap, setShowMap] = useState(false);

  const fetchListings = useCallback(() => {
    const params = new URLSearchParams({ status: 'available' });
    if (filters.foodType) params.append('foodType', filters.foodType);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    api.get(`/food?${params}`).then(r => setListings(r.data)).catch(() => {});
  }, [filters.foodType, filters.category, filters.search]);

  const fetchClaims = useCallback(() => api.get('/claims/my').then(r => setClaims(r.data)).catch(() => {}), []);

  useEffect(() => {
    fetchListings();
    fetchClaims();
    const id = setInterval(() => { fetchListings(); fetchClaims(); }, 30000);
    return () => clearInterval(id);
  }, [fetchListings, fetchClaims]);

  const handleClaim = async (id) => {
    try {
      await api.post(`/claims/${id}/claim`, {});
      toast.success('Food claimed successfully!');
      fetchListings(); fetchClaims();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not claim food');
    }
  };

  const handleStatusUpdate = async (claimId, status) => {
    try {
      await api.put(`/claims/${claimId}/status`, { status });
      toast.success(`Status updated to ${status}`);
      fetchClaims();
    } catch {
      toast.error('Error updating status');
    }
  };

  const claimStats = {
    total: claims.length,
    active: claims.filter(c => c.status === 'claimed').length,
    pickedUp: claims.filter(c => c.status === 'picked_up').length,
    completed: claims.filter(c => c.status === 'completed').length
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Receiver Dashboard</h1>
        <p className="text-gray-500 text-sm">Browse and claim available food donations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Claims" value={claimStats.total} icon="📋" color="blue" />
        <StatsCard title="Active Claims" value={claimStats.active} icon="🔵" color="orange" />
        <StatsCard title="Picked Up" value={claimStats.pickedUp} icon="🚗" color="purple" />
        <StatsCard title="Completed" value={claimStats.completed} icon="✅" color="green" />
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {['browse', 'my-claims'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t === 'browse' ? `Browse Food (${listings.length})` : `My Claims (${claims.length})`}
          </button>
        ))}
      </div>

      {tab === 'browse' && (
        <>
          <div className="flex flex-wrap gap-3 mb-4">
            <input className="input w-48" placeholder="Search food..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
            <select className="input w-40" value={filters.foodType} onChange={e => setFilters(f => ({ ...f, foodType: e.target.value }))}>
              <option value="">All Types</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="non-vegetarian">Non-Veg</option>
              <option value="vegan">Vegan</option>
            </select>
            <select className="input w-40" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
              <option value="">All Categories</option>
              {['cooked', 'packed', 'raw', 'beverages', 'bakery'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => setShowMap(!showMap)} className="btn-secondary flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4" /> {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>

          {showMap && <div className="mb-6"><FoodMap listings={listings} /></div>}

          {listings.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🔍</div>
              <p>No available food listings right now. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map(l => <FoodCard key={l._id} listing={l} role="receiver" onClaim={handleClaim} />)}
            </div>
          )}
        </>
      )}

      {tab === 'my-claims' && (
        <div className="space-y-4">
          {claims.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📋</div>
              <p>No claims yet. Browse available food to get started!</p>
            </div>
          ) : (
            claims.map(claim => (
              <div key={claim._id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{claim.foodListing?.foodName || 'Food Item'}</h3>
                    <p className="text-sm text-gray-500">By: {claim.foodListing?.donor?.organization || claim.foodListing?.donor?.name}</p>
                    <p className="text-sm text-gray-500">📍 {claim.foodListing?.pickupAddress}</p>
                    <p className="text-xs text-gray-400 mt-1">Claimed: {new Date(claim.claimedAt).toLocaleString()}</p>
                  </div>
                  <span className={`badge-${claim.status === 'completed' ? 'completed' : claim.status === 'picked_up' ? 'claimed' : 'available'}`}>
                    {claim.status?.replace('_', ' ')}
                  </span>
                </div>
                {claim.status === 'claimed' && (
                  <button onClick={() => handleStatusUpdate(claim._id, 'picked_up')} className="btn-primary text-sm mt-3">
                    Mark as Picked Up
                  </button>
                )}
                {claim.status === 'picked_up' && (
                  <button onClick={() => handleStatusUpdate(claim._id, 'completed')} className="btn-secondary text-sm mt-3">
                    Mark as Completed
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

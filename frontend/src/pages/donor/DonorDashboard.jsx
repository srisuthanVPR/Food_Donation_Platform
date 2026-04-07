import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/auth';
import FoodCard from '../../components/shared/FoodCard';
import StatsCard from '../../components/shared/StatsCard';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  foodName: '', category: 'cooked', quantity: '', mealsCount: '', foodType: 'vegetarian',
  preparationTime: '', expiryTime: '', pickupAddress: '', specialNotes: '',
  location: { lat: 12.9716, lng: 77.5946 }
};

export default function DonorDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [claims, setClaims] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchListings = () => api.get('/food/my').then(r => setListings(r.data)).catch(() => {});
  const fetchClaims = () => api.get('/claims/donor').then(r => setClaims(r.data)).catch(() => {});

  useEffect(() => {
    fetchListings();
    fetchClaims();
    const id = setInterval(() => { fetchListings(); fetchClaims(); }, 30000);
    return () => clearInterval(id);
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/food/${editId}`, form);
        toast.success('Listing updated!');
      } else {
        await api.post('/food', form);
        toast.success('Food listing posted!');
      }
      setShowForm(false); setForm(EMPTY_FORM); setEditId(null);
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving listing');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (listing) => {
    setForm({
      foodName: listing.foodName, category: listing.category, quantity: listing.quantity,
      mealsCount: listing.mealsCount, foodType: listing.foodType,
      preparationTime: listing.preparationTime?.slice(0, 16),
      expiryTime: listing.expiryTime?.slice(0, 16),
      pickupAddress: listing.pickupAddress, specialNotes: listing.specialNotes || '',
      location: listing.location
    });
    setEditId(listing._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await api.delete(`/food/${id}`);
      toast.success('Listing deleted');
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting');
    }
  };

  const handleStatusUpdate = async (claimId, status) => {
    try {
      await api.put(`/claims/${claimId}/status`, { status });
      toast.success(`Claim marked as ${status.replace('_', ' ')}`);
      fetchListings();
      fetchClaims();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating claim');
    }
  };

  const stats = {
    total: listings.length,
    available: listings.filter(l => l.status === 'available').length,
    claimed: listings.filter(l => ['claimed', 'picked_up', 'completed'].includes(l.status)).length,
    expired: listings.filter(l => l.status === 'expired').length
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donor Dashboard</h1>
          <p className="text-gray-500 text-sm">{user?.organization || user?.name}</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Post Food
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Posted" value={stats.total} icon="📋" color="blue" />
        <StatsCard title="Available" value={stats.available} icon="🟢" color="green" />
        <StatsCard title="Claimed" value={stats.claimed} icon="✅" color="orange" />
        <StatsCard title="Expired" value={stats.expired} icon="❌" color="red" />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-lg">{editId ? 'Edit Listing' : 'Post Surplus Food'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Food Name</label>
                <input className="input" value={form.foodName} onChange={e => set('foodName', e.target.value)} placeholder="e.g. Butter Chicken + Rice" required />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                  {['cooked', 'packed', 'raw', 'beverages', 'bakery', 'other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Food Type</label>
                <select className="input" value={form.foodType} onChange={e => set('foodType', e.target.value)}>
                  {['vegetarian', 'non-vegetarian', 'vegan'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Quantity (units/kg)</label>
                <input type="number" className="input" value={form.quantity} onChange={e => set('quantity', e.target.value)} min="1" required />
              </div>
              <div>
                <label className="label">Number of Meals</label>
                <input type="number" className="input" value={form.mealsCount} onChange={e => set('mealsCount', e.target.value)} min="1" required />
              </div>
              <div>
                <label className="label">Preparation Time</label>
                <input type="datetime-local" className="input" value={form.preparationTime} onChange={e => set('preparationTime', e.target.value)} required />
              </div>
              <div>
                <label className="label">Expiry Time</label>
                <input type="datetime-local" className="input" value={form.expiryTime} onChange={e => set('expiryTime', e.target.value)} required />
              </div>
              <div className="col-span-2">
                <label className="label">Pickup Address</label>
                <input className="input" value={form.pickupAddress} onChange={e => set('pickupAddress', e.target.value)} placeholder="Full pickup address" required />
              </div>
              <div>
                <label className="label">Latitude</label>
                <input type="number" step="any" className="input" value={form.location.lat} onChange={e => set('location', { ...form.location, lat: parseFloat(e.target.value) })} />
              </div>
              <div>
                <label className="label">Longitude</label>
                <input type="number" step="any" className="input" value={form.location.lng} onChange={e => set('location', { ...form.location, lng: parseFloat(e.target.value) })} />
              </div>
              <div className="col-span-2">
                <label className="label">Special Notes</label>
                <textarea className="input" rows={2} value={form.specialNotes} onChange={e => set('specialNotes', e.target.value)} placeholder="Allergens, handling instructions..." />
              </div>
              <div className="col-span-2 flex gap-3">
                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : editId ? 'Update Listing' : 'Post Food'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div>
        <h2 className="font-semibold text-gray-800 mb-4">My Food Listings ({listings.length})</h2>
        {listings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🍱</div>
            <p>No listings yet. Post your first surplus food!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map(l => <FoodCard key={l._id} listing={l} role="donor" onEdit={handleEdit} onDelete={handleDelete} />)}
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="font-semibold text-gray-800 mb-4">Claim Requests ({claims.length})</h2>
        {claims.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-white rounded-lg border border-gray-100">
            <p>No claim requests yet. New claims will appear here.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {claims.map(claim => (
              <div key={claim._id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{claim.foodListing?.foodName || 'Food Item'}</h3>
                    <p className="text-sm text-gray-500">Claimed by: {claim.claimedBy?.organization || claim.claimedBy?.name}</p>
                    <p className="text-sm text-gray-500">Phone: {claim.claimedBy?.phone || 'Not provided'}</p>
                    <p className="text-xs text-gray-400 mt-1">Claimed: {new Date(claim.claimedAt).toLocaleString()}</p>
                  </div>
                  <span className={`badge-${claim.status === 'completed' ? 'completed' : claim.status === 'picked_up' ? 'claimed' : 'available'}`}>
                    {claim.status?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  {claim.status === 'claimed' && (
                    <button onClick={() => handleStatusUpdate(claim._id, 'picked_up')} className="btn-primary text-sm flex-1">
                      Confirm Pickup
                    </button>
                  )}
                  {claim.status === 'picked_up' && (
                    <button onClick={() => handleStatusUpdate(claim._id, 'completed')} className="btn-secondary text-sm flex-1">
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

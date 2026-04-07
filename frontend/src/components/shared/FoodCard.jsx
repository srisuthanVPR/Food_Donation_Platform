import { Clock, Leaf, MapPin, Package, Users } from 'lucide-react';
import { useCountdown } from '../../hooks/useCountdown';

const statusClass = { available: 'badge-available', claimed: 'badge-claimed', expired: 'badge-expired', completed: 'badge-completed', picked_up: 'badge-claimed' };
const categoryIcon = { cooked: '🍲', packed: '📦', raw: '🥗', beverages: '🥤', bakery: '🥐', other: '🍱' };

export default function FoodCard({ listing, onClaim, onEdit, onDelete, showActions = true, role }) {
  const { timeLeft, isUrgent, isExpired } = useCountdown(listing.expiryTime);

  return (
    <div className={`card hover:-translate-y-0.5 hover:shadow-md transition-all relative overflow-hidden ${isUrgent && !isExpired ? 'border-red-200' : ''}`}>
      <div className={`absolute inset-x-0 top-0 h-1 ${isUrgent && !isExpired ? 'bg-red-500' : 'bg-orange-400'}`}></div>
      {isUrgent && !isExpired && (
        <span className="badge-urgent absolute top-3 right-3">Urgent</span>
      )}

      <div className="flex items-start justify-between gap-4 mb-4 pt-1">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-11 h-11 rounded-lg bg-orange-50 flex items-center justify-center text-2xl flex-shrink-0">{categoryIcon[listing.category] || '🍱'}</span>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-950 text-lg truncate">{listing.foodName}</h3>
            <p className="text-xs text-slate-400 capitalize">{listing.category}</p>
          </div>
        </div>
        <span className={`${statusClass[listing.status] || 'badge-available'} whitespace-nowrap`}>{listing.status?.replace('_', ' ')}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-4">
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-2">
          <Users className="w-4 h-4 text-orange-400" />
          <span>{listing.mealsCount} meals</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-2">
          <Package className="w-4 h-4 text-sky-400" />
          <span>{listing.quantity} units</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-2">
          <Leaf className="w-4 h-4 text-emerald-400" />
          <span className="capitalize">{listing.foodType}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-2">
          <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-500' : 'text-slate-400'}`} />
          <span className={isUrgent ? 'text-red-600 font-semibold' : ''}>{timeLeft}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
        <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
        <span className="truncate">{listing.pickupAddress}</span>
      </div>

      {listing.donor && (
        <p className="text-xs text-slate-400 mb-3">By: {listing.donor.organization || listing.donor.name}</p>
      )}

      {listing.specialNotes && (
        <p className="text-xs text-slate-600 bg-orange-50 rounded-lg p-2 mb-3 italic">{listing.specialNotes}</p>
      )}

      {showActions && (
        <div className="flex gap-2 mt-2">
          {role === 'receiver' && listing.status === 'available' && !isExpired && (
            <button onClick={() => onClaim(listing._id)} className="btn-primary text-sm flex-1">Claim Food</button>
          )}
          {role === 'donor' && ['available', 'expired'].includes(listing.status) && (
            <>
              {listing.status === 'available' && !isExpired && (
                <button onClick={() => onEdit(listing)} className="btn-secondary text-sm flex-1">Edit</button>
              )}
              <button onClick={() => onDelete(listing._id)} className="btn-danger text-sm flex-1">Delete</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

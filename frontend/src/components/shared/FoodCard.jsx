import { Clock, MapPin, Users, Leaf, Package } from 'lucide-react';
import { useCountdown } from '../../hooks/useCountdown';

const statusClass = { available: 'badge-available', claimed: 'badge-claimed', expired: 'badge-expired', completed: 'badge-completed', picked_up: 'badge-claimed' };
const categoryIcon = { cooked: '🍲', packed: '📦', raw: '🥗', beverages: '🥤', bakery: '🥐', other: '🍱' };

export default function FoodCard({ listing, onClaim, onEdit, onDelete, showActions = true, role }) {
  const { timeLeft, isUrgent, isExpired } = useCountdown(listing.expiryTime);

  return (
    <div className={`card hover:shadow-md transition-shadow relative ${isUrgent && !isExpired ? 'border-red-200 border' : ''}`}>
      {isUrgent && !isExpired && (
        <span className="badge-urgent absolute top-3 right-3">🔥 URGENT</span>
      )}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-2xl mr-2">{categoryIcon[listing.category] || '🍱'}</span>
          <span className="font-semibold text-gray-900 text-lg">{listing.foodName}</span>
        </div>
        <span className={statusClass[listing.status] || 'badge-available'}>{listing.status?.replace('_', ' ')}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-orange-400" />
          <span>{listing.mealsCount} meals</span>
        </div>
        <div className="flex items-center gap-1">
          <Package className="w-4 h-4 text-blue-400" />
          <span>{listing.quantity} units</span>
        </div>
        <div className="flex items-center gap-1">
          <Leaf className="w-4 h-4 text-green-400" />
          <span className="capitalize">{listing.foodType}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-500' : 'text-gray-400'}`} />
          <span className={isUrgent ? 'text-red-600 font-semibold' : ''}>{timeLeft}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
        <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
        <span className="truncate">{listing.pickupAddress}</span>
      </div>

      {listing.donor && (
        <p className="text-xs text-gray-400 mb-3">By: {listing.donor.organization || listing.donor.name}</p>
      )}

      {listing.specialNotes && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded p-2 mb-3 italic">📝 {listing.specialNotes}</p>
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

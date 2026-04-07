import { useEffect, useState } from 'react';
import { Award, Footprints, HeartHandshake, Leaf, ShieldCheck, Sparkles, Target } from 'lucide-react';
import api from '../utils/api';

const badgeIcons = [Award, Sparkles, ShieldCheck, Leaf];

export default function ImpactPassport() {
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/impact-passport')
      .then(({ data }) => setPassport(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="card text-center text-gray-500">Building your impact passport...</div>
      </div>
    );
  }

  if (!passport) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="card text-center text-gray-500">Impact passport is unavailable right now.</div>
      </div>
    );
  }

  const { user, personal, platform, badges, nextActions, recentActivity } = passport;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="rounded-lg bg-gray-900 text-white p-6 md:p-8 mb-8 overflow-hidden relative">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-sm mb-5">
            <Footprints className="w-4 h-4 text-orange-300" /> Impact Passport
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{user.organization || user.name}</h1>
          <p className="text-gray-300 max-w-2xl">
            A living record of meals rescued, pickups completed, and community impact created through FoodRescue.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="bg-orange-500 text-white rounded-full px-4 py-1.5 text-sm font-semibold capitalize">{user.role}</span>
            <span className="bg-white/10 text-white rounded-full px-4 py-1.5 text-sm">{personal.badgeCount} badges unlocked</span>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <HeartHandshake className="w-6 h-6 text-orange-500 mb-3" />
          <p className="text-sm text-gray-500">Meals Rescued</p>
          <p className="text-3xl font-bold text-gray-900">{personal.mealsRescued}</p>
        </div>
        <div className="card">
          <Target className="w-6 h-6 text-green-500 mb-3" />
          <p className="text-sm text-gray-500">Actions Completed</p>
          <p className="text-3xl font-bold text-gray-900">{personal.actionsCompleted}</p>
        </div>
        <div className="card">
          <Leaf className="w-6 h-6 text-blue-500 mb-3" />
          <p className="text-sm text-gray-500">Families Served</p>
          <p className="text-3xl font-bold text-gray-900">{personal.estimatedFamiliesServed}</p>
        </div>
        <div className="card">
          <Sparkles className="w-6 h-6 text-orange-500 mb-3" />
          <p className="text-sm text-gray-500">Platform Meals</p>
          <p className="text-3xl font-bold text-gray-900">{platform.mealsRescued}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h2 className="font-semibold text-gray-900 mb-4">Badges</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {badges.map((badge, index) => {
              const Icon = badgeIcons[index % badgeIcons.length];
              return (
                <div key={badge.name} className={`rounded-lg border p-4 ${badge.unlocked ? 'border-orange-200 bg-orange-50' : 'border-gray-100 bg-gray-50 opacity-70'}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${badge.unlocked ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{badge.name}</h3>
                  <p className="text-sm text-gray-600">{badge.description}</p>
                  <p className={`text-xs font-semibold mt-3 ${badge.unlocked ? 'text-orange-600' : 'text-gray-400'}`}>
                    {badge.unlocked ? 'Unlocked' : 'Keep going'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Next Best Actions</h2>
          <div className="space-y-3">
            {nextActions.map(action => (
              <p key={action} className="text-sm text-gray-600 border-l-2 border-orange-300 pl-3">{action}</p>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 card">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Impact Trail</h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500">No activity yet. Your first rescue will appear here.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map(item => (
                <div key={`${item.title}-${item.date}`} className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.detail}</p>
                  </div>
                  <p className="text-xs text-gray-400 whitespace-nowrap">{new Date(item.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Platform Pulse</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Completed Pickups</p>
              <p className="text-2xl font-bold text-gray-900">{platform.completedPickups}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900">{platform.totalListings}</p>
            </div>
            <p className="text-sm text-gray-600 bg-green-50 text-green-700 rounded-lg p-3">
              Every rescue updates this passport as the community moves food from surplus to someone who needs it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

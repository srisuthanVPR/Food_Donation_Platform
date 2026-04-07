import { Link } from 'react-router-dom';
import { Leaf, Clock, MapPin, Bot, ArrowRight, Heart, TrendingUp, Shield } from 'lucide-react';

const stats = [
  { label: 'Meals Rescued', value: '50,000+', icon: '🍽️' },
  { label: 'Partner Restaurants', value: '200+', icon: '🏪' },
  { label: 'NGOs & Volunteers', value: '150+', icon: '🤝' },
  { label: 'Cities Active', value: '12', icon: '🌆' }
];

const features = [
  { icon: <Clock className="w-6 h-6 text-orange-500" />, title: 'Real-Time Expiry Tracking', desc: 'Live countdown timers ensure food reaches people before it expires.' },
  { icon: <MapPin className="w-6 h-6 text-blue-500" />, title: 'Location-Based Matching', desc: 'Interactive maps connect donors with nearby receivers instantly.' },
  { icon: <Bot className="w-6 h-6 text-purple-500" />, title: 'AI-Powered Insights', desc: 'Smart analytics identify urgent donations and reduce food waste.' },
  { icon: <Shield className="w-6 h-6 text-green-500" />, title: 'Verified Network', desc: 'Trusted restaurants, NGOs, and volunteers on one platform.' }
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-green-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Leaf className="w-4 h-4" /> Fighting Food Waste, One Meal at a Time
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Rescue Surplus Food.<br />
            <span className="text-orange-500">Feed Communities.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect restaurants with surplus food to local NGOs, food banks, and volunteers — before it expires. Powered by real-time tracking and AI analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base px-8 py-3 flex items-center gap-2 justify-center">
              Start Donating <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/register" className="btn-secondary text-base px-8 py-3 flex items-center gap-2 justify-center">
              <Heart className="w-5 h-5 text-red-400" /> Claim Food
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Why FoodRescue?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map(f => (
              <div key={f.title} className="card flex gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">{f.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-600">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Restaurant Posts Food', desc: 'Add surplus food with quantity, expiry time, and pickup location.', icon: '🍲' },
              { step: '2', title: 'NGO Claims It', desc: 'Nearby receivers browse and claim available food instantly.', icon: '🤝' },
              { step: '3', title: 'Food Gets Rescued', desc: 'Volunteer picks up food and delivers to those in need.', icon: '🚗' }
            ].map(item => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-3xl mb-4">{item.icon}</div>
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm mb-3">{item.step}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Join the Food Rescue Movement</h2>
          <p className="text-orange-100 mb-8">Every meal rescued is a step toward zero food waste. Sign up today.</p>
          <Link to="/register" className="bg-white text-orange-600 font-bold px-8 py-3 rounded-lg hover:bg-orange-50 transition-colors inline-flex items-center gap-2">
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm">
        © 2024 FoodRescue Platform — Built to fight food waste
      </footer>
    </div>
  );
}

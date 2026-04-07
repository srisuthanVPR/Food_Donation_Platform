import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Clock, HandHeart, Leaf, MapPin, ShieldCheck, Store, TrendingUp, Utensils } from 'lucide-react';
import heroImage from '../assets/hero.png';

const stats = [
  { label: 'Meals Rescued', value: '50,000+', icon: <Utensils className="w-5 h-5" /> },
  { label: 'Partner Restaurants', value: '200+', icon: <Store className="w-5 h-5" /> },
  { label: 'NGOs & Volunteers', value: '150+', icon: <HandHeart className="w-5 h-5" /> },
  { label: 'Cities Active', value: '12', icon: <MapPin className="w-5 h-5" /> }
];

const features = [
  { icon: <Clock className="w-6 h-6" />, title: 'Expiry-aware rescue', desc: 'Live urgency scores help teams move the right food first.' },
  { icon: <MapPin className="w-6 h-6" />, title: 'Nearby pickup matching', desc: 'Receivers can discover available meals around their city in moments.' },
  { icon: <Bot className="w-6 h-6" />, title: 'Food rescue assistant', desc: 'Ask for urgent donations, top contributors, reports, and pickup priorities.' },
  { icon: <ShieldCheck className="w-6 h-6" />, title: 'Role-based operations', desc: 'Donors, receivers, and admins each get the tools they need.' }
];

const steps = [
  { step: '01', title: 'Post surplus', desc: 'Add food details, quantity, expiry time, and pickup location.' },
  { step: '02', title: 'Claim nearby', desc: 'Receivers filter available meals and claim what they can collect.' },
  { step: '03', title: 'Track impact', desc: 'Pickup, completion, reports, and impact badges stay in sync.' }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section
        className="relative min-h-[calc(100vh-4rem)] px-4 py-16 md:py-20 flex items-center bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(90deg, rgba(15,23,42,0.94), rgba(15,23,42,0.72), rgba(15,23,42,0.28)), url(${heroImage})` }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="max-w-3xl text-white">
            <div className="section-eyebrow mb-6 bg-white/10 text-orange-100">
              <Leaf className="w-4 h-4" /> FoodRescue Network
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Move surplus food before the clock runs out.
            </h1>
            <p className="text-lg md:text-xl text-slate-200 max-w-2xl mb-8">
              Restaurants, NGOs, and volunteers coordinate urgent pickups, reduce waste, and turn every saved meal into measurable community impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link to="/register" className="btn-primary text-base px-7 py-3 inline-flex items-center justify-center gap-2">
                Start Rescuing <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="bg-white/10 hover:bg-white/15 text-white font-semibold py-3 px-7 rounded-lg border border-white/20 transition-colors inline-flex items-center justify-center">
                Use Demo Login
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.map(item => (
                <div key={item.label} className="rounded-lg border border-white/15 bg-white/10 p-4">
                  <div className="text-orange-200 mb-3">{item.icon}</div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-sm text-slate-300">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <div className="section-eyebrow mb-3">Rescue Flow</div>
              <h2 className="text-3xl font-bold text-slate-950">Built for fast decisions</h2>
            </div>
            <p className="text-slate-600 max-w-xl">
              FoodRescue keeps the operational loop short: publish, claim, confirm, and measure impact.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {steps.map(item => (
              <div key={item.step} className="card border-t-4 border-t-orange-400">
                <p className="text-sm font-bold text-orange-500 mb-4">{item.step}</p>
                <h3 className="text-xl font-bold text-slate-950 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="section-eyebrow mb-3">Operations</div>
            <h2 className="text-3xl font-bold text-slate-950 mb-3">Everything points to the next pickup</h2>
            <p className="text-slate-600">
              The app stays focused on practical rescue work, from expiring listings to proof of impact.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(feature => (
              <div key={feature.title} className="card hover:-translate-y-1 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-slate-950 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <TrendingUp className="w-10 h-10 text-orange-300 mb-4" />
            <h2 className="text-3xl font-bold mb-3">Turn rescued meals into visible impact.</h2>
            <p className="text-slate-300 max-w-2xl">
              Donors and receivers can track badges, rescue history, reports, and completion progress across the platform.
            </p>
          </div>
          <Link to="/register" className="btn-primary whitespace-nowrap inline-flex items-center justify-center gap-2 px-7 py-3">
            Create Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="bg-white text-slate-500 text-center py-6 text-sm border-t border-slate-100">
        FoodRescue Platform. Built to fight food waste.
      </footer>
    </div>
  );
}

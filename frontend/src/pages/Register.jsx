import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { Leaf } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'receiver', organization: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created successfully!');
      navigate(user.role === 'donor' ? '/donor' : '/receiver');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-orange-500 font-bold text-2xl">
            <Leaf className="w-7 h-7" /> FoodRescue
          </Link>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">I am a</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ value: 'donor', label: '🍲 Restaurant / Donor' }, { value: 'receiver', label: '🤝 NGO / Receiver' }].map(r => (
                    <button key={r.value} type="button" onClick={() => set('role', r.value)}
                      className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${form.role === r.value ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Full Name</label>
                <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" required />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9876543210" />
              </div>
              <div className="col-span-2">
                <label className="label">Organization Name</label>
                <input className="input" value={form.organization} onChange={e => set('organization', e.target.value)} placeholder={form.role === 'donor' ? 'Restaurant name' : 'NGO / Organization name'} />
              </div>
              <div className="col-span-2">
                <label className="label">Email</label>
                <input type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="col-span-2">
                <label className="label">Address</label>
                <input className="input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Your city / area" />
              </div>
              <div className="col-span-2">
                <label className="label">Password</label>
                <input type="password" className="input" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 6 characters" minLength={6} required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account? <Link to="/login" className="text-orange-500 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

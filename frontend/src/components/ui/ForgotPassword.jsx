import { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/services/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword({ onEmailSent }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) { toast.error('Enter a valid email address'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      if (data.success) {
        toast.success('OTP sent to your email!');
        setTimeout(() => onEmailSent(email), 800);
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full mb-3">
          <Mail className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Forgot Password?</h2>
        <p className="text-sm text-gray-500 mt-1">We'll send an OTP to your registered email.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fp-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input id="fp-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com" disabled={loading}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 transition" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : 'Send OTP'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Remember it? <a href="/login" className="text-blue-600 hover:underline font-medium">Back to Login</a>
      </p>
    </div>
  );
}




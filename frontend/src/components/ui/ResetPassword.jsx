import { useState } from 'react';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/services/api';

const strength = (pw) => {
  if (!pw) return { bars: 0, label: '', color: 'bg-gray-200' };
  if (pw.length < 6) return { bars: 1, label: 'Weak', color: 'bg-red-500' };
  if (pw.length < 10) return { bars: 2, label: 'Fair', color: 'bg-yellow-500' };
  return { bars: 3, label: 'Strong', color: 'bg-green-500' };
};

export default function ResetPassword({ email, resetToken, onPasswordReset }) {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const pwStrength = strength(pw);
  const match = pw && confirm && pw === confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pw.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (pw !== confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { email, resetToken, newPassword: pw, confirmPassword: confirm });
      if (data.success) {
        toast.success('Password reset successfully!');
        setTimeout(onPasswordReset, 1200);
      } else {
        toast.error(data.message || 'Reset failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  const inputCls = 'w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 transition';
  const EyeIcon = show ? EyeOff : Eye;

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full mb-3">
          <Lock className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Set New Password</h2>
        <p className="text-sm text-gray-500 mt-1">Create a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type={show ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} disabled={loading} placeholder="Min. 6 characters" className={inputCls} />
            <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <EyeIcon className="w-4 h-4" />
            </button>
          </div>
          {pw && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1 h-1.5">
                {[1, 2, 3].map(i => <div key={i} className={`flex-1 rounded-full transition-colors ${i <= pwStrength.bars ? pwStrength.color : 'bg-gray-200'}`} />)}
              </div>
              <p className="text-xs text-gray-500">Strength: <span className="font-semibold">{pwStrength.label}</span></p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type={show ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} disabled={loading} placeholder="Repeat new password" className={inputCls} />
          </div>
          {confirm && (
            <p className={`text-xs mt-1 font-medium ${match ? 'text-green-600' : 'text-red-500'}`}>
              {match ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}
        </div>

        <button type="submit" disabled={loading || !match}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting…</> : 'Reset Password'}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400">You'll be redirected to login after reset.</p>
    </div>
  );
}




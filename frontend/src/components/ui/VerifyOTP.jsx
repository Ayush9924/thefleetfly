import { useState, useRef, useEffect } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/services/api';

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const EMPTY = ['', '', '', '', '', ''];

export default function VerifyOTP({ email, onOTPVerified }) {
  const [otp, setOtp] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(600);
  const [canResend, setCanResend] = useState(false);
  const refs = useRef([]);

  useEffect(() => {
    const id = setInterval(() => setTimer(t => {
      if (t <= 1) { clearInterval(id); setCanResend(true); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(id);
  }, []);

  const handleChange = (i, val) => {
    if (val.length > 1 || !/^\d*$/.test(val)) return;
    setOtp(prev => { const n = [...prev]; n[i] = val; return n; });
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pasted)) return;
    setOtp(pasted.split('').concat(EMPTY).slice(0, 6));
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp: code });
      if (data.success) { toast.success('OTP verified!'); onOTPVerified(data.resetToken); }
      else toast.error(data.message || 'Invalid OTP');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      if (data.success) { toast.success('OTP resent!'); setTimer(600); setCanResend(false); setOtp(EMPTY); refs.current[0]?.focus(); }
    } catch { toast.error('Failed to resend OTP'); }
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-full mb-3">
          <Clock className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Verify OTP</h2>
        <p className="text-sm text-gray-500 mt-1">Sent to <span className="font-medium text-gray-700">{email}</span></p>
      </div>

      <div className="flex items-center justify-center gap-2 bg-blue-50 py-2 rounded-lg text-sm text-blue-700 font-medium">
        <Clock className="w-4 h-4" /> Expires in <span className="font-bold">{fmt(timer)}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {otp.map((d, i) => (
            <input key={i} ref={el => refs.current[i] = el}
              type="text" inputMode="numeric" maxLength={1} value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              autoFocus={i === 0}
              className="w-11 h-13 text-center text-xl font-bold border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg outline-none transition" />
          ))}
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : 'Verify OTP'}
        </button>
      </form>

      <div className="text-center text-sm border-t border-gray-100 pt-4">
        {canResend
          ? <button onClick={handleResend} className="text-blue-600 hover:underline font-medium">Resend OTP</button>
          : <span className="text-gray-500">Resend available in <span className="font-semibold">{fmt(timer)}</span></span>}
      </div>
    </div>
  );
}




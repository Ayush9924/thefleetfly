import React, { useState, useRef, useEffect } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const VerifyOTP = ({ email, onOTPVerified }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp.concat(Array(6 - newOtp.length).fill('')));
      inputRefs.current[Math.min(pastedData.length, 5)].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter all 6 digits of the OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/verify-otp', { email, otp: otpString });
      
      if (response.data.success) {
        toast.success('OTP verified successfully!');
        if (onOTPVerified) {
          onOTPVerified(response.data.resetToken);
        }
      } else {
        toast.error(response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Verification failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        toast.success('OTP resent successfully!');
        setTimer(600);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      toast.error('Failed to resend OTP');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Verify OTP</h2>
        <p className="text-gray-600 text-sm">
          Enter the 6-digit OTP sent to <span className="font-semibold text-gray-800">{email}</span>
        </p>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <Clock className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium text-blue-900">
          OTP expires in: <span className="font-bold">{formatTime(timer)}</span>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Input Fields */}
        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 hover:border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all duration-300"
              autoFocus={index === 0}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify OTP'
          )}
        </button>
      </form>

      {/* Resend OTP */}
      <div className="text-center pt-4 border-t border-gray-200">
        {canResend ? (
          <button
            onClick={handleResend}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            Resend OTP
          </button>
        ) : (
          <p className="text-sm text-gray-600">
            Didn't receive OTP? Resend available in <span className="font-semibold">{formatTime(timer)}</span>
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default VerifyOTP;

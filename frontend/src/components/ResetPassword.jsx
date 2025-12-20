import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const ResetPassword = ({ email, resetToken, onPasswordReset }) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
    showPassword: false
  });
  const [loading, setLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Check if passwords match
    if (name === 'newPassword' || name === 'confirmPassword') {
      const newPass = name === 'newPassword' ? value : formData.newPassword;
      const confirmPass = name === 'confirmPassword' ? value : formData.confirmPassword;
      setPasswordsMatch(newPass === confirmPass && newPass.length > 0);
    }
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: 'bg-gray-200' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (password.length < 8) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' };
    return { strength: 3, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        email,
        resetToken,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      if (response.data.success) {
        toast.success('Password reset successfully!');
        setTimeout(() => {
          if (onPasswordReset) {
            onPasswordReset();
          }
        }, 1500);
      } else {
        toast.error(response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Reset failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
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
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
        <p className="text-gray-600 text-sm">
          Create a new strong password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New Password Field */}
        <div className="space-y-2">
          <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={formData.showPassword ? "text" : "password"}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              disabled={loading}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
              required
            />
          </div>

          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div className="space-y-2">
              <div className="flex gap-1 h-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-colors ${
                      i <= passwordStrength.strength ? passwordStrength.color : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Strength: <span className="font-semibold">{passwordStrength.label}</span></span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={formData.showPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              disabled={loading}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
              required
            />
          </div>

          {/* Password Match Indicator */}
          {formData.confirmPassword && (
            <div className={`flex items-center gap-2 text-sm ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
              <Check className={`w-4 h-4 ${passwordsMatch ? 'block' : 'hidden'}`} />
              {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
            </div>
          )}
        </div>

        {/* Show Password Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showPassword"
            name="showPassword"
            checked={formData.showPassword}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={loading}
          />
          <label htmlFor="showPassword" className="text-sm text-gray-700 cursor-pointer">
            Show passwords
          </label>
        </div>

        {/* Password Requirements */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-2">
          <h4 className="text-sm font-semibold text-gray-800">Password Requirements:</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${formData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`} />
              At least 6 characters
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              Mix of uppercase and lowercase
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              Include numbers or special characters
            </li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading || !passwordsMatch || !formData.newPassword}
          className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Resetting Password...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-600">
          Your password will be securely updated. You'll be redirected to login.
        </p>
      </div>
    </motion.div>
  );
};

export default ResetPassword;

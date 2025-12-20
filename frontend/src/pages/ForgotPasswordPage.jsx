import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ForgotPassword from '../components/ForgotPassword';
import VerifyOTP from '../components/VerifyOTP';
import ResetPassword from '../components/ResetPassword';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Request, 2: Verify, 3: Reset
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const navigate = useNavigate();

  const handleEmailSent = (userEmail) => {
    setEmail(userEmail);
    setStep(2);
  };

  const handleOTPVerified = (token) => {
    setResetToken(token);
    setStep(3);
  };

  const handlePasswordReset = () => {
    navigate('/login');
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/login');
    }
  };

  const stepConfig = {
    1: { title: 'Request Password Reset', desc: 'Request' },
    2: { title: 'Verify OTP', desc: 'Verify' },
    3: { title: 'Create New Password', desc: 'Reset' }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-2xl bg-white/90 backdrop-blur-xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header with gradient */}
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-8 text-center">
            <div className="text-3xl font-bold text-white mb-4">
              Fleet<span className="text-blue-100">Fly</span>
            </div>
            
            {/* Step Indicator */}
            <div className="flex justify-between items-center gap-2 mt-8">
              {[1, 2, 3].map((stepNum) => (
                <React.Fragment key={stepNum}>
                  <div
                    className={`flex flex-col items-center transition-all ${
                      step >= stepNum ? 'text-white' : 'text-blue-200'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                        step >= stepNum
                          ? 'bg-white text-blue-600'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      {step > stepNum ? '✓' : stepNum}
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap">
                      {stepNum === 1 ? 'Request' : stepNum === 2 ? 'Verify' : 'Reset'}
                    </span>
                  </div>

                  {stepNum < 3 && (
                    <div
                      className={`flex-1 h-1 rounded transition-colors ${
                        step > stepNum ? 'bg-white' : 'bg-blue-500'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Back Button */}
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm mb-6 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ForgotPassword onEmailSent={handleEmailSent} />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <VerifyOTP email={email} onOTPVerified={handleOTPVerified} />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ResetPassword
                    email={email}
                    resetToken={resetToken}
                    onPasswordReset={handlePasswordReset}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

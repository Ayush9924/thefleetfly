import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ForgotPassword from "@/components/ui/ForgotPassword";
import VerifyOTP      from "@/components/ui/VerifyOTP";
import ResetPassword  from "@/components/ui/ResetPassword";


const STEPS = ["Request", "Verify", "Reset"];

const slide = {
  hidden: { opacity: 0, x: 24 },
  show:   { opacity: 1, x: 0,  transition: { duration: 0.3 } },
  exit:   { opacity: 0, x: -24, transition: { duration: 0.25 } },
};

export default function ForgotPasswordPage() {
  const [step,       setStep]       = useState(1);
  const [email,      setEmail]      = useState("");
  const [resetToken, setResetToken] = useState("");
  const navigate = useNavigate();

  const back = () => (step > 1 ? setStep(s => s - 1) : navigate("/login"));

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-600 mb-4">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
          <p className="text-sm text-gray-500 mt-1">Follow the steps below</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Step bar */}
          <div className="px-6 pt-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              {STEPS.map((label, i) => {
                const num  = i + 1;
                const done = step > num;
                const active = step === num;
                return (
                  <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      done ? "bg-green-500 text-white" : active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                    }`}>
                      {done ? "✓" : num}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${active ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
                    {i < STEPS.length - 1 && <div className={`flex-1 h-px ${done ? "bg-green-400" : "bg-gray-200"}`} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {step > 1 && (
              <button onClick={back} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium mb-5 transition-colors">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            )}

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="s1" variants={slide} initial="hidden" animate="show" exit="exit">
                  <ForgotPassword onEmailSent={e => { setEmail(e); setStep(2); }} />
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="s2" variants={slide} initial="hidden" animate="show" exit="exit">
                  <VerifyOTP email={email} onOTPVerified={t => { setResetToken(t); setStep(3); }} />
                </motion.div>
              )}
              {step === 3 && (
                <motion.div key="s3" variants={slide} initial="hidden" animate="show" exit="exit">
                  <ResetPassword email={email} resetToken={resetToken} onPasswordReset={() => navigate("/login")} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

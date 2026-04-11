import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Mail, Lock, Truck } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const fade = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, staggerChildren: 0.08 } },
};

function Field({ id, label, type, placeholder, value, onChange, disabled, Icon }) {
  return (
    <motion.div variants={fade} className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          id={id} type={type} placeholder={placeholder} value={value}
          onChange={onChange} disabled={disabled} autoComplete={id}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition"
        />
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill in all fields");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Invalid email address");

    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        variants={fade} initial="hidden" animate="show"
        className="w-full max-w-sm"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-600 mb-4">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sign in to FleetFly</h1>
          <p className="text-sm text-gray-500 mt-1">Fleet management, simplified</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field id="email"    label="Email"    type="email"    placeholder="admin@fleet.com"  value={email}    onChange={e => setEmail(e.target.value)}    disabled={loading} Icon={Mail} />
            <Field id="password" label="Password" type="password" placeholder="••••••••"         value={password} onChange={e => setPassword(e.target.value)} disabled={loading} Icon={Lock} />

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : "Sign In"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 space-y-3 text-center">
            <p className="text-xs text-gray-400">
              Demo: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">admin@fleet.com</span>{" "}/ <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">admin123</span>
            </p>
            <p className="text-sm text-gray-600">
              No account?{" "}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">Create one</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


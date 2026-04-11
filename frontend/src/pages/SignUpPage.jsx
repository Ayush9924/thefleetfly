import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Mail, Lock, User, Truck, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const fade = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, staggerChildren: 0.07 } },
};

function Field({ id, label, type = "text", placeholder, value, onChange, disabled, Icon, hint }) {
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
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </motion.div>
  );
}

export default function SignUpPage() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState("manager");
  const [loading,  setLoading]  = useState(false);
  const { register } = useAuth();
  const navigate      = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error("Please fill in all fields");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Invalid email address");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");

    setLoading(true);
    try {
      await register(name, email, password, role);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create account");
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
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Start managing your fleet today</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field id="name"     label="Full Name" placeholder="John Smith"      value={name}     onChange={e => setName(e.target.value)}     disabled={loading} Icon={User} />
            <Field id="email"    label="Email"     type="email" placeholder="you@company.com" value={email}    onChange={e => setEmail(e.target.value)}    disabled={loading} Icon={Mail} />
            <Field id="password" label="Password"  type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} Icon={Lock} hint="Minimum 6 characters" />

            <motion.div variants={fade} className="space-y-1.5">
              <label htmlFor="role" className="text-sm font-medium text-gray-700">Role</label>
              <select
                id="role" value={role} onChange={e => setRole(e.target.value)} disabled={loading}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition"
              >
                <option value="manager">Fleet Manager</option>
                <option value="driver">Driver</option>
                <option value="admin">Administrator</option>
              </select>
            </motion.div>

            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : "Create Account"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">Sign in</Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}


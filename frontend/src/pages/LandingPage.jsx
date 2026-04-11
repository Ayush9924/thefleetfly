import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Truck, Users, BarChart3, MapPin, Clock, Shield,
  Github, Linkedin, Youtube,
} from "lucide-react";

// ─── Single reusable animation set ──────────────────────────────────────────
const fade = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 },
  },
};

// ─── Data ────────────────────────────────────────────────────────────────────
const FEATURES = [
  { Icon: Truck,    title: "Vehicle Management",       desc: "Real-time GPS tracking, maintenance scheduling, and full vehicle history." },
  { Icon: Users,    title: "Driver Analytics",         desc: "Monitor behaviour, assign routes, and track performance metrics." },
  { Icon: BarChart3,title: "Advanced Reporting",       desc: "Custom reports on fuel efficiency, cost per mile, and operations." },
  { Icon: MapPin,   title: "Route Optimisation",       desc: "Reduce fuel costs and delivery times with AI route planning." },
  { Icon: Clock,    title: "24 / 7 Monitoring",        desc: "Live alerts and full fleet visibility around the clock." },
  { Icon: Shield,   title: "Enterprise Security",      desc: "Bank-level encryption and industry compliance built in." },
];

const STATS = [
  { value: "500+",   label: "Active Clients" },
  { value: "50 k+",  label: "Vehicles Managed" },
  { value: "99.99%", label: "Platform Uptime" },
  { value: "24 / 7", label: "Global Support" },
];

const FOOTER_LINKS = {
  Product: ["Features", "Pricing", "Integrations", "Roadmap"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Support: ["Help Center", "Documentation", "Community", "Status"],
};

const SOCIALS = [
  { Icon: Linkedin, href: "https://www.linkedin.com/in/aakashkumar19/",        label: "LinkedIn" },
  { Icon: Github,   href: "https://github.com/Ayush9924/thefleetfly",          label: "GitHub" },
  { Icon: Youtube,  href: "https://www.youtube.com/@Fleetio",                  label: "YouTube" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────
function NavBar({ onSignIn }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
        <span className="text-2xl font-bold text-blue-600">Fleet<span className="text-gray-900">Fly</span></span>
        <button
          onClick={onSignIn}
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
        >
          Sign In
        </button>
      </div>
    </nav>
  );
}

function FeatureCard({ Icon, title, desc }) {
  return (
    <motion.div variants={fade} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <h3 className="mb-2 text-base font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function FooterCol({ heading, links }) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-semibold text-white">{heading}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{l}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const goLogin  = () => navigate("/login");
  const DEMO_URL = "https://www.linkedin.com/posts/aakashkumar19_project-showcase-thefleetfly-fleet-ugcPost-7408531823082795008-ZOTo";

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar onSignIn={goLogin} />

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <motion.div
          variants={fade} initial="hidden" animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
          {/* Copy */}
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Transform Your Fleet
              <span className="block text-blue-600">Management</span>
            </h1>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              Real-time tracking, intelligent analytics, and seamless operations — all in one powerful dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={goLogin}
                className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition-colors"
              >
                Get Started Free
              </button>
              <button
                onClick={() => window.open(DEMO_URL, "_blank")}
                className="px-8 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              >
                Watch Demo
              </button>
            </div>
            <p className="mt-6 text-sm text-gray-400">Trusted by 2,500+ fleet companies worldwide.</p>
          </div>

          {/* Mock dashboard card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { Icon: Truck,     value: "127",  label: "Vehicles",  color: "bg-blue-50   text-blue-600"   },
                { Icon: Users,     value: "89",   label: "Drivers",   color: "bg-green-50  text-green-600"  },
                { Icon: BarChart3, value: "94%",  label: "Efficiency",color: "bg-purple-50 text-purple-600" },
              ].map(({ Icon, value, label, color }) => (
                <div key={label} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${color.split(" ")[0]}`}>
                    <Icon className={`h-4 w-4 ${color.split(" ")[1]}`} />
                  </div>
                  <div className="text-xl font-bold text-gray-900">{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-900">Delivery Route #45678</span>
              </div>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">On Time</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Everything Your Fleet Needs</h2>
            <p className="text-base text-gray-500 max-w-2xl mx-auto">
              From vehicle tracking to driver management — the complete solution for modern fleet operations.
            </p>
          </div>
          <motion.div
            variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-center text-3xl lg:text-4xl font-bold text-white mb-12">Trusted by Industry Leaders</h2>
          <motion.div
            variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12"
          >
            {STATS.map(({ value, label }) => (
              <motion.div key={label} variants={fade} className="text-center">
                <div className="text-4xl font-bold text-white mb-1">{value}</div>
                <div className="text-sm text-blue-100">{label}</div>
              </motion.div>
            ))}
          </motion.div>
          <blockquote className="mx-auto max-w-2xl rounded-xl bg-white/10 border border-white/20 p-6 text-center">
            <p className="text-blue-100 italic mb-3">
              "FleetFly reduced our fuel costs by 23% and improved delivery efficiency by 35% in just three months."
            </p>
            <cite className="text-sm font-semibold text-white not-italic">— Sarah Johnson, Operations Director, LogisticsCo</cite>
          </blockquote>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24">
        <motion.div
          variants={fade} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="max-w-2xl mx-auto px-6 text-center"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Ready to Revolutionize Your Fleet?</h2>
          <p className="text-base text-gray-500 mb-8">No credit card required · 14-day free trial.</p>
          <button
            onClick={goLogin}
            className="px-10 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow-lg transition-colors"
          >
            Start Free Trial
          </button>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
            <div className="lg:col-span-2">
              <span className="text-xl font-bold text-blue-400">Fleet<span className="text-white">Fly</span></span>
              <p className="mt-3 mb-5 text-sm text-gray-400 max-w-xs">
                The ultimate fleet management solution. Simplify operations, reduce costs, maximise efficiency.
              </p>
              <div className="flex gap-3">
                {SOCIALS.map(({ Icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 hover:bg-blue-600 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </a>
                ))}
              </div>
            </div>
            {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
              <FooterCol key={heading} heading={heading} links={links} />
            ))}
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">© 2025 FleetFly. All rights reserved.</p>
            <div className="flex gap-6">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l) => (
                <a key={l} href="#" className="text-xs text-gray-500 hover:text-white transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

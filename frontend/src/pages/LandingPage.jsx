import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { Truck, Users, BarChart3, MapPin, Clock, Shield } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="border-b border-gray-200/60 backdrop-blur-sm bg-white/80 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
          >
            Fleet<span className="text-gray-900">Fly</span>
          </motion.div>
          <Button
            onClick={() => navigate("/login")}
            className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Sign In
          </Button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-100 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-100 rounded-full opacity-20"></div>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Transform Your Fleet
              <span className="block bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Management
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl">
              The only fleet management platform you need. Real-time tracking,
              intelligent analytics, and seamless operations—all in one powerful
              dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => navigate("/login")}
                  className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Get Started Free
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 px-8 py-4 text-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                >
                  Watch Demo
                </Button>
              </motion.div>
            </div>

            <div className="flex items-center mt-12 space-x-8">
              <div className="flex -space-x-3">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                  alt="Microsoft"
                  className="w-10 h-10 rounded-full bg-white border-2 border-white shadow-sm object-contain p-1"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg"
                  alt="Amazon"
                  className="w-10 h-10 rounded-full bg-white border-2 border-white shadow-sm object-contain p-1"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                  alt="Google"
                  className="w-10 h-10 rounded-full bg-white border-2 border-white shadow-sm object-contain p-1"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/c/cd/Facebook_logo_%28square%29.png"
                  alt="Facebook"
                  className="w-10 h-10 rounded-full bg-white border-2 border-white shadow-sm object-contain p-1"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Join 2,500+ companies
                </p>
                <p className="text-sm text-gray-500">
                  already optimizing their fleets
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-2xl border border-gray-200/50">
              <div className="absolute inset-0 bg-linear-to-r from-blue-200/10 to-indigo-200/10 rounded-2xl"></div>
              <div className="relative">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                      <Truck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">127</div>
                    <div className="text-xs text-gray-600">Vehicles</div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">89</div>
                    <div className="text-xs text-gray-600">Drivers</div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                      <BarChart3 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">94%</div>
                    <div className="text-xs text-gray-600">Efficiency</div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-gray-900">
                        Delivery Route #45678
                      </span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      On Time
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-xs text-gray-600">
                      Warehouse A → Downtown → Airport
                    </span>
                  </div>
                </div>

                <Truck className="absolute -top-12 -right-8 w-32 h-32 text-blue-300 opacity-20" />
                <Clock className="absolute -bottom-8 -left-6 w-20 h-20 text-indigo-300 opacity-20" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-blue-50/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything Your Fleet Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From vehicle tracking to driver management, we've built the
              complete solution for modern fleet operations.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Truck className="w-8 h-8" />,
                title: "Intelligent Vehicle Management",
                description:
                  "Real-time GPS tracking, maintenance scheduling, and comprehensive vehicle history.",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Driver Performance Analytics",
                description:
                  "Monitor driver behavior, assign routes efficiently, and track performance metrics.",
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Advanced Analytics Dashboard",
                description:
                  "Custom reports on fuel efficiency, cost per mile, and operational insights.",
              },
              {
                icon: <MapPin className="w-8 h-8" />,
                title: "AI-Powered Route Optimization",
                description:
                  "Reduce fuel costs and delivery times with intelligent route planning.",
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "24/7 Real-Time Monitoring",
                description:
                  "Stay informed with live alerts and comprehensive fleet visibility.",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Enterprise-Grade Security",
                description:
                  "Bank-level encryption and compliance with industry security standards.",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="w-14 h-14 bg-linear-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors duration-300">
                    <div className="text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-indigo-600"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Join thousands of companies who have transformed their fleet
              operations with our platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                label: "500+",
                value: "Active Clients",
                gradient: "from-blue-400 to-cyan-400",
              },
              {
                label: "50,000+",
                value: "Vehicles Managed",
                gradient: "from-indigo-400 to-purple-400",
              },
              {
                label: "99.99%",
                value: "Platform Uptime",
                gradient: "from-blue-400 to-indigo-400",
              },
              {
                label: "24/7",
                value: "Global Support",
                gradient: "from-cyan-400 to-blue-400",
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div
                  className={`text-4xl lg:text-5xl font-bold bg-linear-to-r ${stat.gradient} bg-clip-text text-transparent mb-3`}
                >
                  {stat.label}
                </div>
                <div className="text-blue-100 text-lg">{stat.value}</div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-4xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Customer Success Story
                </h3>
              </div>
              <p className="text-blue-100 text-lg italic">
                "FleetPro reduced our fuel costs by 23% and improved delivery
                efficiency by 35% in just three months."
              </p>
              <p className="text-white font-medium mt-4">
                - Sarah Johnson, Operations Director at LogisticsCo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Ready to Revolutionize Your Fleet?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join thousands of companies already optimizing their fleet
            operations with our powerful platform.
          </p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => navigate("/login")}
              className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 text-xl font-semibold shadow-2xl hover:shadow-2xl transition-all duration-300"
            >
              Start Your Free Trial
            </Button>
          </motion.div>
          <p className="text-gray-500 mt-4 text-sm">
            No credit card required • 14-day free trial
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="text-2xl font-bold bg-linear-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                Fleet<span className="text-white">Fly</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The ultimate fleet management solution for modern businesses.
                Simplify operations, reduce costs, and maximize efficiency.
              </p>
              <div className="flex space-x-4">
                {["twitter", "linkedin", "facebook", "instagram"].map(
                  (social) => (
                    <div
                      key={social}
                      className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-300 cursor-pointer"
                    >
                      <div className="w-4 h-4 bg-gray-400 rounded"></div>
                    </div>
                  )
                )}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-6 text-white">Product</h4>
              <ul className="space-y-3">
                {["Features", "Pricing", "Integrations", "Roadmap"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors duration-300"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-6 text-white">Company</h4>
              <ul className="space-y-3">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-6 text-white">Support</h4>
              <ul className="space-y-3">
                {["Help Center", "Documentation", "Community", "Status"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors duration-300"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; 2025 FleetPro. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                (item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
                  >
                    {item}
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

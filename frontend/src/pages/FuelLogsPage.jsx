import { Fuel, TrendingDown, BarChart2, Droplets, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const fade = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { staggerChildren: 0.07 } },
};

const COMING_FEATURES = [
  { Icon: Droplets,     label: "Per-vehicle fuel tracking" },
  { Icon: TrendingDown, label: "Cost & consumption trends" },
  { Icon: BarChart2,    label: "Efficiency benchmarks" },
  { Icon: AlertTriangle,label: "Anomaly detection alerts" },
];

export default function FuelLogsPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div variants={fade} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={fade}>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Fuel className="h-6 w-6 text-green-600" /> Fuel Logs
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Track fuel consumption and costs</p>
        </motion.div>

        <motion.div variants={fade} className="rounded-xl border border-green-100 bg-green-50 p-6 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 mb-4">
            <Fuel className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Fuel Logging — Coming Soon</h2>
          <p className="text-sm text-gray-600 mb-6">
            Detailed fuel tracking and cost analytics are under active development.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {COMING_FEATURES.map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 rounded-lg bg-white border border-green-200 px-4 py-3">
                <Icon className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

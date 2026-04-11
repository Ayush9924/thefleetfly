import { ClipboardList, Truck, Users, Calendar, CheckSquare } from "lucide-react";
import { motion } from "framer-motion";

const fade = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { staggerChildren: 0.07 } },
};

const COMING_FEATURES = [
  { Icon: Truck,       label: "Vehicle–driver assignment" },
  { Icon: Users,       label: "Team scheduling" },
  { Icon: Calendar,    label: "Shift management" },
  { Icon: CheckSquare, label: "Task completion tracking" },
];

export default function AssignmentsPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div variants={fade} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={fade}>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-teal-600" /> Assignments
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage vehicle and driver assignments</p>
        </motion.div>

        <motion.div variants={fade} className="rounded-xl border border-teal-100 bg-teal-50 p-6 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 mb-4">
            <ClipboardList className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Assignment Management — Coming Soon</h2>
          <p className="text-sm text-gray-600 mb-6">
            Intelligent vehicle and driver assignment tools are in development.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {COMING_FEATURES.map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 rounded-lg bg-white border border-teal-200 px-4 py-3">
                <Icon className="h-4 w-4 text-teal-600 shrink-0" />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

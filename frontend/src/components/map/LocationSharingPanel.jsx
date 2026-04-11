import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Wifi, WifiOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useLocationSharing } from '@/hooks/useLocationSharing';

const STATUS_CONFIG = {
  idle:      { color: 'text-gray-400',  bg: 'bg-gray-800',   border: 'border-gray-700', icon: MapPin,        label: 'Not sharing'    },
  requesting:{ color: 'text-blue-400',  bg: 'bg-blue-950',   border: 'border-blue-700', icon: Loader2,       label: 'Requesting GPS…' },
  sharing:   { color: 'text-green-400', bg: 'bg-green-950',  border: 'border-green-700',icon: CheckCircle,   label: 'Sharing live'   },
  denied:    { color: 'text-red-400',   bg: 'bg-red-950',    border: 'border-red-700',  icon: AlertCircle,   label: 'Access denied'  },
  error:     { color: 'text-amber-400', bg: 'bg-amber-950',  border: 'border-amber-700',icon: AlertCircle,   label: 'GPS error'      },
};

/**
 * Driver-facing location sharing control panel.
 * Compact card — drivers toggle sharing with one tap.
 */
export default function LocationSharingPanel() {
  const { isSharing, status, error, currentPosition, startSharing, stopSharing } = useLocationSharing();
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-5 ${cfg.bg} ${cfg.border} shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-gray-900/50 border ${cfg.border}`}>
            <Icon className={`w-5 h-5 ${cfg.color} ${status === 'requesting' ? 'animate-spin' : ''} ${status === 'sharing' ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">Location Sharing</p>
            <p className={`text-xs mt-0.5 ${cfg.color}`}>{cfg.label}</p>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {isSharing ? (
            <motion.div key="live" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <Wifi className="w-4 h-4 text-green-400" />
            </motion.div>
          ) : (
            <motion.div key="off" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <WifiOff className="w-4 h-4 text-gray-600" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Coordinates */}
      <AnimatePresence>
        {currentPosition && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 bg-gray-900/50 rounded-xl p-3 border border-gray-700"
          >
            <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Navigation className="w-3 h-3" /> Current Position
            </p>
            <p className="text-white font-mono text-xs">
              {currentPosition.latitude.toFixed(6)}, {currentPosition.longitude.toFixed(6)}
            </p>
            {currentPosition.accuracy && (
              <p className="text-gray-500 text-[10px] mt-1">Accuracy: ±{Math.round(currentPosition.accuracy)}m</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-amber-400 mb-4 bg-amber-950/50 p-2.5 rounded-lg border border-amber-800">
          {error}
        </motion.p>
      )}

      {/* Toggle button */}
      <button
        onClick={isSharing ? stopSharing : startSharing}
        disabled={status === 'requesting'}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
          isSharing
            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/30'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/30'
        }`}
      >
        {status === 'requesting' && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSharing ? 'Stop Sharing' : 'Start Sharing Location'}
      </button>
    </motion.div>
  );
}

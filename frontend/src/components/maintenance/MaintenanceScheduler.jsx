import { useState } from 'react';
import { X } from 'lucide-react';

const TODAY = new Date().toISOString().split('T')[0];

const INITIAL = {
  vehicle: '', description: '', cost: '', scheduleType: 'one-time',
  frequency: 'monthly', scheduledDate: '', recurrenceEndDate: '',
  maintenanceType: 'routine', estimatedDuration: '', priority: 'medium', notes: ''
};

const fc = (err) => `w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${err ? 'border-red-400 bg-red-50' : 'border-gray-200'}`;

const Err = ({ msg }) => msg ? <p className="text-red-500 text-xs mt-1">{msg}</p> : null;

export function MaintenanceScheduler({ vehicles = [], onSubmit, onCancel, loading = false }) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});

  const set = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.vehicle) e.vehicle = 'Required';
    if (!form.description || form.description.length < 3) e.description = 'At least 3 characters';
    const cost = parseFloat(form.cost);
    if (!form.cost || isNaN(cost) || cost < 0) e.cost = 'Enter a valid positive number';
    if (!form.scheduledDate) e.scheduledDate = 'Required';
    if (form.scheduleType === 'recurring') {
      if (!form.frequency) e.frequency = 'Required';
      if (!form.recurrenceEndDate) e.recurrenceEndDate = 'Required for recurring';
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try { await onSubmit(form); setForm(INITIAL); setErrors({}); } catch {}
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicle */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicle *</label>
          <select name="vehicle" value={form.vehicle} onChange={set} disabled={!vehicles.length} className={fc(errors.vehicle)}>
            <option value="">{vehicles.length ? 'Select vehicle' : 'No vehicles available'}</option>
            {vehicles.map(v => <option key={v._id} value={v._id}>{v.plateNumber} — {v.make} {v.model}</option>)}
          </select>
          <Err msg={errors.vehicle} />
          {!vehicles.length && <p className="text-amber-600 text-xs mt-1">⚠️ Add vehicles before scheduling</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Description *</label>
          <input name="description" value={form.description} onChange={set} placeholder="Oil change, tire rotation…" className={fc(errors.description)} />
          <Err msg={errors.description} />
        </div>

        {/* Cost */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Cost ($) *</label>
          <input type="number" name="cost" value={form.cost} onChange={set} placeholder="0.00" step="0.01" min="0" className={fc(errors.cost)} />
          <Err msg={errors.cost} />
        </div>

        {/* Scheduled Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Scheduled Date *</label>
          <input type="date" name="scheduledDate" value={form.scheduledDate} onChange={set} min={TODAY} className={fc(errors.scheduledDate)} />
          <Err msg={errors.scheduledDate} />
        </div>

        {/* Schedule Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Schedule Type</label>
          <select name="scheduleType" value={form.scheduleType} onChange={set} className={fc()}>
            <option value="one-time">One-Time</option>
            <option value="recurring">Recurring</option>
          </select>
        </div>

        {/* Frequency (conditional) */}
        {form.scheduleType === 'recurring' && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Frequency *</label>
            <select name="frequency" value={form.frequency} onChange={set} className={fc(errors.frequency)}>
              {['daily','weekly','bi-weekly','monthly','quarterly','semi-annual','annual'].map(o => (
                <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
              ))}
            </select>
            <Err msg={errors.frequency} />
          </div>
        )}

        {/* Maintenance Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
          <select name="maintenanceType" value={form.maintenanceType} onChange={set} className={fc()}>
            {['routine','preventive','corrective','predictive'].map(o => (
              <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
          <select name="priority" value={form.priority} onChange={set} className={fc()}>
            {['low','medium','high','critical'].map(o => (
              <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Duration (hrs)</label>
          <input type="number" name="estimatedDuration" value={form.estimatedDuration} onChange={set} placeholder="2" min="0" step="0.5" className={fc()} />
        </div>

        {/* Recurrence End Date (conditional) */}
        {form.scheduleType === 'recurring' && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Recurrence End *</label>
            <input type="date" name="recurrenceEndDate" value={form.recurrenceEndDate} onChange={set} min={form.scheduledDate} className={fc(errors.recurrenceEndDate)} />
            <Err msg={errors.recurrenceEndDate} />
          </div>
        )}
      </div>

      {/* Notes */}
      <textarea name="notes" value={form.notes} onChange={set} placeholder="Additional notes…" rows="2" className={fc()} />

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition">
          {loading ? 'Creating…' : 'Create Schedule'}
        </button>
        <button type="button" onClick={onCancel} disabled={loading}
          className="flex-1 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg disabled:opacity-50 transition flex items-center justify-center gap-1">
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </form>
  );
}




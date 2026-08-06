import { useState, useEffect, useCallback } from 'react';
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { promoAPI } from '../../services/api';

const INITIAL_FORM = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  maxUses: '',
  expiryDate: '',
};

function StatusBadge({ status }) {
  const isActive = status === 'active' || status === true;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive
          ? 'bg-emerald-500/10 text-emerald-500'
          : 'bg-slate-500/10 text-slate-400'
      }`}
    >
      {isActive ? 'Active' : 'Expired'}
    </span>
  );
}

function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return toast.error('Code is required.');
    if (!form.discountValue || Number(form.discountValue) <= 0)
      return toast.error('Discount value must be greater than 0.');
    if (!form.expiryDate) return toast.error('Expiry date is required.');

    setSubmitting(true);
    try {
      await promoAPI.create({
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiryDate: form.expiryDate,
      });
      toast.success('Promo code created successfully!');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create promo code.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-[#060a14] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors';
  const labelClass = 'block text-xs font-medium text-slate-400 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0d1530] border border-white/5 rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-400" />
            <h2 className="text-white font-semibold text-sm">Create Promo Code</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className={labelClass}>Code</label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="e.g. SUMMER20"
              className={inputClass}
              autoComplete="off"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Discount Type</label>
              <select
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Discount Value</label>
              <input
                type="number"
                name="discountValue"
                value={form.discountValue}
                onChange={handleChange}
                placeholder={form.discountType === 'percentage' ? '0–100' : '0.00'}
                className={inputClass}
                min="0"
                step={form.discountType === 'percentage' ? '1' : '0.01'}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Max Uses</label>
              <input
                type="number"
                name="maxUses"
                value={form.maxUses}
                onChange={handleChange}
                placeholder="Unlimited"
                className={inputClass}
                min="1"
              />
            </div>
            <div>
              <label className={labelClass}>Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={form.expiryDate}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm text-slate-400 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating…
                </>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PromoCode() {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchPromoCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await promoAPI.getAll();
      setPromoCodes(res.data?.data ?? res.data ?? []);
    } catch {
      toast.error('Failed to load promo codes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromoCodes();
  }, [fetchPromoCodes]);

  const handleToggle = async (promo) => {
    setTogglingId(promo._id);
    try {
      await promoAPI.toggle(promo._id);
      toast.success(`Promo code ${promo.isActive ? 'deactivated' : 'activated'}.`);
      fetchPromoCodes();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update promo code.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (promo) => {
    if (!window.confirm(`Delete promo code "${promo.code}"? This cannot be undone.`)) return;
    setDeletingId(promo._id);
    try {
      await promoAPI.delete(promo._id);
      toast.success('Promo code deleted.');
      setPromoCodes((prev) => prev.filter((p) => p._id !== promo._id));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete promo code.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDiscount = (promo) => {
    if (promo.discountType === 'percentage') return `${promo.discountValue}%`;
    return `$${Number(promo.discountValue).toFixed(2)}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const resolveStatus = (promo) => {
    if (!promo.isActive) return false;
    if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) return false;
    if (promo.maxUses && promo.usedCount >= promo.maxUses) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-[#060a14] p-6">
      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onCreated={fetchPromoCodes}
        />
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/10 rounded-lg">
            <Tag className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg leading-tight">
              Promo Code Management
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Create and manage discount codes for your users
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Promo Code
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-[#0d1530] border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : promoCodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Tag className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-slate-400 text-sm">No promo codes found.</p>
            <p className="text-slate-600 text-xs mt-1">
              Click "Create Promo Code" to add your first one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                    Code
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                    Discount
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                    Max Uses
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                    Used
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                    Expiry Date
                  </th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {promoCodes.map((promo) => {
                  const active = resolveStatus(promo);
                  const isToggling = togglingId === promo._id;
                  const isDeleting = deletingId === promo._id;
                  return (
                    <tr
                      key={promo._id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-white bg-white/5 px-2 py-0.5 rounded">
                          {promo.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm">
                        {formatDiscount(promo)}
                        <span className="text-slate-500 text-xs ml-1">
                          ({promo.discountType})
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm">
                        {promo.maxUses ?? <span className="text-slate-500">Unlimited</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm">
                        {promo.usedCount ?? 0}
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm">
                        {formatDate(promo.expiryDate)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={active} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle */}
                          <button
                            onClick={() => handleToggle(promo)}
                            disabled={isToggling || isDeleting}
                            title={promo.isActive ? 'Deactivate' : 'Activate'}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              promo.isActive
                                ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                                : 'border-slate-500/20 text-slate-400 bg-slate-500/10 hover:bg-slate-500/20'
                            }`}
                          >
                            {isToggling ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : promo.isActive ? (
                              <ToggleRight className="w-3.5 h-3.5" />
                            ) : (
                              <ToggleLeft className="w-3.5 h-3.5" />
                            )}
                            {promo.isActive ? 'Active' : 'Inactive'}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(promo)}
                            disabled={isDeleting || isToggling}
                            title="Delete promo code"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-rose-600/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {!loading && promoCodes.length > 0 && (
        <p className="text-slate-600 text-xs mt-3 text-right">
          {promoCodes.length} promo code{promoCodes.length !== 1 ? 's' : ''} total
        </p>
      )}
    </div>
  );
}

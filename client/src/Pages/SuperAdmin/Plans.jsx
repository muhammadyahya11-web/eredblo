import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, TrendingUp, X, Loader2 } from "lucide-react";
import { planAPI } from '../../services/api';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';

const statusStyles = {
  active: "bg-green-500/10 text-green-400 border-green-500/20",
  inactive: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function SuperAdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [formData, setFormData] = useState({ name: '', depositAmount: '', dailyProfit: '', duration: '', totalReturn: '', status: 'active' });

  const fetchPlans = async () => {
    try {
      const { data } = await planAPI.getPlans({ page, limit });
      if (data.success) {
        setPlans(data.data);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      }
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, [page, limit]);

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({ name: '', depositAmount: '', dailyProfit: '', duration: '', totalReturn: '', status: 'active' });
    setShowModal(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      depositAmount: plan.depositAmount.toString(),
      dailyProfit: plan.dailyProfit.toString(),
      duration: plan.duration.toString(),
      totalReturn: plan.totalReturn.toString(),
      status: plan.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        depositAmount: parseFloat(formData.depositAmount),
        dailyProfit: parseFloat(formData.dailyProfit),
        duration: parseInt(formData.duration),
        totalReturn: parseFloat(formData.totalReturn),
      };

      if (editingPlan) {
        const { data } = await planAPI.updatePlan(editingPlan._id, payload);
        if (data.success) { toast.success('Plan updated'); setShowModal(false); fetchPlans(); }
        else toast.error(data.message);
      } else {
        const { data } = await planAPI.createPlan(payload);
        if (data.success) { toast.success('Plan created'); setShowModal(false); fetchPlans(); }
        else toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan? This cannot be undone.')) return;
    try {
      const { data } = await planAPI.deletePlan(id);
      if (data.success) { toast.success('Plan deleted'); fetchPlans(); }
      else toast.error(data.message);
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-[#0a0f1e] min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Investment Plans</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all investment plans</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl px-4 py-3 transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.6)] hover:shadow-[0_0_30px_rgba(220,38,38,0.8)] border border-red-500/50 hover:shadow-[0_4px_30px_rgba(220,38,38,0.4)]">
          <Plus size={16} /> Add Plan
        </button>
      </div>

      <div className="glow-panel overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading plans...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-500/10">
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Plan Name</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Min Amount</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Profit</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Duration</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Return</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-slate-400">No plans found. Create your first plan.</td></tr>
                ) : (
                  plans.map((p, idx) => (
                    <tr key={p._id} className={`hover:bg-blue-500/5 transition-all duration-300 border-b border-white/5 last:border-0 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                      <td className="font-medium text-white px-5 py-4">{p.name}</td>
                      <td className="text-slate-300 px-5 py-4">PKR {p.depositAmount?.toLocaleString()}</td>
                      <td className="text-green-400 px-5 py-4">PKR {p.dailyProfit?.toLocaleString()}</td>
                      <td className="text-slate-300 px-5 py-4">{p.duration} Days</td>
                      <td className="text-slate-300 px-5 py-4">PKR {p.totalReturn?.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[p.status] || statusStyles.active}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(p)} className="p-2 rounded-lg hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-all duration-300 border border-transparent hover:border-blue-500/20" title="Edit"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(p._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all duration-300 border border-transparent hover:border-red-500/20" title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        page={page}
        pages={pages}
        total={total}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glow-panel p-6 w-full max-w-md ">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{editingPlan ? 'Edit Plan' : 'Add New Plan'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Plan Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter plan name" required className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Min Deposit (PKR)</label>
                  <input type="number" value={formData.depositAmount} onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })} placeholder="Min" required className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Daily Profit (PKR)</label>
                  <input type="number" value={formData.dailyProfit} onChange={(e) => setFormData({ ...formData, dailyProfit: e.target.value })} placeholder="Daily" required className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Duration (Days)</label>
                  <input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="Days" required className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Total Return (PKR)</label>
                  <input type="number" value={formData.totalReturn} onChange={(e) => setFormData({ ...formData, totalReturn: e.target.value })} placeholder="Total" required className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] focus:outline-none transition-colors">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" disabled={saving} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.6)] hover:shadow-[0_0_30px_rgba(220,38,38,0.8)] border border-red-500/50 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? (<><Loader2 className="animate-spin" size={16} /> Saving...</>) : (editingPlan ? 'Update Plan' : 'Create Plan')}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-[#050810] border border-blue-500/10 text-slate-400 hover:text-white py-3 rounded-xl font-semibold transition-all duration-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

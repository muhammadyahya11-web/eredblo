import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, TrendingUp, X } from "lucide-react";
import { planAPI } from '../../services/api';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
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

  useEffect(() => {
    fetchPlans();
  }, [page, limit]);

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
        if (data.success) {
          toast.success('Plan updated successfully');
          setShowModal(false);
          fetchPlans();
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await planAPI.createPlan(payload);
        if (data.success) {
          toast.success('Plan created successfully');
          setShowModal(false);
          fetchPlans();
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      const { data } = await planAPI.deletePlan(id);
      if (data.success) {
        toast.success('Plan deleted');
        fetchPlans();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-[#0a0f1e] min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Investment Plans</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and configure investment plans</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_12px_rgba(37,99,235,0.35)] hover:shadow-[0_0_22px_rgba(37,99,235,0.55)]">
          <Plus size={18} /> Add Plan
        </button>
      </div>

      <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl overflow-hidden hover:border-blue-500/20 transition-all duration-500">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading plans...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Plan Name</th>
                  <th>Deposit Amount</th>
                  <th>Daily Profit</th>
                  <th>Duration</th>
                  <th>Total Return</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-slate-400">No plans found. Create your first plan.</td></tr>
                ) : (
                  plans.map((p) => (
                    <tr key={p._id} className="hover:bg-blue-500/5 rounded-lg transition-all duration-300">
                      <td className="font-medium text-white">{p.name}</td>
                      <td className="text-slate-300">PKR {p.depositAmount?.toLocaleString()}</td>
                      <td className="text-green-400">PKR {p.dailyProfit?.toLocaleString()}</td>
                      <td>{p.duration} Days</td>
                      <td className="text-slate-300">PKR {p.totalReturn?.toLocaleString()}</td>
                      <td><span className={`status-badge ${p.status === 'active' ? 'success' : 'rejected'}`}>{p.status}</span></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(p)} className="p-2 rounded-lg hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-all">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(p._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all">
                            <Trash2 size={16} />
                          </button>
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1530] border border-blue-500/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{editingPlan ? 'Edit Plan' : 'Add New Plan'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label>Plan Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter plan name" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label>Min Deposit (PKR)</label>
                  <input type="number" value={formData.depositAmount} onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })} placeholder="Min" required />
                </div>
                <div className="form-group">
                  <label>Daily Profit (PKR)</label>
                  <input type="number" value={formData.dailyProfit} onChange={(e) => setFormData({ ...formData, dailyProfit: e.target.value })} placeholder="Daily" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label>Duration (Days)</label>
                  <input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="Days" required />
                </div>
                <div className="form-group">
                  <label>Total Return (PKR)</label>
                  <input type="number" value={formData.totalReturn} onChange={(e) => setFormData({ ...formData, totalReturn: e.target.value })} placeholder="Total" required />
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition-all">{editingPlan ? 'Update' : 'Create'} Plan</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-[#050810] border border-blue-500/10 text-slate-400 hover:text-white py-3 rounded-xl font-semibold transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

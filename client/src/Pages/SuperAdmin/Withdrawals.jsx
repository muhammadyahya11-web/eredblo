import React, { useState, useEffect } from "react";
import { Search, Check, X } from "lucide-react";
import { withdrawalAPI } from '../../services/api';
import toast from 'react-hot-toast';

const statusStyles = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function SuperAdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const fetchWithdrawals = async () => {
    try {
      const params = {};
      if (filter !== 'All') params.status = filter;
      const { data } = await withdrawalAPI.getAll(params);
      if (data.success) setWithdrawals(data.data);
    } catch (error) {
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWithdrawals(); }, [filter]);

  const handleApprove = async (id) => {
    try {
      const { data } = await withdrawalAPI.updateStatus(id, { status: 'Approved' });
      if (data.success) { toast.success('Withdrawal approved'); fetchWithdrawals(); }
      else toast.error(data.message);
    } catch (error) { toast.error('Failed to approve'); }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason (optional):');
    try {
      const { data } = await withdrawalAPI.updateStatus(id, { status: 'Rejected', adminMessage: reason || '' });
      if (data.success) { toast.success('Withdrawal rejected'); fetchWithdrawals(); }
      else toast.error(data.message);
    } catch (error) { toast.error('Failed to reject'); }
  };

  const filtered = filter === "All" ? withdrawals : withdrawals.filter(w => w.status === filter);
  const payoutAmount = (withdrawal) => withdrawal.netAmount ?? Math.round(
    withdrawal.amount * (1 - (withdrawal.feePercentage ?? 3) / 100) * 100
  ) / 100;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-[#0a0f1e] min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Withdrawals</h1>
        <p className="text-slate-400 text-sm mt-1">Review and approve user withdrawals</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {["All", "Pending", "Approved", "Rejected"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border ${
            filter === f 
              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
              : "bg-[#0d1530] text-slate-400 border-blue-500/10 hover:border-blue-500/30 hover:text-white"
          }`}>
            {f}
          </button>
        ))}
      </div>
      <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading withdrawals...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-500/10">
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Method</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</th>
                   <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Payout Amount</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-slate-400">No withdrawals found</td></tr>
                ) : (
                  filtered.map((w, idx) => (
                    <tr key={w._id} className={`hover:bg-blue-500/5 transition-all duration-300 border-b border-white/5 last:border-0 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-white">{w.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-400">{w.user?.email || ''}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-300">{w.paymentMethod}</td>
                      <td className="text-slate-400 px-5 py-4">{w.accountNumber}</td>
                       <td className="text-amber-400 font-medium px-5 py-4">PKR {payoutAmount(w).toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[w.status?.toLowerCase()] || statusStyles.pending}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="text-slate-400 px-5 py-4">{new Date(w.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {w.status === "Pending" && (
                            <>
                              <button onClick={() => handleApprove(w._id)} className="p-2 rounded-lg hover:bg-green-500/10 text-slate-400 hover:text-green-400 transition-all duration-300 border border-transparent hover:border-green-500/20" title="Approve"><Check size={16} /></button>
                              <button onClick={() => handleReject(w._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all duration-300 border border-transparent hover:border-red-500/20" title="Reject"><X size={16} /></button>
                            </>
                          )}
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
    </div>
  );
}

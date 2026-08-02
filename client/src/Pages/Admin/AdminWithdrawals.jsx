import React, { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { withdrawalAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminWithdrawals() {
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

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  const handleApprove = async (id) => {
    try {
      const { data } = await withdrawalAPI.updateStatus(id, { status: 'Approved' });
      if (data.success) {
        toast.success('Withdrawal approved');
        fetchWithdrawals();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason (optional):');
    try {
      const { data } = await withdrawalAPI.updateStatus(id, { status: 'Rejected', adminMessage: reason || '' });
      if (data.success) {
        toast.success('Withdrawal rejected');
        fetchWithdrawals();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    }
  };

  const filtered = filter === "All" ? withdrawals : withdrawals.filter(w => w.status === filter);
  const pendingCount = withdrawals.filter(w => w.status === 'Pending').length;
  const approvedCount = withdrawals.filter(w => w.status === 'Approved').length;
  const rejectedCount = withdrawals.filter(w => w.status === 'Rejected').length;
  const payoutAmount = (withdrawal) => withdrawal.netAmount ?? Math.round(
    withdrawal.amount * (1 - (withdrawal.feePercentage ?? 3) / 100) * 100
  ) / 100;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-[#0a0f1e] min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Withdrawals</h1>
        <p className="text-slate-400 text-sm mt-1">Review and process user withdrawal requests</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Clock className="text-amber-400" size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Pending</p>
            <p className="text-2xl font-bold text-white">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="text-green-400" size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Approved</p>
            <p className="text-2xl font-bold text-white">{approvedCount}</p>
          </div>
        </div>
        <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <XCircle className="text-red-400" size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Rejected</p>
            <p className="text-2xl font-bold text-white">{rejectedCount}</p>
          </div>
        </div>
      </div>

      <div className="table-filters">
        {["All", "Pending", "Approved", "Rejected"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`filter-btn ${filter === f ? "active" : ""}`}>{f}</button>
        ))}
      </div>

      <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl overflow-hidden hover:border-blue-500/20 transition-all duration-500">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading withdrawals...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Method</th>
                  <th>Account</th>
                   <th>Payout Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-slate-400">No withdrawals found</td></tr>
                ) : (
                  filtered.map((w) => (
                    <tr key={w._id} className="hover:bg-blue-500/5 rounded-lg transition-all duration-300">
                      <td>
                        <div>
                          <p className="font-medium text-white">{w.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-400">{w.user?.email || ''}</p>
                        </div>
                      </td>
                      <td>{w.paymentMethod}</td>
                      <td className="text-slate-400">{w.accountNumber}</td>
                       <td className="text-red-400 font-medium">PKR {payoutAmount(w).toLocaleString()}</td>
                      <td><span className={`status-badge ${w.status.toLowerCase()}`}>{w.status}</span></td>
                      <td className="text-slate-400">{new Date(w.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {w.status === "Pending" && (
                            <>
                              <button onClick={() => handleApprove(w._id)} className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/20 transition-all">Approve</button>
                              <button onClick={() => handleReject(w._id)} className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-all">Reject</button>
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

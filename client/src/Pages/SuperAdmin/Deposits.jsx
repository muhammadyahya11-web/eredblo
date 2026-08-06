import React, { useState, useEffect } from "react";
import { Search, Check, X } from "lucide-react";
import { depositAPI } from '../../services/api';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';

const statusStyles = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function SuperAdminDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchDeposits = async () => {
    try {
      const params = { page, limit };
      if (filter !== 'All') params.status = filter;
      const { data } = await depositAPI.getAll(params);
      if (data.success) {
        setDeposits(data.data);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      }
    } catch (error) {
      toast.error('Failed to load deposits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeposits(); }, [filter, page, limit]);

  const handleApprove = async (id) => {
    try {
      const { data } = await depositAPI.updateStatus(id, { status: 'Approved' });
      if (data.success) { toast.success('Deposit approved'); fetchDeposits(); }
      else toast.error(data.message);
    } catch (error) { toast.error('Failed to approve'); }
  };

  const handleReject = (id) => {
    setRejectId(id);
    setRejectReason("");
  };

  const submitReject = async () => {
    if (!rejectId) return;
    try {
      const { data } = await depositAPI.updateStatus(rejectId, { status: 'Rejected', adminMessage: rejectReason });
      if (data.success) { toast.success('Deposit rejected'); fetchDeposits(); }
      else toast.error(data.message);
    } catch (error) { toast.error('Failed to reject'); }
    finally { setRejectId(null); }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-[#0a0f1e] min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Deposits</h1>
        <p className="text-slate-400 text-sm mt-1">Review and approve user deposits</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {["All", "Pending", "Approved", "Rejected"].map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border ${
            filter === f 
              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
              : "bg-[#0d1530] text-slate-400 border-blue-500/10 hover:border-blue-500/30 hover:text-white"
          }`}>
            {f}
          </button>
        ))}
      </div>
      <div className="bg-[#0d1530] border border-blue-500/30 rounded-xl shadow-lg shadow-blue-500/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading deposits...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-500/10">
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Method</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Transaction ID</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deposits.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-slate-400">No deposits found</td></tr>
                ) : (
                  deposits.map((d, idx) => (
                    <tr key={d._id} className={`hover:bg-blue-500/5 transition-all duration-300 border-b border-white/5 last:border-0 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-white">{d.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-400">{d.user?.email || ''}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-300">{d.paymentMethod}</td>
                      <td className="text-green-400 font-medium px-5 py-4">PKR {d.amount?.toLocaleString()}</td>
                      <td className="text-xs text-slate-400 font-mono px-5 py-4">{d.transactionId}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[d.status?.toLowerCase()] || statusStyles.pending}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="text-slate-400 px-5 py-4">{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <a href={d.screenshot} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-all duration-300 border border-transparent hover:border-blue-500/20" title="View Proof"><Check size={16} /></a>
                          {d.status === "Pending" && (
                            <>
                              <button onClick={() => handleApprove(d._id)} className="p-2 rounded-lg hover:bg-green-500/10 text-slate-400 hover:text-green-400 transition-all duration-300 border border-transparent hover:border-green-500/20" title="Approve"><Check size={16} /></button>
                              <button onClick={() => handleReject(d._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all duration-300 border border-transparent hover:border-red-500/20" title="Reject"><X size={16} /></button>
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

      <Pagination
        page={page}
        pages={pages}
        total={total}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0d1530] border border-blue-500/20 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-blue-500/10">
              <h3 className="text-lg font-semibold text-white">Reject Deposit</h3>
              <button onClick={() => setRejectId(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Rejection Reason (Optional)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="w-full bg-[#060a14] border border-blue-500/20 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 min-h-[100px]"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-blue-500/10 bg-[#060a14]/50">
              <button onClick={() => setRejectId(null)} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={submitReject} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-red-500/20">
                Reject Deposit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

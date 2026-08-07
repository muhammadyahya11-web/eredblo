import React, { useState, useEffect } from "react";
import { ShieldOff, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { leaderAPI } from "../../services/api";

const roleBadge = {
  leader: "bg-gradient-to-br from-amber-500 to-yellow-400 text-black shadow-lg shadow-amber-500/30",
  admin: "bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30",
  superadmin: "bg-gradient-to-br from-rose-600 to-red-400 text-white shadow-lg shadow-rose-500/30",
};

export default function SuperAdminLeaders() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaders = async () => {
    try {
      const { data } = await leaderAPI.getAll();
      if (data.success) setLeaders(data.data || []);
    } catch { toast.error("Failed to load leaders"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeaders(); }, []);

  const handleDemote = async (id) => {
    try {
      const { data } = await leaderAPI.demote(id);
      if (data.success) { toast.success(data.message); setLeaders(p => p.filter(l => l._id !== id)); }
      else toast.error(data.message);
    } catch { toast.error("Action failed"); }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#060a14] min-h-full text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Leader Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage platform leaders and their privileges</p>
        </div>
        <button onClick={fetchLeaders} className="p-2 rounded-lg hover:bg-blue-500/10 text-slate-400 hover:text-blue-400" title="Refresh"><RefreshCw size={16} /></button>
      </div>

      <div className="bg-[#0d1530] border border-blue-500/30 shadow-blue-500/15 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-500/10">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Leader</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Referral Code</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Invested</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Earnings</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">Loading leaders…</td></tr>
              ) : leaders.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">No leaders found.</td></tr>
              ) : (
                leaders.map((l, i) => (
                  <tr key={l._id} className={`hover:bg-blue-500/5 transition-all ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${roleBadge[l.role] || roleBadge.admin}`}>{l.name?.[0]?.toUpperCase() || "L"}</div>
                        <div>
                          <p className="font-medium text-white">{l.name}</p>
                          <p className="text-xs text-slate-400">{l.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadge[l.role] || roleBadge.admin}`}>{l.role}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-300 font-mono">{l.referralCode || "-"}</td>
                    <td className="px-5 py-3 text-green-400 font-medium">PKR {(l.totalInvestment || 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-blue-400 font-medium">PKR {(l.totalEarnings || 0).toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDemote(l._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400" title="Demote"><ShieldOff size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Landmark, TrendingUp, DollarSign, Wallet, RefreshCw, BarChart3 } from "lucide-react";
import toast from "react-hot-toast";
import { walletAPI } from "../../services/api";

export default function SuperAdminWallet() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const { data } = await walletAPI.getOverview();
      if (data.success) setOverview(data.data);
    } catch { toast.error("Failed to load wallet overview"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOverview(); }, []);

  if (loading || !overview) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[80vh] text-slate-400">
        <RefreshCw className="animate-spin mr-2" size={22} /> Loading wallet overview…
      </div>
    );
  }

  const statCards = [
    { label: "Total Deposits", value: overview.totalDeposits, prefix: "PKR ", icon: <Landmark size={22} className="text-white" />, gradient: "from-blue-500 to-cyan-400", glow: "rgba(59,130,246,0.35)" },
    { label: "Total Withdrawals", value: overview.totalWithdrawals, prefix: "PKR ", icon: <DollarSign size={22} className="text-white" />, gradient: "from-red-500 to-rose-400", glow: "rgba(239,68,68,0.35)" },
    { label: "Net Balance", value: overview.netBalance, prefix: "PKR ", icon: <Wallet size={22} className="text-white" />, gradient: "from-emerald-500 to-green-400", glow: "rgba(34,197,94,0.35)" },
    { label: "Pending Withdrawals", value: overview.pendingWithdrawals, prefix: "PKR ", icon: <TrendingUp size={22} className="text-white" />, gradient: "from-amber-500 to-yellow-400", glow: "rgba(245,158,11,0.35)" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#060a14] min-h-full text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Wallet Management</h1>
          <p className="text-slate-400 text-sm mt-1">Platform financial overview and liquidity</p>
        </div>
        <button onClick={fetchOverview} className="p-2 rounded-lg hover:bg-blue-500/10 text-slate-400 hover:text-blue-400"><RefreshCw size={16} /></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => (
          <div key={i} className="bg-[#0d1530] border border-blue-500/30 shadow-blue-500/15 rounded-xl p-5 flex items-center justify-between hover:border-blue-500/40 hover:shadow-blue-500/25 transition-all">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 font-medium mb-2">{c.label}</p>
              <p className="text-xl font-bold text-white">RS {(c.value || 0).toLocaleString()}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-lg`} style={{ boxShadow: `0 0 18px ${c.glow}` }}>
              {c.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0d1530] border border-blue-500/30 shadow-blue-500/15 rounded-xl p-5">
        <h2 className="font-semibold text-white flex items-center gap-2 mb-4"><BarChart3 size={18} className="text-cyan-400" /> Wallet Health</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-[#050810] border border-blue-500/10 rounded-lg">
            <span className="text-slate-300">Platform Liquidity (Net)</span>
            <span className="text-emerald-400 font-bold">RS {(overview.netBalance || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#050810] border border-blue-500/10 rounded-lg">
            <span className="text-slate-300">ROI Paid to Users</span>
            <span className="text-blue-400 font-bold">RS {(overview.totalProfit || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-[#050810] border border-blue-500/10 rounded-lg">
            <span className="text-slate-300">Withdrawal Reserve Ratio</span>
            <span className="text-amber-400 font-bold">{(overview.reserveRatio ?? "—")}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Wallet, Users } from "lucide-react";
import { earningsAPI } from "../../services/api";

function CountUp({ end, prefix = "" }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null, frame;
    const target = Number(end) || 0;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / 1200, 1);
      setValue(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) frame = requestAnimationFrame(step); else setValue(target);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [end]);
  return <span>{prefix}{value.toLocaleString()}</span>;
}

const cardGlowColors = {
  amber: { shadow: "shadow-[0_0_30px_rgba(245,158,11,0.3)]", border: "group-hover:border-amber-500/40" },
  green: { shadow: "shadow-[0_0_30px_rgba(34,197,94,0.3)]", border: "group-hover:border-green-500/40" },
  purple: { shadow: "shadow-[0_0_30px_rgba(168,85,247,0.3)]", border: "group-hover:border-purple-500/40" },
  blue: { shadow: "shadow-[0_0_30px_rgba(59,130,246,0.3)]", border: "group-hover:border-blue-500/40" },
};

const statusStyles = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function SuperAdminEarnings() {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const { data } = await earningsAPI.getPlatformEarnings();
        if (data.success) setEarnings(data.data);
      } catch (error) {
        console.error('Failed to load earnings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  const cards = earnings ? [
    { label: "Total Earnings", value: earnings.totalEarnings || 0, prefix: "RS ", icon: Wallet, color: "from-amber-600 to-amber-400", glow: "amber" },
    { label: "Total Investment", value: earnings.totalInvestment || 0, prefix: "RS ", icon: TrendingUp, color: "from-green-600 to-green-400", glow: "green" },
    { label: "Total Withdrawals", value: earnings.totalWithdrawals || 0, prefix: "RS ", icon: DollarSign, color: "from-purple-600 to-purple-400", glow: "purple" },
    { label: "Recent Profit Txns", value: earnings.recentTransactions?.length || 0, prefix: "", icon: Users, color: "from-blue-600 to-blue-400", glow: "blue" },
  ] : [];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-[#0a0f1e] min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Earnings</h1>
        <p className="text-slate-400 text-sm mt-1">Platform earnings overview</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-slate-400">
            <TrendingUp className="animate-spin" size={20} />
            <span>Loading earnings data...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {cards.map((s, i) => (
              <div key={i} className={`group relative bg-[#0d1530] border border-blue-500/10 rounded-xl p-5 flex items-center gap-4 hover:-translate-y-1 hover:${cardGlowColors[s.glow]?.border} ${cardGlowColors[s.glow]?.shadow} transition-all duration-300 overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <div className={`bg-gradient-to-br ${s.color} w-[52px] h-[52px] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-all duration-300`}>
                  <s.icon size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
                  <p className="text-xl font-bold text-white leading-tight"><CountUp end={s.value} prefix={s.prefix} /></p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-blue-500/10">
              <h2 className="font-semibold text-white text-base">Recent Profit Transactions</h2>
            </div>
            {earnings?.recentTransactions?.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No profit transactions yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-500/10">
                      <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings?.recentTransactions?.map((tx, idx) => (
                      <tr key={tx._id} className={`hover:bg-blue-500/5 transition-all duration-300 border-b border-white/5 last:border-0 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                        <td className="font-medium text-white px-5 py-4">{tx.user?.name || 'Unknown'}</td>
                        <td className="text-green-400 px-5 py-4">+ PKR {tx.amount?.toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[tx.status?.toLowerCase()] || "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="text-slate-400 px-5 py-4">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

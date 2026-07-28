import React, { useState, useEffect } from "react";
import { Shield, Users, UserCheck, DollarSign, TrendingUp, Wallet, Activity, UserX } from "lucide-react";
import { adminAPI, earningsAPI } from "../../services/api";

function CountUp({ end, prefix = "", suffix = "" }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let startTime = null;
    let frameId;
    const target = Number(end) || 0;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 1200, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) frameId = requestAnimationFrame(step);
      else setValue(target);
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [end]);
  return <span>{prefix}{value.toLocaleString()}{suffix}</span>;
}

const cardGlowColors = {
  blue: { shadow: "shadow-[0_0_30px_rgba(59,130,246,0.3)]", border: "group-hover:border-blue-500/40" },
  red: { shadow: "shadow-[0_0_30px_rgba(239,68,68,0.3)]", border: "group-hover:border-red-500/40" },
  green: { shadow: "shadow-[0_0_30px_rgba(34,197,94,0.3)]", border: "group-hover:border-green-500/40" },
  amber: { shadow: "shadow-[0_0_30px_rgba(245,158,11,0.3)]", border: "group-hover:border-amber-500/40" },
  purple: { shadow: "shadow-[0_0_30px_rgba(168,85,247,0.3)]", border: "group-hover:border-purple-500/40" },
};

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0, totalAdmins: 0, activeUsers: 0, blockedUsers: 0,
    totalBalance: 0, totalInvestment: 0, totalEarnings: 0, totalWithdrawals: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await adminAPI.getStats();
        if (data.success) setStats(data.data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "from-blue-600 to-blue-400", glow: "blue" },
    { label: "Total Admins", value: stats.totalAdmins, icon: UserCheck, color: "from-red-600 to-red-400", glow: "red" },
    { label: "Total Investment", value: stats.totalInvestment, prefix: "RS ", icon: DollarSign, color: "from-green-600 to-green-400", glow: "green" },
    { label: "Platform Earnings", value: stats.totalEarnings, prefix: "RS ", icon: Wallet, color: "from-amber-600 to-amber-400", glow: "amber" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-[#0a0f1e] min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Super Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Complete platform control and oversight</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-slate-400">
            <Activity className="animate-spin" size={20} />
            <span>Loading dashboard...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {cards.map((s, i) => (
              <div key={i} className={`group relative bg-[#0d1530] border border-blue-500/10 rounded-xl p-5 flex items-center gap-4 hover:-translate-y-1 hover:${cardGlowColors[s.glow]?.border} ${cardGlowColors[s.glow]?.shadow} transition-all duration-300 cursor-pointer overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <div className={`bg-gradient-to-br ${s.color} w-[52px] h-[52px] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-all duration-300`}>
                  <s.icon size={24} className="text-white" />
                </div>
                <div className="relative z-10">
                  <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
                  <p className="text-xl font-bold text-white leading-tight"><CountUp end={s.value} prefix={s.prefix} /></p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="col-span-1 lg:col-span-7 bg-[#0d1530] border border-blue-500/10 rounded-xl p-5">
              <h2 className="font-semibold text-white text-base tracking-tight mb-5">Account Overview</h2>
              <div className="space-y-4">
                {[
                  { label: "Active Accounts", value: stats.activeUsers, icon: Activity, tone: "text-green-400", bg: "bg-green-500/10", glow: "green" },
                  { label: "Blocked Accounts", value: stats.blockedUsers, icon: UserX, tone: "text-red-400", bg: "bg-red-500/10", glow: "red" },
                  { label: "Total Admins", value: stats.totalAdmins, icon: Shield, tone: "text-amber-400", bg: "bg-amber-500/10", glow: "amber" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-[#050810] border border-blue-500/10 rounded-xl hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center`}>
                        <item.icon size={18} className={item.tone} />
                      </div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                    </div>
                    <span className="text-lg font-bold text-white">{Number(item.value).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-1 lg:col-span-5 bg-[#0d1530] border border-blue-500/10 rounded-xl p-5 flex flex-col gap-5">
              <h2 className="font-semibold text-white text-base tracking-tight">Financial Summary</h2>
              <div className="space-y-4">
                {[
                  { label: "Total Balance", value: stats.totalBalance, icon: Wallet },
                  { label: "Total Investment", value: stats.totalInvestment, icon: TrendingUp },
                  { label: "Total Withdrawals", value: stats.totalWithdrawals, icon: DollarSign },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-[#050810] border border-blue-500/10 rounded-xl hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <item.icon size={18} className="text-blue-400" />
                      </div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                    </div>
                    <span className="text-sm font-semibold text-green-400">RS {Number(item.value).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

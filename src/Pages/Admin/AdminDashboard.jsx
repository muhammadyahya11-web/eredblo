import React, { useState, useEffect, useContext } from "react";
import { Shield, Users, DollarSign, TrendingUp, Wallet, Activity } from "lucide-react";
import { AuthContext } from '../../context/AuthContext';
import { adminAPI, transactionAPI, depositAPI, withdrawalAPI } from '../../services/api';

function CountUp({ end, prefix = "", suffix = "" }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let startTime = null;
    let frameId;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 1200, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * end));
      if (progress < 1) frameId = requestAnimationFrame(step);
      else setValue(end);
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [end]);
  return <span>{prefix}{value.toLocaleString()}{suffix}</span>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, txRes, usersRes] = await Promise.all([
          adminAPI.getStats(),
          transactionAPI.getAll({ limit: 5 }),
          adminAPI.getUsers({ limit: 5 }),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data);
        if (txRes.data.success) setRecentTransactions(txRes.data.data);
        if (usersRes.data.success) setRecentUsers(usersRes.data.data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = stats ? [
    { label: "Total Users", value: stats.totalUsers || 0, icon: Users, color: "from-blue-600 to-blue-400" },
    { label: "Total Deposits", value: stats.totalInvestment || 0, prefix: "RS ", icon: DollarSign, color: "from-green-600 to-green-400" },
    { label: "Total Withdrawals", value: stats.totalWithdrawals || 0, prefix: "RS ", icon: TrendingUp, color: "from-purple-600 to-purple-400" },
    { label: "Platform Earnings", value: stats.totalEarnings || 0, prefix: "RS ", icon: Wallet, color: "from-amber-600 to-amber-400" },
  ] : [];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-[#0a0f1e] min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Platform overview and management</p>
      </div>

      {loading ? (
        <div className="loading-state">Loading dashboard...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {statCards.map((s, i) => (
              <div key={i} className="group relative bg-[#0d1530] border border-blue-500/10 rounded-xl p-5 flex items-center gap-4 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-[0_0_25px_rgba(59,130,246,0.12)] transition-all duration-300 cursor-pointer overflow-hidden">
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
            <div className="col-span-1 lg:col-span-7 bg-[#0d1530] border border-blue-500/10 rounded-xl p-5 hover:border-blue-500/20 hover:shadow-[0_0_25px_rgba(59,130,246,0.08)] transition-all duration-500">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-white text-base tracking-tight">Recent Users</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {recentUsers.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-4 text-slate-400">No users found</td></tr>
                    ) : (
                      recentUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-blue-500/5 rounded-lg transition-all duration-300">
                          <td className="font-medium">{u.name}</td>
                          <td className="text-slate-400">{u.email}</td>
                          <td><span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400">{u.role}</span></td>
                          <td><span className={`status-badge ${u.status === 'active' ? 'success' : 'rejected'}`}>{u.status}</span></td>
                          <td className="text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-5 bg-[#0d1530] border border-blue-500/10 rounded-xl p-5 flex flex-col gap-5 hover:border-blue-500/20 hover:shadow-[0_0_25px_rgba(59,130,246,0.08)] transition-all duration-500">
              <h2 className="font-semibold text-white text-base tracking-tight">Recent Transactions</h2>
              <div className="space-y-3">
                {recentTransactions.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">No transactions yet</p>
                ) : (
                  recentTransactions.map((tx) => (
                    <div key={tx._id} className="flex items-center justify-between p-3 bg-[#050810] border border-blue-500/10 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-white">{tx.type}</p>
                        <p className="text-xs text-slate-400">{tx.user?.name || 'Unknown'}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${tx.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.isPositive ? '+' : '-'} PKR {tx.amount?.toLocaleString()}
                        </p>
                        <span className={`text-xs ${tx.status === 'Approved' || tx.status === 'Success' ? 'text-green-400' : 'text-amber-400'}`}>{tx.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

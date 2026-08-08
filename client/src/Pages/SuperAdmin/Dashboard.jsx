import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users, UserCheck, UserPlus, Wallet, ArrowDownToLine, Clock,
  CircleDollarSign, Landmark, Download, Activity, Box, TrendingUp, CheckCircle2,
  Eye, Edit, Trash2
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, CartesianGrid, LineChart, Line, Legend
} from "recharts";
import { superAdminAPI } from "../../services/api";

/* ── Animated number ── */
function CountUp({ end, prefix = "", suffix = "" }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let startTime = null, frameId;
    const target = Number(end) || 0;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / 1200, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.floor(eased * target));
      if (p < 1) frameId = requestAnimationFrame(step);
      else setValue(target);
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [end]);
  return <span>{prefix}{value.toLocaleString()}{suffix}</span>;
}

const Card = ({ children, className = "" }) => (
  <div className={`bg-[#0d1530] border border-blue-500/30 rounded-xl shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 hover:border-blue-500/40 transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const KpiCard = ({ label, value, icon: Icon, tone, prefix, suffix }) => {
  const colors = {
    blue: "text-blue-400 bg-gradient-to-br from-blue-500/20 to-blue-500/10 shadow-lg shadow-blue-500/30",
    green: "text-emerald-400 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 shadow-lg shadow-emerald-500/30",
    purple: "text-purple-400 bg-gradient-to-br from-purple-500/20 to-purple-500/10 shadow-lg shadow-purple-500/30",
    orange: "text-orange-400 bg-gradient-to-br from-orange-500/20 to-orange-500/10 shadow-lg shadow-orange-500/30",
    red: "text-rose-400 bg-gradient-to-br from-rose-500/20 to-rose-500/10 shadow-lg shadow-rose-500/30",
  };
  
  return (
    <Card className="p-5 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-white">
            <CountUp end={value} prefix={prefix} suffix={suffix} />
          </h3>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colors[tone]}`}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );
};

export default function SuperAdminDashboard() {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await superAdminAPI.getDashboardSummary();
        if (data.success) {
          setSummaryData(data.data);
        }
      } catch (error) {
        console.error("Failed to load dashboard summary", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading || !summaryData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Activity className="animate-spin text-blue-500" size={30} />
      </div>
    );
  }

  const {
    kpis: stats,
    chartData,
    topInvestors,
    depositMethods,
    recentTransactions,
    recentUsers,
  } = summaryData;

  const recentActivities = (recentTransactions || []).map((tx) => ({
    icon: CircleDollarSign,
    bg: "bg-emerald-500/15",
    color: "text-emerald-400",
    text: `${tx.type}${tx.user?.name ? ` — ${tx.user.name}` : ""}`,
    sub: tx.status || "Completed",
    amount: tx.amount,
    time: new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto text-white">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Welcome back, Super Admin! Here's what's happening with your platform today.</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <KpiCard label="Total Users" value={stats.totalUsers} icon={Users} tone="blue" />
        <KpiCard label="Active Users" value={stats.activeUsers} icon={UserCheck} tone="green" />
        <KpiCard label="New Registrations (7 days)" value={stats.newRegistrations} icon={UserPlus} tone="purple" />
        <KpiCard label="Total Deposits" value={stats.totalDeposits} icon={Wallet} tone="orange" prefix="PKR " />
        
        <KpiCard label="Total Withdrawals" value={stats.totalWithdrawals} icon={Box} tone="red" prefix="PKR " />
        <KpiCard label="Pending Withdrawals" value={stats.pendingWithdrawals} icon={Clock} tone="orange" prefix="PKR " />
        <KpiCard label="Today's Profit Given" value={stats.todaysProfit} icon={CircleDollarSign} tone="green" prefix="PKR " />
        <KpiCard label="User Wallet Balance" value={stats.companyBalance} icon={Landmark} tone="blue" prefix="PKR " />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        <Card className="p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg">Deposit vs Withdrawal</h2>
            <span className="text-xs text-slate-400 border border-white/10 rounded-lg px-3 py-1.5">Last 7 days</span>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${(val / 1000).toFixed(1)}K` : val} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }} />
                <Line type="monotone" name="Deposits" dataKey="deposit" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                <Line type="monotone" name="Withdrawals" dataKey="withdrawal" stroke="#ef4444" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg">Registration Overview</h2>
            <span className="text-xs text-slate-400 border border-white/10 rounded-lg px-3 py-1.5">Last 7 days</span>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" dot={{r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#0f172a'}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Top Investors</h2>
            <Link to="/super-admin/users" className="text-sm text-blue-500 hover:text-blue-400 font-medium">View all users</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-white/5">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">Username</th>
                  <th className="pb-3 font-medium">Total Investment</th>
                  <th className="pb-3 font-medium">Total ROI</th>
                  <th className="pb-3 font-medium">Total Withdrawal</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-white/5">
                {topInvestors.map((investor) => (
                  <tr key={investor.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 text-slate-400">{investor.id}</td>
                    <td className="py-4 font-medium text-slate-200">{investor.username}</td>
                    <td className="py-4 font-semibold text-emerald-400">PKR {investor.invest.toLocaleString()}</td>
                    <td className="py-4 font-semibold text-blue-400">PKR {investor.roi.toLocaleString()}</td>
                    <td className="py-4 font-semibold text-orange-400">PKR {investor.withdrawal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-lg">Deposit Methods</h2>
            <span className="text-xs text-slate-400 border border-white/10 rounded-lg px-2 py-1">All approved deposits</span>
          </div>
          <div className="h-[200px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={depositMethods} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                  {depositMethods.map((entry, index) => {
                    const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
                    return <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />;
                  })}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value}%`}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-2">
            {depositMethods.map((method, idx) => {
              const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
              return (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: method.color || PIE_COLORS[idx % PIE_COLORS.length] }}></div>
                  <span className="text-slate-300">{method.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-emerald-400 block">{method.value}%</span>
                  <span className="text-[10px] text-slate-500">PKR {method.amount?.toLocaleString()}</span>
                </div>
              </div>
            )})}
          </div>
        </Card>

      </div>

      {/* Lower Row - Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        <Card className="p-5">
          <h2 className="font-semibold text-lg mb-4">System Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Users size={16} className="text-blue-500" />
                <span className="text-sm text-slate-300">Online Users</span>
              </div>
              <span className="font-bold text-white">{stats.activeUsers}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="text-sm text-slate-300">System Status</span>
              </div>
              <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Healthy</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Activity size={16} className="text-blue-500" />
                <span className="text-sm text-slate-300">Server Load</span>
              </div>
              <span className="font-bold text-white">Normal</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Landmark size={16} className="text-purple-500" />
                <span className="text-sm text-slate-300">Total Revenue</span>
              </div>
              <span className="font-bold text-white">PKR {stats.totalRevenue?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div className="flex items-center gap-3">
                <TrendingUp size={16} className="text-orange-500" />
                <span className="text-sm text-slate-300">Total Profit</span>
              </div>
              <span className="font-bold text-white">PKR {stats.totalProfit?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <CircleDollarSign size={16} className="text-rose-500" />
                <span className="text-sm text-slate-300">Total ROI Paid</span>
              </div>
              <span className="font-bold text-white">PKR {stats.totalROIPaid?.toLocaleString() || 0}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Recent Transactions</h2>
            <a href="#" className="text-sm text-blue-500 hover:text-blue-400 font-medium">View All</a>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((tx, idx) => {
              const Icon = tx.type === 'Deposit' ? Download : tx.type === 'Withdrawal' ? ArrowDownToLine : tx.type === 'Profit' ? CircleDollarSign : Activity;
              const colorClass = tx.type === 'Deposit' ? 'text-emerald-500' : tx.type === 'Withdrawal' ? 'text-rose-500' : 'text-purple-500';
              return (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white/5 ${colorClass}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{tx.type}</p>
                    <p className="text-[11px] text-slate-400">{tx.user?.name || 'Unknown'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">PKR {tx.amount?.toLocaleString()}</p>
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      tx.status === 'Approved' || tx.status === 'Success' ? 'text-emerald-500 bg-emerald-500/10' : 'text-orange-500 bg-orange-500/10'
                    }`}>
                      {tx.status}
                    </span>
                    <span className="text-[10px] text-slate-500">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Recent Activities</h2>
            <a href="#" className="text-sm text-blue-500 hover:text-blue-400 font-medium">View All</a>
          </div>
          <div className="space-y-3">
            {recentActivities.map((act, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <div className={`p-2 rounded-lg ${act.bg} ${act.color}`}>
                  <act.icon size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">{act.text}</p>
                  <p className="text-[11px] text-slate-400">{act.sub}</p>
                </div>
                <div className="text-right">
                  {act.amount && <p className="text-xs font-semibold text-emerald-400">PKR {act.amount.toLocaleString()}</p>}
                  <span className="text-[10px] text-slate-500">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* Bottom Row - Users Table */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Last 10 Registered Users</h2>
          <a href="#" className="text-sm text-blue-500 hover:text-blue-400 font-medium">View All</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="text-xs text-slate-400 border-b border-white/5 bg-white/[0.02]">
                <th className="p-3 font-medium rounded-tl-lg">Name</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Phone</th>
                <th className="p-3 font-medium">Joined Date</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-center rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5">
              {recentUsers.map((user) => (
                <tr key={user._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3 text-slate-400">{user.name}</td>
                  <td className="p-3 font-medium text-slate-200">{user.email}</td>
                  <td className="p-3 text-slate-400">{user.phone}</td>
                  <td className="p-3 text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded ${user.status === 'active' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 rounded-md bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors" title="View">
                        <Eye size={14} />
                      </button>
                      <button className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors" title="Edit">
                        <Edit size={14} />
                      </button>
                      <button className="p-1.5 rounded-md bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors" title="Block/Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-white/5 text-xs text-slate-500">
        <p>© 2024 ERED BLOO. All rights reserved.</p>
        <p>Super Admin Panel v2.0.0</p>
      </div>

    </div>
  );
}

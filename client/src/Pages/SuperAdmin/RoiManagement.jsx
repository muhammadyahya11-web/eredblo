import React, { useState, useEffect } from "react";
import { RefreshCw, TrendingUp, BarChart3, Wallet, DollarSign, Package } from "lucide-react";
import { investmentAPI } from "../../services/api";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";

export default function SuperAdminRoiManagement() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ active: 0, completed: 0, totalInvested: 0, totalProfit: 0 });

  const fetchInvestments = async () => {
    try {
      const { data } = await investmentAPI.getAll({ limit: 100 });
      if (data.success) setInvestments(data.data || []);
    } catch {
      console.error("Failed to load investments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  useEffect(() => {
    if (investments.length) {
      const inv = investments.filter(i => i.status === "active");
      const comp = investments.filter(i => i.status === "completed");
      const invested = investments.reduce((a, i) => a + (i.amount || 0), 0);
      const profit = investments.reduce((a, i) => a + (i.profitEarned || 0), 0);
      setSummary({ active: inv.length, completed: comp.length, totalInvested: invested, totalProfit: profit });
    }
  }, [investments]);

  const roiData = investments.slice().reverse().map((i) => ({
    day: i.plan?.name || "Plan",
    invested: i.amount || 0,
    profit: i.profitEarned || 0,
  }));

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#060a14] min-h-full text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ROI Management</h1>
          <p className="text-slate-400 text-sm mt-1">Track investment performance and return on investment</p>
        </div>
        <button onClick={fetchInvestments} className="p-2 rounded-lg hover:bg-blue-500/10 text-slate-400 hover:text-blue-400"><RefreshCw size={16} /></button>
      </div>

      {loading && (
        <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
          <RefreshCw className="animate-spin mr-2" size={22} /> Loading ROI data…
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0d1530] border border-blue-500/30 shadow-blue-500/15 rounded-xl p-5 flex items-center gap-4 hover:border-blue-500/40 hover:shadow-blue-500/25 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/35"><Package size={22} className="text-white" /></div>
              <div className="flex-1"><p className="text-xs text-slate-400">Active Investments</p><p className="text-xl font-bold">{summary.active}</p></div>
            </div>
            <div className="bg-[#0d1530] border border-blue-500/30 shadow-blue-500/15 rounded-xl p-5 flex items-center gap-4 hover:border-blue-500/40 hover:shadow-blue-500/25 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-500/35"><TrendingUp size={22} className="text-white" /></div>
              <div className="flex-1"><p className="text-xs text-slate-400">Completed</p><p className="text-xl font-bold">{summary.completed}</p></div>
            </div>
            <div className="bg-[#0d1530] border border-blue-500/30 shadow-blue-500/15 rounded-xl p-5 flex items-center gap-4 hover:border-blue-500/40 hover:shadow-blue-500/25 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-purple-500/35"><Wallet size={22} className="text-white" /></div>
              <div className="flex-1"><p className="text-xs text-slate-400">Total Invested</p><p className="text-xl font-bold">PKR {summary.totalInvested.toLocaleString()}</p></div>
            </div>
            <div className="bg-[#0d1530] border border-blue-500/30 shadow-blue-500/15 rounded-xl p-5 flex items-center gap-4 hover:border-blue-500/40 hover:shadow-blue-500/25 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/35"><DollarSign size={22} className="text-black" /></div>
              <div className="flex-1"><p className="text-xs text-slate-400">Total ROI Profit</p><p className="text-xl font-bold text-emerald-400">PKR {summary.totalProfit.toLocaleString()}</p></div>
            </div>
          </div>

          <div className="bg-[#0d1530] border border-blue-500/30 shadow-blue-500/15 rounded-xl p-5">
            <h2 className="font-semibold text-white flex items-center gap-2 mb-4"><BarChart3 size={18} className="text-cyan-400" /> Investment Performance</h2>
            <div className="h-[260px]">
              {roiData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500">No investment data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={roiData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0d1530", border: "1px solid #1e2d4a", borderRadius: "8px" }} />
                    <Line type="monotone" name="Invested" dataKey="invested" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" name="Profit Earned" dataKey="profit" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  RefreshCw,
  Loader2,
  Play,
  CheckCircle2,
  CircleDollarSign,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { transactionAPI, investmentAPI } from "../../services/api";

/* ─────────────────────────────────────────────
   Animated counter
───────────────────────────────────────────── */
function CountUp({ end, prefix = "", suffix = "" }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let startTime = null,
      frameId;
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
  return (
    <span>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Toast notification
───────────────────────────────────────────── */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success:
      "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
    error: "bg-red-500/20 border-red-500/40 text-red-300",
    info: "bg-blue-500/20 border-blue-500/40 text-blue-300",
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-xl border shadow-2xl backdrop-blur-sm max-w-sm animate-fade-in ${styles[type]}`}
    >
      {type === "success" ? (
        <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5" />
      ) : (
        <Activity size={20} className="flex-shrink-0 mt-0.5" />
      )}
      <p className="text-sm font-medium leading-snug">{message}</p>
      <button
        onClick={onClose}
        className="ml-auto text-current opacity-60 hover:opacity-100 flex-shrink-0 font-bold text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Confirm Modal
───────────────────────────────────────────── */
function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative bg-[#0d1530] border border-blue-500/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_0_60px_rgba(59,130,246,0.15)]">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <CircleDollarSign size={30} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-xl mb-2">
              Confirm ROI Distribution
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              This will immediately distribute daily profit to all active
              investors. This action cannot be undone. Are you sure you want to
              proceed?
            </p>
          </div>
          <div className="flex items-center gap-3 w-full mt-2">
            <button
              onClick={onCancel}
              className="flex-1 px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:border-white/20 text-sm font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-semibold hover:from-emerald-500 hover:to-emerald-400 transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              Yes, Distribute Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Status badge helper
───────────────────────────────────────────── */
const statusStyles = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
};

/* ─────────────────────────────────────────────
   Custom tooltip for recharts
───────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1530] border border-blue-500/20 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-slate-400 mb-1 font-medium">{label}</p>
      <p className="text-emerald-400 font-bold">
        PKR {(payload[0]?.value || 0).toLocaleString()}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function RoiManagement() {
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [distributing, setDistributing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  /* ── Fetch profit transactions ── */
  const fetchTransactions = useCallback(async () => {
    setLoadingTx(true);
    try {
      const { data } = await transactionAPI.getAll({
        type: "Profit",
        limit: 50,
      });
      if (data.success) {
        setTransactions(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch ROI transactions:", err);
    } finally {
      setLoadingTx(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshKey]);

  /* ── Derived stats ── */
  const totalDistributed = transactions.reduce(
    (sum, tx) => sum + (tx.amount || 0),
    0
  );

  const todayStr = new Date().toDateString();
  const todaysROI = transactions
    .filter((tx) => new Date(tx.createdAt).toDateString() === todayStr)
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  // Count unique users who received profit (proxy for active investments)
  const activeInvestors = new Set(
    transactions.map((tx) => tx.user?._id || tx.user?.id || tx.user)
  ).size;

  /* ── Chart data: ROI per day for last 14 days ── */
  const chartData = (() => {
    const days = 14;
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const dateStr = d.toDateString();
      const amount = transactions
        .filter((tx) => new Date(tx.createdAt).toDateString() === dateStr)
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);
      result.push({ date: label, roi: amount });
    }
    return result;
  })();

  /* ── Distribute profit handler ── */
  const handleDistribute = async () => {
    setShowConfirm(false);
    setDistributing(true);
    try {
      const { data } = await investmentAPI.distributeProfit();
      const msg =
        data?.message ||
        `Daily profit distributed successfully to ${data?.count ?? "all"} investors.`;
      setToast({ message: msg, type: "success" });
      // Refresh transactions after distribution
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to distribute profit. Please try again.";
      setToast({ message: msg, type: "error" });
    } finally {
      setDistributing(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#060a14] min-h-full text-white">
      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Confirm Modal ── */}
      {showConfirm && (
        <ConfirmModal
          onConfirm={handleDistribute}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ROI Management</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage return on investment distributions
          </p>
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          disabled={loadingTx}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500/20 text-slate-400 hover:text-white hover:border-blue-500/40 text-sm font-medium transition-all duration-200 self-start sm:self-auto"
        >
          <RefreshCw
            size={15}
            className={loadingTx ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
        {/* Total ROI Distributed */}
        <div className="group relative bg-[#0d1530] border border-blue-500/10 rounded-xl p-5 flex items-center gap-4 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <CircleDollarSign size={22} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1">
              Total ROI Distributed
            </p>
            <p className="text-xl font-bold text-white leading-tight">
              {loadingTx ? (
                <span className="text-slate-500 text-base">Loading...</span>
              ) : (
                <CountUp end={totalDistributed} prefix="PKR " />
              )}
            </p>
          </div>
        </div>

        {/* Today's ROI */}
        <div className="group relative bg-[#0d1530] border border-blue-500/10 rounded-xl p-5 flex items-center gap-4 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <TrendingUp size={22} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1">
              Today's ROI
            </p>
            <p className="text-xl font-bold text-white leading-tight">
              {loadingTx ? (
                <span className="text-slate-500 text-base">Loading...</span>
              ) : (
                <CountUp end={todaysROI} prefix="PKR " />
              )}
            </p>
          </div>
        </div>

        {/* Active Investments */}
        <div className="group relative bg-[#0d1530] border border-blue-500/10 rounded-xl p-5 flex items-center gap-4 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Activity size={22} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1">
              Active Investments
            </p>
            <p className="text-xl font-bold text-white leading-tight">
              {loadingTx ? (
                <span className="text-slate-500 text-base">Loading...</span>
              ) : (
                <CountUp end={activeInvestors} />
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Trigger Manual ROI Distribution ── */}
      <div className="glow-panel overflow-hidden">
        <div className="p-5 border-b border-blue-500/10">
          <h2 className="font-semibold text-white text-base">
            Trigger Manual ROI Distribution
          </h2>
        </div>
        <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <p className="text-slate-300 text-sm leading-relaxed mb-2">
              Manually trigger the daily profit distribution for all active
              investors. This runs the same logic as the scheduled cron job —
              each investor will receive their entitled ROI based on their
              active plan.
            </p>
            <p className="text-amber-400/80 text-xs font-medium flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Use with caution — double distribution may occur if run twice on
              the same day.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowConfirm(true)}
              disabled={distributing}
              className="relative flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold text-base hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 active:translate-y-0"
            >
              {distributing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Distributing...
                </>
              ) : (
                <>
                  <Play size={20} className="fill-white" />
                  Distribute Daily Profit Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── ROI Chart (last 14 days) ── */}
      <div className="glow-panel overflow-hidden">
        <div className="p-5 border-b border-blue-500/10">
          <h2 className="font-semibold text-white text-base">
            ROI Distributed — Last 14 Days
          </h2>
        </div>
        <div className="p-5">
          {loadingTx ? (
            <div className="h-[240px] flex items-center justify-center text-slate-400">
              <Loader2 size={24} className="animate-spin mr-2" />
              Loading chart data...
            </div>
          ) : (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#ffffff10"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickFormatter={(val) =>
                      val >= 1000000
                        ? `${(val / 1000000).toFixed(1)}M`
                        : val >= 1000
                        ? `${(val / 1000).toFixed(0)}K`
                        : val
                    }
                    dx={-4}
                    width={55}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="roi"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#roiGrad)"
                    dot={{ r: 3.5, fill: "#10b981", stroke: "#060a14", strokeWidth: 2 }}
                    activeDot={{ r: 5.5, fill: "#10b981", stroke: "#060a14", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent ROI Transactions Table ── */}
      <div className="glow-panel overflow-hidden">
        <div className="p-5 border-b border-blue-500/10 flex items-center justify-between">
          <h2 className="font-semibold text-white text-base">
            Recent ROI Transactions
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Showing last 50 records
          </span>
        </div>

        {loadingTx ? (
          <div className="p-10 flex items-center justify-center text-slate-400 gap-3">
            <Loader2 size={22} className="animate-spin" />
            <span>Loading transactions...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <CircleDollarSign
              size={36}
              className="mx-auto mb-3 opacity-30"
            />
            <p className="font-medium">No ROI transactions found</p>
            <p className="text-xs mt-1 text-slate-500">
              Profit distributions will appear here once triggered.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-500/10">
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => (
                  <tr
                    key={tx._id || idx}
                    className={`hover:bg-blue-500/5 transition-all duration-200 border-b border-white/5 last:border-0 ${
                      idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600/40 to-purple-600/40 border border-white/10 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {(tx.user?.name || tx.user?.username || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">
                            {tx.user?.name || tx.user?.username || "Unknown"}
                          </p>
                          {tx.user?.email && (
                            <p className="text-xs text-slate-500">
                              {tx.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-emerald-400">
                      + PKR {(tx.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {tx.createdAt
                        ? new Date(tx.createdAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          statusStyles[tx.status?.toLowerCase()] ||
                          "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        }`}
                      >
                        {tx.status || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

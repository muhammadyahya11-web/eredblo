import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  CircleDollarSign,
  Landmark,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  Activity,
  CheckCircle2,
  XCircle,
  TrendingDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { walletAPI } from "../../services/api";

/* ─── Helpers ─────────────────────────────────────────────── */
const fmt = (n) => `PKR ${Number(n || 0).toLocaleString("en-PK")}`;

/* ─── Reusable Card shell ──────────────────────────────────── */
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-[#0d1530] border border-white/5 rounded-xl shadow-lg ${className}`}
  >
    {children}
  </div>
);

/* ─── KPI Card ─────────────────────────────────────────────── */
const TONE_MAP = {
  blue: "text-blue-400 bg-blue-500/10",
  emerald: "text-emerald-400 bg-emerald-500/10",
  rose: "text-rose-400 bg-rose-500/10",
  purple: "text-purple-400 bg-purple-500/10",
  amber: "text-amber-400 bg-amber-500/10",
  cyan: "text-cyan-400 bg-cyan-500/10",
  orange: "text-orange-400 bg-orange-500/10",
  red: "text-red-400 bg-red-500/10",
};

const BORDER_MAP = {
  blue: "border-t-blue-500",
  emerald: "border-t-emerald-500",
  rose: "border-t-rose-500",
  purple: "border-t-purple-500",
  amber: "border-t-amber-500",
  cyan: "border-t-cyan-500",
  orange: "border-t-orange-500",
  red: "border-t-red-500",
};

function KpiCard({ label, value, icon: Icon, tone }) {
  const iconCls = TONE_MAP[tone] ?? TONE_MAP.blue;
  const borderCls = BORDER_MAP[tone] ?? BORDER_MAP.blue;

  return (
    <Card className={`p-5 border-t-2 ${borderCls} flex flex-col gap-3`}>
      <div className="flex items-start justify-between">
        <p className="text-xs text-slate-400 font-medium leading-snug max-w-[120px]">
          {label}
        </p>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconCls}`}
        >
          <Icon size={20} />
        </div>
      </div>
      <p className="text-xl font-bold text-white break-all leading-tight">
        {fmt(value)}
      </p>
    </Card>
  );
}


/* ─── Custom chart tooltip ─────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
      <p className="font-semibold text-slate-200 mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="mb-1">
          {entry.name}:{" "}
          <span className="font-bold text-white">{fmt(entry.value)}</span>
        </p>
      ))}
    </div>
  );
};

/* ─── Health indicator row ─────────────────────────────────── */
function HealthRow({ label, value, status, colorCls }) {
  const StatusIcon =
    status === "good"
      ? CheckCircle2
      : status === "warn"
      ? AlertCircle
      : XCircle;
  const iconCls =
    status === "good"
      ? "text-emerald-400"
      : status === "warn"
      ? "text-amber-400"
      : "text-rose-400";

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2">
        <StatusIcon size={15} className={iconCls} />
        <span className="text-sm text-slate-300">{label}</span>
      </div>
      <span className={`text-sm font-semibold ${colorCls ?? "text-white"}`}>
        {value}
      </span>
    </div>
  );
}

/* ─── Main component ───────────────────────────────────────── */
export default function WalletManagement() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await walletAPI.getOverview();
      setData(res.data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load wallet data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Activity className="animate-spin text-blue-500" size={32} />
        <p className="text-sm">Loading wallet data…</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-slate-400 px-4">
        <AlertCircle className="text-rose-500" size={40} />
        <p className="text-base text-center text-slate-300">{error}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCw size={15} />
          Retry
        </button>
      </div>
    );
  }

  /* ── Derived values from API payload ── */
  const totalBalance = data?.totalUserBalances ?? data?.totalBalance ?? 0;
  const totalDeposited = data?.totalDeposited ?? data?.totalDeposits ?? 0;
  const totalWithdrawn = data?.totalWithdrawn ?? data?.totalWithdrawals ?? 0;
  const totalInvested = data?.totalInvested ?? data?.totalInvestments ?? 0;
  const totalProfitDistributed =
    data?.totalProfitDistributed ?? data?.totalProfit ?? 0;
  const netBalance = totalDeposited - totalWithdrawn;
  const totalUserEarnings = data?.totalUserEarnings ?? data?.totalEarnings ?? 0;
  const totalUserWithdrawals =
    data?.totalUserWithdrawals ?? data?.totalWithdrawals ?? 0;
  const chartData = data?.chartData || [];

  /* ── Compute health metrics ── */
  const withdrawalRatio =
    totalDeposited > 0
      ? ((totalWithdrawn / totalDeposited) * 100).toFixed(1)
      : "0.0";
  const investmentRatio =
    totalDeposited > 0
      ? ((totalInvested / totalDeposited) * 100).toFixed(1)
      : "0.0";
  const profitToInvestment =
    totalInvested > 0
      ? ((totalProfitDistributed / totalInvested) * 100).toFixed(2)
      : "0.00";
  const netHealthStatus =
    netBalance >= 0
      ? "good"
      : netBalance < -totalDeposited * 0.1
      ? "bad"
      : "warn";
  const withdrawalRatioStatus =
    parseFloat(withdrawalRatio) < 60
      ? "good"
      : parseFloat(withdrawalRatio) < 85
      ? "warn"
      : "bad";

  /* ─── KPI cards definition ─────────────────────────────── */
  const kpiCards = [
    {
      label: "Total User Balances",
      value: totalBalance,
      icon: Wallet,
      tone: "blue",
    },
    {
      label: "Total Deposited",
      value: totalDeposited,
      icon: ArrowDownToLine,
      tone: "emerald",
    },
    {
      label: "Total Withdrawn",
      value: totalWithdrawn,
      icon: ArrowUpFromLine,
      tone: "rose",
    },
    {
      label: "Total Invested",
      value: totalInvested,
      icon: TrendingUp,
      tone: "purple",
    },
    {
      label: "Total Profit Distributed",
      value: totalProfitDistributed,
      icon: CircleDollarSign,
      tone: "amber",
    },
    {
      label: "Net Balance",
      value: netBalance,
      icon: Landmark,
      tone: "cyan",
    },
    {
      label: "Total User Earnings",
      value: totalUserEarnings,
      icon: DollarSign,
      tone: "orange",
    },
    {
      label: "Total User Withdrawals",
      value: totalUserWithdrawals,
      icon: ArrowUpRight,
      tone: "red",
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto text-white">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Wallet Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Platform-wide financial overview and health metrics.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* ── 8 KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </div>

      {/* ── Bar Chart + Financial Health ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar Chart – 2/3 width */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-lg">
                Monthly Deposits vs Withdrawals
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Last 6 months overview
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
                <span className="text-slate-400">Deposits</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
                <span className="text-slate-400">Withdrawals</span>
              </span>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                barCategoryGap="30%"
                barGap={4}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#ffffff10"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
                  dx={-4}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#ffffff08" }} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="square"
                  wrapperStyle={{ fontSize: "12px", paddingBottom: "10px", display: "none" }}
                />
                <Bar
                  dataKey="deposits"
                  name="Deposits"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="withdrawals"
                  name="Withdrawals"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Financial Health Summary – 1/3 width */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="font-semibold text-base leading-tight">
                Financial Health
              </h2>
              <p className="text-[11px] text-slate-500">Key indicators</p>
            </div>
          </div>

          <div>
            <HealthRow
              label="Net Balance"
              value={fmt(netBalance)}
              status={netHealthStatus}
              colorCls={
                netBalance >= 0 ? "text-emerald-400" : "text-rose-400"
              }
            />
            <HealthRow
              label="Withdrawal Ratio"
              value={`${withdrawalRatio}%`}
              status={withdrawalRatioStatus}
              colorCls={
                parseFloat(withdrawalRatio) < 60
                  ? "text-emerald-400"
                  : parseFloat(withdrawalRatio) < 85
                  ? "text-amber-400"
                  : "text-rose-400"
              }
            />
            <HealthRow
              label="Investment Ratio"
              value={`${investmentRatio}%`}
              status={parseFloat(investmentRatio) > 20 ? "good" : "warn"}
              colorCls="text-purple-400"
            />
            <HealthRow
              label="Profit / Investment"
              value={`${profitToInvestment}%`}
              status={parseFloat(profitToInvestment) > 0 ? "good" : "warn"}
              colorCls="text-amber-400"
            />
            <HealthRow
              label="Total Deposited"
              value={fmt(totalDeposited)}
              status="good"
              colorCls="text-blue-400"
            />
            <HealthRow
              label="Total Distributed Profit"
              value={fmt(totalProfitDistributed)}
              status="good"
              colorCls="text-orange-400"
            />
          </div>

          {/* Mini health badge */}
          <div className="mt-5 p-3 rounded-lg bg-white/[0.03] border border-white/5 flex items-center gap-3">
            {netHealthStatus === "good" ? (
              <CheckCircle2 className="text-emerald-400 flex-shrink-0" size={20} />
            ) : netHealthStatus === "warn" ? (
              <AlertCircle className="text-amber-400 flex-shrink-0" size={20} />
            ) : (
              <XCircle className="text-rose-400 flex-shrink-0" size={20} />
            )}
            <div>
              <p
                className={`text-sm font-semibold ${
                  netHealthStatus === "good"
                    ? "text-emerald-400"
                    : netHealthStatus === "warn"
                    ? "text-amber-400"
                    : "text-rose-400"
                }`}
              >
                {netHealthStatus === "good"
                  ? "Platform Financially Healthy"
                  : netHealthStatus === "warn"
                  ? "Monitor Withdrawal Pressure"
                  : "High Withdrawal Risk"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Based on current deposit & withdrawal ratios.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-slate-600">
        <p>© 2024 ERED BLOO. All rights reserved.</p>
        <p>Super Admin Panel · Wallet Management</p>
      </div>
    </div>
  );
}

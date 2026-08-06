import React, { useState, useCallback } from "react";
import {
  FileBarChart,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { reportsAPI } from "../../services/api";

/* ── Shared card shell ── */
const Card = ({ children, className = "" }) => (
  <div className={`bg-[#0d1530] border border-white/5 rounded-xl shadow-lg ${className}`}>
    {children}
  </div>
);

/* ── Tooltip style shared across both charts ── */
const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "8px",
  },
  itemStyle: { color: "#e2e8f0" },
};

/* ── Colour map for bar by data type ── */
const DATA_TYPE_COLOR = {
  deposits: "#3b82f6",
  withdrawals: "#ef4444",
  profits: "#22c55e",
  investments: "#f59e0b",
  all: "#8b5cf6",
};

/* ── Helper: generate & trigger CSV download ── */
function downloadCSV(rows, dataType, fromDate, toDate) {
  const header = ["Date", "Total Amount (PKR)", "Count"];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        `"${r.date}"`,
        r.totalAmount,
        r.count,
      ].join(",")
    ),
  ];
  const csv = lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `report_${dataType}_${fromDate || "all"}_${toDate || "all"}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ── Format a number as compact PKR ── */
function fmtPKR(val) {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return String(val);
}

/* ═══════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════ */
export default function Reports() {
  /* ── filter state ── */
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dataType, setDataType] = useState("all");
  const [groupBy, setGroupBy] = useState("daily");

  /* ── fetch state ── */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);       // { rows, registrations }
  const [generated, setGenerated] = useState(false);

  /* ── Generate report ── */
  const generateReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { dataType, groupBy };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const { data } = await reportsAPI.getData(params);

      /* Normalise: accept both { rows, registrations } or a plain array */
      if (Array.isArray(data)) {
        setReportData({ rows: data, registrations: [] });
      } else {
        setReportData({
          rows: data.rows || data.data || [],
          registrations: data.registrations || data.userRegistrations || [],
        });
      }
      setGenerated(true);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load report.");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, dataType, groupBy]);

  const barColor = DATA_TYPE_COLOR[dataType] || "#8b5cf6";
  const rows = reportData?.rows ?? [];
  const registrations = reportData?.registrations ?? [];

  /* ── Bar chart data shape: { name, totalAmount, count } ── */
  const chartData = rows.map((r) => ({
    name: r.date || r._id || r.label || "",
    totalAmount: r.totalAmount ?? r.amount ?? 0,
    count: r.count ?? r.total ?? 0,
  }));

  /* ── Registration chart data: { name, users } ── */
  const regChartData = registrations.map((r) => ({
    name: r.date || r._id || r.label || "",
    users: r.count ?? r.users ?? r.total ?? 0,
  }));

  /* ── Select field shared style ── */
  const selectClass =
    "bg-[#0d1530] border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors";

  const inputClass =
    "bg-[#0d1530] border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors [color-scheme:dark]";

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto text-white">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <FileBarChart size={20} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Reports</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Generate and export financial reports by date range and data type.
              </p>
            </div>
          </div>
        </div>
        {generated && rows.length > 0 && (
          <button
            onClick={() => downloadCSV(chartData, dataType, fromDate, toDate)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={16} />
            Download CSV
          </button>
        )}
      </div>

      {/* ── Filter bar ── */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-300">Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">

          {/* From Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Calendar size={12} /> From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* To Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Calendar size={12} /> To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Data Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-medium">Data Type</label>
            <select
              value={dataType}
              onChange={(e) => setDataType(e.target.value)}
              className={selectClass}
            >
              <option value="all">All</option>
              <option value="deposits">Deposits</option>
              <option value="withdrawals">Withdrawals</option>
              <option value="profits">Profits</option>
              <option value="investments">Investments</option>
            </select>
          </div>

          {/* Group By */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-medium">Group By</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className={selectClass}
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Generate button */}
          <button
            onClick={generateReport}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors h-[42px]"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            {loading ? "Loading…" : "Generate Report"}
          </button>

        </div>
      </Card>

      {/* ── Content area ── */}
      {!generated && !loading && (
        <Card className="p-16 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <FileBarChart size={32} className="text-blue-400" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-200">No Report Generated Yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Click <span className="text-blue-400 font-medium">Generate Report</span> to load data.
            </p>
          </div>
        </Card>
      )}

      {loading && (
        <Card className="p-16 flex flex-col items-center justify-center gap-4">
          <Loader2 size={36} className="animate-spin text-blue-500" />
          <p className="text-slate-400 text-sm">Fetching report data…</p>
        </Card>
      )}

      {error && !loading && (
        <Card className="p-10 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center">
            <FileBarChart size={28} className="text-rose-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-rose-400">Failed to Load Report</p>
            <p className="text-sm text-slate-500 mt-1 max-w-md">{error}</p>
          </div>
          <button
            onClick={generateReport}
            className="flex items-center gap-2 mt-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw size={15} /> Retry
          </button>
        </Card>
      )}

      {generated && !loading && !error && (
        <>
          {/* ── Bar Chart ── */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-lg capitalize">
                {dataType === "all" ? "All Transactions" : dataType} — {groupBy === "daily" ? "Daily" : "Monthly"} Overview
              </h2>
              <span className="text-xs text-slate-500 border border-white/10 rounded-lg px-3 py-1.5">
                {rows.length} data point{rows.length !== 1 ? "s" : ""}
              </span>
            </div>

            {chartData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-slate-500 text-sm">
                No data available for the selected filters.
              </div>
            ) : (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    barSize={chartData.length > 20 ? 8 : 20}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      dy={8}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      tickFormatter={fmtPKR}
                      dx={-6}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle.contentStyle}
                      itemStyle={chartTooltipStyle.itemStyle}
                      formatter={(value, name) =>
                        name === "totalAmount"
                          ? [`PKR ${Number(value).toLocaleString()}`, "Total Amount"]
                          : [value, "Count"]
                      }
                    />
                    <Legend
                      verticalAlign="top"
                      height={32}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px", paddingBottom: "8px" }}
                      formatter={(value) =>
                        value === "totalAmount" ? "Total Amount (PKR)" : "Count"
                      }
                    />
                    <Bar
                      dataKey="totalAmount"
                      name="totalAmount"
                      fill={barColor}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="count"
                      name="count"
                      fill="#ffffff20"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* ── Data Table ── */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Report Breakdown</h2>
              {rows.length > 0 && (
                <button
                  onClick={() => downloadCSV(chartData, dataType, fromDate, toDate)}
                  className="flex items-center gap-2 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Download size={14} />
                  Download CSV
                </button>
              )}
            </div>

            {chartData.length === 0 ? (
              <p className="text-slate-500 text-sm py-8 text-center">
                No records found for the selected filters.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[480px]">
                  <thead>
                    <tr className="text-xs text-slate-400 border-b border-white/5 bg-white/[0.02]">
                      <th className="p-3 font-medium rounded-tl-lg">#</th>
                      <th className="p-3 font-medium">Date</th>
                      <th className="p-3 font-medium">Total Amount (PKR)</th>
                      <th className="p-3 font-medium rounded-tr-lg">Count</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-white/5">
                    {chartData.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-3 text-slate-500">{idx + 1}</td>
                        <td className="p-3 font-medium text-slate-200">{row.name}</td>
                        <td className="p-3 font-semibold text-emerald-400">
                          PKR {Number(row.totalAmount).toLocaleString()}
                        </td>
                        <td className="p-3 text-slate-300">{row.count.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-white/10 bg-white/[0.02]">
                      <td className="p-3 text-xs text-slate-500 rounded-bl-lg" colSpan={2}>
                        Totals
                      </td>
                      <td className="p-3 font-bold text-emerald-300">
                        PKR{" "}
                        {chartData
                          .reduce((acc, r) => acc + Number(r.totalAmount), 0)
                          .toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-slate-200 rounded-br-lg">
                        {chartData.reduce((acc, r) => acc + Number(r.count), 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </Card>

          {/* ── User Registrations mini chart ── */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-lg">User Registrations</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  New user sign-ups over the selected period
                </p>
              </div>
              {regChartData.length > 0 && (
                <span className="text-xs text-slate-500 border border-white/10 rounded-lg px-3 py-1.5">
                  {regChartData.length} point{regChartData.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {regChartData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">
                No registration data available for this period.
              </div>
            ) : (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={regChartData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      dy={8}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      dx={-6}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle.contentStyle}
                      itemStyle={chartTooltipStyle.itemStyle}
                      formatter={(v) => [v, "New Users"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      name="New Users"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 2, stroke: "#0f172a" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </>
      )}

    </div>
  );
}

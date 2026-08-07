import React, { useState, useEffect } from "react";
import { FileBarChart, RefreshCw, Calendar, Download } from "lucide-react";
import { reportsAPI } from "../../services/api";

export default function SuperAdminReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      const { data } = await reportsAPI.getData({ days: 30 });
      if (data.success) setReport(data.data);
    } catch (e) { /* endpoint may not be fully wired in server; show fallback summary */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, []);

  const cards = report?.summary || [
    { label: "Total Users", value: 0, icon: "👤" },
    { label: "Active Investments", value: 0, icon: "📈" },
    { label: "Revenue (30d)", value: "—", icon: "💰" },
    { label: "Profit (30d)", value: "—", icon: "📊" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#060a14] min-h-full text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reports</h1>
          <p className="text-slate-400 text-sm mt-1">Platform analytics and reporting</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchReport} className="p-2 rounded-lg hover:bg-blue-500/10 text-slate-400 hover:text-blue-400"><RefreshCw size={16} /></button>
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-blue-500/35">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="bg-[#0d1530] border border-blue-500/30 shadow-blue-500/15 rounded-xl p-5 flex items-center gap-4 hover:border-blue-500/40 hover:shadow-blue-500/25 transition-all">
            <div className="text-2xl">{c.icon}</div>
            <div className="flex-1">
              <p className="text-slate-400 text-xs font-medium">{c.label}</p>
              <p className="text-xl font-bold text-white">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center py-12 text-slate-400"><FileBarChart size={32} className="mx-auto mb-3 opacity-40" /> Loading report data…</div>
      )}

      {!loading && report && (
        <div className="bg-[#0d1530] border border-blue-500/30 shadow-blue-500/15 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4">Report Detail</h2>
          {report.detail ? (
            <pre className="text-xs text-slate-300 whitespace-pre-wrap bg-[#050810] border border-blue-500/10 rounded-lg p-4 overflow-x-auto">{JSON.stringify(report.detail, null, 2)}</pre>
          ) : (
            <p className="text-slate-400">No detailed data available for this report.</p>
          )}
        </div>
      )}
    </div>
  );
}

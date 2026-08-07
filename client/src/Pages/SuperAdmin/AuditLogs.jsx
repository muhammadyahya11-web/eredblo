import React, { useState, useEffect } from "react";
import { Trash2, RefreshCw, Clock, ShieldCheck, User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";
import { auditAPI } from "../../services/api";

const iconMap = {
  Admin: <ShieldCheck size={14} className="text-blue-400" />,
  User: <UserIcon size={14} className="text-emerald-400" />,
  system: <Clock size={14} className="text-purple-400" />,
};

export default function SuperAdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const fetchLogs = async () => {
    try {
      const { data } = await auditAPI.getAll({ page, limit });
      if (data.success) { setLogs(data.data || []); setTotal(data.total || 0); setPages(data.pages || 1); }
    } catch { toast.error("Failed to load audit logs"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, [page, limit]);
  void loading;

  const handleDelete = async (id) => {
    try {
      const { data } = await auditAPI.delete(id);
      if (data.success) { toast.success("Log deleted"); setLogs(p => p.filter(l => l._id !== id)); }
      else toast.error(data.message);
    } catch { toast.error("Delete failed"); }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Delete ALL audit logs? This cannot be undone.")) return;
    try {
      const { data } = await auditAPI.clearAll();
      if (data.success) { toast.success("All logs cleared"); setLogs([]); setTotal(0); }
      else toast.error(data.message);
    } catch { toast.error("Clear failed"); }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#060a14] min-h-full text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Audit Logs</h1>
          <p className="text-slate-400 text-sm mt-1">Record of all administrative and system actions</p>
        </div>
        {logs.length > 0 && (
          <button onClick={handleClearAll} className="flex items-center gap-2 bg-red-600/90 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-red-500/30">
            <Trash2 size={16} /> Clear All
          </button>
        )}
      </div>

      <div className="bg-[#0d1530] border border-blue-500/30 shadow-blue-500/15 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-500/10">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Timestamp</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Actor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Action</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Details</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400">Loading audit logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400">No audit logs found.</td></tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={log._id} className={`hover:bg-blue-500/5 transition-all ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                    <td className="px-5 py-3 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {iconMap[log.actor?.role || "system"]}
                        <span className="text-slate-300">{log.actor?.name || "System"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-blue-400 font-medium">{log.action || "-"}</td>
                    <td className="px-5 py-3 text-slate-400 truncate max-w-xs">{log.details || log.message || "-"}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => handleDelete(log._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400" title="Delete"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-slate-500">{total} logs total</span>
          <div className="flex items-center gap-1 text-xs">
            <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded border border-blue-500/20 disabled:opacity-40 hover:bg-blue-500/10">Prev</button>
            <span className="px-2 text-slate-300">Page {page} of {pages}</span>
            <button disabled={page >= pages} onClick={() => setPage(p => Math.min(pages, p + 1))} className="px-3 py-1 rounded border border-blue-500/20 disabled:opacity-40 hover:bg-blue-500/10">Next</button>
            <button onClick={() => { setPage(1); setLoading(true); }} className="p-1 rounded hover:bg-blue-500/10 text-slate-400"><RefreshCw size={13} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

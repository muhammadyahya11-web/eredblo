import React, { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  Search,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { auditAPI } from "../../services/api";

// ─── Category badge colours ───────────────────────────────────────────────────
const CATEGORY_STYLES = {
  user:       "bg-blue-500/10     text-blue-400     border border-blue-500/20",
  admin:      "bg-purple-500/10   text-purple-400   border border-purple-500/20",
  deposit:    "bg-green-500/10    text-green-400    border border-green-500/20",
  withdrawal: "bg-amber-500/10    text-amber-400    border border-amber-500/20",
  settings:   "bg-slate-500/10    text-slate-300    border border-slate-500/20",
  promo:      "bg-pink-500/10     text-pink-400     border border-pink-500/20",
  bonus:      "bg-yellow-500/10   text-yellow-400   border border-yellow-500/20",
  system:     "bg-cyan-500/10     text-cyan-400     border border-cyan-500/20",
};

const CATEGORIES = [
  "all",
  "user",
  "admin",
  "deposit",
  "withdrawal",
  "settings",
  "promo",
  "bonus",
  "system",
];

const LIMITS = [10, 25, 50];

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-white/5 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-3 bg-white/5 rounded-full w-3/4" />
        </td>
      ))}
    </tr>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AuditLogs() {
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [clearing, setClearing]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [search, setSearch]       = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory]   = useState("all");

  const [page, setPage]           = useState(1);
  const [limit, setLimit]         = useState(10);
  const [total, setTotal]         = useState(0);
  const [pages, setPages]         = useState(1);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (category !== "all") params.category = category;
      if (search.trim())      params.search    = search.trim();

      const { data } = await auditAPI.getAll(params);

      if (data?.success) {
        setLogs(data.data   ?? []);
        setTotal(data.total ?? 0);
        setPages(data.pages ?? 1);
      } else if (Array.isArray(data)) {
        setLogs(data);
        setTotal(data.length);
        setPages(1);
      } else {
        setLogs([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load audit logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, category, search]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // ── search submit ──────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  // ── category change ────────────────────────────────────────────────────────
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  // ── clear all ──────────────────────────────────────────────────────────────
  const handleClearAll = async () => {
    try {
      setClearing(true);
      const { data } = await auditAPI.clearAll();
      toast.success(data?.message || "All audit logs cleared");
      setLogs([]);
      setTotal(0);
      setPages(1);
      setPage(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to clear audit logs");
    } finally {
      setClearing(false);
      setShowConfirm(false);
    }
  };

  // ── helpers ────────────────────────────────────────────────────────────────
  const formatDateTime = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day:   "numeric",
      year:  "numeric",
      hour:  "2-digit",
      minute:"2-digit",
    });
  };

  const categoryBadge = (cat) => {
    const style = CATEGORY_STYLES[cat?.toLowerCase()] || "bg-white/5 text-slate-400 border border-white/10";
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}>
        {cat || "—"}
      </span>
    );
  };

  const statusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === "success") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
          <CheckCircle2 size={11} />
          Success
        </span>
      );
    }
    if (s === "failed" || s === "failure") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
          <AlertCircle size={11} />
          Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-slate-400 border border-white/10 capitalize">
        {status || "—"}
      </span>
    );
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-[#060a14] min-h-full">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={22} className="text-blue-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Audit Logs</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Track all admin &amp; system actions across the platform
          </p>
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-600/10 text-red-400 border border-red-500/20 hover:bg-red-600/20 hover:border-red-500/40 transition-all duration-300"
        >
          <Trash2 size={15} />
          Clear All
        </button>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Category dropdown */}
        <div className="relative flex items-center">
          <Filter size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
          <select
            value={category}
            onChange={handleCategoryChange}
            className="appearance-none pl-9 pr-8 py-2.5 rounded-xl text-sm bg-[#0d1530] border border-blue-500/10 text-slate-300 focus:border-blue-500/40 focus:outline-none transition-colors capitalize cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize bg-[#0d1530]">
                {c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Search input */}
        <form className="relative flex-1 min-w-0" onSubmit={handleSearch}>
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search action, user, details…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-[#0d1530] border border-blue-500/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500/40 focus:outline-none transition-colors"
          />
        </form>

        {/* Rows per page */}
        <select
          value={limit}
          onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
          className="px-3 py-2.5 rounded-xl text-sm bg-[#0d1530] border border-blue-500/10 text-slate-300 focus:border-blue-500/40 focus:outline-none transition-colors cursor-pointer"
        >
          {LIMITS.map((l) => (
            <option key={l} value={l} className="bg-[#0d1530]">{l} / page</option>
          ))}
        </select>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="bg-[#0d1530] border border-blue-500/20 rounded-xl shadow-lg shadow-blue-500/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["#", "Action", "Category", "Performed By", "Target User", "Details", "Status", "Date / Time"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: limit < 6 ? limit : 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-14 text-slate-500">
                    <ClipboardList size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No audit logs found.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr
                    key={log._id ?? idx}
                    className={`border-b border-white/5 last:border-0 hover:bg-blue-500/5 transition-colors duration-200 ${
                      idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.015]"
                    }`}
                  >
                    {/* # */}
                    <td className="px-4 py-3.5 text-slate-500 text-xs font-mono whitespace-nowrap">
                      {(page - 1) * limit + idx + 1}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 max-w-[180px]">
                      <p
                        className="text-white font-medium truncate"
                        title={log.action}
                      >
                        {log.action || "—"}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {categoryBadge(log.category)}
                    </td>

                    {/* Performed By */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="text-white font-medium text-xs leading-snug">
                        {log.performedBy?.name || log.performedByName || "—"}
                      </p>
                      <p className="text-slate-500 text-xs capitalize">
                        {log.performedBy?.role || log.performedByRole || ""}
                      </p>
                    </td>

                    {/* Target User */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="text-slate-300 text-xs leading-snug">
                        {log.targetUser?.name || log.targetUserName || "—"}
                      </p>
                      {(log.targetUser?.email || log.targetUserEmail) && (
                        <p className="text-slate-500 text-xs">
                          {log.targetUser?.email || log.targetUserEmail}
                        </p>
                      )}
                    </td>

                    {/* Details */}
                    <td className="px-4 py-3.5 max-w-[220px]">
                      <p
                        className="text-slate-400 text-xs truncate"
                        title={log.details}
                      >
                        {log.details || "—"}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {statusBadge(log.status)}
                    </td>

                    {/* Date / Time */}
                    <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      {!loading && logs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p className="text-slate-500 text-xs">
            Showing{" "}
            <span className="text-slate-300 font-medium">
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)}
            </span>{" "}
            of{" "}
            <span className="text-slate-300 font-medium">{total}</span> entries
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-[#0d1530] border border-blue-500/10 text-slate-400 hover:text-white hover:border-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: pages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === "..." ? (
                  <span key={`ellipsis-${i}`} className="text-slate-500 px-1 select-none">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-200 border ${
                      item === page
                        ? "bg-blue-600 text-white border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                        : "bg-[#0d1530] text-slate-400 border-blue-500/10 hover:text-white hover:border-blue-500/30"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="p-2 rounded-lg bg-[#0d1530] border border-blue-500/10 text-slate-400 hover:text-white hover:border-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Clear-All Confirm Modal ─────────────────────────────────────────── */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => !clearing && setShowConfirm(false)}
        >
          <div
            className="w-full max-w-sm bg-[#0d1530] border border-red-500/20 rounded-2xl p-6 space-y-4 shadow-2xl shadow-red-500/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Clear All Audit Logs</h2>
                <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-white">all {total > 0 ? total.toLocaleString() : ""} audit log entries</span>?
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={clearing}
                className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                disabled={clearing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-500 text-white font-medium transition-all duration-200 disabled:opacity-50"
              >
                {clearing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Clearing…
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Yes, Clear All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

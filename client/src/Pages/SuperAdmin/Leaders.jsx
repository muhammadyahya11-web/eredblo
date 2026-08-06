import React, { useState, useEffect, useCallback } from "react";
import {
  Award,
  Search,
  Users,
  Star,
  X,
  Loader2,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { leaderAPI, adminAPI } from "../../services/api";

/* ─────────────────────────── helpers ─────────────────────────── */
const fmt = (n) => `RS ${Number(n || 0).toLocaleString()}`;

/* ─────────────────────────── component ─────────────────────────── */
export default function Leaders() {
  const [activeTab, setActiveTab] = useState("current");

  // ── Tab 1: current leaders ──────────────────────────────────────
  const [leaders, setLeaders] = useState([]);
  const [loadingLeaders, setLoadingLeaders] = useState(true);
  const [demoteTarget, setDemoteTarget] = useState(null); // user obj to confirm
  const [demoting, setDemoting] = useState(null); // id being demoted

  // ── Tab 2: promote user ─────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [promoting, setPromoting] = useState(null); // id being promoted
  const [searched, setSearched] = useState(false);

  /* ── fetch leaders ─────────────────────────────────────────────── */
  const fetchLeaders = useCallback(async () => {
    setLoadingLeaders(true);
    try {
      const { data } = await leaderAPI.getAll();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setLeaders(list);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load leaders");
      setLeaders([]);
    } finally {
      setLoadingLeaders(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaders();
  }, [fetchLeaders]);

  /* ── demote ────────────────────────────────────────────────────── */
  const handleDemote = async () => {
    if (!demoteTarget) return;
    const id = demoteTarget._id;
    setDemoting(id);
    setDemoteTarget(null);
    try {
      const { data } = await leaderAPI.demote(id);
      toast.success(data.message || "User demoted successfully");
      setLeaders((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to demote user");
    } finally {
      setDemoting(null);
    }
  };

  /* ── search regular users ──────────────────────────────────────── */
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearched(true);
    try {
      const { data } = await adminAPI.getUsers({ search: query.trim(), limit: 20 });
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      // filter out already-leaders
      const leaderIds = new Set(leaders.map((l) => l._id));
      setResults(list.filter((u) => !leaderIds.has(u._id)));
    } catch (err) {
      toast.error(err.response?.data?.message || "Search failed");
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  /* ── promote ───────────────────────────────────────────────────── */
  const handlePromote = async (user) => {
    setPromoting(user._id);
    try {
      const { data } = await leaderAPI.promote(user._id);
      toast.success(data.message || `${user.name} promoted to Leader`);
      setResults((prev) => prev.filter((u) => u._id !== user._id));
      fetchLeaders(); // refresh leader list
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to promote user");
    } finally {
      setPromoting(null);
    }
  };

  /* ── render ────────────────────────────────────────────────────── */
  return (
    <div className="p-4 md:p-6 space-y-5 bg-[#060a14] min-h-full">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Award className="text-amber-400" size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Leader Management
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Promote users to leaders or manage existing leader accounts
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#0d1530] border border-blue-500/10 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("current")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === "current"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Star size={15} />
          Current Leaders
          {!loadingLeaders && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400">
              {leaders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("promote")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === "promote"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Users size={15} />
          Promote User
        </button>
      </div>

      {/* ── Tab 1: Current Leaders ─────────────────────────────────── */}
      {activeTab === "current" && (
        <div className="bg-[#0d1530] border border-blue-500/20 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-500/10">
                  {[
                    "#",
                    "Name",
                    "Email",
                    "Phone",
                    "Referral Code",
                    "Total Investment",
                    "Total Earnings",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingLeaders ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400">
                      <Loader2
                        className="animate-spin inline mr-2 text-amber-400"
                        size={18}
                      />
                      Loading leaders…
                    </td>
                  </tr>
                ) : leaders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400">
                      <Award
                        className="mx-auto mb-2 text-slate-600"
                        size={32}
                      />
                      <p>No leaders found.</p>
                    </td>
                  </tr>
                ) : (
                  leaders.map((u, idx) => (
                    <tr
                      key={u._id}
                      className="border-l-2 border-amber-400/50 hover:bg-amber-500/5 transition-all duration-200 border-b border-white/5 last:border-b-0"
                    >
                      <td className="px-5 py-4 text-slate-400 font-mono text-xs">
                        {idx + 1}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">
                            {u.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="font-medium text-white whitespace-nowrap">
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-300 whitespace-nowrap">
                        {u.email}
                      </td>
                      <td className="px-5 py-4 text-slate-300 whitespace-nowrap">
                        {u.phone || "—"}
                      </td>
                      <td className="px-5 py-4">
                        {u.referralCode ? (
                          <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md font-mono text-xs border border-blue-500/20">
                            {u.referralCode}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-300 whitespace-nowrap">
                        {fmt(u.totalInvestment)}
                      </td>
                      <td className="px-5 py-4 text-green-400 whitespace-nowrap">
                        {fmt(u.totalEarnings)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            u.status === "blocked"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-green-500/10 text-green-400 border border-green-500/20"
                          }`}
                        >
                          {u.status === "blocked" ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          disabled={demoting === u._id}
                          onClick={() => setDemoteTarget(u)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all duration-200 disabled:opacity-50 whitespace-nowrap"
                        >
                          {demoting === u._id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <ChevronDown size={12} />
                          )}
                          Demote
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 2: Promote User ────────────────────────────────────── */}
      {activeTab === "promote" && (
        <div className="space-y-5">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users by name or email…"
                className="w-full bg-[#0d1530] border border-blue-500/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none focus:shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all duration-200 disabled:opacity-50 whitespace-nowrap"
            >
              {searching ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Search size={15} />
              )}
              Search
            </button>
          </form>

          {/* Results */}
          {searching ? (
            <div className="flex justify-center items-center py-16 text-slate-400">
              <Loader2 size={22} className="animate-spin mr-2 text-amber-400" />
              Searching…
            </div>
          ) : searched && results.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-400 gap-2">
              <Users size={36} className="text-slate-600" />
              <p>No users found matching your query.</p>
            </div>
          ) : (
            results.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((u) => (
                  <div
                    key={u._id}
                    className="bg-[#0d1530] border border-blue-500/10 rounded-xl p-4 space-y-3 hover:border-amber-500/30 transition-all duration-200"
                  >
                    {/* Avatar + name */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
                        {u.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {u.email}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/5 rounded-lg px-3 py-2">
                        <p className="text-slate-500 mb-0.5">Investment</p>
                        <p className="text-white font-medium">
                          {fmt(u.totalInvestment)}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-lg px-3 py-2">
                        <p className="text-slate-500 mb-0.5">Earnings</p>
                        <p className="text-green-400 font-medium">
                          {fmt(u.totalEarnings)}
                        </p>
                      </div>
                    </div>

                    {/* Referral + status row */}
                    <div className="flex items-center justify-between text-xs">
                      {u.referralCode ? (
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded font-mono border border-blue-500/20">
                          {u.referralCode}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full font-medium ${
                          u.status === "blocked"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-green-500/10 text-green-400"
                        }`}
                      >
                        {u.status === "blocked" ? "Blocked" : "Active"}
                      </span>
                    </div>

                    {/* Promote button */}
                    <button
                      disabled={promoting === u._id}
                      onClick={() => handlePromote(u)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all duration-200 disabled:opacity-50"
                    >
                      {promoting === u._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Award size={14} />
                      )}
                      {promoting === u._id ? "Promoting…" : "Promote to Leader"}
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* ── Demote Confirmation Dialog ─────────────────────────────── */}
      {demoteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setDemoteTarget(null)}
        >
          <div
            className="w-full max-w-sm bg-[#0d1530] border border-red-500/20 rounded-2xl p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <ChevronDown className="text-red-400" size={18} />
                </div>
                <h2 className="text-lg font-bold text-white">Demote Leader</h2>
              </div>
              <button
                onClick={() => setDemoteTarget(null)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to demote{" "}
              <span className="font-semibold text-white">
                {demoteTarget.name}
              </span>{" "}
              from leader status? They will lose all leader privileges.
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setDemoteTarget(null)}
                className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDemote}
                className="px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-500 text-white font-medium transition-colors shadow-lg shadow-red-900/40"
              >
                Demote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

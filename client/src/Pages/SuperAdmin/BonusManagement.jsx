import React, { useState, useEffect } from "react";
import { Plus, Send, History, Copy, Search, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { bonusAPI } from "../../services/api";

export default function SuperAdminBonusManagement() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIssuer, setShowIssuer] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [form, setForm] = useState({ targetUserId: "", amount: "", reason: "" });

  const fetchHistory = async () => {
    try {
      const { data } = await bonusAPI.getHistory({ limit: 50 });
      if (data.success) setHistory(data.data || []);
    } catch { toast.error("Failed to load bonus history"); }
    finally { setLoading(false); }
  };

  const searchUsers = async (q) => {
    try {
      const { data } = await bonusAPI.searchUsers(q);
      if (data.success) setSearchResults(data.data || []);
    } catch { setSearchResults([]); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val.length >= 2) searchUsers(val);
    else setSearchResults([]);
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!form.targetUserId || !form.amount) return toast.error("Select a user and enter an amount");
    try {
      const { data } = await bonusAPI.issueBonus({ targetUserId: form.targetUserId, amount: Number(form.amount), reason: form.reason });
      if (data.success) { toast.success(data.message || "Bonus issued"); setShowIssuer(false); setForm({ targetUserId: "", amount: "", reason: "" }); setSearchResults([]); fetchHistory(); }
      else toast.error(data.message);
    } catch { toast.error("Failed to issue bonus"); }
  };

  const selectUser = (u) => {
    setForm({ ...form, targetUserId: u._id });
    setSearchResults([]);
    setSearch(u.name);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#060a14] min-h-full text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Bonus Management</h1>
          <p className="text-slate-400 text-sm mt-1">Issue bonuses to users and review bonus history</p>
        </div>
        <button onClick={() => setShowIssuer(true)} className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-amber-500/35">
          <Plus size={16} /> Issue Bonus
        </button>
      </div>

      <div className="bg-[#0d1530] border border-blue-500/30 shadow-blue-500/15 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-blue-500/10">
          <h2 className="font-semibold text-white flex items-center gap-2"><History size={16} className="text-slate-400" /> Bonus History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-500/10">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Reason</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400">Loading bonus history…</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400">No bonus records found.</td></tr>
              ) : (
                history.map((b, i) => (
                  <tr key={i} className={`hover:bg-blue-500/5 transition-all ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                    <td className="px-5 py-3 text-slate-400">{b.createdAt ? new Date(b.createdAt).toLocaleString() : "-"}</td>
                    <td className="px-5 py-3 text-slate-300">{b.user?.name || "-"}</td>
                    <td className="px-5 py-3 text-emerald-400 font-medium">PKR {(b.amount || 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-slate-400">{b.reason || "-"}</td>
                    <td className="px-5 py-3"><span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Completed</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showIssuer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowIssuer(false)}>
          <div className="w-full max-w-md bg-[#0d1530] border border-blue-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(59,130,246,0.15)]" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">Issue Bonus</h2>
            <form onSubmit={handleIssue} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400">Search User</label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" value={search} onChange={handleSearch} placeholder="Type to search user..." className="w-full bg-[#050810] border border-blue-500/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:shadow-[0_0_10px_rgba(59,130,246,0.25)]" />
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto bg-[#050810] border border-blue-500/20 rounded-lg">
                    {searchResults.map((u) => (
                      <div key={u._id} className="p-2 hover:bg-blue-500/10 cursor-pointer rounded text-sm" onClick={() => selectUser(u)}>
                        <p className="text-white font-medium">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-slate-400">Amount (PKR)</label>
                <input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} required className="w-full bg-[#050810] border border-blue-500/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:shadow-[0_0_10px_rgba(59,130,246,0.25)]" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Reason</label>
                <input value={form.reason} onChange={(e) => setForm({...form, reason: e.target.value})} className="w-full bg-[#050810] border border-blue-500/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:shadow-[0_0_10px_rgba(59,130,246,0.25)]" placeholder="Optional reason..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowIssuer(false)} className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/35">Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

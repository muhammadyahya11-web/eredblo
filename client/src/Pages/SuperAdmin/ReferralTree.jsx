import React, { useState, useEffect } from "react";
import { Network, Search, User as UserIcon, Copy, ChevronDown, ChevronRight } from "lucide-react";
import { referralAPI } from "../../services/api";

const TierBadge = ({ level }) => {
  const map = { 1: "bg-blue-500/15 text-blue-400 border-blue-500/30", 2: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", 3: "bg-purple-500/15 text-purple-400 border-purple-500/30", 4: "bg-amber-500/15 text-amber-400 border-amber-500/30", 5: "bg-rose-500/15 text-rose-400 border-rose-500/30" };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${map[level] || map[1]}`}>Tier {level}</span>;
};

export default function SuperAdminReferralTree() {
  const [rootUser, setRootUser] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val.length >= 2) {
      setLoading(true);
      referralAPI.searchUser(val).then(({ data }) => {
        setSearchResults(data.data || []);
        setLoading(false);
      }).catch(() => { setSearchResults([]); setLoading(false); });
    } else setSearchResults([]);
  };

  const loadTree = (userId) => {
    setLoading(true);
    referralAPI.getTree(userId).then(({ data }) => {
      if (data.success) { setRootUser(data.data); }
      setLoading(false);
    }).catch(() => { setRootUser(null); setLoading(false); });
  };

  const TreeNode = ({ node, level = 0 }) => {
    const [expanded, setExpanded] = useState(level < 1);
    const children = node.children || [];
    const hasChildren = children.length > 0;
    const isRoot = level === 0;
    const pl = level * 5;
    const toggleNode = (e) => {
      e.stopPropagation();
      setExpanded(!expanded);
    };

    return (
      <div className="select-none">
        <div
          className="flex items-center gap-3 py-2.5 pr-3 rounded-xl bg-[#0d152a] border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer group"
          onClick={toggleNode}
        >
          {hasChildren && (
            <button type="button" onClick={toggleNode} className="p-0.5 rounded text-slate-400 hover:text-white group-hover:text-blue-400">
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isRoot ? "bg-gradient-to-br from-rose-500 to-red-400 shadow-lg shadow-rose-500/30" : "bg-blue-500/15 border border-blue-500/30"}`}>
            {isRoot ? <UserIcon size={16} className="text-white font-bold" /> : <Network size={14} className="text-blue-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">{node.name}</p>
            <p className="text-[11px] text-slate-500">{node.email}</p>
          </div>
          <TierBadge level={level + 1} />
          <div className="text-right">
            <p className="text-xs text-emerald-400 font-semibold">PKR {(node.totalInvestment || 0).toLocaleString()}</p>
            <p className="text-[10px] text-slate-500">invested</p>
          </div>
        </div>
        {expanded && hasChildren && (
          <div className="pl-2 ml-4 border-l border-blue-500/10">
            {children.map((c) => <TreeNode key={c._id || c.id} node={c} level={level + 1} />)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#060a14] min-h-full text-white">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Referral Tree</h1>
        <p className="text-slate-400 text-sm mt-1">Visualize user referral networks and team structures</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search user by name or email..."
          className="w-full bg-[#0d1530] border border-blue-500/30 focus:border-blue-400 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:shadow-[0_0_12px_rgba(59,130,246,0.25)]"
        />
      </div>

      {searchResults.length > 0 && (
        <div className="bg-[#0d1530] border border-blue-500/30 shadow-blue-500/15 rounded-xl overflow-hidden">
          <div className="px-4 py-2 text-xs font-semibold text-blue-400 border-b border-blue-500/10">Search results</div>
          {searchResults.map((u) => (
            <div key={u._id} className="flex items-center justify-between p-3 hover:bg-blue-500/5 border-b border-blue-500/5 last:border-0 cursor-pointer" onClick={() => { setSearchResults([]); setSearch(""); loadTree(u._id); }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">{(u.name?.[0] || "U").toUpperCase()}</div>
                <div>
                  <p className="text-sm font-medium text-white">{u.name} <span className="text-slate-500">{u.email}</span></p>
                </div>
              </div>
              <button className="text-xs text-cyan-400 hover:text-cyan-300">Load tree</button>
            </div>
          ))}
        </div>
      )}

      {loading && !rootUser && (
        <div className="text-center py-12 text-slate-400"><Network size={32} className="mx-auto mb-3 opacity-40" />Loading referral tree…</div>
      )}

      {!loading && rootUser && (
        <div className="bg-[#0d1530] border border-blue-500/30 shadow-blue-500/15 rounded-xl p-5">
          <div className="mb-4 pb-3 border-b border-blue-500/10">
            <span className="text-xs text-slate-400">Root sponsor</span>
            <p className="text-lg font-bold text-white">{rootUser.name}</p>
          </div>
          <div className="space-y-1.5">
            <TreeNode node={rootUser} level={0} />
          </div>
        </div>
      )}
    </div>
  );
}

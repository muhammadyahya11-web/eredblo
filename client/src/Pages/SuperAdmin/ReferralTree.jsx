import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Network,
  Search,
  ChevronDown,
  ChevronRight,
  Users,
  X,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { referralAPI } from "../../services/api";

// ─── TreeNode ────────────────────────────────────────────────────────────────

function TreeNode({ node, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth === 0);

  const hasChildren = Array.isArray(node.children) && node.children.length > 0;

  const statusColor =
    node.status === "blocked"
      ? "bg-red-500/10 text-red-400 border border-red-500/20"
      : "bg-green-500/10 text-green-400 border border-green-500/20";

  return (
    <div>
      {/* Node card */}
      <div className="bg-[#0d1530] border border-white/5 rounded-xl p-4 hover:border-blue-500/20 transition-all duration-200">
        <div className="flex items-start gap-3">
          {/* Expand/collapse button */}
          <button
            onClick={() => setExpanded((v) => !v)}
            disabled={!hasChildren}
            className={`mt-0.5 flex-shrink-0 p-1 rounded-lg transition-all duration-200 ${
              hasChildren
                ? "text-blue-400 hover:bg-blue-500/10 cursor-pointer"
                : "text-slate-600 cursor-default"
            }`}
            title={hasChildren ? (expanded ? "Collapse" : "Expand") : "No downline"}
          >
            {hasChildren ? (
              expanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )
            ) : (
              <ChevronRight size={16} className="opacity-30" />
            )}
          </button>

          {/* Avatar */}
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-900/40">
            {(node.name || "?")[0].toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="font-semibold text-white text-sm truncate">{node.name || "—"}</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                {node.status === "blocked" ? "Blocked" : "Active"}
              </span>
            </div>

            <p className="text-xs text-slate-400 truncate mb-2">{node.email || "—"}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Referral Code</p>
                <p className="text-xs text-blue-300 font-mono font-medium">{node.referralCode || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Investment</p>
                <p className="text-xs text-slate-300 font-medium">
                  RS {Number(node.totalInvestment || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Earnings</p>
                <p className="text-xs text-green-400 font-medium">
                  RS {Number(node.totalEarnings || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {hasChildren && (
              <p className="mt-2 text-[10px] text-slate-500">
                <Users size={10} className="inline mr-1" />
                {node.children.length} direct referral{node.children.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div className="border-l-2 border-blue-500/30 ml-4 pl-4 mt-2 space-y-2">
          {node.children.map((child, idx) => (
            <TreeNode key={child._id || idx} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ReferralTree Page ────────────────────────────────────────────────────────

export default function ReferralTree() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [treeLoading, setTreeLoading] = useState(false);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceTimer = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!val.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await referralAPI.searchUser(val.trim());
        const users = Array.isArray(data) ? data : (data?.data || []);
        setSearchResults(users);
        setShowDropdown(true);
      } catch (err) {
        toast.error(err.response?.data?.message || "Search failed");
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  }, []);

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setSearchQuery(user.name || user.email || "");
    setShowDropdown(false);
    setSearchResults([]);
    setTreeData(null);
    setTreeLoading(true);

    try {
      const { data } = await referralAPI.getTree(user._id);
      // API may return { data: {...} } or the tree object directly
      const tree = data?.data || data;
      setTreeData(tree);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load referral tree");
      setTreeData(null);
    } finally {
      setTreeLoading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedUser(null);
    setTreeData(null);
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#060a14] min-h-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Network size={22} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Referral Tree</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Visualize user downlines and referral hierarchies
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <div ref={searchRef} className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={18}
          />
          <input
            type="text"
            placeholder="Search user by name or email…"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            className="w-full bg-[#0d1530] border border-blue-500/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors focus:shadow-[0_0_15px_rgba(59,130,246,0.15)]"
          />
          {/* Right-side indicator */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {searchLoading ? (
              <Loader2 size={16} className="animate-spin text-blue-400" />
            ) : selectedUser ? (
              <button
                onClick={handleClearSelection}
                className="text-slate-400 hover:text-white transition-colors"
                title="Clear selection"
              >
                <X size={16} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Dropdown results */}
        {showDropdown && searchResults.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 top-full mt-1 w-full bg-[#0d1530] border border-blue-500/20 rounded-xl shadow-xl shadow-black/40 overflow-hidden"
          >
            {searchResults.map((u) => (
              <button
                key={u._id}
                onClick={() => handleSelectUser(u)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-500/10 transition-colors text-left border-b border-white/5 last:border-0"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {(u.name || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{u.name}</p>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                </div>
                {u.referralCode && (
                  <span className="text-xs text-blue-300 font-mono bg-blue-500/10 px-2 py-0.5 rounded-md flex-shrink-0">
                    {u.referralCode}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {showDropdown && !searchLoading && searchResults.length === 0 && searchQuery.trim() && (
          <div
            ref={dropdownRef}
            className="absolute z-50 top-full mt-1 w-full bg-[#0d1530] border border-blue-500/20 rounded-xl shadow-xl shadow-black/40 px-4 py-4 text-center text-sm text-slate-400"
          >
            No users found for &ldquo;{searchQuery}&rdquo;
          </div>
        )}
      </div>

      {/* Tree area */}
      <div className="space-y-4">
        {/* Loading state */}
        {treeLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <p className="text-sm">Loading referral tree…</p>
          </div>
        )}

        {/* No user selected */}
        {!treeLoading && !selectedUser && !treeData && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-4">
            <div className="p-5 rounded-full bg-[#0d1530] border border-white/5">
              <Network size={40} className="text-blue-500/40" />
            </div>
            <p className="text-base font-medium text-slate-400">
              Search for a user to view their referral tree
            </p>
            <p className="text-sm text-slate-600 text-center max-w-xs">
              Type a name or email in the search box above, then select a user to
              visualize their referral hierarchy.
            </p>
          </div>
        )}

        {/* Selected user header + tree */}
        {!treeLoading && treeData && (
          <div className="space-y-3">
            {/* Context bar */}
            <div className="flex items-center justify-between bg-[#0d1530] border border-blue-500/10 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm">
                <Users size={16} className="text-blue-400" />
                <span className="text-slate-300">
                  Showing referral tree for{" "}
                  <span className="font-semibold text-white">
                    {selectedUser?.name || treeData.name}
                  </span>
                </span>
              </div>
              <button
                onClick={handleClearSelection}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
              >
                <X size={13} />
                Clear
              </button>
            </div>

            {/* Tree root */}
            <div className="space-y-2">
              <TreeNode node={treeData} depth={0} />
            </div>
          </div>
        )}

        {/* User selected but empty tree returned */}
        {!treeLoading && selectedUser && treeData === null && !treeLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
            <Users size={32} className="text-slate-600" />
            <p className="text-sm">No referral tree data available for this user.</p>
          </div>
        )}
      </div>
    </div>
  );
}

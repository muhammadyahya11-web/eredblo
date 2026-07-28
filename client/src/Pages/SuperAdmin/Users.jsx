import React, { useState, useEffect } from "react";
import { Search, Shield, ShieldOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { adminAPI } from "../../services/api";

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getUsers?.({ role: "user" }) || [];
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data?.data) {
        setUsers(data.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleToggleStatus = async (id) => {
    try {
      const { data } = await adminAPI.updateUserStatus(id);
      toast.success(data.message);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, status: data.status } : u)));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-[#0a0f1e] min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
        <p className="text-slate-400 text-sm mt-1">Manage and monitor all registered users</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#050810] border border-blue-500/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
        />
      </div>

      <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-500/10">
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Balance</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Invested</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Earnings</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Joined</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <Loader2 className="animate-spin inline mr-2" size={18} /> Loading users...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">No users found.</td>
                </tr>
              ) : (
                filtered.map((u, idx) => (
                  <tr key={u._id} className={`hover:bg-blue-500/5 transition-all duration-300 border-b border-white/5 last:border-0 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-white">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="text-slate-300 px-5 py-4">RS {Number(u.totalBalance || 0).toLocaleString()}</td>
                    <td className="text-slate-300 px-5 py-4">RS {Number(u.totalInvestment || 0).toLocaleString()}</td>
                    <td className="text-green-400 px-5 py-4">RS {Number(u.totalEarnings || 0).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.status === "blocked" 
                          ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                          : "bg-green-500/10 text-green-400 border border-green-500/20"
                      }`}>
                        {u.status === "blocked" ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="text-slate-400 px-5 py-4">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleStatus(u._id)}
                        className="p-2 rounded-lg hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-all duration-300 border border-transparent hover:border-blue-500/20"
                        title={u.status === "blocked" ? "Activate" : "Block"}
                      >
                        {u.status === "blocked" ? <Shield size={16} /> : <ShieldOff size={16} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

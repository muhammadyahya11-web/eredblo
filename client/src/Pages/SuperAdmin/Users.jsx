import React, { useState, useEffect } from "react";
import { Search, Shield, ShieldOff, Loader2, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { adminAPI } from "../../services/api";

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", cnic: "", role: "", status: "", isVerified: false });
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(null);

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
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, status: data.data?.status || data.status } : u)));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const openEdit = (u) => {
    setEditing(u);
    setEditForm({
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      cnic: u.cnic || "",
      role: u.role || "user",
      status: u.status || "active",
      isVerified: !!u.isVerified,
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await adminAPI.updateUser(editing._id, editForm);
      if (data.success) {
        setUsers((prev) => prev.map((u) => (u._id === data.data._id ? data.data : u)));
        toast.success(data.message);
        setEditing(null);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      const { data } = await adminAPI.deleteUser(deleting._id);
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== deleting._id));
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleting(null);
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(u._id)}
                          className="p-2 rounded-lg hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-all duration-300 border border-transparent hover:border-blue-500/20"
                          title={u.status === "blocked" ? "Activate" : "Block"}
                        >
                          {u.status === "blocked" ? <Shield size={16} /> : <ShieldOff size={16} />}
                        </button>
                        <button
                          onClick={() => openEdit(u)}
                          className="p-2 rounded-lg hover:bg-yellow-500/10 text-slate-400 hover:text-yellow-400 transition-all duration-300 border border-transparent hover:border-yellow-500/20"
                          title="Edit user"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleting(u)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all duration-300 border border-transparent hover:border-red-500/20"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md bg-[#0d1530] border border-blue-500/20 rounded-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white">Edit User</h2>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Name</label>
                <input name="name" value={editForm.name} onChange={handleEditChange} className="w-full bg-[#050810] border border-blue-500/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Email</label>
                <input name="email" type="email" value={editForm.email} onChange={handleEditChange} className="w-full bg-[#050810] border border-blue-500/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Phone</label>
                <input name="phone" value={editForm.phone} onChange={handleEditChange} className="w-full bg-[#050810] border border-blue-500/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400">CNIC</label>
                <input name="cnic" value={editForm.cnic} onChange={handleEditChange} placeholder="00000-0000000-0" className="w-full bg-[#050810] border border-blue-500/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-slate-400">Role</label>
                  <select name="role" value={editForm.role} onChange={handleEditChange} className="w-full bg-[#050810] border border-blue-500/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-400">Status</label>
                  <select name="status" value={editForm.status} onChange={handleEditChange} className="w-full bg-[#050810] border border-blue-500/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" name="isVerified" checked={editForm.isVerified} onChange={handleEditChange} />
                Verified
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDeleting(null)}>
          <div className="w-full max-w-sm bg-[#0d1530] border border-red-500/20 rounded-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white">Delete User</h2>
            <p className="text-sm text-slate-300">
              Are you sure you want to delete <span className="font-semibold text-white">{deleting.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleting(null)} className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-500 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

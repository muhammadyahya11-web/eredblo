import React, { useState, useEffect } from "react";
import { Search, UserPlus, Trash2, Shield, ShieldOff, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { adminAPI } from "../../services/api";

export default function SuperAdminAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getAdmins();
      if (data.success) setAdmins(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAdmins(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      toast.error("All fields are required");
      return;
    }
    try {
      setSaving(true);
      const { data } = await adminAPI.createAdmin(form);
      if (data.success) {
        toast.success("Admin created successfully");
        setShowModal(false);
        setForm({ name: "", email: "", phone: "", password: "" });
        loadAdmins();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create admin");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove admin "${name}"? This cannot be undone.`)) return;
    try {
      const { data } = await adminAPI.deleteAdmin(id);
      if (data.success) {
        toast.success("Admin removed");
        setAdmins((prev) => prev.filter((a) => a._id !== id));
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove admin");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const admin = admins.find((a) => a._id === id);
      const newStatus = admin?.status === 'blocked' ? 'active' : 'blocked';
      const { data } = await adminAPI.updateUserStatus(id, newStatus);
      if (data.success) {
        toast.success(data.message);
        setAdmins((prev) => prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a)));
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const filtered = admins.filter(
    (a) =>
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-[#0a0f1e] min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Manage Admins</h1>
          <p className="text-slate-400 text-sm mt-1">Add or remove admin accounts</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white text-sm font-medium rounded-xl px-4 py-3 transition-all duration-300 shadow-[0_4px_20px_rgba(220,38,38,0.3)] hover:shadow-[0_4px_30px_rgba(220,38,38,0.4)]"
        >
          <UserPlus size={16} /> Add Admin
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search admins..."
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
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Created</th>
                <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    <Loader2 className="animate-spin inline mr-2" size={18} /> Loading admins...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">No admins found. Add your first admin.</td>
                </tr>
              ) : (
                filtered.map((a, idx) => (
                  <tr key={a._id} className={`hover:bg-blue-500/5 transition-all duration-300 border-b border-white/5 last:border-0 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-white">{a.name}</p>
                        <p className="text-xs text-slate-400">{a.email}</p>
                      </div>
                    </td>
                    <td className="text-slate-300 px-5 py-4">{a.phone || "-"}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        a.status === "blocked" 
                          ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                          : "bg-green-500/10 text-green-400 border border-green-500/20"
                      }`}>
                        {a.status === "blocked" ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="text-slate-400 px-5 py-4">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "-"}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(a._id)}
                          className="p-2 rounded-lg hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-all duration-300 border border-transparent hover:border-blue-500/20"
                          title={a.status === "blocked" ? "Activate" : "Block"}
                        >
                          {a.status === "blocked" ? <Shield size={16} /> : <ShieldOff size={16} />}
                        </button>
                        <button
                          onClick={() => handleDelete(a._id, a.name)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all duration-300 border border-transparent hover:border-red-500/20"
                          title="Remove Admin"
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => !saving && setShowModal(false)}>
          <div
            className="w-full max-w-md bg-[#0d1530] border border-blue-500/20 rounded-2xl p-6 relative shadow-[0_0_40px_rgba(59,130,246,0.15)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => !saving && setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-white mb-1">Add New Admin</h2>
            <p className="text-slate-400 text-sm mb-5">Create a new admin account with full admin privileges.</p>

            <form onSubmit={handleCreate} className="space-y-4">
              {[
                { key: "name", label: "Full Name", type: "text", placeholder: "John Doe" },
                { key: "email", label: "Email", type: "email", placeholder: "admin@example.com" },
                { key: "phone", label: "Phone", type: "tel", placeholder: "+923001234567 or 03001234567" },
                { key: "password", label: "Password", type: "password", placeholder: "Min. 8 characters, strong password" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    required
                  />
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="flex-1 bg-[#050810] border border-blue-500/10 text-slate-300 text-sm font-medium rounded-xl py-3 hover:border-blue-500/30 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white text-sm font-medium rounded-xl py-3 transition-all duration-300 shadow-[0_4px_20px_rgba(220,38,38,0.3)] disabled:opacity-60"
                >
                  {saving ? (<><Loader2 className="animate-spin" size={16} /> Creating...</>) : (<><UserPlus size={16} /> Create Admin</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

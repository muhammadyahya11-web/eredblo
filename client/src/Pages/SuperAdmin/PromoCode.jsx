import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Copy, Calendar, CheckCircle2, XCircle, Search, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { promoAPI } from "../../services/api";

const statusColors = {
  active: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  inactive: "bg-slate-500/15 text-slate-400 border border-slate-500/30",
};

export default function SuperAdminPromoCode() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ code: "", discountType: "fixed", discountValue: "", maxUses: "", expiryDate: "" });
  const [saving, setSaving] = useState(false);

  const fetchPromos = async () => {
    try {
      const { data } = await promoAPI.getAll();
      if (data.success) setPromos(data.data || []);
    } catch { toast.error("Failed to load promo codes"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPromos(); }, []);

  const openCreate = () => { setEditing(null); setForm({ code: "", discountType: "fixed", discountValue: "", maxUses: "", expiryDate: "" }); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ code: p.code, discountType: p.discountType || "fixed", discountValue: p.discountValue || "", maxUses: p.maxUses || "", expiryDate: p.expiryDate ? new Date(p.expiryDate).toISOString().slice(0, 10) : "" }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, discountValue: Number(form.discountValue), maxUses: Number(form.maxUses), expiryDate: form.expiryDate ? new Date(form.expiryDate) : undefined };
      let res;
      if (editing) res = await promoAPI.update(editing._id, payload);
      else res = await promoAPI.create(payload);
      if (res.data.success) { toast.success(editing ? "Promo updated" : "Promo created"); setShowModal(false); fetchPromos(); }
      else toast.error(res.data.message);
    } catch { toast.error("Operation failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this promo code?")) return;
    try {
      const { data } = await promoAPI.delete(id);
      if (data.success) { toast.success("Promo deleted"); setPromos(p => p.filter(x => x._id !== id)); }
      else toast.error(data.message);
    } catch { toast.error("Delete failed"); }
  };

  const copyCode = (code) => { navigator.clipboard.writeText(code); toast.success("Code copied"); };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#060a14] min-h-full text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Promo Codes</h1>
          <p className="text-slate-400 text-sm mt-1">Create and manage promotional codes</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/35">
          <Plus size={16} /> Create Promo Code
        </button>
      </div>

      <div className="bg-[#0d1530] border border-blue-500/30 shadow-blue-500/15 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-500/10">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Code</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Value</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Usage</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Expiry</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading promo codes...</td></tr>
              ) : promos.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">No promo codes found.</td></tr>
              ) : (
                promos.map((p, i) => (
                  <tr key={p._id} className={`hover:bg-blue-500/5 transition-all ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-blue-400 font-mono bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">{p.code}</code>
                        <button onClick={() => copyCode(p.code)} className="p-1 rounded hover:bg-blue-500/10 text-slate-400 hover:text-blue-400" title="Copy"><Copy size={13} /></button>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-300">{p.discountType === "percentage" ? "Percentage" : "Fixed"}</td>
                    <td className="px-5 py-3 text-emerald-400 font-medium">{p.discountType === "percentage" ? `${p.discountValue}%` : `PKR ${p.discountValue}`}</td>
                    <td className="px-5 py-3 text-slate-300">{p.usedCount || 0} / {p.maxUses || 0}</td>
                    <td className="px-5 py-3 text-slate-400">{p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : "-"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[p.isActive ? "active" : "inactive"]}`}>{p.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-yellow-500/10 text-yellow-400"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 size={14} /></button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md bg-[#0d1530] border border-blue-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(59,130,246,0.15)]" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">{editing ? "Edit Promo Code" : "Create Promo Code"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400">Code</label>
                <input name="code" value={form.code} onChange={(e) => setForm({...form, code: e.target.value})} required className="w-full bg-[#050810] border border-blue-500/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:shadow-[0_0_10px_rgba(59,130,246,0.25)]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400">Type</label>
                  <select name="discountType" value={form.discountType} onChange={(e) => setForm({...form, discountType: e.target.value})} className="w-full bg-[#050810] border border-blue-500/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                    <option value="fixed">Fixed</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Value</label>
                  <input name="discountValue" type="number" value={form.discountValue} onChange={(e) => setForm({...form, discountValue: e.target.value})} required className="w-full bg-[#050810] border border-blue-500/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:shadow-[0_0_10px_rgba(59,130,246,0.25)]" placeholder={form.discountType === "percentage" ? "10" : "500"} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400">Max Uses</label>
                  <input name="maxUses" type="number" value={form.maxUses} onChange={(e) => setForm({...form, maxUses: e.target.value})} className="w-full bg-[#050810] border border-blue-500/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:shadow-[0_0_10px_rgba(59,130,246,0.25)]" />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Expiry Date</label>
                  <input name="expiryDate" type="date" value={form.expiryDate} onChange={(e) => setForm({...form, expiryDate: e.target.value})} className="w-full bg-[#050810] border border-blue-500/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:shadow-[0_0_10px_rgba(59,130,246,0.25)]" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/40 disabled:opacity-50">{saving ? "Saving..." : (editing ? "Update" : "Create")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

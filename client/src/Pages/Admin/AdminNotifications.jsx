import React, { useState, useEffect } from "react";
import { Bell, Send, Users } from "lucide-react";
import { notificationAPI } from '../../services/api';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';

export default function AdminNotifications() {
  const [showForm, setShowForm] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [form, setForm] = useState({ title: "", message: "", type: "System", userId: "" });

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationAPI.getAll({ page, limit });
      if (data.success) {
        setNotifications(data.data);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, [page, limit]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    setSending(true);
    try {
      const { data } = await notificationAPI.create({
        ...form,
        userId: form.userId || undefined,
      });
      if (data.success) {
        toast.success('Notification sent');
        setForm({ title: "", message: "", type: "System", userId: "" });
        setShowForm(false);
        fetchNotifications();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const stats = {
    total: total,
    thisMonth: notifications.filter(n => {
      const d = new Date(n.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-[#0a0f1e] min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
          <p className="text-slate-400 text-sm mt-1">Send and manage platform notifications</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_12px_rgba(37,99,235,0.35)]">
          <Send size={18} /> Send Notification
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-white text-base tracking-tight">New Notification</h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="form-group">
              <label>Title</label>
              <input type="text" placeholder="Notification title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none" required />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea placeholder="Notification message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none">
                  <option value="System">System</option>
                  <option value="Deposit">Deposit</option>
                  <option value="Withdrawal">Withdrawal</option>
                  <option value="Profit">Profit</option>
                  <option value="Offer">Offer</option>
                </select>
              </div>
              <div className="form-group">
                <label>Target User ID (optional)</label>
                <input type="text" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} placeholder="Leave empty for broadcast" className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <button type="submit" disabled={sending} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50">
              {sending ? 'Sending...' : 'Send Notification'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Bell className="text-blue-400" size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Sent</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
        </div>
        <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <Users className="text-green-400" size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">This Month</p>
            <p className="text-2xl font-bold text-white">{stats.thisMonth}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl overflow-hidden hover:border-blue-500/20 transition-all duration-500">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading notifications...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {notifications.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-8 text-slate-400">No notifications found</td></tr>
                ) : (
                  notifications.map((n) => (
                    <tr key={n._id} className="hover:bg-blue-500/5 rounded-lg transition-all duration-300">
                      <td className="font-medium text-white">{n.title}</td>
                      <td className="text-slate-400 max-w-xs truncate">{n.message}</td>
                      <td>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${n.type === 'Offer' ? 'bg-purple-500/10 text-purple-400' : n.type === 'System' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                          {n.type}
                        </span>
                      </td>
                      <td className="text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        page={page}
        pages={pages}
        total={total}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />
    </div>
  );
}

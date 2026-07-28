import React, { useState, useEffect } from "react";
import { Send, Bell, X } from "lucide-react";
import { notificationAPI, settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const typeStyles = {
  system: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  deposit: "bg-green-500/10 text-green-400 border-green-500/20",
  withdrawal: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  profit: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  offer: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export default function SuperAdminNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("System");
  const [userId, setUserId] = useState("");
  const [sending, setSending] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationAPI.getAll({ limit: 20 });
      if (data.success) setNotifications(data.data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    setSending(true);
    try {
      const { data } = await notificationAPI.create({
        title,
        message,
        type,
        userId: userId || undefined,
        isImportant: true,
      });
      if (data.success) {
        toast.success('Notification sent successfully');
        setTitle('');
        setMessage('');
        setUserId('');
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

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-[#0a0f1e] min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
        <p className="text-slate-400 text-sm mt-1">Send and manage notifications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="col-span-1 lg:col-span-5 bg-[#0d1530] border border-blue-500/10 rounded-xl p-5">
          <h2 className="font-semibold text-white text-base mb-4">Compose Notification</h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" required className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Write your message..." required className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] resize-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors">
                <option value="System">System</option>
                <option value="Deposit">Deposit</option>
                <option value="Withdrawal">Withdrawal</option>
                <option value="Profit">Profit</option>
                <option value="Offer">Offer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Target User ID (optional, leave empty for broadcast)</label>
              <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Leave empty to send to all users" className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
            </div>
            <button type="submit" disabled={sending} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white text-sm font-medium rounded-xl py-3 transition-all duration-300 shadow-[0_4px_20px_rgba(220,38,38,0.3)] disabled:opacity-50">
              <Send size={16} /> {sending ? 'Sending...' : 'Send Notification'}
            </button>
          </form>
        </div>

        <div className="col-span-1 lg:col-span-7 bg-[#0d1530] border border-blue-500/10 rounded-xl p-5">
          <h2 className="font-semibold text-white text-base mb-4">Recent Notifications</h2>
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading notifications...</div>
          ) : (
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No notifications sent yet</p>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className="flex items-center gap-3 p-4 bg-[#050810] border border-blue-500/10 rounded-xl hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Bell size={18} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{n.title}</p>
                      <p className="text-xs text-slate-400 truncate">{n.message}</p>
                      <span className={`inline-flex items-center mt-1 text-xs px-2 py-0.5 rounded-full border ${typeStyles[n.type?.toLowerCase()] || typeStyles.system}`}>{n.type}</span>
                    </div>
                    <span className="text-xs text-slate-500 flex-shrink-0">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

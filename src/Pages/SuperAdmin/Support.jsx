import React, { useState, useEffect } from "react";
import { Search, MessageCircle, CheckCircle, X, ChevronLeft } from "lucide-react";
import { supportAPI } from '../../services/api';
import toast from 'react-hot-toast';

const statusStyles = {
  open: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  closed: "bg-green-500/10 text-green-400 border-green-500/20",
};

export default function SuperAdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  const fetchTickets = async () => {
    try {
      const params = {};
      if (filter !== 'All') params.status = filter;
      const { data } = await supportAPI.getAll(params);
      if (data.success) setTickets(data.data);
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [filter]);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      const { data } = await supportAPI.reply(selectedTicket._id, { message: replyText });
      if (data.success) {
        setSelectedTicket(data.data);
        setReplyText('');
        fetchTickets();
        toast.success('Reply sent');
      }
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const { data } = await supportAPI.updateStatus(id, { status });
      if (data.success) {
        setSelectedTicket(data.data);
        fetchTickets();
        toast.success('Status updated');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filtered = tickets;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-[#0a0f1e] min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Support Tickets</h1>
        <p className="text-slate-400 text-sm mt-1">Manage user support tickets</p>
      </div>

      {selectedTicket ? (
        <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{selectedTicket.subject}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[selectedTicket.status?.toLowerCase()?.replace(' ', '_')] || statusStyles.open}`}>
                  {selectedTicket.status}
                </span>
                <span className="text-slate-400 text-sm">{selectedTicket.category}</span>
              </div>
            </div>
            <button className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-sm" onClick={() => setSelectedTicket(null)}>
              <ChevronLeft size={16} /> Back
            </button>
          </div>
          <div className="space-y-3 mt-4">
            {selectedTicket.replies?.map((reply, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${
                reply.isAdmin 
                  ? 'bg-blue-500/5 border-blue-500/10 ml-8' 
                  : 'bg-white/5 border-white/5 mr-8'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <strong className="text-sm text-white">{reply.isAdmin ? 'Support Team (You)' : reply.user?.name || 'User'}</strong>
                  <span className="text-xs text-slate-500">{new Date(reply.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-300">{reply.message}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            <select value={selectedTicket.status} onChange={(e) => handleUpdateStatus(selectedTicket._id, e.target.value)} className="bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors w-full">
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
            <textarea 
              rows="3" 
              value={replyText} 
              onChange={(e) => setReplyText(e.target.value)} 
              placeholder="Type your reply..." 
              className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors resize-none"
            />
            <button onClick={handleReply} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-medium rounded-xl py-3 transition-all duration-300 shadow-[0_4px_20px_rgba(59,130,246,0.3)]">
              <MessageCircle size={16} /> Send Reply
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            {["All", "Open", "In Progress", "Closed"].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border ${
                filter === f 
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                  : "bg-[#0d1530] text-slate-400 border-blue-500/10 hover:border-blue-500/30 hover:text-white"
              }`}>
                {f}
              </button>
            ))}
          </div>
          <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading tickets...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blue-500/10">
                      <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Subject</th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-8 text-slate-400">No tickets found</td></tr>
                    ) : (
                      filtered.map((t, idx) => (
                        <tr key={t._id} className={`hover:bg-blue-500/5 transition-all duration-300 border-b border-white/5 last:border-0 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-medium text-white">{t.user?.name || 'Unknown'}</p>
                              <p className="text-xs text-slate-400">{t.user?.email || ''}</p>
                            </div>
                          </td>
                          <td className="text-slate-300 px-5 py-4">{t.subject}</td>
                          <td className="px-5 py-4 text-slate-400">{t.category}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[t.status?.toLowerCase()?.replace(' ', '_')] || statusStyles.open}`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="text-slate-400 px-5 py-4">{new Date(t.createdAt).toLocaleDateString()}</td>
                          <td className="px-5 py-4">
                            <button onClick={() => setSelectedTicket(t)} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-all duration-300 border border-blue-500/20">View</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

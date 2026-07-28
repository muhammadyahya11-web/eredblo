import React, { useState, useEffect } from "react";
import { Search, MessageSquare, Eye, XCircle, CheckCircle } from "lucide-react";
import { supportAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTickets = async () => {
    try {
      const params = {};
      if (filter !== 'All') params.status = filter;
      if (statusFilter) params.status = statusFilter;
      const { data } = await supportAPI.getAll(params);
      if (data.success) setTickets(data.data);
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filter, statusFilter]);

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
        toast.success('Ticket status updated');
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
        <p className="text-slate-400 text-sm mt-1">Manage and respond to user support tickets</p>
      </div>

      {selectedTicket ? (
        <div className="section-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="section-title">{selectedTicket.subject}</h3>
              <span className={`status-badge ${selectedTicket.status.toLowerCase().replace(' ', '-')}`}>{selectedTicket.status}</span>
              <span className="text-slate-400 text-sm ml-3">{selectedTicket.category}</span>
            </div>
            <button className="btn-secondary" onClick={() => setSelectedTicket(null)}>← Back to Tickets</button>
          </div>

          <div className="replies-list mt-4 space-y-3">
            {selectedTicket.replies?.map((reply, idx) => (
              <div key={idx} className={`reply-bubble ${reply.isAdmin ? 'admin' : 'user'}`}>
                <div className="reply-header">
                  <strong>{reply.isAdmin ? 'Support Team (You)' : reply.user?.name || 'User'}</strong>
                  <span className="reply-date">{new Date(reply.createdAt).toLocaleString()}</span>
                </div>
                <p className="reply-message">{reply.message}</p>
              </div>
            ))}
          </div>

          <div className="reply-form mt-4 space-y-3">
            <select value={selectedTicket.status} onChange={(e) => handleUpdateStatus(selectedTicket._id, e.target.value)} className="bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white">
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
            <textarea
              rows="3"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
            />
            <button onClick={handleReply} className="btn-primary">Send Reply</button>
          </div>
        </div>
      ) : (
        <>
          <div className="table-filters">
            {["All", "Open", "In Progress", "Closed"].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`filter-btn ${filter === f ? "active" : ""}`}>{f}</button>
            ))}
          </div>

          <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading tickets...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Subject</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-8 text-slate-400">No tickets found</td></tr>
                    ) : (
                      filtered.map((t) => (
                        <tr key={t._id} className="hover:bg-blue-500/5 rounded-lg transition-all duration-300">
                          <td>
                            <div>
                              <p className="font-medium text-white">{t.user?.name || 'Unknown'}</p>
                              <p className="text-xs text-slate-400">{t.user?.email || ''}</p>
                            </div>
                          </td>
                          <td className="text-slate-300">{t.subject}</td>
                          <td>{t.category}</td>
                          <td><span className={`status-badge ${t.status.toLowerCase().replace(' ', '-')}`}>{t.status}</span></td>
                          <td className="text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button onClick={() => setSelectedTicket(t)} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-all">View</button>
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

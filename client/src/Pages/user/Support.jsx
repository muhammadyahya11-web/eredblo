import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { supportAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiMessageSquare, FiFileText, FiHelpCircle, FiArrowLeft } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const Support = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('new'); // 'new' | 'list' | 'detail'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({ subject: '', category: 'General', message: '' });
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    try {
      const { data } = await supportAPI.getMy();
      if (data.success) setTickets(data.data);
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await supportAPI.create(formData);
      if (data.success) {
        toast.success('Ticket created successfully!');
        setFormData({ subject: '', category: 'General', message: '' });
        fetchTickets();
        setViewMode('list');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
  };

  const statusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'in progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'closed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      
      {/* View Toggle */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-white text-xl font-bold">Support Center</h2>
          <p className="text-slate-400 text-xs mt-1">We are here to help you 24/7</p>
        </div>
        <button 
          onClick={() => setViewMode(viewMode === 'list' ? 'new' : 'list')}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
        >
          {viewMode === 'list' ? '+ New Ticket' : 'View My Tickets'}
        </button>
      </div>

      {viewMode === 'new' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Contact Options */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <h3 className="text-white font-semibold mb-2">Contact Us</h3>
            
            <a href="#" className="bg-[#0d152a] border border-[#1c2a4a] hover:border-blue-500/50 rounded-xl p-4 flex items-center gap-4 transition-all group">
              <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-full group-hover:scale-110 transition-transform">
                <FiMessageSquare size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-medium">Live Chat</span>
                <span className="text-slate-400 text-xs">Chat with our support team</span>
              </div>
            </a>

            <a href="https://wa.me/923001234567" target="_blank" rel="noreferrer" className="bg-[#0d152a] border border-[#1c2a4a] hover:border-blue-500/50 rounded-xl p-4 flex items-center gap-4 transition-all group">
              <div className="bg-green-500/10 text-[#25D366] p-3 rounded-full group-hover:scale-110 transition-transform">
                <FaWhatsapp size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-medium">WhatsApp</span>
                <span className="text-slate-400 text-xs">+92 300 1234567</span>
              </div>
            </a>

            <div onClick={() => setViewMode('new')} className="bg-[#1a2c5b]/20 border border-blue-500/50 rounded-xl p-4 flex items-center gap-4 cursor-pointer">
              <div className="bg-blue-500/20 text-blue-400 p-3 rounded-full">
                <FiFileText size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-blue-400 text-sm font-medium">Submit Ticket</span>
                <span className="text-slate-400 text-xs">Open a support ticket</span>
              </div>
            </div>

            <a href="/#faqs" className="bg-[#0d152a] border border-[#1c2a4a] hover:border-blue-500/50 rounded-xl p-4 flex items-center gap-4 transition-all group">
              <div className="bg-purple-500/10 text-purple-400 p-3 rounded-full group-hover:scale-110 transition-transform">
                <FiHelpCircle size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-medium">FAQ</span>
                <span className="text-slate-400 text-xs">Find answers to common questions</span>
              </div>
            </a>
          </div>

          {/* Right Column - Submit Ticket Form */}
          <div className="lg:col-span-8">
            <div className="bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-6 md:p-8">
              <h3 className="text-white font-semibold mb-6">Submit Ticket</h3>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-400">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Enter subject"
                    className="w-full bg-[#090f1e] border border-[#1c2a4a] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-400">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#090f1e] border border-[#1c2a4a] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                    required
                  >
                    <option value="General">General</option>
                    <option value="Deposit">Deposit</option>
                    <option value="Withdrawal">Withdrawal</option>
                    <option value="Investment">Investment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-slate-400">Message</label>
                  <textarea
                    rows="6"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Type your message here..."
                    className="w-full bg-[#090f1e] border border-[#1c2a4a] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 rounded-lg mt-2 transition-colors disabled:opacity-70 shadow-lg shadow-blue-500/20"
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>

              </form>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-6">
          <h3 className="text-white font-semibold mb-6">My Tickets</h3>
          {loading ? (
            <p className="text-slate-400 text-sm py-8 text-center">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No support tickets found.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {tickets.map((ticket) => (
                <div 
                  key={ticket._id} 
                  onClick={() => { setSelectedTicket(ticket); setViewMode('detail'); }}
                  className="bg-[#090f1e] border border-[#1c2a4a] hover:border-blue-500/50 rounded-xl p-5 cursor-pointer transition-colors flex items-start justify-between"
                >
                  <div className="flex flex-col gap-2">
                    <h4 className="text-white font-medium text-sm">{ticket.subject}</h4>
                    <span className="text-slate-500 text-xs">{ticket.category} • {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className={`border px-3 py-1 text-[10px] font-semibold rounded-full uppercase ${statusClass(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === 'detail' && selectedTicket && (
        <div className="bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-6">
          
          <div className="flex items-center justify-between border-b border-[#1c2a4a] pb-4 mb-6">
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 mb-2 w-max"
              >
                <FiArrowLeft /> Back to Tickets
              </button>
              <div className="flex items-center gap-3">
                <h3 className="text-white font-semibold text-lg">{selectedTicket.subject}</h3>
                <span className={`border px-3 py-1 text-[10px] font-semibold rounded-full uppercase ${statusClass(selectedTicket.status)}`}>
                  {selectedTicket.status}
                </span>
              </div>
              <span className="text-slate-500 text-xs">{selectedTicket.category}</span>
            </div>
          </div>

          <div className="flex flex-col gap-6 mb-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {selectedTicket.replies?.map((reply, idx) => (
              <div key={idx} className={`flex flex-col max-w-[80%] ${reply.isAdmin ? 'self-start' : 'self-end'}`}>
                <div className={`p-4 rounded-2xl ${reply.isAdmin ? 'bg-[#1c2a4a] rounded-tl-none' : 'bg-blue-600 rounded-tr-none'}`}>
                  <p className="text-sm text-white leading-relaxed">{reply.message}</p>
                </div>
                <div className={`mt-1 text-[10px] text-slate-500 flex ${reply.isAdmin ? 'justify-start' : 'justify-end'}`}>
                  {reply.isAdmin ? 'Support Team' : 'You'} • {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>

          {selectedTicket.status !== 'Closed' && (
            <form onSubmit={handleReply} className="flex gap-4">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 bg-[#090f1e] border border-[#1c2a4a] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 rounded-lg transition-colors disabled:opacity-70"
              >
                Send
              </button>
            </form>
          )}

        </div>
      )}

    </div>
  );
};

export default Support;

import React, { useState, useEffect } from 'react';
import { FiGift, FiSend, FiTrash2, FiUser, FiClock, FiCheckCircle, FiLock, FiPlus } from 'react-icons/fi';
import { giftAPI, adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminGifts = () => {
  const [gifts, setGifts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedUser, setSelectedUser] = useState('all');
  const [giftType, setGiftType] = useState('Money');
  const [giftName, setGiftName] = useState('PKR 5,000 Cash Reward');
  const [amount, setAmount] = useState('5000');
  const [title, setTitle] = useState('🎁 Special Mystery Gift Box');
  const [description, setDescription] = useState('Congratulations! Enjoy your special 2-hour gift box reward!');
  const [timerHours, setTimerHours] = useState('2');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [giftsRes, usersRes] = await Promise.all([
        giftAPI.adminGetAllGifts(),
        adminAPI.getUsers({ limit: 100 }),
      ]);

      if (giftsRes.data.success) setGifts(giftsRes.data.data || []);
      if (usersRes.data.success) setUsers(usersRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load gifts or users data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendGift = async (e) => {
    e.preventDefault();
    if (!giftName) return toast.error('Gift name is required');

    try {
      setIsSubmitting(true);
      const payload = {
        userId: selectedUser,
        giftType,
        giftName,
        amount: giftType === 'Money' ? parseFloat(amount) : 0,
        title,
        description,
        timerHours: parseFloat(timerHours) || 2,
      };

      const { data } = await giftAPI.adminSendGift(payload);
      if (data.success) {
        toast.success(data.message || 'Gift box sent successfully!');
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send gift box');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGift = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gift box?')) return;
    try {
      const { data } = await giftAPI.adminDeleteGift(id);
      if (data.success) {
        toast.success('Gift box deleted');
        setGifts(gifts.filter((g) => g._id !== id));
      }
    } catch {
      toast.error('Failed to delete gift box');
    }
  };

  const handleGiftTypeChange = (e) => {
    const type = e.target.value;
    setGiftType(type);

    // Auto-fill sensible default gift names
    if (type === 'Money') {
      setGiftName('PKR 5,000 Cash Reward');
      setAmount('5000');
    } else if (type === 'Motorcycle') {
      setGiftName('Honda CD 70 Motorcycle');
      setAmount('0');
    } else if (type === 'Laptop') {
      setGiftName('HP Core i7 Laptop');
      setAmount('0');
    } else if (type === 'Phone') {
      setGiftName('iPhone 15 Smart Phone');
      setAmount('0');
    } else {
      setGiftName('Special Custom Gift');
      setAmount('0');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FiGift className="text-amber-400" /> Gift Box Management
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Send 2-Hour Timed Mystery Gift Boxes (Money, Motorcycle, Laptop, Phone) to users or view sent boxes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Send Gift Form */}
        <div className="lg:col-span-5 bg-[#0d152a] border border-[#1c2a4a] rounded-2xl p-6 space-y-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-[#1c2a4a] pb-3">
            <FiPlus className="text-amber-400" /> Send New Gift Box
          </h3>

          <form onSubmit={handleSendGift} className="space-y-4">
            {/* Target User */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Target User</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full bg-[#060a14] border border-[#1c2a4a] rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-400 outline-none"
              >
                <option value="all">🌟 All Active Users</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Gift Type */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Gift Category</label>
              <select
                value={giftType}
                onChange={handleGiftTypeChange}
                className="w-full bg-[#060a14] border border-[#1c2a4a] rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-400 outline-none"
              >
                <option value="Money">💰 Money / Cash Reward</option>
                <option value="Motorcycle">🏍️ Motorcycle (Honda CD 70 / 125)</option>
                <option value="Laptop">💻 Laptop (HP / Dell / MacBook)</option>
                <option value="Phone">📱 Phone (iPhone / Samsung / Vivo)</option>
                <option value="Other">🎁 Other Custom Gift</option>
              </select>
            </div>

            {/* Gift Item Name */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Gift Item Name</label>
              <input
                type="text"
                value={giftName}
                onChange={(e) => setGiftName(e.target.value)}
                placeholder="e.g. Honda CD 70 Motorcycle or iPhone 15"
                required
                className="w-full bg-[#060a14] border border-[#1c2a4a] rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-400 outline-none"
              />
            </div>

            {/* Amount if Money */}
            {giftType === 'Money' && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Cash Amount (PKR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  required
                  className="w-full bg-[#060a14] border border-[#1c2a4a] rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-400 outline-none"
                />
              </div>
            )}

            {/* Timer Duration */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Lock Timer Duration (Hours)</label>
              <input
                type="number"
                step="0.5"
                value={timerHours}
                onChange={(e) => setTimerHours(e.target.value)}
                placeholder="Default: 2 Hours"
                required
                className="w-full bg-[#060a14] border border-[#1c2a4a] rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-400 outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">User can open the gift box after this timer completes.</p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Box Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Box Title"
                className="w-full bg-[#060a14] border border-[#1c2a4a] rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-400 outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Description / Instructions</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Message for user..."
                className="w-full bg-[#060a14] border border-[#1c2a4a] rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-400 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FiSend size={16} />
              {isSubmitting ? 'Sending Gift Box...' : 'Send Gift Box Now'}
            </button>
          </form>
        </div>

        {/* Right Column: Sent Gifts List */}
        <div className="lg:col-span-7 bg-[#0d152a] border border-[#1c2a4a] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1c2a4a] pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FiGift className="text-amber-400" /> Sent Gift Boxes ({gifts.length})
            </h3>
            <button onClick={fetchData} className="text-xs text-amber-400 hover:underline">
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading gift boxes...</div>
          ) : gifts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">No gift boxes sent yet.</div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {gifts.map((g) => {
                const unlocksAtDate = new Date(g.unlocksAt);
                const isReady = Date.now() >= unlocksAtDate.getTime() && !g.isOpened;

                return (
                  <div
                    key={g._id}
                    className="p-4 bg-[#060a14] border border-[#1c2a4a] rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                        {g.giftType === 'Motorcycle' ? '🏍️' : g.giftType === 'Laptop' ? '💻' : g.giftType === 'Phone' ? '📱' : g.giftType === 'Money' ? '💰' : '🎁'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{g.giftName}</p>
                        <p className="text-xs text-slate-400">
                          User: <span className="text-amber-400 font-semibold">{g.user?.name || 'Unknown'}</span> ({g.user?.email || 'N/A'})
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Unlocks: {unlocksAtDate.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {g.isOpened ? (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                          <FiCheckCircle size={12} /> Opened
                        </span>
                      ) : isReady ? (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <FiClock size={12} /> Ready
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                          <FiLock size={12} /> Locked
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteGift(g._id)}
                        className="text-slate-500 hover:text-red-400 p-1.5 transition-colors"
                        title="Delete gift box"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminGifts;

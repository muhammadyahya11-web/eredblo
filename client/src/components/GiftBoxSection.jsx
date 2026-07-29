import React, { useState, useEffect } from 'react';
import { FiGift, FiLock, FiUnlock, FiCheckCircle, FiDollarSign, FiAward, FiClock } from 'react-icons/fi';
import { giftAPI } from '../services/api';
import toast from 'react-hot-toast';

const GiftBoxSection = () => {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState(null);
  const [wonModal, setWonModal] = useState(null);

  // Timer update ticker every second
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    fetchGifts();
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchGifts = async () => {
    try {
      const { data } = await giftAPI.getMyGifts();
      if (data.success) {
        setGifts(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch gifts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGift = async (giftId) => {
    try {
      setOpeningId(giftId);
      const { data } = await giftAPI.openGift(giftId);
      if (data.success) {
        setWonModal(data.data);
        fetchGifts();
        toast.success(data.message || 'Gift box unlocked!');
      } else {
        toast.error(data.message || 'Could not open gift box.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error opening gift box.');
    } finally {
      setOpeningId(null);
    }
  };

  const formatCountdown = (unlocksAt) => {
    const target = new Date(unlocksAt).getTime();
    const diff = target - now;

    if (diff <= 0) return null; // Ready to open!

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const getGiftIcon = (type) => {
    switch (type) {
      case 'Motorcycle': return '🏍️';
      case 'Laptop': return '💻';
      case 'Phone': return '📱';
      case 'Money': return '💰';
      default: return '🎁';
    }
  };

  if (loading) return null;
  if (gifts.length === 0) return null; // Don't render section if user has no gift boxes

  return (
    <div className="bg-[#0b1329] border border-amber-500/30 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.15)]">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30 animate-pulse">
            🎁
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Your Mystery Gift Boxes
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {gifts.filter(g => !g.isOpened).length} Active
              </span>
            </h3>
            <p className="text-xs text-slate-400">Deposits over PKR 50,000 & Admin Rewards earn you 2-Hour Timed Gift Boxes!</p>
          </div>
        </div>
      </div>

      {/* Gift Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
        {gifts.map((gift) => {
          const countdown = formatCountdown(gift.unlocksAt);
          const isReady = !countdown && !gift.isOpened;

          return (
            <div
              key={gift._id}
              className={`relative rounded-xl p-5 border transition-all ${
                gift.isOpened
                  ? 'bg-[#060a14]/60 border-slate-800 opacity-80'
                  : isReady
                  ? 'bg-gradient-to-b from-[#162244] to-[#0c152e] border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse'
                  : 'bg-[#0d162d] border-blue-500/20'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{getGiftIcon(gift.giftType)}</span>
                {gift.isOpened ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                    <FiCheckCircle size={12} /> Claimed
                  </span>
                ) : isReady ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-black animate-bounce shadow-md">
                    <FiUnlock size={12} /> READY TO OPEN!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    <FiLock size={12} /> Locked (2h Timer)
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <h4 className="text-white font-bold text-base mb-1">{gift.title}</h4>
              <p className="text-slate-400 text-xs mb-4 min-h-[32px]">
                {gift.description || (gift.isOpened ? `Won: ${gift.giftName}` : 'Open after 2-hour countdown completes to reveal prize!')}
              </p>

              {/* Status / Timer / Action Button */}
              {gift.isOpened ? (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                  <p className="text-xs text-green-300 font-semibold">Reward Claimed:</p>
                  <p className="text-sm font-bold text-white mt-0.5">{gift.giftName}</p>
                </div>
              ) : isReady ? (
                <button
                  onClick={() => handleOpenGift(gift._id)}
                  disabled={openingId === gift._id}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-bold text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <FiGift className="animate-spin" size={18} />
                  {openingId === gift._id ? 'Unboxing...' : '🎁 OPEN GIFT BOX NOW!'}
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-[#070c1a] border border-blue-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <FiClock className="text-amber-400 animate-spin" size={16} />
                    <span>Unlocks in:</span>
                  </div>
                  <span className="font-mono text-base font-bold text-amber-400 tracking-wider">
                    {countdown}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* UNBOXING REWARD CELEBRATION MODAL */}
      {wonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#141e38] to-[#0a1020] border-2 border-amber-400 rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.4)] animate-in fade-in zoom-in duration-300">
            {/* Sparkle background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2)_0%,transparent_70%)]" />

            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(245,158,11,0.6)] animate-bounce">
                {getGiftIcon(wonModal.giftType)}
              </div>

              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40 mb-2">
                🎉 CONGRATULATIONS!
              </span>

              <h3 className="text-2xl font-extrabold text-white mb-2">Gift Box Opened!</h3>
              <p className="text-slate-300 text-sm mb-6">You unlocked a special reward:</p>

              <div className="bg-[#050914] border border-amber-500/30 rounded-2xl p-5 mb-6">
                <p className="text-2xl font-black text-amber-400 mb-1">{wonModal.giftName}</p>
                {wonModal.giftType === 'Money' ? (
                  <p className="text-xs text-green-400 font-medium">✓ PKR {wonModal.amount?.toLocaleString()} has been credited to your balance!</p>
                ) : (
                  <p className="text-xs text-amber-300 font-medium">✓ Physical gift claimed! Our support team will contact you to ship your {wonModal.giftType}.</p>
                )}
              </div>

              <button
                onClick={() => setWonModal(null)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-sm transition-all shadow-lg shadow-amber-500/30 cursor-pointer"
              >
                GREAT! THANK YOU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftBoxSection;

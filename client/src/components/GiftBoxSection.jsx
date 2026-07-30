import React, { useState, useEffect, useRef } from 'react';
import { FiGift, FiLock, FiUnlock, FiCheckCircle, FiClock, FiX, FiAward } from 'react-icons/fi';
import { giftAPI } from '../services/api';
import toast from 'react-hot-toast';

// 3D Gift Box Visual Component
const GiftBox3D = ({ giftType, isOpened, isReady, isOpening, onOpenClick }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current || isOpened) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setTilt({ x: -y * 15, y: x * 15 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Color theme per gift type
  const getTheme = () => {
    switch (giftType) {
      case 'Motorcycle':
        return { boxBg: 'from-red-600 via-rose-700 to-red-900', ribbon: 'from-[#ffd700] via-[#fff5a0] to-[#e6b800]', glow: 'rgba(239, 68, 68, 0.4)' };
      case 'Laptop':
        return { boxBg: 'from-blue-600 via-indigo-700 to-slate-900', ribbon: 'from-[#00f2fe] via-[#4facfe] to-[#00c6ff]', glow: 'rgba(59, 130, 246, 0.4)' };
      case 'Phone':
        return { boxBg: 'from-purple-600 via-fuchsia-700 to-purple-950', ribbon: 'from-[#ff758c] via-[#ff7eb3] to-[#ff758c]', glow: 'rgba(168, 85, 247, 0.4)' };
      case 'Money':
        return { boxBg: 'from-emerald-600 via-teal-700 to-emerald-950', ribbon: 'from-[#ffd700] via-[#ffe875] to-[#daa520]', glow: 'rgba(16, 185, 129, 0.4)' };
      default:
        return { boxBg: 'from-amber-600 via-yellow-600 to-amber-900', ribbon: 'from-[#ffffff] via-[#fff5d0] to-[#ffd700]', glow: 'rgba(245, 158, 11, 0.4)' };
    }
  };

  const theme = getTheme();

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.15s ease-out',
      }}
      className="relative group cursor-pointer"
      onClick={isReady && !isOpened ? onOpenClick : undefined}
    >
      {/* 3D Box Container */}
      <div className="relative w-36 h-36 mx-auto py-2 flex items-center justify-center">
        {/* Glow Halo behind box */}
        <div
          className={`absolute inset-0 rounded-full blur-2xl transition-all duration-500 ${
            isReady && !isOpened ? 'animate-pulse opacity-100 scale-125' : 'opacity-40 scale-100'
          }`}
          style={{ background: theme.glow }}
        />

        {/* 3D Box Cube */}
        <div className={`relative w-28 h-28 transform-style-3d transition-transform duration-700 ${isOpening ? 'scale-110 rotate-6' : ''}`}>
          
          {/* Lid (Top Part) */}
          <div
            className={`absolute inset-x-0 -top-3 h-9 rounded-t-xl bg-gradient-to-r ${theme.boxBg} border-t-2 border-white/40 shadow-xl z-20 transition-all duration-700 origin-bottom ${
              isOpening ? 'transform -rotate-x-120 -translate-y-8 opacity-0' : ''
            }`}
          >
            {/* Top Lid Ribbon Ribbon Cross */}
            <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 bg-gradient-to-b ${theme.ribbon} shadow-md`} />
            {/* 3D Bow Knot */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center">
              <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${theme.ribbon} shadow-lg border border-amber-200 animate-bounce`} />
            </div>
          </div>

          {/* Box Body (Front Face) */}
          <div className={`w-full h-full rounded-b-2xl bg-gradient-to-b ${theme.boxBg} border border-white/20 shadow-2xl relative overflow-hidden flex items-center justify-center`}>
            
            {/* Vertical Ribbon */}
            <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-5 bg-gradient-to-b ${theme.ribbon} shadow-inner`} />
            
            {/* Horizontal Ribbon */}
            <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-5 bg-gradient-to-r ${theme.ribbon} shadow-inner`} />

            {/* Light Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            {/* Inner Light burst on open */}
            {isOpening && (
              <div className="absolute inset-0 bg-yellow-300 animate-ping opacity-75 rounded-2xl" />
            )}

            {/* Center Lock / Icon Badge */}
            <div className="relative z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
              {isOpened ? (
                <FiCheckCircle className="text-green-400 text-lg" />
              ) : isReady ? (
                <FiUnlock className="text-amber-300 text-lg animate-bounce" />
              ) : (
                <FiLock className="text-blue-300 text-base" />
              )}
            </div>
          </div>

          {/* Box Shadow */}
          <div className="absolute -bottom-4 inset-x-2 h-4 bg-black/50 blur-md rounded-full transform scale-90" />
        </div>
      </div>
    </div>
  );
};

const GiftBoxSection = () => {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState(null);
  const [wonModal, setWonModal] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    fetchGifts();
    const interval = setInterval(() => setNow(Date.now()), 1000);
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
      // Brief animation delay
      await new Promise((r) => setTimeout(r, 600));

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
    if (diff <= 0) return null; // Ready

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const pad = (n) => String(n).padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const getGiftEmoji = (type) => {
    switch (type) {
      case 'Motorcycle': return '🏍️';
      case 'Laptop': return '💻';
      case 'Phone': return '📱';
      case 'Money': return '💰';
      default: return '🎁';
    }
  };

  if (loading) return null;
  if (gifts.length === 0) return null; // Don't show if user has no gift boxes

  return (
    <div className="bg-gradient-to-b from-[#0e1730] via-[#091024] to-[#060a17] border border-amber-500/40 rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.2)]">
      
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/15 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/15 blur-[100px] pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 relative z-10 border-b border-white/10 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(245,158,11,0.5)] transform -rotate-3 hover:rotate-0 transition-transform">
            🎁
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white tracking-wide flex items-center gap-3">
              3D VIP Mystery Gift Boxes
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                {gifts.filter((g) => !g.isOpened).length} Active Boxes
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Deposits of PKR 50,000+ & Admin rewards earn 2-Hour Timed Mystery Gift Boxes with Cash, Motorcycles, Laptops & Phones!
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 3D Gift Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {gifts.map((gift) => {
          const countdown = formatCountdown(gift.unlocksAt);
          const isReady = !countdown && !gift.isOpened;

          return (
            <div
              key={gift._id}
              className={`group relative rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between ${
                gift.isOpened
                  ? 'bg-[#080e1c]/70 border-slate-800 opacity-80'
                  : isReady
                  ? 'bg-gradient-to-b from-[#182850] via-[#101b38] to-[#0a1228] border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.35)]'
                  : 'bg-[#0a1329] border-blue-500/25 hover:border-blue-500/50'
              }`}
            >
              {/* Card Header Status Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {gift.giftType} Box
                </span>

                {gift.isOpened ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/40">
                    <FiCheckCircle size={12} /> Claimed
                  </span>
                ) : isReady ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-black shadow-lg animate-bounce">
                     READY TO UNBOX!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    <FiLock size={12} /> Locked (2h)
                  </span>
                )}
              </div>

              {/* 3D Animated Gift Box Visual */}
              <div className="my-3">
                <GiftBox3D
                  giftType={gift.giftType}
                  isOpened={gift.isOpened}
                  isReady={isReady}
                  isOpening={openingId === gift._id}
                  onOpenClick={() => handleOpenGift(gift._id)}
                />
              </div>

              {/* Title & Info */}
              <div className="text-center mb-4">
                <h4 className="text-white font-extrabold text-lg mb-1">{gift.title}</h4>
                <p className="text-slate-400 text-xs line-clamp-2">
                  {gift.description || (gift.isOpened ? `Reward: ${gift.giftName}` : 'Unlocks after 2-hour countdown completes!')}
                </p>
              </div>

              {/* Action Button / Countdown */}
              {gift.isOpened ? (
                <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                  <p className="text-[11px] text-green-300 font-semibold uppercase tracking-wider">You Won:</p>
                  <p className="text-base font-extrabold text-white mt-0.5">{gift.giftName}</p>
                </div>
              ) : isReady ? (
                <button
                  onClick={() => handleOpenGift(gift._id)}
                  disabled={openingId === gift._id}
                  className=" py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-sm transition-all shadow-[0_0_25px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {/* <FiSparkles className="animate-spin text-lg" /> */}
                  {openingId === gift._id ? 'Unboxing Reward...' : '🎁 OPEN 3D GIFT BOX!'}
                </button>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#050a17] border border-blue-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <FiClock className="text-amber-400 animate-spin" size={16} />
                    <span>Unlocks In:</span>
                  </div>
                  <span className="font-mono text-lg font-black text-amber-400 tracking-wider">
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#18264a] via-[#0f1a36] to-[#080d1c] border-2 border-amber-400 rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-[0_0_80px_rgba(245,158,11,0.5)] animate-in fade-in zoom-in duration-300">
            {/* Close button */}
            <button
              onClick={() => setWonModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full bg-white/5"
            >
              <FiX size={20} />
            </button>

            {/* Sparkle background beam */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.25)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative z-10">
              {/* Prize Icon / Emoji */}
              <div className="w-28 h-28 mx-auto mb-5 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-6xl shadow-[0_0_40px_rgba(245,158,11,0.7)] animate-bounce border-2 border-amber-200">
                {getGiftEmoji(wonModal.giftType)}
              </div>

              <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black tracking-wider border border-amber-500/40 mb-3 shadow-md">
                🎉 GIFT BOX UNLOCKED!
              </span>

              <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Congratulations!</h3>
              <p className="text-slate-300 text-sm mb-6">You unlocked your 3D Gift Box reward:</p>

              <div className="bg-[#050914] border-2 border-amber-500/40 rounded-2xl p-6 mb-6 shadow-inner">
                <p className="text-2xl font-black text-amber-400 mb-2">{wonModal.giftName}</p>
                {wonModal.giftType === 'Money' ? (
                  <p className="text-xs text-green-400 font-semibold">✓ PKR {wonModal.amount?.toLocaleString()} has been credited to your balance!</p>
                ) : (
                  <p className="text-xs text-amber-300 font-semibold">✓ Physical reward registered! Our support team will contact you to dispatch your {wonModal.giftType}.</p>
                )}
              </div>

              <button
                onClick={() => setWonModal(null)}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-sm transition-all shadow-[0_0_30px_rgba(245,158,11,0.5)] transform active:scale-95 cursor-pointer"
              >
                GREAT! CLAIM NOW
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftBoxSection;

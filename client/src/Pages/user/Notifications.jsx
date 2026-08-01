import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiBell, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { notificationAPI } from '../../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationAPI.getMy();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const displayData = notifications.filter((notif) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unread') return !notif.isRead;
    if (activeTab === 'Important') return notif.isImportant;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'Withdrawal':
      case 'Deposit': return <FiCheckCircle size={20} />;
      case 'Profit': return <FiTrendingUp size={20} />;
      case 'Offer': return <FiBell size={20} />;
      case 'System': return <FiAlertCircle size={20} />;
      default: return <FiInfo size={20} />;
    }
  };

  const getIconStyle = (type) => {
    switch (type) {
      case 'Withdrawal':
      case 'Deposit': return 'bg-emerald-500/10 text-emerald-500';
      case 'Profit': return 'bg-blue-500/10 text-blue-500';
      case 'Offer': return 'bg-purple-500/10 text-purple-500';
      case 'System': return 'bg-amber-500/10 text-amber-500';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  const timeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? ' day ago' : ' days ago');
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? ' hour ago' : ' hours ago');
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      
      <div className="mb-8">
        <h2 className="text-white text-xl font-bold">Notifications</h2>
        <p className="text-slate-400 text-xs mt-1">Stay updated with latest notifications</p>
      </div>

      <div className="bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-6">
        
        {/* Tabs */}
        <div className="flex items-center gap-3 mb-8 border-b border-[#1c2a4a] pb-6">
          {['All', 'Unread', 'Important'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-400' 
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <p className="text-slate-400 text-sm py-8 text-center">Loading notifications...</p>
          ) : displayData.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No notifications found.</p>
          ) : (
            displayData.map((notif) => (
              <div 
                key={notif._id} 
                className="bg-[#090f1e] border border-[#1c2a4a] rounded-xl p-4 flex items-center justify-between group hover:border-blue-500/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full shrink-0 ${getIconStyle(notif.type)}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-medium leading-relaxed group-hover:text-blue-400 transition-colors">
                      {notif.title || notif.message}
                    </span>
                    <span className="text-slate-500 text-xs mt-1">{timeAgo(notif.createdAt)}</span>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Notifications;

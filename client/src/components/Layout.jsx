import React, { useState, useEffect, useContext } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiTrendingUp, FiDownload, FiUpload, FiList,
  FiUsers, FiClock, FiGift, FiHelpCircle, FiSettings,
  FiLogOut, FiBell, FiHeadphones, FiChevronDown, FiMenu,
} from 'react-icons/fi';
import { BsShieldLock } from 'react-icons/bs';
import { AuthContext } from '../context/AuthContext';
import { notificationAPI } from '../services/api';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch real unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { data } = await notificationAPI.getMy({ limit: 1 });
        if (data.success) {
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (err) {
        // Silently fail – unread count is non-critical
      }
    };
    fetchUnreadCount();
    // Refresh every 2 minutes
    const interval = setInterval(fetchUnreadCount, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateUnreadCount = (event) => setUnreadCount(Number(event.detail) || 0);
    window.addEventListener('notifications:unread-count', updateUnreadCount);
    return () => window.removeEventListener('notifications:unread-count', updateUnreadCount);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return { title: 'Dashboard', sub: '' };
    if (path === '/dashboard/deposit') return { title: 'Deposit', sub: 'Choose a payment method and make your deposit' };
    if (path === '/dashboard/withdraw') return { title: 'Withdraw', sub: 'Withdraw your earnings to your account' };
    if (path === '/dashboard/transactions') return { title: 'Transactions', sub: 'View your all transactions history' };
    if (path === '/dashboard/my-investments') return { title: 'My Investments', sub: 'Track your investment portfolio' };
    if (path === '/dashboard/earnings') return { title: 'Earning History', sub: 'Track your earnings' };
    if (path === '/dashboard/my-team') return { title: 'My Team', sub: 'View your team members and earnings' };
    if (path === '/dashboard/bonuses') return { title: 'Bonuses', sub: 'View your referral bonuses and earnings' };
    if (path === '/dashboard/settings') return { title: 'Settings', sub: 'Platform settings and information' };
    if (path === '/dashboard/profile') return { title: 'Profile Settings', sub: 'Manage your profile information' };
    if (path === '/dashboard/support') return { title: 'Support Center', sub: 'We are here to help you 24/7' };
    if (path === '/dashboard/notifications') return { title: 'Notifications', sub: 'Your activity notifications' };
    return { title: '', sub: '' };
  };

  const { title, sub } = getPageTitle();
  const userName = user?.name || 'User';
  const hasRealPicture = user?.profilePicture && !user.profilePicture.includes('default');

  return (
    <div className="app-container flex min-h-screen bg-[#060a14] text-white">
      {/* SIDEBAR OVERLAY FOR MOBILE */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={closeSidebar} />
      )}

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-full lg:basis-[280px] lg:shrink-0 bg-[#060a14] border-r border-[#1a2340] transform transition-transform duration-300 lg:translate-x-0 lg:static flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[#1a2340]">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.6)]">
            E
          </div>
          <span className="font-bold text-lg tracking-wide">Ered Bloo</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          <NavLink to="/dashboard" end className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-blue-600 text-white font-medium shadow-[0_4px_20px_rgba(37,99,235,0.3)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiGrid size={18} /> Dashboard
          </NavLink>
          <NavLink to="/dashboard/my-investments" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiTrendingUp size={18} /> My Investments
          </NavLink>
          <NavLink to="/dashboard/deposit" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiDownload size={18} /> Deposit
          </NavLink>
          <NavLink to="/dashboard/withdraw" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiUpload size={18} /> Withdraw
          </NavLink>
          <NavLink to="/dashboard/transactions" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiList size={18} /> Transactions
          </NavLink>
          <NavLink to="/dashboard/my-team" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiUsers size={18} /> My Team
          </NavLink>
          <NavLink to="/dashboard/earnings" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiClock size={18} /> Earning History
          </NavLink>
          <NavLink to="/dashboard/bonuses" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiGift size={18} /> Bonuses
          </NavLink>
          <NavLink to="/dashboard/support" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiHelpCircle size={18} /> Support
          </NavLink>
          <NavLink to="/dashboard/notifications" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all relative ${isActive ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiBell size={18} /> Notifications
            {unreadCount > 0 && (
              <span className="absolute right-3 top-3 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/dashboard/profile" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiSettings size={18} /> Profile Settings
          </NavLink>
          
          <button className="flex items-center gap-3 px-4 py-3 mt-4 w-full rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-all text-left" onClick={handleLogout}>
            <FiLogOut size={18} /> Logout
          </button>
        </nav>

        {/* Sidebar Bottom Card */}
        <div className="p-4 m-4 rounded-xl border border-blue-500/20 bg-gradient-to-b from-[#0b162c] to-[#060a14] flex flex-col items-center w-full text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/5 blur-xl"></div>
          <p className="text-blue-400 font-bold text-sm mb-1 z-10">Grow Your Money</p>
          <p className="text-[10px] text-slate-400 mb-3 z-10">Secure - Smart - Transparent</p>
          <div className="w-14 h-14 rounded-full border border-blue-500/30 flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <BsShieldLock size={22} className="text-blue-400" />
            <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]"></div>
          </div>
          <div className="flex items-center gap-2 mt-4 z-10 opacity-70">
            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[8px] font-bold">E</div>
            <span className="text-xs font-semibold">Ered Bloo</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0f1e]">
        {/* HEADER */}
        <header className="h-[76px] px-4 md:px-8 flex items-center justify-between border-b border-[#1a2340] bg-[#0d1226] sticky top-0 z-30">
          
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white lg:hidden" onClick={toggleSidebar}>
              <FiMenu size={22} />
            </button>
            
            {/* Header Text */}
            {location.pathname === '/dashboard' ? (
              <div className="hidden md:block">
                <p className="text-[11px] text-slate-400 leading-none mb-1">Welcome Back,</p>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-white leading-none">{userName}</h2>
                  <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium">
                    {user?.isVerified ? 'Verified Member' : 'Unverified'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="hidden md:block">
                <h2 className="text-xl font-semibold text-white">{title}</h2>
              </div>
            )}
          </div>

          <div className="flex items-center gap-5">
            <button
              className="relative text-slate-400 hover:text-white transition-colors"
              onClick={() => navigate('/dashboard/notifications')}
              title="Notifications"
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 bg-red-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full border-2 border-[#0d1226] px-0.5">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <button className="text-slate-400 hover:text-white transition-colors hidden sm:block" onClick={() => navigate('/dashboard/support')} title="Support">
              <FiHeadphones size={20} />
            </button>
            <div className="flex items-center gap-2 cursor-pointer border-l border-[#1a2340] pl-5 ml-1" onClick={() => navigate('/dashboard/profile')}>
              {hasRealPicture ? (
                <img src={user.profilePicture} alt={userName} className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm ring-2 ring-blue-500/30 select-none">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium text-white hidden sm:block">{userName}</span>
              <FiChevronDown className="text-slate-400 hidden sm:block" size={16} />
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;

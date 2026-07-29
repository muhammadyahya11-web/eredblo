import React, { useState, useContext } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiUsers, FiDownload, FiUpload, FiList,
  FiTrendingUp, FiHelpCircle, FiSettings, FiLogOut,
  FiBell, FiMenu, FiChevronDown, FiShield, FiGift
} from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return { title: 'Dashboard', sub: 'Admin overview' };
    if (path === '/admin/users') return { title: 'User Management', sub: 'Manage all registered users' };
    if (path === '/admin/deposits') return { title: 'Deposits', sub: 'Review and approve deposits' };
    if (path === '/admin/withdrawals') return { title: 'Withdrawals', sub: 'Review and approve withdrawals' };
    if (path === '/admin/transactions') return { title: 'Transactions', sub: 'View all platform transactions' };
    if (path === '/admin/plans') return { title: 'Investment Plans', sub: 'Manage investment plans' };
    if (path === '/admin/earnings') return { title: 'Earnings', sub: 'Platform earnings overview' };
    if (path === '/admin/support') return { title: 'Support Tickets', sub: 'Manage user support tickets' };
    if (path === '/admin/notifications') return { title: 'Notifications', sub: 'Send and manage notifications' };
    if (path === '/admin/gifts') return { title: 'Gift Boxes', sub: 'Manage & send 2-hour timed gift boxes' };
    if (path === '/admin/settings') return { title: 'Settings', sub: 'Admin panel settings' };
    return { title: '', sub: '' };
  };

  const { title, sub } = getPageTitle();
  const userName = user?.name || 'Admin';

  return (
    <div className="app-container flex min-h-screen bg-[#060a14] text-white">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={closeSidebar} />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#060a14] border-r border-[#1a2340] transform transition-transform duration-300 lg:translate-x-0 lg:static flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[#1a2340]">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(220,38,38,0.6)]">
            <FiShield size={16} />
          </div>
          <span className="font-bold text-lg tracking-wide">Admin Panel</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          <NavLink to="/admin" end className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-red-600 text-white font-medium shadow-[0_4px_20px_rgba(220,38,38,0.3)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiGrid size={18} /> Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-red-600 text-white font-medium shadow-[0_4px_20px_rgba(220,38,38,0.3)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiUsers size={18} /> Users
          </NavLink>
          <NavLink to="/admin/deposits" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-red-600 text-white font-medium shadow-[0_4px_20px_rgba(220,38,38,0.3)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiDownload size={18} /> Deposits
          </NavLink>
          <NavLink to="/admin/withdrawals" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-red-600 text-white font-medium shadow-[0_4px_20px_rgba(220,38,38,0.3)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiUpload size={18} /> Withdrawals
          </NavLink>
          <NavLink to="/admin/transactions" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-red-600 text-white font-medium shadow-[0_4px_20px_rgba(220,38,38,0.3)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiList size={18} /> Transactions
          </NavLink>
          <NavLink to="/admin/plans" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-red-600 text-white font-medium shadow-[0_4px_20px_rgba(220,38,38,0.3)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiTrendingUp size={18} /> Plans
          </NavLink>
          <NavLink to="/admin/earnings" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-red-600 text-white font-medium shadow-[0_4px_20px_rgba(220,38,38,0.3)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiTrendingUp size={18} /> Earnings
          </NavLink>
          <NavLink to="/admin/support" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-red-600 text-white font-medium shadow-[0_4px_20px_rgba(220,38,38,0.3)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiHelpCircle size={18} /> Support
          </NavLink>
          <NavLink to="/admin/notifications" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-red-600 text-white font-medium shadow-[0_4px_20px_rgba(220,38,38,0.3)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiBell size={18} /> Notifications
          </NavLink>
          <NavLink to="/admin/gifts" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-red-600 text-white font-medium shadow-[0_4px_20px_rgba(220,38,38,0.3)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiGift size={18} /> Gift Boxes
          </NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive ? 'bg-red-600 text-white font-medium shadow-[0_4px_20px_rgba(220,38,38,0.3)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={closeSidebar}>
            <FiSettings size={18} /> Settings
          </NavLink>

          <button className="flex items-center gap-3 px-4 py-3 mt-4 w-full rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-all text-left" onClick={handleLogout}>
            <FiLogOut size={18} /> Logout
          </button>
        </nav>

        <div className="p-4 m-4 rounded-xl border border-red-500/20 bg-gradient-to-b from-[#1a0b0b] to-[#060a14] flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-red-500/5 blur-xl"></div>
          <p className="text-red-400 font-bold text-sm mb-1 z-10">Admin Access</p>
          <p className="text-[10px] text-slate-400 mb-3 z-10">Restricted Area</p>
          <div className="w-14 h-14 rounded-full border border-red-500/30 flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(220,38,38,0.4)]">
            <FiShield size={22} className="text-red-400" />
            <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-red-400 shadow-[0_0_10px_#f87171]"></div>
          </div>
          <div className="flex items-center gap-2 mt-4 z-10 opacity-70">
            <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-[8px] font-bold">e</div>
            <span className="text-xs font-semibold">ered bloo</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0f1e]">
        <header className="h-[76px] px-4 md:px-8 flex items-center justify-between border-b border-[#1a2340] bg-[#0d1226] sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white lg:hidden" onClick={toggleSidebar}>
              <FiMenu size={22} />
            </button>
            <div className="hidden md:block">
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <FiBell size={20} />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full border-2 border-[#0d1226]">3</span>
            </button>
            <div className="flex items-center gap-2 cursor-pointer border-l border-[#1a2340] pl-5 ml-1">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-red-500/30">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-white hidden sm:block">{userName}</span>
              <FiChevronDown className="text-slate-400 hidden sm:block" size={16} />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

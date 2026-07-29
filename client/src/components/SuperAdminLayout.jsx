import React, { useState, useContext } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Download, Upload, List,
  TrendingUp, HelpCircle, Settings, LogOut,
  Bell, Menu, ChevronDown, Shield, UserCheck, Gift
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const navItems = [
  { to: '/super-admin', end: true, icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/super-admin/admins', icon: UserCheck, label: 'Manage Admins' },
  { to: '/super-admin/users', icon: Users, label: 'Users' },
  { to: '/super-admin/deposits', icon: Download, label: 'Deposits' },
  { to: '/super-admin/withdrawals', icon: Upload, label: 'Withdrawals' },
  { to: '/super-admin/transactions', icon: List, label: 'Transactions' },
  { to: '/super-admin/plans', icon: TrendingUp, label: 'Plans' },
  { to: '/super-admin/earnings', icon: TrendingUp, label: 'Earnings' },
  { to: '/super-admin/support', icon: HelpCircle, label: 'Support' },
  { to: '/super-admin/notifications', icon: Bell, label: 'Notifications' },
  { to: '/super-admin/gifts', icon: Gift, label: 'Gift Boxes' },
  { to: '/super-admin/settings', icon: Settings, label: 'Settings' },
];

const titles = {
  '/super-admin': { title: 'Dashboard', sub: 'Super admin overview' },
  '/super-admin/admins': { title: 'Manage Admins', sub: 'Add or remove admin accounts' },
  '/super-admin/users': { title: 'User Management', sub: 'Manage all registered users' },
  '/super-admin/deposits': { title: 'Deposits', sub: 'Review and approve deposits' },
  '/super-admin/withdrawals': { title: 'Withdrawals', sub: 'Review and approve withdrawals' },
  '/super-admin/transactions': { title: 'Transactions', sub: 'View all platform transactions' },
  '/super-admin/plans': { title: 'Investment Plans', sub: 'Manage investment plans' },
  '/super-admin/earnings': { title: 'Earnings', sub: 'Platform earnings overview' },
  '/super-admin/support': { title: 'Support Tickets', sub: 'Manage user support tickets' },
  '/super-admin/notifications': { title: 'Notifications', sub: 'Send and manage notifications' },
  '/super-admin/gifts': { title: 'Gift Boxes', sub: 'Manage & send 2-hour timed gift boxes' },
  '/super-admin/settings': { title: 'Settings', sub: 'Super admin panel settings' },
};

const SuperAdminLayout = () => {
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

  const { title, sub } = titles[location.pathname] || { title: '', sub: '' };
  const userName = user?.name || 'Super Admin';

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
      isActive
        ? 'bg-gradient-to-r from-red-600/20 to-red-600/10 text-white font-medium shadow-[0_0_20px_rgba(220,38,38,0.25)] border border-red-500/20'
        : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
    }`;

  return (
    <div className="app-container flex min-h-screen bg-[#060a14] text-white font-sans">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={closeSidebar} />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#060a14] border-r border-white/5 transform transition-transform duration-300 lg:translate-x-0 lg:static flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]">
            <Shield size={16} />
          </div>
          <span className="font-bold text-lg tracking-wide text-white">Super Admin</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={closeSidebar}>
              <item.icon size={18} /> {item.label}
            </NavLink>
          ))}

          <button className="flex items-center gap-3 px-4 py-3 mt-4 w-full rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-300 text-left border border-transparent hover:border-white/5" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </nav>

        <div className="p-4 m-4 rounded-xl border border-red-500/20 bg-gradient-to-b from-[#1a0b0b] to-[#060a14] flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-red-500/5 blur-xl"></div>
          <p className="text-red-400 font-bold text-sm mb-1 z-10">Super Admin Access</p>
          <p className="text-[10px] text-slate-400 mb-3 z-10">Full Control</p>
          <div className="w-14 h-14 rounded-full border border-red-500/30 flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(220,38,38,0.4)]">
            <Shield size={22} className="text-red-400" />
            <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-red-400 shadow-[0_0_10px_#f87171]"></div>
          </div>
          <div className="flex items-center gap-2 mt-4 z-10 opacity-70">
            <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-[8px] font-bold">e</div>
            <span className="text-xs font-semibold text-slate-300">ered bloo</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0f1e]">
        <header className="h-[76px] px-4 md:px-8 flex items-center justify-between border-b border-white/5 bg-[#0d1530]/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white transition-colors lg:hidden" onClick={toggleSidebar}>
              <Menu size={22} />
            </button>
            <div className="hidden md:block">
              <h2 className="text-xl font-semibold text-white tracking-tight">{title}</h2>
              {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full border-2 border-[#0d1530]">3</span>
            </button>
            <div className="flex items-center gap-2 cursor-pointer border-l border-white/5 pl-5 ml-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-sm font-bold ring-2 ring-red-500/30">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-white hidden sm:block">{userName}</span>
              <ChevronDown className="text-slate-400 hidden sm:block" size={16} />
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

export default SuperAdminLayout;

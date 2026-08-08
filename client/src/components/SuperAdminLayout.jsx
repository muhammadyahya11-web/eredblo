import React, { useState, useContext } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Wallet, Download, Upload, Network, 
  TrendingUp, Award, Gift, List, FileBarChart, Bell, HelpCircle, 
  Tag, Settings, ClipboardList, Shield, Monitor, UserPlus, 
  Send, Search, Calendar, ChevronDown, Menu, LogOut, Layers
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const navItems = [
  { to: '/super-admin', end: true, icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/super-admin/users', icon: Users, label: 'User Management' },
  { to: '/super-admin/wallet', icon: Wallet, label: 'Wallet Management' },
  { to: '/super-admin/deposits', icon: Download, label: 'Deposit Management' },
  { to: '/super-admin/withdrawals', icon: Upload, label: 'Withdrawal Management' },
  { to: '/super-admin/referrals', icon: Network, label: 'Referral Tree' },
  { to: '/super-admin/roi', icon: TrendingUp, label: 'ROI Management' },
  { to: '/super-admin/plans', icon: Layers, label: 'Plan Management' },
  { to: '/super-admin/leaders', icon: Award, label: 'Leader Management' },
  { to: '/super-admin/bonus', icon: Gift, label: 'Bonus Management' },
  { to: '/super-admin/transactions', icon: List, label: 'Transaction History' },
  { to: '/super-admin/reports', icon: FileBarChart, label: 'Reports' },
  { to: '/super-admin/notifications', icon: Bell, label: 'Notification' },
  { to: '/super-admin/support', icon: HelpCircle, label: 'Support System' },
  { to: '/super-admin/promo', icon: Tag, label: 'Promo Code' },
  { to: '/super-admin/settings-basic', icon: Settings, label: 'Settings' },
  { to: '/super-admin/audit', icon: ClipboardList, label: 'Audit Logs' },
  { to: '/super-admin/admins', icon: Shield, label: 'Admin Management' },
  { to: '/super-admin/settings', icon: Monitor, label: 'System Settings' },
];

const shortcutItems = [
  { to: '/super-admin/users/add', icon: UserPlus, label: 'Add User' },
  { to: '/super-admin/deposits/manual', icon: Download, label: 'Manual Deposit' },
  { to: '/super-admin/withdrawals/manual', icon: Upload, label: 'Manual Withdrawal' },
  { to: '/super-admin/notifications/send', icon: Send, label: 'Send Notification' },
  { to: '/super-admin/users', icon: Users, label: 'View Users' },
  { to: '/super-admin/referrals', icon: Network, label: 'Referral Tree' },
  { to: '/super-admin/settings', icon: Monitor, label: 'System Settings' },
];

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

  const userName = user?.name || 'Super Admin';

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-6 py-3 text-[13px] font-medium transition-all duration-300 ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 border-l-4 border-blue-400'
        : 'text-slate-300 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
    }`;

  const shortcutClass = "flex items-center gap-3 px-6 py-2.5 text-[13px] font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all duration-300 border-l-4 border-transparent";

  return (
    <div className="app-container flex min-h-screen bg-[#f3f4f6] text-slate-800 font-sans">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={closeSidebar} />
      )}

      {/* Sidebar - Dark theme as per website's original color theme but matching image layout */}
      <div className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#0a192f] transform transition-transform duration-300 lg:translate-x-0 lg:static flex flex-col shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo Area */}
        <div className="flex flex-col items-center justify-center py-6 border-b border-white/10">
          <div className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
              <Shield size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-wide">ERED BLOO</span>
              <span className="text-[10px] text-blue-400 font-semibold tracking-widest uppercase">Super Admin</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar py-4">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={closeSidebar}>
                <item.icon size={18} className="opacity-80" /> {item.label}
              </NavLink>
            ))}

            <div className="mt-8 mb-2 px-6">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Shortcuts</span>
            </div>

            {shortcutItems.map((item, idx) => (
              <NavLink key={idx} to={item.to} className={shortcutClass} onClick={closeSidebar}>
                <item.icon size={18} className="opacity-80 text-slate-400" /> {item.label}
              </NavLink>
            ))}

            <button className="flex items-center gap-3 px-6 py-3 mt-4 w-full text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-all duration-300 text-left border-l-4 border-transparent" onClick={handleLogout}>
              <LogOut size={18} /> Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#060a14]">
        
        {/* Topbar */}
        <header className="h-[70px] px-6 flex items-center justify-between border-b border-white/5 bg-[#0d1530] sticky top-0 z-30">
          
          <div className="flex items-center gap-4 flex-1">
            <button className="text-slate-400 hover:text-white transition-colors lg:hidden" onClick={toggleSidebar}>
              <Menu size={22} />
            </button>
            
            <div className="hidden md:flex items-center gap-2 bg-[#060a14] border border-white/10 rounded-lg px-4 py-2 w-full max-w-md focus-within:border-blue-500/50 focus-within:shadow-[0_0_10px_rgba(59,130,246,0.1)] transition-all">
              <Search size={16} className="text-slate-500" />
              <input 
                type="text" 
                placeholder="Search user by username, email or ID..." 
                className="bg-transparent border-none outline-none text-sm w-full text-slate-300 placeholder-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            
            <div className="hidden lg:flex items-center gap-2 bg-[#060a14] border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300">
              <Calendar size={16} className="text-slate-400" />
              <span>08 May 2024 - 08 May 2024</span>
              <ChevronDown size={14} className="text-slate-500 ml-2" />
            </div>

            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0d1530]"></span>
            </button>
            
            <div className="flex items-center gap-3 cursor-pointer pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">{userName}</p>
                <p className="text-xs text-blue-400">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white/10 flex items-center justify-center text-white font-bold overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Super+Admin&background=1d4ed8&color=fff" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
            
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLayout;


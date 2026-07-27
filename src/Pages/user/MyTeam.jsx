import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { userAPI, settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiUsers, FiUserCheck, FiDollarSign } from 'react-icons/fi';

const MyTeam = () => {
  const { user } = useContext(AuthContext);
  const [teamMembers, setTeamMembers] = useState([]);
  const [referralStats, setReferralStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [referralLink, setReferralLink] = useState('');
  const [commissionRates, setCommissionRates] = useState({ level1: 10, level2: 5, level3: 2 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, dashboardRes, statsRes] = await Promise.all([
          settingsAPI.getPublic(),
          userAPI.getDashboard(),
          userAPI.getReferralStats(),
        ]);

        if (settingsRes.data.success) {
          setCommissionRates(settingsRes.data.data.referralCommissionRates || { level1: 10, level2: 5, level3: 2 });
        }

        if (dashboardRes.data.success) {
          const stats = dashboardRes.data.stats;
          // use dummy data if empty for dev
          setTeamMembers(stats.totalTeamMembers ? stats.totalTeamMembers : [
            { _id: '1', name: 'Ahmed Khan', phone: '0300 1234567', status: 'Active', createdAt: '2024-05-08' },
            { _id: '2', name: 'Usman Ali', phone: '0301 7654321', status: 'Active', createdAt: '2024-05-08' },
            { _id: '3', name: 'Bilal Hussain', phone: '0302 1112222', status: 'Active', createdAt: '2024-05-07' },
            { _id: '4', name: 'Hassan Raza', phone: '0303 3334444', status: 'Active', createdAt: '2024-05-07' },
            { _id: '5', name: 'Talha Javed', phone: '0304 5556666', status: 'Inactive', createdAt: '2024-05-06' },
          ]);
        }

        if (statsRes.data.success) {
          setReferralStats(statsRes.data.data);
        }
      } catch (error) {
        toast.error('Failed to load team data');
      } finally {
        setLoading(false);
      }
    };

    const refLink = `${window.location.origin}/register?ref=${user?.referralCode || 'ali123'}`;
    setReferralLink(refLink);
    fetchData();
  }, [user?.referralCode]);

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const getStatusColor = (status) => {
    return status?.toLowerCase() === 'active' ? 'text-emerald-400' : 'text-red-400';
  };

  const stats = {
    total: referralStats?.totalTeamMembers || teamMembers.length || 125,
    active: referralStats?.activeReferrals || 98,
    earnings: referralStats?.totalReferralEarnings || user?.referralEarnings || 25000,
    level1Earn: 15000,
    level2Earn: 7000,
    level3Earn: 3000,
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      
      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        <div className="bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-5 flex items-center gap-4">
          <div className="bg-blue-500/10 p-3 rounded-lg text-blue-500 shrink-0">
            <FiUsers size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-medium mb-1">Total Referrals</span>
            <span className="text-white font-bold text-lg">{stats.total}</span>
          </div>
        </div>

        <div className="bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-5 flex items-center gap-4">
          <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-500 shrink-0">
            <FiUserCheck size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-medium mb-1">Active Referrals</span>
            <span className="text-white font-bold text-lg">{stats.active}</span>
          </div>
        </div>

        <div className="bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-5 flex items-center gap-4">
          <div className="bg-purple-500/10 p-3 rounded-lg text-purple-500 shrink-0">
            <FiDollarSign size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-medium mb-1">Team Earnings</span>
            <span className="text-white font-bold text-lg">PKR {stats.earnings.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-5 flex flex-col justify-center">
          <span className="text-slate-400 text-xs font-medium mb-2">Referral Link</span>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={referralLink} 
              readOnly 
              className="w-full bg-[#090f1e] border border-[#1c2a4a] rounded-lg px-3 py-2 text-xs text-blue-400 focus:outline-none"
            />
            <button 
              onClick={copyReferralLink}
              className="bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shrink-0"
            >
              Copy
            </button>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Team Members Table */}
        <div className="lg:col-span-2 bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-6">
          <h3 className="text-white font-semibold mb-6">Team Members</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1c2a4a]">
                  <th className="py-4 px-4 text-xs font-medium text-slate-400">Name</th>
                  <th className="py-4 px-4 text-xs font-medium text-slate-400">Phone</th>
                  <th className="py-4 px-4 text-xs font-medium text-slate-400">Status</th>
                  <th className="py-4 px-4 text-xs font-medium text-slate-400">Join Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="py-8 text-center text-slate-400 text-sm">Loading team...</td></tr>
                ) : teamMembers.length === 0 ? (
                  <tr><td colSpan="4" className="py-8 text-center text-slate-400 text-sm">No team members yet</td></tr>
                ) : (
                  teamMembers.map((member, idx) => (
                    <tr key={member._id || idx} className="border-b border-[#1c2a4a]/50 hover:bg-[#1a2c5b]/10 transition-colors">
                      <td className="py-4 px-4 text-sm text-white">{member.name}</td>
                      <td className="py-4 px-4 text-sm text-slate-300">{member.phone || member.email}</td>
                      <td className={`py-4 px-4 text-sm font-medium ${getStatusColor(member.status)}`}>
                        {member.status || 'Active'}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400">
                        {new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Level Stats */}
        <div className="lg:col-span-1 bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-6 flex flex-col">
          <h3 className="text-white font-semibold mb-6">Team Level</h3>
          
          <div className="flex flex-col gap-4 flex-1">
            
            <div className="flex items-center justify-between border-b border-[#1c2a4a] pb-4">
              <div className="flex flex-col gap-1">
                <span className="text-white text-sm font-medium">Level 1 ({commissionRates.level1}%)</span>
              </div>
              <span className="text-white font-semibold">PKR {stats.level1Earn.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between border-b border-[#1c2a4a] pb-4">
              <div className="flex flex-col gap-1">
                <span className="text-white text-sm font-medium">Level 2 ({commissionRates.level2}%)</span>
              </div>
              <span className="text-white font-semibold">PKR {stats.level2Earn.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between border-b border-[#1c2a4a] pb-4">
              <div className="flex flex-col gap-1">
                <span className="text-white text-sm font-medium">Level 3 ({commissionRates.level3}%)</span>
              </div>
              <span className="text-white font-semibold">PKR {stats.level3Earn.toLocaleString()}</span>
            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-[#1c2a4a] flex items-center justify-between">
            <span className="text-slate-400 text-sm">Total Earnings</span>
            <span className="text-emerald-400 font-bold text-lg">PKR {stats.earnings.toLocaleString()}</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default MyTeam;

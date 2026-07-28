import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { userAPI, transactionAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiUsers, FiDollarSign, FiGift, FiCalendar } from 'react-icons/fi';

const Bonuses = () => {
  const { user } = useContext(AuthContext);
  const [referralStats, setReferralStats] = useState(null);
  const [bonusHistory, setBonusHistory] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, txRes] = await Promise.all([
          userAPI.getReferralStats(),
          transactionAPI.getMyTransactions({ page, limit: 10, type: 'Referral Bonus' }),
        ]);

        if (statsRes.data.success) {
          setReferralStats(statsRes.data.data);
          setTeamMembers(statsRes.data.data.teamMembers || []);
        }

        if (txRes.data.success) {
          setBonusHistory(txRes.data.data || []);
          setTotalPages(txRes.data.pages || 1);
        }
      } catch (error) {
        toast.error('Failed to load bonus data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page]);

  if (loading) {
    return (
      <div className="bonuses-page">
        <div className="loading-state">Loading bonus data...</div>
      </div>
    );
  }

  return (
    <div className="bonuses-page">
      <h2 className="page-title">Bonuses & Referrals</h2>
      <p className="page-subtitle text-slate-400 text-sm mb-6">Track your referral earnings and team performance</p>

      <div className="stats-grid mb-6">
        <div className="stat-card p-compact">
          <div className="stat-icon green"><FiDollarSign /></div>
          <div className="stat-info">
            <p>Total Referral Earnings</p>
            <h3 className="text-green">PKR {(referralStats?.totalReferralEarnings || 0).toLocaleString()}</h3>
          </div>
        </div>
        <div className="stat-card p-compact">
          <div className="stat-icon blue"><FiUsers /></div>
          <div className="stat-info">
            <p>Total Team Members</p>
            <h3>{referralStats?.totalTeamMembers || 0}</h3>
          </div>
        </div>
        <div className="stat-card p-compact">
          <div className="stat-icon purple"><FiGift /></div>
          <div className="stat-info">
            <p>Total Bonuses</p>
            <h3>PKR {(referralStats?.totalBonuses || 0).toLocaleString()}</h3>
          </div>
        </div>
        <div className="stat-card p-compact">
          <div className="stat-icon orange"><FiCalendar /></div>
          <div className="stat-info">
            <p>This Month</p>
            <h3>PKR {(referralStats?.monthlyEarnings || 0).toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="section-card">
          <h3 className="section-title">Team Members</h3>
          {teamMembers.length === 0 ? (
            <div className="empty-state">No team members yet. Start inviting friends to build your team.</div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Investment</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member) => (
                    <tr key={member._id}>
                      <td className="font-medium">{member.name}</td>
                      <td className="text-slate-400">{member.email}</td>
                      <td className="text-green">PKR {(member.totalInvestment || 0).toLocaleString()}</td>
                      <td className="text-slate-400">{new Date(member.joinedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="section-card">
          <h3 className="section-title">Bonus History</h3>
          {bonusHistory.length === 0 ? (
            <div className="empty-state">No referral bonuses yet. Keep growing your team!</div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bonusHistory.map((tx) => (
                    <tr key={tx._id}>
                      <td className="font-medium">{tx.type}</td>
                      <td className="text-green">+ PKR {tx.amount?.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${tx.status === 'Approved' || tx.status === 'Success' ? 'success' : 'pending'}`}>{tx.status}</span>
                      </td>
                      <td className="text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>
                  {p}
                </button>
              ))}
              <button className="page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bonuses;

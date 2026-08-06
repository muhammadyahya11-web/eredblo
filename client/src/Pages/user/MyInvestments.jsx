import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { investmentAPI, planAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiTrendingUp, FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiPlus, FiX } from 'react-icons/fi';

const MyInvestments = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('All');

  // Modal states
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [isInvesting, setIsInvesting] = useState(false);

  const fetchInvestments = async () => {
    try {
      const params = { page, limit: 10 };
      if (filter !== 'All') params.status = filter.toLowerCase();
      const { data } = await investmentAPI.getMyInvestments(params);
      if (data.success) {
        setInvestments(data.data || []);
        setTotalPages(data.pages || 1);
      }
    } catch (error) {
      toast.error('Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [filter, page]);

  const handleOpenInvestModal = async () => {
    setShowInvestModal(true);
    setLoadingPlans(true);
    try {
      const { data } = await planAPI.getPlans({ status: 'active' });
      if (data.success) {
        setPlans(data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleInvest = async () => {
    if (!selectedPlanId) {
      toast.error('Please select a plan first');
      return;
    }
    setIsInvesting(true);
    try {
      const { data } = await investmentAPI.create({ planId: selectedPlanId });
      if (data.success) {
        if (data.user) updateUser(data.user);
        toast.success(data.message || 'Investment created successfully!');
        setShowInvestModal(false);
        setSelectedPlanId('');
        fetchInvestments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create investment');
    } finally {
      setIsInvesting(false);
    }
  };

  const getProgress = (startDate, endDate) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    if (now >= end) return 100;
    if (now <= start) return 0;
    const elapsed = now - start;
    const total = end - start;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const statusClass = (status) => {
    switch (status) {
      case 'active': return 'active';
      case 'completed': return 'success';
      case 'cancelled': return 'rejected';
      default: return 'pending';
    }
  };

  if (loading) {
    return (
      <div className="myinvestments-page">
        <div className="loading-state flex  text-sm justify-center items-center  w-full h-screen">
          <h1>Loading investments...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="myinvestments-page">
      <div className="section-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="section-title">My Investments</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 ">
            <div className="table-filters w-full  sm:w-auto overflow-x-auto pb-2 sm:pb-0">
              {['All', 'Active', 'Completed'].map((f) => (
                <button
                  key={f}
                  className={`filter-btn whitespace-nowrap ${filter === f ? 'active' : ''}`}
                  onClick={() => { setFilter(f); setPage(1); }}
                >
                  {f}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleOpenInvestModal}
              className="bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/40 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <FiPlus size={16} />
              Invest Now
            </button>
          </div>
        </div>

        {investments.length === 0 ? (
          <div className="empty-state">
            <p className="mb-4">No investments found.</p>
            <button
              onClick={handleOpenInvestModal}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Start Investing
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {investments.map((inv) => {
              const planName = inv.plan?.name || 'Plan';
              const progress = getProgress(inv.startDate, inv.endDate);
              const daysRemaining = getDaysRemaining(inv.endDate);
              const dailyProfit = inv.dailyProfit || 0;
              const totalReturn = inv.totalReturn || 0;
              const profitEarned = inv.profitEarned || 0;

              return (
                <div key={inv._id} className="bg-[#050810] border border-blue-500/10 rounded-xl p-5 hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.08)] transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-white">{planName}</h3>
                        <span className={`status-badge ${statusClass(inv.status)}`}>{inv.status}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400 text-xs mb-1">Amount</p>
                          <p className="text-white font-medium">PKR {inv.amount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs mb-1">Daily Profit</p>
                          <p className="text-green font-medium">PKR {dailyProfit.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs mb-1">Total Return</p>
                          <p className="text-blue font-medium">PKR {totalReturn.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs mb-1">Profit Earned</p>
                          <p className="text-green font-medium">PKR {profitEarned.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 min-w-[180px]">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <FiCalendar size={14} />
                        <span>{new Date(inv.startDate).toLocaleDateString()} - {new Date(inv.endDate).toLocaleDateString()}</span>
                      </div>
                      {inv.status === 'active' && (
                        <div className="w-full">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-400">Progress</span>
                            <span className="text-blue-400 font-medium">{progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-[#0a0f1e] rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">{daysRemaining} days remaining</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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

      {/* Invest Now Modal */}
      {showInvestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0b1221] border border-[#1a2340] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animation-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-[#1a2340]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FiTrendingUp className="text-blue-500" /> Choose Investment Plan
              </h3>
              <button
                onClick={() => setShowInvestModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
              {loadingPlans ? (
                <div className="py-12 flex justify-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : plans.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No active plans available at the moment.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans.map(plan => (
                    <div 
                      key={plan._id}
                      onClick={() => setSelectedPlanId(plan._id)}
                      className={`relative rounded-xl border p-4 cursor-pointer transition-all duration-300 ${
                        selectedPlanId === plan._id 
                          ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                          : 'border-[#1e2d4a] bg-[#060a14] hover:border-blue-500/50'
                      }`}
                    >
                      {selectedPlanId === plan._id && (
                        <div className="absolute top-3 right-3 text-blue-500">
                          <FiCheckCircle size={20} />
                        </div>
                      )}
                      
                      <h4 className="text-lg font-bold text-white mb-1">{plan.name}</h4>
                      <div className="text-blue-400 font-bold text-xl mb-4">
                        PKR {plan.depositAmount.toLocaleString()}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Daily Profit:</span>
                          <span className="text-green font-medium">PKR {plan.dailyProfit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Duration:</span>
                          <span className="text-white font-medium">{plan.duration} Days</span>
                        </div>
                        <div className="flex justify-between border-t border-white/5 pt-2 mt-2">
                          <span className="text-slate-400">Total Return:</span>
                          <span className="text-blue-400 font-bold">PKR {plan.totalReturn.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-[#1a2340] bg-[#060a14] flex justify-end gap-3">
              <button
                onClick={() => setShowInvestModal(false)}
                className="px-5 py-2.5 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvest}
                disabled={!selectedPlanId || isInvesting}
                className={`px-6 py-2.5 rounded-lg font-medium text-white transition-all flex items-center gap-2 ${
                  !selectedPlanId || isInvesting
                    ? 'bg-blue-600/50 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                }`}
              >
                {isInvesting ? (
                  <>
                    <FiRefreshCw className="animate-spin" /> Processing...
                  </>
                ) : (
                  'Invest Now'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyInvestments;

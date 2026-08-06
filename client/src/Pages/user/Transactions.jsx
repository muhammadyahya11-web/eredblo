import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { transactionAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Transactions = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTransactions = async () => {
    try {
      const params = { page, limit: 10 };
      if (filter !== 'All') params.type = filter;
      const { data } = await transactionAPI.getMyTransactions(params);
      if (data.success) {
        setTransactions(data.data);
        setTotalPages(data.pages);
      }
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filter, page]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'success':
      case 'completed':
        return <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 text-[10px] font-semibold rounded-full uppercase">Approved</span>;
      case 'pending':
        return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 text-[10px] font-semibold rounded-full uppercase">Pending</span>;
      case 'rejected':
      case 'failed':
        return <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 text-[10px] font-semibold rounded-full uppercase">Rejected</span>;
      default:
        return <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1 text-[10px] font-semibold rounded-full uppercase">{status || 'Success'}</span>;
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const dateOpts = { month: 'short', day: 'numeric', year: 'numeric' };
    const timeOpts = { hour: '2-digit', minute: '2-digit', hour12: true };
    return `${d.toLocaleDateString('en-US', dateOpts)} - ${d.toLocaleTimeString('en-US', timeOpts)}`;
  };

  const displayData = transactions;

  const filterOptions = ['All', 'Deposit', 'Withdrawal', 'Investment', 'Profit'];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      
      <div className="bg-[#0d152a] border border-blue-500/30 shadow-sm shadow-blue-500/10 rounded-xl p-6">
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8 border-b border-blue-500/30 shadow-sm shadow-blue-500/10 pb-6">
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-6 py-2 rounded-lg text-xs font-medium transition-all ${
                filter === f 
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                  : 'bg-transparent border border-blue-500/30 shadow-sm shadow-blue-500/10 text-slate-400 hover:border-blue-500/50 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-blue-500/30 shadow-sm shadow-blue-500/10">
                <th className="py-4 px-4 text-xs font-medium text-slate-400">ID</th>
                <th className="py-4 px-4 text-xs font-medium text-slate-400">Type</th>
                <th className="py-4 px-4 text-xs font-medium text-slate-400">Amount</th>
                <th className="py-4 px-4 text-xs font-medium text-slate-400">Status</th>
                <th className="py-4 px-4 text-xs font-medium text-slate-400 text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="py-8 text-center text-slate-400 text-sm">Loading transactions...</td></tr>
              ) : displayData.length === 0 ? (
                <tr><td colSpan="5" className="py-8 text-center text-slate-400 text-sm">No transactions found</td></tr>
              ) : (
                displayData.map((tx, idx) => (
                  <tr key={tx._id} className="border-b border-blue-500/30 shadow-sm shadow-blue-500/10 hover:bg-[#1a2c5b]/10 transition-colors">
                    <td className="py-4 px-4 text-xs text-slate-400">#{tx._id.substring(0, 8).toUpperCase()}</td>
                    <td className="py-4 px-4 text-sm text-white font-medium">{tx.type}</td>
                    <td className={`py-4 px-4 text-sm font-semibold ${tx.isPositive || tx.type === 'Deposit' || tx.type === 'Profit' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.isPositive || tx.type === 'Deposit' || tx.type === 'Profit' ? '+' : '-'} PKR {tx.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400 text-right">
                      {formatDate(tx.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-xs font-medium text-slate-400 bg-transparent border border-blue-500/30 shadow-sm shadow-blue-500/10 rounded-lg hover:border-blue-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button 
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                page === p 
                  ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' 
                  : 'bg-transparent text-slate-400 hover:bg-[#1c2a4a] hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}



          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-xs font-medium text-slate-400 bg-transparent border border-blue-500/30 shadow-sm shadow-blue-500/10 rounded-lg hover:border-blue-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
};

export default Transactions;

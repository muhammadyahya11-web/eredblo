import React, { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Activity } from "lucide-react";
import { earningsAPI, transactionAPI } from '../../services/api';

export default function AdminEarnings() {
  const [earnings, setEarnings] = useState(null);
  const [recentTxns, setRecentTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [earningsRes, txRes] = await Promise.all([
          earningsAPI.getPlatformEarnings(),
          transactionAPI.getAll({ limit: 10, type: 'Profit' }),
        ]);
        if (earningsRes.data.success) setEarnings(earningsRes.data.data);
        if (txRes.data.success) setRecentTxns(txRes.data.data);
      } catch (error) {
        console.error('Failed to load earnings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-[#0a0f1e] min-h-full">
        <div className="loading-state">Loading earnings data...</div>
      </div>
    );
  }

  const totalEarnings = earnings?.totalEarnings || 0;
  const totalInvestment = earnings?.totalInvestment || 0;
  const totalWithdrawals = earnings?.totalWithdrawals || 0;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-[#0a0f1e] min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Earnings</h1>
        <p className="text-slate-400 text-sm mt-1">Platform earnings overview and analytics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <DollarSign className="text-green-400" size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Earnings</p>
            <p className="text-2xl font-bold text-white">RS {(totalEarnings || 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            <TrendingUp className="text-blue-400" size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Investment</p>
            <p className="text-2xl font-bold text-white">RS {(totalInvestment || 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Activity className="text-purple-400" size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Withdrawals</p>
            <p className="text-2xl font-bold text-white">RS {(totalWithdrawals || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl p-5 hover:border-blue-500/20 transition-all duration-500">
        <h2 className="font-semibold text-white text-base mb-5 tracking-tight">Recent Profit Transactions</h2>
        {recentTxns.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No profit transactions yet</p>
        ) : (
          <div className="space-y-3">
            {recentTxns.map((tx) => (
              <div key={tx._id} className="flex items-center justify-between p-4 bg-[#050810] border border-blue-500/10 rounded-xl hover:border-blue-500/30 transition-all duration-300">
                <div>
                  <p className="text-sm font-medium text-white">{tx.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-slate-400">Profit</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-400">+ PKR {(tx.amount || 0).toLocaleString()}</p>
                  <p className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

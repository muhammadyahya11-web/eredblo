import React, { useState, useEffect } from "react";
import { Search, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { transactionAPI } from '../../services/api';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const fetchTransactions = async () => {
    try {
      const params = { limit: 50 };
      if (filter !== 'All') params.type = filter;
      const { data } = await transactionAPI.getAll(params);
      if (data.success) setTransactions(data.data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const filtered = filter === "All" ? transactions : transactions.filter(t => t.type === filter);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-[#0a0f1e] min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
        <p className="text-slate-400 text-sm mt-1">View and manage all platform transactions</p>
      </div>

      <div className="table-filters">
        {["All", "Deposit", "Withdrawal", "Investment", "Profit"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`filter-btn ${filter === f ? "active" : ""}`}>{f}</button>
        ))}
      </div>

      <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl overflow-hidden hover:border-blue-500/20 transition-all duration-500">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading transactions...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-slate-400">No transactions found</td></tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t._id} className="hover:bg-blue-500/5 rounded-lg transition-all duration-300">
                      <td>
                        <div className="flex items-center gap-2">
                          {t.isPositive ? <ArrowDownRight className="text-green-400" size={18} /> : <ArrowUpRight className="text-red-400" size={18} />}
                          <span className="font-medium text-white">{t.type}</span>
                        </div>
                      </td>
                      <td className="text-slate-300">{t.user?.name || 'Unknown'}</td>
                      <td className={`font-medium ${t.isPositive ? "text-green-400" : "text-red-400"}`}>
                        {t.isPositive ? "+" : "-"} PKR {t.amount?.toLocaleString()}
                      </td>
                      <td><span className={`status-badge ${t.status.toLowerCase()}`}>{t.status}</span></td>
                      <td className="text-slate-400">{new Date(t.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

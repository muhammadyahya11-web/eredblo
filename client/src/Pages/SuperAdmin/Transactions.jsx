import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { transactionAPI } from '../../services/api';
import Pagination from '../../components/Pagination';

const statusStyles = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function SuperAdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const fetchTransactions = async () => {
    try {
      const params = { page, limit };
      if (filter !== 'All') params.type = filter;
      const { data } = await transactionAPI.getAll(params);
      if (data.success) {
        setTransactions(data.data);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, [filter, page, limit]);

  const typeColor = (type) => {
    switch(type?.toLowerCase()) {
      case 'deposit': return 'text-green-400';
      case 'withdrawal': return 'text-amber-400';
      case 'investment': return 'text-blue-400';
      case 'profit': return 'text-purple-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-[#0a0f1e] min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
        <p className="text-slate-400 text-sm mt-1">All platform transactions</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {["All", "Deposit", "Withdrawal", "Investment", "Profit"].map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border ${
            filter === f 
              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
              : "bg-[#0d1530] text-slate-400 border-blue-500/10 hover:border-blue-500/30 hover:text-white"
          }`}>
            {f}
          </button>
        ))}
      </div>
      <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading transactions...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-500/10">
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-slate-400">No transactions found</td></tr>
                ) : (
                  transactions.map((t, idx) => (
                    <tr key={t._id} className={`hover:bg-blue-500/5 transition-all duration-300 border-b border-white/5 last:border-0 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                      <td className={`font-medium px-5 py-4 ${typeColor(t.type)}`}>{t.type}</td>
                      <td className="text-slate-300 px-5 py-4">{t.user?.name || 'Unknown'}</td>
                      <td className={`font-medium px-5 py-4 ${t.isPositive ? "text-green-400" : "text-red-400"}`}>
                        {t.isPositive ? "+" : "-"} PKR {t.amount?.toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[t.status?.toLowerCase()] || "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="text-slate-400 px-5 py-4">{new Date(t.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        page={page}
        pages={pages}
        total={total}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />
    </div>
  );
}

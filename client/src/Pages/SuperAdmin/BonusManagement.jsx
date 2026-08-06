import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Gift,
  Search,
  User,
  Check,
  X,
  Loader2,
  History,
} from 'lucide-react';
import { bonusAPI } from '../../services/api';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatPKR(amount) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── sub-components ─────────────────────────────────────────────────────────

function UserSearchDropdown({ query, results, loading, onSelect, onClear }) {
  if (!query || (!loading && results.length === 0)) return null;

  return (
    <div
      className="absolute z-20 left-0 right-0 top-full mt-1 rounded-lg border border-white/10 overflow-hidden shadow-2xl"
      style={{ background: '#060a14' }}
    >
      {loading ? (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Searching…
        </div>
      ) : (
        results.map((u) => (
          <button
            key={u._id}
            type="button"
            onClick={() => onSelect(u)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{u.name}</p>
              <p className="text-xs text-gray-400 truncate">{u.email}</p>
            </div>
          </button>
        ))
      )}
    </div>
  );
}

function SelectedUserCard({ user, onClear }) {
  return (
    <div
      className="flex items-center justify-between rounded-lg px-4 py-3 border border-green-500/30"
      style={{ background: 'rgba(34,197,94,0.07)' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center">
          <User className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{user.name}</p>
          <p className="text-xs text-gray-400">{user.email}</p>
          {user.balance !== undefined && (
            <p className="text-xs text-green-400 mt-0.5">
              Balance: {formatPKR(user.balance)}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
}

// ─── LEFT: Issue Bonus Form ──────────────────────────────────────────────────

function IssueBonusCard({ onBonusIssued }) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);
  const wrapperRef = useRef(null);

  // close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQueryChange = useCallback((e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceTimer.current);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await bonusAPI.searchUsers(val.trim());
        setSearchResults(res.data?.users || res.data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
  }, []);

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setQuery('');
    setSearchResults([]);
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    setQuery('');
    setSearchResults([]);
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      toast.error('Please select a user first.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error('Enter a valid amount.');
      return;
    }
    setSubmitting(true);
    try {
      await bonusAPI.issueBonus({
        userId: selectedUser._id,
        amount: parsedAmount,
        reason: reason.trim() || undefined,
      });
      toast.success(`Bonus of ${formatPKR(parsedAmount)} issued to ${selectedUser.name}!`);
      setSelectedUser(null);
      setQuery('');
      setAmount('');
      setReason('');
      onBonusIssued?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to issue bonus.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="glow-panel p-6 flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.25) 0%, rgba(16,185,129,0.15) 100%)',
          }}
        >
          <Gift className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Issue Bonus</h2>
          <p className="text-xs text-gray-400">Credit a bonus directly to a user's wallet</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* User search */}
        {!selectedUser ? (
          <div ref={wrapperRef} className="relative">
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Search User
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="Name or email…"
                autoComplete="off"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 border border-blue-500/20 focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] focus:outline-none transition-colors bg-[#050810]"
              />
            </div>
            <UserSearchDropdown
              query={query}
              results={searchResults}
              loading={searchLoading}
              onSelect={handleSelectUser}
              onClear={() => setSearchResults([])}
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Selected User
            </label>
            <SelectedUserCard user={selectedUser} onClear={handleClearUser} />
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Amount
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 select-none"
            >
              PKR
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full pl-12 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 border border-blue-500/20 focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] focus:outline-none transition-colors bg-[#050810]"
            />
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Reason <span className="text-gray-600">(optional)</span>
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Referral reward, promotional credit…"
            className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 border border-blue-500/20 focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] focus:outline-none transition-colors bg-[#050810]"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !selectedUser || !amount}
          className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: submitting || !selectedUser || !amount
              ? 'rgba(34,197,94,0.3)'
              : 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
            color: '#fff',
          }}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Issuing…
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Issue Bonus
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// ─── RIGHT: Bonus History ────────────────────────────────────────────────────

const PAGE_SIZE = 10;

function BonusHistoryCard({ refreshSignal }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await bonusAPI.getBonusHistory({ page: p, limit: PAGE_SIZE });
      const data = res.data;
      setHistory(data?.transactions || data?.bonuses || data?.data || []);
      const total = data?.totalPages || data?.pages || Math.ceil((data?.total || 0) / PAGE_SIZE) || 1;
      setTotalPages(total);
      setPage(p);
    } catch {
      toast.error('Failed to load bonus history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory, refreshSignal]);

  const handlePage = (p) => {
    if (p < 1 || p > totalPages) return;
    fetchHistory(p);
  };

  return (
    <div
      className="glow-panel p-6 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(99,102,241,0.2)' }}
        >
          <History className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Bonus History</h2>
          <p className="text-xs text-gray-400">Recent bonus transactions</p>
        </div>
      </div>

      {/* Table / Loading */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
        </div>
      ) : history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
          <Gift className="w-10 h-10 text-gray-600" />
          <p className="text-sm text-gray-500">No bonus transactions yet.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.map((tx, idx) => (
                  <tr
                    key={tx._id || idx}
                    className="hover:bg-white/3 transition-colors"
                  >
                    {/* User */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                          <User className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-xs font-medium truncate max-w-[100px]">
                            {tx.user?.name || tx.userName || '—'}
                          </p>
                          <p className="text-gray-500 text-[10px] truncate max-w-[100px]">
                            {tx.user?.email || tx.userEmail || ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Amount */}
                    <td className="py-3 px-3 text-right">
                      <span className="text-green-400 font-semibold text-xs">
                        +{formatPKR(tx.amount)}
                      </span>
                    </td>
                    {/* Reason */}
                    <td className="py-3 px-3">
                      <span className="text-gray-300 text-xs line-clamp-1">
                        {tx.reason || tx.description || <span className="text-gray-600 italic">—</span>}
                      </span>
                    </td>
                    {/* Date */}
                    <td className="py-3 px-3">
                      <span className="text-gray-400 text-xs whitespace-nowrap">
                        {formatDate(tx.createdAt || tx.date)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePage(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 text-gray-400 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let p;
                  if (totalPages <= 5) {
                    p = i + 1;
                  } else if (page <= 3) {
                    p = i + 1;
                  } else if (page >= totalPages - 2) {
                    p = totalPages - 4 + i;
                  } else {
                    p = page - 2 + i;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => handlePage(p)}
                      className="w-7 h-7 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        background: p === page ? 'rgba(99,102,241,0.35)' : 'transparent',
                        color: p === page ? '#a5b4fc' : '#6b7280',
                        border: p === page ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 text-gray-400 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function BonusManagement() {
  const [refreshSignal, setRefreshSignal] = useState(0);

  const handleBonusIssued = () => {
    setRefreshSignal((prev) => prev + 1);
  };

  return (
    <div
      className="min-h-screen w-full p-6"
      style={{ background: '#060a14' }}
    >
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Gift className="w-6 h-6 text-green-400" />
          Bonus Management
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Issue bonuses to users and review transaction history.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <IssueBonusCard onBonusIssued={handleBonusIssued} />
        <BonusHistoryCard refreshSignal={refreshSignal} />
      </div>
    </div>
  );
}

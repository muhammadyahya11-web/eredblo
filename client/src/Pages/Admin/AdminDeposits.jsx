import React, { useState, useEffect, useCallback } from "react";
import {
  Search, CheckCircle, XCircle, Clock, Eye, RefreshCw,
  ChevronDown, X, ZoomIn, Download, AlertTriangle,
  TrendingUp, DollarSign, Filter
} from "lucide-react";
import { depositAPI } from '../../services/api';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';

/* ─── Status Badge ──────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = {
    Pending:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', icon: <Clock size={11} /> },
    Approved: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)',  icon: <CheckCircle size={11} /> },
    Rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  icon: <XCircle size={11} /> },
  };
  const s = cfg[status] || cfg.Pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
    }}>
      {s.icon} {status}
    </span>
  );
}

/* ─── Method Badge ──────────────────────────────────────────────── */
function MethodBadge({ method }) {
  const colors = {
    JazzCash: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    Easypaisa: { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    'Bank Transfer': { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  };
  const c = colors[method] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
      color: c.color, background: c.bg,
    }}>
      {method}
    </span>
  );
}

/* ─── Image Viewer Modal ────────────────────────────────────────── */
function ImageViewerModal({ deposit, onClose }) {
  if (!deposit) return null;
  const imgUrl = deposit.screenshot;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 20, backdropFilter: 'blur(6px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0d1530', border: '1px solid #1e2d4a',
          borderRadius: 16, maxWidth: 700, width: '100%',
          maxHeight: '90vh', overflow: 'auto',
          boxShadow: '0 25px 80px rgba(0,0,0,0.8)',
          animation: 'modalIn 0.25s ease',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #1e2d4a',
        }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Payment Screenshot</h3>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              {deposit.user?.name || 'Unknown'} · {deposit.paymentMethod} · PKR {deposit.amount?.toLocaleString()}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {imgUrl && (
              <a
                href={imgUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: 8, padding: '6px 12px', color: '#60a5fa',
                  textDecoration: 'none', fontSize: 12, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <ZoomIn size={13} /> Full Size
              </a>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#ef4444',
                display: 'flex', alignItems: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Image */}
        <div style={{ padding: 20 }}>
          {imgUrl ? (
            <img
              src={imgUrl}
              alt="Payment proof"
              style={{ width: '100%', maxHeight: 420, objectFit: 'contain', borderRadius: 10, background: '#050810' }}
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div style={{
            display: imgUrl ? 'none' : 'flex',
            background: '#050810', borderRadius: 10, height: 200,
            alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8,
          }}>
            <AlertTriangle size={32} color="#f59e0b" />
            <p style={{ color: '#64748b', fontSize: 13 }}>No screenshot available</p>
          </div>

          {/* Deposit Details Grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16,
          }}>
            {[
              { label: 'User Name', value: deposit.user?.name || '—' },
              { label: 'User Email', value: deposit.user?.email || '—' },
              { label: 'Amount', value: `PKR ${deposit.amount?.toLocaleString()}` },
              { label: 'Payment Method', value: deposit.paymentMethod },
              { label: 'Transaction ID', value: deposit.transactionId },
              { label: 'Status', value: deposit.status },
              { label: 'Date', value: new Date(deposit.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) },
              { label: 'Admin Note', value: deposit.adminMessage || '—' },
            ].map((item, i) => (
              <div key={i} style={{
                background: '#080d1a', border: '1px solid #1e2d4a',
                borderRadius: 8, padding: '10px 14px',
              }}>
                <p style={{ fontSize: 10, color: '#64748b', marginBottom: 3 }}>{item.label}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', wordBreak: 'break-all' }}>{item.value}</p>
              </div>
            ))}
          </div>

          {deposit.notes && (
            <div style={{
              marginTop: 12, background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.2)',
              borderRadius: 10, padding: '10px 14px',
            }}>
              <p style={{ fontSize: 11, color: '#60a5fa', fontWeight: 600, marginBottom: 3 }}>User Notes:</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>{deposit.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Approve/Reject Modal ──────────────────────────────────────── */
function ActionModal({ deposit, action, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(deposit._id, action, reason);
    setLoading(false);
    onClose();
  };

  const isApprove = action === 'Approved';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 999, backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0d1530', border: `1px solid ${isApprove ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          borderRadius: 16, padding: 28, maxWidth: 440, width: '90%',
          boxShadow: `0 20px 60px ${isApprove ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
          animation: 'modalIn 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: isApprove ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isApprove
              ? <CheckCircle size={22} color="#22c55e" />
              : <XCircle size={22} color="#ef4444" />
            }
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
              {isApprove ? 'Approve Deposit' : 'Reject Deposit'}
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              PKR {deposit?.amount?.toLocaleString()} · {deposit?.paymentMethod}
            </p>
          </div>
        </div>

        <div style={{
          background: '#080d1a', border: '1px solid #1e2d4a',
          borderRadius: 10, padding: '10px 14px', marginBottom: 16,
        }}>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>
            User: <strong style={{ color: '#fff' }}>{deposit?.user?.name || 'Unknown'}</strong> ·{' '}
            TxID: <code style={{ color: '#60a5fa', fontSize: 11 }}>{deposit?.transactionId}</code>
          </p>
        </div>

        {isApprove ? (
          <div style={{
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 10, padding: '12px 14px', marginBottom: 16,
            fontSize: 12, color: '#4ade80', lineHeight: 1.6,
          }}>
            ✅ This will credit <strong>PKR {deposit?.amount?.toLocaleString()}</strong> to the user's balance and send a notification.
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6, fontWeight: 500 }}>
              Rejection Reason <span style={{ color: '#64748b' }}>(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Invalid transaction ID, blurry screenshot..."
              rows={3}
              style={{
                width: '100%', background: '#050810', border: '1px solid #1e2d4a',
                borderRadius: 8, padding: '10px 12px', color: '#fff',
                fontSize: 13, resize: 'vertical', outline: 'none',
                boxSizing: 'border-box', fontFamily: 'inherit',
              }}
              onFocus={e => (e.target.style.borderColor = '#ef4444')}
              onBlur={e => (e.target.style.borderColor = '#1e2d4a')}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid #1e2d4a',
              borderRadius: 10, padding: '11px', color: '#94a3b8',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              flex: 2,
              background: isApprove
                ? 'linear-gradient(135deg, #16a34a, #15803d)'
                : 'linear-gradient(135deg, #dc2626, #b91c1c)',
              border: 'none', borderRadius: 10, padding: '11px',
              color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: isApprove ? '0 4px 15px rgba(22,163,74,0.4)' : '0 4px 15px rgba(220,38,38,0.4)',
            }}
          >
            {loading ? 'Processing...' : (isApprove ? '✓ Approve & Credit' : '✗ Reject Deposit')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══ MAIN COMPONENT ════════════════════════════════════════════════ */
export default function AdminDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [viewDeposit, setViewDeposit] = useState(null);   // image modal
  const [actionModal, setActionModal] = useState(null);   // { deposit, action }
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const fetchDeposits = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (filter !== 'All') params.status = filter;
      const { data } = await depositAPI.getAll(params);
      if (data.success) {
        setDeposits(data.data || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      }
    } catch {
      toast.error('Failed to load deposits');
    } finally {
      setLoading(false);
    }
  }, [filter, page, limit]);

  useEffect(() => { fetchDeposits(); }, [fetchDeposits]);

  /* Approve / Reject handler */
  const handleAction = async (id, status, adminMessage) => {
    try {
      const { data } = await depositAPI.updateStatus(id, { status, adminMessage: adminMessage || '' });
      if (data.success) {
        toast.success(`Deposit ${status.toLowerCase()} successfully`);
        fetchDeposits();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  /* Stats */
  const totalDeposits  = deposits.length;
  const pendingCount   = deposits.filter(d => d.status === 'Pending').length;
  const approvedCount  = deposits.filter(d => d.status === 'Approved').length;
  const rejectedCount  = deposits.filter(d => d.status === 'Rejected').length;
  const totalAmount    = deposits.filter(d => d.status === 'Approved').reduce((s, d) => s + (d.amount || 0), 0);

  /* Filter + search */
  const filtered = deposits.filter(d => {
    const matchFilter = filter === 'All' || d.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || (d.user?.name || '').toLowerCase().includes(q)
      || (d.user?.email || '').toLowerCase().includes(q)
      || (d.transactionId || '').toLowerCase().includes(q)
      || (d.paymentMethod || '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div style={{
      background: '#080d1a', minHeight: '100%', padding: '20px 24px',
      fontFamily: "'Inter','Segoe UI',sans-serif", color: '#fff',
      opacity: mounted ? 1 : 0, transition: 'opacity 0.4s ease',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>Deposits</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>
            Review, verify, and approve user deposit requests
          </p>
        </div>
        <button
          onClick={fetchDeposits}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: 10, padding: '8px 14px', color: '#60a5fa',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Deposits', value: totalDeposits, icon: <DollarSign size={20} />, color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
          { label: 'Pending Review', value: pendingCount, icon: <Clock size={20} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
          { label: 'Approved', value: approvedCount, icon: <CheckCircle size={20} />, color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
          { label: 'Total Approved (PKR)', value: totalAmount.toLocaleString(), icon: <TrendingUp size={20} />, color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
        ].map((s, i) => (
          <div key={i} style={{
            background: '#0d1530', border: '1px solid #1e2d4a', borderRadius: 14,
            padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 14,
            animation: `fadeUp 0.5s ease ${i * 80}ms both`,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: s.color, flexShrink: 0,
            }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#64748b', marginBottom: 3 }}>{s.label}</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters + Search ── */}
      <div style={{
        background: '#0d1530', border: '1px solid #1e2d4a', borderRadius: 14,
        padding: '14px 18px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              style={{
                padding: '6px 16px', borderRadius: 20,
                border: filter === f ? '1px solid rgba(59,130,246,0.5)' : '1px solid #1e2d4a',
                background: filter === f ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
                color: filter === f ? '#60a5fa' : '#64748b',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {f}
              {f === 'Pending' && pendingCount > 0 && (
                <span style={{
                  marginLeft: 6, background: '#f59e0b', color: '#000',
                  borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700,
                }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: 220 }}>
          <Search size={14} color="#4a5568" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={search}
             onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search user, TxID, method..."
            style={{
              width: '100%', background: '#050810', border: '1px solid #1e2d4a',
              borderRadius: 10, padding: '9px 12px 9px 34px',
              color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = '#3b82f6')}
            onBlur={e => (e.target.style.borderColor = '#1e2d4a')}
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{
        background: '#0d1530', border: '1px solid #1e2d4a',
        borderRadius: 14, overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#4a5568', fontSize: 14 }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', display: 'block', color: '#3b82f6' }} />
            Loading deposits...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>📭</span>
            <p style={{ color: '#64748b', fontSize: 14 }}>No deposits found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#080d1a', borderBottom: '1px solid #1e2d4a' }}>
                  {['#', 'User', 'Method', 'Amount', 'Transaction ID', 'Screenshot', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '12px 14px', textAlign: 'left',
                      fontSize: 11, fontWeight: 600, color: '#64748b',
                      letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, idx) => (
                  <tr
                    key={d._id}
                    style={{
                      borderBottom: '1px solid rgba(30,45,74,0.6)',
                      transition: 'background 0.15s',
                      animation: `fadeUp 0.4s ease ${idx * 40}ms both`,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* # */}
                    <td style={{ padding: '13px 14px', color: '#4a5568', fontSize: 12 }}>
                      {idx + 1}
                    </td>

                    {/* User */}
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                        }}>
                          {(d.user?.name || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13 }}>{d.user?.name || 'Unknown'}</p>
                          <p style={{ fontSize: 11, color: '#4a5568', marginTop: 1 }}>{d.user?.email || '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Method */}
                    <td style={{ padding: '13px 14px' }}>
                      <MethodBadge method={d.paymentMethod} />
                    </td>

                    {/* Amount */}
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#22c55e' }}>
                        PKR {d.amount?.toLocaleString()}
                      </span>
                    </td>

                    {/* Transaction ID */}
                    <td style={{ padding: '13px 14px' }}>
                      <code style={{ fontSize: 11, color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '3px 7px', borderRadius: 5 }}>
                        {d.transactionId}
                      </code>
                    </td>

                    {/* Screenshot */}
                    <td style={{ padding: '13px 14px' }}>
                      {d.screenshot ? (
                        <button
                          onClick={() => setViewDeposit(d)}
                          style={{
                            background: 'none', border: '1px solid #1e2d4a',
                            borderRadius: 8, padding: '4px 8px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 4,
                            color: '#60a5fa', fontSize: 11, fontWeight: 600, transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(96,165,250,0.1)'; e.currentTarget.style.borderColor = 'rgba(96,165,250,0.4)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#1e2d4a'; }}
                        >
                          <Eye size={13} /> View
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: '#4a5568' }}>No image</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '13px 14px' }}>
                      <StatusBadge status={d.status} />
                    </td>

                    {/* Date */}
                    <td style={{ padding: '13px 14px', whiteSpace: 'nowrap', color: '#64748b', fontSize: 12 }}>
                      {new Date(d.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {/* View Details */}
                        <button
                          onClick={() => setViewDeposit(d)}
                          title="View Details"
                          style={{
                            background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)',
                            borderRadius: 7, padding: '6px 8px', cursor: 'pointer',
                            color: '#60a5fa', display: 'flex', alignItems: 'center', transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(96,165,250,0.18)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(96,165,250,0.08)'}
                        >
                          <Eye size={14} />
                        </button>

                        {d.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => setActionModal({ deposit: d, action: 'Approved' })}
                              title="Approve"
                              style={{
                                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
                                borderRadius: 7, padding: '6px 10px', cursor: 'pointer',
                                color: '#22c55e', fontSize: 11, fontWeight: 600,
                                display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.2)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,197,94,0.1)'}
                            >
                              <CheckCircle size={13} /> Approve
                            </button>
                            <button
                              onClick={() => setActionModal({ deposit: d, action: 'Rejected' })}
                              title="Reject"
                              style={{
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                                borderRadius: 7, padding: '6px 10px', cursor: 'pointer',
                                color: '#ef4444', fontSize: 11, fontWeight: 600,
                                display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table footer */}
        {!loading && filtered.length > 0 && (
          <div style={{
            padding: '12px 18px', borderTop: '1px solid #1e2d4a',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 12, color: '#4a5568',
          }}>
            <span>Showing {filtered.length} of {total} deposits</span>
            {pendingCount > 0 && (
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                ⚠ {pendingCount} deposit{pendingCount > 1 ? 's' : ''} awaiting review
              </span>
            )}
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

      {/* ── Modals ── */}
      {viewDeposit && (
        <ImageViewerModal deposit={viewDeposit} onClose={() => setViewDeposit(null)} />
      )}
      {actionModal && (
        <ActionModal
          deposit={actionModal.deposit}
          action={actionModal.action}
          onClose={() => setActionModal(null)}
          onConfirm={handleAction}
        />
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

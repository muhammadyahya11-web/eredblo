import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { depositAPI, settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiUploadCloud, FiInfo, FiX, FiCopy, FiCheckCircle, FiClock,
  FiAlertTriangle, FiRefreshCw, FiArrowRight
} from 'react-icons/fi';
import {
  BsBank2, BsPhone, BsShieldCheck, BsCurrencyExchange
} from 'react-icons/bs';

/* ─── Static fallback payment details ──────────────────────────── */
const FALLBACK_ACCOUNTS = [
  {
    method: 'JazzCash',
    accountTitle: 'Muhammad Abdullah',
    accountNumber: '03184271931',
    bankName: '',
    branchCode: '',
    iban: '',
    instructions: 'Send money to this JazzCash number and upload the screenshot below.',
  },
  {
    method: 'Easypaisa',
    accountTitle: 'Hareem sultana',
    accountNumber: '0370-8962761',
    bankName: '',
    branchCode: '',
    iban: '',
    instructions: 'Transfer via Easypaisa app or any Easypaisa retailer.',
  },
  {
    method: 'Bank Transfer',
    accountTitle: 'Ali Raza Trading Co.',
    accountNumber: '01234567890123',
    bankName: 'Meezan Bank',
    branchCode: '0213',
    iban: 'PK36MEZN0001234567890123',
    instructions: 'Use online banking or visit any Meezan Bank branch for transfer.',
  },
];

/* ─── Payment method config ─────────────────────────────────────── */
const METHOD_CONFIG = {
  JazzCash: {
    label: 'JazzCash',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.35)',
    icon: '📱',
    tag: 'Mobile Wallet',
  },
  Easypaisa: {
    label: 'Easypaisa',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.35)',
    icon: '💳',
    tag: 'Mobile Wallet',
  },
  'Bank Transfer': {
    label: 'Bank Transfer',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.12)',
    border: 'rgba(96,165,250,0.35)',
    icon: '🏦',
    tag: 'Bank Account',
  },
};

/* ─── Copy Button ────────────────────────────────────────────────── */
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      onClick={handle}
      title="Copy"
      style={{
        background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.07)',
        border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 6,
        padding: '3px 8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        color: copied ? '#22c55e' : '#94a3b8',
        fontSize: 11,
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      {copied ? <FiCheckCircle size={12} /> : <FiCopy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/* ─── Detail Row ─────────────────────────────────────────────────── */
function DetailRow({ label, value, copyable = false }) {
  if (!value) return null;
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
      gap: 8,
    }}>
      <span style={{ fontSize: 12, color: '#64748b', flexShrink: 0 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', fontFamily: 'monospace', wordBreak: 'break-all', textAlign: 'right' }}>{value}</span>
        {copyable && <CopyBtn text={value} />}
      </div>
    </div>
  );
}

/* ─── Deposit History Row ────────────────────────────────────────── */
function HistoryRow({ deposit }) {
  const statusColors = {
    Pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
    Approved: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' },
    Rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
  };
  const s = statusColors[deposit.status] || statusColors.Pending;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderRadius: 10,
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      marginBottom: 8, gap: 12,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{deposit.paymentMethod}</span>
        <span style={{ fontSize: 11, color: '#64748b' }}>
          {new Date(deposit.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        {deposit.adminMessage && (
          <span style={{ fontSize: 11, color: '#f59e0b', marginTop: 2 }}>Note: {deposit.adminMessage}</span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#22c55e' }}>
          +PKR {deposit.amount?.toLocaleString()}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
          color: s.color, background: s.bg, border: `1px solid ${s.border}`,
        }}>
          {deposit.status}
        </span>
      </div>
    </div>
  );
}

/* ═══ MAIN COMPONENT ════════════════════════════════════════════════ */
const Deposit = () => {
  const { user } = useContext(AuthContext);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('JazzCash');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState(null);
  const [myDeposits, setMyDeposits] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settRes, depRes] = await Promise.all([
        settingsAPI.getPublic(),
        depositAPI.getMyDeposits({ limit: 10 }),
      ]);
      if (settRes.data.success) setSettings(settRes.data.data);
      if (depRes.data.success) setMyDeposits(depRes.data.data || []);
    } catch {}
    setLoadingHistory(false);
  };

  /* Active payment account for selected method */
  const getActiveAccount = () => {
    if (settings?.paymentAccounts?.length > 0) {
      const acc = settings.paymentAccounts.find(
        a => a.method === paymentMethod && a.isActive !== false
      );
      if (acc) return acc;
    }
    return FALLBACK_ACCOUNTS.find(a => a.method === paymentMethod) || FALLBACK_ACCOUNTS[0];
  };

  const activeAccount = getActiveAccount();
  const minDeposit = settings?.minimumDeposit || 300;
  const maxDeposit = settings?.maximumWithdrawal || 1000000;

  /* File handling */
  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Only image files allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be less than 5MB'); return; }
    setScreenshot(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  /* Submission */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt < minDeposit) { toast.error(`Minimum deposit is PKR ${minDeposit.toLocaleString()}`); return; }
    if (amt > maxDeposit) { toast.error(`Maximum deposit is PKR ${maxDeposit.toLocaleString()}`); return; }
    if (!transactionId.trim()) { toast.error('Transaction ID is required'); return; }
    if (!screenshot) { toast.error('Payment screenshot is required'); return; }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('paymentMethod', paymentMethod);
      formData.append('transactionId', transactionId.trim());
      formData.append('screenshot', screenshot);
      if (notes.trim()) formData.append('notes', notes.trim());

      const { data } = await depositAPI.create(formData);
      if (data.success) {
        toast.success('✅ Deposit submitted! Awaiting admin approval.');
        setAmount('');
        setTransactionId('');
        setNotes('');
        setScreenshot(null);
        setPreview(null);
        loadData(); // refresh history
      } else {
        toast.error(data.message || 'Submission failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Deposit failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const methods = Object.keys(METHOD_CONFIG);

  return (
    <div style={{
      background: '#080d1a',
      minHeight: '100%',
      padding: '20px 24px',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      opacity: mounted ? 1 : 0,
      transition: 'opacity 0.4s ease',
    }}>

      {/* ══ HEADER ══════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.3, marginBottom: 4 }}>
          Make a Deposit
        </h1>
        <p style={{ fontSize: 13, color: '#64748b' }}>
          Choose your payment method, send funds, and upload proof of payment.
        </p>
      </div>

      {/* ══ QUICK STATS ═════════════════════════════════════════════ */}
      <div className="dep-stats-grid" style={{ gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Min Deposit', value: `PKR ${minDeposit.toLocaleString()}`, icon: '📥', color: '#22c55e' },
          { label: 'Max Deposit', value: `PKR ${maxDeposit.toLocaleString()}`, icon: '📤', color: '#60a5fa' },
          { label: 'My Balance', value: `PKR ${(user?.totalBalance || 0).toLocaleString()}`, icon: '💰', color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} style={{
            background: '#0d1530', border: '1px solid #1e2d4a',
            borderRadius: 12, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <div>
              <p style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>{s.label}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ══ MAIN LAYOUT ═════════════════════════════════════════════ */}
      <div className="dep-main-grid" style={{ gap: 20, alignItems: 'start' }}>

        {/* ── LEFT: Method + Details + Form ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Payment Method Selector */}
          <div style={{ background: '#0d1530', border: '1px solid #1e2d4a', borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>
              1. Select Payment Method
            </h3>
            <div className="dep-methods-grid" style={{ gap: 10 }}>
              {methods.map(m => {
                const cfg = METHOD_CONFIG[m];
                const active = paymentMethod === m;
                return (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    style={{
                      background: active ? cfg.bg : 'rgba(255,255,255,0.03)',
                      border: `2px solid ${active ? cfg.border : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: 12,
                      padding: '14px 10px',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      transition: 'all 0.2s',
                      transform: active ? 'translateY(-2px)' : 'none',
                      boxShadow: active ? `0 6px 20px ${cfg.bg}` : 'none',
                    }}
                  >
                    <span style={{ fontSize: 28 }}>{cfg.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: active ? cfg.color : '#94a3b8' }}>
                      {cfg.label}
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: 600, color: active ? cfg.color : '#4a5568',
                      background: active ? cfg.bg : 'transparent',
                      border: `1px solid ${active ? cfg.border : 'transparent'}`,
                      borderRadius: 20, padding: '1px 7px',
                    }}>
                      {cfg.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Details Card */}
          {activeAccount && (
            <div style={{
              background: `linear-gradient(135deg, ${METHOD_CONFIG[paymentMethod].bg}, rgba(255,255,255,0.02))`,
              border: `1px solid ${METHOD_CONFIG[paymentMethod].border}`,
              borderRadius: 14, padding: 20,
              animation: 'fadeSlide 0.3s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{METHOD_CONFIG[paymentMethod].icon}</span>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: METHOD_CONFIG[paymentMethod].color }}>
                      {METHOD_CONFIG[paymentMethod].label} Account Details
                    </h3>
                    <p style={{ fontSize: 11, color: '#64748b' }}>Send your deposit to the details below</p>
                  </div>
                </div>
                <div style={{
                  background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: 20, padding: '3px 10px',
                  fontSize: 10, fontWeight: 600, color: '#22c55e',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <BsShieldCheck size={10} /> Verified
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '4px 12px' }}>
                <DetailRow label="Account Title" value={activeAccount.accountTitle} copyable />
                <DetailRow label={paymentMethod === 'Bank Transfer' ? 'Account Number' : 'Mobile Number'} value={activeAccount.accountNumber} copyable />
                {paymentMethod === 'Bank Transfer' && (
                  <>
                    <DetailRow label="Bank Name" value={activeAccount.bankName} />
                    <DetailRow label="Branch Code" value={activeAccount.branchCode} />
                    <DetailRow label="IBAN" value={activeAccount.iban} copyable />
                  </>
                )}
              </div>

              {activeAccount.instructions && (
                <div style={{
                  marginTop: 12,
                  background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: 10, padding: '10px 14px',
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                }}>
                  <FiInfo size={14} color="#f59e0b" style={{ marginTop: 1, flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: '#fbbf24', lineHeight: 1.6 }}>{activeAccount.instructions}</p>
                </div>
              )}
            </div>
          )}

          {/* Deposit Form */}
          <div style={{ background: '#0d1530', border: '1px solid #1e2d4a', borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
              2. Upload Proof &amp; Submit
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Screenshot Upload */}
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8, display: 'block', fontWeight: 500 }}>
                  Payment Screenshot <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  style={{
                    border: `2px dashed ${dragOver ? '#3b82f6' : preview ? '#22c55e' : '#1e2d4a'}`,
                    background: dragOver ? 'rgba(59,130,246,0.06)' : preview ? 'rgba(34,197,94,0.04)' : '#080d1a',
                    borderRadius: 12, padding: 20,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', minHeight: 160, transition: 'all 0.25s', position: 'relative',
                  }}
                >
                  {preview ? (
                    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                      <img src={preview} alt="Preview" style={{ maxHeight: 160, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }} />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setScreenshot(null); setPreview(null); }}
                        style={{
                          position: 'absolute', top: -8, right: -8,
                          background: '#ef4444', border: 'none', borderRadius: '50%',
                          width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#fff',
                        }}
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <FiUploadCloud size={36} color="#3b82f6" style={{ marginBottom: 10 }} />
                      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>
                        <span style={{ color: '#60a5fa', fontWeight: 600 }}>Click to upload</span> or drag &amp; drop
                      </p>
                      <p style={{ fontSize: 11, color: '#4a5568' }}>PNG, JPG, JPEG — Max 5MB</p>
                    </>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={e => processFile(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              {/* Grid: Amount + TxID */}
              <div className="dep-form-grid" style={{ gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block', fontWeight: 500 }}>
                    Amount (PKR) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder={`Min ${minDeposit.toLocaleString()}`}
                      min={minDeposit}
                      style={{
                        width: '100%', background: '#050810', border: '1px solid #1e2d4a',
                        borderRadius: 10, padding: '11px 44px 11px 14px',
                        fontSize: 14, color: '#fff', outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                      onBlur={e => (e.target.style.borderColor = '#1e2d4a')}
                      required
                    />
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#4a5568', fontWeight: 600 }}>PKR</span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block', fontWeight: 500 }}>
                    Transaction ID <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value)}
                    placeholder="e.g. TXN-123456"
                    style={{
                      width: '100%', background: '#050810', border: '1px solid #1e2d4a',
                      borderRadius: 10, padding: '11px 14px',
                      fontSize: 13, color: '#fff', outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                    onBlur={e => (e.target.style.borderColor = '#1e2d4a')}
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block', fontWeight: 500 }}>
                  Additional Notes <span style={{ color: '#4a5568' }}>(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any extra information for admin..."
                  rows={2}
                  style={{
                    width: '100%', background: '#050810', border: '1px solid #1e2d4a',
                    borderRadius: 10, padding: '10px 14px',
                    fontSize: 13, color: '#fff', outline: 'none', resize: 'vertical',
                    boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={e => (e.target.style.borderColor = '#1e2d4a')}
                />
              </div>

              {/* Amount preview */}
              {amount && parseFloat(amount) >= minDeposit && (
                <div style={{
                  background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: 10, padding: '10px 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>You are depositing:</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#22c55e' }}>
                    PKR {parseFloat(amount).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: isSubmitting ? '#1e40af' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#fff', border: 'none', padding: '14px',
                  borderRadius: 12, fontSize: 14, fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
                  transition: 'all 0.2s',
                  opacity: isSubmitting ? 0.75 : 1,
                }}
              >
                {isSubmitting ? (
                  <><FiRefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
                ) : (
                  <>Submit Deposit Request <FiArrowRight size={16} /></>
                )}
              </button>

              {/* Disclaimer */}
              <div style={{
                display: 'flex', gap: 8, alignItems: 'flex-start',
                background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 10, padding: '10px 12px',
              }}>
                <FiAlertTriangle size={14} color="#f59e0b" style={{ marginTop: 1, flexShrink: 0 }} />
                <p style={{ fontSize: 11, color: '#fbbf24', lineHeight: 1.6 }}>
                  Please make sure to send the exact amount from your own account. Third-party payments are not accepted. Deposits are processed within 2–24 hours.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* ── RIGHT: History ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* How It Works */}
          <div style={{ background: '#0d1530', border: '1px solid #1e2d4a', borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>How It Works</h3>
            {[
              { step: '01', title: 'Pick a Method', desc: 'Choose JazzCash, Easypaisa, or Bank Transfer', color: '#60a5fa' },
              { step: '02', title: 'Send Money', desc: 'Transfer funds to the account details shown', color: '#a78bfa' },
              { step: '03', title: 'Upload Proof', desc: 'Take a screenshot and upload it here', color: '#f59e0b' },
              { step: '04', title: 'Get Approved', desc: 'Admin verifies and credits your balance', color: '#22c55e' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < 3 ? 14 : 0, alignItems: 'flex-start' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: `${s.color}18`, border: `1px solid ${s.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: s.color, flexShrink: 0,
                }}>
                  {s.step}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{s.title}</p>
                  <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Deposit History */}
          <div style={{ background: '#0d1530', border: '1px solid #1e2d4a', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>My Deposits</h3>
              <button
                onClick={loadData}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                title="Refresh"
              >
                <FiRefreshCw size={14} />
              </button>
            </div>

            {loadingHistory ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#4a5568', fontSize: 13 }}>Loading...</div>
            ) : myDeposits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>📭</span>
                <p style={{ fontSize: 13, color: '#4a5568' }}>No deposits yet. Make your first deposit!</p>
              </div>
            ) : (
              <div>
                {myDeposits.map(d => <HistoryRow key={d._id} deposit={d} />)}
              </div>
            )}

            {/* Processing note */}
            <div style={{
              marginTop: 12, display: 'flex', gap: 8, alignItems: 'center',
              padding: '10px 12px', background: 'rgba(96,165,250,0.07)',
              border: '1px solid rgba(96,165,250,0.2)', borderRadius: 10,
            }}>
              <FiClock size={13} color="#60a5fa" />
              <p style={{ fontSize: 11, color: '#60a5fa' }}>Processing time: 2 – 24 hours</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        @media (max-width: 900px) {
          .dep-main-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .dep-stats-grid { grid-template-columns: 1fr !important; }
          .dep-methods-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .dep-methods-grid { grid-template-columns: 1fr !important; }
          .dep-form-grid { grid-template-columns: 1fr !important; }
        }
        .dep-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        .dep-main-grid { display: grid; grid-template-columns: 1fr 360px; }
        .dep-methods-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        .dep-form-grid { display: grid; grid-template-columns: 1fr 1fr; }
      `}</style>
    </div>
  );
};

export default Deposit;

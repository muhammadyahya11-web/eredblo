import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { depositAPI, settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiUploadCloud, FiInfo, FiX, FiCopy, FiCheckCircle, FiClock,
  FiAlertTriangle, FiRefreshCw, FiArrowRight, FiZap, FiShield,
  FiTrendingUp, FiDollarSign, FiArrowUpCircle,
  FiFileText, FiImage, FiHash, FiMessageSquare, FiSend,
  FiActivity, FiLayers, FiMousePointer, FiCamera
} from 'react-icons/fi';
import {
  BsBank2, BsShieldCheck, BsCheckCircleFill, BsClock,
  BsArrowUpCircle, BsWallet2, BsCardChecklist
} from 'react-icons/bs';
import {
  MdAccountBalance, MdOutlineVerified, MdOutlineSecurity
} from 'react-icons/md';
import { HiOutlineLightningBolt, HiOutlineCurrencyRupee } from 'react-icons/hi';
import { RiBankLine, RiSecurePaymentLine, RiMoneyDollarCircleLine } from 'react-icons/ri';

/* ─── Static fallback payment details ──────────────────────────── */
const FALLBACK_ACCOUNTS = [
  {
    method: 'JazzCash',
    accountTitle: 'Muhammad Abdullah',
    accountNumber: '0318-4371931',
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
    color: '#FF6B00',
    colorLight: '#FF8C3A',
    bg: 'rgba(255,107,0,0.10)',
    bgHover: 'rgba(255,107,0,0.18)',
    border: 'rgba(255,107,0,0.40)',
    borderActive: 'rgba(255,107,0,0.70)',
    glow: 'rgba(255,107,0,0.25)',
    tag: 'Mobile Wallet',
    logo: '/jazzcash_logo.jpg',
  },
  Easypaisa: {
    label: 'Easypaisa',
    color: '#00B050',
    colorLight: '#1ecb6a',
    bg: 'rgba(0,176,80,0.10)',
    bgHover: 'rgba(0,176,80,0.18)',
    border: 'rgba(0,176,80,0.40)',
    borderActive: 'rgba(0,176,80,0.70)',
    glow: 'rgba(0,176,80,0.25)',
    tag: 'Mobile Wallet',
    logo: '/easypaisa_logo.jpg',
  },
  'Bank Transfer': {
    label: 'Bank Transfer',
    color: '#6C8EF5',
    colorLight: '#93ABFF',
    bg: 'rgba(108,142,245,0.10)',
    bgHover: 'rgba(108,142,245,0.18)',
    border: 'rgba(108,142,245,0.40)',
    borderActive: 'rgba(108,142,245,0.70)',
    glow: 'rgba(108,142,245,0.25)',
    tag: 'Bank Account',
    logo: null,
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
        border: `1px solid ${copied ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.12)'}`,
        borderRadius: 8,
        padding: '4px 10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        color: copied ? '#22c55e' : '#7c8fa8',
        fontSize: 11,
        fontWeight: 600,
        transition: 'all 0.2s',
        flexShrink: 0,
        letterSpacing: 0.3,
      }}
    >
      {copied ? <FiCheckCircle size={12} /> : <FiCopy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

/* ─── Detail Row ─────────────────────────────────────────────────── */
function DetailRow({ label, value, copyable = false, icon }) {
  if (!value) return null;
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
        {icon && <span style={{ color: '#4a6080' }}>{icon}</span>}
        <span style={{ fontSize: 12, color: '#556070', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 13, fontWeight: 700, color: '#dde8f5',
          fontFamily: 'monospace', wordBreak: 'break-all', textAlign: 'right',
          letterSpacing: 0.5,
        }}>{value}</span>
        {copyable && <CopyBtn text={value} />}
      </div>
    </div>
  );
}

/* ─── Deposit History Row ────────────────────────────────────────── */
function HistoryRow({ deposit }) {
  const statusConfig = {
    Pending: {
      color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.30)',
      icon: <FiClock size={10} />
    },
    Approved: {
      color: '#22c55e', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.30)',
      icon: <FiCheckCircle size={10} />
    },
    Rejected: {
      color: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.30)',
      icon: <FiX size={10} />
    },
  };
  const s = statusConfig[deposit.status] || statusConfig.Pending;
  const methodCfg = METHOD_CONFIG[deposit.paymentMethod];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 14px', borderRadius: 12,
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.06)',
      marginBottom: 8, gap: 12,
      transition: 'background 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.045)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Method Logo / Icon */}
        <div style={{
          width: 36, height: 36, borderRadius: 10, overflow: 'hidden',
          background: methodCfg ? methodCfg.bg : 'rgba(100,116,139,0.12)',
          border: `1px solid ${methodCfg ? methodCfg.border : 'rgba(100,116,139,0.25)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {methodCfg?.logo ? (
            <img src={methodCfg.logo} alt={deposit.paymentMethod}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <RiBankLine size={18} color={methodCfg?.color || '#64748b'} />
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{deposit.paymentMethod}</span>
          <span style={{ fontSize: 11, color: '#4a5568' }}>
            {new Date(deposit.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {deposit.adminMessage && (
            <span style={{ fontSize: 11, color: '#f59e0b', marginTop: 2 }}>
              ↳ {deposit.adminMessage}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#22c55e' }}>
          +PKR {deposit.amount?.toLocaleString()}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
          color: s.color, background: s.bg, border: `1px solid ${s.border}`,
          display: 'flex', alignItems: 'center', gap: 4, letterSpacing: 0.5,
        }}>
          {s.icon} {deposit.status}
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
  const cfg = METHOD_CONFIG[paymentMethod];

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
        loadData();
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
      background: 'linear-gradient(160deg, #060c1a 0%, #080f20 50%, #06101e 100%)',
      minHeight: '100%',
      padding: '24px',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      opacity: mounted ? 1 : 0,
      transition: 'opacity 0.5s ease',
    }}>

      {/* ══ HEADER ══════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(37,99,235,0.25), rgba(99,102,241,0.25))',
            border: '1px solid rgba(99,102,241,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FiArrowUpCircle size={20} color="#818cf8" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0f6ff', letterSpacing: -0.5, marginBottom: 2 }}>
              Fund Your Account
            </h1>
            <p style={{ fontSize: 13, color: '#475569' }}>
              Choose a payment method, transfer funds, then upload your proof.
            </p>
          </div>
        </div>
      </div>

      {/* ══ QUICK STATS ═════════════════════════════════════════════ */}
      <div className="dep-stats-grid" style={{ gap: 12, marginBottom: 26 }}>
        {[
          {
            label: 'Minimum Deposit',
            value: `PKR ${minDeposit.toLocaleString()}`,
            icon: <FiArrowUpCircle size={18} />,
            color: '#22c55e',
            bg: 'rgba(34,197,94,0.10)',
            border: 'rgba(34,197,94,0.20)',
          },
          {
            label: 'Maximum Deposit',
            value: `PKR ${maxDeposit.toLocaleString()}`,
            icon: <FiTrendingUp size={18} />,
            color: '#60a5fa',
            bg: 'rgba(96,165,250,0.10)',
            border: 'rgba(96,165,250,0.20)',
          },
          {
            label: 'Wallet Balance',
            value: `PKR ${(user?.totalBalance || 0).toLocaleString()}`,
            icon: <BsWallet2 size={18} />,
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.10)',
            border: 'rgba(245,158,11,0.20)',
          },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${s.border}`,
            borderRadius: 14, padding: '16px 18px',
            display: 'flex', alignItems: 'center', gap: 14,
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11,
              background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: s.color, flexShrink: 0,
            }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#4a5568', marginBottom: 3, fontWeight: 500, letterSpacing: 0.4 }}>
                {s.label.toUpperCase()}
              </p>
              <p style={{ fontSize: 17, fontWeight: 800, color: s.color, letterSpacing: -0.3 }}>
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ══ MAIN LAYOUT ═════════════════════════════════════════════ */}
      <div className="dep-main-grid" style={{ gap: 20, alignItems: 'start' }}>

        {/* ── LEFT: Method + Details + Form ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Payment Method Selector */}
          <div style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, padding: 20,
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <FiLayers size={15} color="#818cf8" />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#c8d8f0', letterSpacing: 0.2 }}>
                Step 1 — Select Payment Method
              </h3>
            </div>
            <div className="dep-methods-grid" style={{ gap: 12 }}>
              {methods.map(m => {
                const mcfg = METHOD_CONFIG[m];
                const active = paymentMethod === m;
                return (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    style={{
                      background: active
                        ? `linear-gradient(145deg, ${mcfg.bg}, rgba(255,255,255,0.04))`
                        : 'rgba(255,255,255,0.02)',
                      border: `2px solid ${active ? mcfg.borderActive : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: 14,
                      padding: '16px 10px 14px',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                      transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                      transform: active ? 'translateY(-3px)' : 'none',
                      boxShadow: active ? `0 8px 28px ${mcfg.glow}` : 'none',
                      position: 'relative', overflow: 'hidden',
                    }}
                  >
                    {/* Active glow overlay */}
                    {active && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: `radial-gradient(ellipse at 50% 0%, ${mcfg.bg} 0%, transparent 70%)`,
                        pointerEvents: 'none',
                      }} />
                    )}

                    {/* Logo or Bank Icon */}
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      overflow: 'hidden',
                      border: `2px solid ${active ? mcfg.borderActive : 'rgba(255,255,255,0.08)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: active ? mcfg.bg : 'rgba(255,255,255,0.04)',
                      transition: 'all 0.25s',
                      boxShadow: active ? `0 0 16px ${mcfg.glow}` : 'none',
                    }}>
                      {mcfg.logo ? (
                        <img
                          src={mcfg.logo}
                          alt={mcfg.label}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <RiBankLine size={26} color={active ? mcfg.color : '#4a5568'} />
                      )}
                    </div>

                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: active ? mcfg.color : '#64748b',
                      transition: 'color 0.2s',
                    }}>
                      {mcfg.label}
                    </span>

                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: 0.6,
                      color: active ? mcfg.color : '#374151',
                      background: active ? mcfg.bg : 'transparent',
                      border: `1px solid ${active ? mcfg.border : 'transparent'}`,
                      borderRadius: 20, padding: '2px 8px',
                      textTransform: 'uppercase',
                    }}>
                      {mcfg.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Details Card */}
          {activeAccount && (
            <div style={{
              background: `linear-gradient(135deg, ${cfg.bg} 0%, rgba(255,255,255,0.02) 100%)`,
              border: `1px solid ${cfg.border}`,
              borderRadius: 16, padding: 20,
              animation: 'fadeSlide 0.3s ease',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Decorative corner glow */}
              <div style={{
                position: 'absolute', top: -30, right: -30,
                width: 120, height: 120, borderRadius: '50%',
                background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 70%)`,
                pointerEvents: 'none',
              }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Brand Logo in header */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, overflow: 'hidden',
                    border: `2px solid ${cfg.borderActive}`,
                    boxShadow: `0 0 16px ${cfg.glow}`,
                    flexShrink: 0,
                  }}>
                    {cfg.logo ? (
                      <img src={cfg.logo} alt={cfg.label}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        background: cfg.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <MdAccountBalance size={22} color={cfg.color} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: cfg.color, letterSpacing: -0.2 }}>
                      {cfg.label} Details
                    </h3>
                    <p style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                      Transfer funds to the account below
                    </p>
                  </div>
                </div>
                <div style={{
                  background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.35)',
                  borderRadius: 20, padding: '4px 12px',
                  fontSize: 10, fontWeight: 700, color: '#22c55e',
                  display: 'flex', alignItems: 'center', gap: 5,
                  letterSpacing: 0.4,
                }}>
                  <BsShieldCheck size={11} /> VERIFIED
                </div>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.28)', borderRadius: 12, padding: '2px 14px',
                border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <DetailRow
                  label="Account Title"
                  value={activeAccount.accountTitle}
                  copyable
                  icon={<BsWallet2 size={13} />}
                />
                <DetailRow
                  label={paymentMethod === 'Bank Transfer' ? 'Account Number' : 'Mobile Number'}
                  value={activeAccount.accountNumber}
                  copyable
                  icon={<FiHash size={13} />}
                />
                {paymentMethod === 'Bank Transfer' && (
                  <>
                    <DetailRow
                      label="Bank Name"
                      value={activeAccount.bankName}
                      icon={<RiBankLine size={13} />}
                    />
                    <DetailRow
                      label="Branch Code"
                      value={activeAccount.branchCode}
                      icon={<FiLayers size={13} />}
                    />
                    <DetailRow
                      label="IBAN"
                      value={activeAccount.iban}
                      copyable
                      icon={<FiFileText size={13} />}
                    />
                  </>
                )}
              </div>

              {activeAccount.instructions && (
                <div style={{
                  marginTop: 14,
                  background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.22)',
                  borderRadius: 11, padding: '11px 14px',
                  display: 'flex', alignItems: 'flex-start', gap: 9,
                }}>
                  <FiInfo size={14} color="#f59e0b" style={{ marginTop: 1, flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: '#fbbf24', lineHeight: 1.65, fontWeight: 500 }}>
                    {activeAccount.instructions}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Deposit Form */}
          <div style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, padding: 22,
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <FiSend size={15} color="#818cf8" />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#c8d8f0', letterSpacing: 0.2 }}>
                Step 2 — Upload Proof &amp; Submit
              </h3>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Screenshot Upload */}
              <div>
                <label style={{
                  fontSize: 12, color: '#7c8fa8', marginBottom: 8,
                  display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600,
                }}>
                  <FiCamera size={13} color="#818cf8" />
                  Payment Screenshot <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  style={{
                    border: `2px dashed ${dragOver ? '#6366f1' : preview ? '#22c55e' : 'rgba(255,255,255,0.10)'}`,
                    background: dragOver
                      ? 'rgba(99,102,241,0.07)'
                      : preview
                        ? 'rgba(34,197,94,0.05)'
                        : 'rgba(255,255,255,0.02)',
                    borderRadius: 14, padding: 22,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', minHeight: 160,
                    transition: 'all 0.25s', position: 'relative',
                  }}
                >
                  {preview ? (
                    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                      <img src={preview} alt="Preview"
                        style={{ maxHeight: 160, maxWidth: '100%', borderRadius: 10, objectFit: 'contain' }} />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setScreenshot(null); setPreview(null); }}
                        style={{
                          position: 'absolute', top: -10, right: -10,
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          border: 'none', borderRadius: '50%',
                          width: 26, height: 26,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#fff',
                          boxShadow: '0 4px 12px rgba(239,68,68,0.4)',
                        }}
                      >
                        <FiX size={13} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'rgba(99,102,241,0.12)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 12,
                      }}>
                        <FiUploadCloud size={26} color="#818cf8" />
                      </div>
                      <p style={{ fontSize: 14, color: '#7c8fa8', marginBottom: 5, fontWeight: 600 }}>
                        <span style={{ color: '#818cf8' }}>Click to upload</span> or drag &amp; drop
                      </p>
                      <p style={{ fontSize: 11, color: '#374151' }}>PNG, JPG, JPEG — Max 5MB</p>
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
                  <label style={{
                    fontSize: 12, color: '#7c8fa8', marginBottom: 7,
                    display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600,
                  }}>
                    <HiOutlineCurrencyRupee size={14} color="#818cf8" />
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
                        width: '100%',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 11, padding: '12px 50px 12px 14px',
                        fontSize: 14, color: '#e2e8f0', outline: 'none',
                        boxSizing: 'border-box', fontWeight: 600,
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = '#6366f1';
                        e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                    <span style={{
                      position: 'absolute', right: 12, top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: 11, color: '#4a5568', fontWeight: 700, letterSpacing: 0.5,
                    }}>PKR</span>
                  </div>
                </div>
                <div>
                  <label style={{
                    fontSize: 12, color: '#7c8fa8', marginBottom: 7,
                    display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600,
                  }}>
                    <FiHash size={13} color="#818cf8" />
                    Transaction ID <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value)}
                    placeholder="e.g. TXN-123456"
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 11, padding: '12px 14px',
                      fontSize: 13, color: '#e2e8f0', outline: 'none',
                      boxSizing: 'border-box', fontWeight: 500,
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = '#6366f1';
                      e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{
                  fontSize: 12, color: '#7c8fa8', marginBottom: 7,
                  display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600,
                }}>
                  <FiMessageSquare size={13} color="#818cf8" />
                  Additional Notes{' '}
                  <span style={{ color: '#374151', fontSize: 11, fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any extra information for admin..."
                  rows={2}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 11, padding: '11px 14px',
                    fontSize: 13, color: '#e2e8f0', outline: 'none',
                    resize: 'vertical', boxSizing: 'border-box',
                    fontFamily: 'inherit', fontWeight: 500,
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#6366f1';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Amount Preview */}
              {amount && parseFloat(amount) >= minDeposit && (
                <div style={{
                  background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.22)',
                  borderRadius: 11, padding: '12px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  animation: 'fadeSlide 0.3s ease',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <FiCheckCircle size={14} color="#22c55e" />
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>You are depositing</span>
                  </div>
                  <span style={{ fontSize: 17, fontWeight: 800, color: '#22c55e', letterSpacing: -0.3 }}>
                    PKR {parseFloat(amount).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: isSubmitting
                    ? 'rgba(99,102,241,0.4)'
                    : 'linear-gradient(135deg, #4f46e5, #6366f1)',
                  color: '#fff', border: 'none', padding: '15px',
                  borderRadius: 13, fontSize: 15, fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                  boxShadow: isSubmitting ? 'none' : '0 6px 24px rgba(99,102,241,0.4)',
                  transition: 'all 0.25s',
                  opacity: isSubmitting ? 0.7 : 1,
                  letterSpacing: 0.3,
                }}
                onMouseEnter={e => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 10px 32px rgba(99,102,241,0.5)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = isSubmitting ? 'none' : '0 6px 24px rgba(99,102,241,0.4)';
                }}
              >
                {isSubmitting ? (
                  <><FiRefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
                ) : (
                  <>Submit Deposit Request <FiArrowRight size={16} /></>
                )}
              </button>

              {/* Disclaimer */}
              <div style={{
                display: 'flex', gap: 9, alignItems: 'flex-start',
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)',
                borderRadius: 11, padding: '11px 14px',
              }}>
                <FiAlertTriangle size={14} color="#f59e0b" style={{ marginTop: 1, flexShrink: 0 }} />
                <p style={{ fontSize: 11.5, color: '#a07c30', lineHeight: 1.7 }}>
                  Send the <strong style={{ color: '#fbbf24' }}>exact amount</strong> from your own account only.
                  Third-party payments are not accepted. Deposits are processed within{' '}
                  <strong style={{ color: '#fbbf24' }}>2–24 hours</strong>.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* ── RIGHT: How It Works + History ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* How It Works */}
          <div style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, padding: 20,
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <FiActivity size={15} color="#818cf8" />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#c8d8f0', letterSpacing: 0.2 }}>
                How It Works
              </h3>
            </div>
            {[
              {
                step: '01',
                title: 'Pick a Method',
                desc: 'Choose JazzCash, Easypaisa, or Bank Transfer',
                icon: <FiMousePointer size={15} />,
                color: '#818cf8',
                bg: 'rgba(129,140,248,0.12)',
                border: 'rgba(129,140,248,0.30)',
              },
              {
                step: '02',
                title: 'Send Money',
                desc: 'Transfer funds to the account details shown',
                icon: <RiMoneyDollarCircleLine size={16} />,
                color: '#f59e0b',
                bg: 'rgba(245,158,11,0.12)',
                border: 'rgba(245,158,11,0.30)',
              },
              {
                step: '03',
                title: 'Upload Proof',
                desc: 'Take a screenshot and upload it here',
                icon: <FiImage size={15} />,
                color: '#a78bfa',
                bg: 'rgba(167,139,250,0.12)',
                border: 'rgba(167,139,250,0.30)',
              },
              {
                step: '04',
                title: 'Get Approved',
                desc: 'Admin verifies and credits your balance',
                icon: <BsShieldCheck size={15} />,
                color: '#22c55e',
                bg: 'rgba(34,197,94,0.12)',
                border: 'rgba(34,197,94,0.30)',
              },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', gap: 13, marginBottom: i < 3 ? 16 : 0,
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                  background: s.bg, border: `1px solid ${s.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: s.color,
                }}>
                  {s.icon}
                </div>
                <div style={{ paddingTop: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 800, color: s.color,
                      background: s.bg, border: `1px solid ${s.border}`,
                      borderRadius: 20, padding: '1px 7px', letterSpacing: 0.5,
                    }}>{s.step}</span>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#dde8f5' }}>{s.title}</p>
                  </div>
                  <p style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.55 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Supported Methods Banner */}
          <div style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, padding: 16,
          }}>
            <p style={{ fontSize: 11, color: '#4a5568', marginBottom: 12, fontWeight: 600, letterSpacing: 0.4 }}>
              SUPPORTED PAYMENT METHODS
            </p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* JazzCash */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.25)',
                borderRadius: 10, padding: '7px 12px',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7, overflow: 'hidden',
                  border: '1px solid rgba(255,107,0,0.4)',
                }}>
                  <img src="/jazzcash_logo.jpg" alt="JazzCash"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#FF6B00' }}>JazzCash</span>
              </div>
              {/* Easypaisa */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(0,176,80,0.08)', border: '1px solid rgba(0,176,80,0.25)',
                borderRadius: 10, padding: '7px 12px',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7, overflow: 'hidden',
                  border: '1px solid rgba(0,176,80,0.4)',
                }}>
                  <img src="/easypaisa_logo.jpg" alt="Easypaisa"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#00B050' }}>Easypaisa</span>
              </div>
              {/* Bank */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(108,142,245,0.08)', border: '1px solid rgba(108,142,245,0.25)',
                borderRadius: 10, padding: '7px 12px',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7, overflow: 'hidden',
                  background: 'rgba(108,142,245,0.15)', border: '1px solid rgba(108,142,245,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <RiBankLine size={16} color="#6C8EF5" />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#6C8EF5' }}>Bank Transfer</span>
              </div>
            </div>
          </div>

          {/* Deposit History */}
          <div style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, padding: 20,
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BsCardChecklist size={15} color="#818cf8" />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#c8d8f0', letterSpacing: 0.2 }}>
                  My Deposits
                </h3>
              </div>
              <button
                onClick={loadData}
                title="Refresh"
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8, padding: '5px 8px',
                  cursor: 'pointer', color: '#4a5568',
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 11, fontWeight: 600, transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(99,102,241,0.12)';
                  e.currentTarget.style.color = '#818cf8';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = '#4a5568';
                }}
              >
                <FiRefreshCw size={13} /> Refresh
              </button>
            </div>

            {loadingHistory ? (
              <div style={{
                textAlign: 'center', padding: '28px 0',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              }}>
                <FiRefreshCw size={22} color="#374151" style={{ animation: 'spin 1.2s linear infinite' }} />
                <p style={{ fontSize: 13, color: '#374151' }}>Loading history...</p>
              </div>
            ) : myDeposits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <FiArrowUpCircle size={22} color="#374151" />
                </div>
                <p style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>No deposits yet</p>
                <p style={{ fontSize: 11, color: '#2d3748', marginTop: 4 }}>Make your first deposit above!</p>
              </div>
            ) : (
              <div>
                {myDeposits.map(d => <HistoryRow key={d._id} deposit={d} />)}
              </div>
            )}

            {/* Processing note */}
            <div style={{
              marginTop: 12, display: 'flex', gap: 8, alignItems: 'center',
              padding: '10px 13px',
              background: 'rgba(99,102,241,0.07)',
              border: '1px solid rgba(99,102,241,0.18)', borderRadius: 11,
            }}>
              <FiClock size={13} color="#818cf8" />
              <p style={{ fontSize: 11, color: '#818cf8', fontWeight: 500 }}>
                Processing time: <strong>2 – 24 hours</strong>
              </p>
            </div>
          </div>

          {/* Security Badge */}
          <div style={{
            background: 'rgba(34,197,94,0.05)',
            border: '1px solid rgba(34,197,94,0.18)',
            borderRadius: 14, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <FiShield size={18} color="#22c55e" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#22c55e', marginBottom: 2 }}>
                100% Secure Deposits
              </p>
              <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.5 }}>
                All transactions are verified by our admin team before crediting.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }

        .dep-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        .dep-main-grid  { display: grid; grid-template-columns: 1fr 360px; }
        .dep-methods-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        .dep-form-grid  { display: grid; grid-template-columns: 1fr 1fr; }

        @media (max-width: 900px) {
          .dep-main-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .dep-stats-grid   { grid-template-columns: 1fr !important; }
          .dep-methods-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .dep-methods-grid { grid-template-columns: 1fr !important; }
          .dep-form-grid    { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Deposit;

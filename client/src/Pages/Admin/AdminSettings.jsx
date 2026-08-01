import React, { useState, useEffect } from "react";
import {
  Save, Globe, Shield, Plus, Trash2, Edit2, Check,
  X, ChevronDown, CreditCard, Landmark, Smartphone
} from "lucide-react";
import { settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';

/* ─── Payment method options ────────────────────────────────────── */
const PAYMENT_METHODS = ['JazzCash', 'Easypaisa', 'Bank Transfer'];

const METHOD_ICONS = {
  JazzCash: { icon: <Smartphone size={16} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  Easypaisa: { icon: <Smartphone size={16} />, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  'Bank Transfer': { icon: <Landmark size={16} />, color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
};

/* ─── Empty account template ─────────────────────────────────────── */
const emptyAccount = () => ({
  method: 'JazzCash',
  accountTitle: '',
  accountNumber: '',
  bankName: '',
  branchCode: '',
  iban: '',
  isActive: true,
  instructions: '',
  _tempId: Date.now(),
});

/* ─── Single Account Card ────────────────────────────────────────── */
function AccountCard({ account, index, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const isBank = account.method === 'Bank Transfer';
  const cfg = METHOD_ICONS[account.method] || METHOD_ICONS.JazzCash;

  const update = (field, val) => onUpdate(index, { ...account, [field]: val });

  return (
    <div style={{
      background: '#080d1a', border: `1px solid ${account.isActive ? '#1e2d4a' : 'rgba(239,68,68,0.2)'}`,
      borderRadius: 12, overflow: 'hidden', transition: 'all 0.2s',
      opacity: account.isActive ? 1 : 0.65,
    }}>
      {/* Card Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', cursor: 'pointer',
      }} onClick={() => setExpanded(!expanded)}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: cfg.color, flexShrink: 0,
        }}>
          {cfg.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{account.method}</span>
            {!account.isActive && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
                color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              }}>Inactive</span>
            )}
          </div>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>
            {account.accountTitle || 'Account Title'} · {account.accountNumber || 'Account Number'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Toggle active */}
          <button
            onClick={e => { e.stopPropagation(); update('isActive', !account.isActive); }}
            title={account.isActive ? 'Deactivate' : 'Activate'}
            style={{
              background: account.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${account.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: 20, padding: '3px 10px',
              color: account.isActive ? '#22c55e' : '#ef4444',
              fontSize: 10, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {account.isActive ? 'Active' : 'Inactive'}
          </button>
          {/* Remove */}
          <button
            onClick={e => { e.stopPropagation(); onRemove(index); }}
            style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8, padding: '5px 7px', cursor: 'pointer', color: '#ef4444',
              display: 'flex', alignItems: 'center',
            }}
          >
            <Trash2 size={13} />
          </button>
          {/* Expand */}
          <div style={{ color: '#64748b', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Expanded Fields */}
      {expanded && (
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid #1e2d4a' }}>
          <div style={{ paddingTop: 12 }} />

          {/* Method select */}
          <div>
            <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 5 }}>Payment Method</label>
            <select
              value={account.method}
              onChange={e => update('method', e.target.value)}
              style={{
                width: '100%', background: '#0d1530', border: '1px solid #1e2d4a',
                borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13,
                outline: 'none',
              }}
            >
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Grid fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FieldInput label="Account Title *" value={account.accountTitle} onChange={v => update('accountTitle', v)} placeholder="e.g. Muhammad Ali" />
            <FieldInput
              label={isBank ? 'Account Number *' : 'Mobile Number *'}
              value={account.accountNumber}
              onChange={v => update('accountNumber', v)}
              placeholder={isBank ? 'e.g. 01234567890123' : 'e.g. 0300-1234567'}
            />
          </div>

          {isBank && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <FieldInput label="Bank Name" value={account.bankName} onChange={v => update('bankName', v)} placeholder="e.g. Meezan Bank" />
              <FieldInput label="Branch Code" value={account.branchCode} onChange={v => update('branchCode', v)} placeholder="e.g. 0213" />
              <div style={{ gridColumn: '1/-1' }}>
                <FieldInput label="IBAN" value={account.iban} onChange={v => update('iban', v)} placeholder="e.g. PK36MEZN0001234567890123" mono />
              </div>
            </div>
          )}

          {/* Instructions */}
          <div>
            <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 5 }}>Instructions for User</label>
            <textarea
              value={account.instructions}
              onChange={e => update('instructions', e.target.value)}
              placeholder="e.g. Send money to this number and upload screenshot..."
              rows={2}
              style={{
                width: '100%', background: '#0d1530', border: '1px solid #1e2d4a',
                borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13,
                outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              onFocus={e => (e.target.style.borderColor = '#3b82f6')}
              onBlur={e => (e.target.style.borderColor = '#1e2d4a')}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FieldInput({ label, value, onChange, placeholder, mono = false }) {
  return (
    <div>
      <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 5 }}>{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', background: '#0d1530', border: '1px solid #1e2d4a',
          borderRadius: 8, padding: '9px 12px', color: '#fff',
          fontSize: mono ? 12 : 13,
          fontFamily: mono ? 'monospace' : 'inherit',
          outline: 'none', boxSizing: 'border-box',
        }}
        onFocus={e => (e.target.style.borderColor = '#3b82f6')}
        onBlur={e => (e.target.style.borderColor = '#1e2d4a')}
      />
    </div>
  );
}

/* ═══ MAIN COMPONENT ════════════════════════════════════════════════ */
export default function AdminSettings() {
  const [settings, setSettings] = useState({
    websiteLogo: '',
    heroBanner: '',
    contactEmail: '',
    contactPhone: '',
    whatsappNumber: '',
    minimumDeposit: 300,
    minimumWithdrawal: 300,
     maximumWithdrawal: 500000,
     withdrawalFeePercentage: 3,
    maintenanceMode: false,
    referralCommissionRates: { level1: 10, level2: 5, level3: 2 },
    paymentAccounts: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('payment');

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await settingsAPI.get();
      if (data.success) {
        const s = data.data;
        setSettings({
          websiteLogo: s.websiteLogo || '',
          heroBanner: s.heroBanner || '',
          contactEmail: s.contactEmail || '',
          contactPhone: s.contactPhone || '',
          whatsappNumber: s.whatsappNumber || '',
          minimumDeposit: s.minimumDeposit || 300,
          minimumWithdrawal: s.minimumWithdrawal || 300,
           maximumWithdrawal: s.maximumWithdrawal || 500000,
           withdrawalFeePercentage: s.withdrawalFeePercentage ?? 3,
          maintenanceMode: s.maintenanceMode || false,
          referralCommissionRates: s.referralCommissionRates || { level1: 10, level2: 5, level3: 2 },
          paymentAccounts: s.paymentAccounts || [],
        });
      }
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate payment accounts
    for (const acc of settings.paymentAccounts) {
      if (!acc.accountTitle?.trim()) { toast.error('All accounts need an Account Title'); return; }
      if (!acc.accountNumber?.trim()) { toast.error('All accounts need an Account Number'); return; }
    }

    setSaving(true);
    try {
      const { data } = await settingsAPI.update(settings);
      if (data.success) {
        toast.success('✅ Settings saved successfully');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  /* Payment accounts helpers */
  const addAccount = () => {
    setSettings(s => ({ ...s, paymentAccounts: [...s.paymentAccounts, emptyAccount()] }));
  };

  const updateAccount = (index, updated) => {
    setSettings(s => {
      const accounts = [...s.paymentAccounts];
      accounts[index] = updated;
      return { ...s, paymentAccounts: accounts };
    });
  };

  const removeAccount = (index) => {
    setSettings(s => ({
      ...s,
      paymentAccounts: s.paymentAccounts.filter((_, i) => i !== index),
    }));
  };

  const set = (field, value) => setSettings(s => ({ ...s, [field]: value }));

  if (loading) {
    return (
      <div style={{ background: '#080d1a', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748b', fontSize: 14 }}>Loading settings...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'payment', label: '💳 Payment Accounts' },
    { id: 'general', label: '🌐 General' },
    { id: 'limits', label: '⚙️ Limits & Rates' },
  ];

  return (
    <div style={{
      background: '#080d1a', minHeight: '100%', padding: '20px 24px',
      fontFamily: "'Inter','Segoe UI',sans-serif", color: '#fff',
      opacity: mounted ? 1 : 0, transition: 'opacity 0.4s ease',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>Settings</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>Manage platform configuration and payment accounts</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: saving ? '#1e40af' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#fff', border: 'none', padding: '10px 20px',
            borderRadius: 10, fontSize: 13, fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 15px rgba(37,99,235,0.4)',
            opacity: saving ? 0.75 : 1, transition: 'all 0.2s',
          }}
        >
          <Save size={15} /> {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '8px 18px', borderRadius: 10,
              border: activeTab === t.id ? '1px solid rgba(59,130,246,0.5)' : '1px solid #1e2d4a',
              background: activeTab === t.id ? 'rgba(59,130,246,0.15)' : '#0d1530',
              color: activeTab === t.id ? '#60a5fa' : '#64748b',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PAYMENT ACCOUNTS TAB ── */}
      {activeTab === 'payment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Info banner */}
          <div style={{
            background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)',
            borderRadius: 12, padding: '14px 18px',
            display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <CreditCard size={18} color="#60a5fa" style={{ marginTop: 1, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#60a5fa', marginBottom: 4 }}>
                Payment Account Configuration
              </p>
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
                Configure the payment accounts that users will see when making deposits.
                Add your JazzCash, Easypaisa, and Bank Transfer details here.
                Users will see these exact details on the deposit page.
              </p>
            </div>
          </div>

          {/* Account Cards */}
          {settings.paymentAccounts.length === 0 ? (
            <div style={{
              background: '#0d1530', border: '2px dashed #1e2d4a', borderRadius: 14,
              padding: 40, textAlign: 'center',
            }}>
              <CreditCard size={36} color="#1e2d4a" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: 14, color: '#4a5568', marginBottom: 16 }}>No payment accounts configured</p>
              <button
                onClick={addAccount}
                style={{
                  background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: 10, padding: '10px 20px',
                  color: '#60a5fa', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                <Plus size={15} /> Add First Account
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {settings.paymentAccounts.map((acc, i) => (
                <AccountCard
                  key={acc._id || acc._tempId || i}
                  account={acc}
                  index={i}
                  onUpdate={updateAccount}
                  onRemove={removeAccount}
                />
              ))}
            </div>
          )}

          {/* Add Account Button */}
          {settings.paymentAccounts.length > 0 && (
            <button
              onClick={addAccount}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'rgba(59,130,246,0.08)', border: '2px dashed rgba(59,130,246,0.25)',
                borderRadius: 12, padding: '14px',
                color: '#60a5fa', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.08)'}
            >
              <Plus size={16} /> Add Payment Account
            </button>
          )}

          {/* Preview Panel */}
          {settings.paymentAccounts.filter(a => a.isActive).length > 0 && (
            <div style={{
              background: '#0d1530', border: '1px solid #1e2d4a', borderRadius: 14, padding: 20,
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>
                👁️ User Preview — Active Payment Methods
              </h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {settings.paymentAccounts.filter(a => a.isActive).map((acc, i) => {
                  const cfg = METHOD_ICONS[acc.method] || METHOD_ICONS.JazzCash;
                  return (
                    <div key={i} style={{
                      background: '#080d1a', border: `1px solid ${cfg.color}30`,
                      borderRadius: 10, padding: '12px 16px', minWidth: 180,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', background: cfg.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color,
                        }}>
                          {cfg.icon}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{acc.method}</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 600 }}>{acc.accountTitle}</p>
                      <p style={{ fontSize: 12, color: '#60a5fa', fontFamily: 'monospace' }}>{acc.accountNumber}</p>
                      {acc.bankName && <p style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{acc.bankName}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── GENERAL TAB ── */}
      {activeTab === 'general' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#0d1530', border: '1px solid #1e2d4a', borderRadius: 14, padding: 20, gridColumn: '1/-1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Globe size={18} color="#60a5fa" />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Contact Information</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              {[
                { label: 'Contact Email', field: 'contactEmail', placeholder: 'support@example.com', type: 'email' },
                { label: 'Contact Phone', field: 'contactPhone', placeholder: '+92 300 0000000' },
                { label: 'WhatsApp Number', field: 'whatsappNumber', placeholder: '+92 300 0000000' },
              ].map(f => (
                <div key={f.field}>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    value={settings[f.field] || ''}
                    onChange={e => set(f.field, e.target.value)}
                    placeholder={f.placeholder}
                    style={{
                      width: '100%', background: '#050810', border: '1px solid #1e2d4a',
                      borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13,
                      outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                    onBlur={e => (e.target.style.borderColor = '#1e2d4a')}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Maintenance Mode */}
          <div style={{ background: '#0d1530', border: '1px solid #1e2d4a', borderRadius: 14, padding: 20, gridColumn: '1/-1' }}>
            <label style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer',
            }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Maintenance Mode</p>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                  When enabled, only admins can access the platform
                </p>
              </div>
              <div
                onClick={() => set('maintenanceMode', !settings.maintenanceMode)}
                style={{
                  width: 48, height: 26, borderRadius: 13,
                  background: settings.maintenanceMode ? '#ef4444' : '#1e2d4a',
                  position: 'relative', cursor: 'pointer', transition: 'background 0.3s',
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3,
                  left: settings.maintenanceMode ? 24 : 4,
                  transition: 'left 0.3s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }} />
              </div>
            </label>
          </div>
        </div>
      )}

      {/* ── LIMITS & RATES TAB ── */}
      {activeTab === 'limits' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#0d1530', border: '1px solid #1e2d4a', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Shield size={18} color="#22c55e" />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Transaction Limits</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {[
                { label: 'Min Deposit (PKR)', field: 'minimumDeposit' },
                { label: 'Min Withdrawal (PKR)', field: 'minimumWithdrawal' },
                { label: 'Max Withdrawal (PKR)', field: 'maximumWithdrawal' },
                { label: 'Withdrawal Fee (%)', field: 'withdrawalFeePercentage' },
              ].map(f => (
                <div key={f.field}>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input
                    type="number"
                    value={settings[f.field] || 0}
                    onChange={e => set(f.field, parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%', background: '#050810', border: '1px solid #1e2d4a',
                      borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14,
                      fontWeight: 600, outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#22c55e')}
                    onBlur={e => (e.target.style.borderColor = '#1e2d4a')}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Referral rates */}
          <div style={{ background: '#0d1530', border: '1px solid #1e2d4a', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <span style={{ fontSize: 18 }}>🤝</span>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Referral Commission Rates</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {[
                { label: 'Level 1 (%)', field: 'level1', color: '#22c55e' },
                { label: 'Level 2 (%)', field: 'level2', color: '#60a5fa' },
                { label: 'Level 3 (%)', field: 'level3', color: '#a78bfa' },
              ].map(f => (
                <div key={f.field}>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      min={0} max={100}
                      value={settings.referralCommissionRates?.[f.field] || 0}
                      onChange={e => setSettings(s => ({
                        ...s,
                        referralCommissionRates: { ...s.referralCommissionRates, [f.field]: parseFloat(e.target.value) || 0 },
                      }))}
                      style={{
                        width: '100%', background: '#050810', border: `1px solid ${f.color}30`,
                        borderRadius: 8, padding: '10px 36px 10px 12px', color: f.color,
                        fontSize: 16, fontWeight: 700, outline: 'none', boxSizing: 'border-box',
                      }}
                      onFocus={e => (e.target.style.borderColor = f.color)}
                      onBlur={e => (e.target.style.borderColor = `${f.color}30`)}
                    />
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: f.color, fontWeight: 700, fontSize: 14 }}>%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

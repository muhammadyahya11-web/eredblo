import React, { useState, useEffect } from "react";
import { Save, Globe, DollarSign, Shield, X } from "lucide-react";
import { settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Toggle = ({ value, onChange }) => (
  <button type="button" onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-all duration-300 ${value ? "bg-gradient-to-r from-red-600 to-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]" : "bg-slate-700"}`}>
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-md ${value ? "translate-x-5" : ""}`} />
  </button>
);

export default function SuperAdminSettings() {
  const [settings, setSettings] = useState({
    websiteLogo: '',
    heroBanner: '',
    contactEmail: '',
    contactPhone: '',
    whatsappNumber: '',
    minimumDeposit: 300,
     maximumWithdrawal: 500000,
     withdrawalFeePercentage: 3,
    maintenanceMode: false,
    referralCommissionRates: { level1: 10, level2: 5, level3: 2 },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
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
             maximumWithdrawal: s.maximumWithdrawal || 500000,
             withdrawalFeePercentage: s.withdrawalFeePercentage ?? 3,
            maintenanceMode: s.maintenanceMode || false,
            referralCommissionRates: s.referralCommissionRates || { level1: 10, level2: 5, level3: 2 },
          });
        }
      } catch (error) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await settingsAPI.update({
        ...settings,
        referralCommissionRates: {
          level1: parseFloat(settings.referralCommissionRates?.level1) || 10,
          level2: parseFloat(settings.referralCommissionRates?.level2) || 5,
          level3: parseFloat(settings.referralCommissionRates?.level3) || 2,
        },
      });
      if (data.success) {
        toast.success('Settings saved successfully');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-[#0a0f1e] min-h-full">
        <div className="flex items-center justify-center py-20 text-slate-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-[#0a0f1e] min-h-full">
             <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Super admin panel configuration</p>
              </div>
             <div>
               <label className="block text-xs text-slate-400 mb-1.5 font-medium">Withdrawal Fee (%)</label>
               <input type="number" min="0" max="100" step="0.01" value={settings.withdrawalFeePercentage} onChange={(e) => setSettings({ ...settings, withdrawalFeePercentage: parseFloat(e.target.value) || 0 })} className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors" />
             </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Globe size={18} className="text-blue-400" />
            <h2 className="font-semibold text-white text-base">General</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Contact Email</label>
              <input value={settings.contactEmail} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Contact Phone</label>
              <input value={settings.contactPhone} onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })} className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">WhatsApp Number</label>
              <input value={settings.whatsappNumber} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
            </div>
          </div>
        </div>

        <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <DollarSign size={18} className="text-green-400" />
            <h2 className="font-semibold text-white text-base">Financial</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Minimum Deposit (PKR)</label>
              <input type="number" value={settings.minimumDeposit} onChange={(e) => setSettings({ ...settings, minimumDeposit: parseFloat(e.target.value) })} className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Minimum Withdrawal (PKR)</label>
              <input type="number" value={settings.minimumWithdrawal} onChange={(e) => setSettings({ ...settings, minimumWithdrawal: parseFloat(e.target.value) })} className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Maximum Withdrawal (PKR)</label>
              <input type="number" value={settings.maximumWithdrawal} onChange={(e) => setSettings({ ...settings, maximumWithdrawal: parseFloat(e.target.value) })} className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
            </div>
          </div>
        </div>

        <div className="bg-[#0d1530] border border-blue-500/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Shield size={18} className="text-purple-400" />
            <h2 className="font-semibold text-white text-base">Referral Commission Rates (%)</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Level 1</label>
              <input type="number" value={settings.referralCommissionRates?.level1 || 10} onChange={(e) => setSettings({ ...settings, referralCommissionRates: { ...settings.referralCommissionRates, level1: parseFloat(e.target.value) } })} className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Level 2</label>
              <input type="number" value={settings.referralCommissionRates?.level2 || 5} onChange={(e) => setSettings({ ...settings, referralCommissionRates: { ...settings.referralCommissionRates, level2: parseFloat(e.target.value) } })} className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Level 3</label>
              <input type="number" value={settings.referralCommissionRates?.level3 || 2} onChange={(e) => setSettings({ ...settings, referralCommissionRates: { ...settings.referralCommissionRates, level3: parseFloat(e.target.value) } })} className="w-full bg-[#050810] border border-blue-500/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]" />
            </div>
          </div>
        </div>

        <div className="bg-[#0d1530] border border-red-500/10 rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <Shield size={18} className="text-red-400" />
            <h2 className="font-semibold text-white text-base">System Controls</h2>
          </div>
          <div className="flex items-center justify-between p-4 bg-[#050810] border border-red-500/10 rounded-xl hover:border-red-500/30 transition-all duration-300">
            <div>
              <p className="text-sm font-medium text-white">Maintenance Mode</p>
              <p className="text-xs text-slate-400">When enabled, only admins and super-admins can log in</p>
            </div>
            <Toggle value={settings.maintenanceMode} onChange={(v) => setSettings({ ...settings, maintenanceMode: v })} />
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white text-sm font-medium rounded-xl px-6 py-3 transition-all duration-300 shadow-[0_4px_20px_rgba(220,38,38,0.3)] hover:shadow-[0_4px_30px_rgba(220,38,38,0.4)] disabled:opacity-50">
        <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}

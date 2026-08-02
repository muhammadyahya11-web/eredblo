import React, { useState, useEffect } from 'react';
import {
  FiMail, FiPhone, FiMessageCircle, FiGlobe,
  FiInstagram, FiTwitter, FiYoutube, FiTool,
  FiDollarSign, FiDownload, FiUpload,
  FiUsers, FiShield, FiInfo,
} from 'react-icons/fi';
import { settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const InfoRow = ({ icon: Icon, iconColor, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-[#050810] rounded-lg border border-blue-500/10">
    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${iconColor || 'bg-blue-500/10 text-blue-400'}`}>
      <Icon size={16} />
    </div>
    <div>
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="text-white text-sm font-semibold">{value}</p>
    </div>
  </div>
);

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await settingsAPI.getPublic();
        if (data.success) setSettings(data.data);
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          Loading settings...
        </div>
      </div>
    );
  }

  const rates = settings?.referralCommissionRates;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">

      {/* Maintenance Mode Banner */}
      {settings?.maintenanceMode && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
          <FiTool className="text-amber-500 shrink-0" size={20} />
          <div>
            <p className="text-amber-400 font-semibold text-sm">Maintenance Mode Active</p>
            <p className="text-slate-400 text-xs">The platform is currently under maintenance. Some features may be temporarily unavailable.</p>
          </div>
        </div>
      )}

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Platform Info */}
        <div className="bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <FiInfo className="text-blue-400" size={16} />
            <h3 className="text-white font-semibold text-sm">Platform Information</h3>
          </div>

          {settings?.websiteLogo && (
            <div className="flex items-center gap-3 p-3 bg-[#050810] rounded-lg border border-blue-500/10">
              <img src={settings.websiteLogo} alt="Logo" className="w-10 h-10 object-contain rounded bg-[#060a14] p-1" />
              <div>
                <p className="text-[11px] text-slate-400">Website Logo</p>
                <a href={settings.websiteLogo} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:text-blue-300 break-all">View</a>
              </div>
            </div>
          )}

          <InfoRow icon={FiMail} iconColor="bg-blue-500/10 text-blue-400" label="Contact Email" value={settings?.contactEmail || 'N/A'} />
          <InfoRow icon={FiPhone} iconColor="bg-green-500/10 text-green-400" label="Contact Phone" value={settings?.contactPhone || 'N/A'} />
          <InfoRow icon={FiMessageCircle} iconColor="bg-green-500/10 text-green-400" label="WhatsApp Number" value={settings?.whatsappNumber || 'N/A'} />
        </div>

        {/* Deposit & Withdrawal Limits */}
        <div className="bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <FiDollarSign className="text-blue-400" size={16} />
            <h3 className="text-white font-semibold text-sm">Limits</h3>
          </div>

          <InfoRow icon={FiDownload} iconColor="bg-blue-500/10 text-blue-400" label="Minimum Deposit" value={`PKR ${settings?.minimumDeposit?.toLocaleString() || '300'}`} />
          <InfoRow icon={FiUpload} iconColor="bg-green-500/10 text-green-400" label="Minimum Withdrawal" value={`PKR ${settings?.minimumWithdrawal?.toLocaleString() || '300'}`} />
          <InfoRow icon={FiUpload} iconColor="bg-amber-500/10 text-amber-400" label="Maximum Withdrawal" value={`PKR ${settings?.maximumWithdrawal?.toLocaleString() || '500,000'}`} />
        </div>

        {/* Referral Commission Rates */}
        <div className="bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <FiUsers className="text-purple-400" size={16} />
            <h3 className="text-white font-semibold text-sm">Referral Commission Rates</h3>
          </div>
          <p className="text-[11px] text-slate-500">Earn commission when your referred members make their first plan investment.</p>

          <div className="space-y-3">
            {[
              { level: 'Level 1', rate: rates?.level1 ?? 10, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', desc: 'Direct referral' },
              { level: 'Level 2', rate: rates?.level2 ?? 5, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', desc: "Referral's referral" },
              { level: 'Level 3', rate: rates?.level3 ?? 2, color: 'bg-pink-500/10 text-pink-400 border-pink-500/20', desc: 'Third level' },
            ].map(({ level, rate, color, desc }) => (
              <div key={level} className="flex items-center justify-between p-3 bg-[#050810] rounded-lg border border-[#1c2a4a]">
                <div>
                  <p className="text-white text-sm font-medium">{level}</p>
                  <p className="text-[11px] text-slate-500">{desc}</p>
                </div>
                <span className={`text-sm font-bold px-3 py-1 rounded-full border ${color}`}>{rate}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <FiShield className="text-green-400" size={16} />
            <h3 className="text-white font-semibold text-sm">Platform Security</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'SSL Encrypted', desc: 'All data is transmitted over secure SSL connections', color: 'text-green-400 bg-green-500/10' },
              { label: 'Fund Protection', desc: 'Your funds are secured and insured against unauthorized access', color: 'text-blue-400 bg-blue-500/10' },
              { label: '24/7 Monitoring', desc: 'Our systems are monitored around the clock for safety', color: 'text-purple-400 bg-purple-500/10' },
            ].map(({ label, desc, color }) => (
              <div key={label} className="p-4 bg-[#050810] rounded-lg border border-[#1c2a4a]">
                <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${color} mb-2`}>
                  <FiShield size={11} /> {label}
                </div>
                <p className="text-[11px] text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        {settings?.socialLinks && Object.values(settings.socialLinks).some(Boolean) && (
          <div className="bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-6 lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <FiGlobe className="text-blue-400" size={16} />
              <h3 className="text-white font-semibold text-sm">Follow Us</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {settings.socialLinks.facebook && (
                <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-[#050810] rounded-lg border border-[#1c2a4a] hover:border-blue-500/30 transition-all group">
                  <FiFacebook className="text-blue-600 group-hover:scale-110 transition-transform" size={18} />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Facebook</span>
                </a>
              )}
              {settings.socialLinks.twitter && (
                <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-[#050810] rounded-lg border border-[#1c2a4a] hover:border-blue-500/30 transition-all group">
                  <FiTwitter className="text-blue-400 group-hover:scale-110 transition-transform" size={18} />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Twitter</span>
                </a>
              )}
              {settings.socialLinks.instagram && (
                <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-[#050810] rounded-lg border border-[#1c2a4a] hover:border-pink-500/30 transition-all group">
                  <FiInstagram className="text-pink-500 group-hover:scale-110 transition-transform" size={18} />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Instagram</span>
                </a>
              )}
              {settings.socialLinks.youtube && (
                <a href={settings.socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-[#050810] rounded-lg border border-[#1c2a4a] hover:border-red-500/30 transition-all group">
                  <FiYoutube className="text-red-500 group-hover:scale-110 transition-transform" size={18} />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">YouTube</span>
                </a>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const FiFacebook = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default Settings;

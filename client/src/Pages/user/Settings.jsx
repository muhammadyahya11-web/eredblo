import React, { useState, useEffect, useContext } from 'react';
import { FiMail, FiPhone, FiMessageCircle, FiGlobe, FiInstagram, FiTwitter, FiYoutube, FiTool, FiDollarSign, FiDownload, FiUpload } from 'react-icons/fi';
import { settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await settingsAPI.getPublic();
        if (data.success) {
          setSettings(data.data);
        }
      } catch (error) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="settings-page">
        <div className="loading-state">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <h2 className="page-title">Platform Settings</h2>
      <p className="page-subtitle text-slate-400 text-sm mb-6">Public platform information and configuration</p>

      {settings?.maintenanceMode && (
        <div className="section-card mb-6 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-3">
            <FiTool className="text-amber-500" size={20} />
            <div>
              <h3 className="text-amber-500 font-semibold">Maintenance Mode Active</h3>
              <p className="text-slate-400 text-sm">The platform is currently under maintenance. Some features may be unavailable.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="section-card">
          <h3 className="section-title">Platform Information</h3>
          <div className="space-y-4">
            {settings?.websiteLogo && (
              <div className="flex items-center gap-4">
                <img src={settings.websiteLogo} alt="Logo" className="w-16 h-16 object-contain rounded-lg bg-[#050810] border border-blue-500/10 p-2" />
                <div>
                  <p className="text-xs text-slate-400 mb-1">Website Logo</p>
                  <a href={settings.websiteLogo} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm hover:text-blue-300 break-all">{settings.websiteLogo}</a>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                <FiMail size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Contact Email</p>
                <p className="text-white text-sm font-medium">{settings?.contactEmail || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                <FiPhone size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Contact Phone</p>
                <p className="text-white text-sm font-medium">{settings?.contactPhone || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                <FiMessageCircle size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">WhatsApp Number</p>
                <p className="text-white text-sm font-medium">{settings?.whatsappNumber || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title">Limits & Rates</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#050810] rounded-lg border border-blue-500/10">
              <div className="flex items-center gap-3">
                <FiDownload className="text-blue-400" size={18} />
                <div>
                  <p className="text-xs text-slate-400">Minimum Deposit</p>
                  <p className="text-white font-semibold">PKR {settings?.minimumDeposit?.toLocaleString() || '300'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#050810] rounded-lg border border-blue-500/10">
              <div className="flex items-center gap-3">
                <FiUpload className="text-green-400" size={18} />
                <div>
                  <p className="text-xs text-slate-400">Minimum Withdrawal</p>
                  <p className="text-white font-semibold">PKR {settings?.minimumWithdrawal?.toLocaleString() || '300'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#050810] rounded-lg border border-blue-500/10">
              <div className="flex items-center gap-3">
                <FiUpload className="text-amber-400" size={18} />
                <div>
                  <p className="text-xs text-slate-400">Maximum Withdrawal</p>
                  <p className="text-white font-semibold">PKR {settings?.maximumWithdrawal?.toLocaleString() || '500,000'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {settings?.socialLinks && (
          <div className="section-card lg:col-span-2">
            <h3 className="section-title">Social Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {settings.socialLinks.facebook && (
                <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-[#050810] rounded-lg border border-blue-500/10 hover:border-blue-500/30 transition-all">
                  <FiFacebook className="text-blue-600" size={20} />
                  <span className="text-sm text-slate-300">Facebook</span>
                </a>
              )}
              {settings.socialLinks.twitter && (
                <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-[#050810] rounded-lg border border-blue-500/10 hover:border-blue-500/30 transition-all">
                  <FiTwitter className="text-blue-400" size={20} />
                  <span className="text-sm text-slate-300">Twitter</span>
                </a>
              )}
              {settings.socialLinks.instagram && (
                <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-[#050810] rounded-lg border border-blue-500/10 hover:border-blue-500/30 transition-all">
                  <FiInstagram className="text-pink-500" size={20} />
                  <span className="text-sm text-slate-300">Instagram</span>
                </a>
              )}
              {settings.socialLinks.youtube && (
                <a href={settings.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-[#050810] rounded-lg border border-blue-500/10 hover:border-blue-500/30 transition-all">
                  <FiYoutube className="text-red-500" size={20} />
                  <span className="text-sm text-slate-300">YouTube</span>
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

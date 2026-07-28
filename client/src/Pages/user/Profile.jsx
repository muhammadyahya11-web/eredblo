import React, { useState, useContext } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { FiCamera } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import { userAPI, authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    cnic: user?.cnic || '',
    email: user?.email || '',
    address: user?.address || 'Lahore, Pakistan', // dummy default if empty
    dob: user?.dob || '15 March 1995', // dummy default if empty
  });
  
  const [pwData, setPwData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showPwForm, setShowPwForm] = useState(false);

  const userName = user?.name || 'Mr Ali';
  const avatarUrl = user?.profilePicture && !user.profilePicture.includes('default')
    ? user.profilePicture
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0f2c6e&color=60a5fa&bold=true&size=150`;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePwChange = (e) => setPwData({ ...pwData, [e.target.name]: e.target.value });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { data } = await userAPI.updateProfile({
        name: formData.name,
        phone: formData.phone,
        cnic: formData.cnic,
      }); // backend might not support address/dob yet, but UI shows it
      if (data.success) {
        const updatedUser = { ...user, ...data.data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile updated successfully');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwData.newPassword !== pwData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      setIsLoading(true);
      const { data } = await authAPI.changePassword({ oldPassword: pwData.oldPassword, newPassword: pwData.newPassword, confirmPassword: pwData.confirmPassword });
      if (data.success) {
        toast.success('Password changed successfully');
        setPwData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setShowPwForm(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Avatar Card */}
        <div className="lg:col-span-4">
          <div className="bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-8 flex flex-col items-center text-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none"></div>

            <div className="relative mb-4 mt-2">
              <div className="w-[120px] h-[120px] rounded-full border-4 border-[#090f1e] overflow-hidden shadow-xl shadow-blue-900/20 relative z-10 bg-[#090f1e]">
                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
              </div>
              <button className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center z-20 shadow-lg border-2 border-[#0d152a] transition-colors">
                <FiCamera size={14} />
              </button>
            </div>

            <h3 className="text-white text-xl font-bold mb-1">{userName}</h3>
            
            <p className="text-slate-400 text-xs mb-4">
              Member Since<br/>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'May 9, 2024'}
            </p>

            <div className="flex items-center justify-center gap-2 bg-blue-500/10 text-blue-400 text-xs font-semibold px-4 py-2 rounded-full border border-blue-500/20">
              <FaCheckCircle /> Verified Member
            </div>

          </div>
        </div>

        {/* Right Column - Profile Form */}
        <div className="lg:col-span-8">
          <div className="bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-6 md:p-8">
            
            {showPwForm ? (
              <form onSubmit={handleChangePassword} className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-[#1c2a4a] pb-4 mb-2">
                  <h3 className="text-white font-semibold">Change Password</h3>
                  <button type="button" onClick={() => setShowPwForm(false)} className="text-xs text-blue-400 hover:text-blue-300">
                    Back to Profile
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400">Current Password</label>
                    <input type="password" name="oldPassword" value={pwData.oldPassword} onChange={handlePwChange} placeholder="••••••••" required className="bg-[#090f1e] border border-[#1c2a4a] rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 outline-none" />
                  </div>
                  <div className="flex flex-col gap-2 hidden md:flex opacity-0 pointer-events-none"><label>Spacer</label><input /></div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400">New Password</label>
                    <input type="password" name="newPassword" value={pwData.newPassword} onChange={handlePwChange} placeholder="••••••••" required className="bg-[#090f1e] border border-[#1c2a4a] rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 outline-none" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400">Confirm Password</label>
                    <input type="password" name="confirmPassword" value={pwData.confirmPassword} onChange={handlePwChange} placeholder="••••••••" required className="bg-[#090f1e] border border-[#1c2a4a] rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 outline-none" />
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg mt-4 transition-colors disabled:opacity-70">
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="bg-[#090f1e] border border-[#1c2a4a] rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400">Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="bg-[#090f1e] border border-[#1c2a4a] rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400">Mobile Number</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="bg-[#090f1e] border border-[#1c2a4a] rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400">Date of Birth</label>
                    <input type="text" name="dob" value={formData.dob} onChange={handleChange} className="bg-[#090f1e] border border-[#1c2a4a] rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400">Email Address</label>
                    <input type="email" name="email" value={formData.email} disabled className="bg-[#090f1e] border border-[#1c2a4a] rounded-lg px-4 py-3 text-sm text-slate-500 opacity-70 cursor-not-allowed outline-none" />
                  </div>

                  <div className="flex flex-col gap-2 relative">
                    <label className="text-xs text-slate-400">Password</label>
                    <input type="password" value="********" disabled className="bg-[#090f1e] border border-[#1c2a4a] rounded-lg px-4 py-3 text-sm text-white opacity-70 cursor-not-allowed outline-none" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-400">CNIC Number</label>
                    <input type="text" name="cnic" value={formData.cnic} onChange={handleChange} className="bg-[#090f1e] border border-[#1c2a4a] rounded-lg px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors" />
                  </div>

                  <div className="flex flex-col gap-2 justify-end pb-2">
                    <button type="button" onClick={() => setShowPwForm(true)} className="text-blue-400 hover:text-blue-300 text-sm font-medium self-start">
                      Change Password
                    </button>
                  </div>

                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 rounded-lg mt-6 transition-colors disabled:opacity-70 shadow-lg shadow-blue-600/20">
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </button>

              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;

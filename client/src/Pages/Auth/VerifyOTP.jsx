import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setToken, setUser, setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email not found. Please register again.');
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setToken(data.token);
        setUser(data);
        setIsAuthenticated(true);
        toast.success(data.message || 'Email verified successfully! Welcome!');
        
        const role = data.role;
        if (role === 'super-admin') navigate('/super-admin');
        else if (role === 'admin') navigate('/admin');
        else navigate('/dashboard');
      } else {
        toast.error(data.message || 'Verification failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#050810] text-white">
      {/* Left Side - Branding/Visual */}
      <div className="hidden lg:flex w-1/2 bg-[#060a14] border-r border-[#1c2333] flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#060a14]/0 to-transparent pointer-events-none"></div>
        <div className="z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
             <div className="logo-icon w-12 h-12 text-2xl flex items-center justify-center bg-blue-600 rounded-full font-bold">e</div>
             <h1 className="text-3xl font-bold text-white tracking-wider">ERED BLOO</h1>
          </div>
          <h2 className="text-4xl font-semibold mb-6">Verify Your Email</h2>
          <p className="text-slate-400 max-w-md mx-auto text-lg leading-relaxed">
            We have sent a 6-digit one time password to your email address.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold mb-2">Enter OTP</h2>
            <p className="text-slate-400">Please enter the code sent to <span className="text-blue-500">{email || 'your email'}</span></p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="otp">6-Digit Code</label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                maxLength="6"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-[#0B1320] border border-[#1c2333] rounded-lg p-4 text-center text-2xl tracking-widest text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex justify-center items-center ${(isLoading || otp.length !== 6) ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-8">
            <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;

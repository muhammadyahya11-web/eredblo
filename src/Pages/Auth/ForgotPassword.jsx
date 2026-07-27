import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await api.post('/auth/forgot-password', { email });
      setIsSent(true);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
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
          <h2 className="text-4xl font-semibold mb-6">Reset Password</h2>
          <p className="text-slate-400 max-w-md mx-auto text-lg leading-relaxed">
            Don't worry, it happens to the best of us. Let's get you back into your account.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold mb-2">Forgot Password</h2>
            <p className="text-slate-400">Enter your email and we'll send you a reset link</p>
          </div>

          {!isSent ? (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0B1320] border border-[#1c2333] rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex justify-center items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="mt-8 bg-[#0B1320] border border-[#1c2333] rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Check your email</h3>
              <p className="text-slate-400 text-sm mb-6">
                We have sent a password reset link to <br /><span className="text-white font-medium">{email}</span>
              </p>
              <button 
                onClick={() => setIsSent(false)} 
                className="text-blue-500 hover:text-blue-400 text-sm font-medium"
              >
                Try another email
              </button>
            </div>
          )}

          <p className="text-center text-slate-400 mt-8">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

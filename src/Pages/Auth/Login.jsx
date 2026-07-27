import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './auth.css';

/* ---- SVG Icons ---- */
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const Login = () => {
  const [activeTab, setActiveTab] = useState('password');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);

  const { login, loginWithOTP, sendLoginOTP, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    const result = await login(identifier, password);
    if (result.success) {
      const role = result.data?.role;
      if (role === 'super-admin') navigate('/super-admin');
      else if (role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      setIsOtpSending(true);
      const result = await sendLoginOTP(otpEmail);
      if (result.success) {
        setOtpSent(true);
        toast.success('OTP sent to your email!');
      } else {
        toast.error(result.message || 'Failed to send OTP');
      }
    } finally {
      setIsOtpSending(false);
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    const result = await loginWithOTP(otpEmail, otpCode);
    if (result.success) {
      const role = result.data?.role;
      if (role === 'super-admin') navigate('/super-admin');
      else if (role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    }
  };

  return (
    <div className="auth-page">
      {/* Brand Logo */}
      <div className="auth-brand">
        <div className="auth-brand-icon">e</div>
        <span className="auth-brand-name">ERED BLOO</span>
      </div>

      <div className="auth-card">
        <h1 className="auth-card-title">Welcome Back</h1>
        <p className="auth-card-subtitle">Login to access your account</p>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Login with Password
          </button>
          <button
            className={`auth-tab ${activeTab === 'otp' ? 'active' : ''}`}
            onClick={() => setActiveTab('otp')}
          >
            Login with OTP
          </button>
        </div>

        {/* Password Login Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordLogin}>
            <div className="auth-field">
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><MailIcon /></span>
                <input
                  id="login-email"
                  type="email"
                  className="auth-input"
                  placeholder="Enter your email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><LockIcon /></span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <div className="auth-forgot">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="auth-btn-loading">
                  <span className="auth-spinner" /> Logging in...
                </span>
              ) : 'Login Now'}
            </button>
          </form>
        )}

        {/* OTP Login Tab */}
        {activeTab === 'otp' && (
          <>
            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <p className="auth-otp-note">Enter your registered email to receive a one-time password.</p>
                <div className="auth-field">
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><MailIcon /></span>
                    <input
                      id="otp-email"
                      type="email"
                      className="auth-input"
                      placeholder="Enter your email"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="auth-btn" disabled={isOtpSending}>
                  {isOtpSending ? (
                    <span className="auth-btn-loading"><span className="auth-spinner" /> Sending OTP...</span>
                  ) : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpLogin}>
                <p className="auth-otp-note">Enter the 6-digit OTP sent to <strong style={{ color: '#3b82f6' }}>{otpEmail}</strong></p>
                <div className="auth-field">
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><LockIcon /></span>
                    <input
                      id="otp-code"
                      type="text"
                      className="auth-input"
                      placeholder="Enter 6-digit OTP"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="auth-btn" disabled={isLoading || otpCode.length !== 6}>
                  {isLoading ? (
                    <span className="auth-btn-loading"><span className="auth-spinner" /> Verifying...</span>
                  ) : 'Login Now'}
                </button>
                <div style={{ textAlign: 'center' }}>
                  <button type="button" className="auth-link-btn" onClick={() => { setOtpSent(false); setOtpCode(''); }}>
                    Resend OTP
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        <p className="auth-switch">
          Don't have an account?<Link to="/register"> Register Now</Link>
        </p>

        {/* Security Badges */}
        <div>
          <p className="auth-security-note">Your security is our priority</p>
          <div className="auth-security-badges">
            <span className="auth-security-badge">
              <ShieldIcon /> SSL Secured
            </span>
            <span className="auth-security-badge">
              <CheckIcon /> Data Protected
            </span>
            <span className="auth-security-badge">
              <CheckIcon /> 100% Safe
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

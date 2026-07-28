import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12" y2="18" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

/* Phone 3D Graphic SVG */
const Phone3DGraphic = () => (
  <svg width="90" height="130" viewBox="0 0 90 130" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Glow base */}
    <ellipse cx="45" cy="120" rx="35" ry="8" fill="rgba(37,99,235,0.25)" />
    {/* Phone body */}
    <rect x="15" y="8" width="60" height="104" rx="10" fill="url(#phoneGrad)" stroke="rgba(59,130,246,0.6)" strokeWidth="1.5" />
    {/* Screen */}
    <rect x="20" y="18" width="50" height="80" rx="5" fill="rgba(5,13,26,0.9)" />
    {/* Logo on screen */}
    <circle cx="45" cy="45" r="16" fill="url(#logoGrad)" />
    <text x="45" y="51" textAnchor="middle" fill="white" fontSize="18" fontWeight="900" fontStyle="italic" fontFamily="Inter, sans-serif">e</text>
    {/* User icon on screen */}
    <circle cx="45" cy="78" r="10" fill="rgba(37,99,235,0.3)" stroke="rgba(59,130,246,0.5)" strokeWidth="1" />
    <circle cx="45" cy="74" r="4" fill="rgba(96,165,250,0.8)" />
    <path d="M35 85 Q45 80 55 85" stroke="rgba(96,165,250,0.8)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Home button */}
    <rect x="38" y="104" width="14" height="4" rx="2" fill="rgba(59,130,246,0.4)" />
    {/* Shield overlay */}
    <path d="M68 60 L68 72 C68 76 72 78 72 78 C72 78 76 76 76 72 L76 60 L72 58 Z" fill="url(#shieldGrad)" stroke="rgba(59,130,246,0.6)" strokeWidth="0.5" />
    <polyline points="70,69 72,71 74,66" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Glowing ring */}
    <circle cx="45" cy="120" r="28" stroke="rgba(37,99,235,0.3)" strokeWidth="1" fill="none" />
    <circle cx="45" cy="120" r="20" stroke="rgba(37,99,235,0.5)" strokeWidth="1" fill="none" />
    {/* Sparkles */}
    <circle cx="10" cy="30" r="2" fill="rgba(59,130,246,0.7)" />
    <circle cx="80" cy="20" r="1.5" fill="rgba(59,130,246,0.5)" />
    <circle cx="5" cy="80" r="1.5" fill="rgba(96,165,250,0.4)" />
    <circle cx="85" cy="90" r="1" fill="rgba(96,165,250,0.4)" />
    <defs>
      <linearGradient id="phoneGrad" x1="15" y1="8" x2="75" y2="112" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0d2040" />
        <stop offset="100%" stopColor="#050d1a" />
      </linearGradient>
      <linearGradient id="logoGrad" x1="29" y1="29" x2="61" y2="61" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1d4ed8" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
      <linearGradient id="shieldGrad" x1="68" y1="58" x2="76" y2="78" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1d4ed8" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>
  </svg>
);

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    referralCode: '',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();

  const { register, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setFormData(prev => ({ ...prev, referralCode: ref }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      toast.error('Please agree to the Terms & Conditions');
      return;
    }

    const { confirmPassword: _confirm, agreeTerms: _agree, ...registerData } = formData;
    const result = await register({
      name: registerData.name,
      email: registerData.email,
      phone: registerData.phone,
      password: registerData.password,
      referralCode: registerData.referralCode || '',
    });

    if (result.success) {
      navigate('/verify-otp', { state: { email: formData.email } });
    }
  };

  return (
    <div className="auth-page">
      {/* Brand Logo */}
      <div className="auth-brand">
        <div className="auth-brand-icon">e</div>
        <span className="auth-brand-name">ERED BLOO</span>
      </div>

      <div className="auth-card" style={{ maxWidth: 460 }}>
        {/* Header with phone graphic */}
        <div className="auth-register-header">
          <div className="auth-register-header-text">
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Create Account</h2>
            <p style={{ fontSize: 13, color: '#64748b' }}>Join ERED BLOO and start earning today</p>
          </div>
          <div className="auth-phone-graphic">
            <Phone3DGraphic />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="auth-field">
            <div className="auth-input-wrapper">
              <span className="auth-input-icon"><UserIcon /></span>
              <input
                id="reg-name"
                name="name"
                type="text"
                className="auth-input"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="auth-field">
            <div className="auth-input-wrapper">
              <span className="auth-input-icon"><PhoneIcon /></span>
              <input
                id="reg-phone"
                name="phone"
                type="tel"
                className="auth-input"
                placeholder="Mobile Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="auth-field">
            <div className="auth-input-wrapper">
              <span className="auth-input-icon"><MailIcon /></span>
              <input
                id="reg-email"
                name="email"
                type="email"
                className="auth-input"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <div className="auth-input-wrapper">
              <span className="auth-input-icon"><LockIcon /></span>
              <input
                id="reg-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
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
          </div>

          {/* Referral Code (optional) */}
          <div className="auth-field">
            <div className="auth-input-wrapper">
              <span className="auth-input-icon"><UserIcon /></span>
              <input
                id="reg-referral"
                name="referralCode"
                type="text"
                className="auth-input"
                placeholder="Referral Code (optional)"
                value={formData.referralCode}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="auth-checkbox-row">
            <input
              id="reg-terms"
              name="agreeTerms"
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={handleChange}
            />
            <label htmlFor="reg-terms">
              I agree to the <Link to="/terms">Terms & Conditions</Link>
            </label>
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? (
              <span className="auth-btn-loading">
                <span className="auth-spinner" /> Creating Account...
              </span>
            ) : 'Register Now'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?<Link to="/login"> Login Now</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  const handleLinkClick = (e, path, sectionId) => {
    if (sectionId) {
      if (window.location.pathname === '/') {
        e.preventDefault();
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(path);
      }
    } else {
      navigate(path);
    }
  };

  return (
    <footer className="pt-16 pb-8 border-t border-[#1e293b]/40 bg-[#030712] relative z-20">
      {/* Glow highlight */}
      <div className="absolute left-[10%] bottom-0 w-[500px] h-[200px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1300px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Intro */}
          <div className="lg:col-span-2 pr-6">
            <Link to="/" className="flex items-center gap-3 mb-5 group">
              <div className="w-7 h-7 flex items-center justify-center transition-transform group-hover:scale-105">
                <svg className="w-7 h-7 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="46" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="3" />
                  <path d="M50 25C36.2 25 25 36.2 25 50C25 63.8 36.2 75 50 75C61.4 75 71.1 67.3 74.1 57H40V43H74.9C75 45.3 75 47.6 75 50C75 63.8 63.8 75 50 75C36.2 75 25 63.8 25 50C25 36.2 36.2 25 50 25Z" fill="white" />
                </svg>
              </div>
              <span className="font-bold text-[18px] text-white tracking-wide">ered <span className="text-blue-500">bloo</span></span>
            </Link>
            <p className="text-slate-400 text-[13px] leading-[1.6] mb-6 max-w-sm">
              Ered Bloo is a trusted ROI platform committed to your financial growth with security and transparency.
            </p>
            <div className="flex gap-3">
              {['f', 't', 'in', 'yt'].map((social) => (
                <a 
                  key={social} 
                  href="#" 
                  className="w-8 h-8 rounded-full bg-[#080d1a] border border-[#1e293b]/60 flex items-center justify-center text-slate-400 text-xs hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-200"
                >
                  {social === 'f' && 'f'}
                  {social === 't' && 't'}
                  {social === 'in' && 'in'}
                  {social === 'yt' && 'yt'}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-[13px] text-white uppercase tracking-wider mb-5">Quick Links</h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: 'Home', path: '/', section: 'home' },
                { label: 'About Us', path: '/about' },
                { label: 'Investment Plans', path: '/#investmentplans', section: 'investmentplans' },
                { label: 'How It Works', path: '/#howitworks', section: 'howitworks' },
                { label: 'Contact Us', path: '/contact' }
              ].map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.path}
                    onClick={(e) => handleLinkClick(e, link.path, link.section)}
                    className="text-slate-400 text-[13px] hover:text-blue-500 transition-colors cursor-pointer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Account */}
          <div>
            <h4 className="font-semibold text-[13px] text-white uppercase tracking-wider mb-5">Account</h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: 'Login', path: '/login' },
                { label: 'Sign Up', path: '/register' },
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'Deposit', path: '/dashboard/deposit' },
                { label: 'Withdraw', path: '/dashboard/withdraw' }
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.path}
                    className="text-slate-400 text-[13px] hover:text-blue-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Support & Contact */}
          <div>
            <h4 className="font-semibold text-[13px] text-white uppercase tracking-wider mb-5">Support</h4>
            <ul className="flex flex-col gap-3 mb-6">
              {['FAQs', 'Terms & Conditions', 'Privacy Policy', 'Support Center'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 text-[13px] hover:text-blue-500 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
            <h4 className="font-semibold text-[13px] text-white uppercase tracking-wider mb-4">Contact Us</h4>
            <ul className="flex flex-col gap-2.5">
              <li className="text-slate-400 text-[12px] flex items-center gap-2">
                <span className="text-blue-500">📧</span> support@eredbloo.com
              </li>
              <li className="text-slate-400 text-[12px] flex items-center gap-2">
                <span className="text-blue-500">💬</span> +92 300 1234567
              </li>
              <li className="text-slate-400 text-[12px] flex items-center gap-2">
                <span className="text-blue-500">📍</span> Pakistan
              </li>
            </ul>
          </div>

        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-[#1e293b]/40 pt-6 text-center">
          <p className="text-slate-500 text-xs">© 2024 Ered Bloo. All Rights Reserved.</p>
        </div>

      </div>
    </footer>
  );
}

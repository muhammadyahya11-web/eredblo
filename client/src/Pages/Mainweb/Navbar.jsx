import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { label: 'Home', target: '#home', path: '/' },
    { label: 'About Us', target: '#aboutus', path: '/about' },
    { label: 'Investment Plans', target: '#investmentplans', path: '/#investmentplans' },
    { label: 'How It Works', target: '#howitworks', path: '/#howitworks' },
    { label: 'Features', target: '#features', path: '/#features' },
    { label: 'FAQs', target: '#faqs', path: '/#faqs' },
    { label: 'Contact Us', target: '', path: '/contact' }
  ];

  const handleNavClick = (e, item) => {
    if (item.label === 'Contact Us') {
      navigate('/contact');
      setMenuOpen(false);
      return;
    }
    if (item.label === 'About Us') {
      navigate('/about');
      setMenuOpen(false);
      return;
    }

    // For other sections like How it works, Investment plans, FAQs, Home
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(item.target.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(item.path);
    }
    setMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#030712]/90 backdrop-blur-md border-b border-[#1c2a4a]/40 py-4' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-[1300px] mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 flex items-center justify-center transition-transform group-hover:scale-105">
            <svg className="w-8 h-8 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="46" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="3" />
              <path d="M50 25C36.2 25 25 36.2 25 50C25 63.8 36.2 75 50 75C61.4 75 71.1 67.3 74.1 57H40V43H74.9C75 45.3 75 47.6 75 50C75 63.8 63.8 75 50 75C36.2 75 25 63.8 25 50C25 36.2 36.2 25 50 25Z" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-white select-none">
            ered <span className="text-blue-500">bloo</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => {
            const isPageActive = 
              (item.path === '/' && location.pathname === '/') ||
              (item.path === '/about' && location.pathname === '/about') ||
              (item.path === '/contact' && location.pathname === '/contact');
            
            return (
              <a
                key={item.label}
                href={item.path.startsWith('/#') ? item.path : (item.target || item.path)}
                onClick={(e) => handleNavClick(e, item)}
                className={`text-[13px] font-medium transition-colors duration-200 relative py-1 ${
                  isPageActive ? 'text-blue-500' : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
                {isPageActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 rounded-full" />
                )}
              </a>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <Link 
            to="/login" 
            className="px-5 py-2 text-[13px] font-medium text-slate-300 border border-slate-800 rounded-lg hover:text-white hover:bg-slate-900/50 hover:border-slate-700 transition-all"
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="px-5 py-2 text-[13px] font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          >
            Sign Up
          </Link>
        </div>

        {/* Hamburger Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden text-slate-300 hover:text-white focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#030712]/95 border-b border-[#1c2a4a]/50 backdrop-blur-lg px-6 py-6 flex flex-col gap-4 animate-fade-in shadow-xl">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.path}
              onClick={(e) => handleNavClick(e, item)}
              className="text-slate-300 hover:text-white text-[15px] font-medium py-1.5 transition-colors"
            >
              {item.label}
            </a>
          ))}
          <div className="h-[1px] bg-slate-800/80 my-2" />
          <div className="flex gap-4">
            <Link 
              to="/login" 
              onClick={() => setMenuOpen(false)}
              className="flex-1 text-center py-2.5 text-[14px] font-medium text-slate-300 border border-slate-800 rounded-lg"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              onClick={() => setMenuOpen(false)}
              className="flex-1 text-center py-2.5 text-[14px] font-medium bg-blue-600 text-white rounded-lg"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

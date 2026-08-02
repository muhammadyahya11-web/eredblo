import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import ThreeHeroAnimation from './ThreeHeroAnimation';
import coinImg from '../../assets/dashbordcoin.png';
import { AuthContext } from '../../context/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } }
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } }
};

export default function Home() {
  const { user } = useContext(AuthContext);
  const investTarget = user ? "/dashboard/my-investments" : "/register";

  useEffect(() => {
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.replace('#', ''));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      <Navbar />

      {/* ══════════════════════════════════════════ HERO ══════════════════════════════════════════ */}
      <section id="home" className="relative min-h-[92vh] md:min-h-[92vh] flex items-center pt-[80px] md:pt-0 overflow-hidden">
        {/* Deep blue glow on right */}
        <div className="absolute right-0 top-0 w-[70%] md:w-[55%] h-full pointer-events-none z-0"
          style={{ background: 'radial-gradient(ellipse at 70% 40%, rgba(29,78,216,0.18) 0%, transparent 70%)' }} />
        {/* Subtle glow left */}
        <div className="absolute left-0 bottom-0 w-[50%] md:w-[40%] h-[60%] pointer-events-none z-0"
          style={{ background: 'radial-gradient(ellipse at 20% 80%, rgba(37,99,235,0.06) 0%, transparent 70%)' }} />

        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-5 md:px-6 flex flex-col-reverse lg:flex-row items-center justify-between gap-8 md:gap-10">

          {/* ── LEFT COPY ── */}
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="flex-1 flex flex-col items-start max-w-[560px] w-full"
          >
            {/* Eyebrow pill */}
            <motion.div variants={fadeUp}
              className="flex items-center gap-2 mb-4 md:mb-5"
            >
              <span className="text-[10px] md:text-[11px] font-semibold tracking-[0.15em] md:tracking-[0.18em] uppercase text-blue-400">
                Smart Investments, Secure Future
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1 variants={fadeUp}
              className="text-[28px] md:text-[58px] lg:text-[64px] font-extrabold leading-[1.08] md:leading-[1.05] mb-4 md:mb-5 tracking-tight text-balance"
            >
              <span className="text-white">Grow Your Money,</span><br />
              <span style={{ color: '#3b82f6' }}>Secure Your Future</span>
            </motion.h1>

            {/* Sub text */}
            <motion.p variants={fadeUp}
              className="text-[13px] md:text-[15px] leading-[1.6] md:leading-[1.7] mb-6 md:mb-7 max-w-[480px]"
              style={{ color: '#94a3b8' }}
            >
              Ered Bloo is your trusted ROI platform where your investments grow daily with transparency and security.
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 flex-wrap">
              <Link to="/register"
                className="flex items-center gap-2 text-[13px] md:text-[14px] font-semibold px-6 md:px-7 py-3 md:py-3.5 rounded-lg text-white transition-all"
                style={{ background: '#2563eb', boxShadow: '0 0 20px rgba(37,99,235,0.45)' }}
              >
                Get Started
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <a href="#howitworks"
                className="flex items-center gap-2 text-[13px] md:text-[14px] font-semibold px-6 md:px-7 py-3 md:py-3.5 rounded-lg text-white border transition-all hover:bg-white/5"
                style={{ borderColor: '#334155' }}
              >
                <span className="w-5 h-5 rounded-full border border-blue-500 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </span>
                How It Works
              </a>
            </motion.div>

            {/* Feature tags */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 md:gap-6 text-[12px] md:text-[13px] font-medium" style={{ color: '#94a3b8' }}>
              {/* Tag 1 */}
              <div className="flex items-center gap-2">
                <div className="w-[24px] md:w-[28px] h-[24px] md:h-[28px] rounded-full border flex items-center justify-center shrink-0"
                  style={{ borderColor: 'rgba(59,130,246,0.35)', background: 'rgba(37,99,235,0.1)' }}>
                  <svg className="w-3 md:w-3.5 h-3 md:h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                </div>
                <span className="hidden xs:inline">High ROI Plans</span>
                <span className="xs:hidden">High ROI</span>
              </div>
              {/* Tag 2 */}
              <div className="flex items-center gap-2">
                <div className="w-[24px] md:w-[28px] h-[24px] md:h-[28px] rounded-full border flex items-center justify-center shrink-0"
                  style={{ borderColor: 'rgba(59,130,246,0.35)', background: 'rgba(37,99,235,0.1)' }}>
                  <svg className="w-3 md:w-3.5 h-3 md:h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <span className="hidden xs:inline">Secure &amp; Trusted</span>
                <span className="xs:hidden">Secure</span>
              </div>
              {/* Tag 3 */}
              <div className="flex items-center gap-2">
                <div className="w-[24px] md:w-[28px] h-[24px] md:h-[28px] rounded-full border flex items-center justify-center shrink-0"
                  style={{ borderColor: 'rgba(59,130,246,0.35)', background: 'rgba(37,99,235,0.1)' }}>
                  <svg className="w-3 md:w-3.5 h-3 md:h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                </div>
                <span className="hidden xs:inline">Instant Withdrawals</span>
                <span className="xs:hidden">Withdrawals</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── RIGHT 3D HERO ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="flex-1 flex justify-center items-center min-h-[360px] md:min-h-[480px] w-full lg:max-w-[48%]"
          >
            <div className="w-full max-w-[320px] md:max-w-[500px] lg:max-w-[560px]">
              <ThreeHeroAnimation />
            </div>
          </motion.div>

        </div>
      </section>

      {/* ══════════════════════════════════════════ STATS BAR ══════════════════════════════════════════ */}
      <section className="relative z-10 border-t border-b" style={{ borderColor: 'rgba(30,41,59,0.6)', background: 'rgba(8,13,26,0.8)' }}>
        <div className="max-w-[1280px] mx-auto px-5 md:px-6">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 divide-x"
            style={{ divideColor: 'rgba(30,41,59,0.5)' }}
          >
            {[
              { icon: (
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              ), value: '15,786+', label: 'Total Investors' },
              { icon: (
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              ), value: 'PKR 250M+', label: 'Total Deposited' },
              { icon: (
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
              ), value: 'PKR 180M+', label: 'Total Withdrawn' },
              { icon: (
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6l4 2"/>
                </svg>
              ), value: '99.8%', label: 'Uptime & Trust' }
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeUp}
                className="flex items-center gap-3 md:gap-4 px-5 md:px-8 py-5 md:py-6"
              >
                <div className="w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center shrink-0 text-blue-400"
                  style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-[18px] md:text-[22px] font-extrabold text-white leading-tight">{stat.value}</div>
                  <div className="text-[11px] md:text-[12px] font-medium mt-0.5" style={{ color: '#64748b' }}>{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════ INVESTMENT PLANS ══════════════════════════════════════════ */}
      <section id="investmentplans" className="py-12 md:py-16 border-t" style={{ borderColor: 'rgba(30,41,59,0.4)' }}>
        <div className="max-w-[1280px] mx-auto px-5 md:px-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4">
            <div>
              <h2 className="text-[24px] md:text-[30px] font-extrabold tracking-tight mb-1.5">
                Our <span style={{ color: '#3b82f6' }}>Investment Plans</span>
              </h2>
              <p className="text-[12.5px] md:text-[13.5px]" style={{ color: '#64748b' }}>
                Choose a plan that suits you and start earning daily returns.
              </p>
            </div>
            <Link to={investTarget}
              className="text-[13px] font-semibold px-5 py-2.5 rounded-lg border transition-all hover:bg-white/5 text-white inline-flex items-center justify-center md:inline-flex"
              style={{ borderColor: '#334155' }}
            >
              View All Plans
            </Link>
          </div>

          {/* Plans grid */}
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >

            {/* ── Starter Plan ── */}
            <motion.div variants={fadeUp}
              className="rounded-xl p-5 flex flex-col border"
              style={{ background: '#060d1e', borderColor: '#1e293b' }}
            >
              <div className="text-center pb-5 border-b mb-5" style={{ borderColor: '#1e293b' }}>
                <h3 className="font-bold text-white text-[15px] mb-3">Starter Plan</h3>
                <p className="text-[11px] mb-1" style={{ color: '#64748b' }}>Minimum</p>
                <p className="text-[22px] font-extrabold" style={{ color: '#3b82f6' }}>PKR 5,000</p>
              </div>
              <div className="flex flex-col gap-2.5 text-[13px] mb-5">
                <div className="flex justify-between">
                  <span style={{ color: '#64748b' }}>Daily Profit</span>
                  <span className="font-bold text-white">2.5%</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#64748b' }}>Duration</span>
                  <span className="font-bold text-white">60 Days</span>
                </div>
              </div>
              <Link to={investTarget}
                className="w-full py-2.5 text-center text-[13px] font-bold rounded-lg text-white mt-auto transition-colors"
                style={{ background: '#2563eb' }}
              >
                Invest Now
              </Link>
            </motion.div>

            {/* ── Basic Plan ── */}
            <motion.div variants={fadeUp}
              className="rounded-xl p-5 flex flex-col border"
              style={{ background: '#060d1e', borderColor: '#1e293b' }}
            >
              <div className="text-center pb-5 border-b mb-5" style={{ borderColor: '#1e293b' }}>
                <h3 className="font-bold text-white text-[15px] mb-3">Basic Plan</h3>
                <p className="text-[11px] mb-1" style={{ color: '#64748b' }}>Minimum</p>
                <p className="text-[22px] font-extrabold" style={{ color: '#3b82f6' }}>PKR 25,000</p>
              </div>
              <div className="flex flex-col gap-2.5 text-[13px] mb-5">
                <div className="flex justify-between">
                  <span style={{ color: '#64748b' }}>Daily Profit</span>
                  <span className="font-bold text-white">3%</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#64748b' }}>Duration</span>
                  <span className="font-bold text-white">70 Days</span>
                </div>
              </div>
              <Link to={investTarget}
                className="w-full py-2.5 text-center text-[13px] font-bold rounded-lg text-white mt-auto transition-colors"
                style={{ background: '#2563eb' }}
              >
                Invest Now
              </Link>
            </motion.div>

            {/* ── Pro Plan (Popular) ── */}
            <motion.div variants={fadeUp}
              className="rounded-xl p-5 flex flex-col relative"
              style={{ background: '#060d1e', border: '2px solid #3b82f6', boxShadow: '0 0 28px rgba(59,130,246,0.2)' }}
            >
              <span className="absolute -top-3 right-4 text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider text-white"
                style={{ background: '#3b82f6' }}>
                Popular
              </span>
              <div className="text-center pb-5 border-b mb-5 mt-1" style={{ borderColor: 'rgba(59,130,246,0.3)' }}>
                <h3 className="font-bold text-white text-[15px] mb-3">Pro Plan</h3>
                <p className="text-[11px] mb-1" style={{ color: '#64748b' }}>Minimum</p>
                <p className="text-[22px] font-extrabold" style={{ color: '#3b82f6' }}>PKR 100,000</p>
              </div>
              <div className="flex flex-col gap-2.5 text-[13px] mb-5">
                <div className="flex justify-between">
                  <span style={{ color: '#64748b' }}>Daily Profit</span>
                  <span className="font-bold text-white">3.5%</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#64748b' }}>Duration</span>
                  <span className="font-bold text-white">90 Days</span>
                </div>
              </div>
              <Link to={investTarget}
                className="w-full py-2.5 text-center text-[13px] font-bold rounded-lg text-white mt-auto transition-colors"
                style={{ background: '#2563eb' }}
              >
                Invest Now
              </Link>
            </motion.div>

            {/* ── Enterprise Plan ── */}
            <motion.div variants={fadeUp}
              className="rounded-xl p-5 flex flex-col border"
              style={{ background: '#060d1e', borderColor: '#1e293b' }}
            >
              <div className="text-center pb-5 border-b mb-5" style={{ borderColor: '#1e293b' }}>
                <h3 className="font-bold text-white text-[15px] mb-3">Enterprise Plan</h3>
                <p className="text-[11px] mb-1" style={{ color: '#64748b' }}>Minimum</p>
                <p className="text-[22px] font-extrabold" style={{ color: '#3b82f6' }}>PKR 500,000</p>
              </div>
              <div className="flex flex-col gap-2.5 text-[13px] mb-5">
                <div className="flex justify-between">
                  <span style={{ color: '#64748b' }}>Daily Profit</span>
                  <span className="font-bold text-white">4%</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#64748b' }}>Duration</span>
                  <span className="font-bold text-white">120 Days</span>
                </div>
              </div>
              <Link to={investTarget}
                className="w-full py-2.5 text-center text-[13px] font-bold rounded-lg text-white mt-auto transition-colors"
                style={{ background: '#2563eb' }}
              >
                Invest Now
              </Link>
            </motion.div>

            {/* ── VIP Plan ── */}
            <motion.div variants={fadeUp}
              className="rounded-xl p-5 flex flex-col relative"
              style={{ background: '#060d1e', border: '2px solid rgba(234,179,8,0.55)', boxShadow: '0 0 22px rgba(234,179,8,0.09)' }}
            >
              <span className="absolute -top-3 right-4 text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider text-black"
                style={{ background: '#eab308' }}>
                Best Value
              </span>
              <div className="text-center pb-5 border-b mb-5 mt-1" style={{ borderColor: 'rgba(234,179,8,0.25)' }}>
                <h3 className="font-bold text-[15px] mb-3" style={{ color: '#eab308' }}>VIP Plan</h3>
                <p className="text-[11px] mb-1" style={{ color: '#64748b' }}>Minimum</p>
                <p className="text-[22px] font-extrabold" style={{ color: '#eab308' }}>PKR 1,00,00,000</p>
              </div>
              <div className="flex flex-col gap-2.5 text-[13px] mb-5">
                <div className="flex justify-between">
                  <span style={{ color: '#64748b' }}>Daily Profit</span>
                  <span className="font-bold text-white">5%</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#64748b' }}>Duration</span>
                  <span className="font-bold text-white">365 Days</span>
                </div>
              </div>
              <Link to={investTarget}
                className="w-full py-2.5 text-center text-[13px] font-bold rounded-lg text-black mt-auto transition-colors"
                style={{ background: '#eab308' }}
              >
                Invest Now
              </Link>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* ═════════════════════════════════════ DASHBOARD SECTION ════════════════════════════════════ */}
      <section className="py-10 sm:py-16 border-t" style={{ borderColor: 'rgba(30,41,59,0.4)' }}>
        <div className="max-w-[1280px] mx-auto px-5 md:px-6">
          <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-center">

            {/* Left copy */}
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
              className="w-full lg:w-[300px] shrink-0"
            >
              <motion.h2 variants={fadeUp} className="text-[24px] md:text-[28px] font-extrabold tracking-tight mb-3">
                Powerful <span style={{ color: '#3b82f6' }}>Dashboard</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-[13px] md:text-[13.5px] leading-relaxed mb-6 md:mb-7" style={{ color: '#64748b' }}>
                Track your investments, earnings, and withdrawals in real-time with our advanced dashboard.
              </motion.p>

              <motion.ul variants={stagger} className="flex flex-col gap-3 mb-7 md:mb-8">
                {[
                  'Real-time Profit Updates',
                  'Deposit & Withdrawal History',
                  'Multiple Investment Plans',
                  'Referral & Bonus System',
                  'Account & Security Settings'
                ].map((item, i) => (
                  <motion.li key={i} variants={fadeUp} className="flex items-center gap-3 text-[13px] md:text-[13.5px]" style={{ color: '#94a3b8' }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}>
                      <svg className="w-2.5 h-2.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    {item}
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div variants={fadeUp}>
                <Link to="/login"
                  className="inline-flex items-center text-[13px] md:text-[13.5px] font-bold px-5 md:px-6 py-2.5 md:py-3 rounded-lg text-white transition-colors"
                  style={{ background: '#2563eb', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
                >
                  Explore Dashboard
                </Link>
              </motion.div>

            </motion.div>

            {/* Right: Pixel-perfect Dashboard Mockup */}
          
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="flex-1 w-full"
            >
              <div className="rounded-2xl  overflow-hidden border" style={{ background: '#060d1e', borderColor: '#1e293b', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>

                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ background: '#070e1e', borderColor: '#1a2640' }}>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <span className="text-[9px] font-mono" style={{ color: '#475569' }}>https://eredbloo.com/dashboard</span>
                  </div>
                </div>

                {/* Dashboard interior */}
                <div className="flex min-h-[370px] text-[10px]">

                  {/* Sidebar */}
                  <div className="w-[115px] border-r flex flex-col gap-1 py-3 px-2 shrink-0"
                    style={{ background: '#070e1e', borderColor: '#111d30' }}>
                    {/* Logo */}
                    <div className="flex items-center gap-1.5 px-2 mb-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: '#1d4ed8', border: '1.5px solid #3b82f6' }}>
                        <span className="font-extrabold text-white" style={{ fontSize: 8 }}>e</span>
                      </div>
                      <span className="font-bold text-white text-[10px]">ered bloo</span>
                    </div>

                    {[
                      { label: 'Dashboard', active: true },
                      { label: 'Investments', active: false },
                      { label: 'Deposit', active: false },
                      { label: 'Withdraw', active: false },
                      { label: 'Transactions', active: false },
                      { label: 'Referrals', active: false },
                      { label: 'Settings', active: false },
                      { label: 'Logout', active: false }
                    ].map((item) => (
                      <div key={item.label}
                        className="px-2 py-1.5 rounded-md text-[9px] font-medium cursor-pointer"
                        style={{
                          background: item.active ? 'rgba(37,99,235,0.2)' : 'transparent',
                          color: item.active ? '#60a5fa' : '#64748b'
                        }}
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 flex flex-col min-w-0">

                    {/* Topbar */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0"
                      style={{ background: '#070e1e', borderColor: '#111d30' }}>
                      <span className="font-bold text-white text-[11px]">Dashboard</span>
                      <div className="flex items-center gap-2.5">
                        <svg className="w-3.5 h-3.5" style={{ color: '#64748b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                        </svg>
                        <div className="h-3.5 w-px" style={{ background: '#1e293b' }} />
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                            style={{ background: '#2563eb', fontSize: 8 }}>AR</div>
                          <div>
                            <div className="text-white font-bold" style={{ fontSize: 9 }}>Ali Raza</div>
                            <div style={{ fontSize: 8, color: '#64748b' }}>Investor</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stat cards */}
                    <div className="grid grid-cols-4 gap-2 p-3">
                      {[
                        { label: 'Total Balance', value: 'PKR 125,000', color: '#3b82f6', bg: 'rgba(37,99,235,0.12)', icon: '💰' },
                        { label: 'Total Invested', value: 'PKR 100,000', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: '📈' },
                        { label: 'Total Profit', value: 'PKR 25,000', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', icon: '⭐' },
                        { label: 'Total Withdrawn', value: 'PKR 10,000', color: '#f97316', bg: 'rgba(249,115,22,0.12)', icon: '💳' }
                      ].map((card, i) => (
                        <div key={i} className="rounded-lg p-2.5 flex items-center gap-2 border"
                          style={{ background: '#0a1428', borderColor: '#1a2640' }}>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px]"
                            style={{ background: card.bg }}>
                            {card.icon}
                          </div>
                          <div>
                            <div style={{ fontSize: 7.5, color: '#64748b' }}>{card.label}</div>
                            <div className="font-bold text-white" style={{ fontSize: 9 }}>{card.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chart + Transactions */}
                    <div className="grid grid-cols-5 gap-2 px-3 pb-3 flex-1">

                      {/* Chart */}
                      <div className="col-span-3 rounded-lg p-3 border" style={{ background: '#0a1428', borderColor: '#1a2640' }}>
                        <div className="font-bold text-white mb-2" style={{ fontSize: 9 }}>Profit Overview</div>
                        <div className="relative w-full" style={{ height: 100 }}>
                          <svg width="100%" height="100%" viewBox="0 0 220 90" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35"/>
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                              </linearGradient>
                            </defs>
                            {/* Y-axis labels */}
                            <text x="0" y="12" fill="#475569" fontSize="6">40K</text>
                            <text x="0" y="37" fill="#475569" fontSize="6">20K</text>
                            <text x="0" y="62" fill="#475569" fontSize="6">10K</text>
                            {/* Grid lines */}
                            <line x1="18" y1="10" x2="220" y2="10" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3"/>
                            <line x1="18" y1="35" x2="220" y2="35" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3"/>
                            <line x1="18" y1="60" x2="220" y2="60" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3"/>
                            {/* Area fill */}
                            <path d="M20 75 C60 70, 80 55, 110 42 S160 22, 218 12 L218 85 L20 85 Z"
                              fill="url(#lineGrad)"/>
                            {/* Line */}
                            <path d="M20 75 C60 70, 80 55, 110 42 S160 22, 218 12"
                              fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
                            {/* Dots */}
                            <circle cx="20" cy="75" r="2" fill="#3b82f6"/>
                            <circle cx="75" cy="58" r="2" fill="#3b82f6"/>
                            <circle cx="110" cy="42" r="2" fill="#3b82f6"/>
                            <circle cx="160" cy="25" r="2" fill="#3b82f6"/>
                            <circle cx="218" cy="12" r="2.5" fill="#00e5ff" stroke="#0a1428" strokeWidth="1"/>
                          </svg>
                          {/* X-axis labels */}
                          <div className="flex justify-between px-4 mt-1" style={{ fontSize: 7, color: '#475569' }}>
                            <span>May 1</span><span>May 8</span><span>May 15</span><span>May 22</span><span>May 29</span>
                          </div>
                        </div>
                      </div>

                      {/* Transactions */}
                      <div className="col-span-2 rounded-lg p-3 border" style={{ background: '#0a1428', borderColor: '#1a2640' }}>
                        <div className="font-bold text-white mb-3" style={{ fontSize: 9 }}>Recent Transactions</div>
                        <div className="flex flex-col gap-2">
                          {[
                            { label: 'Deposit', amount: 'PKR 20,000', date: 'May 30, 2024', positive: true },
                            { label: 'Profit', amount: 'PKR 3,000', date: 'May 30, 2024', positive: true },
                            { label: 'Withdrawal', amount: 'PKR 5,000', date: 'May 23, 2024', positive: false },
                            { label: 'Referral Commission', amount: 'PKR 1,000', date: 'May 31, 2024', positive: true }
                          ].map((tx, i) => (
                            <div key={i} className="flex items-center justify-between border-b pb-1.5 last:border-0 last:pb-0"
                              style={{ borderColor: '#111d30' }}>
                              <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                                  style={{ background: tx.positive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }}>
                                  <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    style={{ color: tx.positive ? '#22c55e' : '#ef4444' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"
                                      d={tx.positive ? 'M19 13l-7 7-7-7M12 20V4' : 'M5 11l7-7 7 7M12 4v16'}/>
                                  </svg>
                                </div>
                                <div>
                                  <div className="font-semibold text-white" style={{ fontSize: 8.5 }}>{tx.label}</div>
                                  <div style={{ fontSize: 7, color: '#475569' }}>{tx.date}</div>
                                </div>
                              </div>
                              <div className="font-bold text-[8.5px]" style={{ color: tx.positive ? '#22c55e' : '#ef4444' }}>
                                {tx.positive ? '+' : '-'}{tx.amount}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ HOW IT WORKS ══════════════════════════════════════════ */}
      <section id="howitworks" className="py-12 md:py-16 border-t" style={{ borderColor: 'rgba(30,41,59,0.4)', background: 'rgba(5,10,20,0.5)' }}>
        <div className="max-w-[1280px] mx-auto px-5 md:px-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 md:gap-10">

            {/* Label */}
            <div className="shrink-0 lg:w-[220px]">
              <p className="text-[13px] mb-1.5" style={{ color: '#64748b' }}>Start your investment journey</p>
              <h2 className="text-[24px] md:text-[28px] font-extrabold tracking-tight">
                How <span style={{ color: '#3b82f6' }}>It Works</span>
              </h2>
              <p className="text-[13px] mt-1" style={{ color: '#64748b' }}>in 3 simple steps.</p>
            </div>

            {/* Steps */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Connector lines (desktop) */}
              <div className="hidden md:block absolute top-8 left-[calc(33%+16px)] right-[calc(33%+16px)] h-px" style={{ background: '#1e293b' }} />

              {[
                {
                  num: '1', title: 'Create Account',
                  desc: 'Sign up and create your free account in minutes.',
                  icon: (
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  )
                },
                {
                  num: '2', title: 'Make Deposit',
                  desc: 'Choose a plan and deposit minimum amount.',
                  icon: (
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                  )
                },
                {
                  num: '3', title: 'Earn Daily Profits',
                  desc: 'Sit back and relax while we generate profits for you daily.',
                  icon: (
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                    </svg>
                  )
                }
              ].map((step) => (
                <motion.div key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-14 h-14 rounded-full border-2 flex items-center justify-center shrink-0"
                    style={{ borderColor: 'rgba(59,130,246,0.4)', background: '#060d1e' }}>
                    {step.icon}
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[18px] font-extrabold" style={{ color: '#3b82f6' }}>{step.num}</span>
                      <h3 className="text-[14px] font-bold text-white">{step.title}</h3>
                    </div>
                    <p className="text-[12.5px] leading-relaxed" style={{ color: '#64748b' }}>{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ WHY CHOOSE ══════════════════════════════════════════ */}
      <section className="py-12 md:py-16 border-t" style={{ borderColor: 'rgba(30,41,59,0.4)' }}>
        <div className="max-w-[1280px] mx-auto px-5 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-10"
          >
            <h2 className="text-[24px] md:text-[28px] font-extrabold tracking-tight">
              Why Choose <span style={{ color: '#3b82f6' }}>Ered Bloo?</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {[
              {
                title: 'Secure Platform',
                desc: 'Bank-level security for your investments.',
                icon: (
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                )
              },
              {
                title: 'Instant Withdrawals',
                desc: 'Get your withdrawals instantly, 24/7.',
                icon: (
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                )
              },
              {
                title: 'High ROI Plans',
                desc: 'Choose from a variety of profitable plans.',
                icon: (
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                )
              },
              {
                title: 'Referral Rewards',
                desc: 'Earn bonuses by referring others.',
                icon: (
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                )
              },
              {
                title: '24/7 Support',
                desc: 'Our team is always here to help you.',
                icon: (
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                )
              }
            ].map((card) => (
              <motion.div key={card.title} variants={fadeUp}
                className="rounded-xl p-4 flex items-start gap-3 border hover:border-blue-500/30 transition-colors group"
                style={{ background: '#060d1e', borderColor: '#1e293b' }}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
                  {card.icon}
                </div>
                <div>
                  <div className="font-bold text-white text-[13px] mb-1">{card.title}</div>
                  <div className="text-[11.5px] leading-snug" style={{ color: '#64748b' }}>{card.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ CTA BANNER ══════════════════════════════════════════ */}
      <section className="py-12 md:py-14 border-t" style={{ borderColor: 'rgba(30,41,59,0.4)' }}>
        <div className="max-w-[1280px] mx-auto px-5 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 border"
            style={{
              background: 'linear-gradient(135deg, #060f28 0%, #030712 50%, #060f28 100%)',
              borderColor: '#1e3a6e',
              boxShadow: '0 0 40px rgba(37,99,235,0.08)'
            }}
          >
            <div className="flex items-center gap-4 md:gap-6">
              <img src={coinImg} alt="Coins" className="w-[60px] md:w-[70px] hidden md:block shrink-0"
                style={{ filter: 'drop-shadow(0 0 16px rgba(59,130,246,0.6))' }} />
              <div>
                <h3 className="text-[20px] md:text-[24px] font-extrabold text-white mb-2 tracking-tight">Ready to Grow Your Money?</h3>
                <p className="text-[12.5px] md:text-[13.5px]" style={{ color: '#64748b' }}>
                  Join thousands of investors who trust Ered Bloo for their financial growth.
                </p>
              </div>
            </div>
            <Link to="/register"
              className="flex items-center gap-2 text-[13px] md:text-[14px] font-semibold px-6 md:px-7 py-3 md:py-3.5 rounded-lg text-white shrink-0 transition-colors"
              style={{ background: '#2563eb', boxShadow: '0 0 20px rgba(37,99,235,0.35)' }}
            >
              Get Started Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiShield, FiCpu, FiAward, FiUsers, FiGlobe } from 'react-icons/fi';
import Navbar from './Navbar';
import Footer from './Footer';

// Motion variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function About() {
  return (
    <div className="min-h-screen bg-[#030712] font-sans text-white overflow-x-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Shared Navbar */}
      <Navbar />

      {/* Hero Banner */}
      <section className="relative pt-36 pb-16 overflow-hidden bg-[#030712] border-b border-[#1c2a4a]/20">
        <div className="absolute right-[10%] top-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none z-0" />
        <div className="absolute left-[5%] bottom-[10%] w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none z-0" />
        
        {/* Abstract Grid background */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <div className="max-w-[1300px] mx-auto px-6 relative z-10 text-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex flex-col items-center"
          >
            <span className="inline-block px-4.5 py-1.5 bg-blue-950/50 border border-blue-500/30 rounded-full text-blue-400 text-[11px] font-bold uppercase tracking-widest mb-6">
              Who We Are
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-white mb-6">
              Empowering Your{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400">
                Financial Growth
              </span>
            </h1>

            <p className="text-slate-400 text-[15px] sm:text-base max-w-xl mx-auto leading-relaxed">
              Ered Bloo is a leading ROI platform engineered to provide reliable, secure, and fully automated wealth compounding opportunities to investors worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 relative">
        <div className="max-w-[1300px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Interactive text block */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="flex flex-col gap-6"
            >
              <h2 className="text-[32px] font-extrabold tracking-tight">
                Our Mission is <span className="text-blue-500">Transparency</span> & High Yields
              </h2>
              <p className="text-slate-400 text-[14.5px] leading-relaxed">
                Traditional investments are either bogged down by extreme volatility or excessively low yields. Ered Bloo bridges the gap by leveraging a structured risk mitigation model combined with algorithmic ROI distributions.
              </p>
              <p className="text-slate-400 text-[14.5px] leading-relaxed">
                We believe that everyone deserves passive income solutions that operate with complete clarity. With bank-grade protection mechanisms, automated audits, and instantaneous transfers, Ered Bloo empowers you to build passive wealth with total peace of mind.
              </p>
              
              <div className="flex gap-6 mt-4">
                <div>
                  <h4 className="text-2xl font-extrabold text-blue-500">2024</h4>
                  <p className="text-slate-400 text-xs mt-1">Platform Inception</p>
                </div>
                <div className="h-10 w-[1px] bg-slate-800" />
                <div>
                  <h4 className="text-2xl font-extrabold text-blue-500">15K+</h4>
                  <p className="text-slate-400 text-xs mt-1">Global Investors</p>
                </div>
                <div className="h-10 w-[1px] bg-slate-800" />
                <div>
                  <h4 className="text-2xl font-extrabold text-blue-500">99.8%</h4>
                  <p className="text-slate-400 text-xs mt-1">Trust Rating</p>
                </div>
              </div>
            </motion.div>

            {/* Right: Graphic Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-[#080d1a] to-[#040816] border border-[#1e293b] rounded-3xl p-8 relative overflow-hidden shadow-2xl min-h-[300px] flex flex-col justify-center gap-6"
            >
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <FiShield size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Our Vision</h3>
                  <p className="text-slate-400 text-[13px] leading-relaxed">
                    To democratize capital compounding by delivering clean, secure, and highly robust smart-contract equivalent returns to clients internationally, without any technical barriers.
                  </p>
                </div>
              </div>

              <div className="h-[1px] bg-slate-800/60" />

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <FiCpu size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Technological Supremacy</h3>
                  <p className="text-slate-400 text-[13px] leading-relaxed">
                    Our developers operate complex automated trade hedging and yield liquidity structures, enabling the platform to offer steady yields up to 5% daily.
                  </p>
                </div>
              </div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 border-t border-[#1c2a4a]/45 bg-[#050a14]/40 relative">
        <div className="max-w-[1300px] mx-auto px-6 relative z-10">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-[32px] font-extrabold tracking-tight text-white mb-4">
              Our Core <span className="text-blue-500">Values</span>
            </h2>
            <p className="text-slate-400 text-[14px] max-w-lg mx-auto">
              Our pillars are built on financial sustainability, transparency, and top-tier customer empowerment.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            
            {/* Value 1 */}
            <motion.div 
              variants={fadeInUp}
              className="bg-[#080d1a] border border-[#1e293b]/60 rounded-2xl p-6 flex flex-col gap-4.5 hover:border-blue-500/25 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <FiShield size={18} />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-white mb-2">Absolute Security</h3>
                <p className="text-slate-400 text-[12.5px] leading-relaxed">
                  Your funds are protected using cold-wallet distribution, advanced firewall APIs, and multiple insurance backings.
                </p>
              </div>
            </motion.div>

            {/* Value 2 */}
            <motion.div 
              variants={fadeInUp}
              className="bg-[#080d1a] border border-[#1e293b]/60 rounded-2xl p-6 flex flex-col gap-4.5 hover:border-blue-500/25 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <FiTrendingUp size={18} />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-white mb-2">Consistent Yields</h3>
                <p className="text-slate-400 text-[12.5px] leading-relaxed">
                  Daily distributions are guaranteed by our structured liquidity reserves and deep trade-hedging algorithms.
                </p>
              </div>
            </motion.div>

            {/* Value 3 */}
            <motion.div 
              variants={fadeInUp}
              className="bg-[#080d1a] border border-[#1e293b]/60 rounded-2xl p-6 flex flex-col gap-4.5 hover:border-blue-500/25 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <FiAward size={18} />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-white mb-2">Unwavering Integrity</h3>
                <p className="text-slate-400 text-[12.5px] leading-relaxed">
                  We lay out all deposit, referral, and withdrawal terms clearly with zero hidden commissions or locked fees.
                </p>
              </div>
            </motion.div>

            {/* Value 4 */}
            <motion.div 
              variants={fadeInUp}
              className="bg-[#080d1a] border border-[#1e293b]/60 rounded-2xl p-6 flex flex-col gap-4.5 hover:border-blue-500/25 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <FiGlobe size={18} />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-white mb-2">Global Accessibility</h3>
                <p className="text-slate-400 text-[12.5px] leading-relaxed">
                  Easily accessible to anyone with a phone or computer, with simplified local currency payouts and deposits.
                </p>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Global Impact / Milestones */}
      <section className="py-20 border-t border-[#1c2a4a]/45 relative">
        <div className="max-w-[1300px] mx-auto px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Graphic stats */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-5"
            >
              <div className="bg-[#080d1a] border border-[#1e293b]/55 p-6 rounded-2xl flex flex-col gap-2">
                <FiUsers className="text-blue-500" size={24} />
                <h4 className="text-3xl font-extrabold mt-1 text-white">15,000+</h4>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Active Members</p>
              </div>

              <div className="bg-[#080d1a] border border-[#1e293b]/55 p-6 rounded-2xl flex flex-col gap-2">
                <FiGlobe className="text-blue-500" size={24} />
                <h4 className="text-3xl font-extrabold mt-1 text-white">18+</h4>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Supported Regions</p>
              </div>

              <div className="bg-[#080d1a] border border-[#1e293b]/55 p-6 rounded-2xl flex flex-col gap-2 col-span-2 text-center items-center">
                <FiTrendingUp className="text-blue-500" size={24} />
                <h4 className="text-3xl font-extrabold mt-1 text-white">PKR 250,000,000+</h4>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Cumulative Investment Managed</p>
              </div>
            </motion.div>

            {/* Right: Milestone text */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="flex flex-col gap-6"
            >
              <h2 className="text-[32px] font-extrabold tracking-tight">
                Our Path of <span className="text-blue-500">Milestones</span>
              </h2>
              
              <div className="flex flex-col gap-6 mt-2">
                
                {/* Milestone 1 */}
                <div className="flex items-start gap-4">
                  <div className="w-6.5 h-6.5 rounded-full bg-blue-600/10 border border-blue-500/40 flex items-center justify-center text-blue-500 text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-[15px]">Q1 2024 - Foundation Build</h4>
                    <p className="text-slate-400 text-[12.5px] mt-1 leading-relaxed">
                      Ered Bloo completed secure integration tests, local escrow configurations, and released beta access.
                    </p>
                  </div>
                </div>

                {/* Milestone 2 */}
                <div className="flex items-start gap-4">
                  <div className="w-6.5 h-6.5 rounded-full bg-blue-600/10 border border-blue-500/40 flex items-center justify-center text-blue-500 text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-[15px]">Q4 2024 - 10K Active Investors</h4>
                    <p className="text-slate-400 text-[12.5px] mt-1 leading-relaxed">
                      Crossed PKR 150 Million in total payouts and successfully integrated instant automated withdrawal APIs.
                    </p>
                  </div>
                </div>

                {/* Milestone 3 */}
                <div className="flex items-start gap-4">
                  <div className="w-6.5 h-6.5 rounded-full bg-blue-600/10 border border-blue-500/40 flex items-center justify-center text-blue-500 text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-[15px]">Q2 2026 - Scale & Expansion</h4>
                    <p className="text-slate-400 text-[12.5px] mt-1 leading-relaxed">
                      Deploying AI-driven capital allocator nodes and launching secondary corporate investment tranches.
                    </p>
                  </div>
                </div>

              </div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="py-20 border-t border-[#1c2a4a]/45 relative z-10">
        <div className="max-w-[1000px] mx-auto px-6 text-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex flex-col items-center gap-6"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Secure Your <span className="text-blue-500">Financial Future?</span>
            </h2>
            <p className="text-slate-400 text-[14px] max-w-md leading-relaxed">
              Open a free account, pick your plan, and start compound earning with Ered Bloo today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-2">
              <Link 
                to="/register" 
                className="bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-bold px-8 py-3.5 rounded-xl shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-colors"
              >
                Sign Up Now
              </Link>
              <Link 
                to="/contact" 
                className="border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-900/50 hover:border-slate-700 text-[14px] font-bold px-8 py-3.5 rounded-xl transition-all"
              >
                Contact Support
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Shared Footer */}
      <Footer />

    </div>
  );
}

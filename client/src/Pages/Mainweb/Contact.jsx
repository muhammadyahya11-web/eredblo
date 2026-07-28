import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';

// ─── Animation Variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};
const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

function ScrollReveal({ children, variants = fadeUp, className = '', delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'show' : 'hidden'}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Hero Banner ───────────────────────────────────────────────────────────────
function ContactHero() {
  return (
    <section className="relative pt-28 pb-16 bg-[#030712] overflow-hidden">
      {/* Animated blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.14, 0.06] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-600 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.04, 0.1, 0.04] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-0 left-0 w-[240px] h-[240px] md:w-[400px] md:h-[400px] bg-blue-400 rounded-full blur-[120px]"
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,179,237,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-1.5 bg-blue-900/60 border border-blue-700/50 rounded-full text-blue-300 text-xs font-semibold uppercase tracking-widest mb-6"
          >
            Get In Touch
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4"
          >
            Contact{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #93c5fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Us
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-gray-400 text-lg max-w-xl mx-auto"
          >
            Have questions or need support? Our team is here 24/7 to help you with your investment journey.
          </motion.p>
        </motion.div>

        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-500"
        >
          <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
          <span className="text-gray-700">/</span>
          <span className="text-blue-400">Contact Us</span>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Contact Info Cards ────────────────────────────────────────────────────────
function ContactCards() {
  const cards = [
    {
      icon: (
        <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Email Us',
      value: 'support@eredbloo.com',
      sub: 'We reply within 24 hours',
      href: 'mailto:support@eredbloo.com',
      color: 'from-blue-900/60 to-blue-800/30',
      border: 'hover:border-blue-500/60',
    },
    {
      icon: (
        <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: 'WhatsApp',
      value: '+92 300 1234567',
      sub: 'Available 24/7 for support',
      href: 'https://wa.me/923001234567',
      color: 'from-green-900/50 to-green-800/20',
      border: 'hover:border-green-500/60',
    },
    {
      icon: (
        <svg className="w-7 h-7 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
      title: 'Telegram',
      value: '@eredbloo',
      sub: 'Join our Telegram channel',
      href: 'https://t.me/eredbloo',
      color: 'from-sky-900/50 to-sky-800/20',
      border: 'hover:border-sky-500/60',
    },
    {
      icon: (
        <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Our Location',
      value: 'Pakistan',
      sub: 'Serving clients worldwide',
      href: '#',
      color: 'from-purple-900/50 to-purple-800/20',
      border: 'hover:border-purple-500/60',
    },
  ];

  return (
    <section className="bg-[#060d1f] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {cards.map((c, i) => (
            <motion.a
              key={c.title}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              variants={fadeUp}
              whileHover={{ y: -8, scale: 1.03 }}
              transition={{ duration: 0.2 }}
              className={`relative bg-gradient-to-br ${c.color} border border-gray-700/60 ${c.border} rounded-2xl p-6 flex flex-col gap-3 transition-all duration-200 cursor-pointer group overflow-hidden`}
            >
              {/* Glow on hover */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-white/[0.02] rounded-2xl"
              />

              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="w-12 h-12 rounded-xl bg-[#0d1b35] border border-gray-700/60 flex items-center justify-center"
              >
                {c.icon}
              </motion.div>

              <div>
                <h3 className="text-white font-bold text-sm mb-1">{c.title}</h3>
                <p className="text-blue-300 text-sm font-medium">{c.value}</p>
                <p className="text-gray-500 text-xs mt-1">{c.sub}</p>
              </div>

              {/* Arrow indicator */}
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="absolute bottom-4 right-4 text-gray-500 group-hover:text-blue-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Contact Form + Info ────────────────────────────────────────────────────────
function ContactFormSection() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1800));
    setStatus('sent');
    setTimeout(() => { setStatus('idle'); setForm({ name: '', email: '', subject: '', message: '' }); }, 4000);
  };

  const inputClass = (field) =>
    `w-full bg-[#0d1b35] border rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 outline-none transition-all duration-200 ${
      focusedField === field
        ? 'border-blue-500 shadow-lg shadow-blue-500/20'
        : 'border-gray-700/60 hover:border-gray-600'
    }`;

  const subjects = ['General Inquiry', 'Investment Support', 'Deposit Issue', 'Withdrawal Issue', 'Account Problem', 'Other'];

  return (
    <section id="contact" className="bg-[#050a14] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

          {/* Left — Info Panel */}
          <ScrollReveal variants={fadeLeft} className="lg:col-span-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Let's <span className="text-blue-400">Talk</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Whether you have a question about our investment plans, need help with your account, or want to know how Ered Bloo works — we're here to help.
            </p>

            {/* Office Hours */}
            <div className="bg-[#0d1b35] border border-gray-700/50 rounded-2xl p-6 mb-6">
              <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <span className="text-blue-400">🕐</span> Support Hours
              </h4>
              <div className="space-y-3">
                {[
                  { day: 'Monday – Friday', time: '24 Hours' },
                  { day: 'Saturday', time: '24 Hours' },
                  { day: 'Sunday', time: '24 Hours' },
                ].map((h) => (
                  <div key={h.day} className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">{h.day}</span>
                    <span className="text-green-400 font-semibold bg-green-900/30 px-2.5 py-0.5 rounded-full">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Response time */}
            <div className="bg-blue-900/30 border border-blue-700/40 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-900/60 border border-blue-700/50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Lightning Fast Response</p>
                  <p className="text-gray-400 text-xs">Average reply time: under 2 hours</p>
                </div>
              </div>
            </div>

            {/* Social links */}
            <div>
              <p className="text-gray-500 text-xs mb-3 uppercase tracking-widest">Follow Us</p>
              <div className="flex gap-3">
                {[
                  { label: 'f', bg: 'bg-blue-900/60 hover:bg-blue-600', text: 'text-blue-400 hover:text-white' },
                  { label: 'T', bg: 'bg-sky-900/60 hover:bg-sky-500', text: 'text-sky-400 hover:text-white' },
                  { label: '✈', bg: 'bg-sky-900/60 hover:bg-sky-600', text: 'text-sky-300 hover:text-white' },
                  { label: '▶', bg: 'bg-red-900/60 hover:bg-red-600', text: 'text-red-400 hover:text-white' },
                ].map((s, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ scale: 1.2, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-10 h-10 rounded-xl ${s.bg} border border-gray-700/50 flex items-center justify-center ${s.text} text-sm transition-all duration-200`}
                  >
                    {s.label}
                  </motion.a>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Right — Form */}
          <ScrollReveal variants={fadeRight} className="lg:col-span-3">
            <div className="bg-[#0d1b35] border border-gray-700/50 rounded-2xl p-5 sm:p-8 relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

              <h3 className="text-white font-bold text-lg mb-6">Send Us a Message</h3>

              <AnimatePresence mode="wait">
                {status === 'sent' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                      className="w-20 h-20 rounded-full bg-green-900/40 border-2 border-green-500 flex items-center justify-center mb-5"
                    >
                      <motion.svg
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="w-10 h-10 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </motion.svg>
                    </motion.div>
                    <h3 className="text-white font-bold text-xl mb-2">Message Sent!</h3>
                    <p className="text-gray-400 text-sm">Thank you for reaching out. We'll get back to you within 2 hours.</p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-gray-400 text-xs font-semibold mb-1.5 block uppercase tracking-wider">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Ali Raza"
                          required
                          className={inputClass('name')}
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs font-semibold mb-1.5 block uppercase tracking-wider">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="ali@example.com"
                          required
                          className={inputClass('email')}
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="text-gray-400 text-xs font-semibold mb-1.5 block uppercase tracking-wider">Subject</label>
                      <select
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('subject')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className={`${inputClass('subject')} cursor-pointer`}
                        style={{ colorScheme: 'dark' }}
                      >
                        <option value="" disabled>Select a subject...</option>
                        {subjects.map((s) => (
                          <option key={s} value={s} className="bg-[#0d1b35]">{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="text-gray-400 text-xs font-semibold mb-1.5 block uppercase tracking-wider">Message</label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Describe your issue or question in detail..."
                        required
                        rows={5}
                        className={`${inputClass('message')} resize-none`}
                      />
                      <div className="text-right mt-1">
                        <span className={`text-xs ${form.message.length > 450 ? 'text-red-400' : 'text-gray-600'}`}>
                          {form.message.length}/500
                        </span>
                      </div>
                    </div>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={status === 'sending'}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {status === 'sending' ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <motion.svg
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </motion.svg>
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ Section ───────────────────────────────────────────────────────────────
function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: 'How do I create an account on Ered Bloo?', a: 'Simply click on Sign Up, fill in your details, verify your email via OTP, and your account will be ready within minutes.' },
    { q: 'What is the minimum investment amount?', a: 'The minimum investment starts at PKR 5,000 on our Starter Plan. You can choose any plan that fits your budget.' },
    { q: 'How are daily profits calculated?', a: 'Profits are calculated based on your invested amount and the daily profit percentage of your selected plan. They are credited to your account every day.' },
    { q: 'How long does withdrawal take?', a: 'Withdrawals are processed instantly 24/7. Once you submit a withdrawal request, it is processed immediately.' },
    { q: 'Is my investment safe on Ered Bloo?', a: 'Yes, we use bank-level security protocols to protect your funds and personal data. Your investment is always secure.' },
    { q: 'How does the referral system work?', a: 'You earn bonus rewards for every friend you refer who joins and invests on Ered Bloo. Bonuses are credited instantly to your account.' },
  ];

  return (
    <section id="faqs" className="bg-[#030712] py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Frequently Asked <span className="text-blue-400">Questions</span>
          </h2>
          <p className="text-gray-400 text-sm">Everything you need to know about Ered Bloo.</p>
        </ScrollReveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="space-y-3"
        >
          {faqs.map((faq, i) => (
            <motion.div key={i} variants={fadeUp}>
              <motion.div
                className={`bg-[#0d1b35] border rounded-xl overflow-hidden transition-all duration-200 ${
                  openIndex === i ? 'border-blue-500/60' : 'border-gray-700/60 hover:border-gray-600'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="text-white font-medium text-sm pr-4">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openIndex === i ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 w-6 h-6 rounded-full bg-blue-900/60 border border-blue-700/50 flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-gray-700/50 pt-3">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── CTA Strip ─────────────────────────────────────────────────────────────────
function CTAStrip() {
  return (
    <section className="bg-[#030712] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal variants={scaleIn}>
          <div className="relative bg-gradient-to-r from-blue-900/90 via-blue-800/60 to-blue-900/50 border border-blue-700/40 rounded-2xl px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-8 overflow-hidden">
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.08, 0.18, 0.08] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full blur-3xl pointer-events-none"
            />
            <div className="relative text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Still Have Questions?</h2>
              <p className="text-blue-200 text-sm">Our support team is available 24/7 to assist you.</p>
            </div>
            <div className="relative flex flex-wrap gap-3 shrink-0">
              <motion.a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg shadow-green-500/30 text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.137 1.548 5.868L0 24l6.294-1.525A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.66-.518-5.168-1.416l-.371-.222-3.847.932.978-3.76-.242-.387A9.945 9.945 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                WhatsApp Us
              </motion.a>
              <motion.div whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/30 text-sm"
                >
                  Get Started
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// Local Footer removed in favor of shared Footer

// ─── Main Export ───────────────────────────────────────────────────────────────
export default function Contact() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#030712] overflow-x-hidden"
    >
      <Navbar />
      <ContactHero />
      <ContactCards />
      <ContactFormSection />
      <FAQSection />
      <CTAStrip />
      <Footer />
    </motion.div>
  );
}

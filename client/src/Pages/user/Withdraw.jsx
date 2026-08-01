import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { withdrawalAPI, settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiLock, FiInfo } from 'react-icons/fi';

const Withdraw = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await settingsAPI.getPublic();
        if (data.success) setSettings(data.data);
      } catch {}
    };
    fetchSettings();
  }, []);

  const paymentMethods = ['JazzCash', 'Easypaisa', 'Allied Bank', 'HBL', 'Bank Alfalah', 'Bank Al Habib'];
  const availableBalance = (user?.totalBalance || 0) - (user?.totalWithdrawals || 0);
  const feePercentage = settings?.withdrawalFeePercentage ?? 3;
  const requestedAmount = Number(amount) || 0;
  const feeAmount = Math.round(requestedAmount * feePercentage) / 100;
  const netAmount = Math.max(0, requestedAmount - feeAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    if (parseFloat(amount) < (settings?.minimumWithdrawal || 300)) {
      toast.error(`Minimum withdrawal is ${settings?.minimumWithdrawal || 300}`);
      return;
    }
    if (parseFloat(amount) > (settings?.maximumWithdrawal || 500000)) {
      toast.error(`Maximum withdrawal is ${settings?.maximumWithdrawal || 500000}`);
      return;
    }
    if (parseFloat(amount) > availableBalance) {
      toast.error('Insufficient balance for this withdrawal');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await withdrawalAPI.create({
        amount: parseFloat(amount),
        paymentMethod,
        accountTitle,
        accountNumber,
      });
      if (data.success) {
        toast.success('Withdrawal request submitted! Awaiting admin approval.');
        setAmount('');
        setAccountTitle('');
        setAccountNumber('');
        setPaymentMethod('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Withdrawal failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="flex flex-col border-r border-[#1c2a4a] pr-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600/20 p-2 rounded-lg text-blue-500">
              <FiLock size={18} />
            </div>
            <span className="text-slate-400 text-xs font-medium">Available Balance</span>
          </div>
          <span className="text-emerald-400 font-bold text-xl ml-[42px]">
            PKR {availableBalance.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col border-r border-[#1c2a4a] pl-2 pr-4 justify-center">
          <span className="text-slate-400 text-xs font-medium mb-2">Minimum Withdrawal</span>
          <span className="text-white font-bold text-lg">
            PKR {settings?.minimumWithdrawal?.toLocaleString() || '300'}
          </span>
        </div>

        <div className="flex flex-col pl-2 justify-center">
          <span className="text-slate-400 text-xs font-medium mb-2">Maximum Withdrawal</span>
          <span className="text-white font-bold text-lg">
            PKR {settings?.maximumWithdrawal?.toLocaleString() || '500,000'}
          </span>
        </div>
        <div className="flex flex-col pl-2 justify-center">
          <span className="text-slate-400 text-xs font-medium mb-2">Withdrawal Fee</span>
          <span className="text-amber-400 font-bold text-lg">{feePercentage}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Form */}
        <div className="lg:col-span-8">
          <div className="bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-6">
            <h3 className="text-white font-semibold mb-6">Withdrawal Information</h3>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-400">Withdrawal Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-[#090f1e] border border-[#1c2a4a] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">PKR</span>
                </div>
              </div>

              {requestedAmount > 0 && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm">
                  <div className="flex justify-between text-slate-400"><span>Fee ({feePercentage}%)</span><span>PKR {feeAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between text-white font-semibold mt-2"><span>You receive</span><span>PKR {netAmount.toLocaleString()}</span></div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-400">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#090f1e] border border-[#1c2a4a] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                  required
                >
                  <option value="" disabled>Select payment method</option>
                  {paymentMethods.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-400">Account Title</label>
                <input
                  type="text"
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                  placeholder="Enter account title"
                  className="w-full bg-[#090f1e] border border-[#1c2a4a] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-400">Account Number / Mobile Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter account number"
                  className="w-full bg-[#090f1e] border border-[#1c2a4a] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg mt-2 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Withdrawal'}
              </button>

            </form>
          </div>
        </div>

        {/* Right Side: Important Note */}
        <div className="lg:col-span-4">
          <div className="flex flex-col gap-4 pt-2">
            <h4 className="text-[#f59e0b] text-sm font-semibold mb-2 border-b border-[#1c2a4a] pb-2 inline-block self-start">
              Important Note:
            </h4>
            <ul className="flex flex-col gap-4 text-xs text-slate-400 list-disc pl-4">
              <li>Withdrawal requests are processed within 24 hours.</li>
              <li>Please ensure your account details are correct.</li>
              <li>Minimum withdrawal amount is PKR {settings?.minimumWithdrawal?.toLocaleString() || '300'}.</li>
               <li>Only profits can be withdrawn.</li>
               <li>A {feePercentage}% withdrawal fee is deducted from the requested amount.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Withdraw;

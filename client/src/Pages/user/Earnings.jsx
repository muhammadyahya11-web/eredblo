import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { earningsAPI } from '../../services/api';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiActivity, FiChevronDown } from 'react-icons/fi';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

// Dummy data for Line Chart
const chartData = [
  { name: 'May 1', value: 3000 },
  { name: 'May 6', value: 4500 },
  { name: 'May 11', value: 3800 },
  { name: 'May 16', value: 6000 },
  { name: 'May 21', value: 5500 },
  { name: 'May 26', value: 8500 },
  { name: 'May 31', value: 9500 },
];

const Earnings = () => {
  const { user } = useContext(AuthContext);
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const { data } = await earningsAPI.getMyEarnings();
        if (data.success) {
          setEarningsData(data.data);
        }
      } catch (error) {
        console.error('Failed to load earnings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  // Use dummy data if api doesn't return exactly these fields
  const displayData = {
    today: earningsData?.todayEarnings || 4000,
    week: earningsData?.weeklyEarnings || 18500,
    month: earningsData?.monthlyEarnings || 45000,
    total: earningsData?.totalEarnings || 100000,
    breakdown: [
      { name: 'Daily Profit', value: 20000, color: '#3b82f6' },
      { name: 'Referral Bonus', value: 15000, color: '#8b5cf6' },
      { name: 'Team Bonus', value: 7500, color: '#10b981' },
      { name: 'Other Bonus', value: 2500, color: '#f59e0b' },
    ]
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      
      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        {/* Today */}
        <div className="bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-5 flex items-center gap-4">
          <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-500 shrink-0">
            <FiActivity size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-medium mb-1">Today</span>
            <span className="text-emerald-400 font-bold text-lg">
              PKR {displayData.today.toLocaleString()}
            </span>
          </div>
        </div>

        {/* This Week */}
        <div className="bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-5 flex items-center gap-4">
          <div className="bg-blue-500/10 p-3 rounded-lg text-blue-500 shrink-0">
            <FiBarChart2 size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-medium mb-1">This Week</span>
            <span className="text-white font-bold text-lg">
              PKR {displayData.week.toLocaleString()}
            </span>
          </div>
        </div>

        {/* This Month */}
        <div className="bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-5 flex items-center gap-4">
          <div className="bg-purple-500/10 p-3 rounded-lg text-purple-500 shrink-0">
            <FiPieChart size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-medium mb-1">This Month</span>
            <span className="text-white font-bold text-lg">
              PKR {displayData.month.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-5 flex items-center gap-4">
          <div className="bg-orange-500/10 p-3 rounded-lg text-orange-500 shrink-0">
            <FiTrendingUp size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-medium mb-1">Total Earnings</span>
            <span className="text-white font-bold text-lg">
              PKR {displayData.total.toLocaleString()}
            </span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Earnings Overview (Line Chart) */}
        <div className="lg:col-span-2 bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold">Earnings Overview</h3>
            <button className="flex items-center gap-2 text-xs text-slate-400 bg-[#090f1e] border border-[#1c2a4a] px-3 py-1.5 rounded-lg hover:border-blue-500 transition-colors">
              This Month <FiChevronDown />
            </button>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2a4a" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => val >= 1000 ? `${val / 1000}K` : val}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0d152a', borderColor: '#1c2a4a', borderRadius: '8px' }}
                  itemStyle={{ color: '#3b82f6' }}
                  formatter={(value) => [`PKR ${value.toLocaleString()}`, 'Earnings']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0d152a', stroke: '#3b82f6', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Earning Breakdown (Pie Chart) */}
        <div className="lg:col-span-1 bg-[#0d152a] border border-[#1c2a4a] rounded-xl p-6 flex flex-col">
          <h3 className="text-white font-semibold mb-2">Earning Breakdown</h3>
          
          <div className="flex-1 flex flex-col items-center justify-center pt-4 relative">
            <div className="h-[180px] w-[180px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayData.breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {displayData.breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              {/* Inner Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-400">PKR</span>
                <span className="text-lg font-bold text-white leading-tight">45,000</span>
                <span className="text-[10px] text-slate-400">Total</span>
              </div>
            </div>

            {/* Legends */}
            <div className="w-full mt-6 flex flex-col gap-3">
              {displayData.breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                    <span className="text-xs text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-white">PKR {item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Earnings;

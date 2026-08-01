import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet, TrendingUp, BarChart2, ArrowDownCircle, ArrowUpCircle,
  Users, BarChart, Clock, Copy, CheckCircle2, Activity, ChevronDown,
  ArrowDown, ArrowUp, DollarSign
} from "lucide-react";
import coinsImg from "../../assets/dashbordcoin.png";
import giftImg from "../../assets/gift_box.jpg";
import userAvatar from "../../assets/man.webp";
import { AuthContext } from "../../context/AuthContext";
import { userAPI, transactionAPI, earningsAPI } from "../../services/api";
import GiftBoxSection from "../../components/GiftBoxSection";

/* ─── CountUp Animation ────────────────────────────────────────── */
function CountUp({ end, duration = 1400, prefix = "", suffix = "", decimals = 0 }) {
  const [value, setValue] = React.useState(0);
  const ref = useRef(null);

  React.useEffect(() => {
    let startTime = null;
    let frameId;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = eased * end;
      setValue(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.floor(current));
      if (progress < 1) frameId = requestAnimationFrame(step);
      else setValue(end);
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [end, duration, decimals]);

  return <span>{prefix}{value.toLocaleString()}{suffix}</span>;
}

/* ─── SVG Animated Line Chart ──────────────────────────────────── */
function EarningsChart({ data }) {
  const W = 420, H = 200, PX = 36, PY = 24;
  const svgRef = useRef(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!data || data.length === 0) return null;

  const vals = data.map(d => d.val);
  const max = Math.max(...vals, 1);
  const min = 0;
  const stepX = data.length > 1 ? (W - PX * 2) / (data.length - 1) : 0;

  const pts = data.map((d, i) => ({
    x: PX + i * stepX,
    y: H - PY - ((d.val - min) / (max - min)) * (H - PY * 2.2),
    ...d,
  }));

  function smooth(pts) {
    if (pts.length < 2) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  }

  const linePath = smooth(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1].x},${H - PY} L ${pts[0].x},${H - PY} Z`;
  const yLabels = ["10K", "8K", "6K", "4K", "2K", "0"];

  // Highlight point (last point with tooltip box)
  const highlightPt = pts[pts.length - 2] || pts[pts.length - 1];

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minHeight: 200 }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
        </linearGradient>
        <filter id="chartGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="dotGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {animated && (
          <clipPath id="chartReveal">
            <rect x="0" y="0" width={W} height={H}>
              <animate attributeName="width" from="0" to={W} dur="1.2s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1" />
            </rect>
          </clipPath>
        )}
      </defs>

      {/* Grid lines */}
      {[0, 1, 2, 3, 4, 5].map(i => {
        const y = PY + i * (H - PY * 2) / 5;
        return <line key={i} x1={PX} x2={W - PX + 10} y1={y} y2={y} stroke="#1e2a45" strokeWidth="0.8" strokeDasharray="4 3" />;
      })}

      {/* Y Labels */}
      {yLabels.map((l, i) => (
        <text key={i} x={PX - 8} y={PY + i * (H - PY * 2) / 5 + 4} fill="#4a5568" fontSize="9" textAnchor="end" fontFamily="sans-serif">{l}</text>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#lineGrad)" clipPath={animated ? "url(#chartReveal)" : undefined} />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#chartGlow)"
        clipPath={animated ? "url(#chartReveal)" : undefined}
      />

      {/* Dots */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#3b82f6" filter="url(#dotGlow)" />
          <circle cx={p.x} cy={p.y} r="2.5" fill="#fff" />
        </g>
      ))}

      {/* Hover tooltip on last-1 point */}
      {highlightPt && (
        <g>
          <line x1={highlightPt.x} y1={PY} x2={highlightPt.x} y2={H - PY} stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 2" strokeOpacity="0.5" />
          <rect x={highlightPt.x - 28} y={highlightPt.y - 30} width={60} height={22} rx={5} fill="#1e3a5f" stroke="#3b82f6" strokeWidth="0.8" strokeOpacity="0.6" />
          <text x={highlightPt.x + 2} y={highlightPt.y - 15} fill="#fff" fontSize="8.5" textAnchor="middle" fontWeight="600" fontFamily="sans-serif">{highlightPt.day}</text>
          <text x={highlightPt.x + 2} y={highlightPt.y - 5} fill="#60a5fa" fontSize="8" textAnchor="middle" fontFamily="sans-serif">RS {highlightPt.val.toLocaleString()}</text>
        </g>
      )}
    </svg>
  );
}

/* ─── Mini Sparkline for "Keep Growing" card ──────────────────── */
function MiniSparkline() {
  const pts = [20, 35, 25, 50, 40, 65, 55, 80];
  const W = 100, H = 44;
  const stepX = (W - 8) / (pts.length - 1);
  const max = Math.max(...pts);
  const coords = pts.map((v, i) => ({ x: 4 + i * stepX, y: H - 4 - (v / max) * (H - 10) }));
  const linePath = coords.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${H} L ${coords[0].x} ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 44 }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkGrad)" />
      <path d={linePath} fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="3" fill="#22c55e" />
    </svg>
  );
}

/* ─── Status Badge ─────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    approved: { label: "Approved", cls: "bg-green-500/15 text-green-400 border border-green-500/30" },
    completed: { label: "Approved", cls: "bg-green-500/15 text-green-400 border border-green-500/30" },
    pending: { label: "Processing", cls: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30" },
    processing: { label: "Processing", cls: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30" },
    rejected: { label: "Rejected", cls: "bg-red-500/15 text-red-400 border border-red-500/30" },
    failed: { label: "Rejected", cls: "bg-red-500/15 text-red-400 border border-red-500/30" },
  };
  const s = map[(status || "").toLowerCase()] || { label: status, cls: "bg-slate-500/15 text-slate-400 border border-slate-500/30" };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>;
}

/* ─── Transaction Icon ─────────────────────────────────────────── */
function TxIcon({ type, status }) {
  const cfg = {
    deposit: { bg: "bg-blue-500/20", icon: <ArrowDown size={14} className="text-blue-400" />, border: "border-blue-500/30" },
    withdrawal: { bg: "bg-orange-500/20", icon: <ArrowUp size={14} className="text-orange-400" />, border: "border-orange-500/30" },
    withdraw: { bg: "bg-orange-500/20", icon: <ArrowUp size={14} className="text-orange-400" />, border: "border-orange-500/30" },
    profit: { bg: "bg-green-500/20", icon: <TrendingUp size={14} className="text-green-400" />, border: "border-green-500/30" },
    investment: { bg: "bg-purple-500/20", icon: <DollarSign size={14} className="text-purple-400" />, border: "border-purple-500/30" },
    bonus: { bg: "bg-yellow-500/20", icon: <Activity size={14} className="text-yellow-400" />, border: "border-yellow-500/30" },
  };
  const t = cfg[(type || "").toLowerCase()] || { bg: "bg-slate-500/20", icon: <Activity size={14} className="text-slate-400" />, border: "border-slate-500/30" };
  return (
    <div className={`w-9 h-9 rounded-full ${t.bg} border ${t.border} flex items-center justify-center flex-shrink-0`}>
      {t.icon}
    </div>
  );
}

/* ─── Dashboard ────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [earningsData, setEarningsData] = useState(null);
  const [chartPoints, setChartPoints] = useState([]);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  const userName = user?.name || "User";
  const firstName = userName.split(" ")[0];
  const referralCode = stats?.referralCode || user?.referralCode || "";
  const siteBase = window.location.origin;
  const referralLink = referralCode ? `${siteBase}/register?ref=${referralCode}` : `${siteBase}/register`;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, txRes, earRes] = await Promise.all([
          userAPI.getDashboard(),
          transactionAPI.getMyTransactions({ limit: 5 }),
          earningsAPI.getMyEarnings(),
        ]);
        if (dashRes.data.success) setStats(dashRes.data.data);
        if (txRes.data.success) setRecentTx(txRes.data.data || []);
        if (earRes.data.success) setEarningsData(earRes.data.data);
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Build chart points from real earnings data only
  useEffect(() => {
    if (earningsData?.weeklyEarnings && earningsData.weeklyEarnings.length > 0) {
      setChartPoints(earningsData.weeklyEarnings);
    } else if (recentTx.length > 0) {
      // Build from last 7 days of profit transactions
      const profitTx = recentTx.filter(tx => tx.isPositive && tx.type === 'Profit');
      if (profitTx.length > 0) {
        const pts = profitTx.slice(0, 7).reverse().map((tx, i) => ({
          day: new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          val: tx.amount || 0,
        }));
        setChartPoints(pts);
      } else {
        setChartPoints([]);
      }
    } else {
      setChartPoints([]);
    }
  }, [recentTx, earningsData]);

  const handleCopy = () => {
    const linkToCopy = referralCode
      ? `${window.location.origin}/register?ref=${referralCode}`
      : `${window.location.origin}/register`;
    navigator.clipboard.writeText(linkToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Stat Cards (real data only, no dummy fallbacks) ──
  const statCards = [
    {
      label: "Total Balance",
      value: stats?.totalBalance ?? 0,
      prefix: "RS ",
      change: stats?.totalBalance > 0 ? "Available balance" : "No balance yet",
      positive: true,
      icon: <Wallet size={22} className="text-white" />,
      iconBg: "bg-blue-600",
      glow: "rgba(37,99,235,0.35)",
      path: "/dashboard/deposit",
    },
    {
      label: "Total Investment",
      value: stats?.totalInvestment ?? 0,
      prefix: "RS ",
      change: stats?.activeInvestments > 0 ? `${stats.activeInvestments} active plan${stats.activeInvestments !== 1 ? 's' : ''}` : "No active investments",
      positive: true,
      icon: <TrendingUp size={22} className="text-white" />,
      iconBg: "bg-green-500",
      glow: "rgba(34,197,94,0.35)",
      path: "/dashboard/my-investments",
    },
    {
      label: "Total Earnings",
      value: stats?.totalEarnings ?? 0,
      prefix: "RS ",
      change: stats?.todayEarnings > 0 ? `+RS ${stats.todayEarnings.toLocaleString()} today` : "No earnings today",
      positive: true,
      icon: <Activity size={22} className="text-white" />,
      iconBg: "bg-purple-600",
      glow: "rgba(124,58,237,0.35)",
      path: "/dashboard/earnings",
    },
    {
      label: "Total Withdrawn",
      value: stats?.totalWithdrawals ?? 0,
      prefix: "RS ",
      change: stats?.totalWithdrawals > 0 ? "Lifetime withdrawals" : "No withdrawals yet",
      positive: false,
      isWithdrawn: true,
      icon: <ArrowUpCircle size={22} className="text-white" />,
      iconBg: "bg-orange-500",
      glow: "rgba(249,115,22,0.35)",
      path: "/dashboard/withdraw",
    },
  ];

  // ── Quick Actions ──
  const quickActions = [
    {
      label: "Invest Now", sub: "View Plans",
      icon: <TrendingUp size={22} className="text-white" />,
      bg: "bg-blue-600", glow: "rgba(37,99,235,0.5)",
      path: "/dashboard/my-investments",
    },
    {
      label: "Deposit", sub: "Add Funds",
      icon: <ArrowDownCircle size={22} className="text-white" />,
      bg: "bg-emerald-600", glow: "rgba(16,185,129,0.5)",
      path: "/dashboard/deposit",
    },
    {
      label: "Withdraw", sub: "Request Payout",
      icon: <ArrowUpCircle size={22} className="text-white" />,
      bg: "bg-green-500", glow: "rgba(34,197,94,0.5)",
      path: "/dashboard/withdraw",
    },
    {
      label: "My Team", sub: "View Members",
      icon: <Users size={22} className="text-white" />,
      bg: "bg-purple-600", glow: "rgba(124,58,237,0.5)",
      path: "/dashboard/my-team",
    },
  ];

  // ── Real Transactions (no fallback dummy data) ──
  const displayTx = recentTx.map(tx => ({
    type: tx.type,
    sub: tx.description || tx.method || "",
    date: new Date(tx.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    amount: tx.amount,
    positive: tx.isPositive,
    status: tx.status,
  }));

  if (loading) {
    return (
      <div style={{ background: "#080d1a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className="db-spinner" />
          <p style={{ color: "#64748b", marginTop: 16, fontSize: 14 }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`db-root ${mounted ? "db-mounted" : ""}`}>

      {/* ══ WELCOME BANNER ══════════════════════════════════════════ */}
      <div className="db-welcome-card db-fadeup" style={{ animationDelay: "0ms" }}>
        {/* Glow blobs */}
        <div className="db-welcome-blob db-welcome-blob--green" />
        <div className="db-welcome-blob db-welcome-blob--blue" />

        {/* Left: Avatar */}
        <div className="db-avatar-wrap db-slidein-left" style={{ animationDelay: "100ms" }}>
        <div className="w-20 h-20 rounded-full overflow-hidden bg-indigo-600 flex items-center justify-center">
  {!user?.profilePicture || imageError ? (
    <span className="text-white text-3xl font-bold">
      {user?.name?.charAt(0).toUpperCase() || "U"}
    </span>
  ) : (
    <img
      src={user.profilePicture}
      alt={user?.name}
      className="w-full h-full object-cover"
      onError={() => setImageError(true)}
    />
  )}
</div>
          <div className="db-avatar-badge">
            <CheckCircle2 size={12} color="#fff" strokeWidth={3} />
          </div>
        </div>

        {/* Center: Welcome text + stats */}
        <div className="db-welcome-center db-slideup" style={{ animationDelay: "150ms" }}>
          <p className="db-welcome-sub">Welcome Back,</p>
          <h2 className="db-welcome-name">
            Mr {firstName} <span className="db-wave">👋</span>
          </h2>
          <p className="db-welcome-desc">
            Here's an overview of your investment portfolio,<br />
            earnings, withdrawals and today's performance.
          </p>

          {/* Mini stats row */}
          <div className="db-welcome-stats">
            <div className="db-wstat-pill">
              <div className="db-wstat-icon db-wstat-icon--green">
                <TrendingUp size={14} color="#22c55e" />
              </div>
              <div>
                <p className="db-wstat-label">Today Earning</p>
                <p className="db-wstat-val db-green">
                  RS <CountUp end={stats?.todayEarnings ?? earningsData?.todayEarnings ?? 0} />
                </p>
              </div>
            </div>

            <div className="db-wstat-pill">
              <div className="db-wstat-icon db-wstat-icon--blue">
                <Users size={14} color="#60a5fa" />
              </div>
              <div>
                <p className="db-wstat-label">Team Members</p>
                <p className="db-wstat-val db-blue">{stats?.totalTeamMembers ?? 0} Referred</p>
              </div>
            </div>

            <div className="db-wstat-pill">
              <div className="db-wstat-icon db-wstat-icon--purple">
                <BarChart2 size={14} color="#a78bfa" />
              </div>
              <div>
                <p className="db-wstat-label">Active Plans</p>
                <p className="db-wstat-val db-purple">
                  {stats?.activeInvestments ?? 0} Investment{(stats?.activeInvestments ?? 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Keep Growing card */}
        <div className="db-keep-growing db-slidein-right" style={{ animationDelay: "200ms" }}>
          <div className="db-kg-header">
            <p className="db-kg-title">Keep Growing! 🚀</p>
            <p className="db-kg-desc">Thank you for choosing our<br />platform. Your investments<br />are growing every day.</p>
          </div>
          <div className="db-kg-chart">
            <MiniSparkline />
          </div>
         
        </div>
      </div>

      {/* ══ MYSTERY GIFT BOXES SECTION ══════════════════════════════ */}
      <GiftBoxSection />

      {/* ══ STAT CARDS ══════════════════════════════════════════════ */}
      <div className="db-stat-grid">
        {statCards.map((s, i) => (
          <div
            key={i}
            className="db-stat-card db-fadeup cursor-pointer hover:border-blue-500/50 transition-colors"
            onClick={() => s.path && navigate(s.path)}
            style={{ animationDelay: `${i * 80 + 200}ms` }}
          >
            <div className="db-stat-icon-wrap" style={{ background: undefined }}>
              <div className={`db-stat-icon ${s.iconBg}`} style={{ boxShadow: `0 0 18px ${s.glow}` }}>
                {s.icon}
              </div>
            </div>
            <div className="db-stat-content">
              <p className="db-stat-label">{s.label}</p>
              <p className="db-stat-value">
                <CountUp end={s.value} prefix={s.prefix} />
              </p>
              {s.isWithdrawn ? (
                <p className={`db-stat-change ${s.positive ? 'db-green' : 'db-orange'}`}>
                  {s.change}
                </p>
              ) : (
                <p className={`db-stat-change ${s.positive ? 'db-green' : 'db-red'}`}>
                  {s.change}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ══ MAIN GRID ═══════════════════════════════════════════════ */}
      <div className="db-main-grid">

        {/* ── Left Column ── */}
        <div className="db-col-left">

          {/* Earnings Overview */}
          <div className="db-card db-fadeup" style={{ animationDelay: "500ms" }}>
            <div className="db-card-header">
              <h3 className="db-card-title">Earnings Overview</h3>
              <button className="db-week-btn">
                This Week <ChevronDown size={13} style={{ marginLeft: 4 }} />
              </button>
            </div>

            <div style={{ marginTop: 8 }}>
              <EarningsChart data={chartPoints} />
            </div>

            {/* X axis labels */}
            <div className="db-chart-xlabels">
              {chartPoints.map((d, i) => (
                <span key={i} className="db-chart-xlabel">{d.day}</span>
              ))}
            </div>

            {/* Chart footer stats */}
            <div className="db-chart-footer">
              <div>
                <p className="db-chart-footer-label">Total Earnings</p>
                <p className="db-chart-footer-val">
                  RS <CountUp end={stats?.totalEarnings ?? earningsData?.totalEarnings ?? 0} />
                  {(stats?.totalEarnings ?? 0) > 0 && <span className="db-green db-small"> Lifetime</span>}
                </p>
              </div>
              <div>
                <p className="db-chart-footer-label">Today's Earnings</p>
                <p className="db-chart-footer-val">
                  RS <CountUp end={stats?.todayEarnings ?? earningsData?.todayEarnings ?? 0} />
                  {(stats?.todayEarnings ?? 0) > 0 && <span className="db-green db-small"> Today</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Invite Friends Banner */}
          <div className="db-invite-card db-fadeup" style={{ animationDelay: "600ms" }}>
            <div className="db-invite-bg-glow" />
            <div className="db-invite-left">
              <div className="db-invite-icon-wrap">
                <Users size={22} color="#fff" />
              </div>
              <div>
                <h3 className="db-invite-title">Invite Your Friends &amp; Earn More!</h3>
                <p className="db-invite-desc">Get multi-level commission on the first plan investment<br />made by your referred members.</p>
              </div>
            </div>

            <div className="db-invite-center">
              <p className="db-invite-link-label">Your Referral Link</p>
              <div className="db-referral-row">
                <span className="db-referral-link">{referralLink}</span>
                <button className="db-copy-btn" onClick={handleCopy} title="Copy link">
                  {copied ? <CheckCircle2 size={14} color="#22c55e" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="db-invite-right">
              <div className="db-gift-img-wrap">
                <img src={giftImg} alt="gift" className="db-gift-img" />
              </div>
              <button className="db-invite-btn" onClick={() => navigate("/dashboard/my-team")}>
                Invite Now →
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="db-col-right">

          {/* Quick Actions */}
          <div className="db-card db-fadeup" style={{ animationDelay: "400ms" }}>
            <h3 className="db-card-title" style={{ marginBottom: 18 }}>Quick Actions</h3>
            <div className="db-qa-grid">
              {quickActions.map((a, i) => (
                <button
                  key={i}
                  className="db-qa-btn"
                  onClick={() => navigate(a.path)}
                  style={{ animationDelay: `${i * 60 + 400}ms` }}
                >
                  <div className={`db-qa-icon ${a.bg}`} style={{ boxShadow: `0 6px 20px ${a.glow}` }}>
                    {a.icon}
                  </div>
                  <span className="db-qa-label">{a.label}</span>
                  <span className="db-qa-sub">{a.sub}</span>
                </button>
              ))}
            </div>
            <button
              className="db-view-all-actions-btn"
              onClick={() => navigate("/dashboard/transactions")}
            >
              View All Actions →
            </button>
          </div>

          {/* Recent Transactions */}
          <div className="db-card db-fadeup" style={{ animationDelay: "550ms" }}>
            <div className="db-card-header">
              <h3 className="db-card-title">Recent Transactions</h3>
              <button
                className="db-view-all-btn"
                onClick={() => navigate("/dashboard/transactions")}
              >
                View All
              </button>
            </div>

            <div className="db-tx-list">
              {displayTx.map((tx, i) => (
                <div
                  key={i}
                  className="db-tx-row db-fadeup"
                  style={{ animationDelay: `${i * 60 + 600}ms` }}
                >
                  <TxIcon type={tx.type} status={tx.status} />
                  <div className="db-tx-info">
                    <p className="db-tx-type">{tx.type}</p>
                    <p className="db-tx-sub">{tx.sub}</p>
                    <p className="db-tx-date">{tx.date}</p>
                  </div>
                  <div className="db-tx-right">
                    <p className={`db-tx-amount ${tx.positive ? "db-green" : "db-red"}`}>
                      {tx.positive ? "+" : "-"}RS <CountUp end={tx.amount} duration={1000} />
                    </p>
                    <StatusBadge status={tx.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ══ FOOTER ══════════════════════════════════════════════════ */}
      <footer className="db-footer">
        <span>© 2025 MyCompany. All rights reserved.</span>
        <div className="db-footer-links">
          <a href="#">Terms &amp; Conditions</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Support</a>
        </div>
      </footer>

      {/* ══ INLINE STYLES ══════════════════════════════════════════ */}
      <style>{`
        /* ── Root ── */
        .db-root {
          background: #080d1a;
          min-height: 100%;
          padding: 20px 24px 10px;
          font-family: 'Inter', 'Segoe UI', sans-serif;
          color: #fff;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .db-root.db-mounted { opacity: 1; }

        /* ── Animations ── */
        @keyframes dbFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dbSlideLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes dbSlideRight {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes dbSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatCoin {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50%       { transform: translateY(-8px) rotate(2deg); }
        }
        @keyframes floatGift {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-6px) rotate(-3deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50%       { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .db-fadeup    { animation: dbFadeUp 0.55s cubic-bezier(.4,0,.2,1) both; }
        .db-slidein-left  { animation: dbSlideLeft 0.5s cubic-bezier(.4,0,.2,1) both; }
        .db-slidein-right { animation: dbSlideRight 0.5s cubic-bezier(.4,0,.2,1) both; }
        .db-slideup   { animation: dbSlideUp 0.5s cubic-bezier(.4,0,.2,1) both; }

        /* ── Spinner ── */
        .db-spinner {
          width: 36px; height: 36px;
          border: 3px solid #1e2a45;
          border-top-color: #3b82f6;
          border-radius: 50%;
          margin: 0 auto;
          animation: spin 0.8s linear infinite;
        }

        /* ══ WELCOME CARD ══ */
        .db-welcome-card {
          position: relative;
          background: linear-gradient(135deg, #0d1530 0%, #0b1225 60%, #0a1020 100%);
          border: 1px solid #1e2d4a;
          border-radius: 18px;
          padding: 22px 28px;
          display: flex;
          align-items: center;
          gap: 22px;
          overflow: hidden;
          margin-bottom: 20px;
          box-shadow: 0 4px 40px rgba(30,60,120,0.18);
        }
        .db-welcome-blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(50px);
        }
        .db-welcome-blob--green {
          width: 260px; height: 200px;
          top: -60px; left: -40px;
          background: radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%);
        }
        .db-welcome-blob--blue {
          width: 200px; height: 180px;
          bottom: -50px; right: 200px;
          background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%);
        }

        /* Avatar */
        .db-avatar-wrap {
          position: relative;
          flex-shrink: 0;
          z-index: 2;
        }
        .db-avatar-ring {
          width: 100px; height: 100px;
          border-radius: 50%;
          border: 2.5px solid #22c55e;
          padding: 3px;
          box-shadow: 0 0 24px rgba(34,197,94,0.35);
          background: #0d1530;
        }
        .db-avatar-img {
          width: 100%; height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }
        .db-avatar-badge {
          position: absolute;
          bottom: 3px; right: 3px;
          width: 24px; height: 24px;
          background: #22c55e;
          border-radius: 50%;
          border: 2px solid #0d1530;
          display: flex; align-items: center; justify-content: center;
          animation: pulseGlow 2.5s ease-in-out infinite;
        }

        /* Welcome Center */
        .db-welcome-center {
          flex: 1;
          z-index: 2;
          min-width: 0;
        }
        .db-welcome-sub {
          font-size: 12px;
          color: #94a3b8;
          margin-bottom: 2px;
        }
        .db-welcome-name {
          font-size: 24px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.3px;
          margin-bottom: 6px;
          line-height: 1.1;
        }
        .db-wave {
          display: inline-block;
          animation: floatCoin 2s ease-in-out infinite;
        }
        .db-welcome-desc {
          font-size: 12px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 16px;
        }
        .db-welcome-stats {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .db-wstat-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(10,16,36,0.85);
          border: 1px solid #1e2d4a;
          border-radius: 12px;
          padding: 10px 14px;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .db-wstat-pill:hover {
          border-color: #2d4a7a;
          box-shadow: 0 0 14px rgba(59,130,246,0.1);
        }
        .db-wstat-icon {
          width: 32px; height: 32px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .db-wstat-icon--green { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); }
        .db-wstat-icon--blue  { background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); }
        .db-wstat-icon--purple{ background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3); }
        .db-wstat-label { font-size: 10px; color: #64748b; }
        .db-wstat-val   { font-size: 13px; font-weight: 700; color: #fff; }

        /* Keep Growing */
        .db-keep-growing {
          flex-shrink: 0;
          width: 220px;
          background: rgba(10,16,36,0.7);
          border: 1px solid #1e2d4a;
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
          overflow: hidden;
          z-index: 2;
        }
        .db-kg-title {
          font-size: 14px; font-weight: 700; color: #fff;
        }
        .db-kg-desc {
          font-size: 11px; color: #64748b; line-height: 1.5;
        }
        .db-kg-chart { flex: 1; }
        .db-coins-wrap {
          position: absolute;
          bottom: -10px; right: -10px;
        }
        .db-coins-img {
          width: 90px; height: 90px;
          object-fit: contain;
          filter: drop-shadow(0 0 16px rgba(234,179,8,0.5));
          animation: floatCoin 3s ease-in-out infinite;
        }

        /* ══ STAT CARDS ══ */
        .db-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }
        .db-stat-card {
          background: #0d1530;
          border: 1px solid #1e2d4a;
          border-radius: 14px;
          padding: 18px 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          cursor: pointer;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .db-stat-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.03), transparent);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .db-stat-card:hover {
          transform: translateY(-3px);
          border-color: #2d4a7a;
          box-shadow: 0 8px 30px rgba(30,60,120,0.25);
        }
        .db-stat-card:hover::before { opacity: 1; }
        .db-stat-icon {
          width: 48px; height: 48px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .db-stat-card:hover .db-stat-icon { transform: scale(1.1); }
        .db-stat-label { font-size: 11px; color: #64748b; margin-bottom: 4px; font-weight: 500; }
        .db-stat-value { font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.5px; line-height: 1.1; margin-bottom: 4px; }
        .db-stat-change { font-size: 11px; font-weight: 500; display: flex; align-items: center; gap: 4px; }

        /* ══ MAIN GRID ══ */
        .db-main-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 16px;
          margin-bottom: 20px;
        }
        .db-col-left, .db-col-right {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ── Generic Card ── */
        .db-card {
          background: #0d1530;
          border: 1px solid #1e2d4a;
          border-radius: 14px;
          padding: 20px;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .db-card:hover {
          border-color: #2d4a7a;
          box-shadow: 0 0 24px rgba(30,60,120,0.15);
        }
        .db-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .db-card-title {
          font-size: 15px;
          font-weight: 700;
          color: #fff;
        }

        /* Week dropdown */
        .db-week-btn {
          display: flex; align-items: center;
          font-size: 11px;
          color: #94a3b8;
          background: #0a0f1e;
          border: 1px solid #1e2d4a;
          border-radius: 8px;
          padding: 5px 10px;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .db-week-btn:hover { border-color: #3b82f6; color: #60a5fa; }

        /* Chart x labels */
        .db-chart-xlabels {
          display: flex;
          justify-content: space-between;
          padding: 6px 6px 0;
        }
        .db-chart-xlabel {
          font-size: 10px;
          color: #4a5568;
        }

        /* Chart footer */
        .db-chart-footer {
          display: flex;
          gap: 32px;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid #1e2d4a;
        }
        .db-chart-footer-label { font-size: 11px; color: #64748b; margin-bottom: 2px; }
        .db-chart-footer-val { font-size: 16px; font-weight: 700; color: #fff; }
        .db-small { font-size: 11px; font-weight: 500; margin-left: 4px; }

        /* ── Quick Actions ── */
        .db-qa-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 14px;
        }
        .db-qa-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          background: #080d1a;
          border: 1px solid #1e2d4a;
          border-radius: 12px;
          padding: 16px 10px;
          cursor: pointer;
          transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
        }
        .db-qa-btn:hover {
          transform: translateY(-3px);
          border-color: #2d4a7a;
          box-shadow: 0 6px 20px rgba(30,60,120,0.2);
        }
        .db-qa-icon {
          width: 48px; height: 48px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .db-qa-btn:hover .db-qa-icon { transform: scale(1.12); }
        .db-qa-label { font-size: 12px; font-weight: 700; color: #fff; }
        .db-qa-sub   { font-size: 10px; color: #64748b; }

        .db-view-all-actions-btn {
          width: 100%;
          padding: 10px;
          background: rgba(59,130,246,0.08);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 10px;
          color: #60a5fa;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }
        .db-view-all-actions-btn:hover {
          background: rgba(59,130,246,0.14);
          border-color: rgba(59,130,246,0.4);
        }

        /* ── Recent Transactions ── */
        .db-view-all-btn {
          font-size: 11px;
          font-weight: 600;
          color: #22c55e;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }
        .db-view-all-btn:hover { color: #4ade80; }
        .db-tx-list { display: flex; flex-direction: column; gap: 2px; }
        .db-tx-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 8px;
          border-radius: 10px;
          transition: background 0.2s;
        }
        .db-tx-row:hover { background: rgba(59,130,246,0.05); }
        .db-tx-info { flex: 1; min-width: 0; }
        .db-tx-type { font-size: 12px; font-weight: 700; color: #fff; }
        .db-tx-sub  { font-size: 10px; color: #64748b; }
        .db-tx-date { font-size: 10px; color: #4a5568; }
        .db-tx-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
        .db-tx-amount { font-size: 12px; font-weight: 700; }

        /* ══ INVITE CARD ══ */
        .db-invite-card {
          position: relative;
          background: linear-gradient(135deg, #0d1530, #0a1020 80%);
          border: 1px solid #1e2d4a;
          border-radius: 14px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          overflow: hidden;
        }
        .db-invite-bg-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 30% 50%, rgba(37,99,235,0.08), transparent 65%);
          pointer-events: none;
        }
        .db-invite-left {
          display: flex;
          align-items: center;
          gap: 14px;
          z-index: 1;
          flex: 1;
        }
        .db-invite-icon-wrap {
          width: 46px; height: 46px;
          border-radius: 50%;
          background: #2563eb;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 20px rgba(37,99,235,0.5);
        }
        .db-invite-title { font-size: 14px; font-weight: 700; color: #fff; }
        .db-invite-desc  { font-size: 11px; color: #64748b; margin-top: 3px; line-height: 1.5; }

        .db-invite-center {
          z-index: 1;
          flex-shrink: 0;
        }
        .db-invite-link-label { font-size: 10px; color: #64748b; margin-bottom: 6px; }
        .db-referral-row {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #080d1a;
          border: 1px solid #1e2d4a;
          border-radius: 8px;
          padding: 6px 10px;
        }
        .db-referral-link { font-size: 11px; color: #94a3b8; }
        .db-copy-btn {
          background: none; border: none; cursor: pointer;
          color: #64748b;
          display: flex; align-items: center;
          transition: color 0.2s;
          padding: 2px;
        }
        .db-copy-btn:hover { color: #60a5fa; }

        .db-invite-right {
          display: flex;
          align-items: center;
          gap: 14px;
          z-index: 1;
          flex-shrink: 0;
        }
        .db-gift-img-wrap { position: relative; }
        .db-gift-img {
          width: 70px; height: 70px;
          object-fit: cover;
          border-radius: 50%;
          filter: drop-shadow(0 0 12px rgba(234,179,8,0.4));
          animation: floatGift 3.5s ease-in-out infinite;
        }
        .db-invite-btn {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #fff;
          border: none;
          padding: 11px 20px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 4px 18px rgba(37,99,235,0.45);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .db-invite-btn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 28px rgba(37,99,235,0.6);
        }

        /* ══ COLOR HELPERS ══ */
        .db-green  { color: #22c55e !important; }
        .db-red    { color: #ef4444 !important; }
        .db-blue   { color: #60a5fa !important; }
        .db-purple { color: #a78bfa !important; }
        .db-orange { color: #fb923c !important; }

        /* ── Icon BGs ── */
        .bg-blue-600  { background-color: #2563eb; }
        .bg-green-500 { background-color: #22c55e; }
        .bg-purple-600{ background-color: #7c3aed; }
        .bg-orange-500{ background-color: #f97316; }

        /* ── Dot pulse ── */
        .db-dot-pulse {
          display: inline-block;
          width: 7px; height: 7px;
          background: #fb923c;
          border-radius: 50%;
          animation: dotPulse 1.2s ease-in-out infinite;
          margin-right: 4px;
        }

        /* ══ FOOTER ══ */
        .db-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0 6px;
          border-top: 1px solid #1a2340;
          font-size: 11px;
          color: #3a4a60;
        }
        .db-footer-links {
          display: flex;
          gap: 18px;
        }
        .db-footer-links a {
          color: #3a4a60;
          text-decoration: none;
          transition: color 0.2s;
        }
        .db-footer-links a:hover { color: #60a5fa; }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 1100px) {
          .db-stat-grid { grid-template-columns: repeat(2, 1fr); }
          .db-main-grid { grid-template-columns: 1fr; }
          .db-keep-growing { display: none; }
        }
        @media (max-width: 700px) {
          .db-root { padding: 14px 14px 10px; }
          .db-stat-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .db-welcome-card { flex-direction: column; align-items: flex-start; padding: 18px; }
          .db-invite-card { flex-direction: column; align-items: flex-start; gap: 14px; }
          .db-invite-right { flex-direction: row; }
          .db-footer { flex-direction: column; gap: 10px; text-align: center; }
          .db-welcome-stats { flex-direction: column; }
        }
        @media (max-width: 480px) {
          .db-stat-grid { grid-template-columns: 1fr; }
          .db-qa-grid { grid-template-columns: 1fr 1fr; }
          .db-stat-value { font-size: 18px; }
        }
      `}</style>
    </div>
  );
}

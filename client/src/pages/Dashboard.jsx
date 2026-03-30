import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { CoupleContext } from '../context/CoupleContext';
import { useContext } from 'react';
import {
    FiArrowUpRight, FiArrowDownRight, FiDollarSign, FiRefreshCw,
    FiTrendingUp, FiPlus, FiChevronRight, FiChevronLeft, FiGrid,
    FiBell, FiClock, FiBarChart2,
    FiShield, FiTarget, FiTrendingDown, FiCheckCircle, FiAlertTriangle, FiAlertCircle, FiXCircle, FiSettings, FiPieChart
} from 'react-icons/fi';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, PointElement, LineElement,
    ArcElement, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, PointElement, LineElement,
    ArcElement, Tooltip, Legend, Filler
);

/* ── helpers ── */
const fmt = (n) => {
    const v = n ?? 0;
    const abs = Math.abs(v);
    if (abs >= 10000000) return `${(v / 10000000).toFixed(1)}Cr`;
    if (abs >= 100000) return `${(v / 100000).toFixed(1)}L`;
    if (abs >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return String(v);
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = ['2022', '2023', '2024', '2025', '2026'];

/* ── Custom plugin for center text in Doughnut ── */
const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: (chart) => {
        if (chart.config.type !== 'doughnut') return;
        const config = chart.config.options?.plugins?.centerText;
        if (!config) return;

        const { width, height, ctx } = chart;
        ctx.save();
        const fontSize = (height / 140).toFixed(1);
        ctx.font = `900 ${fontSize}em Inter`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        const text = config.text || '';
        const label = config.label || '';
        const x = width / 2;
        const y = height / 2;

        ctx.fillStyle = '#8b91b0';
        ctx.font = `600 0.8em Inter`;
        ctx.fillText(label, x, y - 10);

        ctx.fillStyle = config.color || '#fff';
        ctx.font = `900 1.2em Inter`;
        ctx.fillText(text, x, y + 10);
        ctx.restore();
    }
};

ChartJS.register(
    CategoryScale, LinearScale, BarElement, PointElement, LineElement,
    ArcElement, Tooltip, Legend, Filler, centerTextPlugin
);

/* ── Circular progress ring (SVG) ── */
function CircleRing({ pct, color, size = 68, stroke = 8 }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    const gradId = `vibrant-ring-${color.replace('#', '')}`;

    return (
        <svg width={size} height={size} className="circle-ring" style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="50%" stopColor={color} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={color} />
                </linearGradient>
                <filter id="ring-3d-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            {/* Outer shadow path for depth */}
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke="rgba(0,0,0,0.3)" strokeWidth={stroke + 2} filter="blur(2px)" />
            {/* Background track */}
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke="var(--bg-input)" strokeWidth={stroke} opacity="0.4" />
            {/* Active progress ring with bevel/glow */}
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={`url(#${gradId})`} strokeWidth={stroke}
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                filter="url(#ring-3d-glow)"
                style={{
                    transition: 'stroke-dashoffset 2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
                transform={`rotate(-90 ${size / 2} ${size / 2})`} />
            {/* Inner highlight for 3D bevel */}
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke="rgba(255,255,255,0.2)" strokeWidth={stroke / 3}
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
            {/* Percentage text */}
            <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
                fill="var(--text)" fontSize="14" fontWeight="900"
                style={{ letterSpacing: '-0.5px', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                {pct}%
            </text>
        </svg>
    );
}



export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { isCouple } = useContext(CoupleContext);
    const { isDark } = useTheme();
    const [scope, setScope] = useState('Combined');
    const [chartPeriod, setChartPeriod] = useState('monthly');
    const [chartWeekIdx, setChartWeekIdx] = useState(0);
    const [balView, setBalView] = useState('pie');
    const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [catType, setCatType] = useState('Expense');
    const [allCategories, setAllCategories] = useState([]);
    const [currentCategories, setCurrentCategories] = useState([]);
    const [account, setAccount] = useState('All Accounts');
    const [selectedCat, setSelectedCat] = useState(null);
    const [showCatModal, setShowCatModal] = useState(false);
    const [catModalTransactions, setCatModalTransactions] = useState([]);
    const [catModalLoading, setCatModalLoading] = useState(false);
    const [catPage, setCatPage] = useState(0);
    const CATS_PER_PAGE = 6;
    const [totalInvestments, setTotalInvestments] = useState(0);

    // Health Formula State
    const [healthThresholds, setHealthThresholds] = useState(() => {
        const saved = localStorage.getItem('health_formula_v2');
        return saved ? JSON.parse(saved) : {
            targetSavingsRate: 30,
            targetEFMonths: 6,
            targetInvRatio: 15,
            caution: 60,
            danger: 40 // Lower is worse now as it's a score out of 100
        };
    });
    const [showHealthModal, setShowHealthModal] = useState(false);
    const [tempThresholds, setTempThresholds] = useState(healthThresholds);

    // ── AI Health Logic (Must be above early return) ──
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const daysRemaining = daysInMonth - dayOfMonth;

    const healthStats = useMemo(() => {
        if (!data || loading) return null;

        const income = data.totalIncome || 0;
        const netIncome = Math.max(0, income);
        const expense = data.totalExpense || 0;
        const balance = data.currentBalance || 0;
        const budgetData = data.budgetVsActual || [];

        // 1. Savings Rate (Max 40 pts)
        const savings = netIncome - expense;
        const savingsRate = netIncome > 0 ? (savings / netIncome) : 0;
        const savingsScore = Math.min(40, Math.max(0, (savingsRate / (healthThresholds.targetSavingsRate / 100)) * 40));

        // 2. Budget Adherence (Max 30 pts) — 0 when no budgets (don't award free points)
        const totalBudgets = budgetData.length;
        const underBudget = budgetData.filter(b => (b.actualSpent || 0) <= (b.budgetAmount || 0)).length;
        const budgetScore = totalBudgets > 0 ? (underBudget / totalBudgets) * 30 : 0;

        // 3. Emergency Fund (Max 20 pts)
        // Use rolling average of prior months when current month has no expense data
        const monthlySummary = data.monthlySummary || [];
        const avgFromHistory = monthlySummary.length > 0
            ? monthlySummary.reduce((sum, m) => sum + (m.expense || 0), 0) / monthlySummary.length
            : 0;
        const monthlyExp = expense > 0 ? expense : (avgFromHistory > 0 ? avgFromHistory : Math.max(balance * 0.1, 1));
        const efMonths = balance / monthlyExp;
        const efScore = Math.min(20, Math.max(0, (efMonths / healthThresholds.targetEFMonths) * 20));

        // 4. Investment Ratio (Max 10 pts)
        const avgIncomeFromHistory = monthlySummary.length > 0
            ? monthlySummary.reduce((sum, m) => sum + (m.income || 0), 0) / monthlySummary.length
            : 0;
        const refIncome = netIncome > 0 ? netIncome : avgIncomeFromHistory;
        const invRatio = refIncome > 0 ? (totalInvestments / refIncome) : 0;
        const invScore = Math.min(10, Math.max(0, (invRatio / (healthThresholds.targetInvRatio / 100)) * 10));

        const totalScore = Math.round(savingsScore + budgetScore + efScore + invScore);

        let riskValue = 'safe';
        if (totalScore < healthThresholds.danger) riskValue = 'exceeded';
        else if (totalScore < healthThresholds.caution) riskValue = 'caution';

        const RISK_CONFIG = {
            safe: { label: 'Excellent', color: '#10b981', icon: <FiCheckCircle />, bg: 'rgba(16,185,129,0.08)' },
            caution: { label: 'Good', color: '#f59e0b', icon: <FiAlertTriangle />, bg: 'rgba(245,158,11,0.08)' },
            exceeded: { label: 'At Risk', color: '#ef4444', icon: <FiAlertCircle />, bg: 'rgba(239,68,68,0.08)' },
        };

        return {
            totalScore, risk: riskValue, config: RISK_CONFIG[riskValue],
            breakdown: { savingsRate, budgetScore, efMonths, invRatio }
        };
    }, [data, loading, healthThresholds, totalInvestments]);

    // Live preview score — recomputes instantly as sliders move (uses tempThresholds)
    const previewStats = useMemo(() => {
        if (!data || loading) return null;

        const income = data.totalIncome || 0;
        const netIncome = Math.max(0, income);
        const expense = data.totalExpense || 0;
        const balance = data.currentBalance || 0;
        const budgetData = data.budgetVsActual || [];

        const savings = netIncome - expense;
        const savingsRate = netIncome > 0 ? (savings / netIncome) : 0;
        const savingsScore = Math.min(40, Math.max(0, (savingsRate / (tempThresholds.targetSavingsRate / 100)) * 40));

        const totalBudgets = budgetData.length;
        const underBudget = budgetData.filter(b => (b.actualSpent || 0) <= (b.budgetAmount || 0)).length;
        const budgetScore = totalBudgets > 0 ? (underBudget / totalBudgets) * 30 : 0;

        const monthlySummary = data.monthlySummary || [];
        const avgFromHistory = monthlySummary.length > 0
            ? monthlySummary.reduce((sum, m) => sum + (m.expense || 0), 0) / monthlySummary.length
            : 0;
        const monthlyExp = expense > 0 ? expense : (avgFromHistory > 0 ? avgFromHistory : Math.max(balance * 0.1, 1));
        const efMonths = balance / monthlyExp;
        const efScore = Math.min(20, Math.max(0, (efMonths / tempThresholds.targetEFMonths) * 20));

        const avgIncomeFromHistory = monthlySummary.length > 0
            ? monthlySummary.reduce((sum, m) => sum + (m.income || 0), 0) / monthlySummary.length
            : 0;
        const refIncome = netIncome > 0 ? netIncome : avgIncomeFromHistory;
        const invRatio = refIncome > 0 ? (totalInvestments / refIncome) : 0;
        const invScore = Math.min(10, Math.max(0, (invRatio / (tempThresholds.targetInvRatio / 100)) * 10));

        const totalScore = Math.round(savingsScore + budgetScore + efScore + invScore);

        let riskValue = 'safe';
        if (totalScore < tempThresholds.danger) riskValue = 'exceeded';
        else if (totalScore < tempThresholds.caution) riskValue = 'caution';

        const RISK_CONFIG = {
            safe: { label: 'Excellent', color: '#10b981', icon: <FiCheckCircle />, bg: 'rgba(16,185,129,0.08)' },
            caution: { label: 'Good', color: '#f59e0b', icon: <FiAlertTriangle />, bg: 'rgba(245,158,11,0.08)' },
            exceeded: { label: 'At Risk', color: '#ef4444', icon: <FiAlertCircle />, bg: 'rgba(239,68,68,0.08)' },
        };

        return { totalScore, risk: riskValue, config: RISK_CONFIG[riskValue] };
    }, [data, loading, tempThresholds, totalInvestments]);

    useEffect(() => {
        const monthMap = { 'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12 };
        const mIdx = monthMap[month];

        const params = { month: mIdx, year, scope };
        if (account !== 'All Accounts') {
            params.accountId = account;
        }

        setLoading(true);
        api.get('/dashboard', { params }).then((res) => {
            setData(res.data);
            if (res.data?.categoryWiseSpending) {
                const palette = ['#c084fc', '#818cf8', '#f59e0b', '#ec4899', '#6366f1', '#10b981', '#475569', '#3b82f6', '#ef4444', '#f472b6', '#a78bfa'];
                const mapped = res.data.categoryWiseSpending.map((c, idx) => ({
                    label: c.categoryName,
                    icon: c.icon || '❔',
                    color: palette[idx % palette.length],
                    share: c.percentage || 0,
                    id: c.categoryId,
                    categoryType: c.categoryType
                }));
                setCurrentCategories(mapped);
            }
            setLoading(false);
        }).catch(() => setLoading(false));

        api.get('/category').then((res) => {
            setAllCategories(res.data);
        });

        api.get('/investment', { params: { scope } }).then((res) => {
            const total = res.data.reduce((acc, cur) => acc + (cur.investedAmount || 0), 0);
            setTotalInvestments(total);
        }).catch(() => { });
    }, [month, year, account, scope]);



    useEffect(() => {
        if (showCatModal && selectedCat) {
            const monthMap = { 'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12 };
            const mIdx = monthMap[month] - 1; // Date constructor months are 0-indexed
            const startDate = (year && !isNaN(mIdx)) ? new Date(year, mIdx, 1, 0, 0, 0, 0) : null;
            const endDate = (year && !isNaN(mIdx)) ? new Date(year, mIdx + 1, 0, 23, 59, 59, 999) : null;

            if (!startDate || isNaN(startDate.getTime())) {
                setCatModalLoading(false);
                return;
            }

            setCatModalLoading(true);
            api.get('/transaction', {
                params: {
                    categoryId: selectedCat.id,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    type: catType,
                    scope
                }
            }).then(res => {
                const filtered = (res.data || []).filter(t =>
                    (t.type || '').toLowerCase() === catType.toLowerCase()
                );
                setCatModalTransactions(filtered);
                setCatModalLoading(false);
            }).catch(() => setCatModalLoading(false));
        }
    }, [showCatModal, selectedCat, month, year, catType]);

    const catModalData = selectedCat ? {
        transactions: (catModalTransactions || []).map(t => ({
            date: t.date ? new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '---',
            desc: t.description || t.title || 'Spending',
            amount: t.amount || 0,
            type: t.type || catType
        })),
        total: (catModalTransactions || []).reduce((acc, curr) => acc + (curr.amount || 0), 0)
    } : null;

    if (loading) return <div className="page-loader">Loading dashboard…</div>;

    /* values */
    const income = data?.totalIncome ?? 0;
    const expense = data?.totalExpense ?? 0;
    const balance = data?.currentBalance ?? 0;
    const total = income > 0 ? income : (expense > 0 ? expense + Math.abs(balance) : 0);
    const hasData = total > 0;
    const balPct = hasData ? Math.min(100, Math.round(Math.abs(balance / total) * 100)) : 0;
    const expPct = hasData ? Math.min(100, Math.round((expense / total) * 100)) : 0;
    const incPct = hasData ? Math.min(100, Math.round((income / total) * 100)) : 0;

    /* chart.js color helpers */
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const tickColor = isDark ? '#6b7394' : '#7c8298';
    const ttBg = isDark ? 'rgba(20,24,33,0.95)' : 'rgba(255,255,255,0.96)';
    const ttText = isDark ? '#c8cad0' : '#1a1d28';
    const ttBorder = isDark ? 'rgba(42,49,72,0.5)' : 'rgba(0,0,0,0.08)';

    const baseTooltip = {
        backgroundColor: ttBg, titleColor: ttText, bodyColor: ttText,
        borderColor: ttBorder, borderWidth: 1, padding: 10, cornerRadius: 8,
        titleFont: { size: 11, weight: '500', family: 'Inter' },
        bodyFont: { size: 10, family: 'Inter' },
    };

    /* ── line chart data (Dynamic) ── */
    const monthlyTrend = data?.monthlyTrend || [];
    const weeksInMonth = Math.ceil(monthlyTrend.length / 7) || 1;
    const validWeekIdx = Math.min(chartWeekIdx, weeksInMonth - 1);

    let activeTrendLabels = [];
    let activeTrendExpense = [];
    let activeTrendIncome = [];
    let chartTitle = 'This Month';

    if (chartPeriod === 'monthly') {
        activeTrendLabels = monthlyTrend.map(t => t.day);
        activeTrendExpense = monthlyTrend.map(t => t.expense);
        activeTrendIncome = monthlyTrend.map(t => t.income);
        chartTitle = `This Month (${month})`;
    } else {
        const startIdx = validWeekIdx * 7;
        const weekSlice = monthlyTrend.slice(startIdx, startIdx + 7);
        activeTrendLabels = weekSlice.map(t => `Day ${t.day}`);
        activeTrendExpense = weekSlice.map(t => t.expense);
        activeTrendIncome = weekSlice.map(t => t.income);
        chartTitle = `Week ${validWeekIdx + 1} of ${month}`;
    }

    const weekLineData = {
        labels: activeTrendLabels,
        datasets: [
            {
                label: 'Expense',
                data: activeTrendExpense,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239,68,68,0.08)',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: '#ef4444',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Income',
                data: activeTrendIncome,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16,185,129,0.08)',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: '#10b981',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const weekChartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: baseTooltip },
        scales: {
            x: { grid: { display: false }, border: { display: false }, ticks: { color: tickColor, font: { size: 10, family: 'Inter' } } },
            y: { display: false, beginAtZero: true },
        },
    };

    /* ── donut / balance chart (Account Breakdown) ── */
    const palette = ['#6366f1', '#818cf8', '#a5b4fc', '#c084fc', '#ec4899', '#f59e0b', '#10b981'];
    const accountBalances = data?.accounts?.map(a => a.balance) || [];
    const accountLabels = data?.accounts?.map(a => a.name) || [];

    const donutData = {
        labels: accountLabels.length ? accountLabels : ['Balance'],
        datasets: [{
            data: accountBalances.length ? accountBalances : [balance || 1],
            backgroundColor: (accountLabels.length ? accountLabels : ['Balance']).map((_, i) => palette[i % palette.length]),
            borderWidth: 0,
            hoverOffset: 8,
        }],
    };

    const donutOptions = {
        responsive: true, maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
            legend: { display: false },
            tooltip: { ...baseTooltip, callbacks: { label: (c) => ` ${c.label}: ₹${(c.raw).toLocaleString('en-IN')}` } },
            centerText: {
                label: 'TOTAL',
                text: `₹${fmt(balance)}`,
                color: '#fff'
            }
        },
    };

    const recent = data?.recentTransactions || [];
    const upcoming = data?.upcomingReminders || [];

    const handleSaveThresholds = () => {
        setHealthThresholds(tempThresholds);
        localStorage.setItem('health_formula_v2', JSON.stringify(tempThresholds));
        setShowHealthModal(false);
    };

    return (
        <div className="dash-new">
            {/* ── Top Header ── */}
            <div className="dash-top-bar">
                <h1 className="dash-title">Expense Dashboard</h1>
                <div className="dash-filters">
                    <select className="dash-filter-select" value={account} onChange={e => setAccount(e.target.value)}>
                        <option value="All Accounts">All Accounts</option>
                        {data?.accounts?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <select className="dash-filter-select" value={month} onChange={e => setMonth(e.target.value)}>
                        {MONTHS.map(m => <option key={m}>{m}</option>)}
                    </select>
                    <select className="dash-filter-select" value={year} onChange={e => setYear(e.target.value)}>
                        {YEARS.map(y => <option key={y}>{y}</option>)}
                    </select>
                    {isCouple && (
                        <select className="dash-filter-select" style={{ background: 'var(--primary-color)', color: 'white', border: 'none' }} value={scope} onChange={e => setScope(e.target.value)}>
                            <option value="Mine">Mine</option>
                            <option value="Partner">Partner</option>
                            <option value="Combined">Combined</option>
                        </select>
                    )}
                    <button className="dash-filter-icon-btn"><FiRefreshCw /></button>
                    <Link to="/wealth" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(99,102,241,0.2)', whiteSpace: 'nowrap' }}>
                        <FiPieChart /> Wealth Dashboard
                    </Link>
                </div>
            </div>

            {/* ── Stat Cards Row ── */}
            <div className="dash-stat-row" style={{ marginBottom: '24px' }}>
                <div className="dash-stat-card dash-stat-balance">
                    <div className="dash-stat-info">
                        <p className="dash-stat-label">Balance</p>
                        <p className="dash-stat-sub">{data?.totalTransactionCount ?? 0} Transactions</p>
                        <p className="dash-stat-amount">₹{fmt(balance)}</p>
                    </div>
                    <CircleRing pct={balPct} color="#818cf8" size={80} stroke={6} />
                </div>
                <div className="dash-stat-card dash-stat-expense">
                    <div className="dash-stat-info">
                        <p className="dash-stat-label">Expense</p>
                        <p className="dash-stat-sub">{data?.expenseCount ?? 0} Transactions</p>
                        <p className="dash-stat-amount">-₹{fmt(expense)}</p>
                    </div>
                    <CircleRing pct={expPct} color="#ef4444" size={80} stroke={6} />
                </div>
                <div className="dash-stat-card dash-stat-income">
                    <div className="dash-stat-info">
                        <p className="dash-stat-label">Income</p>
                        <p className="dash-stat-sub">{data?.incomeCount ?? 0} Transactions</p>
                        <p className="dash-stat-amount">+₹{fmt(income)}</p>
                    </div>
                    <CircleRing pct={incPct} color="#10b981" size={80} stroke={6} />
                </div>

                {/* Relocated Health Card at the end of Row 2 */}
                {healthStats && (
                    <div
                        className="ai-stat-card ai-stat-health"
                        style={{ cursor: 'pointer', margin: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: '18px 22px', background: 'rgba(30,35,50,0.6)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.12)' }}
                        onClick={() => {
                            setTempThresholds(healthThresholds);
                            setShowHealthModal(true);
                        }}
                    >
                        <div className="ai-stat-bg-icon" style={{ top: '10px', right: '10px', opacity: 0.15 }}><FiShield /></div>
                        <p className="ai-stat-label" style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Financial Health</p>
                        <h2 className="ai-stat-value" style={{ fontSize: '1.8rem', margin: '4px 0', fontWeight: 800 }}>{healthStats.totalScore}</h2>
                        <div className="ai-health-badge" style={{ background: healthStats.config.bg, color: healthStats.config.color, padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                            {healthStats.config.icon} {healthStats.config.label}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Middle 3-col: Categories | Statistics | Reminders ── */}
            <div className="dash-mid-grid">
                {/* Categories */}
                <div className="dash-panel">
                    <div className="dash-panel-header">
                        <span className="dash-panel-title"><FiGrid /> Categories</span>
                        <div className="dash-chart-toggle">
                            <button
                                className={`dash-toggle-btn ${catType === 'Expense' ? 'active-toggle' : ''}`}
                                onClick={() => { setCatType('Expense'); setCatPage(0); }}
                            >Expenses</button>
                            <button
                                className={`dash-toggle-btn ${catType === 'Income' ? 'active-toggle' : ''}`}
                                onClick={() => { setCatType('Income'); setCatPage(0); }}
                            >Incomes</button>
                        </div>
                    </div>
                    <div className="category-treemap">
                        {(() => {
                            const filtered = currentCategories.filter(c => c.categoryType === catType);
                            const totalPages = Math.ceil(filtered.length / CATS_PER_PAGE);
                            const displayCats = filtered.slice(catPage * CATS_PER_PAGE, (catPage + 1) * CATS_PER_PAGE);

                            if (filtered.length === 0) {
                                return (
                                    <p style={{ textAlign: 'center', opacity: 0.5, padding: '20px', gridColumn: '1 / -1' }}>
                                        No categories for this period
                                    </p>
                                );
                            }

                            return (
                                <>
                                    {displayCats.map((t) => (
                                        <div key={t.label}
                                            className="cat-tile"
                                            onClick={() => {
                                                setSelectedCat(t);
                                                setShowCatModal(true);
                                            }}
                                            style={{ background: `linear-gradient(135deg, ${t.color}20, ${t.color}05)`, borderColor: `${t.color}40`, backdropFilter: 'blur(8px)' }}>
                                            <span className="cat-tile-icon">{t.icon}</span>
                                            <div className="cat-tile-info">
                                                <span className="cat-tile-label">{t.label}</span>
                                                <span className="cat-tile-pct" style={{ color: t.color }}>{t.share}%</span>
                                            </div>
                                        </div>
                                    ))}
                                    {totalPages > 1 && (
                                        <div className="cat-pagination">
                                            <button
                                                className="cat-nav-btn"
                                                disabled={catPage === 0}
                                                onClick={() => setCatPage(prev => Math.max(0, prev - 1))}
                                            >
                                                <FiChevronLeft />
                                            </button>
                                            <div className="cat-dots">
                                                {[...Array(totalPages)].map((_, i) => (
                                                    <span
                                                        key={i}
                                                        className={`cat-dot ${catPage === i ? 'active' : ''}`}
                                                        onClick={() => setCatPage(i)}
                                                    />
                                                ))}
                                            </div>
                                            <button
                                                className="cat-nav-btn"
                                                disabled={catPage === totalPages - 1}
                                                onClick={() => setCatPage(prev => Math.min(totalPages - 1, prev + 1))}
                                            >
                                                <FiChevronRight />
                                            </button>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>

                {/* Statistics */}
                <div className="dash-panel">
                    <div className="dash-panel-header">
                        <span className="dash-panel-title"><FiTrendingUp /> Statistics</span>
                        <div className="dash-chart-toggle">
                            <button className={`dash-toggle-btn ${chartPeriod === 'monthly' ? 'active-toggle' : ''}`}
                                onClick={() => setChartPeriod('monthly')}>Monthly</button>
                            <button className={`dash-toggle-btn ${chartPeriod === 'weekly' ? 'active-toggle' : ''}`}
                                onClick={() => { setChartPeriod('weekly'); setChartWeekIdx(0); }}>Weekly</button>
                        </div>
                    </div>

                    <div className="dash-stat-period-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <p className="dash-stat-period" style={{ margin: 0 }}>{chartTitle}</p>
                        {chartPeriod === 'weekly' && weeksInMonth > 1 && (
                            <div className="chart-week-nav" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button className="cat-nav-btn" style={{ width: 24, height: 24, padding: 0, minHeight: 24 }} disabled={validWeekIdx === 0} onClick={() => setChartWeekIdx(Math.max(0, validWeekIdx - 1))}><FiChevronLeft size={14} /></button>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>W{validWeekIdx + 1}/{weeksInMonth}</span>
                                <button className="cat-nav-btn" style={{ width: 24, height: 24, padding: 0, minHeight: 24 }} disabled={validWeekIdx === weeksInMonth - 1} onClick={() => setChartWeekIdx(Math.min(weeksInMonth - 1, validWeekIdx + 1))}><FiChevronRight size={14} /></button>
                            </div>
                        )}
                    </div>

                    <div style={{ height: '180px', marginTop: '10px' }}>
                        <Line data={weekLineData} options={weekChartOptions} />
                    </div>
                    <div className="dash-chart-legend">
                        <span><span className="legend-dot" style={{ background: '#ef4444' }} />Expense</span>
                        <span><span className="legend-dot" style={{ background: '#10b981' }} />Income</span>
                    </div>
                </div>

                {/* Reminders & Upcoming */}
                <div className="dash-panel">
                    <div className="dash-panel-header">
                        <span className="dash-panel-title"><FiBell /> Reminders & Upcoming</span>
                        <Link to="/reminders" className="dash-see-all"><FiPlus /></Link>
                    </div>
                    <div className="reminder-list">
                        {/* Only show actual reminders, not recent history */}
                        {upcoming.slice(0, 4).map((item, i) => {
                            const palette = ['#6366f1', '#818cf8', '#a5b4fc', '#ec4899'];
                            const displayTitle = item.title || item.description || 'Activity';
                            const displayDate = item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Unknown';
                            const amt = item.amount || 0;
                            return (
                                <div key={i} className="reminder-item-premium">
                                    <div className="reminder-row-header">
                                        <span className="reminder-dot" style={{ background: palette[i % palette.length] }} />
                                        <span className="reminder-date-small">{displayDate}</span>
                                    </div>
                                    <div className="reminder-row-content">
                                        <span className="reminder-text-bold">{displayTitle}</span>
                                        <span className="reminder-amt-pill" style={{
                                            background: (item.type === 'Income') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                            color: (item.type === 'Income') ? '#10b981' : '#ef4444'
                                        }}>
                                            {(item.type === 'Income') ? '+' : '-'}₹{Math.abs(amt).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        {upcoming.length === 0 && <p style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>No reminders or upcoming items</p>}
                    </div>
                </div>
            </div>

            {/* ── Bottom Section: Transactions | Balance | Budgets ── */}
            <div className="dash-bottom-row-3col premium-bottom-layout">
                {/* Transactions */}
                <div className="dash-panel dash-transactions-panel">
                    <div className="dash-panel-header">
                        <span className="dash-panel-title"><FiRefreshCw /> Recent Activity</span>
                        <Link to="/transactions" className="dash-see-all">View All <FiChevronRight /></Link>
                    </div>
                    <div className="dash-tx-list-slim">
                        {recent.slice(0, 4).map((tx, i) => {
                            const amt = tx.amount ?? 0;
                            const displayDate = tx.date ? new Date(tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Unknown';
                            return (
                                <div key={i} className="dash-tx-row-slim">
                                    <div className="dash-tx-icon-circle">{tx.icon || (tx.categoryName ? tx.categoryName[0] : '💳')}</div>
                                    <div className="dash-tx-info-slim">
                                        <p className="dash-tx-title-slim">{tx.title || tx.description || 'Transaction'}</p>
                                        <p className="dash-tx-sub-slim">{displayDate}</p>
                                    </div>
                                    <p className="dash-tx-amount-slim" style={{ color: tx.type === 'Income' ? '#10b981' : '#ef4444' }}>
                                        {tx.type === 'Income' ? '+' : '-'}₹{Math.abs(amt).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            );
                        })}
                        {recent.length === 0 && <p style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>No recent activity</p>}
                    </div>
                </div>

                {/* Balance Donut Section - LARGER & CENTERED */}
                <div className="dash-panel dash-balance-center-panel">
                    <div className="dash-panel-header">
                        <span className="dash-panel-title"><FiDollarSign /> Net Balance</span>
                        <div className="dash-chart-toggle">
                            <button className={`dash-toggle-btn ${balView === 'pie' ? 'active-toggle' : ''}`}
                                onClick={() => setBalView('pie')}>Donut</button>
                            <button className={`dash-toggle-btn ${balView === 'bar' ? 'active-toggle' : ''}`}
                                onClick={() => setBalView('bar')}>Growth</button>
                        </div>
                    </div>
                    <div className="dash-balance-content-maximized">
                        <div className="dash-chart-wrapper-premium">
                            {balView === 'pie' ? (
                                <Doughnut data={donutData} options={{ ...donutOptions, cutout: '82%' }} />
                            ) : (
                                <Bar
                                    data={{
                                        labels: donutData.labels,
                                        datasets: [{
                                            ...donutData.datasets[0],
                                            borderRadius: 12,
                                            maxBarThickness: 50
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false }, tooltip: baseTooltip },
                                        scales: {
                                            x: { grid: { display: false }, border: { display: false }, ticks: { color: tickColor, font: { size: 11, family: 'Inter', weight: '600' } } },
                                            y: { display: false, beginAtZero: true },
                                        }
                                    }}
                                />
                            )}
                        </div>
                        <div className="dash-balance-legend-premium">
                            {donutData.labels.map((name, i) => (
                                <div key={name} className="dash-legend-pill">
                                    <span className="legend-dot-large" style={{ background: donutData.datasets[0].backgroundColor[i] }} />
                                    <span className="dash-legend-text">{name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Budgets Section */}
                <div className="dash-panel dash-budgets-panel">
                    <div className="dash-panel-header">
                        <span className="dash-panel-title"><FiBarChart2 /> Budgets</span>
                        <Link to="/budgets" className="dash-see-all">Manage <FiChevronRight /></Link>
                    </div>
                    <div className="dash-budget-list">
                        {(data?.budgetVsActual || []).slice(0, 3).map((b, idx) => {
                            const pct = Math.min(100, b.utilizationPercent || 0);
                            const icon = b.icon || (b.categoryName ? b.categoryName[0] : '📊');
                            const palette = ['#c084fc', '#818cf8', '#ec4899', '#f59e0b', '#6366f1'];
                            const color = palette[idx % palette.length];
                            return (
                                <div key={idx} className="dash-budget-item">
                                    <div className="dash-budget-info">
                                        <span className="dash-budget-name">{icon} {b.categoryName}</span>
                                        <span className="dash-budget-pct">{pct}%</span>
                                    </div>
                                    <div className="dash-budget-track">
                                        <div className="dash-budget-fill" style={{ width: `${pct}%`, background: color }} />
                                    </div>
                                    <div className="dash-budget-amounts">
                                        <span>₹{fmt(b.actualSpent)}</span>
                                        <span className="dash-budget-limit">of ₹{fmt(b.budgetAmount)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Category Details Modal ── */}
            {showCatModal && selectedCat && (
                <div className="cat-modal-overlay" onClick={() => setShowCatModal(false)}>
                    <div className="cat-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="cat-modal-header" style={{ borderBottomColor: `${selectedCat.color}30` }}>
                            <div className="cat-header-left">
                                <span className="cat-header-icon" style={{ background: `${selectedCat.color}20`, color: selectedCat.color }}>
                                    {selectedCat.icon}
                                </span>
                                <div>
                                    <h3 className="cat-modal-title">{selectedCat.label}</h3>
                                    <p className="cat-modal-subtitle">{month} {year}</p>
                                </div>
                            </div>
                            <div className="cat-header-right">
                                <span className="cat-modal-total">{catType === 'Income' ? '+' : '-'}₹{catModalData?.total?.toLocaleString()}</span>
                                <p className="cat-modal-total-label">{catType === 'Income' ? 'Total Earned' : 'Total Spent'}</p>
                            </div>
                        </div>

                        <div className="cat-modal-body">
                            <h4 className="cat-body-title">Transactions</h4>
                            <div className="cat-tx-list">
                                {catModalData?.transactions.map((tx, idx) => (
                                    <div key={idx} className="cat-tx-item">
                                        <div className="cat-tx-info">
                                            <p className="cat-tx-desc">{tx.desc}</p>
                                            <p className="cat-tx-date">{tx.date}</p>
                                        </div>
                                        <span className="cat-tx-amount" style={{ color: tx.type === 'Income' ? '#10b981' : '#ef4444' }}>
                                            {tx.type === 'Income' ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="cat-modal-close" onClick={() => setShowCatModal(false)}>Close</button>
                    </div>
                </div>
            )}

            {/* ── Health Formula Customization Modal (Premium) ── */}
            {showHealthModal && (
                <div className="health-modal-overlay" onClick={() => setShowHealthModal(false)}>
                    <div className="health-modal-premium" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="health-modal-header">
                            <div className="health-modal-header-icon">
                                <FiShield />
                            </div>
                            <div className="health-modal-header-text">
                                <h2>Customize Health Score</h2>
                                <p>Fine-tune your financial wellness targets</p>
                            </div>
                            <button className="health-modal-close" onClick={() => setShowHealthModal(false)}>
                                <FiPlus style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>

                        {/* Live Score Preview */}
                        <div className="health-modal-score-preview">
                            <div className="health-modal-score-ring">
                                <svg width="72" height="72" viewBox="0 0 72 72">
                                    <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                                    <circle cx="36" cy="36" r="30" fill="none" stroke="url(#hms-grad)" strokeWidth="6"
                                        strokeDasharray={`${2 * Math.PI * 30}`}
                                        strokeDashoffset={`${2 * Math.PI * 30 * (1 - Math.min(100, (previewStats?.totalScore ?? 0)) / 100)}`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 36 36)"
                                        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                                    />
                                    <defs>
                                        <linearGradient id="hms-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#818cf8" />
                                            <stop offset="100%" stopColor="#c084fc" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <span className="health-modal-score-num">{previewStats?.totalScore ?? 0}</span>
                            </div>
                            <div className="health-modal-score-meta">
                                <span className="health-modal-score-label">Live Score Preview</span>
                                <span className="health-modal-score-status" style={{ color: previewStats?.config?.color ?? '#818cf8' }}>
                                    {previewStats?.config?.icon} {previewStats?.config?.label ?? 'Calculating...'}
                                </span>
                                <p className="health-modal-score-hint">Adjust sliders to see live preview</p>
                            </div>
                        </div>

                        {/* Sliders */}
                        <div className="health-modal-sliders">
                            {/* Savings Rate */}
                            <div className="health-slider-group">
                                <div className="health-slider-top">
                                    <div className="health-slider-label-wrap">
                                        <span className="health-slider-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>💰</span>
                                        <span className="health-slider-label">Target Savings Rate</span>
                                    </div>
                                    <span className="health-slider-value" style={{ color: '#818cf8' }}>{tempThresholds.targetSavingsRate}%</span>
                                </div>
                                <input type="range" min="5" max="50" step="5"
                                    value={tempThresholds.targetSavingsRate}
                                    onChange={(e) => setTempThresholds(p => ({ ...p, targetSavingsRate: parseInt(e.target.value) }))}
                                    className="health-range-input"
                                    style={{ background: `linear-gradient(to right, #6366f1 0%, #818cf8 ${((tempThresholds.targetSavingsRate - 5) / 45) * 100}%, rgba(255,255,255,0.08) ${((tempThresholds.targetSavingsRate - 5) / 45) * 100}%, rgba(255,255,255,0.08) 100%)` }}
                                />
                                <div className="health-slider-ticks">
                                    <span>5%</span><span>25%</span><span>50%</span>
                                </div>
                            </div>

                            {/* Emergency Fund */}
                            <div className="health-slider-group">
                                <div className="health-slider-top">
                                    <div className="health-slider-label-wrap">
                                        <span className="health-slider-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>🛡️</span>
                                        <span className="health-slider-label">Emergency Fund Target</span>
                                    </div>
                                    <span className="health-slider-value" style={{ color: '#10b981' }}>{tempThresholds.targetEFMonths}mo</span>
                                </div>
                                <input type="range" min="1" max="12" step="1"
                                    value={tempThresholds.targetEFMonths}
                                    onChange={(e) => setTempThresholds(p => ({ ...p, targetEFMonths: parseInt(e.target.value) }))}
                                    className="health-range-input"
                                    style={{ background: `linear-gradient(to right, #059669 0%, #10b981 ${((tempThresholds.targetEFMonths - 1) / 11) * 100}%, rgba(255,255,255,0.08) ${((tempThresholds.targetEFMonths - 1) / 11) * 100}%, rgba(255,255,255,0.08) 100%)` }}
                                />
                                <div className="health-slider-ticks">
                                    <span>1mo</span><span>6mo</span><span>12mo</span>
                                </div>
                            </div>

                            {/* Investment Ratio */}
                            <div className="health-slider-group">
                                <div className="health-slider-top">
                                    <div className="health-slider-label-wrap">
                                        <span className="health-slider-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>📈</span>
                                        <span className="health-slider-label">Target Investment Ratio</span>
                                    </div>
                                    <span className="health-slider-value" style={{ color: '#f59e0b' }}>{tempThresholds.targetInvRatio}%</span>
                                </div>
                                <input type="range" min="5" max="30" step="5"
                                    value={tempThresholds.targetInvRatio}
                                    onChange={(e) => setTempThresholds(p => ({ ...p, targetInvRatio: parseInt(e.target.value) }))}
                                    className="health-range-input"
                                    style={{ background: `linear-gradient(to right, #d97706 0%, #f59e0b ${((tempThresholds.targetInvRatio - 5) / 25) * 100}%, rgba(255,255,255,0.08) ${((tempThresholds.targetInvRatio - 5) / 25) * 100}%, rgba(255,255,255,0.08) 100%)` }}
                                />
                                <div className="health-slider-ticks">
                                    <span>5%</span><span>15%</span><span>30%</span>
                                </div>
                            </div>

                            {/* Excellent Threshold */}
                            <div className="health-slider-group">
                                <div className="health-slider-top">
                                    <div className="health-slider-label-wrap">
                                        <span className="health-slider-icon" style={{ background: 'rgba(236,72,153,0.15)', color: '#ec4899' }}>⭐</span>
                                        <span className="health-slider-label">"Excellent" Threshold (score ≥ this)</span>
                                    </div>
                                    <span className="health-slider-value" style={{ color: '#ec4899' }}>{tempThresholds.caution} pts</span>
                                </div>
                                <input type="range" min="10" max="90" step="5"
                                    value={tempThresholds.caution}
                                    onChange={(e) => setTempThresholds(p => ({ ...p, caution: parseInt(e.target.value) }))}
                                    className="health-range-input"
                                    style={{ background: `linear-gradient(to right, #be185d 0%, #ec4899 ${((tempThresholds.caution - 10) / 80) * 100}%, rgba(255,255,255,0.08) ${((tempThresholds.caution - 10) / 80) * 100}%, rgba(255,255,255,0.08) 100%)` }}
                                />
                                <div className="health-slider-ticks">
                                    <span>10</span><span>50</span><span>90</span>
                                </div>
                            </div>

                            {/* At Risk Threshold */}
                            <div className="health-slider-group">
                                <div className="health-slider-top">
                                    <div className="health-slider-label-wrap">
                                        <span className="health-slider-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>⚠️</span>
                                        <span className="health-slider-label">"At Risk" Threshold (score &lt; this)</span>
                                    </div>
                                    <span className="health-slider-value" style={{ color: '#ef4444' }}>{tempThresholds.danger} pts</span>
                                </div>
                                <input type="range" min="5" max="70" step="5"
                                    value={tempThresholds.danger}
                                    onChange={(e) => setTempThresholds(p => ({ ...p, danger: parseInt(e.target.value) }))}
                                    className="health-range-input"
                                    style={{ background: `linear-gradient(to right, #b91c1c 0%, #ef4444 ${((tempThresholds.danger - 5) / 65) * 100}%, rgba(255,255,255,0.08) ${((tempThresholds.danger - 5) / 65) * 100}%, rgba(255,255,255,0.08) 100%)` }}
                                />
                                <div className="health-slider-ticks">
                                    <span>5</span><span>35</span><span>70</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="health-modal-footer">
                            <button className="health-modal-btn health-modal-btn-cancel" onClick={() => setShowHealthModal(false)}>
                                Cancel
                            </button>
                            <button className="health-modal-btn health-modal-btn-save" onClick={handleSaveThresholds}>
                                <FiCheckCircle /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

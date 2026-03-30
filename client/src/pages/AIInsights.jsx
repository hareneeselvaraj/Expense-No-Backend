import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import {
    FiCpu, FiShield, FiAlertTriangle, FiTrendingDown, FiTarget,
    FiDollarSign, FiArrowDown, FiCheckCircle, FiAlertCircle, FiXCircle,
    FiTrendingUp
} from 'react-icons/fi';
import InvestmentAnalysis from '../components/InvestmentAnalysis';

const RISK_CONFIG = {
    safe: { label: 'Safe', color: '#10b981', icon: <FiCheckCircle />, bg: 'rgba(16,185,129,0.08)' },
    caution: { label: 'Caution', color: '#f59e0b', icon: <FiAlertTriangle />, bg: 'rgba(245,158,11,0.08)' },
    high: { label: 'High Risk', color: '#ef4444', icon: <FiAlertCircle />, bg: 'rgba(239,68,68,0.08)' },
    exceeded: { label: 'Exceeded', color: '#dc2626', icon: <FiXCircle />, bg: 'rgba(220,38,38,0.08)' },
};

function getRisk(pct) {
    if (pct >= 100) return 'exceeded';
    if (pct >= 80) return 'high';
    if (pct >= 60) return 'caution';
    return 'safe';
}

function fmt(v) {
    return `₹${(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function AIInsights() {
    const [tab, setTab] = useState('budget');
    const [budgets, setBudgets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [invLoading, setInvLoading] = useState(false);
    const [invLoaded, setInvLoaded] = useState(false);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const dayOfMonth = now.getDate();
    const daysRemaining = daysInMonth - dayOfMonth;

    // Load budget data on mount
    useEffect(() => {
        Promise.all([
            api.get(`/budget/month?year=${year}&month=${month}`),
            api.get(`/transaction?startDate=${year}-${String(month).padStart(2, '0')}-01&endDate=${year}-${String(month).padStart(2, '0')}-${daysInMonth}`),
        ]).then(([bRes, tRes]) => {
            setBudgets(bRes.data);
            setTransactions(tRes.data);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    // Load investment data when tab switches to investment (lazy load)
    useEffect(() => {
        if (tab === 'investment' && !invLoaded) {
            setInvLoading(true);
            api.get('/investment').then(res => {
                setInvestments(res.data);
                setInvLoaded(true);
            }).catch(() => { }).finally(() => setInvLoading(false));
        }
    }, [tab, invLoaded]);

    // ── Computed Insights ──
    const insights = useMemo(() => {
        // Budget monitoring
        const budgetInsights = budgets.map(b => {
            const pct = b.amount > 0 ? (b.spent / b.amount) * 100 : 0;
            const risk = getRisk(pct);
            const dailySpent = dayOfMonth > 0 ? b.spent / dayOfMonth : 0;
            const projected = dailySpent * daysInMonth;
            const projectedPct = b.amount > 0 ? (projected / b.amount) * 100 : 0;
            const projectedRisk = getRisk(projectedPct);
            const recommendedDaily = daysRemaining > 0 ? Math.max(0, b.remaining) / daysRemaining : 0;

            return {
                ...b, pct, risk, dailySpent, projected, projectedPct, projectedRisk, recommendedDaily,
            };
        });

        // Category spending (from transactions)
        const catMap = {};
        transactions.forEach(t => {
            if (t.type !== 'Expense') return;
            if (!catMap[t.categoryName]) catMap[t.categoryName] = { total: 0, count: 0 };
            catMap[t.categoryName].total += t.amount;
            catMap[t.categoryName].count += 1;
        });
        const categorySpending = Object.entries(catMap)
            .map(([name, v]) => ({ name, ...v, avg: v.total / v.count }))
            .sort((a, b) => b.total - a.total);

        // Overall
        const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
        const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
        const totalRemaining = totalBudget - totalSpent;
        const overallPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
        const overallRisk = getRisk(overallPct);
        const overallDailyLimit = daysRemaining > 0 ? Math.max(0, totalRemaining) / daysRemaining : 0;
        const overallProjected = dayOfMonth > 0 ? (totalSpent / dayOfMonth) * daysInMonth : 0;

        // Overspending alerts
        const alerts = budgetInsights
            .filter(b => b.projectedPct > 90)
            .sort((a, b) => b.projectedPct - a.projectedPct);

        return {
            budgetInsights, categorySpending, alerts,
            totalBudget, totalSpent, totalRemaining,
            overallPct, overallRisk, overallDailyLimit, overallProjected,
        };
    }, [budgets, transactions]);

    if (loading) return <div className="page-loader">Analyzing your finances…</div>;

    const { budgetInsights, categorySpending, alerts, totalBudget, totalSpent, totalRemaining, overallPct, overallRisk, overallDailyLimit, overallProjected } = insights;
    const overallCfg = RISK_CONFIG[overallRisk];
    const monthName = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title"><FiCpu /> AI Insights</h1>
                    <p className="ai-subtitle">Intelligent financial analysis for {monthName}</p>
                </div>
            </div>

            {/* ── Tab Bar ── */}
            <div className="inv-tabs">
                <button className={`inv-tab ${tab === 'budget' ? 'inv-tab-active' : ''}`} onClick={() => setTab('budget')}>
                    <FiShield /> Budget Analysis
                </button>
                <button className={`inv-tab ${tab === 'investment' ? 'inv-tab-active' : ''}`} onClick={() => setTab('investment')}>
                    <FiTrendingUp /> Investment Analysis
                </button>
            </div>

            {/* ═══════════ TAB 1: BUDGET ANALYSIS ═══════════ */}
            {tab === 'budget' && (
                <>
                    {/* ── Overview Stats ── */}
                    <div className="ai-stat-grid">
                        <div className="ai-stat-card ai-stat-health">
                            <div className="ai-stat-bg-icon"><FiShield /></div>
                            <p className="ai-stat-label">Overall Health</p>
                            <p className="ai-stat-value" style={{ color: overallCfg.color }}>
                                <span style={{ background: overallCfg.bg, color: overallCfg.color }} className="ai-health-badge">{overallCfg.icon} {overallCfg.label}</span>
                            </p>
                        </div>
                        <div className="ai-stat-card ai-stat-budget">
                            <div className="ai-stat-bg-icon"><FiTarget /></div>
                            <p className="ai-stat-label">Budget Used</p>
                            <p className="ai-stat-value">{overallPct.toFixed(0)}%</p>
                            <p className="ai-stat-sub">{fmt(totalSpent)} / {fmt(totalBudget)}</p>
                        </div>
                        <div className="ai-stat-card ai-stat-daily">
                            <div className="ai-stat-bg-icon"><FiDollarSign /></div>
                            <p className="ai-stat-label">Daily Limit</p>
                            <p className="ai-stat-value">{fmt(overallDailyLimit)}</p>
                            <p className="ai-stat-sub">{daysRemaining} days remaining</p>
                        </div>
                        <div className="ai-stat-card ai-stat-projected">
                            <div className="ai-stat-bg-icon"><FiTrendingDown /></div>
                            <p className="ai-stat-label">Projected Spend</p>
                            <p className="ai-stat-value">{fmt(overallProjected)}</p>
                            <p className="ai-stat-sub">Based on current pace</p>
                        </div>
                    </div>

                    {/* ── Predictive Overspending Alerts ── */}
                    {alerts.length > 0 && (
                        <div className="ai-section">
                            <h3 className="ai-section-title"><FiAlertTriangle /> Predictive Overspending Alerts</h3>
                            <div className="ai-alerts">
                                {alerts.map(a => {
                                    const cfg = RISK_CONFIG[a.projectedRisk];
                                    return (
                                        <div key={a.id} className="ai-alert-premium" style={{ borderLeftColor: cfg.color }}>
                                            <div className="ai-alert-top">
                                                <div>
                                                    <span className="ai-alert-cat">{a.categoryName}</span>
                                                    <span className="ai-alert-pct" style={{ color: cfg.color }}>{a.projectedPct.toFixed(0)}%</span>
                                                </div>
                                                <span className="ai-risk-badge" style={{ color: cfg.color, background: cfg.bg }}>
                                                    {cfg.icon} {cfg.label}
                                                </span>
                                            </div>
                                            <p className="ai-alert-msg">
                                                Projected to spend <strong>{fmt(a.projected)}</strong> against a budget of <strong>{fmt(a.amount)}</strong>
                                            </p>
                                            <div className="ai-bar-track">
                                                <div
                                                    className="ai-bar-fill"
                                                    style={{ width: `${Math.min(a.pct, 100)}%`, background: cfg.color }}
                                                />
                                            </div>
                                            <div className="ai-alert-footer">
                                                <span className="ai-alert-label">Spent: <strong>{fmt(a.spent)}</strong></span>
                                                <span className="ai-alert-label">Daily: <strong>{fmt(a.recommendedDaily)}</strong></span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Budget Monitoring ── */}
                    <div className="ai-section">
                        <h3 className="ai-section-title"><FiShield /> Budget Monitoring</h3>
                        {budgetInsights.length === 0 ? (
                            <p className="text-muted">No budgets set for this month. Create budgets to see insights.</p>
                        ) : (
                            <div className="ai-budget-cards-grid">
                                {budgetInsights.map((b, i) => {
                                    const cfg = RISK_CONFIG[b.risk];
                                    return (
                                        <div key={b.id} className="ai-budget-premium" style={{ '--ai-color': cfg.color, animationDelay: `${i * 0.08}s` }}>
                                            <div className="aibp-header">
                                                <div className="aibp-cat-info">
                                                    <span className="aibp-cat-icon" style={{ background: `${cfg.color}18`, color: cfg.color }}>
                                                        <FiShield />
                                                    </span>
                                                    <span className="aibp-cat-name">{b.categoryName}</span>
                                                </div>
                                                <span className="ai-risk-badge" style={{ background: cfg.bg, color: cfg.color }}>
                                                    {cfg.icon} {cfg.label}
                                                </span>
                                            </div>

                                            {/* Amount */}
                                            <div className="aibp-amounts">
                                                <span className="aibp-spent">{fmt(b.spent)}</span>
                                                <span className="aibp-pct" style={{ color: cfg.color }}>{b.pct.toFixed(0)}%</span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="ai-bar-track">
                                                <div className="ai-bar-fill" style={{ width: `${Math.min(b.pct, 100)}%`, background: cfg.color }} />
                                            </div>
                                            <div className="aibp-bar-label">
                                                <span className="aibp-label">Budget: {fmt(b.amount)}</span>
                                                <span className="aibp-label">Remaining: <strong style={{ color: b.remaining < 0 ? '#ef4444' : '#10b981' }}>{fmt(Math.max(0, b.remaining))}</strong></span>
                                            </div>

                                            {/* Footer */}
                                            <div className="aibp-footer">
                                                <div className="aibp-foot-item">
                                                    <span className="aibp-foot-label">Days Left</span>
                                                    <span className="aibp-foot-val">{daysRemaining}d</span>
                                                </div>
                                                <div className="aibp-foot-item">
                                                    <span className="aibp-foot-label">Daily Limit</span>
                                                    <span className="aibp-foot-val">{fmt(b.recommendedDaily)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ── Category Spending Insights ── */}
                    {categorySpending.length > 0 && (
                        <div className="ai-section">
                            <h3 className="ai-section-title"><FiArrowDown /> Top Spending Categories</h3>
                            <div className="ai-cat-cards-grid">
                                {categorySpending.slice(0, 6).map((c, i) => {
                                    const maxTotal = categorySpending[0].total;
                                    const pct = maxTotal > 0 ? (c.total / maxTotal) * 100 : 0;
                                    return (
                                        <div key={c.name} className="ai-cat-premium" style={{ animationDelay: `${i * 0.06}s` }}>
                                            <div className="aicp-top">
                                                <span className="aicp-name">{c.name}</span>
                                                <span className="aicp-total">{fmt(c.total)}</span>
                                            </div>
                                            <div className="ai-bar-track">
                                                <div className="ai-bar-fill ai-bar-indigo" style={{ width: `${pct}%` }} />
                                            </div>
                                            <div className="aicp-footer">
                                                <span className="aicp-label">{c.count} transactions</span>
                                                <span className="aicp-label">Avg: {fmt(c.avg)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ═══════════ TAB 2: INVESTMENT ANALYSIS ═══════════ */}
            {tab === 'investment' && (
                <>
                    {invLoading ? (
                        <div className="page-loader">Analyzing your investments…</div>
                    ) : (
                        <InvestmentAnalysis investments={investments} />
                    )}
                </>
            )}
        </div>
    );
}


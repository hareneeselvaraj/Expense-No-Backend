import { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import api from '../services/api';
import {
    FiPlus, FiTrash2, FiDollarSign, FiTrendingDown,
    FiCheckCircle, FiAlertTriangle, FiAlertCircle, FiXCircle,
    FiChevronLeft, FiChevronRight, FiX, FiShield
} from 'react-icons/fi';
import { useToast } from '../components/Toast';
import useDeviceDetect from '../hooks/useDeviceDetect';

import ConfirmModal from '../components/ConfirmModal';
import AIBudgetSetup from '../components/AIBudgetSetup';
import { CoupleContext } from '../context/CoupleContext';

const RISK_COLORS = {
    safe:     { color: '#10b981', label: 'Safe',      bg: 'rgba(16,185,129,0.12)',  icon: <FiCheckCircle /> },
    caution:  { color: '#f59e0b', label: 'Caution',   bg: 'rgba(245,158,11,0.12)', icon: <FiAlertTriangle /> },
    high:     { color: '#ef4444', label: 'High Risk', bg: 'rgba(239,68,68,0.12)',  icon: <FiAlertCircle /> },
    exceeded: { color: '#dc2626', label: 'Exceeded',  bg: 'rgba(220,38,38,0.12)',  icon: <FiXCircle /> },
};

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#8b5cf6', '#f97316'];

function getRisk(pct) {
    if (pct >= 100) return 'exceeded';
    if (pct >= 80)  return 'high';
    if (pct >= 60)  return 'caution';
    return 'safe';
}

function fmt(v) {
    return `₹${(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

// Simple SVG Donut Chart
function DonutChart({ budgets }) {
    const total = budgets.reduce((s, b) => s + (b.spent || 0), 0);
    if (total === 0) {
        return (
            <div className="budget-donut-empty">
                <FiDollarSign />
                <p>No spending data yet</p>
            </div>
        );
    }

    const size = 200;
    const cx = size / 2, cy = size / 2, r = 75;
    const circumference = 2 * Math.PI * r;

    let offset = 0;
    const slices = budgets
        .filter(b => b.spent > 0)
        .map((b, i) => {
            const fraction = b.spent / total;
            const dash = fraction * circumference;
            const slice = { id: b.id, name: b.categoryName, fraction, dash, offset, color: PIE_COLORS[i % PIE_COLORS.length] };
            offset += dash;
            return slice;
        });

    return (
        <div className="budget-donut-wrap">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="budget-donut-svg">
                {/* Background track */}
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-input)" strokeWidth="22" />
                {slices.map(s => (
                    <circle
                        key={s.id}
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={s.color}
                        strokeWidth="22"
                        strokeDasharray={`${s.dash} ${circumference}`}
                        strokeDashoffset={-s.offset}
                        strokeLinecap="butt"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'all 0.8s ease' }}
                    />
                ))}
                {/* Center text */}
                <text x={cx} y={cy - 8} textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--text)">{fmt(total)}</text>
                <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="var(--text-muted)">Total Spent</text>
            </svg>

            {/* Legend */}
            <div className="budget-donut-legend">
                {slices.map(s => (
                    <div key={s.id} className="donut-legend-item">
                        <span className="donut-legend-dot" style={{ background: s.color }} />
                        <span className="donut-legend-name">{s.name}</span>
                        <span className="donut-legend-pct">{(s.fraction * 100).toFixed(0)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Budgets() {
    const [allBudgets, setAllBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

    const now = new Date();
    const [viewYear,  setViewYear]  = useState(now.getFullYear());
    const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
    
    const { isCouple } = useContext(CoupleContext);
    const [scope, setScope] = useState('Combined');

    const [form, setForm] = useState({
        categoryId: '', amount: '', year: now.getFullYear(), month: now.getMonth() + 1,
    });
    const { isMobile } = useDeviceDetect(768);
    const toast = useToast();


    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [bRes, cRes] = await Promise.all([api.get('/budget', { params: { scope } }), api.get('/category')]);
            setAllBudgets(bRes.data);
            setCategories(cRes.data);
        } catch (err) {
            console.error('Failed to load budget data:', err);
            toast.error('Failed to load budgets. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }, [toast, scope]);
    useEffect(() => { load(); }, [load]);

    // Filter budgets by selected month/year
    const budgets = useMemo(
        () => allBudgets.filter(b => b.month === viewMonth && b.year === viewYear),
        [allBudgets, viewYear, viewMonth]
    );

    // Navigation
    const prevMonth = () => {
        if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    // Stats
    const totalBudget    = budgets.reduce((s, b) => s + (b.amount || 0), 0);
    const totalSpent     = budgets.reduce((s, b) => s + (b.spent  || 0), 0);
    const totalRemaining = totalBudget - totalSpent;
    const overallPct     = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const overallRisk    = getRisk(overallPct);
    const overallCfg     = RISK_COLORS[overallRisk];

    // Alerts (budgets >80% used)
    const alerts = budgets.filter(b => {
        const pct = b.amount > 0 ? (b.spent / b.amount) * 100 : 0;
        return pct >= 80 && !dismissedAlerts.has(b.id);
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post('/budget', { ...form, amount: parseFloat(form.amount), year: parseInt(form.year), month: parseInt(form.month) });
        setForm({ categoryId: '', amount: '', year: now.getFullYear(), month: now.getMonth() + 1 });
        setShowForm(false);
        toast.success('Budget created');
        load();
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/budget/${deleteTarget}`);
            toast.success('Budget deleted');
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error deleting budget');
        }
        setDeleteTarget(null);
    };

    const monthLabel = new Date(viewYear, viewMonth - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

    if (loading) return <div className="page-loader">Loading budgets…</div>;

    return (
        <div className="page">
            <ConfirmModal
                open={!!deleteTarget}
                title="Confirm Delete"
                message="Are you sure you want to delete this budget?"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ fontSize: isMobile ? '1.5rem' : '1.8rem' }}><FiShield /> Budgets</h1>

                    <p className="page-subtitle">Track and manage your monthly spending limits</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {isCouple && (
                        <select className="dash-filter-select" style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px' }} value={scope} onChange={e => setScope(e.target.value)}>
                            <option value="Mine">Mine</option>
                            <option value="Partner">Partner</option>
                            <option value="Combined">Combined</option>
                        </select>
                    )}
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        <FiPlus /> New Budget
                    </button>
                </div>
            </div>

            <AIBudgetSetup onApplied={load} />

            {/* Stat Cards */}
            <div className="budget-stat-row">
                <div className="budget-stat-card bsc-indigo">
                    <FiShield className="bsc-bg-icon" />
                    <p className="bsc-label">Total Budget</p>
                    <p className="bsc-value">{fmt(totalBudget)}</p>
                </div>
                <div className="budget-stat-card bsc-rose">
                    <FiTrendingDown className="bsc-bg-icon" />
                    <p className="bsc-label">Total Spent</p>
                    <p className="bsc-value">{fmt(totalSpent)}</p>
                </div>
                <div className="budget-stat-card bsc-emerald">
                    <FiDollarSign className="bsc-bg-icon" />
                    <p className="bsc-label">Remaining</p>
                    <p className="bsc-value">{fmt(Math.max(0, totalRemaining))}</p>
                </div>
                <div className="budget-stat-card bsc-amber">
                    <FiCheckCircle className="bsc-bg-icon" />
                    <p className="bsc-label">Overall Health</p>
                    <p className="bsc-value" style={{ fontSize: '1.1rem' }}>
                        <span className="budget-health-pill" style={{ background: overallCfg.bg, color: overallCfg.color }}>
                            {overallCfg.icon} {overallCfg.label}
                        </span>
                    </p>
                </div>
            </div>

            {/* Overspending Alerts */}
            {alerts.map(a => {
                const pct = Math.round((a.spent / a.amount) * 100);
                const cfg = RISK_COLORS[getRisk(pct)];
                return (
                    <div key={a.id} className="budget-alert-banner" style={{ borderLeftColor: cfg.color }}>
                        <span className="budget-alert-icon" style={{ color: cfg.color }}>{cfg.icon}</span>
                        <span className="budget-alert-msg">
                            <strong>{a.categoryName}</strong> is at <strong>{pct}%</strong> — you're close to exceeding your budget!
                        </span>
                        <button className="budget-alert-close" onClick={() => setDismissedAlerts(s => new Set(s).add(a.id))}>
                            <FiX />
                        </button>
                    </div>
                );
            })}

            {/* Month Selector */}
            <div className="budget-month-selector">
                <button className="bms-btn" onClick={prevMonth}><FiChevronLeft /></button>
                <span className="bms-label">{monthLabel}</span>
                <button className="bms-btn" onClick={nextMonth}><FiChevronRight /></button>
            </div>

            {/* Add Budget Form */}
            {showForm && (
                <div className="form-card" style={{ marginBottom: 24 }}>
                    <form onSubmit={handleSubmit} className="form-grid">
                        <div className="form-group">
                            <label>Category</label>
                            <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required>
                                <option value="">Select Category</option>
                                {categories.filter(c => c.type === 'Expense').map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Budget Amount</label>
                            <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Year</label>
                            <input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Month</label>
                            <select value={form.month} onChange={e => setForm({ ...form, month: e.target.value })}>
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">Create Budget</button>
                            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Main Content: Cards + Donut */}
            {budgets.length === 0 ? (
                <div className="budget-empty-state">
                    <div className="budget-empty-icon"><FiShield /></div>
                    <h3>No budgets for {monthLabel}</h3>
                    <p>Create a budget to start tracking your spending limits.</p>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <FiPlus /> Create First Budget
                    </button>
                </div>
            ) : (
                <div className="budget-main-layout">
                    {/* 2-column Budget Cards */}
                    <div className="budget-cards-col">
                        <div className="budget-cards-grid">
                            {budgets.map((b, i) => {
                                const pct = b.amount > 0 ? Math.min(100, Math.round((b.spent / b.amount) * 100)) : 0;
                                const risk = getRisk(pct);
                                const cfg = RISK_COLORS[risk];

                                return (
                                    <div key={b.id} className="budget-premium-card" style={{ '--bpc-color': cfg.color, animationDelay: `${i * 0.08}s` }}>
                                        <div className="bpc-header">
                                            <div className="bpc-cat-info">
                                                <span className="bpc-cat-icon" style={{ background: `${cfg.color}18`, color: cfg.color }}>
                                                    {PIE_COLORS[i % PIE_COLORS.length] && <FiShield />}
                                                </span>
                                                <span className="bpc-cat-name">{b.categoryName}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                <span className="bpc-risk-pill" style={{ background: cfg.bg, color: cfg.color }}>
                                                    {cfg.icon} {cfg.label}
                                                </span>
                                                <button className="btn-icon btn-danger" onClick={() => setDeleteTarget(b.id)} title="Delete">
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="bpc-bar-track" style={{ display: 'flex' }}>
                                            {isCouple && scope === 'Combined' ? (
                                                <>
                                                    <div className="bpc-bar-fill" style={{ width: `${b.amount > 0 ? Math.min(100, (b.mySpent / b.amount) * 100) : 0}%`, background: cfg.color, borderRight: '2px solid var(--bg-panel)' }} title={`My Spend: ${fmt(b.mySpent)}`} />
                                                    <div className="bpc-bar-fill" style={{ width: `${b.amount > 0 ? Math.min(100, (b.partnerSpent / b.amount) * 100) : 0}%`, background: '#8b5cf6', opacity: 0.8 }} title={`Partner Spend: ${fmt(b.partnerSpent)}`} />
                                                </>
                                            ) : (
                                                <div className="bpc-bar-fill" style={{ width: `${pct}%`, background: cfg.color }} />
                                            )}
                                        </div>
                                        <div className="bpc-bar-labels">
                                            <span>{fmt(b.spent)} spent</span>
                                            <span className="bpc-pct-pill" style={{ background: cfg.bg, color: cfg.color }}>{pct}% used</span>
                                        </div>

                                        {/* Footer */}
                                        <div className="bpc-footer">
                                            <div className="bpc-foot-item">
                                                <span className="bpc-foot-label">Budget</span>
                                                <span className="bpc-foot-val">{fmt(b.amount)}</span>
                                            </div>
                                            <div className="bpc-foot-item">
                                                <span className="bpc-foot-label">Remaining</span>
                                                <span className="bpc-foot-val" style={{ color: b.remaining < 0 ? '#ef4444' : '#10b981' }}>
                                                    {fmt(Math.max(0, b.remaining))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Donut Chart */}
                    <div className="budget-donut-col">
                        <div className="budget-donut-card">
                            <h3 className="budget-section-heading">Spending Distribution</h3>
                            <DonutChart budgets={budgets} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

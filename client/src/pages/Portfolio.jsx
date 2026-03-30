import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiPercent, FiFilter, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';

function fmt(v) {
    return `₹${(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
}

const SORT_OPTIONS = [
    { value: 'roi-desc', label: 'Highest Return' },
    { value: 'roi-asc', label: 'Lowest Return' },
    { value: 'invested-desc', label: 'Highest Invested' },
    { value: 'date-desc', label: 'Most Recent' },
];

export default function Portfolio() {
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('');
    const [sortBy, setSortBy] = useState('date-desc');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const toast = useToast();
    const { isDark } = useTheme();

    const load = () => api.get('/investment').then((res) => { setInvestments(res.data); setLoading(false); });
    useEffect(() => { load(); }, []);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/investment/${deleteTarget}`);
            toast.success('Investment deleted');
            load();
        } catch (err) { toast.error('Error deleting investment'); }
        setDeleteTarget(null);
    };

    // ── Dynamic asset types ──
    const dynamicTypes = useMemo(() => {
        return [...new Set(investments.map(i => i.assetType).filter(Boolean))].sort();
    }, [investments]);

    // ── Filtering & Sorting ──
    const filtered = useMemo(() => {
        let list = [...investments];
        if (filterType) list = list.filter(i => i.assetType === filterType);
        switch (sortBy) {
            case 'roi-desc': list.sort((a, b) => b.roi - a.roi); break;
            case 'roi-asc': list.sort((a, b) => a.roi - b.roi); break;
            case 'invested-desc': list.sort((a, b) => b.investedAmount - a.investedAmount); break;
            case 'date-desc': list.sort((a, b) => new Date(b.dateInvested || 0) - new Date(a.dateInvested || 0)); break;
        }
        return list;
    }, [investments, filterType, sortBy]);

    // ── Portfolio Summary ──
    const summary = useMemo(() => {
        const totalInvested = investments.reduce((s, i) => s + i.investedAmount, 0);
        const currentValue = investments.reduce((s, i) => s + i.currentValue, 0);
        const pnl = currentValue - totalInvested;
        const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
        return { totalInvested, currentValue, pnl, pnlPct };
    }, [investments]);

    // ── Allocation Chart ──
    const allocationData = useMemo(() => {
        const map = {};
        investments.forEach(i => {
            const t = i.assetType || 'Other';
            map[t] = (map[t] || 0) + i.currentValue;
        });
        const labels = Object.keys(map);
        const data = Object.values(map);
        const palette = isDark
            ? ['#6366f1', '#818cf8', '#a5b4fc', '#94a3b8', '#64748b', '#475569', '#cbd5e1', '#f59e0b', '#10b981']
            : ['#4f46e5', '#6366f1', '#818cf8', '#94a3b8', '#64748b', '#475569', '#a5b4fc', '#f59e0b', '#10b981'];
        return {
            labels,
            datasets: [{ data, backgroundColor: palette.slice(0, labels.length), borderWidth: 0, hoverOffset: 4 }],
        };
    }, [investments, isDark]);

    const chartOpts = {
        responsive: true, maintainAspectRatio: false, cutout: '62%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 12, boxWidth: 8, boxHeight: 8, usePointStyle: true, pointStyleWidth: 8,
                    font: { size: 11, family: 'Inter' }, color: isDark ? '#94a3b8' : '#64748b',
                },
            },
            tooltip: {
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                titleColor: isDark ? '#e2e8f0' : '#1e293b',
                bodyColor: isDark ? '#94a3b8' : '#64748b',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1, padding: 10, bodyFont: { size: 11 },
                callbacks: { label: (ctx) => ` ${ctx.label}: ${fmt(ctx.raw)}` },
            },
        },
    };

    if (loading) return <div className="page-loader">Loading portfolio…</div>;

    return (
        <div className="page">
            <ConfirmModal
                open={!!deleteTarget} title="Delete Investment"
                message="Are you sure you want to delete this investment?"
                onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
            />

            <div className="page-header">
                <div>
                    <h1 className="page-title"><FiTrendingUp /> Portfolio Tracker</h1>
                    <p className="inv-subtitle">Overview of your entire investment portfolio</p>
                </div>
            </div>

            {/* ── Summary Cards ── */}
            <div className="inv-summary-grid">
                <div className="inv-summary-card">
                    <div className="inv-sum-icon" style={{ color: '#6366f1', background: 'rgba(99,102,241,0.08)' }}><FiDollarSign /></div>
                    <div>
                        <p className="inv-sum-label">Total Invested</p>
                        <p className="inv-sum-value">{fmt(summary.totalInvested)}</p>
                    </div>
                </div>
                <div className="inv-summary-card">
                    <div className="inv-sum-icon" style={{ color: '#818cf8', background: 'rgba(129,140,248,0.08)' }}><FiTrendingUp /></div>
                    <div>
                        <p className="inv-sum-label">Current Value</p>
                        <p className="inv-sum-value">{fmt(summary.currentValue)}</p>
                    </div>
                </div>
                <div className="inv-summary-card">
                    <div className="inv-sum-icon" style={{ color: summary.pnl >= 0 ? '#10b981' : '#ef4444', background: summary.pnl >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' }}>
                        {summary.pnl >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                    </div>
                    <div>
                        <p className="inv-sum-label">Profit / Loss</p>
                        <p className={`inv-sum-value ${summary.pnl >= 0 ? 'text-green' : 'text-red'}`}>{summary.pnl >= 0 ? '+' : ''}{fmt(summary.pnl)}</p>
                    </div>
                </div>
                <div className="inv-summary-card">
                    <div className="inv-sum-icon" style={{ color: summary.pnlPct >= 0 ? '#10b981' : '#ef4444', background: summary.pnlPct >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' }}><FiPercent /></div>
                    <div>
                        <p className="inv-sum-label">Return</p>
                        <p className={`inv-sum-value ${summary.pnlPct >= 0 ? 'text-green' : 'text-red'}`}>{summary.pnlPct >= 0 ? '+' : ''}{summary.pnlPct.toFixed(2)}%</p>
                    </div>
                </div>
            </div>

            {/* ── Chart + Filters ── */}
            <div className="inv-mid-row">
                {investments.length > 0 && (
                    <div className="inv-chart-card">
                        <h3 className="inv-chart-title">Allocation by Type</h3>
                        <div className="inv-chart-wrap">
                            <Doughnut data={allocationData} options={chartOpts} />
                        </div>
                    </div>
                )}
                <div className="inv-filters-card">
                    <h3 className="inv-chart-title"><FiFilter /> Filters</h3>
                    <div className="inv-filter-group">
                        <label className="inv-filter-label">Asset Type</label>
                        <div className="inv-pills">
                            <button className={`inv-pill ${filterType === '' ? 'inv-pill-active' : ''}`} onClick={() => setFilterType('')}>All</button>
                            {dynamicTypes.map(t => (
                                <button key={t} className={`inv-pill ${filterType === t ? 'inv-pill-active' : ''}`} onClick={() => setFilterType(filterType === t ? '' : t)}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <div className="inv-filter-group">
                        <label className="inv-filter-label">Sort By</label>
                        <select className="inv-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* ── All Investments Table ── */}
            <div className="inv-table-card">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Asset</th><th>Type</th><th>Category</th>
                                <th className="text-right">Invested</th>
                                <th className="text-right">Current / Maturity</th>
                                <th className="text-right">P&L</th>
                                <th className="text-right">ROI</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan="10" className="text-center">
                                    {filterType ? 'No investments match this filter' : 'No investments yet'}
                                </td></tr>
                            ) : (
                                filtered.map(inv => {
                                    const pnl = inv.currentValue - inv.investedAmount;
                                    const isPos = pnl >= 0;
                                    const catLabel = inv.category === 'Market' ? '📈' : inv.category === 'Deposit' ? '🏦' : '🏠';
                                    return (
                                        <tr key={inv.id}>
                                            <td>
                                                <div className="inv-asset-cell">
                                                    <span className="inv-asset-name">{inv.name}</span>
                                                    {inv.platform && <span className="inv-asset-platform">{inv.platform}</span>}
                                                </div>
                                            </td>
                                            <td><span className="inv-type-badge">{inv.assetType || '—'}</span></td>
                                            <td><span title={inv.category}>{catLabel}</span></td>
                                            <td className="text-right">{fmt(inv.investedAmount)}</td>
                                            <td className="text-right">
                                                {fmt(inv.projectedMaturityValue || inv.currentValue)}
                                                {inv.projectedMaturityValue && <span className="inv-estimated-label">maturity</span>}
                                            </td>
                                            <td className={`text-right ${isPos ? 'text-green' : 'text-red'}`}>{isPos ? '+' : ''}{fmt(pnl)}</td>
                                            <td className={`text-right ${isPos ? 'text-green' : 'text-red'}`}>{inv.roi >= 0 ? '+' : ''}{inv.roi?.toFixed(2)}%</td>
                                            <td>{inv.status ? <span className={`inv-status-badge inv-status-${inv.status.toLowerCase()}`}>{inv.status}</span> : '—'}</td>
                                            <td>{fmtDate(inv.dateInvested)}</td>
                                            <td>
                                                <div className="action-btns">
                                                    <button className="btn-icon btn-danger" onClick={() => setDeleteTarget(inv.id)}><FiTrash2 /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { CoupleContext } from '../context/CoupleContext';
import { useContext } from 'react';
import {
    FiArrowUpRight, FiArrowDownRight, FiDollarSign, FiRefreshCw,
    FiTrendingUp, FiChevronRight
} from 'react-icons/fi';
import useDeviceDetect from '../hooks/useDeviceDetect';

import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, PointElement, LineElement,
    ArcElement, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, PointElement, LineElement,
    ArcElement, Tooltip, Legend, Filler
);

const fmt = (n) => {
    const v = n ?? 0;
    const abs = Math.abs(v);
    if (abs >= 10000000) return `${(v / 10000000).toFixed(1)}Cr`;
    if (abs >= 100000) return `${(v / 100000).toFixed(1)}L`;
    if (abs >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return String(v);
};

export default function WealthDashboard() {
    const [portfolio, setPortfolio] = useState(null);
    const [snapshots, setSnapshots] = useState([]);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { isCouple } = useContext(CoupleContext);
    const { isDark } = useTheme();
    const { isMobile } = useDeviceDetect(768);
    const [scope, setScope] = useState('Combined');


    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get('/portfolioanalytics/summary', { params: { scope } }),
            api.get('/portfolioanalytics/snapshots'),
            api.get('/dashboard', { params: { scope } }),
        ]).then(([portfolioRes, snapshotsRes, dashRes]) => {
            setPortfolio(portfolioRes.data);
            setSnapshots(snapshotsRes.data);
            setBalance(dashRes.data?.currentBalance ?? 0);
        }).catch(() => { }).finally(() => setLoading(false));
    }, [scope]);

    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const tickColor = isDark ? '#6b7394' : '#7c8298';
    const ttBg = isDark ? 'rgba(20,24,33,0.95)' : 'rgba(255,255,255,0.96)';
    const ttText = isDark ? '#c8cad0' : '#1a1d28';
    const ttBorder = isDark ? 'rgba(42,49,72,0.5)' : 'rgba(0,0,0,0.08)';
    const baseTooltip = {
        backgroundColor: ttBg, titleColor: ttText, bodyColor: ttText,
        borderColor: ttBorder, borderWidth: 1, padding: 10, cornerRadius: 8,
    };

    if (loading) return <div className="page-loader">Loading Wealth Dashboard…</div>;

    return (
        <div className="dash-new">
            <div style={{ display: 'none' }}>v5-FIXED-JS</div>

            {/* ── Top Header ── */}
            <div className="dash-top-bar">
                <h1 className="dash-title">Wealth Dashboard</h1>
                <div className="dash-filters">
                    {isCouple && (
                        <select className="dash-filter-select" style={{ background: 'var(--primary-color)', color: 'white', border: 'none' }} value={scope} onChange={e => setScope(e.target.value)}>
                            <option value="Mine">Mine</option>
                            <option value="Partner">Partner</option>
                            <option value="Combined">Combined</option>
                        </select>
                    )}
                    <Link to="/portfolio" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        Full Portfolio <FiChevronRight />
                    </Link>
                </div>
            </div>

            {/* ── Net Worth Hero ── */}
            {portfolio ? (
                <div className="wealth-hero" style={{
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(99, 102, 241, 0.05))',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div className="wealth-hero-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="wealth-hero-main">
                            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Total Net Worth</p>
                            <h2 className="wealth-hero-value" style={{ margin: '8px 0 0 0', fontSize: isMobile ? '2rem' : '3rem', fontWeight: 900, letterSpacing: '-1px' }}>
                                ₹{fmt(portfolio.currentValue + balance)}
                            </h2>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Inv: ₹{fmt(portfolio.currentValue)} <span style={{ opacity: 0.5 }}>•</span> Cash: ₹{fmt(balance)}
                            </p>
                        </div>
                        <div className="wealth-hero-pnl">
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px',
                                background: portfolio.overallPnL >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                color: portfolio.overallPnL >= 0 ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: isMobile ? '1rem' : '1.2rem'
                            }}>
                                {portfolio.overallPnL >= 0 ? <FiArrowUpRight /> : <FiArrowDownRight />}
                                ₹{Math.abs(portfolio.overallPnL).toLocaleString('en-IN')} ({portfolio.overallPnLPct.toFixed(2)}%)
                            </div>
                            <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', opacity: 0.6 }}>Overall Return</p>
                        </div>
                    </div>

                    {/* Invested / Cost / PnL Stat Row */}
                    <div className="wealth-hero-stats" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {[
                            { label: 'Invested', value: `₹${portfolio.totalInvested.toLocaleString('en-IN')}`, color: '#818cf8' },
                            { label: 'Current Value', value: `₹${portfolio.currentValue.toLocaleString('en-IN')}`, color: '#c084fc' },
                            { label: 'Total P&L', value: `${portfolio.overallPnL >= 0 ? '+' : ''}₹${portfolio.overallPnL.toLocaleString('en-IN')}`, color: portfolio.overallPnL >= 0 ? '#10b981' : '#ef4444' },
                            { label: 'Holdings', value: portfolio.holdingsCount, color: '#f59e0b' },
                        ].map(({ label, value, color }) => (
                            <div key={label} style={{ flex: '1 1 120px', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                                <p style={{ margin: '6px 0 0 0', fontWeight: 800, fontSize: '1.1rem', color }}>{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', marginBottom: 24 }}>
                    <p style={{ opacity: 0.5, margin: 0 }}>No portfolio data found. Start by adding investments in the <Link to="/portfolio">Portfolio</Link> section.</p>
                </div>
            )}

            {/* ── Portfolio Growth Chart ── */}
            {snapshots.length > 0 && (
                <div className="dash-panel" style={{ marginBottom: '24px', padding: '24px' }}>
                    <div className="dash-panel-header" style={{ marginBottom: '20px' }}>
                        <span className="dash-panel-title"><FiTrendingUp /> Net Worth Portfolio Growth</span>
                    </div>
                    <div className="dash-growth-chart-container">
                        <Line
                            data={{
                                labels: snapshots.map(s => new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })),
                                datasets: [{
                                    label: 'Portfolio Value',
                                    data: snapshots.map(s => s.totalValue),
                                    borderColor: '#6366f1',
                                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                    borderWidth: 3,
                                    pointRadius: 4,
                                    pointBackgroundColor: '#6366f1',
                                    fill: true,
                                    tension: 0.4
                                }]
                            }}
                            options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { display: false }, tooltip: baseTooltip },
                                scales: {
                                    x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 10, family: 'Inter' } } },
                                    y: {
                                        grid: { color: gridColor },
                                        ticks: { color: tickColor, font: { size: 10, family: 'Inter' }, callback: (value) => '₹' + fmt(value) }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            )}

            {/* ── Wealth Distribution & Performance ── */}
            {portfolio && (
                <div className="dash-mid-grid" style={{ marginBottom: '24px' }}>
                    {/* Allocation Donut */}
                    <div className="dash-panel">
                        <div className="dash-panel-header">
                            <span className="dash-panel-title"><FiDollarSign /> Asset Allocation</span>
                        </div>
                        <div className="wealth-donut-container">
                            <Doughnut
                                data={{
                                    labels: Object.keys(portfolio.allocation),
                                    datasets: [{
                                        data: Object.values(portfolio.allocation),
                                        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#0ea5e9'],
                                        borderWidth: 0,
                                        hoverOffset: 8
                                    }]
                                }}
                                options={{
                                    responsive: true, maintainAspectRatio: false, cutout: '75%',
                                    plugins: {
                                        legend: {
                                            display: false // FORCED OFF IN V5
                                        },
                                        tooltip: baseTooltip
                                    }

                                }}
                            />
                        </div>

                        {isMobile && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '16px' }}>
                                {Object.keys(portfolio.allocation).map((label, i) => (
                                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: tickColor }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#0ea5e9'][i % 7] }} />
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Top Gainers */}
                    <div className="dash-panel">
                        <div className="dash-panel-header">
                            <span className="dash-panel-title" style={{ color: '#10b981' }}><FiArrowUpRight /> Top Performers</span>
                        </div>
                        <div className="dash-tx-list-slim" style={{ marginTop: '10px' }}>
                            {portfolio.topGainers.map((g, i) => (
                                <div key={i} className="dash-tx-row-slim">
                                    <div className="dash-tx-info-slim">
                                        <p className="dash-tx-title-slim">{g.name}</p>
                                        <p className="dash-tx-sub-slim">{g.ticker || 'Mutual Fund'}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p className="dash-tx-amount-slim" style={{ color: '#10b981' }}>+₹{g.overallPnL.toLocaleString('en-IN')}</p>
                                        <p className="dash-tx-sub-slim" style={{ color: '#10b981' }}>+{g.overallPnLPct.toFixed(1)}%</p>
                                    </div>
                                </div>
                            ))}
                            {portfolio.topGainers.length === 0 && <p style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>No gainers found</p>}
                        </div>
                    </div>

                    {/* Top Losers */}
                    <div className="dash-panel">
                        <div className="dash-panel-header">
                            <span className="dash-panel-title" style={{ color: '#ef4444' }}><FiArrowDownRight /> Underperformers</span>
                        </div>
                        <div className="dash-tx-list-slim" style={{ marginTop: '10px' }}>
                            {portfolio.topLosers.map((g, i) => (
                                <div key={i} className="dash-tx-row-slim">
                                    <div className="dash-tx-info-slim">
                                        <p className="dash-tx-title-slim">{g.name}</p>
                                        <p className="dash-tx-sub-slim">{g.ticker || 'Mutual Fund'}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p className="dash-tx-amount-slim" style={{ color: '#ef4444' }}>-₹{Math.abs(g.overallPnL).toLocaleString('en-IN')}</p>
                                        <p className="dash-tx-sub-slim" style={{ color: '#ef4444' }}>{g.overallPnLPct.toFixed(1)}%</p>
                                    </div>
                                </div>
                            ))}
                            {portfolio.topLosers.length === 0 && <p style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>No underperformers</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Links */}
            <div className="dash-panel" style={{ padding: '24px' }}>
                <div className="dash-panel-header">
                    <span className="dash-panel-title">Manage Investments</span>
                </div>
                <div className="wealth-quick-links" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
                    {[
                        { to: '/portfolio', label: '📊 Portfolio', color: '#6366f1' },
                        { to: '/mutual-funds', label: '💹 Mutual Funds', color: '#10b981' },
                        { to: '/stocks', label: '📈 Stocks', color: '#f59e0b' },
                        { to: '/other-assets', label: '🏠 Other Assets', color: '#ec4899' },
                        { to: '/tax-reports', label: '🧾 Tax Reports', color: '#8b5cf6' },
                    ].map(({ to, label, color }) => (
                        <Link key={to} to={to} className="wealth-quick-link" style={{
                            padding: '10px 18px', borderRadius: 10, fontWeight: 600, fontSize: '0.9rem',
                            background: `${color}15`, border: `1px solid ${color}30`, color,
                            textDecoration: 'none', transition: 'all 0.2s ease'
                        }}>
                            {label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

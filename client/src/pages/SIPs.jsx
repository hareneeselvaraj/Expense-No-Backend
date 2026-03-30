import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useToast } from '../components/Toast';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiActivity, FiPieChart, FiPlus, FiX, FiZap, FiCalendar, FiClock, FiPlay, FiPause, FiTrash2, FiInfo } from 'react-icons/fi';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';

function AddAssetModal({ onClose, onSaved }) {
    const toast = useToast();
    const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm({
        defaultValues: { name: '', assetType: 'Mutual Fund', ticker: '', investedAmount: '', dateInvested: new Date().toISOString().split('T')[0] }
    });

    const onSubmit = async (data) => {
        const invAmt = parseFloat(data.investedAmount);

        const payload = {
            name: data.name,
            assetType: data.assetType,
            ticker: data.ticker,
            quantity: 0,
            buyPrice: 0,
            investedAmount: invAmt,
            currentValue: invAmt,
            dateInvested: data.dateInvested
        };
        try {
            await api.post('/investment', payload);
            toast.success('Mutual Fund added successfully');
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error saving fund');
        }
    };

    return (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="form-card" style={{ maxWidth: '500px', width: '90%', background: '#1c1c28', padding: '24px', borderRadius: '12px', color: '#fff', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Add Fund</h3>
                    <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#a0a0b0', cursor: 'pointer', fontSize: '1.2rem' }}><FiX /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DISPLAY NAME</label>
                        <input {...register('name', { required: 'Name is required' })} placeholder="e.g. Parag Parikh Flexi Cap" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#262635', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                        {errors.name && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.name.message}</span>}
                    </div>

                    <div className="mobile-grid-2" style={{ marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ASSET TYPE</label>
                            <select {...register('assetType')} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#262635', color: '#fff', fontSize: '0.9rem', outline: 'none' }}>
                                <option value="Mutual Fund">Mutual Fund</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TICKER / SCHEME CODE</label>
                            <input {...register('ticker', { required: 'Scheme Code is required for live tracking' })} placeholder="e.g. 119598" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#262635', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                            {errors.ticker && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.ticker.message}</span>}
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>AMFI Scheme Code (e.g. 119598)</div>
                        </div>
                    </div>

                    <div className="mobile-grid-2" style={{ marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>BUY DATE</label>
                            <input type="date" {...register('dateInvested')} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#262635', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TOTAL INVESTED (₹)</label>
                            <input type="number" step="0.01" {...register('investedAmount', { required: 'Amount is required' })} placeholder="5000" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#262635', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                            {errors.investedAmount && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.investedAmount.message}</span>}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="button" onClick={onClose} style={{ background: '#262635', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>Cancel</button>
                            <button type="submit" style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '500' }}>Add Fund</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function SIPs() {
    const toast = useToast();
    const { theme } = useTheme();
    const [sips, setSips] = useState([]);
    const [investments, setInvestments] = useState([]);
    const [funds, setFunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [historyId, setHistoryId] = useState(null);
    const [history, setHistory] = useState([]);
    const [form, setForm] = useState({ investmentId: '', monthlyAmount: '', executionDay: 1 });

    useEffect(() => {
        Promise.all([fetchSIPs(), fetchInvestments(), fetchFunds()]).finally(() => setLoading(false));
    }, []);

    const fetchFunds = async () => {
        try {
            const { data } = await api.get('/portfolioanalytics/assets/MF');
            setFunds(data);
        } catch { }
    };

    const fetchSIPs = async () => {
        try {
            const { data } = await api.get('/sip');
            setSips(data);
        } catch (err) {
            toast.error('Failed to load SIPs');
        }
    };

    const fetchInvestments = async () => {
        try {
            const { data } = await api.get('/investment');
            setInvestments(data);
        } catch { }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/sip', {
                investmentId: form.investmentId,
                monthlyAmount: parseFloat(form.monthlyAmount),
                executionDay: parseInt(form.executionDay)
            });
            toast.success('SIP created!');
            setShowForm(false);
            setForm({ investmentId: '', monthlyAmount: '', executionDay: 1 });
            fetchSIPs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create SIP');
        }
    };

    const toggleStatus = async (sip) => {
        const newStatus = sip.status === 'Active' ? 'Paused' : 'Active';
        try {
            await api.put(`/sip/${sip.id}`, { status: newStatus });
            toast.success(`SIP ${newStatus.toLowerCase()}`);
            fetchSIPs();
        } catch (err) {
            toast.error('Failed to update SIP');
        }
    };

    const deleteSIP = async (id) => {
        try {
            await api.delete(`/sip/${id}`);
            toast.success('SIP deleted');
            fetchSIPs();
        } catch (err) {
            toast.error('Failed to delete SIP');
        }
    };

    const viewHistory = async (sipId) => {
        if (historyId === sipId) {
            setHistoryId(null);
            return;
        }
        try {
            const { data } = await api.get(`/sip/${sipId}/history`);
            setHistory(data);
            setHistoryId(sipId);
        } catch (err) {
            toast.error('Failed to load history');
        }
    };

    const executeNow = async () => {
        try {
            const { data } = await api.post('/sip/execute');
            toast.success(`Executed ${data.executed} SIPs`);
            fetchSIPs();
        } catch (err) {
            toast.error('Execution failed');
        }
    };

    const metrics = useMemo(() => {
        const totalInvested = funds.reduce((acc, f) => acc + f.investedAmount, 0);
        const currentValue = funds.reduce((acc, f) => acc + f.currentValue, 0);
        const overallPnL = funds.reduce((acc, f) => acc + f.overallPnL, 0);
        const overallPnLPct = totalInvested > 0 ? (overallPnL / totalInvested) * 100 : 0;
        const activeSIPs = sips.filter(s => s.status === 'Active').length;
        return { totalInvested, currentValue, overallPnL, overallPnLPct, activeSIPs };
    }, [funds, sips]);

    const chartData = useMemo(() => {
        const topFunds = [...funds].sort((a, b) => b.currentValue - a.currentValue).slice(0, 5);
        const othersValue = funds.length > 5 ? funds.slice(5).reduce((acc, f) => acc + f.currentValue, 0) : 0;

        const labels = topFunds.map(f => f.name);
        if (othersValue > 0) labels.push('Others');

        const data = topFunds.map(f => f.currentValue);
        if (othersValue > 0) data.push(othersValue);

        return {
            labels,
            datasets: [{
                data,
                backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        };
    }, [funds]);

    if (loading) return <div className="page-loader">Loading mutual funds & SIPs...</div>;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">🧾 Mutual Funds & SIPs</h2>
                    <p className="inv-subtitle">Manage your systematic investment plans and track fund performance.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => setShowAddModal(true)} className="btn secondary" style={{ gap: '6px' }}>
                        <FiPlus /> Add Fund
                    </button>
                    <button onClick={executeNow} className="btn secondary" style={{ gap: '6px' }}>
                        <FiZap /> Execute Due
                    </button>
                    <button onClick={() => setShowForm(!showForm)} className="btn primary" style={{ gap: '6px' }}>
                        {showForm ? <FiX /> : <FiPlus />} {showForm ? 'Cancel' : 'New SIP'}
                    </button>
                </div>
            </div>

            {showAddModal && (
                <AddAssetModal
                    onClose={() => setShowAddModal(false)}
                    onSaved={() => {
                        setShowAddModal(false);
                        fetchFunds();
                    }}
                />
            )}

            {/* Summary Cards */}
            <div className="inv-summary-grid">
                <div className="inv-summary-card">
                    <div className="inv-sum-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                        <FiDollarSign />
                    </div>
                    <div>
                        <div className="inv-sum-label">Total Invested</div>
                        <div className="inv-sum-value">₹{metrics.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                    </div>
                </div>
                <div className="inv-summary-card">
                    <div className="inv-sum-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <FiActivity />
                    </div>
                    <div>
                        <div className="inv-sum-label">Current Value</div>
                        <div className="inv-sum-value">₹{metrics.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                    </div>
                </div>
                <div className="inv-summary-card">
                    <div className="inv-sum-icon" style={{
                        background: metrics.overallPnL >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: metrics.overallPnL >= 0 ? '#10b981' : '#ef4444'
                    }}>
                        {metrics.overallPnL >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                    </div>
                    <div>
                        <div className="inv-sum-label">Overall P&L</div>
                        <div className="inv-sum-value" style={{ color: metrics.overallPnL >= 0 ? '#10b981' : '#ef4444' }}>
                            {metrics.overallPnL >= 0 ? '+' : ''}₹{Math.abs(metrics.overallPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({metrics.overallPnLPct.toFixed(1)}%)
                        </div>
                    </div>
                </div>
                <div className="inv-summary-card">
                    <div className="inv-sum-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                        <FiCalendar />
                    </div>
                    <div>
                        <div className="inv-sum-label">Active SIPs</div>
                        <div className="inv-sum-value">{metrics.activeSIPs}</div>
                    </div>
                </div>
            </div>

            <div className="inv-mid-row">
                <div className="inv-chart-card">
                    <div className="inv-chart-title"><FiPieChart /> Fund Allocation</div>
                    <div className="inv-chart-wrap">
                        <Doughnut
                            data={chartData}
                            options={{
                                cutout: '70%',
                                plugins: {
                                    legend: { display: false },
                                    centerText: {
                                        label: 'TOTAL',
                                        text: `₹${metrics.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0, notation: 'compact' })}`,
                                        color: '#fff'
                                    }
                                },
                                maintainAspectRatio: false
                            }}
                        />
                    </div>
                </div>

                <div className="inv-filters-card">
                    {showForm ? (
                        <form onSubmit={handleCreate} className="inv-form-container">
                            <div className="inv-chart-title"><FiPlus /> Create New SIP</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginTop: '10px' }}>
                                <div>
                                    <label className="inv-filter-label">Target Investment</label>
                                    <select
                                        className="inv-select"
                                        value={form.investmentId}
                                        onChange={(e) => setForm({ ...form, investmentId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select MF...</option>
                                        {investments.filter(i => i.assetType === 'MF' || i.assetType === 'Mutual Fund').map(inv => (
                                            <option key={inv.id} value={inv.id}>{inv.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mobile-grid-2">
                                    <div>
                                        <label className="inv-filter-label">Monthly Amount</label>
                                        <input
                                            type="number"
                                            className="inv-select"
                                            value={form.monthlyAmount}
                                            onChange={(e) => setForm({ ...form, monthlyAmount: e.target.value })}
                                            required
                                            placeholder="₹5000"
                                        />
                                    </div>
                                    <div>
                                        <label className="inv-filter-label">Execution Day</label>
                                        <input
                                            type="number"
                                            className="inv-select"
                                            min="1" max="28"
                                            value={form.executionDay}
                                            onChange={(e) => setForm({ ...form, executionDay: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn primary" style={{ width: '100%', marginTop: '5px' }}>Start SIP</button>
                            </div>
                        </form>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', opacity: 0.8 }}>
                            <div style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--primary)' }}><FiCalendar /></div>
                            <h4 style={{ margin: '0 0 5px 0' }}>Plan Your Wealth</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Automate your investments with SIPs to build long-term wealth.</p>
                            <button onClick={() => setShowForm(true)} className="btn primary" style={{ marginTop: '15px', padding: '8px 20px' }}>Setup New SIP</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="inv-table-card" style={{ marginBottom: '30px' }}>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Fund Name</th>
                                <th>Buy Date</th>
                                <th className="text-right">Units</th>
                                <th className="text-right">Avg NAV</th>
                                <th className="text-right" style={{ color: '#10b981' }}>Current NAV</th>
                                <th className="text-right">Invested</th>
                                <th className="text-right">Value</th>
                                <th className="text-right">P&L (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {funds.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center" style={{ padding: '3rem', opacity: 0.5 }}>
                                        No mutual fund holdings found.
                                    </td>
                                </tr>
                            ) : (
                                funds.map((f, i) => {
                                    const activeSIP = sips.find(s => s.investmentId === f.investmentId && s.status === 'Active');
                                    return (
                                        <tr key={i}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{f.name}</div>
                                                <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                                                    <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{f.ticker || 'MF'}</span>
                                                    {activeSIP && <span style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>SIP ACTIVE</span>}
                                                </div>
                                            </td>
                                            <td style={{ fontSize: '0.85rem', color: '#a0a0b0' }}>{f.dateInvested ? new Date(f.dateInvested).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                                            <td className="text-right">{f.units.toFixed(3)}</td>
                                            <td className="text-right">₹{f.avgCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                            <td className="text-right" style={{ color: '#10b981', fontWeight: 500 }}>₹{(f.currentPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className="text-right">₹{f.investedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                            <td className="text-right" style={{ fontWeight: 600 }}>₹{f.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                            <td className="text-right">
                                                <div style={{ color: f.overallPnL >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                                    {f.overallPnL >= 0 ? '+' : ''}₹{Math.abs(f.overallPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{f.overallPnLPct.toFixed(1)}%</div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>SIP Controls & History</h3>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.5 }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {sips.length === 0 && (
                    <div className="inv-chart-card" style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
                        No systematic investment plans created yet.
                    </div>
                )}
                {sips.length > 0 && sips.map(sip => (
                    <div key={sip.id} className="inv-summary-card" style={{ display: 'block', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                <div className="inv-sum-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', width: '44px', height: '44px', fontSize: '1.2rem' }}>
                                    <FiClock />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)' }}>
                                        {sip.investment?.name || 'Investment'}
                                        <span style={{
                                            marginLeft: '10px',
                                            fontSize: '0.65rem',
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            background: sip.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: sip.status === 'Active' ? '#10b981' : '#f59e0b',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {sip.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        ₹{sip.monthlyAmount?.toLocaleString()} monthly &bull; Day {sip.executionDay} of month
                                        {sip.nextExecutionDate && <span style={{ marginLeft: '10px' }}>&bull; Next: {new Date(sip.nextExecutionDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</span>}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => viewHistory(sip.id)} className="tx-dl-btn" title="View History">
                                    <FiInfo /> History
                                </button>
                                <button onClick={() => toggleStatus(sip)} className="tx-dl-btn" style={{ color: sip.status === 'Active' ? '#f59e0b' : '#10b981' }}>
                                    {sip.status === 'Active' ? <><FiPause /> Pause</> : <><FiPlay /> Resume</>}
                                </button>
                                <button onClick={() => deleteSIP(sip.id)} className="tx-dl-btn" style={{ color: '#ef4444' }} title="Delete SIP">
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>

                        {historyId === sip.id && (
                            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 700 }}>Execution History</h4>
                                <div className="table-wrapper" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    <table style={{ fontSize: '0.85rem' }}>
                                        <thead>
                                            <tr>
                                                <th>Executed At</th>
                                                <th className="text-right">Amount</th>
                                                <th className="text-right">NAV</th>
                                                <th className="text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.length === 0 ? (
                                                <tr><td colSpan="4" className="text-center">No history logs found.</td></tr>
                                            ) : (
                                                history.map(h => (
                                                    <tr key={h.id}>
                                                        <td>{new Date(h.executedAt).toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                        <td className="text-right">₹{h.amount?.toLocaleString()}</td>
                                                        <td className="text-right">{h.navAtExecution ? `₹${h.navAtExecution}` : '—'}</td>
                                                        <td className="text-center">
                                                            <span style={{ color: h.status === 'Success' ? '#10b981' : '#ef4444' }}>{h.status}</span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

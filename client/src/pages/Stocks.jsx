import { useState, useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import api from '../services/api';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiActivity, FiPieChart, FiPlus, FiX } from 'react-icons/fi';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import useDeviceDetect from '../hooks/useDeviceDetect';


function AddAssetModal({ onClose, onSaved }) {
    const toast = useToast();
    const { register, handleSubmit, control, setValue, getValues, formState: { errors } } = useForm({
        defaultValues: { name: '', assetType: 'Stock', ticker: '', quantity: '', investedAmount: '', dateInvested: new Date().toISOString().split('T')[0] }
    });

    const onSubmit = async (data) => {
        const qty = parseFloat(data.quantity);
        const invAmt = parseFloat(data.investedAmount);
        const buyPrice = qty > 0 ? (invAmt / qty) : 0;

        const payload = {
            name: data.name,
            assetType: data.assetType,
            ticker: data.ticker,
            quantity: qty,
            buyPrice: buyPrice,
            investedAmount: invAmt,
            currentValue: invAmt,
            dateInvested: data.dateInvested
        };
        try {
            await api.post('/investment', payload);
            toast.success('Asset added successfully');
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error saving asset');
        }
    };

    return (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="form-card" style={{ maxWidth: '500px', width: '90%', background: '#1c1c28', padding: '24px', borderRadius: '12px', color: '#fff', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Add Asset</h3>
                    <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#a0a0b0', cursor: 'pointer', fontSize: '1.2rem' }}><FiX /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DISPLAY NAME</label>
                        <input {...register('name', { required: 'Name is required' })} placeholder="e.g. TCS, HDFC Mid Cap" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#262635', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                        {errors.name && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.name.message}</span>}
                    </div>

                    <div className="mobile-grid-2" style={{ marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ASSET TYPE</label>
                            <select {...register('assetType')} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#262635', color: '#fff', fontSize: '0.9rem', outline: 'none' }}>
                                <option value="Stock">Stock (NSE/BSE)</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TICKER / CODE</label>
                            <input {...register('ticker', { required: 'Ticker is required' })} placeholder="TCS.NS" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#262635', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                            {errors.ticker && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.ticker.message}</span>}
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>NSE: TCS.NS | BSE: TCS.BO</div>
                        </div>
                    </div>

                    <div className="mobile-grid-3" style={{ marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>BUY DATE</label>
                            <input type="date" {...register('dateInvested')} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#262635', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>QUANTITY</label>
                            <div style={{ display: 'flex', alignItems: 'center', background: '#262635', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                <button type="button" onClick={() => { const val = Number(getValues('quantity')) || 0; setValue('quantity', Math.max(0, val - 1), { shouldValidate: true }); }} style={{ background: 'rgba(255,255,255,0.03)', border: 'none', borderRight: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 12px', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, width: '40px', display: 'flex', justifyContent: 'center' }} onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.08)'} onMouseOut={e => e.target.style.background = 'rgba(255,255,255,0.03)'}>-</button>
                                <input type="number" step="0.0001" {...register('quantity', { required: 'Quantity is required' })} placeholder="0" style={{ width: '100%', padding: '11px 8px', background: 'transparent', border: 'none', color: '#fff', fontSize: '0.9rem', outline: 'none', textAlign: 'center' }} />
                                <button type="button" onClick={() => { const val = Number(getValues('quantity')) || 0; setValue('quantity', val + 1, { shouldValidate: true }); }} style={{ background: 'rgba(255,255,255,0.03)', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 12px', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, width: '40px', display: 'flex', justifyContent: 'center' }} onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.08)'} onMouseOut={e => e.target.style.background = 'rgba(255,255,255,0.03)'}>+</button>
                            </div>
                            {errors.quantity && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.quantity.message}</span>}
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TOTAL INVESTED (₹)</label>
                            <input type="number" step="0.01" {...register('investedAmount', { required: 'Amount is required' })} placeholder="1000" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#262635', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                            {errors.investedAmount && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.investedAmount.message}</span>}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button type="button" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#c084fc', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))'} onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))'} onClick={() => window.location.href = '/sips'}>
                            <FiActivity /> Setup Stock SIP
                        </button>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="button" onClick={onClose} style={{ background: '#262635', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>Cancel</button>
                            <button type="submit" style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '500' }}>Add Asset</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SellAssetModal({ asset, onClose, onSaved }) {
    const toast = useToast();
    const { register, handleSubmit, control, setValue, getValues, formState: { errors } } = useForm({
        defaultValues: { sellQuantity: asset?.units || '', sellPrice: asset?.currentPrice || '', sellDate: new Date().toISOString().split('T')[0], notes: '' }
    });

    const onSubmit = async (data) => {
        const payload = {
            sellQuantity: parseFloat(data.sellQuantity),
            sellPrice: parseFloat(data.sellPrice),
            sellDate: data.sellDate,
            notes: data.notes
        };
        try {
            await api.post(`/investment/${asset.id}/sell`, payload);
            toast.success(`Successfully sold ${payload.sellQuantity} shares of ${asset.name}`);
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error selling asset');
        }
    };

    if (!asset) return null;

    return (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="form-card dash-panel" style={{ maxWidth: '500px', width: '90%', padding: '24px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Sell {asset.ticker}</h3>
                    <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#a0a0b0', cursor: 'pointer', fontSize: '1.2rem' }}><FiX /></button>
                </div>

                <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', color: '#d8b4fe' }}>
                    <strong>Holdings Available:</strong> {asset.units.toLocaleString('en-IN', { maximumFractionDigits: 4 })} shares @ Avg Cost ₹{asset.avgCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mobile-grid-2" style={{ marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SELL QUANTITY</label>
                            <input type="number" step="0.0001" max={asset.units} {...register('sellQuantity', { required: 'Quantity is required', max: { value: asset.units, message: 'Exceeds holdings' } })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#262635', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                            {errors.sellQuantity && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.sellQuantity.message}</span>}
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SELL PRICE (₹)</label>
                            <input type="number" step="0.01" {...register('sellPrice', { required: 'Price is required' })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#262635', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                            {errors.sellPrice && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.sellPrice.message}</span>}
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SELL DATE</label>
                        <input type="date" {...register('sellDate')} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#262635', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" onClick={onClose} style={{ background: '#262635', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '500' }}>Confirm Sell</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Stocks() {
    const [stocks, setStocks] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [sellAsset, setSellAsset] = useState(null);
    const [activeTab, setActiveTab] = useState('holdings'); // 'holdings' | 'history'
    const { theme } = useTheme();
    const { isMobile } = useDeviceDetect(768);


    const fetchStocks = () => {
        setLoading(true);
        Promise.all([
            api.get('/portfolioanalytics/assets/Stock'),
            api.get('/investment/transactions/all')
        ]).then(([stockRes, histRes]) => {
            setStocks(stockRes.data);
            setHistory(histRes.data.filter(t => t.assetType === 'Stock' || t.assetType === 'ETF'));
        }).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchStocks();
    }, []);

    const metrics = useMemo(() => {
        const totalInvested = stocks.reduce((acc, s) => acc + s.investedAmount, 0);
        const currentValue = stocks.reduce((acc, s) => acc + s.currentValue, 0);
        const overallPnL = stocks.reduce((acc, s) => acc + s.overallPnL, 0);
        const overallPnLPct = totalInvested > 0 ? (overallPnL / totalInvested) * 100 : 0;
        return { totalInvested, currentValue, overallPnL, overallPnLPct };
    }, [stocks]);

    const chartData = useMemo(() => {
        const topStocks = [...stocks].sort((a, b) => b.currentValue - a.currentValue).slice(0, 5);
        const othersValue = stocks.length > 5 ? stocks.slice(5).reduce((acc, s) => acc + s.currentValue, 0) : 0;

        const labels = topStocks.map(s => s.name);
        if (othersValue > 0) labels.push('Others');

        const data = topStocks.map(s => s.currentValue);
        if (othersValue > 0) data.push(othersValue);

        return {
            labels,
            datasets: [{
                data,
                backgroundColor: [
                    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        };
    }, [stocks]);

    if (loading) return <div className="page-loader">Loading stock portfolio...</div>;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">📈 Stocks & Equity</h2>
                    <p className="inv-subtitle">Track your holdings, average prices, and real-time performance.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => setShowAddModal(true)} className="btn primary" style={{ gap: '6px' }}>
                        <FiPlus /> Add Stock
                    </button>
                </div>
            </div>

                {showAddModal && (
                <AddAssetModal
                    onClose={() => setShowAddModal(false)}
                    onSaved={() => {
                        setShowAddModal(false);
                        fetchStocks();
                    }}
                />
            )}

            {sellAsset && (
                <SellAssetModal 
                    asset={sellAsset}
                    onClose={() => setSellAsset(null)}
                    onSaved={() => {
                        setSellAsset(null);
                        fetchStocks();
                    }}
                />
            )}

            {/* Navigation Tabs */}
            <div className="stock-tabs" style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem', gap: '24px' }}>
                <button 
                    onClick={() => setActiveTab('holdings')}
                    style={{ background: 'none', border: 'none', color: activeTab === 'holdings' ? '#818cf8' : 'var(--text-muted)', fontSize: '1rem', fontWeight: 600, padding: '0 0 12px 0', borderBottom: activeTab === 'holdings' ? '3px solid #6366f1' : '3px solid transparent', cursor: 'pointer', position: 'relative' }}
                >
                    Current Holdings
                    {/* The original instruction had an extra div here, but the new styling pattern makes it redundant. */}
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    style={{ background: 'transparent', border: 'none', color: activeTab === 'history' ? '#fff' : 'var(--text-muted)', fontSize: '1.1rem', fontWeight: activeTab === 'history' ? 600 : 400, cursor: 'pointer', position: 'relative', padding: '0 8px' }}
                >
                    Trade History
                    {activeTab === 'history' && <div style={{ position: 'absolute', bottom: '-13px', left: 0, right: 0, height: '3px', background: '#6366f1', borderRadius: '3px 3px 0 0' }} />}
                </button>
            </div>

            {activeTab === 'holdings' && (
                <>
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
                                    {metrics.overallPnL >= 0 ? '+' : ''}₹{Math.abs(metrics.overallPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                        </div>
                        <div className="inv-summary-card">
                            <div className="inv-sum-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                                <FiPieChart />
                            </div>
                            <div>
                                <div className="inv-sum-label">Return %</div>
                                <div className="inv-sum-value" style={{ color: metrics.overallPnLPct >= 0 ? '#10b981' : '#ef4444' }}>
                                    {metrics.overallPnLPct.toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="inv-mid-row">
                        <div className="inv-chart-card">
                            <div className="inv-chart-title"><FiPieChart /> Portfolio Allocation</div>
                            <div className="inv-chart-wrap" style={{ height: isMobile ? '200px' : '300px' }}>
                                <Doughnut
                                    data={chartData}
                                    options={{
                                        cutout: '70%',
                                        plugins: {
                                            legend: { 
                                                display: isMobile, 
                                                position: 'bottom',
                                                labels: { 
                                                    color: 'var(--text-muted)', 
                                                    font: { size: 10 },
                                                    usePointStyle: true,
                                                    padding: 10
                                                }
                                            },
                                            centerText: {
                                                display: !isMobile,
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

                        <div className="inv-table-card">
                            {!isMobile ? (
                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Stock / Ticker</th>
                                                <th className="text-right">Qty</th>
                                                <th className="text-right">Avg Cost</th>
                                                <th className="text-right">Current Price</th>
                                                <th className="text-right">Current Value</th>
                                                <th className="text-right">P&L</th>
                                                <th className="text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stocks.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center" style={{ padding: '3rem', opacity: 0.5 }}>
                                                        No stock holdings found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                stocks.map((s, i) => (
                                                    <tr key={i}>
                                                        <td>
                                                            <div style={{ fontWeight: 600 }}>{s.name}</div>
                                                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{s.ticker}</div>
                                                        </td>
                                                        <td className="text-right">{s.units.toLocaleString('en-IN', { maximumFractionDigits: 4 })}</td>
                                                        <td className="text-right">₹{s.avgCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                        <td className="text-right" style={{ color: '#10b981', fontWeight: 500 }}>₹{(s.currentPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                        <td className="text-right" style={{ fontWeight: 600 }}>₹{s.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                                        <td className="text-right">
                                                            <div style={{ color: s.overallPnL >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                                                {s.overallPnL >= 0 ? '+' : '-'}₹{Math.abs(s.overallPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                            </div>
                                                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{s.overallPnLPct.toFixed(2)}%</div>
                                                        </td>
                                                        <td className="text-center">
                                                            <button className="btn outline" style={{ padding: '4px 12px', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={() => setSellAsset(s)}>
                                                                Sell
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="inv-card-list">
                                    {stocks.map((s, i) => (
                                        <div key={i} className="inv-mobile-card">
                                            <div className="inv-mobile-card-header">
                                                <div>
                                                    <div className="inv-mobile-card-title">{s.name}</div>
                                                    <div className="inv-mobile-card-subtitle">{s.ticker} • {s.units.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Units</div>
                                                </div>
                                                <div className="inv-mobile-card-pnl" style={{ color: s.overallPnL >= 0 ? '#10b981' : '#ef4444' }}>
                                                    {s.overallPnL >= 0 ? '+' : '-'}₹{Math.abs(s.overallPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </div>
                                            </div>
                                            <div className="inv-mobile-card-body">
                                                <div className="inv-mobile-card-stat">
                                                    <span className="label">Avg/Cur</span>
                                                    <span className="val">₹{fmt(s.avgCost)} / <span style={{ color: '#10b981' }}>₹{fmt(s.currentPrice)}</span></span>
                                                </div>
                                                <div className="inv-mobile-card-stat">
                                                    <span className="label">Value</span>
                                                    <span className="val" style={{ fontWeight: 700 }}>₹{fmt(s.currentValue)}</span>
                                                </div>
                                            </div>
                                            <div className="inv-mobile-card-actions">
                                                <button className="btn outline" style={{ width: '100%', padding: '8px', fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={() => setSellAsset(s)}>
                                                    Sell Holdings
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {stocks.length === 0 && <p style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>No stocks found</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'history' && (
                <div className="dash-panel">
                    <div className="dash-panel-header" style={{ marginBottom: '24px' }}>
                        <span className="dash-panel-title">Trade History & Capital Gains</span>
                    </div>
                    <div className="table-wrapper">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                                <tr>
                                    <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600 }}>Date</th>
                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Asset</th>
                                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>Type</th>
                                    <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>Qty</th>
                                    <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>Price</th>
                                    <th style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 600 }}>Total Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '32px', textAlign: 'center', opacity: 0.5 }}>No trade history found.</td>
                                    </tr>
                                ) : (
                                    history.map((t, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{new Date(t.date).toLocaleDateString()}</td>
                                            <td style={{ padding: '16px', fontWeight: 500 }}>
                                                {t.investmentName} <span style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: 8 }}>{t.ticker}</span>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <span style={{ 
                                                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                                                    background: t.txnType === 'BUY' || t.txnType === 'SIP' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                                    color: t.txnType === 'BUY' || t.txnType === 'SIP' ? '#10b981' : '#ef4444'
                                                }}>
                                                    {t.txnType}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>{t.units.toLocaleString('en-IN', { maximumFractionDigits: 4 })}</td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>₹{t.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                            <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 600 }}>₹{t.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

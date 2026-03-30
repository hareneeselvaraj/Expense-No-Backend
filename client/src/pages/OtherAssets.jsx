import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useToast } from '../components/Toast';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiActivity, FiPieChart, FiGlobe, FiBriefcase, FiPlus, FiX } from 'react-icons/fi';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';

function AddAssetModal({ onClose, onSaved }) {
    const toast = useToast();
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { name: '', assetType: 'FD', quantity: '1', investedAmount: '', currentValue: '' }
    });

    const onSubmit = async (data) => {
        const qty = parseFloat(data.quantity) || 1;
        const invAmt = parseFloat(data.investedAmount);
        const currVal = data.currentValue ? parseFloat(data.currentValue) : invAmt;
        const buyPrice = qty > 0 ? (invAmt / qty) : 0;

        const payload = {
            name: data.name,
            assetType: data.assetType,
            quantity: qty,
            buyPrice: buyPrice,
            investedAmount: invAmt,
            currentValue: currVal
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
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Add Alternative Asset</h3>
                    <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#a0a0b0', cursor: 'pointer', fontSize: '1.2rem' }}><FiX /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DISPLAY NAME</label>
                        <input {...register('name', { required: 'Name is required' })} placeholder="e.g. HDFC Fixed Deposit, Gold Coins" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#262635', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                        {errors.name && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.name.message}</span>}
                    </div>

                    <div className="mobile-grid-2" style={{ marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ASSET TYPE</label>
                            <select {...register('assetType')} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#262635', color: '#fff', fontSize: '0.9rem', outline: 'none' }}>
                                <option value="FD">Fixed Deposit (FD)</option>
                                <option value="RD">Recurring Deposit (RD)</option>
                                <option value="PPF">PPF</option>
                                <option value="Bond">Bonds / Debentures</option>
                                <option value="Crypto">Cryptocurrency</option>
                                <option value="Gold">Physical Gold / Silver</option>
                                <option value="Gold ETF">SGB / Gold ETF</option>
                                <option value="Real Estate">Real Estate</option>
                                <option value="Other">Other Category</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>QUANTITY / UNITS</label>
                            <input type="number" step="0.0001" {...register('quantity', { required: 'Quantity is required' })} placeholder="1" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#262635', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                            {errors.quantity && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.quantity.message}</span>}
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>Default is 1 for non-divisible assets</div>
                        </div>
                    </div>

                    <div className="mobile-grid-2" style={{ marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TOTAL INVESTED (₹)</label>
                            <input type="number" step="0.01" {...register('investedAmount', { required: 'Amount is required' })} placeholder="e.g. 50000" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#262635', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                            {errors.investedAmount && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{errors.investedAmount.message}</span>}
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#a0a0b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CURRENT VALUE (₹)</label>
                            <input type="number" step="0.01" {...register('currentValue')} placeholder="e.g. 55000" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#262635', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>Leave blank to default to invested flag</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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

export default function OtherAssets() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const { theme } = useTheme();

    const fetchAssets = () => {
        setLoading(true);
        api.get('/portfolioanalytics/assets/Other')
            .then(res => setAssets(res.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const metrics = useMemo(() => {
        const totalInvested = assets.reduce((acc, a) => acc + a.investedAmount, 0);
        const currentValue = assets.reduce((acc, a) => acc + a.currentValue, 0);
        const overallPnL = assets.reduce((acc, a) => acc + a.overallPnL, 0);
        const overallPnLPct = totalInvested > 0 ? (overallPnL / totalInvested) * 100 : 0;
        return { totalInvested, currentValue, overallPnL, overallPnLPct };
    }, [assets]);

    const groupedAssets = useMemo(() => {
        return assets.reduce((acc, obj) => {
            const type = obj.assetType || 'Uncategorized';
            if (!acc[type]) acc[type] = [];
            acc[type].push(obj);
            return acc;
        }, {});
    }, [assets]);

    const chartData = useMemo(() => {
        const typeTotals = Object.entries(groupedAssets).map(([type, items]) => ({
            type,
            value: items.reduce((sum, item) => sum + item.currentValue, 0)
        })).sort((a, b) => b.value - a.value);

        return {
            labels: typeTotals.map(t => t.type),
            datasets: [{
                data: typeTotals.map(t => t.value),
                backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        };
    }, [groupedAssets]);

    if (loading) return <div className="page-loader">Loading alternative assets...</div>;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">🏦 Alternative Assets</h2>
                    <p className="inv-subtitle">Consolidated view of your FDs, Real Estate, Gold, and other holdings.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => setShowAddModal(true)} className="btn primary" style={{ gap: '6px' }}>
                        <FiPlus /> Add Asset
                    </button>
                </div>
            </div>

            {showAddModal && (
                <AddAssetModal
                    onClose={() => setShowAddModal(false)}
                    onSaved={() => {
                        setShowAddModal(false);
                        fetchAssets();
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
                    <div className="inv-sum-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
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
                    <div className="inv-sum-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
                        <FiPieChart />
                    </div>
                    <div>
                        <div className="inv-sum-label">P&L %</div>
                        <div className="inv-sum-value" style={{ color: metrics.overallPnLPct >= 0 ? '#10b981' : '#ef4444' }}>
                            {metrics.overallPnLPct.toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>

            <div className="inv-mid-row">
                <div className="inv-chart-card">
                    <div className="inv-chart-title"><FiPieChart /> Asset Allocation</div>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div className="inv-filters-card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="inv-sum-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}><FiGlobe /></div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Diversification</div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Your wealth is spread across {Object.keys(groupedAssets).length} alternative asset types.</p>
                        </div>
                    </div>
                    <div className="inv-filters-card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="inv-sum-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><FiBriefcase /></div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Asset Health</div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>All alternative holdings are active and tracked with latest values.</p>
                        </div>
                    </div>
                </div>
            </div>

            {Object.entries(groupedAssets).map(([type, items]) => (
                <div key={type} style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{type}</h3>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.4 }}></div>
                    </div>
                    <div className="inv-table-card">
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Asset Name</th>
                                        <th className="text-right">Invested</th>
                                        <th className="text-right">Current Value</th>
                                        <th className="text-right">P&L (%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((a, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 600 }}>{a.name}</td>
                                            <td className="text-right">₹{a.investedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                            <td className="text-right" style={{ fontWeight: 600 }}>₹{a.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                            <td className="text-right">
                                                <div style={{ color: a.overallPnL >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                                    {a.overallPnL >= 0 ? '+' : ''}₹{Math.abs(a.overallPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{a.overallPnLPct.toFixed(1)}%</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

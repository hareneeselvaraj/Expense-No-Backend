import { useState, useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import api from '../services/api';
import { FiPlus, FiTrash2, FiEdit2, FiTrendingUp, FiX, FiZap, FiRefreshCw } from 'react-icons/fi';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import useDeviceDetect from '../hooks/useDeviceDetect';


// ── Category → AssetType Mapping ──
const CATEGORY_TYPES = {
    Market: ['Stock', 'Mutual Fund', 'ETF', 'NPS', 'Crypto'],
    Deposit: ['FD', 'RD', 'PPF', 'SSY'],
    Physical: ['Gold', 'Silver'],
};

const ALL_TYPES = [...CATEGORY_TYPES.Market, ...CATEGORY_TYPES.Deposit, ...CATEGORY_TYPES.Physical];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ── Category helpers ──
function getCategory(type) {
    if (CATEGORY_TYPES.Market.includes(type)) return 'Market';
    if (CATEGORY_TYPES.Deposit.includes(type)) return 'Deposit';
    return 'Physical';
}
function isMarket(t) { return CATEGORY_TYPES.Market.includes(t); }
function isDeposit(t) { return CATEGORY_TYPES.Deposit.includes(t); }
function isRD(t) { return t === 'RD'; }
function isPPF(t) { return t === 'PPF'; }
function isFixedIncome(t) { return isDeposit(t); }
function isPhysicalMetal(t) { return t === 'Gold' || t === 'Silver'; }

function fmt(v) {
    return `₹${(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
}

// ── Maturity Calculators ──
function calcFDMaturity(principal, rate, tenureMonths) {
    if (!principal || !rate || !tenureMonths) return 0;
    const r = rate / 100;
    const n = 4; // quarterly compounding
    const t = tenureMonths / 12;
    return principal * Math.pow(1 + r / n, n * t);
}

function calcRDMaturity(monthly, rate, tenureMonths) {
    if (!monthly || !rate || !tenureMonths) return 0;
    let maturity = 0;
    for (let i = 0; i < tenureMonths; i++) {
        const monthsRemaining = tenureMonths - i;
        maturity += monthly * Math.pow(1 + (rate / 100) / 12, monthsRemaining);
    }
    return maturity;
}

function calcPPFProjected(amount, rate, frequency, tenureYears = 15) {
    if (!amount || !rate) return 0;
    const annualDeposit = frequency === 'Yearly' ? amount : amount * 12;
    const r = rate / 100;
    let balance = 0;
    for (let y = 0; y < tenureYears; y++) {
        balance = (balance + annualDeposit) * (1 + r);
    }
    return balance;
}

// ── Empty form defaults ──
const EMPTY_DEFAULTS = {
    name: '', assetType: '', quantity: '', buyPrice: '', investedAmount: '', currentValue: '',
    platform: '', notes: '', dateInvested: '', interestRate: '', tenureMonths: '', monthlyAmount: '',
    investmentFrequency: 'Monthly',
};


// ══════════════════════════════════════════════════════════
//  DYNAMIC FORM (adapts by assetType, shared across tabs)
// ══════════════════════════════════════════════════════════
function InvestmentForm({ editing, onClose, onSaved, investments, defaultCategory }) {
    const toast = useToast();

    // Types: merge db + known types, filter to active tab category
    const dynamicTypes = useMemo(() => {
        const dbTypes = [...new Set(investments.map(i => i.assetType).filter(Boolean))];
        const merged = [...new Set([...ALL_TYPES, ...dbTypes])];
        if (defaultCategory) {
            return merged.filter(t => getCategory(t) === defaultCategory).sort();
        }
        return merged.sort();
    }, [investments, defaultCategory]);

    const { register, handleSubmit, control, setValue, reset, formState: { errors } } = useForm({
        defaultValues: { ...EMPTY_DEFAULTS },
    });

    const assetType = useWatch({ control, name: 'assetType' });
    const quantity = useWatch({ control, name: 'quantity' });
    const buyPrice = useWatch({ control, name: 'buyPrice' });
    const interestRate = useWatch({ control, name: 'interestRate' });
    const tenureMonths = useWatch({ control, name: 'tenureMonths' });
    const monthlyAmount = useWatch({ control, name: 'monthlyAmount' });
    const investedAmount = useWatch({ control, name: 'investedAmount' });
    const investmentFrequency = useWatch({ control, name: 'investmentFrequency' });

    // Load editing data
    useEffect(() => {
        if (editing) {
            reset({
                name: editing.name || '',
                assetType: editing.assetType || '',
                quantity: editing.quantity ?? '',
                buyPrice: editing.buyPrice ?? '',
                investedAmount: editing.investedAmount ?? '',
                currentValue: editing.currentValue ?? '',
                platform: editing.platform || '',
                notes: editing.notes || '',
                dateInvested: editing.dateInvested?.split('T')[0] || '',
                interestRate: editing.interestRate ?? '',
                tenureMonths: editing.tenureMonths ?? '',
                monthlyAmount: editing.monthlyAmount ?? '',
                investmentFrequency: editing.investmentFrequency || 'Monthly',
            });
        } else {
            reset({ ...EMPTY_DEFAULTS });
        }
    }, [editing, reset]);

    // ── Auto-calculations ──
    // Stock / MF / ETF etc: investedAmount = quantity × buyPrice
    useEffect(() => {
        if (isMarket(assetType) && quantity && buyPrice) {
            const calc = (parseFloat(quantity) || 0) * (parseFloat(buyPrice) || 0);
            setValue('investedAmount', calc.toFixed(2));
        }
    }, [assetType, quantity, buyPrice, setValue]);

    // FD: currentValue = maturity
    useEffect(() => {
        if (assetType === 'FD' && investedAmount && interestRate && tenureMonths) {
            const mat = calcFDMaturity(parseFloat(investedAmount), parseFloat(interestRate), parseInt(tenureMonths));
            setValue('currentValue', mat.toFixed(2));
        }
    }, [assetType, investedAmount, interestRate, tenureMonths, setValue]);

    // RD: investedAmount = monthly × tenure, currentValue = maturity
    useEffect(() => {
        if (isRD(assetType) && monthlyAmount && tenureMonths) {
            const totalInvested = parseFloat(monthlyAmount) * parseInt(tenureMonths);
            setValue('investedAmount', totalInvested.toFixed(2));
            if (interestRate) {
                const mat = calcRDMaturity(parseFloat(monthlyAmount), parseFloat(interestRate), parseInt(tenureMonths));
                setValue('currentValue', mat.toFixed(2));
            }
        }
    }, [assetType, monthlyAmount, interestRate, tenureMonths, setValue]);

    // PPF: currentValue = projected
    useEffect(() => {
        if (isPPF(assetType) && investedAmount && interestRate) {
            const proj = calcPPFProjected(parseFloat(investedAmount), parseFloat(interestRate), investmentFrequency);
            setValue('currentValue', proj.toFixed(2));
        }
    }, [assetType, investedAmount, interestRate, investmentFrequency, setValue]);

    // Default PPF rate
    useEffect(() => {
        if (isPPF(assetType) && !interestRate) setValue('interestRate', '7.1');
    }, [assetType, interestRate, setValue]);

    // Default date for RD
    useEffect(() => {
        if (isRD(assetType) && !editing) {
            setValue('dateInvested', new Date().toISOString().split('T')[0]);
        }
    }, [assetType, editing, setValue]);

    const onSubmit = async (data) => {
        const resolvedType = data.assetType;
        const payload = {
            name: data.name,
            assetType: resolvedType || undefined,
            quantity: (isMarket(resolvedType) || isPhysicalMetal(resolvedType)) && data.quantity ? parseFloat(data.quantity) : undefined,
            buyPrice: isMarket(resolvedType) && data.buyPrice ? parseFloat(data.buyPrice) : undefined,
            investedAmount: parseFloat(data.investedAmount),
            currentValue: parseFloat(data.currentValue),
            platform: data.platform || undefined,
            notes: data.notes || undefined,
            dateInvested: data.dateInvested || undefined,
            interestRate: isFixedIncome(resolvedType) && data.interestRate ? parseFloat(data.interestRate) : undefined,
            tenureMonths: (assetType === 'FD' || isRD(resolvedType)) && data.tenureMonths ? parseInt(data.tenureMonths) : undefined,
            monthlyAmount: isRD(resolvedType) && data.monthlyAmount ? parseFloat(data.monthlyAmount) : undefined,
            investmentFrequency: isPPF(resolvedType) ? data.investmentFrequency : undefined,
        };
        try {
            if (editing) {
                await api.put(`/investment/${editing.id}`, payload);
                toast.success('Investment updated');
            } else {
                await api.post('/investment', payload);
                toast.success('Investment added');
            }
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error saving investment');
        }
    };

    const showQty = isMarket(assetType);
    const showInterest = isFixedIncome(assetType);
    const showTenure = assetType === 'FD' || isRD(assetType);
    const showMonthly = isRD(assetType);
    const showFrequency = isPPF(assetType);
    const investedReadOnly = isMarket(assetType) || isRD(assetType);
    const currentReadOnly = isFixedIncome(assetType);
    const showGrams = isPhysicalMetal(assetType);

    return (
        <div className="form-card inv-form-card">
            <div className="inv-form-header">
                <h3>{editing ? 'Edit Investment' : 'New Investment'}</h3>
                <button className="btn-icon" onClick={onClose}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
                {/* Row 1: Name + Type */}
                <div className="form-group">
                    <label>Asset Name <span className="req">*</span></label>
                    <input {...register('name', { required: 'Name is required' })} placeholder="e.g. Infosys, SBI MF" />
                    {errors.name && <span className="inv-field-error">{errors.name.message}</span>}
                </div>
                <div className="form-group">
                    <label>Asset Type <span className="req">*</span></label>
                    <select {...register('assetType', { required: 'Select an asset type' })}>
                        <option value="">Select type</option>
                        {dynamicTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors.assetType && <span className="inv-field-error">{errors.assetType.message}</span>}
                </div>

                {/* Gold/Silver: Weight in Grams */}
                {showGrams && (
                    <div className="form-group">
                        <label>Weight (Grams) <span className="req">*</span></label>
                        <input type="number" step="0.01"
                            {...register('quantity', { required: 'Weight in grams is required' })}
                            placeholder="e.g. 10, 50, 100" />
                        {errors.quantity && <span className="inv-field-error">{errors.quantity.message}</span>}
                    </div>
                )}

                {/* Stock/MF/ETF: Quantity + Buy Price — side by side */}
                {showQty && (
                    <div className="inv-field-group inv-field-visible">
                        <div className="form-group">
                            <label>Quantity (Units) <span className="req">*</span></label>
                            <input type="number" step="0.0001"
                                {...register('quantity', { required: 'Quantity is required' })}
                                placeholder="Units" />
                            {errors.quantity && <span className="inv-field-error">{errors.quantity.message}</span>}
                        </div>
                        <div className="form-group">
                            <label>Buy Price / Unit <span className="req">*</span></label>
                            <input type="number" step="0.01" {...register('buyPrice', { required: 'Buy price is required' })} placeholder="₹ per unit" />
                            {errors.buyPrice && <span className="inv-field-error">{errors.buyPrice.message}</span>}
                        </div>
                    </div>
                )}

                {/* RD Monthly Amount */}
                <div className={`inv-field-group ${showMonthly ? 'inv-field-visible' : 'inv-field-hidden'}`}>
                    <div className="form-group form-full">
                        <label>Monthly Investment <span className="req">*</span></label>
                        <input type="number" step="0.01" {...register('monthlyAmount', showMonthly ? { required: 'Monthly amount is required' } : {})} placeholder="₹ per month" />
                        {errors.monthlyAmount && <span className="inv-field-error">{errors.monthlyAmount.message}</span>}
                    </div>
                </div>

                {/* Interest Rate + Tenure */}
                <div className={`inv-field-group ${showInterest ? 'inv-field-visible' : 'inv-field-hidden'}`}>
                    <div className="form-group">
                        <label>Interest Rate (%) <span className="req">*</span></label>
                        <input type="number" step="0.01" {...register('interestRate', showInterest ? { required: 'Interest rate is required' } : {})} placeholder="e.g. 7.1" />
                        {errors.interestRate && <span className="inv-field-error">{errors.interestRate.message}</span>}
                    </div>
                    {showTenure && (
                        <div className="form-group">
                            <label>Tenure (months) <span className="req">*</span></label>
                            <input type="number" {...register('tenureMonths', showTenure ? { required: 'Tenure is required' } : {})} placeholder="e.g. 12, 24, 60" />
                            {errors.tenureMonths && <span className="inv-field-error">{errors.tenureMonths.message}</span>}
                        </div>
                    )}
                </div>

                {/* PPF Frequency */}
                <div className={`inv-field-group ${showFrequency ? 'inv-field-visible' : 'inv-field-hidden'}`}>
                    <div className="form-group form-full">
                        <label>Investment Frequency</label>
                        <div className="inv-freq-toggle">
                            <button type="button" className={`inv-freq-btn ${investmentFrequency === 'Monthly' ? 'inv-freq-active' : ''}`}
                                onClick={() => setValue('investmentFrequency', 'Monthly')}>Monthly</button>
                            <button type="button" className={`inv-freq-btn ${investmentFrequency === 'Yearly' ? 'inv-freq-active' : ''}`}
                                onClick={() => setValue('investmentFrequency', 'Yearly')}>Yearly</button>
                        </div>
                    </div>
                </div>

                {/* Invested + Current Value */}
                <div className="form-group">
                    <label>Amount Invested {!investedReadOnly && <span className="req">*</span>}
                        {investedReadOnly && <span className="inv-auto-badge"><FiZap /> Auto</span>}
                    </label>
                    <input type="number" step="0.01"
                        {...register('investedAmount', { required: 'Amount is required' })}
                        readOnly={investedReadOnly}
                        className={investedReadOnly ? 'inv-auto-calc' : ''} />
                    {errors.investedAmount && <span className="inv-field-error">{errors.investedAmount.message}</span>}
                </div>
                <div className="form-group">
                    <label>{isFixedIncome(assetType) ? 'Maturity / Projected Value' : 'Current Value'}
                        {currentReadOnly && <span className="inv-auto-badge"><FiZap /> Auto</span>}
                    </label>
                    <input type="number" step="0.01"
                        {...register('currentValue', { required: 'Value is required' })}
                        readOnly={currentReadOnly}
                        className={currentReadOnly ? 'inv-auto-calc' : ''} />
                    {errors.currentValue && <span className="inv-field-error">{errors.currentValue.message}</span>}
                </div>

                {/* Platform + Date */}
                <div className="form-group">
                    <label>Platform</label>
                    <input {...register('platform')} placeholder="e.g. Zerodha, Groww" />
                </div>
                <div className="form-group">
                    <label>Date Invested</label>
                    <input type="date" {...register('dateInvested')} />
                </div>

                {/* Notes */}
                <div className="form-group form-full">
                    <label>Notes</label>
                    <input {...register('notes')} placeholder="Optional notes" />
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add Investment'}</button>
                    <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                </div>
            </form>
        </div>
    );
}


// ══════════════════════════════════════════════════════════
//  Tab-specific tables
// ══════════════════════════════════════════════════════════

// ── MARKET TABLE ──
function MarketTable({ items, onEdit, onDelete, isMobile }) {
    if (items.length === 0) return <div className="inv-empty">No market investments yet — add stocks, mutual funds, or crypto!</div>;

    if (isMobile) {
        return (
            <div className="inv-mobile-list">
                {items.map(inv => {
                    const isPos = inv.roi >= 0;
                    return (
                        <div key={inv.id} className="inv-mobile-card">
                            <div className="imc-header">
                                <div>
                                    <div className="imc-name">{inv.name}</div>
                                    <div className="imc-meta">{inv.assetType} • {inv.platform || 'Direct'}</div>
                                </div>
                                <div className={`imc-roi ${isPos ? 'pos' : 'neg'}`}>
                                    {isPos ? '↑' : '↓'} {Math.abs(inv.roi || 0).toFixed(1)}%
                                </div>
                            </div>
                            <div className="imc-stats">
                                <div className="imc-stat">
                                    <span className="imc-label">Invested</span>
                                    <span className="imc-value">{fmt(inv.investedAmount)}</span>
                                </div>
                                <div className="imc-stat">
                                    <span className="imc-label">Current</span>
                                    <span className="imc-value">{fmt(inv.currentValue)}</span>
                                </div>
                            </div>
                            {inv.quantity && (
                                <div className="imc-footer">
                                    <span>{inv.quantity} units @ {fmt(inv.buyPrice)}</span>
                                </div>
                            )}
                            <div className="imc-actions">
                                <button className="imc-btn" onClick={() => onEdit(inv)}><FiEdit2 /> Edit</button>
                                <button className="imc-btn imc-btn-danger" onClick={() => onDelete(inv.id)}><FiTrash2 /> Delete</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="inv-table-card">

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Asset Name</th><th>Type</th>
                            <th className="text-right">Invested</th>
                            <th className="text-right">Current Value</th>
                            <th className="text-right">ROI (%)</th>
                            <th>Platform</th><th>Date</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(inv => {
                            const isPos = inv.roi >= 0;
                            return (
                                <tr key={inv.id}>
                                    <td>
                                        <div className="inv-asset-cell">
                                            <span className="inv-asset-name">{inv.name}</span>
                                            {inv.quantity && <span className="inv-asset-platform">{inv.quantity} units @ {fmt(inv.buyPrice)}</span>}
                                        </div>
                                    </td>
                                    <td><span className="inv-type-badge">{inv.assetType}</span></td>
                                    <td className="text-right">{fmt(inv.investedAmount)}</td>
                                    <td className="text-right">{fmt(inv.currentValue)}</td>
                                    <td className={`text-right ${isPos ? 'text-green' : 'text-red'}`}>{isPos ? '+' : ''}{inv.roi?.toFixed(2)}%</td>
                                    <td>{inv.platform || '—'}</td>
                                    <td>{fmtDate(inv.dateInvested)}</td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="btn-icon" onClick={() => onEdit(inv)}><FiEdit2 /></button>
                                            <button className="btn-icon btn-danger" onClick={() => onDelete(inv.id)}><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── DEPOSITS TABLE ──
function DepositsTable({ items, onEdit, onDelete, isMobile }) {
    if (items.length === 0) return <div className="inv-empty">No deposits yet — add FD, RD, PPF or SSY!</div>;

    if (isMobile) {
        return (
            <div className="inv-mobile-list">
                {items.map(inv => {
                    const completed = inv.monthsCompleted || 0;
                    const total = inv.tenureMonths || 0;
                    const progressPct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : null;
                    const maturityVal = inv.projectedMaturityValue || inv.currentValue;

                    return (
                        <div key={inv.id} className="inv-mobile-card">
                            <div className="imc-header">
                                <div>
                                    <div className="imc-name">{inv.name}</div>
                                    <div className="imc-meta">{inv.assetType} • {inv.platform || 'Bank'}</div>
                                </div>
                                {progressPct !== null && (
                                    <div className="imc-progress-pill">{progressPct}% Done</div>
                                )}
                            </div>
                            <div className="imc-stats">
                                <div className="imc-stat">
                                    <span className="imc-label">Invested</span>
                                    <span className="imc-value">{fmt(inv.investedAmount)}</span>
                                </div>
                                <div className="imc-stat">
                                    <span className="imc-label">Maturity</span>
                                    <span className="imc-value">{fmt(maturityVal)}</span>
                                </div>
                            </div>
                            <div className="imc-actions">
                                <button className="imc-btn" onClick={() => onEdit(inv)}><FiEdit2 /> Edit</button>
                                <button className="imc-btn imc-btn-danger" onClick={() => onDelete(inv.id)}><FiTrash2 /> Delete</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="inv-table-card">

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Asset Name</th><th>Type</th>
                            <th className="text-right">Total Contributed</th>
                            <th className="text-right">Maturity Value</th>
                            <th>Progress</th>
                            <th>Status</th>
                            <th>Date Started</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(inv => {
                            // Progress: % of tenure completed
                            const completed = inv.monthsCompleted || 0;
                            const total = inv.tenureMonths || 0;
                            const progressPct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : null;

                            const maturityVal = inv.projectedMaturityValue || inv.currentValue;
                            const isPPFType = inv.assetType === 'PPF';
                            const statusClass = inv.status === 'Matured' ? 'inv-status-matured' : 'inv-status-active';

                            return (
                                <tr key={inv.id}>
                                    <td>
                                        <div className="inv-asset-cell">
                                            <span className="inv-asset-name">{inv.name}</span>
                                            {inv.platform && <span className="inv-asset-platform">{inv.platform}</span>}
                                        </div>
                                    </td>
                                    <td><span className="inv-type-badge">{inv.assetType}</span></td>
                                    <td className="text-right">{fmt(inv.investedAmount)}</td>
                                    <td className="text-right">
                                        {fmt(maturityVal)}
                                        {isPPFType && <span className="inv-estimated-label">Estimated</span>}
                                    </td>
                                    <td>
                                        {progressPct !== null ? (
                                            <div className="inv-progress-wrap">
                                                <div className="inv-progress-bar">
                                                    <div className="inv-progress-fill" style={{ width: `${progressPct}%` }} />
                                                </div>
                                                <span className="inv-progress-text">{progressPct}%</span>
                                            </div>
                                        ) : '—'}
                                    </td>
                                    <td>
                                        {inv.status
                                            ? <span className={`inv-status-badge ${statusClass}`}>{inv.status}</span>
                                            : '—'}
                                    </td>
                                    <td>{fmtDate(inv.dateInvested)}</td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="btn-icon" onClick={() => onEdit(inv)}><FiEdit2 /></button>
                                            <button className="btn-icon btn-danger" onClick={() => onDelete(inv.id)}><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── PHYSICAL ASSETS TABLE ──
function PhysicalTable({ items, onEdit, onDelete, isMobile }) {
    if (items.length === 0) return <div className="inv-empty">No physical assets yet — add gold or silver!</div>;

    if (isMobile) {
        return (
            <div className="inv-mobile-list">
                {items.map(inv => {
                    const isPos = inv.roi >= 0;
                    return (
                        <div key={inv.id} className="inv-mobile-card">
                            <div className="imc-header">
                                <div>
                                    <div className="imc-name">{inv.name}</div>
                                    <div className="imc-meta">{inv.assetType} {inv.quantity ? `• ${inv.quantity}g` : ''}</div>
                                </div>
                                <div className={`imc-roi ${isPos ? 'pos' : 'neg'}`}>
                                    {isPos ? '↑' : '↓'} {Math.abs(inv.roi || 0).toFixed(1)}%
                                </div>
                            </div>
                            <div className="imc-stats">
                                <div className="imc-stat">
                                    <span className="imc-label">Purchase</span>
                                    <span className="imc-value">{fmt(inv.investedAmount)}</span>
                                </div>
                                <div className="imc-stat">
                                    <span className="imc-label">Current</span>
                                    <span className="imc-value">{fmt(inv.currentValue)}</span>
                                </div>
                            </div>
                            <div className="imc-actions">
                                <button className="imc-btn" onClick={() => onEdit(inv)}><FiEdit2 /> Edit</button>
                                <button className="imc-btn imc-btn-danger" onClick={() => onDelete(inv.id)}><FiTrash2 /> Delete</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="inv-table-card">

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Asset Name</th><th>Type</th>
                            <th className="text-right">Grams</th>
                            <th className="text-right">Purchase Value</th>
                            <th className="text-right">Current Value</th>
                            <th className="text-right">ROI (%)</th>
                            <th>Platform</th>
                            <th>Last Updated</th>
                            <th>Notes</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(inv => {
                            const isPos = inv.roi >= 0;
                            return (
                                <tr key={inv.id}>
                                    <td>
                                        <div className="inv-asset-cell">
                                            <span className="inv-asset-name">{inv.name}</span>
                                        </div>
                                    </td>
                                    <td><span className="inv-type-badge">{inv.assetType}</span></td>
                                    <td className="text-right">{inv.quantity ? `${inv.quantity}g` : '—'}</td>
                                    <td className="text-right">{fmt(inv.investedAmount)}</td>
                                    <td className="text-right">{fmt(inv.currentValue)}</td>
                                    <td className={`text-right ${isPos ? 'text-green' : 'text-red'}`}>{isPos ? '+' : ''}{inv.roi?.toFixed(2)}%</td>
                                    <td>{inv.platform || '—'}</td>
                                    <td>{fmtDate(inv.dateInvested)}</td>
                                    <td><span className="inv-notes-cell">{inv.notes || '—'}</span></td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="btn-icon" onClick={() => onEdit(inv)}><FiEdit2 /></button>
                                            <button className="btn-icon btn-danger" onClick={() => onDelete(inv.id)}><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


// ══════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════
export default function Investments() {
    const query = new URLSearchParams(window.location.search);
    const initialTab = query.get('cat') || 'Market';
    const [tab, setTab] = useState(initialTab);
    const [investments, setInvestments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const toast = useToast();
    const { isMobile } = useDeviceDetect(768);


    const [filterMonth, setFilterMonth] = useState('All Months');
    const [filterYear, setFilterYear] = useState('All Years');
    const [filterPlatform, setFilterPlatform] = useState('All Platforms');

    const load = () => api.get('/investment').then((res) => { setInvestments(res.data); setLoading(false); });
    useEffect(() => { 
        load(); 
        if (query.get('showForm') === 'true') {
            setShowForm(true);
        }
    }, []);

    // Extract dynamic options
    const availablePlatforms = useMemo(() => {
        return [...new Set(investments.map(i => i.platform).filter(Boolean))].sort();
    }, [investments]);

    const availableYears = useMemo(() => {
        return [...new Set(investments.map(i => i.dateInvested ? new Date(i.dateInvested).getFullYear() : null).filter(Boolean))]
            .sort((a, b) => b - a).map(String);
    }, [investments]);

    const handleClearFilters = () => {
        setFilterMonth('All Months');
        setFilterYear('All Years');
        setFilterPlatform('All Platforms');
    };

    // Filter logic
    const filteredInvestments = useMemo(() => {
        let list = [...investments];
        if (filterPlatform !== 'All Platforms') {
            list = list.filter(i => i.platform === filterPlatform);
        }
        if (filterYear !== 'All Years') {
            list = list.filter(i => i.dateInvested && new Date(i.dateInvested).getFullYear() === parseInt(filterYear));
        }
        if (filterMonth !== 'All Months') {
            const mIdx = MONTHS.indexOf(filterMonth);
            list = list.filter(i => i.dateInvested && new Date(i.dateInvested).getMonth() === mIdx);
        }
        return list;
    }, [investments, filterPlatform, filterYear, filterMonth]);

    // Portfolio summary stats
    const totalInvested  = filteredInvestments.reduce((s, i) => s + (i.investedAmount || 0), 0);
    const totalCurrent   = filteredInvestments.reduce((s, i) => s + (i.currentValue   || 0), 0);
    const totalGain      = totalCurrent - totalInvested;
    const totalGainPct   = totalInvested > 0 ? ((totalGain / totalInvested) * 100) : 0;
    const isGain         = totalGain >= 0;

    const resetForm = () => { setEditing(null); setShowForm(false); };

    const handleEdit = (inv) => {
        setEditing(inv);
        setShowForm(true);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/investment/${deleteTarget}`);
            toast.success('Investment deleted');
            load();
        } catch (err) { toast.error('Error deleting investment'); }
        setDeleteTarget(null);
    };

    // ── Split data by category ──
    const byCategory = useMemo(() => {
        const market = [], deposit = [], physical = [];
        filteredInvestments.forEach(inv => {
            const cat = inv.category || getCategory(inv.assetType);
            if (cat === 'Market') market.push(inv);
            else if (cat === 'Deposit') deposit.push(inv);
            else physical.push(inv);
        });
        return { Market: market, Deposit: deposit, Physical: physical };
    }, [filteredInvestments]);

    const currentItems = byCategory[tab] || [];



    const tabInfo = {
        Market: { icon: '📈', label: 'Market Investments', desc: 'Stocks, Mutual Funds, ETFs, NPS, Crypto — value driven by market price.' },
        Deposit: { icon: '🏦', label: 'Deposits & Schemes', desc: 'FD, RD, PPF, SSY — time-based, contribution-driven investments.' },
        Physical: { icon: '🏠', label: 'Physical Assets', desc: 'Gold, Silver — manually valued assets.' },
    };

    if (loading) return <div className="page-loader">Loading investments…</div>;

    return (
        <div className="page">
            <ConfirmModal
                open={!!deleteTarget} title="Delete Investment"
                message="Are you sure you want to delete this investment?"
                onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
            />

            <div className="dash-top-bar" style={{ marginBottom: 24, marginTop: 8 }}>
                <div>
                    <h1 className="dash-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FiTrendingUp style={{ color: 'var(--primary)' }} /> Investments
                    </h1>
                </div>
                <div className="dash-filters">
                    <select className="dash-filter-select" value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
                        <option>All Platforms</option>
                        {availablePlatforms.map(p => <option key={p}>{p}</option>)}
                    </select>
                    <select className="dash-filter-select" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                        <option>All Months</option>
                        {MONTHS.map(m => <option key={m}>{m}</option>)}
                    </select>
                    <select className="dash-filter-select" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                        <option>All Years</option>
                        {availableYears.map(y => <option key={y}>{y}</option>)}
                    </select>
                    <button className="dash-filter-icon-btn" onClick={handleClearFilters} title="Clear Filters"><FiRefreshCw /></button>
                </div>
            </div>

            {/* Portfolio Summary Cards */}
            <div className="inv-stat-row">
                <div className="inv-stat-card" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                    <FiTrendingUp className="isc-bg-icon" />
                    <p className="isc-label">Total Invested</p>
                    <p className="isc-value">{fmt(totalInvested)}</p>
                </div>
                <div className="inv-stat-card" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
                    <FiTrendingUp className="isc-bg-icon" />
                    <p className="isc-label">Current Value</p>
                    <p className="isc-value">{fmt(totalCurrent)}</p>
                </div>
                <div className="inv-stat-card" style={{ background: isGain ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                    <FiTrendingUp className="isc-bg-icon" />
                    <p className="isc-label">Total {isGain ? 'Gain' : 'Loss'}</p>
                    <p className="isc-value">{isGain ? '+' : ''}{fmt(totalGain)}</p>
                </div>
                <div className="inv-stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                    <FiTrendingUp className="isc-bg-icon" />
                    <p className="isc-label">Return</p>
                    <p className="isc-value">{isGain ? '+' : ''}{totalGainPct.toFixed(1)}%</p>
                </div>
            </div>

            {/* ── Category Tab Bar ── */}
            <div className="inv-tabs">
                {['Market', 'Deposit', 'Physical'].map(cat => (
                    <button key={cat}
                        className={`inv-tab ${tab === cat ? 'inv-tab-active' : ''}`}
                        onClick={() => { setTab(cat); resetForm(); }}>
                        <span className="inv-tab-icon">{tabInfo[cat].icon}</span>{tabInfo[cat].label}
                        <span className="inv-tab-count">{byCategory[cat].length}</span>
                    </button>
                ))}
            </div>

            {/* ── Tab Header ── */}
            <div className="inv-tab-header">
                <p className="inv-tab-desc">{tabInfo[tab].desc}</p>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}><FiPlus /> Add Investment</button>
            </div>

            {/* ── Form ── */}
            {showForm && (
                <InvestmentForm
                    editing={editing}
                    investments={investments}
                    defaultCategory={tab}
                    onClose={resetForm}
                    onSaved={() => { resetForm(); load(); }}
                />
            )}

            {/* ── Category-specific Table ── */}
            {tab === 'Market' && <MarketTable items={currentItems} onEdit={handleEdit} onDelete={setDeleteTarget} isMobile={isMobile} />}
            {tab === 'Deposit' && <DepositsTable items={currentItems} onEdit={handleEdit} onDelete={setDeleteTarget} isMobile={isMobile} />}
            {tab === 'Physical' && <PhysicalTable items={currentItems} onEdit={handleEdit} onDelete={setDeleteTarget} isMobile={isMobile} />}

        </div>
    );
}

import { useState, useMemo } from 'react';
import { FiX, FiDownload, FiAlertCircle } from 'react-icons/fi';
import { filterTransactions, downloadPDF, downloadExcel } from '../utils/downloadUtils';

const MONTHS = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January' }, { value: '2', label: 'February' },
    { value: '3', label: 'March' }, { value: '4', label: 'April' },
    { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' },
    { value: '9', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' },
];

const PAYMENT_MODES = [
    { value: 'All', label: 'All' },
    { value: 'Credit', label: 'Credit Card' },
    { value: 'Debit', label: 'Debit Card' },
    { value: 'NetBanking', label: 'Net Banking' },
    { value: 'Offline', label: 'Offline' },
];

export default function DownloadCenter({ open, onClose, transactions = [], tags = [], categories = [] }) {
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [tagId, setTagId] = useState('');
    const [catId, setCatId] = useState('');
    const [paymentMode, setPaymentMode] = useState('All');
    const [error, setError] = useState('');

    // Derive available years from data
    const years = useMemo(() =>
        [...new Set(transactions.map(t => new Date(t.date).getFullYear()))].sort((a, b) => b - a),
        [transactions]
    );

    // Live preview count
    const previewCount = useMemo(() => {
        return filterTransactions(transactions, {
            month: month || undefined,
            year: year || undefined,
            tagId: tagId || undefined,
            categoryId: catId || undefined,
            paymentMode,
        }).length;
    }, [transactions, month, year, tagId, catId, paymentMode]);

    const buildLabel = () => {
        const parts = [];
        if (month) parts.push(MONTHS.find(m => m.value === month)?.label || '');
        if (year) parts.push(year);
        if (tagId) {
            const tag = tags.find(t => t.id === tagId);
            if (tag) parts.push(`Tag: ${tag.name}`);
        }
        if (catId) {
            const cat = categories.find(c => c.id === catId);
            if (cat) parts.push(`Category: ${cat.name}`);
        }
        if (paymentMode !== 'All') parts.push(paymentMode);
        return parts.length > 0 ? parts.join(' · ') : 'All Transactions';
    };

    const handleDownload = (format) => {
        setError('');
        const filtered = filterTransactions(transactions, {
            month: month || undefined,
            year: year || undefined,
            tagId: tagId || undefined,
            categoryId: catId || undefined,
            paymentMode,
        });
        if (filtered.length === 0) {
            setError('No transactions found for the selected filters. Try a different combination.');
            return;
        }
        const label = buildLabel();
        if (format === 'pdf') downloadPDF(filtered, { title: label, dateRange: label });
        else downloadExcel(filtered, { title: label });
    };

    const handleReset = () => {
        setMonth(''); setYear(''); setTagId(''); setCatId(''); setPaymentMode('All'); setError('');
    };

    if (!open) return null;

    return (
        <>
            <div className="dl-overlay dl-overlay-open" onClick={onClose} />
            <div className="dl-panel dl-panel-open">
                {/* Header */}
                <div className="dl-panel-header">
                    <h3><FiDownload /> Download Center</h3>
                    <button className="btn-icon" onClick={onClose}><FiX /></button>
                </div>

                <div className="dl-panel-body">
                    {/* Error */}
                    {error && (
                        <div className="dl-error">
                            <FiAlertCircle /> {error}
                        </div>
                    )}

                    {/* Preview count */}
                    <div className="dl-preview-bar">
                        <span className="dl-preview-count">{previewCount}</span>
                        <span className="dl-preview-label">transaction{previewCount !== 1 ? 's' : ''} match your filters</span>
                        {(month || year || tagId || catId || paymentMode !== 'All') && (
                            <button className="dl-reset-btn" onClick={handleReset}>Reset</button>
                        )}
                    </div>

                    {/* ── Filter Grid ── */}
                    <div className="dl-filter-grid">
                        {/* Month */}
                        <div className="dl-filter-group">
                            <label className="dl-filter-label">Month</label>
                            <select className="dl-select" value={month} onChange={e => { setMonth(e.target.value); setError(''); }}>
                                {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>

                        {/* Year */}
                        <div className="dl-filter-group">
                            <label className="dl-filter-label">Year</label>
                            <select className="dl-select" value={year} onChange={e => { setYear(e.target.value); setError(''); }}>
                                <option value="">All Years</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        {/* Tag */}
                        <div className="dl-filter-group">
                            <label className="dl-filter-label">Tag</label>
                            <select className="dl-select" value={tagId} onChange={e => { setTagId(e.target.value); setError(''); }}>
                                <option value="">All Tags</option>
                                {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>

                        {/* Category */}
                        <div className="dl-filter-group">
                            <label className="dl-filter-label">Category</label>
                            <select className="dl-select" value={catId} onChange={e => { setCatId(e.target.value); setError(''); }}>
                                <option value="">All Categories</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Payment Mode chips */}
                    <div className="dl-filter-group" style={{ marginTop: '14px' }}>
                        <label className="dl-filter-label">Payment Mode</label>
                        <div className="dl-chips">
                            {PAYMENT_MODES.map(pm => (
                                <button
                                    key={pm.value}
                                    className={`dl-chip ${paymentMode === pm.value ? 'dl-chip-active' : ''}`}
                                    onClick={() => { setPaymentMode(pm.value); setError(''); }}
                                >
                                    {pm.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Download Buttons */}
                    <div className="dl-actions dl-actions-main">
                        <button
                            className="dl-btn dl-btn-pdf dl-btn-large"
                            onClick={() => handleDownload('pdf')}
                            disabled={previewCount === 0}
                        >
                            <FiDownload /> Download PDF
                        </button>
                        <button
                            className="dl-btn dl-btn-excel dl-btn-large"
                            onClick={() => handleDownload('excel')}
                            disabled={previewCount === 0}
                        >
                            <FiDownload /> Download Excel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

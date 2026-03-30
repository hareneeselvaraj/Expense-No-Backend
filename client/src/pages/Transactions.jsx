import { useState, useEffect, useMemo, useRef } from 'react';
import api from '../services/api';
import { FiPlus, FiTrash2, FiEdit2, FiDownload, FiFileText, FiGrid, FiUpload, FiChevronDown } from 'react-icons/fi';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import DownloadCenter from '../components/DownloadCenter';
import { downloadPDF, downloadExcel } from '../utils/downloadUtils';
import useDeviceDetect from '../hooks/useDeviceDetect';

const CustomFilterDropdown = ({ value, onChange, options, style }) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const selected = options.find(o => String(o.value) === String(value)) || options[0];

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: 'auto', minWidth: '130px' }}>
            <div
                className="tx-select-minimal"
                onClick={() => setOpen(!open)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    ...style, userSelect: 'none', width: '100%', gap: '8px'
                }}
            >
                <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selected?.label}
                </span>
                <FiChevronDown style={{ flexShrink: 0, opacity: 0.7, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
            </div>

            {open && (
                <div className="custom-dropdown-menu" style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: '6px',
                    width: '100%', minWidth: 'max-content', background: 'var(--bg-card)',
                    border: '1px solid var(--border)', borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)', zIndex: 100,
                    maxHeight: '280px', overflowY: 'auto', padding: '6px 0',
                    animation: 'fadeIn 0.15s ease-out'
                }}>
                    {options.map((opt, i) => {
                        const isSelected = String(value) === String(opt.value);
                        return (
                            <div key={i}
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                style={{
                                    padding: '10px 16px', fontSize: '0.85rem', fontWeight: isSelected ? 600 : 400,
                                    color: isSelected ? 'var(--primary)' : 'var(--text)',
                                    background: isSelected ? 'rgba(99,102,241,0.1)' : 'transparent',
                                    cursor: 'pointer', whiteSpace: 'nowrap',
                                    transition: 'background 0.1s'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isSelected) e.target.style.background = 'var(--bg-card-hover)';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isSelected) e.target.style.background = 'transparent';
                                }}
                            >
                                {opt.label}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const MONTHS = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'Jan' }, { value: '2', label: 'Feb' },
    { value: '3', label: 'Mar' }, { value: '4', label: 'Apr' },
    { value: '5', label: 'May' }, { value: '6', label: 'Jun' },
    { value: '7', label: 'Jul' }, { value: '8', label: 'Aug' },
    { value: '9', label: 'Sep' }, { value: '10', label: 'Oct' },
    { value: '11', label: 'Nov' }, { value: '12', label: 'Dec' },
];

export default function Transactions() {
    // ... skipping component body up to the JSX to use multi_replace instead
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [investments, setInvestments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [dlOpen, setDlOpen] = useState(false);
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterAccount, setFilterAccount] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterTag, setFilterTag] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadAccount, setUploadAccount] = useState('');
    const [uploading, setUploading] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkDeleteActive, setBulkDeleteActive] = useState(false);
    const [columnSearch, setColumnSearch] = useState({ date: '', description: '', category: '', account: '', type: '', tag: '', amount: '' });
    const [form, setForm] = useState({
        accountId: '', categoryId: '', amount: '', type: 'Expense',
        onlineOffline: 'Offline', bankMode: '', description: '', date: '',
        isMonitor: false, isAutoDebit: false, transferAccountId: '', tagId: '', investmentId: '',
    });

    const { isMobile } = useDeviceDetect(768);

    const toast = useToast();

    const loadData = async () => {
        try {
            const [txRes, accRes, catRes, tagRes, invRes] = await Promise.allSettled([
                api.get('/transaction'), api.get('/account'), api.get('/category'), api.get('/tag'), api.get('/investment'),
            ]);
            if (txRes.status === 'fulfilled') setTransactions(txRes.value.data);
            if (accRes.status === 'fulfilled') setAccounts(accRes.value.data);
            if (catRes.status === 'fulfilled') setCategories(catRes.value.data);
            if (tagRes.status === 'fulfilled') setTags(tagRes.value.data);
            if (invRes.status === 'fulfilled') setInvestments(invRes.value.data);
        } catch { /* ignore */ } finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

    const years = useMemo(() => {
        const y = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))].sort((a, b) => b - a);
        return y;
    }, [transactions]);

    const filtered = useMemo(() => {
        let list = [...transactions];
        if (filterYear) list = list.filter(t => new Date(t.date).getFullYear() === parseInt(filterYear));
        if (filterMonth) list = list.filter(t => new Date(t.date).getMonth() + 1 === parseInt(filterMonth));
        if (filterType) list = list.filter(t => t.type === filterType);
        if (filterAccount) list = list.filter(t => t.accountId === filterAccount);
        if (filterCategory) list = list.filter(t => t.categoryId === filterCategory);
        if (filterTag) list = list.filter(t => t.tagId === filterTag);
        // Column-level search filters
        if (columnSearch.date) list = list.filter(t => new Date(t.date).toLocaleDateString('en-IN').includes(columnSearch.date));
        if (columnSearch.description) list = list.filter(t => (t.description || '').toLowerCase().includes(columnSearch.description.toLowerCase()));
        if (columnSearch.category) list = list.filter(t => (t.categoryName || '').toLowerCase().includes(columnSearch.category.toLowerCase()));
        if (columnSearch.account) list = list.filter(t => (t.accountName || '').toLowerCase().includes(columnSearch.account.toLowerCase()));
        if (columnSearch.type) list = list.filter(t => (t.type || '').toLowerCase().includes(columnSearch.type.toLowerCase()));
        if (columnSearch.tag) list = list.filter(t => (t.tagName || '').toLowerCase().includes(columnSearch.tag.toLowerCase()));
        if (columnSearch.amount) list = list.filter(t => t.amount?.toString().includes(columnSearch.amount));
        return list;
    }, [transactions, filterMonth, filterYear, filterType, filterAccount, filterCategory, filterTag, columnSearch]);

    const resetForm = () => {
        setForm({ accountId: '', categoryId: '', amount: '', type: 'Expense', onlineOffline: 'Offline', bankMode: '', description: '', date: '', isMonitor: false, isAutoDebit: false, transferAccountId: '', tagId: '', investmentId: '' });
        setEditing(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            amount: parseFloat(form.amount),
            date: form.date || undefined,
            bankMode: form.onlineOffline === 'Online' ? (form.bankMode || 'NetBanking') : undefined,
            transferAccountId: form.type === 'Transfer' ? form.transferAccountId : undefined,
            tagId: form.tagId || undefined,
            investmentId: (form.type === 'Investment' && form.investmentId) ? form.investmentId : undefined,
        };
        try {
            if (editing) {
                await api.put(`/transaction/${editing}`, payload);
                toast.success('Transaction updated successfully');
            } else {
                await api.post('/transaction', payload);
                toast.success('Transaction created successfully');
            }
            resetForm();
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error saving transaction');
        }
    };

    const handleEdit = (tx) => {
        setForm({
            accountId: tx.accountId, categoryId: tx.categoryId,
            amount: tx.amount, type: tx.type, onlineOffline: tx.onlineOffline,
            bankMode: tx.bankMode || '', description: tx.description || '',
            date: tx.date?.split('T')[0] || '', isMonitor: tx.isMonitor,
            isAutoDebit: tx.isAutoDebit, transferAccountId: tx.transferAccountId || '',
            tagId: tx.tagId || '', investmentId: tx.investmentId || '',
        });
        setEditing(tx.id);
        setShowForm(true);
    };

    const handleDelete = async () => {
        if (!deleteTarget && !bulkDeleteActive) return;
        try {
            if (bulkDeleteActive) {
                const idsToDelete = Array.from(selectedIds);
                await api.delete('/transaction/bulk', { data: { ids: idsToDelete } });
                toast.success(`Successfully deleted ${idsToDelete.length} transactions`);
                setSelectedIds(new Set());
                setBulkDeleteActive(false);
            } else {
                await api.delete(`/transaction/${deleteTarget}`);
                toast.success('Transaction deleted successfully');
                setDeleteTarget(null);
            }
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error deleting transactions');
            setDeleteTarget(null);
            setBulkDeleteActive(false);
        }
    };

    const toggleSelect = (id) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filtered.length && filtered.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filtered.map(tx => tx.id)));
        }
    };

    const getDateRangeLabel = () => {
        const parts = [];
        if (filterMonth) {
            const m = MONTHS.find(m => m.value === filterMonth);
            if (m) parts.push(m.label);
        }
        if (filterYear) parts.push(filterYear);
        return parts.length > 0 ? parts.join(' ') : 'All Time';
    };

    const handleQuickPDF = () => {
        downloadPDF(filtered, {
            title: 'Transaction Report',
            dateRange: getDateRangeLabel(),
        });
    };

    const handleQuickExcel = () => {
        downloadExcel(filtered, {
            title: `Transaction Report — ${getDateRangeLabel()}`,
        });
    };

    if (loading) return <div className="page-loader">Loading…</div>;

    return (
        <div className="page">
            <ConfirmModal
                open={!!deleteTarget || bulkDeleteActive}
                title="Confirm Delete"
                message={bulkDeleteActive
                    ? `Are you sure you want to delete ${selectedIds.size} transactions? This action cannot be undone.`
                    : "Are you sure you want to delete this transaction? This action cannot be undone."}
                onConfirm={handleDelete}
                onCancel={() => {
                    setDeleteTarget(null);
                    setBulkDeleteActive(false);
                }}
            />

            <DownloadCenter
                open={dlOpen}
                onClose={() => setDlOpen(false)}
                transactions={transactions}
                tags={tags}
                categories={categories}
            />

            <div className="page-header" style={{ marginBottom: 20, gap: 12 }}>
                <h1 className="page-title" style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', margin: 0 }}>Transactions</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: isMobile ? 'nowrap' : 'wrap', width: isMobile ? '100%' : 'auto' }} className={isMobile ? "m-scroll-row" : ""}>
                    <div className="tx-premium-filters" style={{
                        display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)', padding: '6px 12px',
                        borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', flexWrap: isMobile ? 'nowrap' : 'wrap'
                    }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <CustomFilterDropdown
                                value={filterMonth} onChange={(val) => setFilterMonth(val)} options={MONTHS}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
                            />
                            <CustomFilterDropdown
                                value={filterYear} onChange={(val) => setFilterYear(val)}
                                options={[{ value: '', label: 'All Years' }, ...years.map(y => ({ value: y, label: String(y) }))]}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
                            />
                        </div>
                        <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
                        <div style={{ display: 'flex', gap: 8 }}>
                            <CustomFilterDropdown
                                value={filterType} onChange={(val) => setFilterType(val)}
                                options={[
                                    { value: '', label: 'All Types' },
                                    { value: 'Income', label: 'Income' },
                                    { value: 'Expense', label: 'Expense' },
                                    { value: 'Transfer', label: 'Transfer' },
                                    { value: 'Investment', label: 'Investment' },
                                    { value: 'Withdraw', label: 'Withdraw' }
                                ]}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer', outline: 'none' }}
                            />
                            <CustomFilterDropdown
                                value={filterAccount} onChange={(val) => setFilterAccount(val)}
                                options={[{ value: '', label: 'All Accounts' }, ...accounts.map(a => ({ value: a.id, label: a.name }))]}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer', outline: 'none' }}
                            />
                            <CustomFilterDropdown
                                value={filterCategory} onChange={(val) => setFilterCategory(val)}
                                options={[{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer', outline: 'none' }}
                            />
                            <CustomFilterDropdown
                                value={filterTag} onChange={(val) => setFilterTag(val)}
                                options={[{ value: '', label: 'All Tags' }, ...tags.map(t => ({ value: t.id, label: t.name }))]}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer', outline: 'none' }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-primary" onClick={() => setShowUpload(true)} style={{ height: 42, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)', boxShadow: 'none', whiteSpace: 'nowrap' }}>
                            <FiUpload /> Upload
                        </button>
                        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }} style={{ height: 42, borderRadius: 14, padding: '0 24px', fontWeight: 700, boxShadow: '0 8px 16px var(--primary-shadow)', whiteSpace: 'nowrap' }}>
                            <FiPlus /> New
                        </button>
                    </div>
                </div>
            </div>

            {selectedIds.size > 0 && (
                <div className="bulk-actions-bar" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(239, 68, 68, 0.1)',
                    padding: '12px 20px', borderRadius: 12, marginBottom: 20, border: '1px solid rgba(239, 68, 68, 0.2)', animation: 'fadeIn 0.3s ease'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontWeight: 600, color: 'var(--danger)' }}>{selectedIds.size} items selected</span>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelectedIds(new Set())}>Deselect All</button>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => setBulkDeleteActive(true)}>
                        <FiTrash2 /> Delete Selected
                    </button>
                </div>
            )}

            {showUpload && (
                <div className="modal-overlay" onClick={() => { setShowUpload(false); setUploadFile(null); setUploadAccount(''); }}>
                    <div className="modal-card" style={{ maxWidth: 450, padding: 32 }} onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">Upload Transactions</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 24 }}>Upload Excel (.xlsx) or PDF statements.</p>
                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label>Select Account</label>
                            <select className="form-input" style={{ background: 'var(--bg-card)' }} value={uploadAccount} onChange={e => setUploadAccount(e.target.value)}>
                                <option value="">Select an account...</option>
                                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                        <div style={{
                            border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 16, padding: '32px 16px', textAlign: 'center',
                            background: uploadFile ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)', transition: 'all 0.3s ease', cursor: 'pointer', marginBottom: 24, position: 'relative'
                        }} onClick={() => document.getElementById('file-upload').click()}>
                            <input id="file-upload" type="file" accept=".xlsx,.xls,.pdf" style={{ display: 'none' }} onChange={e => setUploadFile(e.target.files[0])} />
                            {uploadFile ? (
                                <div>
                                    <FiFileText style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: 12 }} />
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{uploadFile.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(uploadFile.size / 1024).toFixed(1)} KB</div>
                                </div>
                            ) : (
                                <div>
                                    <FiUpload style={{ fontSize: '2rem', color: 'var(--text-muted)', marginBottom: 12 }} />
                                    <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Choose a file</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Excel or PDF files supported</div>
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button className="btn btn-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text)' }} onClick={() => { setShowUpload(false); setUploadFile(null); setUploadAccount(''); }}>Cancel</button>
                            <button className="btn btn-primary btn-full" disabled={!uploadFile || !uploadAccount || uploading} onClick={async () => {
                                setUploading(true);
                                const formData = new FormData();
                                formData.append('file', uploadFile);
                                formData.append('accountId', uploadAccount);
                                try {
                                    const res = await api.post('/transaction/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                    toast.success(res.data?.message || 'Transactions uploaded successfully!');
                                    setShowUpload(false); setUploadFile(null); setUploadAccount(''); loadData();
                                } catch (err) {
                                    const msg = err.response?.data?.error || err.response?.data?.detail || 'Upload failed';
                                    toast.error(`Upload failed: ${msg}`);
                                } finally { setUploading(false); }
                            }}>
                                {uploading ? 'Uploading...' : 'Upload Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '0 4px', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: 12 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Showing <strong>{filtered.length}</strong> txns {getDateRangeLabel() !== 'All Time' ? `for ${getDateRangeLabel()}` : ''}
                </span>
                <div style={{ display: 'flex', gap: 8, maxWidth: '100%' }}>
                    <button className="btn-ghost m-btn-icon" onClick={handleQuickPDF} title="PDF">
                        <FiFileText /> <span className="m-hide-text">PDF</span>
                    </button>
                    <button className="btn-ghost m-btn-icon" onClick={handleQuickExcel} title="Excel">
                        <FiGrid /> <span className="m-hide-text">Excel</span>
                    </button>
                    <button className="btn btn-primary m-btn-icon" onClick={() => setDlOpen(true)} style={{ opacity: 0.9 }} title="Downloads">
                        <FiDownload /> <span className="m-hide-text">Downloads</span>
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-card" style={{ maxWidth: 520, textAlign: 'left', padding: '24px 28px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{editing ? 'Edit Transaction' : 'New Transaction'}</h3>
                            <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="form-grid">
                            <div className="form-group">
                                <label>Account</label>
                                <select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} required>
                                    <option value="">Select Account</option>
                                    {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select value={form.categoryId} onChange={(e) => {
                                    const catId = e.target.value;
                                    const selectedCat = categories.find(c => c.id === catId);
                                    setForm({ ...form, categoryId: catId, type: selectedCat ? selectedCat.type : form.type });
                                }} required>
                                    <option value="">Select Category</option>
                                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Amount</label>
                                <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                    <option value="Income">Income</option>
                                    <option value="Expense">Expense</option>
                                    <option value="Transfer">Transfer</option>
                                    <option value="Investment">Investment</option>
                                    <option value="Withdraw">Withdraw</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Online / Offline</label>
                                <select value={form.onlineOffline} onChange={(e) => setForm({ ...form, onlineOffline: e.target.value })}>
                                    <option value="Offline">Offline</option>
                                    <option value="Online">Online</option>
                                </select>
                            </div>
                            {form.onlineOffline === 'Online' && (
                                <div className="form-group">
                                    <label>Bank Mode</label>
                                    <select value={form.bankMode} onChange={(e) => setForm({ ...form, bankMode: e.target.value })}>
                                        <option value="NetBanking">Net Banking</option>
                                        <option value="Debit">Debit Card</option>
                                        <option value="Credit">Credit Card</option>
                                        <option value="GPay">GPay / UPI</option>
                                    </select>
                                </div>
                            )}
                            {form.type === 'Transfer' && (
                                <div className="form-group">
                                    <label>Transfer To</label>
                                    <select value={form.transferAccountId} onChange={(e) => setForm({ ...form, transferAccountId: e.target.value })} required>
                                        <option value="">Select Account</option>
                                        {accounts.filter((a) => a.id !== form.accountId).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                            )}
                            {(form.type === 'Investment' || (form.type === 'Expense' && form.isAutoDebit)) && (
                                <div className="form-group">
                                    <label>Link to Investment</label>
                                    <select value={form.investmentId} onChange={(e) => setForm({ ...form, investmentId: e.target.value })}>
                                        <option value="">None</option>
                                        {investments.map((inv) => <option key={inv.id} value={inv.id}>{inv.name} ({inv.assetType})</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" />
                            </div>
                            <div className="form-group form-check-row">
                                <label><input type="checkbox" checked={form.isMonitor} onChange={(e) => setForm({ ...form, isMonitor: e.target.checked })} /> Monitor</label>
                                <label><input type="checkbox" checked={form.isAutoDebit} onChange={(e) => setForm({ ...form, isAutoDebit: e.target.checked })} /> Auto-Debit</label>
                            </div>
                            <div className="form-group">
                                <label>Tag (Optional)</label>
                                <select value={form.tagId} onChange={(e) => setForm({ ...form, tagId: e.target.value })}>
                                    <option value="">No Tag</option>
                                    {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
                                <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isMobile ? (
                <div className="m-tx-list">
                    {filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                            No transactions found
                        </div>
                    ) : (
                        filtered.map(tx => (
                            <div key={tx.id} className="m-tx-card" onClick={() => handleEdit(tx)}>
                                <div className="m-tx-card-left">
                                    <div className={`m-tx-icon type-${tx.type.toLowerCase()}`}>
                                        {tx.type === 'Income' ? '+' : tx.type === 'Transfer' ? '⇄' : '-'}
                                    </div>
                                    <div className="m-tx-details">
                                        <div className="m-tx-title">{tx.description || tx.categoryName || 'Transaction'}</div>
                                        <div className="m-tx-subtitle">
                                            {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} &middot; {tx.accountName}
                                        </div>
                                    </div>
                                </div>
                                <div className="m-tx-card-right">
                                    <div className={`m-tx-amt type-${tx.type.toLowerCase()}`}>
                                        {tx.type === 'Income' ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: 40 }}>
                                    <input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleSelectAll} />
                                </th>
                                <th>Date</th><th>Description</th><th>Category</th><th>Account</th>
                                <th>Type</th><th>Tag</th><th>Channel</th><th className="text-right">Amount</th><th>Actions</th>
                            </tr>
                            <tr className="column-search-row">
                                <th></th>
                                <th><input type="text" placeholder="Search..." value={columnSearch.date} onChange={e => setColumnSearch({ ...columnSearch, date: e.target.value })} className="col-search-input" /></th>
                                <th><input type="text" placeholder="Search..." value={columnSearch.description} onChange={e => setColumnSearch({ ...columnSearch, description: e.target.value })} className="col-search-input" /></th>
                                <th><input type="text" placeholder="Search..." value={columnSearch.category} onChange={e => setColumnSearch({ ...columnSearch, category: e.target.value })} className="col-search-input" /></th>
                                <th><input type="text" placeholder="Search..." value={columnSearch.account} onChange={e => setColumnSearch({ ...columnSearch, account: e.target.value })} className="col-search-input" /></th>
                                <th><input type="text" placeholder="Search..." value={columnSearch.type} onChange={e => setColumnSearch({ ...columnSearch, type: e.target.value })} className="col-search-input" /></th>
                                <th><input type="text" placeholder="Search..." value={columnSearch.tag} onChange={e => setColumnSearch({ ...columnSearch, tag: e.target.value })} className="col-search-input" /></th>
                                <th></th>
                                <th><input type="text" placeholder="Search..." value={columnSearch.amount} onChange={e => setColumnSearch({ ...columnSearch, amount: e.target.value })} className="col-search-input" style={{ textAlign: 'right' }} /></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan="10" className="text-center">No transactions found</td></tr>
                            ) : (
                                filtered.map((tx) => (
                                    <tr key={tx.id} className={selectedIds.has(tx.id) ? 'row-selected' : ''}>
                                        <td>
                                            <input type="checkbox" checked={selectedIds.has(tx.id)} onChange={() => toggleSelect(tx.id)} />
                                        </td>
                                        <td>{new Date(tx.date).toLocaleDateString('en-IN')}</td>
                                        <td>{tx.description || '—'}</td>
                                        <td><span className="badge">{tx.categoryName}</span></td>
                                        <td>{tx.accountName}</td>
                                        <td><span className={`badge badge-${tx.type?.toLowerCase()}`}>{tx.type}</span></td>
                                        <td>{tx.tagName ? <span className="badge badge-tag">{tx.tagName}</span> : '—'}</td>
                                        <td>{tx.onlineOffline}{tx.bankMode ? ` · ${tx.bankMode}` : ''}</td>
                                        <td className="text-right amount-cell">₹{tx.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        <td>
                                            <div className="action-btns">
                                                <button className="btn-icon" onClick={() => handleEdit(tx)}><FiEdit2 /></button>
                                                <button className="btn-icon btn-danger" onClick={() => setDeleteTarget(tx.id)}><FiTrash2 /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

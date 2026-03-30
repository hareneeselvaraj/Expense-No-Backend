import { useState, useEffect } from 'react';
import api from '../services/api';
import { FiPlus, FiTrash2, FiHome, FiCreditCard, FiTarget, FiBriefcase, FiPocket } from 'react-icons/fi';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const TYPE_ICONS = {
    Bank: <FiHome />,
    CreditCard: <FiCreditCard />,
    Wallet: <FiPocket />,
    Cash: <FiTarget />,
    Investment: <FiBriefcase />
};

const TYPE_COLORS = {
    Bank: '#3b82f6',
    CreditCard: '#ef4444',
    Wallet: '#8b5cf6',
    Cash: '#10b981',
    Investment: '#f59e0b'
};

export default function Accounts() {
    const [accounts, setAccounts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const toast = useToast();
    const [form, setForm] = useState({ name: '', type: 'Bank', balance: '', creditLimit: '' });
    const [editingAccount, setEditingAccount] = useState(null);
    const [viewingLimit, setViewingLimit] = useState(null);

    const load = () => api.get('/account').then((res) => { 
        setAccounts(res.data); 
        setLoading(false); 
    });
    
    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { 
                ...form, 
                balance: parseFloat(form.balance || 0),
                creditLimit: form.type === 'CreditCard' ? parseFloat(form.creditLimit || 0) : null
            };

            if (editingAccount) {
                await api.put(`/account/${editingAccount.id}`, payload);
                toast.success('Account updated successfully');
            } else {
                await api.post('/account', payload);
                toast.success('Account created successfully');
            }
            
            setForm({ name: '', type: 'Bank', balance: '', creditLimit: '' });
            setEditingAccount(null);
            setShowForm(false);
            load();
        } catch (err) {
            toast.error(editingAccount ? 'Error updating account' : 'Error creating account');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/account/${deleteTarget}`);
            toast.success('Account deleted successfully');
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error deleting account');
        }
        setDeleteTarget(null);
    };

    const totalBalance = accounts.reduce((sum, a) => sum + (a.type?.toLowerCase() === 'creditcard' ? -a.balance : a.balance), 0);

    if (loading) return <div className="page-loader">Loading…</div>;

    return (
        <div className="page">
            <ConfirmModal
                open={!!deleteTarget}
                title="Confirm Delete"
                message="Are you sure you want to delete this account? This will remove all linked history."
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            {/* ── Add Account Modal ── */}
        {showForm && (
                <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingAccount(null); setForm({ name: '', type: 'Bank', balance: '', creditLimit: '' }); }}>
                    <div className="modal-card" style={{ maxWidth: 480, textAlign: 'left' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{editingAccount ? 'Edit Account' : 'Add New Account'}</h2>
                            <button onClick={() => { setShowForm(false); setEditingAccount(null); setForm({ name: '', type: 'Bank', balance: '', creditLimit: '' }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="form-grid">
                            <div className="form-group">
                                <label>Account Name</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. HDFC Bank, My Wallet" required />
                            </div>
                            <div className="form-group">
                                <label>Account Type</label>
                                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                    <option value="Bank">Bank</option>
                                    <option value="Cash">Cash</option>
                                    <option value="CreditCard">Credit Card</option>
                                    <option value="Wallet">Wallet</option>
                                    <option value="Investment">Investment</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ gridColumn: form.type === 'CreditCard' ? '1 / 2' : '1 / -1' }}>
                                <label>{form.type === 'CreditCard' ? 'Outstanding Amount' : 'Initial Balance'}</label>
                                <input type="number" step="0.01" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} placeholder="0.00" />
                            </div>
                            {form.type === 'CreditCard' && (
                                <div className="form-group" style={{ gridColumn: '2 / 3' }}>
                                    <label>Credit Limit</label>
                                    <input type="number" step="0.01" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} placeholder="e.g. 50000" />
                                </div>
                            )}
                            <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
                                <button type="submit" className="btn btn-primary">{editingAccount ? 'Update Account' : 'Create Account'}</button>
                                <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditingAccount(null); setForm({ name: '', type: 'Bank', balance: '', creditLimit: '' }); }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Credit Limit Detail Modal ── */}
            {viewingLimit && (
                <div className="modal-overlay" onClick={() => setViewingLimit(null)}>
                    <div className="modal-card" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <div style={{ 
                                width: 56, height: 56, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', 
                                color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                margin: '0 auto 16px', fontSize: '1.5rem' 
                            }}>
                                <FiCreditCard />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>{viewingLimit.name}</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Credit Card Utilization</p>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span style={{ color: 'var(--text-muted)' }}>Outstanding</span>
                                <span style={{ fontWeight: 600, color: '#ef4444' }}>₹{(viewingLimit.balance || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span style={{ color: 'var(--text-muted)' }}>Total Limit</span>
                                <span style={{ fontWeight: 600 }}>₹{(viewingLimit.creditLimit || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ color: 'var(--text-muted)' }}>Available</span>
                                <span style={{ fontWeight: 600, color: '#10b981' }}>₹{((viewingLimit.creditLimit || 0) - (viewingLimit.balance || 0)).toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 8 }}>
                                <span>Utilization</span>
                                <span style={{ color: (viewingLimit.creditLimit > 0 && (viewingLimit.balance / viewingLimit.creditLimit) > 0.8) ? '#ef4444' : 'var(--primary)' }}>
                                    {viewingLimit.creditLimit > 0 ? Math.round((viewingLimit.balance / viewingLimit.creditLimit) * 100) : 0}%
                                </span>
                            </div>
                            <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ 
                                    height: '100%', 
                                    width: `${viewingLimit.creditLimit > 0 ? Math.min(100, (viewingLimit.balance / viewingLimit.creditLimit) * 100) : 0}%`, 
                                    background: (viewingLimit.creditLimit > 0 && (viewingLimit.balance / viewingLimit.creditLimit) > 0.8) ? '#ef4444' : 'var(--primary)',
                                    transition: 'width 1s ease' 
                                }} />
                            </div>
                        </div>

                        <button className="btn btn-ghost" onClick={() => setViewingLimit(null)} style={{ width: '100%' }}>Close</button>
                    </div>
                </div>
            )}

            <div className="page-header">
                <div>
                    <h1 className="page-title">Accounts</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage your bank accounts and wallets</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}><FiPlus /> New Account</button>
            </div>

            {/* ── Summary Card ── */}
            <div className="acc-summary-row">
                <div className="acc-total-card">
                    <div className="acc-total-info">
                        <span className="acc-total-label">Total Net Worth</span>
                        <h2 className="acc-total-value">₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                    </div>
                    <div className="acc-total-icon"><FiHome /></div>
                    <div className="acc-total-bg-circle" />
                </div>
            </div>

            <div className="acc-grid">
                {accounts.map((a) => {
                    const icon = TYPE_ICONS[a.type] || <FiHome />;
                    const color = TYPE_COLORS[a.type] || '#3b82f6';
                    return (
                        <div key={a.id} className={`acc-card ${a.type?.toLowerCase() === 'creditcard' ? 'clickable' : ''}`} onClick={() => a.type?.toLowerCase() === 'creditcard' && setViewingLimit(a)}>
                            <div className="acc-card-header">
                                <div className="acc-card-icon" style={{ background: color + '20', color: color }}>
                                    {icon}
                                </div>
                                <div className="acc-card-actions">
                                    <button className="acc-edit-btn" onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingAccount(a);
                                        setForm({ 
                                            name: a.name, 
                                            type: a.type, 
                                            balance: a.balance.toString(), 
                                            creditLimit: a.creditLimit?.toString() || '' 
                                        });
                                        setShowForm(true);
                                    }} style={{ marginRight: 8, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                                    <button className="acc-delete-btn" onClick={(e) => { e.stopPropagation(); setDeleteTarget(a.id); }}><FiTrash2 /></button>
                                </div>
                            </div>
                            <div className="acc-card-content">
                                <h3 className="acc-card-name">{a.name}</h3>
                                <div className="acc-card-type-row">
                                    <span className="acc-card-type-label" style={{ background: color + '15', color: color }}>
                                        {a.type}
                                    </span>
                                </div>
                                <div className="acc-card-divider" />
                                 <div className="acc-card-balance-row">
                                    <span className="acc-balance-label">{a.type?.toLowerCase() === 'creditcard' ? 'Outstanding Amount' : 'Current Balance'}</span>
                                    <p className="acc-balance-value" style={{ color: a.type?.toLowerCase() === 'creditcard' ? '#ef4444' : 'inherit' }}>
                                        ₹{a.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                            <div className="acc-card-chip-eff" />
                        </div>
                    );
                })}

                {accounts.length === 0 && (
                    <div className="acc-empty">
                        <FiHome className="acc-empty-icon" />
                        <p>No accounts found. Add one to track your balances!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

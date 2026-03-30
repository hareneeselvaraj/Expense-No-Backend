import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { FiPlus, FiTrash2, FiTag, FiChevronDown, FiChevronUp, FiFolder, FiActivity, FiLayers, FiDollarSign, FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const TAG_PALETTES = [
    { gradient: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#6366f1', light: 'rgba(99,102,241,0.12)' },
    { gradient: 'linear-gradient(135deg, #10b981, #06b6d4)', color: '#10b981', light: 'rgba(16,185,129,0.12)' },
    { gradient: 'linear-gradient(135deg, #f43f5e, #fb923c)', color: '#f43f5e', light: 'rgba(244,63,94,0.12)' },
    { gradient: 'linear-gradient(135deg, #0ea5e9, #22d3ee)', color: '#0ea5e9', light: 'rgba(14,165,233,0.12)' },
    { gradient: 'linear-gradient(135deg, #f59e0b, #ec4899)', color: '#f59e0b', light: 'rgba(245,158,11,0.12)' },
    { gradient: 'linear-gradient(135deg, #8b5cf6, #d946ef)', color: '#8b5cf6', light: 'rgba(139,92,246,0.12)' },
];

export default function Tags() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [expandedTag, setExpandedTag] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const toast = useToast();
    const [tagDetail, setTagDetail] = useState(null);

    const load = () => api.get('/tag').then((res) => { setTags(res.data); setLoading(false); });
    useEffect(() => { load(); }, []);

    const resetForm = () => {
        setName('');
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tag', { name });
            toast.success('Tag created successfully');
            resetForm();
            load();
        } catch (err) {
            toast.error('Error creating tag');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/tag/${deleteTarget}`);
            toast.success('Tag deleted successfully');
            if (expandedTag === deleteTarget) { setExpandedTag(null); setTagDetail(null); }
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error deleting tag');
        }
        setDeleteTarget(null);
    };

    const toggleExpand = async (id) => {
        if (!id) {
            setExpandedTag(null);
            setTagDetail(null);
            return;
        }
        setExpandedTag(id);
        const res = await api.get(`/tag/${id}`);
        setTagDetail(res.data);
    };

    const stats = useMemo(() => {
        const totalCount = tags.length;
        // In a real app, you might fetch these from a summary endpoint, 
        // but for now we'll sum up what we have in the basic list if available,
        // or just show the count.
        return {
            totalTags: totalCount,
            activeGroups: tags.filter(t => t.transactionCount > 0).length,
        };
    }, [tags]);

    if (loading) return <div className="page-loader">Loading…</div>;

    return (
        <div className="page">
            <ConfirmModal
                open={!!deleteTarget}
                title="Confirm Delete"
                message="Are you sure you want to delete this tag? Transactions will be unlinked."
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            {/* ── Add Tag Modal ── */}
            {showForm && (
                <div className="modal-overlay" onClick={resetForm} style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-card"
                        style={{
                            maxWidth: 420,
                            textAlign: 'left',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 24,
                            padding: 32,
                            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                            animation: 'modalFadeIn 0.3s ease-out'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ background: 'var(--primary-glow)', padding: 8, borderRadius: 10, color: 'var(--primary)', display: 'flex' }}>
                                    <FiPlus size={20} />
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>Create New Tag</h2>
                            </div>
                            <button onClick={resetForm} style={{ background: 'var(--bg-input)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)' }} className="hover-scale">✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Tag Name</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Summer Vacation, Marriage, Project Alpha"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '14px 18px',
                                        background: 'var(--bg-input)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 14,
                                        color: 'var(--text)',
                                        fontSize: '1rem',
                                        transition: 'all 0.2s'
                                    }}
                                    autoFocus
                                />
                            </div>
                            <div style={{ background: 'var(--primary-glow)', padding: 16, borderRadius: 14, marginBottom: 28, borderLeft: '4px solid var(--primary)' }}>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>
                                    <strong>Tip:</strong> Tags are cross-categorical. They allow you to group transactions (like flights, hotels, and dinners) under one larger "event" tag.
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '14px', borderRadius: 14, fontWeight: 700 }}>Create Tag</button>
                                <button type="button" className="btn btn-ghost" onClick={resetForm} style={{ flex: 1, padding: '14px', borderRadius: 14 }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="page-header" style={{ marginBottom: 24 }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ background: 'var(--primary-glow)', padding: 10, borderRadius: 12, display: 'flex', color: 'var(--primary)' }}>
                            <FiTag />
                        </div>
                        Tags
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4 }}>
                        Organize and track your spending by projects, events, or custom groups.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ padding: '12px 24px', borderRadius: 14 }}>
                    <FiPlus /> New Tag
                </button>
            </div>

            {/* ── Stats Row ── */}
            <div className="cat-stats-row mobile-grid-2" style={{ marginBottom: 32 }}>
                <div className="cat-stat-card" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                    <div className="cat-stat-icon"><FiTag /></div>
                    <div>
                        <div className="cat-stat-count">{stats.totalTags}</div>
                        <div className="cat-stat-label">Total Tags</div>
                    </div>
                </div>
                <div className="cat-stat-card" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
                    <div className="cat-stat-icon"><FiLayers /></div>
                    <div>
                        <div className="cat-stat-count">{stats.activeGroups}</div>
                        <div className="cat-stat-label">Active Groups</div>
                    </div>
                </div>
            </div>

            <div className="tags-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {tags.map((tag, idx) => {
                    const palette = TAG_PALETTES[idx % TAG_PALETTES.length];
                    const initials = tag.name.slice(0, 2).toUpperCase();
                    const isExpanded = expandedTag === tag.id;

                    return (
                        <div key={tag.id}
                            className="tag-card-premium"
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: 18,
                                overflow: 'hidden',
                                transition: 'all 0.25s ease',
                                cursor: 'pointer',
                                boxShadow: 'var(--shadow-sm)',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            onClick={() => toggleExpand(tag.id)}
                        >
                            {/* Accent Glow */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 4,
                                background: palette.gradient,
                                opacity: 0.8
                            }} />

                            <div style={{ padding: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 10,
                                        background: palette.light,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: palette.color,
                                        fontSize: '1rem',
                                        fontWeight: 700
                                    }}>
                                        {initials}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{tag.name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <FiLayers size={12} /> {tag.transactionCount} Trans.
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <button
                                            className="btn-icon"
                                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(tag.id); }}
                                            style={{ color: 'var(--red)', background: 'rgba(239, 68, 68, 0.08)', width: 30, height: 30, borderRadius: 8 }}
                                        >
                                            <FiTrash2 size={13} />
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    );
                })}

                {tags.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', background: 'var(--bg-card)', borderRadius: 24, border: '1px dashed var(--border)' }}>
                        <div style={{
                            width: 80,
                            height: 80,
                            background: 'var(--primary-glow)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            color: 'var(--primary)',
                            fontSize: '2.5rem'
                        }}>
                            <FiTag />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>No Tags Created Yet</h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto 24px' }}>
                            Start grouping your related expenses into events or projects. Use the "New Tag" button to get started.
                        </p>
                        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                            <FiPlus /> Create Your First Tag
                        </button>
                    </div>
                )}
            </div>
            {/* ── Tag Detail Modal ── */}
            {expandedTag && tagDetail && (
                <div className="modal-overlay" onClick={() => toggleExpand(null)} style={{ backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.7)', zIndex: 1000 }}>
                    <div className="modal-card"
                        style={{
                            maxWidth: 750,
                            width: '90%',
                            textAlign: 'left',
                            background: 'rgba(23, 23, 33, 0.85)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 28,
                            padding: 0,
                            boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                            animation: 'modalFadeIn 0.3s ease-out',
                            overflow: 'hidden'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header with Gradient Background */}
                        <div style={{
                            padding: '32px 32px 24px',
                            background: 'linear-gradient(to bottom, rgba(99, 102, 241, 0.1), transparent)',
                            position: 'relative'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 12,
                                        background: 'var(--primary-glow)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--primary)'
                                    }}>
                                        <FiTag size={20} />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>{tagDetail.name}</h2>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>Project Detail & Activity</p>
                                    </div>
                                </div>
                                <button onClick={() => toggleExpand(null)} style={{ background: 'var(--bg-input)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)' }} className="hover-scale">✕</button>
                            </div>

                            <div className="tag-detail-stats mobile-grid-3">
                                {(() => {
                                    const incomeTotal = tagDetail.transactions?.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0) || 0;
                                    const expenseTotal = tagDetail.transactions?.filter(t => t.type !== 'Income').reduce((sum, t) => sum + t.amount, 0) || 0;
                                    const netBalance = incomeTotal - expenseTotal;
                                    return (
                                        <>
                                            <div style={{ background: 'rgba(16,185,129,0.06)', padding: '24px', borderRadius: 20, border: '1px solid rgba(16,185,129,0.12)' }}>
                                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 800 }}>Income</span>
                                                <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <FiArrowUpRight size={22} style={{ color: '#10b981' }} />
                                                    ₹{incomeTotal.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                                </span>
                                            </div>
                                            <div style={{ background: 'rgba(239,68,68,0.06)', padding: '24px', borderRadius: 20, border: '1px solid rgba(239,68,68,0.12)' }}>
                                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 800 }}>Expense</span>
                                                <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <FiArrowDownRight size={22} style={{ color: '#ef4444' }} />
                                                    ₹{expenseTotal.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                                </span>
                                            </div>
                                            <div style={{ background: netBalance >= 0 ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', padding: '24px', borderRadius: 20, border: `1px solid ${netBalance >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'}` }}>
                                                <span style={{ display: 'block', fontSize: '0.75rem', color: netBalance >= 0 ? '#10b981' : '#ef4444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 800 }}>Net Balance</span>
                                                <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <FiActivity size={22} style={{ color: netBalance >= 0 ? '#10b981' : '#ef4444' }} />
                                                    ₹{Math.abs(netBalance).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                                </span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Category Breakdown */}
                        <div style={{ padding: '0 32px 32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <div style={{ width: 4, height: 16, background: 'var(--primary)', borderRadius: 2 }} />
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: 0.5 }}>Category Breakdown</h3>
                            </div>

                            {tagDetail.transactions?.length > 0 ? (
                                <div className="table-wrapper">
                                    <table className="modern-table" style={{ fontSize: '0.85rem' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ background: 'var(--bg-input)' }}>Category</th>
                                                <th style={{ background: 'var(--bg-input)', textAlign: 'right', color: '#10b981' }}>Income</th>
                                                <th style={{ background: 'var(--bg-input)', textAlign: 'right', color: '#ef4444' }}>Expense</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(
                                                tagDetail.transactions.reduce((acc, tx) => {
                                                    const cat = tx.categoryName || 'Uncategorized';
                                                    if (!acc[cat]) acc[cat] = { income: 0, expense: 0 };
                                                    if (tx.type === 'Income') acc[cat].income += tx.amount;
                                                    else acc[cat].expense += tx.amount;
                                                    return acc;
                                                }, {})
                                            ).map(([category, totals]) => (
                                                <tr key={category} className="hover-row">
                                                    <td style={{ padding: '14px 16px' }}>
                                                        <span style={{
                                                            padding: '4px 12px',
                                                            borderRadius: 8,
                                                            background: 'rgba(255,255,255,0.05)',
                                                            color: 'var(--text)',
                                                            fontSize: '0.78rem',
                                                            fontWeight: 600,
                                                            border: '1px solid rgba(255,255,255,0.08)'
                                                        }}>{category}</span>
                                                    </td>
                                                    <td style={{ textAlign: 'right', fontWeight: 800, padding: '14px 16px', color: '#10b981' }}>
                                                        {totals.income > 0 ? `₹${totals.income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                                                    </td>
                                                    <td style={{ textAlign: 'right', fontWeight: 800, padding: '14px 16px', color: '#ef4444' }}>
                                                        {totals.expense > 0 ? `₹${totals.expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '60px 0', background: 'rgba(255,255,255,0.02)', borderRadius: 22, border: '1px dashed var(--border)' }}>
                                    <FiFolder style={{ fontSize: '2.5rem', color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>No transaction history found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

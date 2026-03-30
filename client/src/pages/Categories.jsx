import { useState, useEffect } from 'react';
import api from '../services/api';
import { FiPlus, FiTrash2, FiTag, FiTrendingUp, FiDollarSign, FiBarChart2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { useToast } from '../components/Toast';
import useDeviceDetect from '../hooks/useDeviceDetect';

import ConfirmModal from '../components/ConfirmModal';

const TYPE_CONFIG = {
    Income:     { gradient: 'linear-gradient(135deg, #10b981, #06b6d4)', icon: <FiTrendingUp />, light: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', text: '#10b981' },
    Expense:    { gradient: 'linear-gradient(135deg, #ef4444, #f59e0b)', icon: <FiDollarSign />, light: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',   text: '#ef4444' },
    Investment: { gradient: 'linear-gradient(135deg, #6366f1, #a855f7)', icon: <FiBarChart2 />,  light: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.25)',  text: '#6366f1' },
};

const DOT_COLORS = {
    Income:     ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#14b8a6', '#6366f1'],
    Expense:    ['#ef4444', '#f59e0b', '#8b5cf6', '#64748b', '#ec4899', '#14b8a6'],
    Investment: ['#6366f1', '#a855f7', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
};

const SECTION_ORDER = ['Income', 'Expense', 'Investment'];

const CATEGORY_ICONS = [
    '🏠','🍔','✈️','🎬','📚','🚗','💊','💪','🛍️','🎮','💡','🏋️','🎵','👗','🌿','🐾',
    '🏨','⛱️','🏦','💰','💳','💎','⛽','🛠️','🔩','🎁','🛒','📱','💻','🏥','⚽','🍷',
    '👶','🐶','🎨','🚀','📱','💧','⚡','🔥','🎓','🛕','👩','📦','🚌','👤','✏️','🏛️',
];

export default function Categories() {
    const [categories, setCategories]   = useState([]);
    const [showForm, setShowForm]       = useState(false);
    const [loading, setLoading]         = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [editingId, setEditingId]     = useState(null);
    const [editForm, setEditForm]       = useState({ name: '', type: '', icon: null });
    const [savingId, setSavingId]       = useState(null);
    const toast = useToast();
    const { isMobile } = useDeviceDetect(768);
    const [form, setForm] = useState({ name: '', type: 'Expense', icon: null });


    const load = () => api.get('/category').then(res => { setCategories(res.data); setLoading(false); });
    useEffect(() => { load(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/category', { name: form.name, type: form.type, icon: form.icon });
            setForm({ name: '', type: 'Expense', icon: null });
            setShowForm(false);
            toast.success('Category created!');
            load();
        } catch { toast.error('Failed to create category.'); }
    };

    const startEdit = (c) => {
        setEditingId(c.id);
        setEditForm({ name: c.name, type: c.type, icon: c.icon || null });
    };

    const cancelEdit = () => { setEditingId(null); };

    const saveEdit = async (id) => {
        setSavingId(id);
        try {
            await api.put(`/category/${id}`, editForm);
            toast.success('Category updated!');
            setEditingId(null);
            load();
        } catch { toast.error('Failed to update category.'); }
        finally { setSavingId(null); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/category/${deleteTarget}`);
            toast.success('Category deleted');
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cannot delete: category has linked transactions.');
        }
        setDeleteTarget(null);
    };

    const grouped = {};
    SECTION_ORDER.forEach(t => { grouped[t] = []; });
    categories.forEach(c => {
        if (grouped[c.type]) grouped[c.type].push(c);
        else grouped[c.type] = [c];
    });

    if (loading) return <div className="page-loader">Loading…</div>;

    return (
        <div className="page">
            <ConfirmModal
                open={!!deleteTarget}
                title="Confirm Delete"
                message="Are you sure you want to delete this category?"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            {/* ── Add Modal ── */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-card" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Add Category</h2>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}>✕</button>
                        </div>
                        <form onSubmit={handleCreate} className="form-grid">
                            <div className="form-group">
                                <label>Name</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Travel, Health" required />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option value="Income">Income</option>
                                    <option value="Expense">Expense</option>
                                    <option value="Investment">Investment</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label>Icon</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                    {CATEGORY_ICONS.map(ic => (
                                        <button key={ic} type="button"
                                            onClick={() => setForm({ ...form, icon: form.icon === ic ? null : ic })}
                                            style={{
                                                width: 36, height: 36, fontSize: '1.1rem',
                                                border: form.icon === ic ? '2px solid var(--primary)' : '1px solid var(--border)',
                                                borderRadius: 8, background: form.icon === ic ? 'var(--bg-card)' : 'transparent',
                                                cursor: 'pointer'
                                            }}
                                        >{ic}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
                                <button type="submit" className="btn btn-primary">Create</button>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Header ── */}
            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ fontSize: isMobile ? '1.5rem' : '1.8rem' }}><FiTag /> Categories</h1>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Manage your expense, income and investment categories
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <FiPlus /> Add Category
                </button>
            </div>

            {/* ── Stats Row ── */}
            <div className="cat-stats-row">
                {SECTION_ORDER.map(type => {
                    const cfg   = TYPE_CONFIG[type];
                    const count = grouped[type]?.length ?? 0;
                    return (
                        <div key={type} className="cat-stat-card" style={{ background: cfg.gradient }}>
                            <div className="cat-stat-icon">{cfg.icon}</div>
                            <div>
                                <div className="cat-stat-count">{count}</div>
                                <div className="cat-stat-label">{type}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Grid Sections ── */}
            {SECTION_ORDER.map(type => {
                const cats = grouped[type] || [];
                const cfg  = TYPE_CONFIG[type];
                const palette = DOT_COLORS[type];
                if (cats.length === 0) return null;

                return (
                    <div key={type} className="cat-section-block">
                        <div className="cat-section-header">
                            <div className="cat-section-badge" style={{ background: cfg.gradient }}>
                                {cfg.icon}
                            </div>
                            <h2 className="cat-section-heading">{type}</h2>
                            <span className="cat-section-count">{cats.length} Categories</span>
                        </div>

                        <div className="cat-cards-grid">
                            {cats.map((c, idx) => {
                                const isEditing = editingId === c.id;
                                const color = palette[idx % palette.length];
                                const initials = c.name.slice(0, 1).toUpperCase();

                                return (
                                    <div key={c.id} className={`cat-card ${isEditing ? 'cat-item-editing' : ''}`} style={{ '--cat-color': color }}>
                                        {isEditing ? (
                                            <div className="cat-edit-form">
                                                <div className="cat-edit-row">
                                                    <input
                                                        className="cat-edit-input"
                                                        value={editForm.name}
                                                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                                        autoFocus
                                                    />
                                                    <select
                                                        className="cat-edit-select"
                                                        value={editForm.type}
                                                        onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
                                                    >
                                                        <option value="Income">Income</option>
                                                        <option value="Expense">Expense</option>
                                                        <option value="Investment">Investment</option>
                                                    </select>
                                                </div>
                                                <div className="cat-edit-icons">
                                                    {CATEGORY_ICONS.slice(0, 8).map(ic => (
                                                        <button key={ic} type="button"
                                                            onClick={() => setEditForm(f => ({ ...f, icon: f.icon === ic ? null : ic }))}
                                                            style={{
                                                                width: 26, height: 26, fontSize: '0.85rem',
                                                                border: editForm.icon === ic ? '2px solid var(--primary)' : '1px solid var(--border)',
                                                                borderRadius: 4, background: editForm.icon === ic ? 'rgba(99,102,241,0.1)' : 'transparent',
                                                                cursor: 'pointer'
                                                            }}
                                                        >{ic}</button>
                                                    ))}
                                                </div>
                                                <div className="cat-edit-actions">
                                                    <button className="btn btn-primary cat-edit-save" onClick={() => saveEdit(c.id)}>
                                                        {savingId === c.id ? '…' : <FiCheck />}
                                                    </button>
                                                    <button className="btn btn-ghost cat-edit-cancel" onClick={cancelEdit}><FiX /></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="cat-card-avatar" style={{ background: color + '15', color: color, fontSize: (c.icon && c.icon.length > 2) ? '0.7rem' : '0.9rem' }}>
                                                    {c.icon && c.icon.length <= 2 ? c.icon : initials}
                                                </div>
                                                <div className="cat-card-info">
                                                    <p className="cat-card-name">{c.name}</p>
                                                    <span className="cat-card-type" style={{ background: color + '15', color: color }}>{c.type}</span>
                                                </div>
                                                <div className="cat-item-actions">
                                                    <button className="cat-card-edit" onClick={() => startEdit(c)} title="Edit">
                                                        <FiEdit2 size={13} />
                                                    </button>
                                                    <button className="cat-card-delete" onClick={() => setDeleteTarget(c.id)} title="Delete">
                                                        <FiTrash2 size={13} />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

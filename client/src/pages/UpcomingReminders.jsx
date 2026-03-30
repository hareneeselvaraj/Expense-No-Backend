import { useState, useEffect } from 'react';
import { FiBell, FiPlus, FiCalendar, FiCheck, FiClock, FiAlertCircle, FiX, FiTag, FiTrendingUp } from 'react-icons/fi';
import api from '../services/api';



const priorityConfig = {
    high:   { color: '#ef4444', bg: '#fef2f2', label: 'High',   icon: <FiAlertCircle /> },
    medium: { color: '#f59e0b', bg: '#fffbeb', label: 'Medium', icon: <FiClock />       },
    low:    { color: '#10b981', bg: '#f0fdf4', label: 'Low',    icon: <FiCheck />        },
};

const categoryColors = {
    Loan:         '#6366f1',
    Work:         '#8b5cf6',
    Transfer:     '#06b6d4',
    Subscription: '#f59e0b',
    Bills:        '#ef4444',
    Entertainment:'#ec4899',
    General:      '#64748b',
};

export default function UpcomingReminders() {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('all');
    const [form, setForm] = useState({ title: '', date: '', amount: '', category: 'General', priority: 'medium' });

    const fetchReminders = () => {
        setLoading(true);
        api.get('/reminder').then(res => {
            setReminders(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchReminders();
    }, []);

    const upcomingCount  = reminders.filter(r => r.status !== 'completed').length;
    const completedCount = reminders.filter(r => r.status === 'completed').length;

    const filteredReminders = filter === 'completed'
        ? reminders.filter(r => r.status === 'completed')
        : filter === 'uncompleted'
        ? reminders.filter(r => r.status !== 'completed')
        : reminders;

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            amount: form.amount ? Number(form.amount) : null,
            date: new Date(form.date).toISOString()
        };
        
        api.post('/reminder', payload).then(res => {
            setReminders([res.data, ...reminders]);
            setShowForm(false);
            setForm({ title: '', date: '', amount: '', category: 'General', priority: 'medium' });
        });
    };

    const handleDone = (id) => {
        api.put(`/reminder/${id}/complete`).then(() => {
            setReminders(reminders.map(r => r.id === id ? { ...r, status: r.status === 'completed' ? 'upcoming' : 'completed' } : r));
        });
    };

    const handleDelete = (id) => {
        if (!window.confirm('Are you sure you want to delete this reminder?')) return;
        api.delete(`/reminder/${id}`).then(() => {
            setReminders(reminders.filter(r => r.id !== id));
        });
    };

    return (
        <div className="page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title"><FiBell /> Reminders</h1>
                    <p className="page-subtitle">Stay on top of your financial commitments</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <FiPlus /> Add Reminder
                </button>
            </div>

            {/* Stats/Filter Pills */}
            <div className="reminder-stats-row">
                <div className={`reminder-stat-pill${filter === 'all' ? ' rsp-active-all' : ''}`} onClick={() => setFilter('all')}>
                    <FiBell /> <span>{reminders.length} Total</span>
                </div>
                <div className={`reminder-stat-pill rsp-upcoming${filter === 'uncompleted' ? ' rsp-active-upcoming' : ''}`} onClick={() => setFilter('uncompleted')}>
                    <FiClock /> <span>{upcomingCount} Upcoming</span>
                </div>
                <div className={`reminder-stat-pill rsp-completed${filter === 'completed' ? ' rsp-active-completed' : ''}`} onClick={() => setFilter('completed')}>
                    <FiCheck /> <span>{completedCount} Completed</span>
                </div>
            </div>

            {/* List */}
            <div className="reminders-list-premium">
                {filteredReminders.length === 0 && (
                    <div className="reminders-empty">
                        <FiBell />
                        <p>No reminders in this category</p>
                    </div>
                )}
                {filteredReminders.map((r, i) => {
                    const date = new Date(r.date);
                    const dateLabel = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
                    const daysLeft = Math.floor((date - new Date()) / (1000 * 60 * 60 * 24));
                    const pCfg = priorityConfig[r.priority];
                    const catColor = categoryColors[r.category] || '#64748b';
                    const isDone = r.status === 'completed';

                    let urgencyLabel = `In ${daysLeft} days`;
                    let urgencyColor = '#94a3b8';
                    if (daysLeft < 0)       { urgencyLabel = 'Overdue';   urgencyColor = '#ef4444'; }
                    else if (daysLeft === 0) { urgencyLabel = 'Today';    urgencyColor = '#ef4444'; }
                    else if (daysLeft === 1) { urgencyLabel = 'Tomorrow'; urgencyColor = '#f59e0b'; }
                    else if (daysLeft <= 3)  {                             urgencyColor = '#f59e0b'; }

                    return (
                        <div
                            className={`reminder-premium-card${isDone ? ' reminder-done' : ''}`}
                            key={r.id}
                            style={{ '--cat-color': catColor, '--pri-color': pCfg.color, animationDelay: `${i * 0.07}s` }}
                        >
                            <div className="reminder-accent-stripe" />

                            <div className="reminder-priority-icon" style={{ color: pCfg.color, background: pCfg.bg }}>
                                {pCfg.icon}
                            </div>

                            <div className="reminder-content">
                                <div className="reminder-top-row">
                                    <h3 className={`reminder-title${isDone ? ' reminder-strikethrough' : ''}`}>{r.title}</h3>
                                    <span className="reminder-cat-badge" style={{ background: `${catColor}18`, color: catColor }}>
                                        <FiTag /> {r.category}
                                    </span>
                                </div>
                                <div className="reminder-meta">
                                    <span className="reminder-meta-item"><FiCalendar /> {dateLabel}</span>
                                    {r.amount && <span className="reminder-amount-badge"><span className="rupee-sym">₹</span> {r.amount.toLocaleString('en-IN')}</span>}
                                    <span className="reminder-urgency-chip" style={{ color: urgencyColor, background: `${urgencyColor}20` }}>
                                        {urgencyLabel}
                                    </span>
                                </div>
                            </div>

                            <button
                                className={`reminder-done-btn${isDone ? ' reminder-done-completed' : ''}`}
                                onClick={() => handleDone(r.id)}
                                disabled={isDone}
                                style={!isDone ? { '--btn-color': pCfg.color } : {}}
                            >
                                <FiCheck />
                                {isDone ? 'Done ✓' : 'Mark Done'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Add Reminder Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-card" style={{ maxWidth: 520, textAlign: 'left' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FiBell style={{ color: 'var(--primary)' }} /> Add Reminder
                            </h2>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.3rem' }}><FiX /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="form-grid">
                            <div className="form-group">
                                <label>Title</label>
                                <input required placeholder="e.g. Pay Monthly Loan" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Amount (Optional)</label>
                                <input type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <input required value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="e.g. Bills, Work" />
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label>Priority</label>
                                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                                    <option value="high">🔴 High</option>
                                    <option value="medium">🟡 Medium</option>
                                    <option value="low">🟢 Low</option>
                                </select>
                            </div>
                            <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
                                <button type="submit" className="btn btn-primary">Add Reminder</button>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

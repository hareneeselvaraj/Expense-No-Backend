import { useState, useEffect } from 'react';
import { FiTarget, FiPlus, FiHome, FiShoppingBag, FiAirplay, FiCheckCircle, FiClock, FiList, FiAlertCircle, FiEdit2, FiX, FiDollarSign, FiHeart, FiBriefcase, FiGift, FiCoffee, FiTruck, FiSmile, FiStar, FiUmbrella, FiMusic, FiArrowRight, FiBook, FiCamera, FiGlobe, FiAward, FiTrendingUp, FiZap, FiCheck, FiBox, FiVideo, FiMapPin, FiFeather, FiPlay, FiFilm, FiBarChart2 } from 'react-icons/fi';
import useDeviceDetect from '../hooks/useDeviceDetect';

const ICON_CHOICES = [
    { name: 'Target', icon: <FiTarget /> },
    { name: 'Home', icon: <FiHome /> },
    { name: 'Shopping', icon: <FiShoppingBag /> },
    { name: 'Tech', icon: <FiAirplay /> },
    { name: 'Savings', icon: <FiDollarSign /> },
    { name: 'Health', icon: <FiHeart /> },
    { name: 'Work', icon: <FiBriefcase /> },
    { name: 'Gift', icon: <FiGift /> },
    { name: 'Lifestyle', icon: <FiCoffee /> },
    { name: 'Vehicle', icon: <FiTruck /> },
    { name: 'Travel', icon: <FiArrowRight /> },
    { name: 'Book', icon: <FiBook /> },
    { name: 'Camera', icon: <FiCamera /> },
    { name: 'Globe', icon: <FiGlobe /> },
    { name: 'Award', icon: <FiAward /> },
    { name: 'Investment', icon: <FiTrendingUp /> },
    { name: 'Fitness', icon: <FiZap /> },
    { name: 'Success', icon: <FiCheck /> },
    { name: 'Goods', icon: <FiBox /> },
    { name: 'Video', icon: <FiVideo /> },
    { name: 'Location', icon: <FiMapPin /> },
    { name: 'Nature', icon: <FiFeather /> },
    { name: 'Entertainment', icon: <FiPlay /> },
    { name: 'Movies', icon: <FiFilm /> },
    { name: 'Analysis', icon: <FiBarChart2 /> },
    { name: 'Personal', icon: <FiSmile /> },
    { name: 'Special', icon: <FiStar /> },
    { name: 'Protection', icon: <FiUmbrella /> },
    { name: 'Music', icon: <FiMusic /> },
];

const COLOR_CHOICES = [
    '#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#64748b'
];
const initialGoals = [
    {
        id: 1,
        icon: <FiHome />,
        title: 'Dream Home Down Payment',
        description: '20% down payment for 3BHK',
        target: 1500000,
        current: 345000,
        deadline: '2028-12-31',
        color: '#6366f1',
    },
    {
        id: 2,
        icon: <FiAirplay />,
        title: 'Emergency Fund',
        description: '6 months of living expenses',
        target: 180000,
        current: 148000,
        deadline: '2026-06-30',
        color: '#10b981',
    },
    {
        id: 3,
        icon: <FiShoppingBag />,
        title: 'Japan Vacation',
        description: '10-day Japan trip with family',
        target: 250000,
        current: 62000,
        deadline: '2026-12-31',
        color: '#f59e0b',
    },
    {
        id: 4,
        icon: <FiTarget />,
        title: 'Investment Portfolio',
        description: 'Build ₹10L investment corpus',
        target: 1000000,
        current: 824000,
        deadline: '2026-09-30',
        color: '#f43f5e',
    },
    {
        id: 5,
        icon: <FiCheckCircle />,
        title: 'New MacBook Pro',
        description: 'M4 MacBook Pro for work',
        target: 250000,
        current: 210000,
        deadline: '2026-04-30',
        color: '#06b6d4',
    },
];

export default function Goals() {
    const { isMobile } = useDeviceDetect(768);
    const [goals, setGoals] = useState(initialGoals);
    const [loaded, setLoaded] = useState(false);

    // Unified Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        target: '',
        current: '',
        deadline: '',
        icon: ICON_CHOICES[0].icon,
        iconName: ICON_CHOICES[0].name,
        color: COLOR_CHOICES[0]
    });

    useEffect(() => {
        const timer = setTimeout(() => setLoaded(true), 50);
        return () => clearTimeout(timer);
    }, []);

    const totalTarget = goals.reduce((a, g) => a + g.target, 0);
    const totalCurrent = goals.reduce((a, g) => a + g.current, 0);
    const totalRemaining = Math.max(0, goals.reduce((a, g) => a + (g.target - g.current), 0));

    const completedGoalsNum = goals.filter(g => g.current >= g.target).length;

    const handleAddClick = () => {
        setEditingGoal(null);
        setFormData({
            title: '',
            description: '',
            target: '',
            current: '0',
            deadline: new Date().toISOString().split('T')[0],
            icon: ICON_CHOICES[0].icon,
            iconName: ICON_CHOICES[0].name,
            color: COLOR_CHOICES[0]
        });
        setShowModal(true);
    };

    const handleEditClick = (goal) => {
        setEditingGoal(goal);
        setFormData({
            title: goal.title,
            description: goal.description,
            target: goal.target.toString(),
            current: goal.current.toString(),
            deadline: goal.deadline,
            icon: goal.icon,
            iconName: ICON_CHOICES.find(ic => ic.icon.type === goal.icon.type)?.name || 'Target',
            color: goal.color
        });
        setShowModal(true);
    };

    const handleSubmitGoal = (e) => {
        e.preventDefault();
        const goalData = {
            title: formData.title,
            description: formData.description,
            target: Number(formData.target),
            current: Number(formData.current),
            deadline: formData.deadline,
            icon: formData.icon,
            color: formData.color
        };

        if (editingGoal) {
            setGoals(prev => prev.map(g => g.id === editingGoal.id ? { ...g, ...goalData } : g));
        } else {
            setGoals(prev => [...prev, { ...goalData, id: Date.now() }]);
        }
        setShowModal(false);
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title"><FiTarget /> Financial Goals</h1>
                    <p className="page-subtitle">Track and achieve your deepest financial aspirations</p>
                </div>
                <button className="btn btn-primary" onClick={handleAddClick}><FiPlus /> Add Goal</button>
            </div>

            {/* Premium Stat Cards */}
            <div className="goals-summary-cards">
                <div className="goal-stat-card variant-indigo" style={{ animationDelay: '0s' }}>
                    <FiList className="goal-stat-bg-icon" />
                    <p className="goal-stat-label">{isMobile ? 'Active' : 'Active Goals'}</p>
                    <p className="goal-stat-value">{goals.length}</p>

                </div>

                <div className="goal-stat-card variant-amber" style={{ animationDelay: '0.1s' }}>
                    <FiTarget className="goal-stat-bg-icon" />
                    <p className="goal-stat-label">{isMobile ? 'Target' : 'Total Target'}</p>
                    <p className="goal-stat-value">₹{(totalTarget / 1000).toFixed(0)}k</p>

                </div>

                <div className="goal-stat-card variant-emerald" style={{ animationDelay: '0.2s' }}>
                    <FiCheckCircle className="goal-stat-bg-icon" />
                    <p className="goal-stat-label">{isMobile ? 'Saved' : 'Total Saved'}</p>
                    <p className="goal-stat-value">₹{(totalCurrent / 1000).toFixed(0)}k</p>

                </div>

                <div className="goal-stat-card variant-rose" style={{ animationDelay: '0.3s' }}>
                    <FiClock className="goal-stat-bg-icon" />
                    <p className="goal-stat-label">Remaining</p>
                    <p className="goal-stat-value">₹{(totalRemaining / 1000).toFixed(0)}k</p>
                </div>

                <div className="goal-stat-card variant-cyan" style={{ animationDelay: '0.4s' }}>
                    <FiAward className="goal-stat-bg-icon" />
                    <p className="goal-stat-label">{isMobile ? 'Done' : 'Goals Completed'}</p>
                    <p className="goal-stat-value">{completedGoalsNum}</p>

                </div>
            </div>

            {/* Premium Goals Grid */}
            <div className="goals-grid">
                {goals.map((goal, i) => {
                    const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
                    const daysLeft = Math.floor((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));

                    let deadlineClass = 'safe';
                    let deadlineIcon = <FiClock />;
                    if (daysLeft < 0) { deadlineClass = 'urgent'; deadlineIcon = <FiAlertCircle />; }
                    else if (daysLeft < 30) { deadlineClass = 'urgent'; deadlineIcon = <FiAlertCircle />; }
                    else if (daysLeft < 90) { deadlineClass = 'warning'; }

                    const radius = 50; // increased for larger 140px circle SVG
                    const circumference = 2 * Math.PI * radius;
                    const strokeDashoffset = loaded ? circumference - (pct / 100) * circumference : circumference;

                    return (
                        <div className="goal-premium-card" key={goal.id} style={{ '--goal-color': goal.color, animationDelay: `${0.4 + i * 0.1}s` }}>

                            <div className="goal-card-hero">
                                <div className="goal-hero-icon">{goal.icon}</div>
                                <button className="goal-edit-btn" onClick={() => handleEditClick(goal)} title="Update Goal">
                                    <FiEdit2 />
                                </button>
                            </div>

                            <div className="goal-card-body">
                                <h3 className="goal-title">{goal.title}</h3>
                                <p className="goal-desc">{goal.description}</p>

                                <div className="goal-ring-container">
                                    <svg className="goal-ring-svg" viewBox="0 0 140 140" preserveAspectRatio="xMidYMid meet">
                                        <circle
                                            className="goal-ring-bg"
                                            cx="70" cy="70" r={radius}
                                        />
                                        <circle
                                            className="goal-ring-fill"
                                            cx="70" cy="70" r={radius}
                                            strokeDasharray={circumference}
                                            strokeDashoffset={strokeDashoffset}
                                        />
                                    </svg>
                                    <div className="goal-ring-content">
                                        <span className="goal-ring-pct">{pct}%</span>
                                        <span className="goal-ring-label">Complete</span>
                                    </div>
                                </div>

                                <div className="goal-card-footer">
                                    <div className="goal-footer-amount">
                                        <span className="goal-saved">₹{goal.current.toLocaleString()}</span>
                                        <span className="goal-target">of ₹{goal.target.toLocaleString()} target</span>
                                    </div>
                                    <span className={`goal-deadline-pill ${deadlineClass}`}>
                                        {deadlineIcon}
                                        {daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Due Today' : `${daysLeft} days left`}
                                    </span>
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>

            {/* Add/Edit Goal Modal */}
            {showModal && (
                <div className="goal-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="goal-modal" style={{ '--goal-color': formData.color }} onClick={e => e.stopPropagation()}>
                        <div className="goal-modal-header">
                            <h2>{editingGoal ? `Edit '${editingGoal.title}'` : 'Create New Goal'}</h2>
                            <button className="goal-modal-close" onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <form className="goal-modal-form" onSubmit={handleSubmitGoal}>
                            <div className="goal-input-grid">
                                <div className="goal-input-group">
                                    <label>Goal Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Save for a Car"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="goal-input-group">
                                    <label>Brief Description</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Monthly savings target"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="goal-input-grid triple">
                                <div className="goal-input-group">
                                    <label>Target Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.target}
                                        onChange={e => setFormData({ ...formData, target: e.target.value })}
                                    />
                                </div>
                                <div className="goal-input-group">
                                    <label>Currently Saved (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.current}
                                        onChange={e => setFormData({ ...formData, current: e.target.value })}
                                    />
                                </div>
                                <div className="goal-input-group">
                                    <label>Target Deadline</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.deadline}
                                        onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="goal-selector-section">
                                <label>Choose Icon</label>
                                <div className="goal-icon-grid">
                                    {ICON_CHOICES.map(ic => (
                                        <div
                                            key={ic.name}
                                            className={`goal-icon-opt ${formData.iconName === ic.name ? 'selected' : ''}`}
                                            onClick={() => setFormData({ ...formData, icon: ic.icon, iconName: ic.name })}
                                            title={ic.name}
                                        >
                                            {ic.icon}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="goal-selector-section">
                                <label>Theme Color</label>
                                <div className="goal-color-grid">
                                    {COLOR_CHOICES.map(c => (
                                        <div
                                            key={c}
                                            className={`goal-color-opt ${formData.color === c ? 'selected' : ''}`}
                                            style={{ '--opt-color': c }}
                                            onClick={() => setFormData({ ...formData, color: c })}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="goal-modal-actions">
                                <button type="button" className="goal-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="goal-btn-save">{editingGoal ? 'Update Goal' : 'Create Goal'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

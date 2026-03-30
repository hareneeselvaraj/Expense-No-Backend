import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { useAuth } from '../context/AuthContext';
import {
    FiHome, FiCreditCard, FiGrid, FiDollarSign, FiTarget,
    FiClock, FiBell, FiList, FiLogOut, FiTrendingUp, FiBarChart2, FiCpu, FiTruck, FiChevronLeft, FiChevronRight, FiTag, FiZap, FiUsers, FiSettings, FiUploadCloud, FiShield
} from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import { CoupleContext } from '../context/CoupleContext';
import { useContext } from 'react';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const { isCouple } = useContext(CoupleContext);
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
        // Dispatch event to app layout to adjust main content margin if needed
        document.body.classList.toggle('sidebar-collapsed', !isCollapsed);
    };

    const wealthLinks = [
        { to: '/wealth', icon: <FiBarChart2 />, label: 'Wealth Dashboard' },
        { to: '/stocks', icon: <FiTrendingUp />, label: 'Stocks & Equity' },
        { to: '/mutual-funds', icon: <FiZap />, label: 'Mutual Funds' },
        { to: '/other-assets', icon: <FiDollarSign />, label: 'Other Assets' },
        { to: '/investments', icon: <FiSettings />, label: 'Manage All' },
        { to: '/portfolio', icon: <FiList />, label: 'Portfolio' },
    ];

    const expenseLinks = [
        { to: '/transactions', icon: <FiCreditCard />, label: 'Transactions' },
        { to: '/statement-import', icon: <FiUploadCloud />, label: 'Statement Import' },
        { to: '/budgets', icon: <FiBarChart2 />, label: 'Budgets' },
        { to: '/categories', icon: <FiGrid />, label: 'Categories' },
        { to: '/tags', icon: <FiTag />, label: 'Tags' },
        { to: '/accounts', icon: <FiDollarSign />, label: 'Accounts' },
    ];

    const taxLinks = [
        { to: '/tax-reports', icon: <FiList />, label: 'Tax Dashboard' },
        { to: '/tax-advisor', icon: <FiShield />, label: 'AI Tax Advisor' },
    ];

    const moreLinks = [
        { to: '/goals', icon: <FiTarget />, label: 'Goals' },
        { to: '/reminders', icon: <FiBell />, label: 'Reminders' },
        { to: '/history', icon: <FiClock />, label: 'History' },
        { to: '/mileage', icon: <FiTruck />, label: 'Mileage' },
        { to: '/ai-insights', icon: <FiCpu />, label: 'AI Insights' },
        { to: '/couple', icon: <FiUsers />, label: 'Shared Finance', badge: isCouple },
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Brand */}
            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <span className="sidebar-logo-icon">💰</span>
                </div>
                <h2>ExpenseTracker</h2>
                <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
                    {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                </button>
            </div>

            {/* User Profile */}
            <div className="sidebar-profile">
                <div className="sidebar-avatar">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="sidebar-profile-info">
                    <p className="sidebar-profile-name">{user?.name || 'User'}</p>
                    <p className="sidebar-profile-role">{isCouple ? 'Couple Mode' : 'Personal'}</p>
                </div>
            </div>

            {/* Main Nav */}
            <nav className="sidebar-nav">
                <NavLink
                    to="/"
                    end={true}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    title={isCollapsed ? 'Dashboard' : undefined}
                >
                    <FiHome />
                    <span>Dashboard</span>
                </NavLink>

                <div className="sidebar-divider" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }} />
                <div className="nav-section-title">{!isCollapsed && 'Expense Tracking'}</div>

                {expenseLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        title={isCollapsed ? link.label : undefined}
                    >
                        {link.icon}
                        <span>{link.label}</span>
                    </NavLink>
                ))}

                <div className="sidebar-divider" />
                <div className="nav-section-title">{!isCollapsed && 'Wealth'}</div>
                {wealthLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to === '/'}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        title={isCollapsed ? link.label : undefined}
                    >
                        {link.icon}
                        <span>{link.label}</span>
                    </NavLink>
                ))}

                <div className="sidebar-divider" />
                <div className="nav-section-title">{!isCollapsed && 'Tax Filing'}</div>

                {taxLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        title={isCollapsed ? link.label : undefined}
                    >
                        {link.icon}
                        <span>{link.label}</span>
                    </NavLink>
                ))}

                <div className="sidebar-divider" />
                <div className="nav-section-title">{!isCollapsed && 'More'}</div>

                {moreLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        title={isCollapsed ? link.label : undefined}
                    >
                        {link.icon}
                        <span>
                            {link.label}
                            {link.badge && <span className="couple-badge"></span>}
                        </span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <ThemeToggle />
                <button className="logout-btn" onClick={handleLogout} title={isCollapsed ? "Log Out" : undefined}>
                    <FiLogOut /> <span>Log Out</span>
                </button>
            </div>
        </aside>
    );
}

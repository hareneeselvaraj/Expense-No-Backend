import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiHome, FiCreditCard, FiPieChart, FiTrendingUp, FiCpu, FiX, FiSearch, FiBell } from 'react-icons/fi';
import Sidebar from './Sidebar';
import FloatingCalculator from './FloatingCalculator';
import AIChat from './AI/AIChat';

export default function MobileLayout() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Close drawer on navigation
    useEffect(() => {
        setDrawerOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [drawerOpen]);

    const bottomTabs = [
        { path: '/', icon: <FiHome />, label: 'Home' },
        { path: '/transactions', icon: <FiCreditCard />, label: 'Txns' },
        { path: '/budgets', icon: <FiPieChart />, label: 'Budget' },
        { path: '/wealth', icon: <FiTrendingUp />, label: 'Wealth' },
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="app-layout mobile-mode">
            {/* ─── TOP HEADER ─── */}
            <header className="m-header">
                <button className="m-header-btn" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
                    <FiMenu size={22} />
                </button>
                <div className="m-header-brand">
                    <span className="m-brand-icon">💰</span>
                    <span className="m-brand-text">ExpenseTracker</span>
                </div>
                <button className="m-header-btn" onClick={() => navigate('/ai-insights')} aria-label="Notifications">
                    <FiBell size={20} />
                </button>
            </header>

            {/* ─── DRAWER OVERLAY ─── */}
            {drawerOpen && (
                <div className="m-drawer-overlay" onClick={() => setDrawerOpen(false)}>
                    <div className="m-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="m-drawer-close-row">
                            <span className="m-drawer-title">Menu</span>
                            <button className="m-drawer-close" onClick={() => setDrawerOpen(false)}>
                                <FiX size={22} />
                            </button>
                        </div>
                        <Sidebar />
                    </div>
                </div>
            )}

            {/* ─── MAIN CONTENT ─── */}
            <main className="m-main">
                <Outlet />
            </main>

            {/* ─── FLOATING WIDGETS ─── */}
            <FloatingCalculator />
            <AIChat />

            {/* ─── BOTTOM TAB BAR ─── */}
            <nav className="m-bottom-nav">
                {bottomTabs.map((tab) => (
                    <button
                        key={tab.path}
                        className={`m-tab ${isActive(tab.path) ? 'm-tab-active' : ''}`}
                        onClick={() => navigate(tab.path)}
                    >
                        <span className="m-tab-icon">{tab.icon}</span>
                        <span className="m-tab-label">{tab.label}</span>
                    </button>
                ))}
                
                {/* Placeholder for Floating AI Button to overlay perfectly */}
                <div className="m-tab m-tab-ai-placeholder" style={{ visibility: 'hidden', pointerEvents: 'none' }}>
                    <span className="m-tab-icon"><FiCpu /></span>
                    <span className="m-tab-label">AI</span>
                </div>
            </nav>
        </div>
    );
}

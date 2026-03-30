import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import FloatingCalculator from './FloatingCalculator';
import AIChat from './AI/AIChat';

export default function DesktopLayout() {
    return (
        <div className="app-layout desktop-mode">
            <div className="sidebar-container">
                <Sidebar />
            </div>

            <main className="main-content">
                <Outlet />
            </main>

            {/* Floating Widgets — desktop only */}
            <FloatingCalculator />
            <AIChat />
        </div>
    );
}

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { invalidateAllCache } from '../services/driveStorage';
import { useState } from 'react';
import { 
    FiUser, FiMoon, FiSun, FiRefreshCw, FiExternalLink, 
    FiCheckCircle, FiShield, FiDatabase, FiCloud, FiLogOut, FiLayout, FiSettings, FiChevronRight
} from 'react-icons/fi';
import { useToast } from '../components/Toast';
import ModernDropdown from '../components/ModernDropdown';
import useDeviceDetect from '../hooks/useDeviceDetect';

export default function Settings() {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { isMobile } = useDeviceDetect(768);
    const toast = useToast();
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            invalidateAllCache();
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Cloud data synced successfully!');
        } catch (error) {
            toast.error('Sync failed: ' + error.message);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="settings-page" style={{ 
            padding: isMobile ? '16px' : '32px', 
            maxWidth: '1000px', 
            margin: '0 auto',
            animation: 'fadeIn 0.4s ease-out'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                <div style={{ background: 'rgba(99,102,241,0.1)', padding: 10, borderRadius: 12, color: 'var(--primary)' }}>
                    <FiSettings size={22} />
                </div>
                <h1 style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>App Settings</h1>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))', 
                gap: 24 
            }}>
                {/* Profile Card */}
                <section style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    padding: 24, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', flexDirection: 'column', gap: 20
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.8 }}>
                        <FiUser size={18} color="var(--primary)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)' }}>User Profile</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ 
                            width: 72, height: 72, borderRadius: 24, 
                            background: 'linear-gradient(135deg, var(--primary), #818cf8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.8rem', fontWeight: 800, color: '#fff',
                            boxShadow: '0 8px 24px rgba(99,102,241,0.3)'
                        }}>
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)' }}>{user?.name || 'User Account'}</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.email || 'user@example.com'}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>
                                <FiCheckCircle size={14} /> Verified Account
                            </div>
                        </div>
                    </div>
                </section>

                {/* Appearance Card */}
                <section style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    padding: 24, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', flexDirection: 'column', gap: 20
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: 0.8 }}>
                        <FiLayout size={18} color="#f59e0b" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)' }}>Appearance</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {isDark ? <FiMoon size={20} color="#f59e0b" /> : <FiSun size={20} color="#f59e0b" />}
                            <span style={{ fontWeight: 600 }}>Theme Mode</span>
                        </div>
                        <ModernDropdown
                            value={isDark ? 'dark' : 'light'}
                            onChange={(val) => { if ((val === 'dark' && !isDark) || (val === 'light' && isDark)) toggleTheme(); }}
                            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', minWidth: 100, height: 36 }}
                            options={[
                                { value: 'dark', label: 'Dark' },
                                { value: 'light', label: 'Light' }
                            ]}
                        />
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', paddingLeft: 4 }}>
                        Customize your visual experience. Dark mode is optimized for low-light environments.
                    </p>
                </section>

                {/* Cloud Sync Card */}
                <section style={{ 
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(16,185,129,0.02))', 
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    padding: 24, borderRadius: 24, border: '1px solid rgba(16,185,129,0.1)',
                    display: 'flex', flexDirection: 'column', gap: 20,
                    gridColumn: isMobile ? 'auto' : 'span 2'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <FiCloud size={18} color="#10b981" />
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#10b981', opacity: 0.8 }}>Cloud Storage</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>
                            Connected to Drive
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: 20 }}>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            <div style={{ background: '#10b981', padding: 14, borderRadius: 20, color: '#fff', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>
                                <FiDatabase size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 4px 0', fontWeight: 700, fontSize: '1.1rem' }}>Google Drive Smart Sync</h4>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: 400 }}>Your data is securely stored in your private App Data folder. Syncing ensures your latest transactions are visible across all devices.</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleSync}
                            disabled={isSyncing}
                            style={{ 
                                padding: '12px 24px', borderRadius: 16, 
                                background: '#10b981', color: '#fff',
                                border: 'none', fontWeight: 800, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 10,
                                boxShadow: '0 8px 20px rgba(16,185,129,0.2)',
                                transition: 'all 0.2s ease',
                                width: isMobile ? '100%' : 'auto',
                                justifyContent: 'center',
                                opacity: isSyncing ? 0.7 : 1,
                                transform: isSyncing ? 'scale(0.98)' : 'none'
                            }}
                        >
                            <FiRefreshCw className={isSyncing ? 'spin' : ''} style={{ fontSize: '1.1rem' }} />
                            {isSyncing ? 'Syncing...' : 'Sync Now'}
                        </button>
                    </div>
                </section>
            </div>

            {/* Footer Actions */}
            <div style={{ 
                marginTop: 40, 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row', 
                gap: 16 
            }}>
                <button 
                    onClick={() => window.open('https://myaccount.google.com/permissions', '_blank')}
                    style={{ 
                        flex: 1, padding: '16px', borderRadius: 20, 
                        background: 'rgba(255,255,255,0.05)', color: 'var(--text)',
                        border: '1px solid rgba(255,255,255,0.1)', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        transition: 'all 0.2s', fontSize: '0.95rem'
                    }}
                >
                    <FiShield style={{ color: '#818cf8' }} /> Google Permissions <FiExternalLink opacity={0.5} />
                </button>
                <button 
                    onClick={logout}
                    style={{ 
                        flex: 1, padding: '16px', borderRadius: 20, 
                        background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                        border: '1px solid rgba(239,68,68,0.2)', fontWeight: 800, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        transition: 'all 0.2', fontSize: '0.95rem'
                    }}
                >
                    <FiLogOut /> Sign Out
                </button>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .settings-page button:hover:not(:disabled) {
                    filter: brightness(1.1);
                    transform: translateY(-1px);
                }
                .settings-page button:active:not(:disabled) {
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
}

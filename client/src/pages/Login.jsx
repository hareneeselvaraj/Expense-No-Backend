import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [error, setError] = useState('');
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        setError('');
        try {
            await login();
            navigate('/');
        } catch (err) {
            setError(err.message || 'Google Sign-In failed. Please try again.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <span className="auth-icon">💰</span>
                    <h1>Welcome to Expense Tracker</h1>
                    <p>Sign in with your Google account to continue</p>
                </div>
                
                {error && <div className="alert alert-error">{error}</div>}
                
                <button 
                    type="button" 
                    className="btn btn-primary btn-full" 
                    onClick={handleGoogleSignIn} 
                    disabled={loading}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        padding: '14px 24px',
                        fontSize: '1rem',
                        fontWeight: 600
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                        <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {loading ? 'Signing in…' : 'Sign in with Google'}
                </button>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.8rem', opacity: 0.6 }}>
                    Your data is stored securely in your personal Google Drive
                </p>
            </div>
        </div>
    );
}

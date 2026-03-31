import { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signOut as googleSignOut, restoreSession, silentSignIn, onTokenExpiry } from '../services/googleAuth';
import { initializeUserData } from '../services/driveStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);

    // On mount: check if user was previously signed in
    useEffect(() => {
        const restored = restoreSession();
        if (restored && localStorage.getItem('user')) {
            setUser(JSON.parse(localStorage.getItem('user')));
            setLoading(false);
        } else if (localStorage.getItem('user')) {
            // Token expired, try silent re-auth
            silentSignIn()
                .then((userData) => {
                    setUser(userData);
                    setLoading(false);
                })
                .catch(() => {
                    // Silent re-auth failed, clear state
                    localStorage.removeItem('user');
                    setUser(null);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }

        // Register token expiry callback
        onTokenExpiry(() => {
            silentSignIn()
                .then((userData) => setUser(userData))
                .catch(() => {
                    setUser(null);
                    localStorage.removeItem('user');
                });
        });
    }, []);

    const login = async () => {
        setLoading(true);
        try {
            const userData = await signIn();
            setUser(userData);
            // Initialize user data in Drive if first-time user
            try {
                await initializeUserData();
            } catch (e) {
                console.warn('User data initialization skipped or failed:', e);
            }
            return userData;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        googleSignOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

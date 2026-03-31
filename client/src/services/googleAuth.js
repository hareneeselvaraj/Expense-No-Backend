import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from '../config/google';

let tokenClient = null;
let tokenExpiryTimer = null;
let onTokenExpiryCallback = null;

/**
 * Load the Google Identity Services script dynamically
 */
function loadGISScript() {
    return new Promise((resolve, reject) => {
        if (window.google?.accounts?.oauth2) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
        document.head.appendChild(script);
    });
}

/**
 * Initialize Google Auth — call once on app load
 */
export async function initGoogleAuth() {
    await loadGISScript();
    // tokenClient is initialized lazily in signIn()
}

/**
 * Opens Google popup, returns { name, email, picture }
 */
export function signIn() {
    return new Promise(async (resolve, reject) => {
        try {
            await loadGISScript();

            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: GOOGLE_SCOPES,
                callback: async (tokenResponse) => {
                    if (tokenResponse.error) {
                        reject(new Error(tokenResponse.error));
                        return;
                    }

                    // Store access token globally for driveStorage.js
                    window.__googleAccessToken = tokenResponse.access_token;
                    
                    // Store token expiry
                    const expiresIn = tokenResponse.expires_in || 3600;
                    const expiryTimestamp = Date.now() + (expiresIn * 1000);
                    localStorage.setItem('google_token_expiry', expiryTimestamp.toString());
                    localStorage.setItem('google_access_token', tokenResponse.access_token);

                    // Set up refresh timer (5 minutes before expiry)
                    setupTokenRefreshTimer(expiresIn);

                    // Fetch user profile
                    try {
                        const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                        });
                        const profile = await profileRes.json();
                        
                        const user = {
                            name: profile.name,
                            email: profile.email,
                            picture: profile.picture
                        };
                        
                        localStorage.setItem('user', JSON.stringify(user));
                        resolve(user);
                    } catch (err) {
                        reject(new Error('Failed to fetch user profile'));
                    }
                },
                error_callback: (error) => {
                    reject(new Error(error.message || 'Google Sign-In failed'));
                }
            });

            tokenClient.requestAccessToken({ prompt: 'consent' });
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Silent re-authentication (no popup)
 */
export function silentSignIn() {
    return new Promise(async (resolve, reject) => {
        try {
            await loadGISScript();

            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: GOOGLE_SCOPES,
                callback: async (tokenResponse) => {
                    if (tokenResponse.error) {
                        reject(new Error(tokenResponse.error));
                        return;
                    }

                    window.__googleAccessToken = tokenResponse.access_token;
                    
                    const expiresIn = tokenResponse.expires_in || 3600;
                    const expiryTimestamp = Date.now() + (expiresIn * 1000);
                    localStorage.setItem('google_token_expiry', expiryTimestamp.toString());
                    localStorage.setItem('google_access_token', tokenResponse.access_token);

                    setupTokenRefreshTimer(expiresIn);

                    try {
                        const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                        });
                        const profile = await profileRes.json();
                        
                        const user = {
                            name: profile.name,
                            email: profile.email,
                            picture: profile.picture
                        };
                        
                        localStorage.setItem('user', JSON.stringify(user));
                        resolve(user);
                    } catch (err) {
                        reject(new Error('Failed to fetch user profile'));
                    }
                },
                error_callback: (error) => {
                    reject(new Error(error.message || 'Silent sign-in failed'));
                }
            });

            // Use prompt: '' for silent re-auth
            tokenClient.requestAccessToken({ prompt: '' });
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Clears token, clears localStorage
 */
export function signOut() {
    const token = window.__googleAccessToken;
    if (token) {
        window.google?.accounts?.oauth2?.revoke(token);
    }
    
    window.__googleAccessToken = null;
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
    localStorage.removeItem('user');
    
    if (tokenExpiryTimer) {
        clearTimeout(tokenExpiryTimer);
        tokenExpiryTimer = null;
    }
}

/**
 * Returns current access token or null
 */
export function getAccessToken() {
    // Check if token is still valid
    const expiry = localStorage.getItem('google_token_expiry');
    if (expiry && Date.now() > parseInt(expiry)) {
        window.__googleAccessToken = null;
        return null;
    }
    return window.__googleAccessToken || localStorage.getItem('google_access_token');
}

/**
 * Returns true/false
 */
export function isAuthenticated() {
    return !!getAccessToken();
}

/**
 * Register callback for when token expires
 */
export function onTokenExpiry(callback) {
    onTokenExpiryCallback = callback;
}

/**
 * Set up a timer to refresh the token 5 minutes before expiry
 */
function setupTokenRefreshTimer(expiresInSeconds) {
    if (tokenExpiryTimer) {
        clearTimeout(tokenExpiryTimer);
    }
    
    // Refresh 5 minutes (300 seconds) before expiry
    const refreshIn = Math.max(0, (expiresInSeconds - 300)) * 1000;
    
    tokenExpiryTimer = setTimeout(async () => {
        try {
            await silentSignIn();
        } catch (err) {
            console.warn('Token refresh failed, user needs to re-authenticate');
            if (onTokenExpiryCallback) {
                onTokenExpiryCallback();
            }
        }
    }, refreshIn);
}

/**
 * Restore token from localStorage on page reload
 */
export function restoreSession() {
    const token = localStorage.getItem('google_access_token');
    const expiry = localStorage.getItem('google_token_expiry');
    
    if (token && expiry && Date.now() < parseInt(expiry)) {
        window.__googleAccessToken = token;
        const remainingSeconds = Math.floor((parseInt(expiry) - Date.now()) / 1000);
        setupTokenRefreshTimer(remainingSeconds);
        return true;
    }
    
    return false;
}

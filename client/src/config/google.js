// Google OAuth Configuration
// The Client ID is PUBLIC — it is NOT a secret. Safe to put in frontend code.
export const GOOGLE_CLIENT_ID = '662914629259-2je14351aruq9gosso3opngkig4qoie2.apps.googleusercontent.com';

// Scopes we need:
// - drive.appdata: Read/write to hidden app-specific folder in user's Drive
// - profile: User's name and profile picture
// - email: User's email address
export const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.appdata profile email';

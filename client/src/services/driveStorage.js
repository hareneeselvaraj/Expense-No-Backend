import { getAccessToken } from './googleAuth';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD = 'https://www.googleapis.com/upload/drive/v3';

// ── In-memory cache ──
const cache = {};
const CACHE_TTL = 30000; // 30 seconds
const fileIdCache = {}; // filename → Drive file ID

function getCached(tableName) {
    const entry = cache[tableName];
    if (entry && (Date.now() - entry.timestamp < CACHE_TTL)) {
        return entry.data;
    }
    return null;
}

function setCache(tableName, data) {
    cache[tableName] = { data, timestamp: Date.now() };
}

export function invalidateCache(tableName) {
    delete cache[tableName];
    delete fileIdCache[tableName + '.json'];
}

export function invalidateAllCache() {
    Object.keys(cache).forEach(k => delete cache[k]);
    Object.keys(fileIdCache).forEach(k => delete fileIdCache[k]);
}

function authHeaders() {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');
    return { Authorization: `Bearer ${token}` };
}

// ── Find file ID by name in appDataFolder ──
async function findFileId(fileName) {
    if (fileIdCache[fileName]) return fileIdCache[fileName];

    const headers = authHeaders();
    const query = encodeURIComponent(`name='${fileName}'`);
    const res = await fetch(
        `${DRIVE_API}/files?spaces=appDataFolder&q=${query}&fields=files(id,name)`,
        { headers }
    );

    if (res.status === 401) throw new Error('TOKEN_EXPIRED');
    if (!res.ok) return null;

    const data = await res.json();
    if (data.files && data.files.length > 0) {
        fileIdCache[fileName] = data.files[0].id;
        return data.files[0].id;
    }
    return null;
}

// ── Core Drive Operations ──

export async function readTable(tableName) {
    // Check cache first
    const cached = getCached(tableName);
    if (cached !== null) return cached;

    const fileName = tableName + '.json';
    try {
        const fileId = await findFileId(fileName);
        if (!fileId) return null;

        const headers = authHeaders();
        const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, { headers });

        if (res.status === 401) throw new Error('TOKEN_EXPIRED');
        if (res.status === 404) return null;
        if (!res.ok) return null;

        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = [];
        }
        setCache(tableName, data);
        return data;
    } catch (err) {
        if (err.message === 'TOKEN_EXPIRED') throw err;
        console.error(`Error reading ${tableName}:`, err);
        // Return cached data if available, even if expired
        const entry = cache[tableName];
        if (entry) return entry.data;
        return null;
    }
}

export async function writeTable(tableName, data) {
    const fileName = tableName + '.json';
    const headers = authHeaders();
    const body = JSON.stringify(data, null, 2);

    try {
        const existingId = await findFileId(fileName);

        if (existingId) {
            // Update existing file
            const res = await fetch(
                `${DRIVE_UPLOAD}/files/${existingId}?uploadType=media`,
                {
                    method: 'PATCH',
                    headers: { ...headers, 'Content-Type': 'application/json' },
                    body
                }
            );
            if (res.status === 401) throw new Error('TOKEN_EXPIRED');
            if (!res.ok) throw new Error(`Failed to update ${fileName}: ${res.status}`);
        } else {
            // Create new file
            const metadata = {
                name: fileName,
                parents: ['appDataFolder'],
                mimeType: 'application/json'
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', new Blob([body], { type: 'application/json' }));

            const res = await fetch(
                `${DRIVE_UPLOAD}/files?uploadType=multipart`,
                {
                    method: 'POST',
                    headers: { Authorization: headers.Authorization },
                    body: form
                }
            );

            if (res.status === 401) throw new Error('TOKEN_EXPIRED');
            if (!res.ok) throw new Error(`Failed to create ${fileName}: ${res.status}`);

            const result = await res.json();
            fileIdCache[fileName] = result.id;
        }

        // Always update cache after write
        setCache(tableName, data);
    } catch (err) {
        if (err.message === 'TOKEN_EXPIRED') throw err;
        console.error(`Error writing ${tableName}:`, err);
        throw err;
    }
}

// ── ID Generation ──
export function generateId() {
    return crypto.randomUUID();
}

// ── First-Time User Setup ──
export async function initializeUserData() {
    const existing = await readTable('accounts');
    if (existing && existing.length > 0) return; // Already initialized

    const now = new Date().toISOString();
    const id = () => generateId();

    // Default categories (matching AuthService.cs)
    const categories = [
        // Income
        { id: id(), name: 'Salary', type: 'Income', icon: '💼' },
        { id: id(), name: 'Freelance', type: 'Income', icon: '💻' },
        { id: id(), name: 'Interest', type: 'Income', icon: '🏦' },
        { id: id(), name: 'Gift', type: 'Income', icon: '🎁' },
        // Expense
        { id: id(), name: 'Food', type: 'Expense', icon: '🍔' },
        { id: id(), name: 'Transport', type: 'Expense', icon: '🚗' },
        { id: id(), name: 'Utilities', type: 'Expense', icon: '💡' },
        { id: id(), name: 'Entertainment', type: 'Expense', icon: '🎬' },
        { id: id(), name: 'Shopping', type: 'Expense', icon: '🛍️' },
        { id: id(), name: 'Health', type: 'Expense', icon: '🏥' },
        { id: id(), name: 'Rent', type: 'Expense', icon: '🏠' },
        { id: id(), name: 'Education', type: 'Expense', icon: '📚' },
        { id: id(), name: 'Wife', type: 'Expense', icon: '👩' },
        // Investment
        { id: id(), name: 'Interest', type: 'Investment', icon: '💰' },
        { id: id(), name: 'SGB', type: 'Investment', icon: '🥇' },
        { id: id(), name: 'Mutual Fund', type: 'Investment', icon: '📈' },
        { id: id(), name: 'Stocks', type: 'Investment', icon: '📊' },
        { id: id(), name: 'FD', type: 'Investment', icon: '🏦' },
        { id: id(), name: 'RD', type: 'Investment', icon: '🏦' },
        { id: id(), name: 'PPF', type: 'Investment', icon: '🏛️' },
        { id: id(), name: 'NPS', type: 'Investment', icon: '🏛️' },
    ];

    // Create all tables
    await writeTable('categories', categories);
    await writeTable('accounts', []);
    await writeTable('tags', []);
    await writeTable('transactions', []);
    await writeTable('budgets', []);
    await writeTable('investments', []);
    await writeTable('sips', []);
    await writeTable('sip_history', []);
    await writeTable('vehicles', []);
    await writeTable('fuel_entries', []);
    await writeTable('reminders', []);
    await writeTable('goals', []);
    await writeTable('couple', null);
    await writeTable('price_cache', []);
    await writeTable('portfolio_snapshots', []);
    await writeTable('dividends', []);
    await writeTable('asset_transactions', []);
    await writeTable('app_meta', {
        createdAt: now,
        lastSIPCheck: now,
        version: '2.0'
    });
}

// ── Couple Shared Folder ──

export async function createSharedFolder(partnerEmail) {
    const headers = authHeaders();

    // Create a regular (visible) Drive folder
    const folderRes = await fetch(`${DRIVE_API}/files`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'ExpenseTracker-Shared',
            mimeType: 'application/vnd.google-apps.folder'
        })
    });

    if (!folderRes.ok) throw new Error('Failed to create shared folder');
    const folder = await folderRes.json();

    // Share with partner
    await fetch(`${DRIVE_API}/files/${folder.id}/permissions`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            role: 'writer',
            type: 'user',
            emailAddress: partnerEmail
        })
    });

    return folder.id;
}

export async function readSharedTable(folderId, tableName) {
    const fileName = tableName + '.json';
    const headers = authHeaders();
    const query = encodeURIComponent(`name='${fileName}' and '${folderId}' in parents`);

    const listRes = await fetch(
        `${DRIVE_API}/files?q=${query}&fields=files(id,name)`,
        { headers }
    );

    if (!listRes.ok) return null;
    const data = await listRes.json();
    if (!data.files || data.files.length === 0) return null;

    const fileId = data.files[0].id;
    const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, { headers });
    if (!res.ok) return null;

    return await res.json();
}

export async function writeSharedTable(folderId, tableName, data) {
    const fileName = tableName + '.json';
    const headers = authHeaders();
    const body = JSON.stringify(data, null, 2);
    const query = encodeURIComponent(`name='${fileName}' and '${folderId}' in parents`);

    const listRes = await fetch(
        `${DRIVE_API}/files?q=${query}&fields=files(id,name)`,
        { headers }
    );

    const listData = await listRes.json();

    if (listData.files && listData.files.length > 0) {
        // Update
        await fetch(`${DRIVE_UPLOAD}/files/${listData.files[0].id}?uploadType=media`, {
            method: 'PATCH',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body
        });
    } else {
        // Create
        const metadata = {
            name: fileName,
            parents: [folderId],
            mimeType: 'application/json'
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([body], { type: 'application/json' }));

        await fetch(`${DRIVE_UPLOAD}/files?uploadType=multipart`, {
            method: 'POST',
            headers: { Authorization: headers.Authorization },
            body: form
        });
    }
}

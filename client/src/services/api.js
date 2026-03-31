// ═══════════════════════════════════════════════════════════════
// api.js — Drop-in replacement for the axios-based API layer
// Routes all calls to Google Drive via driveStorage.js
// Same interface: api.get('/account') → { data: [...] }
// ═══════════════════════════════════════════════════════════════

import { readTable, writeTable, generateId, invalidateCache,
    createSharedFolder, readSharedTable, writeSharedTable } from './driveStorage';
import { calculateDashboard } from './dashboardCalc';
import { calculatePortfolioSummary, calculateAssetBreakdown, getAssetsByType } from './portfolioAnalytics';
import { executeSIPCatchup } from './sipCatchup';

// ── URL parser ──
function parseUrl(url) {
    const [path, queryString] = url.split('?');
    const segments = path.replace(/^\//, '').split('/');
    const params = {};
    if (queryString) {
        queryString.split('&').forEach(pair => {
            const [k, v] = pair.split('=');
            params[decodeURIComponent(k)] = decodeURIComponent(v);
        });
    }
    return { segments, params };
}

// ── Scope-aware read ──
async function scopedRead(tableName, config) {
    const scope = config?.params?.scope || localStorage.getItem('couple_scope') || 'Personal';
    if (scope === 'Combined' || scope === 'Partner') {
        const couple = await readTable('couple');
        if (couple && couple.status === 'Active' && couple.folderId) {
            return await readSharedTable(couple.folderId, tableName) || [];
        }
    }
    return await readTable(tableName) || [];
}

// ── Simple CRUD helpers ──
async function handleGet(tableName, config) {
    const data = await scopedRead(tableName, config);
    return { data: data || [] };
}

async function handleCreate(tableName, body) {
    const items = await readTable(tableName) || [];
    const newItem = { id: generateId(), ...body, createdAt: new Date().toISOString() };
    items.push(newItem);
    await writeTable(tableName, items);
    return { data: newItem };
}

async function handleUpdate(tableName, id, body) {
    const items = await readTable(tableName) || [];
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw { response: { status: 404, data: { error: 'Not found' } } };
    items[idx] = { ...items[idx], ...body, id };
    await writeTable(tableName, items);
    return { data: items[idx] };
}

async function handleDelete(tableName, id) {
    const items = await readTable(tableName) || [];
    const filtered = items.filter(i => i.id !== id);
    await writeTable(tableName, filtered);
    return { data: { success: true } };
}

// ── Transaction balance logic ──
function adjustBalance(account, type, amount, isReverse = false) {
    const mult = isReverse ? -1 : 1;
    const isCreditCard = (account.type || '').toLowerCase() === 'creditcard' ||
                         (account.type || '') === 'CreditCard';
    
    switch (type) {
        case 'Income':
            account.balance += (isCreditCard ? -amount : amount) * mult;
            break;
        case 'Expense':
            account.balance += (isCreditCard ? amount : -amount) * mult;
            break;
        case 'Investment':
            account.balance += (isCreditCard ? amount : -amount) * mult;
            break;
        case 'Withdraw':
            account.balance -= amount * mult;
            break;
    }
    account.balance = parseFloat(account.balance.toFixed(2));
}

async function createTransaction(body) {
    const transactions = await readTable('transactions') || [];
    const accounts = await readTable('accounts') || [];
    const investments = await readTable('investments') || [];

    const newTx = {
        id: generateId(),
        ...body,
        amount: parseFloat(body.amount) || 0,
        date: body.date || new Date().toISOString(),
        createdAt: new Date().toISOString()
    };

    // Adjust account balance
    const account = accounts.find(a => a.id === newTx.accountId);
    if (account) {
        adjustBalance(account, newTx.type, newTx.amount);
    }

    // Transfer: adjust destination
    if (newTx.type === 'Transfer' && newTx.transferAccountId) {
        const dest = accounts.find(a => a.id === newTx.transferAccountId);
        if (dest) dest.balance = parseFloat((dest.balance + newTx.amount).toFixed(2));
        const src = accounts.find(a => a.id === newTx.accountId);
        if (src) {
            // Already adjusted above for non-transfer types, reset and do transfer logic
            src.balance = parseFloat((src.balance + newTx.amount).toFixed(2)); // undo the adjustBalance
            src.balance = parseFloat((src.balance - newTx.amount).toFixed(2)); // do transfer debit
        }
    }

    // Investment link
    if (newTx.investmentId) {
        const inv = investments.find(i => i.id === newTx.investmentId);
        if (inv) {
            inv.investedAmount = parseFloat(((inv.investedAmount || 0) + newTx.amount).toFixed(2));
            inv.currentValue = parseFloat(((inv.currentValue || 0) + newTx.amount).toFixed(2));
        }
        await writeTable('investments', investments);
    }

    transactions.push(newTx);
    await writeTable('transactions', transactions);
    await writeTable('accounts', accounts);

    return { data: newTx };
}

async function deleteTransaction(id) {
    const transactions = await readTable('transactions') || [];
    const accounts = await readTable('accounts') || [];
    const investments = await readTable('investments') || [];

    const tx = transactions.find(t => t.id === id);
    if (!tx) throw { response: { status: 404, data: { error: 'Transaction not found' } } };

    // Reverse balance
    const account = accounts.find(a => a.id === tx.accountId);
    if (account) adjustBalance(account, tx.type, tx.amount, true);

    if (tx.type === 'Transfer' && tx.transferAccountId) {
        const dest = accounts.find(a => a.id === tx.transferAccountId);
        if (dest) dest.balance = parseFloat((dest.balance - tx.amount).toFixed(2));
    }

    if (tx.investmentId) {
        const inv = investments.find(i => i.id === tx.investmentId);
        if (inv) {
            inv.investedAmount = parseFloat(((inv.investedAmount || 0) - tx.amount).toFixed(2));
            inv.currentValue = parseFloat(((inv.currentValue || 0) - tx.amount).toFixed(2));
        }
        await writeTable('investments', investments);
    }

    const filtered = transactions.filter(t => t.id !== id);
    await writeTable('transactions', filtered);
    await writeTable('accounts', accounts);

    return { data: { success: true } };
}

async function updateTransaction(id, body) {
    const transactions = await readTable('transactions') || [];
    const accounts = await readTable('accounts') || [];
    const investments = await readTable('investments') || [];

    const oldTx = transactions.find(t => t.id === id);
    if (!oldTx) throw { response: { status: 404, data: { error: 'Transaction not found' } } };

    // Reverse old balance
    const oldAccount = accounts.find(a => a.id === oldTx.accountId);
    if (oldAccount) adjustBalance(oldAccount, oldTx.type, oldTx.amount, true);
    if (oldTx.type === 'Transfer' && oldTx.transferAccountId) {
        const dest = accounts.find(a => a.id === oldTx.transferAccountId);
        if (dest) dest.balance = parseFloat((dest.balance - oldTx.amount).toFixed(2));
    }

    // Update transaction
    const updated = { ...oldTx, ...body, id, amount: parseFloat(body.amount || oldTx.amount) };

    // Apply new balance
    const newAccount = accounts.find(a => a.id === updated.accountId);
    if (newAccount) adjustBalance(newAccount, updated.type, updated.amount);
    if (updated.type === 'Transfer' && updated.transferAccountId) {
        const dest = accounts.find(a => a.id === updated.transferAccountId);
        if (dest) dest.balance = parseFloat((dest.balance + updated.amount).toFixed(2));
    }

    const idx = transactions.findIndex(t => t.id === id);
    transactions[idx] = updated;

    await writeTable('transactions', transactions);
    await writeTable('accounts', accounts);
    if (updated.investmentId || oldTx.investmentId) await writeTable('investments', investments);

    return { data: updated };
}

// ── Budget month endpoint ──
async function getBudgetMonth(config) {
    const year = parseInt(config?.params?.year || new Date().getFullYear());
    const month = parseInt(config?.params?.month || (new Date().getMonth() + 1));
    const budgets = await readTable('budgets') || [];
    const transactions = await readTable('transactions') || [];
    const categories = await readTable('categories') || [];

    const monthBudgets = budgets.filter(b => b.year === year && b.month === month);

    return {
        data: monthBudgets.map(b => {
            const cat = categories.find(c => c.id === b.categoryId);
            const spent = transactions
                .filter(t => {
                    const d = new Date(t.date);
                    return t.type === 'Expense' && t.categoryId === b.categoryId &&
                        d.getFullYear() === year && (d.getMonth() + 1) === month;
                })
                .reduce((sum, t) => sum + (t.amount || 0), 0);

            return {
                ...b,
                categoryName: cat?.name || 'Unknown',
                icon: cat?.icon,
                spent: parseFloat(spent.toFixed(2)),
                remaining: parseFloat((b.amount - spent).toFixed(2)),
                utilizationPercent: b.amount > 0 ? parseFloat((spent / b.amount * 100).toFixed(2)) : 0
            };
        })
    };
}

// ── Dashboard endpoint ──
async function getDashboard(config) {
    const month = config?.params?.month ? parseInt(config.params.month) : null;
    const year = config?.params?.year ? parseInt(config.params.year) : null;
    const accountId = config?.params?.accountId !== 'All Accounts' ? config?.params?.accountId : null;
    const scope = config?.params?.scope || 'Combined';

    const transactions = await scopedRead('transactions', config);
    const accounts = await scopedRead('accounts', config);
    const investments = await scopedRead('investments', config);
    const budgets = await scopedRead('budgets', config);
    const categories = await scopedRead('categories', config);
    const reminders = await scopedRead('reminders', config);

    const result = calculateDashboard(transactions, accounts, investments, budgets, categories, reminders, month, year, accountId);
    return { data: result };
}

// ── Portfolio endpoints ──
async function getPortfolioSummary(config) {
    const investments = await scopedRead('investments', config);
    const assetTx = await readTable('asset_transactions') || [];
    const priceCache = await readTable('price_cache') || [];
    return { data: calculatePortfolioSummary(investments, assetTx, priceCache) };
}

async function getPortfolioBreakdown(config) {
    const investments = await scopedRead('investments', config);
    return { data: calculateAssetBreakdown(investments) };
}

// ═══ Main API Object ═══
const api = {
    get: async (url, config) => {
        const { segments, params } = parseUrl(url);
        const mergedParams = { ...params, ...(config?.params || {}) };
        const mergedConfig = { ...config, params: mergedParams };
        const base = segments[0];
        const id = segments[1];

        switch (base) {
            case 'auth':
                if (id === 'me') {
                    const user = JSON.parse(localStorage.getItem('user') || 'null');
                    return { data: user };
                }
                break;

            case 'account': return handleGet('accounts', mergedConfig);
            case 'category': return handleGet('categories', mergedConfig);
            case 'tag': return handleGet('tags', mergedConfig);

            case 'transaction':
                if (id) {
                    const txs = await scopedRead('transactions', mergedConfig);
                    const tx = txs.find(t => t.id === id);
                    return { data: tx || null };
                }
                // Support query params filtering
                let txList = await scopedRead('transactions', mergedConfig);
                if (mergedParams.startDate) txList = txList.filter(t => new Date(t.date) >= new Date(mergedParams.startDate));
                if (mergedParams.endDate) txList = txList.filter(t => new Date(t.date) <= new Date(mergedParams.endDate));
                if (mergedParams.type) txList = txList.filter(t => t.type === mergedParams.type);
                if (mergedParams.categoryId) txList = txList.filter(t => t.categoryId === mergedParams.categoryId);
                if (mergedParams.accountId) txList = txList.filter(t => t.accountId === mergedParams.accountId || t.transferAccountId === mergedParams.accountId);
                return { data: txList };

            case 'budget':
                if (id === 'month') return getBudgetMonth(mergedConfig);
                return handleGet('budgets', mergedConfig);

            case 'investment': return handleGet('investments', mergedConfig);

            case 'sip':
                if (id && segments[2] === 'history') {
                    const history = await readTable('sip_history') || [];
                    return { data: history.filter(h => h.sipId === id) };
                }
                return handleGet('sips', mergedConfig);

            case 'mileage':
                if (id === 'vehicles') return handleGet('vehicles', mergedConfig);
                if (id === 'fuel-entries') {
                    let entries = await readTable('fuel_entries') || [];
                    if (mergedParams.vehicleId) entries = entries.filter(e => e.vehicleId === mergedParams.vehicleId);
                    return { data: entries };
                }
                break;

            case 'reminder':
                let reminders = await readTable('reminders') || [];
                reminders.sort((a, b) => {
                    if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
                    if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
                    return new Date(a.date) - new Date(b.date);
                });
                return { data: reminders };

            case 'dashboard': return getDashboard(mergedConfig);

            case 'portfolioanalytics':
                if (id === 'summary') return getPortfolioSummary(mergedConfig);
                if (id === 'breakdown') return getPortfolioBreakdown(mergedConfig);
                if (id === 'snapshots') return handleGet('portfolio_snapshots', mergedConfig);
                if (id === 'assets') {
                    const investments = await scopedRead('investments', mergedConfig);
                    return { data: getAssetsByType(investments, segments[2]) };
                }
                break;

            case 'pricefeed':
                if (id === 'quote') {
                    const ticker = segments[2];
                    const res = await fetch(`/.netlify/functions/price-feed?ticker=${encodeURIComponent(ticker)}&type=stock`);
                    return { data: await res.json() };
                }
                break;

            case 'couple':
                if (id === 'status') {
                    const couple = await readTable('couple');
                    return { data: couple || { status: 'None' } };
                }
                break;

            case 'goal': return handleGet('goals', mergedConfig);

            case 'aifeatures':
                if (id === 'fuel-coach') {
                    const fuelEntries = await readTable('fuel_entries') || [];
                    const vehicles = await readTable('vehicles') || [];
                    const context = JSON.stringify({ fuelEntries: fuelEntries.slice(-20), vehicles });
                    const res = await fetch('/.netlify/functions/ai-features?type=fuel-coach', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: 'Analyze my fuel efficiency and give coaching tips', context })
                    });
                    return { data: await res.json() };
                }
                break;
        }

        console.warn(`[api.get] Unhandled endpoint: ${url}`);
        return { data: null };
    },

    post: async (url, body) => {
        const { segments } = parseUrl(url);
        const base = segments[0];
        const id = segments[1];

        switch (base) {
            case 'account': return handleCreate('accounts', body);
            case 'category': return handleCreate('categories', body);
            case 'tag': return handleCreate('tags', body);
            case 'transaction': return createTransaction(body);
            case 'budget': return handleCreate('budgets', body);
            case 'investment': return handleCreate('investments', body);

            case 'sip':
                if (id === 'execute') {
                    const count = await executeSIPCatchup();
                    return { data: { executed: count } };
                }
                return handleCreate('sips', body);

            case 'mileage':
                if (id === 'vehicles') return handleCreate('vehicles', body);
                if (id === 'fuel-entries') return handleCreate('fuel_entries', body);
                break;

            case 'reminder':
                return handleCreate('reminders', { ...body, status: 'upcoming' });

            case 'goal': return handleCreate('goals', body);

            case 'pricefeed':
                if (id === 'force') {
                    const cache = await readTable('price_cache') || [];
                    cache.push({ ...body, fetchedAt: new Date().toISOString() });
                    await writeTable('price_cache', cache);
                    return { data: { success: true } };
                }
                break;

            case 'aichat': {
                const res = await fetch('/.netlify/functions/ai-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                return { data: await res.json() };
            }

            case 'aifeatures':
                if (id === 'budget') {
                    if (segments[2] === 'generate') {
                        const res = await fetch('/.netlify/functions/ai-features?type=budget', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(body)
                        });
                        return { data: await res.json() };
                    }
                    if (segments[2] === 'apply') {
                        const budgets = await readTable('budgets') || [];
                        const newBudgets = (body.budgets || []).map(b => ({ id: generateId(), ...b }));
                        budgets.push(...newBudgets);
                        await writeTable('budgets', budgets);
                        return { data: newBudgets };
                    }
                }
                break;

            case 'couple':
                if (id === 'create') {
                    const folderId = await createSharedFolder(body.partnerEmail);
                    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                    const coupleData = {
                        folderId,
                        inviteEmail: body.partnerEmail,
                        inviteCode,
                        status: 'Pending',
                        createdAt: new Date().toISOString()
                    };
                    await writeTable('couple', coupleData);
                    return { data: coupleData };
                }
                if (id === 'accept') {
                    const couple = await readTable('couple') || {};
                    couple.status = 'Active';
                    await writeTable('couple', couple);
                    return { data: couple };
                }
                break;
        }

        console.warn(`[api.post] Unhandled endpoint: ${url}`);
        return { data: null };
    },

    put: async (url, body) => {
        const { segments } = parseUrl(url);
        const base = segments[0];
        const id = segments[1];

        switch (base) {
            case 'account': return handleUpdate('accounts', id, body);
            case 'category': return handleUpdate('categories', id, body);
            case 'tag': return handleUpdate('tags', id, body);
            case 'transaction': return updateTransaction(id, body);
            case 'budget': return handleUpdate('budgets', id, body);
            case 'investment': return handleUpdate('investments', id, body);
            case 'sip': return handleUpdate('sips', id, body);

            case 'mileage':
                if (segments[1] === 'vehicles') return handleUpdate('vehicles', segments[2], body);
                if (segments[1] === 'fuel-entries') return handleUpdate('fuel_entries', segments[2], body);
                break;

            case 'reminder':
                if (segments[2] === 'complete') {
                    const reminders = await readTable('reminders') || [];
                    const r = reminders.find(rem => rem.id === id);
                    if (r) {
                        r.status = r.status === 'upcoming' ? 'completed' : 'upcoming';
                        await writeTable('reminders', reminders);
                    }
                    return { data: r };
                }
                return handleUpdate('reminders', id, body);

            case 'goal': return handleUpdate('goals', id, body);
        }

        console.warn(`[api.put] Unhandled endpoint: ${url}`);
        return { data: null };
    },

    delete: async (url) => {
        const { segments } = parseUrl(url);
        const base = segments[0];
        const id = segments[1];

        switch (base) {
            case 'account': return handleDelete('accounts', id);
            case 'category': return handleDelete('categories', id);
            case 'tag': return handleDelete('tags', id);
            case 'transaction': return deleteTransaction(id);
            case 'budget': return handleDelete('budgets', id);
            case 'investment': return handleDelete('investments', id);
            case 'sip': return handleDelete('sips', id);

            case 'mileage':
                if (segments[1] === 'vehicles') return handleDelete('vehicles', segments[2]);
                if (segments[1] === 'fuel-entries') return handleDelete('fuel_entries', segments[2]);
                break;

            case 'reminder': return handleDelete('reminders', id);
            case 'goal': return handleDelete('goals', id);

            case 'couple':
                if (id === 'leave') {
                    await writeTable('couple', null);
                    return { data: { success: true } };
                }
                break;
        }

        console.warn(`[api.delete] Unhandled endpoint: ${url}`);
        return { data: null };
    }
};

export default api;

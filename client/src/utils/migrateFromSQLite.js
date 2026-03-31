// ═══════════════════════════════════════════════════════════════
// migrateFromSQLite.js — One-time migration utility
// Takes exported JSON from old SQLite database and uploads to Drive
// ═══════════════════════════════════════════════════════════════

import { writeTable, generateId } from '../services/driveStorage';

const TABLE_MAP = {
    'Accounts': 'accounts',
    'Categories': 'categories',
    'Tags': 'tags',
    'Transactions': 'transactions',
    'Budgets': 'budgets',
    'Investments': 'investments',
    'SIPs': 'sips',
    'SIPHistories': 'sip_history',
    'Vehicles': 'vehicles',
    'FuelEntries': 'fuel_entries',
    'Reminders': 'reminders',
    'Goals': 'goals',
    'PortfolioSnapshots': 'portfolio_snapshots',
    'Dividends': 'dividends',
    'AssetTransactions': 'asset_transactions'
};

function normalizeRecord(record) {
    const normalized = {};
    for (const [key, value] of Object.entries(record)) {
        // Convert PascalCase to camelCase
        const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
        
        // Convert GUID-style IDs
        if (camelKey === 'id' && typeof value === 'string') {
            normalized[camelKey] = value.toLowerCase();
        } else if (camelKey.endsWith('Id') && typeof value === 'string') {
            normalized[camelKey] = value.toLowerCase();
        } else {
            normalized[camelKey] = value;
        }
    }
    
    // Ensure ID exists
    if (!normalized.id) {
        normalized.id = generateId();
    }
    
    return normalized;
}

export async function migrateFromJSON(jsonData, onProgress) {
    const results = { success: [], failed: [], total: 0 };

    for (const [sqlTable, driveTable] of Object.entries(TABLE_MAP)) {
        if (jsonData[sqlTable]) {
            const records = jsonData[sqlTable].map(normalizeRecord);
            results.total += records.length;

            try {
                await writeTable(driveTable, records);
                results.success.push({ table: driveTable, count: records.length });
                if (onProgress) onProgress(`Migrated ${driveTable}: ${records.length} records`);
            } catch (err) {
                results.failed.push({ table: driveTable, error: err.message });
                if (onProgress) onProgress(`Failed ${driveTable}: ${err.message}`);
            }
        }
    }

    // Create app_meta
    await writeTable('app_meta', {
        createdAt: new Date().toISOString(),
        lastSIPCheck: new Date().toISOString(),
        version: '2.0',
        migratedFrom: 'sqlite'
    });

    return results;
}

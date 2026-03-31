// ═══════════════════════════════════════════════════════════════
// sipCatchup.js — Replaces SIPBackgroundService.cs
// Runs on app open instead of 24/7 background job
// ═══════════════════════════════════════════════════════════════

import { readTable, writeTable, generateId } from './driveStorage';

export async function executeSIPCatchup() {
    try {
        const appMeta = await readTable('app_meta');
        if (!appMeta) return 0;

        const lastCheck = new Date(appMeta.lastSIPCheck || '2020-01-01');
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const sips = await readTable('sips') || [];
        const sipHistory = await readTable('sip_history') || [];
        const investments = await readTable('investments') || [];
        const assetTransactions = await readTable('asset_transactions') || [];

        let executedCount = 0;

        const activeSIPs = sips.filter(s => s.status === 'Active');

        for (const sip of activeSIPs) {
            let nextDate = new Date(sip.nextExecutionDate || sip.createdAt);

            while (nextDate <= today) {
                // Create SIP History entry
                sipHistory.push({
                    id: generateId(),
                    sipId: sip.id,
                    amount: sip.monthlyAmount,
                    navAtExecution: 0,
                    executedAt: nextDate.toISOString(),
                    status: 'Success',
                    notes: 'Auto-executed by SIP catch-up'
                });

                // Update linked investment
                const inv = investments.find(i => i.id === sip.investmentId);
                if (inv) {
                    inv.investedAmount = parseFloat(((inv.investedAmount || 0) + sip.monthlyAmount).toFixed(2));
                    inv.currentValue = parseFloat(((inv.currentValue || 0) + sip.monthlyAmount).toFixed(2));
                }

                // Create asset transaction
                assetTransactions.push({
                    id: generateId(),
                    investmentId: sip.investmentId,
                    txnType: 'SIP',
                    date: nextDate.toISOString(),
                    price: 0,
                    amount: sip.monthlyAmount,
                    units: 0,
                    notes: 'SIP auto-execution'
                });

                // Calculate next execution date (same day next month, capped at 28)
                const execDay = Math.min(sip.executionDay || 1, 28);
                const nextMonth = new Date(nextDate);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                nextMonth.setDate(execDay);
                nextDate = nextMonth;

                executedCount++;
            }

            // Update SIP's next execution date
            sip.nextExecutionDate = nextDate.toISOString();
        }

        if (executedCount > 0) {
            await writeTable('sips', sips);
            await writeTable('sip_history', sipHistory);
            await writeTable('investments', investments);
            await writeTable('asset_transactions', assetTransactions);
        }

        // Update app meta
        appMeta.lastSIPCheck = new Date().toISOString();
        await writeTable('app_meta', appMeta);

        if (executedCount > 0) {
            console.log(`[SIP Catch-up] Executed ${executedCount} SIP installments`);
        }

        return executedCount;
    } catch (err) {
        console.error('[SIP Catch-up] Error:', err);
        return 0;
    }
}

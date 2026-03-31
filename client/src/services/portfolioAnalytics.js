// ═══════════════════════════════════════════════════════════════
// portfolioAnalytics.js — Replaces PnLCalculationService.cs
// ═══════════════════════════════════════════════════════════════

export function calculatePortfolioSummary(investments, assetTransactions, priceCache) {
    const priceLookup = {};
    (priceCache || []).forEach(p => { priceLookup[p.ticker] = p.price; });

    let totalInvested = 0;
    let totalCurrent = 0;

    const enriched = (investments || []).map(inv => {
        let currentValue = inv.currentValue || 0;

        // If ticker exists and price is in cache, update currentValue
        if (inv.ticker && priceLookup[inv.ticker] && inv.units) {
            currentValue = parseFloat((inv.units * priceLookup[inv.ticker]).toFixed(2));
        }

        const investedAmount = inv.investedAmount || 0;
        const pnl = parseFloat((currentValue - investedAmount).toFixed(2));
        const returnPct = investedAmount > 0 ? parseFloat((pnl / investedAmount * 100).toFixed(2)) : 0;

        // Determine LTCG vs STCG
        const investedDate = inv.dateInvested ? new Date(inv.dateInvested) : new Date();
        const holdingDays = Math.floor((Date.now() - investedDate.getTime()) / (1000 * 60 * 60 * 24));
        const gainType = holdingDays > 365 ? 'LTCG' : 'STCG';

        totalInvested += investedAmount;
        totalCurrent += currentValue;

        return {
            ...inv,
            currentValue,
            pnl,
            returnPct,
            holdingDays,
            gainType
        };
    });

    const totalPnL = parseFloat((totalCurrent - totalInvested).toFixed(2));
    const returnPct = totalInvested > 0 ? parseFloat((totalPnL / totalInvested * 100).toFixed(2)) : 0;

    return {
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        totalCurrent: parseFloat(totalCurrent.toFixed(2)),
        totalPnL,
        returnPct,
        investments: enriched
    };
}

export function calculateAssetBreakdown(investments) {
    const groups = {};
    let grandTotal = 0;

    (investments || []).forEach(inv => {
        const type = inv.assetType || 'Other';
        if (!groups[type]) groups[type] = { assetType: type, investedAmount: 0, currentValue: 0, count: 0 };
        groups[type].investedAmount += inv.investedAmount || 0;
        groups[type].currentValue += inv.currentValue || 0;
        groups[type].count++;
        grandTotal += inv.currentValue || 0;
    });

    return Object.values(groups).map(g => ({
        ...g,
        investedAmount: parseFloat(g.investedAmount.toFixed(2)),
        currentValue: parseFloat(g.currentValue.toFixed(2)),
        allocation: grandTotal > 0 ? parseFloat((g.currentValue / grandTotal * 100).toFixed(2)) : 0,
        pnl: parseFloat((g.currentValue - g.investedAmount).toFixed(2))
    })).sort((a, b) => b.currentValue - a.currentValue);
}

export function getAssetsByType(investments, assetType) {
    return (investments || []).filter(i =>
        (i.assetType || '').toLowerCase() === (assetType || '').toLowerCase()
    );
}

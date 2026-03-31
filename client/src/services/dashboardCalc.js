// ═══════════════════════════════════════════════════════════════
// dashboardCalc.js — Replaces DashboardService.cs
// Pure JavaScript math — no API calls needed
// ═══════════════════════════════════════════════════════════════

export function calculateDashboard(transactions, accounts, investments, budgets, categories, reminders, month, year, accountId) {
    // Filter for account if specified
    let txs = [...(transactions || [])];
    if (accountId) {
        txs = txs.filter(t => t.accountId === accountId || t.transferAccountId === accountId);
    }

    // Filter for period
    let periodTx = [...txs];
    if (year) periodTx = periodTx.filter(t => new Date(t.date).getFullYear() === year);
    if (month) periodTx = periodTx.filter(t => (new Date(t.date).getMonth() + 1) === month);

    const nonTransferTx = periodTx.filter(t => t.type !== 'Transfer');
    const allNonTransferTx = txs.filter(t => t.type !== 'Transfer');

    // ── Totals ──
    const totalIncome = nonTransferTx.filter(t => t.type === 'Income').reduce((s, t) => s + (t.amount || 0), 0);
    const totalExpense = nonTransferTx.filter(t => t.type === 'Expense').reduce((s, t) => s + (t.amount || 0), 0);

    const totalInvestment = (year || month)
        ? (investments || [])
            .filter(i => {
                const d = new Date(i.dateInvested || Date.now());
                return (!year || d.getFullYear() === year) && (!month || (d.getMonth() + 1) === month);
            })
            .reduce((s, i) => s + (i.investedAmount || 0), 0)
        : (investments || []).reduce((s, i) => s + (i.currentValue || 0), 0);

    const accts = accounts || [];
    const currentBalance = accountId
        ? accts.filter(a => a.id === accountId)
            .reduce((s, a) => s + ((a.type || '').includes('CreditCard') ? -a.balance : a.balance), 0)
        : accts.filter(a => !(a.type || '').includes('CreditCard')).reduce((s, a) => s + (a.balance || 0), 0)
          - accts.filter(a => (a.type || '').includes('CreditCard')).reduce((s, a) => s + (a.balance || 0), 0);

    // ── Monthly Summary ──
    const monthGroups = {};
    allNonTransferTx.forEach(t => {
        const d = new Date(t.date);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        if (!monthGroups[key]) monthGroups[key] = { year: d.getFullYear(), month: d.getMonth() + 1, income: 0, expense: 0 };
        if (t.type === 'Income') monthGroups[key].income += t.amount || 0;
        if (t.type === 'Expense') monthGroups[key].expense += t.amount || 0;
    });
    const monthlySummary = Object.values(monthGroups)
        .map(m => ({ ...m, net: m.income - m.expense }))
        .sort((a, b) => b.year - a.year || b.month - a.month);

    // ── Yearly Trend ──
    const yearGroups = {};
    allNonTransferTx.forEach(t => {
        const y = new Date(t.date).getFullYear();
        if (!yearGroups[y]) yearGroups[y] = { year: y, income: 0, expense: 0, investment: 0 };
        if (t.type === 'Income') yearGroups[y].income += t.amount || 0;
        if (t.type === 'Expense') yearGroups[y].expense += t.amount || 0;
        if (t.type === 'Investment') yearGroups[y].investment += t.amount || 0;
    });
    const yearlyTrend = Object.values(yearGroups)
        .map(y => ({ ...y, net: y.income - y.expense - y.investment }))
        .sort((a, b) => b.year - a.year);

    // ── Category-Wise Spending ──
    const totalExpenseSpend = nonTransferTx.filter(t => t.type === 'Expense').reduce((s, t) => s + (t.amount || 0), 0);
    const totalIncomeSpend = nonTransferTx.filter(t => t.type === 'Income').reduce((s, t) => s + (t.amount || 0), 0);

    const catGroups = {};
    nonTransferTx.filter(t => t.type === 'Expense' || t.type === 'Income').forEach(t => {
        const key = `${t.categoryId}-${t.type}`;
        if (!catGroups[key]) catGroups[key] = { categoryId: t.categoryId, categoryType: t.type, total: 0 };
        catGroups[key].total += t.amount || 0;
    });

    const cats = categories || [];
    const categoryWiseSpending = Object.values(catGroups).map(g => {
        const cat = cats.find(c => c.id === g.categoryId);
        const denominator = g.categoryType === 'Expense' ? totalExpenseSpend : totalIncomeSpend;
        return {
            categoryId: g.categoryId,
            categoryName: cat?.name || 'Unknown',
            categoryType: g.categoryType,
            icon: cat?.icon,
            total: parseFloat(g.total.toFixed(2)),
            percentage: denominator > 0 ? parseFloat((g.total / denominator * 100).toFixed(2)) : 0
        };
    }).sort((a, b) => b.total - a.total);

    // ── Monthly Trend (day by day for selected month) ──
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || (new Date().getMonth() + 1);
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const monthlyTrend = [];
    for (let i = 1; i <= daysInMonth; i++) {
        const dayTx = nonTransferTx.filter(t => {
            const d = new Date(t.date);
            return d.getFullYear() === currentYear && (d.getMonth() + 1) === currentMonth && d.getDate() === i;
        });
        monthlyTrend.push({
            day: i,
            income: dayTx.filter(t => t.type === 'Income').reduce((s, t) => s + (t.amount || 0), 0),
            expense: dayTx.filter(t => t.type === 'Expense').reduce((s, t) => s + (t.amount || 0), 0)
        });
    }

    // ── Budget vs Actual ──
    const budgetVsActual = (budgets || [])
        .filter(b => (!month || b.month === month) && (!year || b.year === year))
        .map(b => {
            const cat = cats.find(c => c.id === b.categoryId);
            const startDate = new Date(b.year, b.month - 1, 1);
            const endDate = new Date(b.year, b.month, 0, 23, 59, 59);
            const actualSpent = allNonTransferTx
                .filter(t => t.type === 'Expense' && t.categoryId === b.categoryId &&
                    new Date(t.date) >= startDate && new Date(t.date) <= endDate)
                .reduce((s, t) => s + (t.amount || 0), 0);
            return {
                categoryId: b.categoryId,
                categoryName: cat?.name || '',
                year: b.year,
                month: b.month,
                budgetAmount: b.amount,
                actualSpent: parseFloat(actualSpent.toFixed(2)),
                remaining: parseFloat((b.amount - actualSpent).toFixed(2)),
                utilizationPercent: b.amount > 0 ? parseFloat((actualSpent / b.amount * 100).toFixed(2)) : 0,
                icon: cat?.icon
            };
        });

    // ── Account Summaries ──
    const accountSummaries = accts.map(a => ({
        id: a.id, name: a.name, type: a.type, balance: a.balance
    }));

    // ── Recent Transactions ──
    const recentTransactions = periodTx
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10)
        .map(t => {
            const cat = cats.find(c => c.id === t.categoryId);
            return {
                id: t.id,
                title: t.description || cat?.name || 'Transaction',
                description: t.description,
                type: t.type,
                amount: t.amount,
                date: t.date,
                categoryName: cat?.name || 'General',
                icon: cat?.icon
            };
        });

    // ── Upcoming Reminders ──
    const upcomingReminders = (reminders || [])
        .filter(r => r.status === 'upcoming')
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5)
        .map(r => ({ ...r, type: 'Expense' }));

    return {
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        totalExpense: parseFloat(totalExpense.toFixed(2)),
        totalInvestment: parseFloat(totalInvestment.toFixed(2)),
        currentBalance: parseFloat(currentBalance.toFixed(2)),
        monthlySummary,
        yearlyTrend,
        categoryWiseSpending,
        budgetVsActual,
        accounts: accountSummaries,
        recentTransactions,
        upcomingReminders,
        monthlyTrend,
        incomeCount: nonTransferTx.filter(t => t.type === 'Income').length,
        expenseCount: nonTransferTx.filter(t => t.type === 'Expense').length,
        totalTransactionCount: periodTx.length
    };
}

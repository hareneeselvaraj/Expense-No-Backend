import { useState, useEffect, useMemo } from 'react';
import { FiArrowUp, FiArrowDown, FiCalendar, FiSearch, FiLayers, FiActivity, FiArrowRight } from 'react-icons/fi';
import api from '../services/api';

export default function History() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [activeQuickRange, setActiveQuickRange] = useState('all');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await api.get('/transaction');
                const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setTransactions(sorted);
            } catch (err) {
                console.error('Error fetching transactions:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    // Quick Range Helper
    const setRange = (type) => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        switch (type) {
            case '7d':
                start.setDate(today.getDate() - 7);
                break;
            case '30d':
                start.setDate(today.getDate() - 30);
                break;
            case 'month':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            case 'year':
                start = new Date(today.getFullYear(), 0, 1);
                break;
            case 'all':
                start = null;
                end = null;
                break;
            default: break;
        }

        setDateRange({
            start: start ? start.toISOString().split('T')[0] : '',
            end: end ? end.toISOString().split('T')[0] : ''
        });
        setActiveQuickRange(type);
    };

    // Filtering & Grouping Logic
    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const txDate = new Date(tx.date);
            const matchesSearch = (tx.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  (tx.categoryName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  (tx.accountName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  (tx.tagName || '').toLowerCase().includes(searchQuery.toLowerCase());

            let matchesDate = true;
            if (dateRange.start) {
                const s = new Date(dateRange.start);
                s.setHours(0, 0, 0, 0);
                matchesDate = matchesDate && txDate >= s;
            }
            if (dateRange.end) {
                const e = new Date(dateRange.end);
                e.setHours(23, 59, 59, 999);
                matchesDate = matchesDate && txDate <= e;
            }

            return matchesSearch && matchesDate;
        });
    }, [transactions, searchQuery, dateRange]);

    // Global Statistics Calculation (Based on FILTERED transactions)
    const globalStats = useMemo(() => {
        const income = filteredTransactions
            .filter(t => t.type?.toLowerCase() === 'income')
            .reduce((a, t) => a + (t.amount || 0), 0);
        const expense = filteredTransactions
            .filter(t => t.type?.toLowerCase() === 'expense')
            .reduce((a, t) => a + Math.abs(t.amount || 0), 0);
        return { income, expense, balance: income - expense };
    }, [filteredTransactions]);

    const grouped = useMemo(() => {
        return filteredTransactions.reduce((acc, tx) => {
            const date = new Date(tx.date);
            const monthYear = date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
            if (!acc[monthYear]) acc[monthYear] = [];
            acc[monthYear].push(tx);
            return acc;
        }, {});
    }, [filteredTransactions]);

    if (loading) return <div className="page-loader">Loading History...</div>;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title"><FiLayers /> Transaction History</h1>
                    <p className="premium-subtitle">Manage and track your financial footprint across time</p>
                </div>
            </div>

            {/* Advanced Filter Bar & Stats Integrated */}
            <div className="premium-header-section" style={{ marginTop: 0, padding: '24px' }}>
                <div className="header-top" style={{ marginBottom: '24px' }}>
                    <div className="premium-search-wrapper" style={{ maxWidth: '400px', margin: 0 }}>
                        <FiSearch />
                        <input
                            type="text"
                            className="premium-search-input"
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    {/* Advanced Filter Bar Inline */}
                    <div className="premium-filter-bar">
                        <div className="quick-ranges">
                            <button className={`range-btn ${activeQuickRange === 'all' ? 'active' : ''}`} onClick={() => setRange('all')}>All</button>
                            <button className={`range-btn ${activeQuickRange === '7d' ? 'active' : ''}`} onClick={() => setRange('7d')}>7D</button>
                            <button className={`range-btn ${activeQuickRange === '30d' ? 'active' : ''}`} onClick={() => setRange('30d')}>30D</button>
                        </div>
                        <div className="custom-range">
                            <FiCalendar />
                            <div className="date-inputs">
                                <input type="date" value={dateRange.start} onChange={(e) => { setDateRange(prev => ({ ...prev, start: e.target.value })); setActiveQuickRange('custom'); }} />
                                <span>to</span>
                                <input type="date" value={dateRange.end} onChange={(e) => { setDateRange(prev => ({ ...prev, end: e.target.value })); setActiveQuickRange('custom'); }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Stats Grid */}
                <div className="global-history-stats" style={{ gap: '16px' }}>
                    <div className="history-stat-card income">
                        <div className="h-stat-icon"><FiArrowUp /></div>
                        <div className="h-stat-content">
                            <p className="h-stat-label">Income</p>
                            <p className="h-stat-value" style={{ fontSize: '1.2rem' }}>₹{globalStats.income.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                    <div className="history-stat-card expense">
                        <div className="h-stat-icon"><FiArrowDown /></div>
                        <div className="h-stat-content">
                            <p className="h-stat-label">Expense</p>
                            <p className="h-stat-value" style={{ fontSize: '1.2rem' }}>₹{globalStats.expense.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                    <div className="history-stat-card balance">
                        <div className="h-stat-icon"><FiActivity /></div>
                        <div className="h-stat-content">
                            <p className="h-stat-label">Net</p>
                            <p className="h-stat-value" style={{ fontSize: '1.2rem' }}>
                                {globalStats.balance < 0 ? '-' : ''}₹{Math.abs(globalStats.balance).toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {Object.keys(grouped).length === 0 ? (
                <div className="premium-empty-state">
                    <div className="empty-visual"><FiCalendar /></div>
                    <h3>No transactions found</h3>
                    <p>We couldn't find any transactions matching your search criteria.</p>
                </div>
            ) : (
                Object.entries(grouped).map(([month, txs], groupIdx) => {
                    const monthIncome = txs.filter(t => t.type?.toLowerCase() === 'income').reduce((a, t) => a + (t.amount || 0), 0);
                    const monthExpense = txs.filter(t => t.type?.toLowerCase() === 'expense').reduce((a, t) => a + Math.abs(t.amount || 0), 0);

                    return (
                        <div className="month-section" key={month} style={{ animationDelay: `${groupIdx * 0.1}s` }}>
                            <div className="month-header-premium">
                                <h2 className="month-label">{month}</h2>
                                <div className="month-quick-summary">
                                    <span className="ms-item income"><FiArrowUp /> ₹{monthIncome.toLocaleString('en-IN')}</span>
                                    <span className="ms-item expense"><FiArrowDown /> ₹{monthExpense.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                            <div className="tx-card-grid">
                                {txs.map((tx, txIdx) => (
                                    <div 
                                        className={`premium-tx-card ${tx.type?.toLowerCase()}`} 
                                        key={tx.id}
                                        style={{ animationDelay: `${(groupIdx * 0.1) + (txIdx * 0.05)}s` }}
                                    >
                                        <div className="tx-card-icon">
                                            {tx.categoryIcon || (tx.type === 'Income' ? '💰' : '💸')}
                                        </div>
                                        <div className="tx-card-main">
                                            <div className="tx-card-top">
                                                <h3 className="tx-card-title">{tx.description || tx.categoryName}</h3>
                                                <p className={`tx-card-amount ${tx.type?.toLowerCase() === 'income' ? 'plus' : 'minus'}`}>
                                                    {tx.type?.toLowerCase() === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                            <div className="tx-card-bottom">
                                                <div className="tx-card-tags">
                                                    <span className="tx-tag-pill account">{tx.accountName}</span>
                                                    <span className="tx-tag-pill category">{tx.categoryName}</span>
                                                    {tx.tagName && <span className="tx-tag-pill custom">{tx.tagName}</span>}
                                                </div>
                                                <p className="tx-card-date">
                                                    {new Date(tx.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}


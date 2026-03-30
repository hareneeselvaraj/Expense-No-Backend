import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useToast } from '../components/Toast';
import { FiSearch, FiTrendingUp, FiActivity, FiBriefcase, FiClock, FiPlus, FiX, FiCheck, FiPlay, FiPause, FiTrash2, FiInfo, FiChevronRight, FiChevronDown, FiArrowRight } from 'react-icons/fi';
import { Doughnut } from 'react-chartjs-2';
import useDeviceDetect from '../hooks/useDeviceDetect';


// ── ADD FUND MODAL ──
function AddFundModal({ scheme, onClose, onSaved }) {
    const toast = useToast();
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { 
            name: scheme?.schemeName || '', 
            assetType: 'Mutual Fund', 
            ticker: scheme?.schemeCode?.toString() || '', 
            investedAmount: '', 
            dateInvested: new Date().toISOString().split('T')[0] 
        }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        const invAmt = parseFloat(data.investedAmount);
        let quantity = 0;
        let buyPrice = 0;
        let currentValue = invAmt;

        if (data.ticker) {
            try {
                // Fetch complete NAV history from our proxy
                const { data: mfData } = await api.get(`/mfexplore/scheme/${data.ticker}`);
                if (mfData && mfData.data && mfData.data.length > 0) {
                    const navHistory = mfData.data;
                    const latestNav = parseFloat(navHistory[0].nav);
                    
                    const targetDateObj = new Date(data.dateInvested);
                    // Reset time to handle local midnight
                    targetDateObj.setHours(0, 0, 0, 0);

                    // Find NAV for the given date, or nearest previous date
                    let historicNav = latestNav;
                    for (let item of navHistory) {
                        const [day, month, year] = item.date.split('-');
                        const itemDate = new Date(`${year}-${month}-${day}`);
                        if (itemDate <= targetDateObj) {
                            historicNav = parseFloat(item.nav);
                            break;
                        }
                    }

                    buyPrice = historicNav;
                    quantity = invAmt / historicNav;
                    currentValue = quantity * latestNav;
                }
            } catch (err) {
                console.error("Failed to fetch historic NAV, falling back to 0 units", err);
            }
        }

        const payload = {
            name: data.name,
            assetType: data.assetType,
            ticker: data.ticker,
            quantity: quantity,
            buyPrice: buyPrice,
            investedAmount: invAmt,
            currentValue: currentValue,
            dateInvested: data.dateInvested
        };

        try {
            await api.post('/investment', payload);
            toast.success('Mutual Fund added to holdings');
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error saving fund');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="form-card" style={{ maxWidth: '500px', width: '90%', background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Invest in Fund</h3>
                    <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}><FiX /></button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Fund Name</label>
                        <input {...register('name', { required: 'Name is required' })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }} />
                    </div>
                    <div className="mobile-grid-2" style={{ marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Scheme Code</label>
                            <input {...register('ticker', { required: 'Scheme Code required for NAV tracking' })} readOnly={!!scheme} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: scheme ? 'var(--bg)' : 'var(--card-bg)', color: 'var(--text)', outline: 'none', opacity: scheme ? 0.7 : 1 }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Buy Date</label>
                            <input type="date" {...register('dateInvested')} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }} />
                        </div>
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Initial Investment (₹)</label>
                        <input type="number" step="0.01" {...register('investedAmount', { required: 'Amount required' })} placeholder="5000" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', outline: 'none', fontSize: '1.1rem' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" onClick={onClose} className="btn ghost" disabled={isSubmitting}>Cancel</button>
                        <button type="submit" className="btn primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Calculating NAV...' : 'Add to Portfolio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── MAIN MUTUAL FUNDS COMPONENT ──
export default function MutualFunds() {
    const toast = useToast();
    const queryParams = new URLSearchParams(window.location.search);
    const initialTab = queryParams.get('tab') || 'discover';
    const [activeTab, setActiveTab] = useState(initialTab.toLowerCase());

    // Data states
    const [holdings, setHoldings] = useState([]);
    const [sips, setSips] = useState([]);
    const [orders, setOrders] = useState([]); // Simplified order history
    const [loading, setLoading] = useState(true);

    // Discover states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [discoverCategory, setDiscoverCategory] = useState('Equity');
    const [selectedFundForBuy, setSelectedFundForBuy] = useState(null);

    // SIP Form states
    const [showSipForm, setShowSipForm] = useState(false);
    const [sipForm, setSipForm] = useState({ investmentId: '', monthlyAmount: '', executionDay: 1 });
    const { isMobile } = useDeviceDetect(768);

    const simplifyName = (name) => {
        if (!isMobile) return name;
        return name
            .replace(/ - (Regular|Direct) Plan - Growth/gi, '')
            .replace(/ - Growth/gi, '')
            .replace(/ Mutual Fund/gi, '');
    };


    // Fetch core data
    const fetchPortfolioData = async () => {
        try {
            setLoading(true);
            const [fundsRes, sipsRes] = await Promise.all([
                api.get('/portfolioanalytics/assets/MF'),
                api.get('/sip')
            ]);
            setHoldings(fundsRes.data);
            setSips(sipsRes.data);
            
            // Extract history from SIPs for the Orders tab
            // In a real app this would be a dedicated /orders endpoint
            let allHistory = [];
            for (let sip of sipsRes.data) {
                try {
                    const histRes = await api.get(`/sip/${sip.id}/history`);
                    const histWithFund = histRes.data.map(h => ({ ...h, fundName: sip.investment?.name, sipAmount: sip.monthlyAmount }));
                    allHistory = [...allHistory, ...histWithFund];
                } catch(e) {}
            }
            allHistory.sort((a,b) => new Date(b.executedAt) - new Date(a.executedAt));
            setOrders(allHistory);

        } catch (err) {
            toast.error('Failed to load portfolio data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolioData();
    }, []);

    // ── DISCOVER SEARCH ──
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length >= 3) {
                searchMFAPI(searchQuery);
            } else if (searchQuery.length === 0) {
                setSearchResults([]);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const searchMFAPI = async (q) => {
        setIsSearching(true);
        try {
            const { data } = await api.get(`/mfexplore/search?q=${encodeURIComponent(q)}`);
            // Mfapi returns array of { schemeCode, schemeName }
            setSearchResults(data.slice(0, 10)); // limit to top 10
        } catch (err) {
            toast.error('Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    // ── SIP ACTIONS ──
    const handleCreateSip = async (e) => {
        e.preventDefault();
        try {
            await api.post('/sip', {
                investmentId: sipForm.investmentId,
                monthlyAmount: parseFloat(sipForm.monthlyAmount),
                executionDay: parseInt(sipForm.executionDay)
            });
            toast.success('SIP Created Successfully');
            setShowSipForm(false);
            setSipForm({ investmentId: '', monthlyAmount: '', executionDay: 1 });
            fetchPortfolioData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create SIP');
        }
    };

    const toggleSipStatus = async (sip) => {
        const newStatus = sip.status === 'Active' ? 'Paused' : 'Active';
        try {
            await api.put(`/sip/${sip.id}`, { status: newStatus });
            toast.success(`SIP ${newStatus.toLowerCase()}`);
            fetchPortfolioData();
        } catch (err) {
            toast.error('Failed to update SIP');
        }
    };

    const deleteSip = async (id) => {
        if(!window.confirm("Delete this SIP permanently?")) return;
        try {
            await api.delete(`/sip/${id}`);
            toast.success('SIP Deleted');
            fetchPortfolioData();
        } catch (err) {
            toast.error('Failed to delete SIP');
        }
    };

    const runSipsManual = async () => {
        try {
            const { data } = await api.post('/sip/execute');
            toast.success(`Executed ${data.executed} due SIPs`);
            if(data.executed > 0) fetchPortfolioData();
        } catch (err) {
            toast.error('Execution attempt failed');
        }
    };

    // ── DASHBOARD METRICS ──
    const metrics = useMemo(() => {
        const totalInvested = holdings.reduce((acc, f) => acc + f.investedAmount, 0);
        const currentValue = holdings.reduce((acc, f) => acc + f.currentValue, 0);
        const overallPnL = holdings.reduce((acc, f) => acc + f.overallPnL, 0);
        const overallPnLPct = totalInvested > 0 ? (overallPnL / totalInvested) * 100 : 0;
        // Mock day PnL based on overall for display purposes (real app would use historical snapshot)
        const dayPnl = overallPnL * 0.05; 
        return { totalInvested, currentValue, overallPnL, overallPnLPct, dayPnl };
    }, [holdings]);


    if (loading && holdings.length === 0) return <div className="page-loader">Loading Mutual Funds...</div>;

    return (
        <div className="page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            
            <div className="mf-page-header">
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{isMobile ? 'Funds' : 'Mutual Funds'}</h1>
            </div>


            {/* TAB NAVIGATION */}
            <div className="mf-tabs">
                <button className={`mf-tab ${activeTab === 'discover' ? 'mf-tab-active' : ''}`} onClick={() => setActiveTab('discover')}>Discover</button>
                <button className={`mf-tab ${activeTab === 'dashboard' ? 'mf-tab-active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
                <button className={`mf-tab ${activeTab === 'sips' ? 'mf-tab-active' : ''}`} onClick={() => setActiveTab('sips')}>SIPs ({sips.filter(s=>s.status==='Active').length})</button>
                <button className={`mf-tab ${activeTab === 'orders' ? 'mf-tab-active' : ''}`} onClick={() => setActiveTab('orders')}>Orders</button>
            </div>

            {/* ── TAB 1: DISCOVER ── */}
            {activeTab === 'discover' && (
                <div>
                    <div className="mf-discover-hero">
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{isMobile ? 'Start Investing' : 'Start your investment journey'}</h2>
                        {!isMobile && <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Search from over 3,000+ mutual funds</p>}

                        
                        <div className="mf-search-container">
                            <FiSearch className="mf-search-icon" />
                            <input 
                                type="text" 
                                className="mf-search-input" 
                                placeholder="Search e.g. Parag Parikh Flexi Cap" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {isSearching && <div className="mf-search-loader spinner-small"></div>}
                        </div>

                        {!searchQuery && (
                            <div className="mf-category-pills">
                                {['Equity', 'Debt', 'Hybrid', 'Index Funds'].map(cat => (
                                    <button 
                                        key={cat} 
                                        className={`mf-pill ${discoverCategory === cat ? 'active' : ''}`}
                                        onClick={() => setDiscoverCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && searchQuery && (
                        <div>
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Search Results</h3>
                            <div className="mf-discover-grid">
                                {searchResults.map((fund) => (
                                    <div key={fund.schemeCode} className="mf-fund-card">
                                        <div className="mf-fund-card-title">{fund.schemeName}</div>
                                        <div><span className="mf-fund-card-category">{fund.schemeCode}</span></div>
                                        <div className="mf-fund-actions" style={{ marginTop: 'auto' }}>
                                            <button className="mf-action-btn mf-btn-buy" onClick={() => setSelectedFundForBuy(fund)}>Buy</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Default Discover Grid (Mock data for visualization) */}
                    {!searchQuery && (
                        <div>
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FiTrendingUp color="var(--primary)"/> Popular {discoverCategory} Funds
                            </h3>
                            <div className="mf-discover-grid">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="mf-fund-card" style={{ opacity: 0.7, pointerEvents: 'none' }}>
                                        <div className="mf-fund-card-title">Example {discoverCategory} Fund {i}</div>
                                        <div><span className="mf-fund-card-category">{discoverCategory}</span></div>
                                        <div className="mf-fund-stats">
                                            <div>
                                                <div className="mf-stat-label">3Y CAGR</div>
                                                <div className="mf-stat-value green">{(12 + Math.random()*8).toFixed(1)}%</div>
                                            </div>
                                            <div>
                                                <div className="mf-stat-label">Min SIP</div>
                                                <div className="mf-stat-value">₹500</div>
                                            </div>
                                        </div>
                                        <div className="mf-fund-actions">
                                            <button className="mf-action-btn mf-btn-buy">Buy</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB 2: DASHBOARD ── */}
            {activeTab === 'dashboard' && (
                <div>
                    <div className="mf-dash-hero">
                        <div className="mf-hero-stat">
                            <span className="mf-hero-label">{isMobile ? 'Value' : 'Current Value'}</span>
                            <span className="mf-hero-val">₹{metrics.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="mf-hero-stat">
                            <span className="mf-hero-label">{isMobile ? 'Invested' : 'Invested Amount'}</span>
                            <span className="mf-hero-val">₹{metrics.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="mf-hero-stat">
                            <span className="mf-hero-label">{isMobile ? 'Returns' : 'Total returns'}</span>
                            <span className={`mf-hero-val ${metrics.overallPnL >= 0 ? 'text-green' : 'text-red'}`} style={{ color: metrics.overallPnL >= 0 ? '#10b981' : '#ef4444'}}>

                                {metrics.overallPnL > 0 ? '+' : ''}₹{metrics.overallPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </span>
                            <span className={`mf-hero-sub ${metrics.overallPnL >= 0 ? 'green' : 'red'}`}>
                                {metrics.overallPnLPct.toFixed(2)}%
                            </span>
                        </div>
                        <div className="mf-hero-stat">
                            <span className="mf-hero-label">Day's P&L</span>
                            <span className={`mf-hero-val ${metrics.dayPnl >= 0 ? 'text-green' : 'text-red'}`} style={{ color: metrics.dayPnl >= 0 ? '#10b981' : '#ef4444'}}>
                                {metrics.dayPnl > 0 ? '+' : ''}₹{Math.abs(metrics.dayPnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </span>
                            <span className="mf-hero-sub" style={{ opacity: 0.6 }}>Estimated</span>
                        </div>
                    </div>

                    <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Holdings</h3>
                    
                    {holdings.length === 0 ? (
                        <div className="inv-empty" style={{ padding: '4rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <p>You don't have any mutual funds in your portfolio yet.</p>
                            <button className="btn primary" onClick={() => setActiveTab('discover')} style={{ marginTop: '1rem' }}>Start Investing</button>
                        </div>
                    ) : (
                        <div className="mf-holdings-container">
                            {isMobile ? (
                                <div className="mf-mobile-list">
                                    {holdings.map((f, i) => {
                                        const isPos = f.overallPnL >= 0;
                                        return (
                                            <div key={i} className="mf-mobile-card">
                                                <div className="mmc-header">
                                                    <div>
                                                        <div className="mmc-name">{simplifyName(f.name)}</div>
                                                        <div className="mmc-meta">Units: {f.units.toFixed(2)} • NAV: ₹{f.currentPrice?.toFixed(1)}</div>
                                                    </div>

                                                    <div className={`mmc-roi ${isPos ? 'pos' : 'neg'}`}>
                                                        {isPos ? '+' : ''}{f.overallPnLPct.toFixed(1)}%
                                                    </div>
                                                </div>
                                                <div className="mmc-stats">
                                                    <div className="mmc-stat">
                                                        <span className="mmc-label">Invested</span>
                                                        <span className="mmc-value">₹{f.investedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                                    </div>
                                                    <div className="mmc-stat">
                                                        <span className="mmc-label">Current</span>
                                                        <span className="mmc-value" style={{ fontWeight: 700 }}>₹{f.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                                    </div>
                                                </div>
                                                <div className="mmc-footer">
                                                    <div className={`mmc-pnl ${isPos ? 'pos' : 'neg'}`}>
                                                        Returns: {isPos ? '+' : '-'}₹{Math.abs(f.overallPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <table className="mf-holdings-table">
                                    <thead>
                                        <tr>
                                            <th>Fund Name</th>
                                            <th className="text-right">Units</th>
                                            <th className="text-right">Avg. NAV</th>
                                            <th className="text-right">Cur. NAV</th>
                                            <th className="text-right">Invested</th>
                                            <th className="text-right">Current Value</th>
                                            <th className="text-right">P&L</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {holdings.map((f, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <div className="mf-td-name">{f.name}</div>
                                                    <div className="mf-td-sub">Scheme: {f.ticker || 'N/A'}</div>
                                                </td>
                                                <td className="text-right">{f.units.toFixed(3)}</td>
                                                <td className="text-right">₹{f.avgCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="text-right" style={{ color: 'var(--text)' }}>₹{(f.currentPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="text-right">₹{f.investedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                                <td className="text-right" style={{ fontWeight: 600 }}>₹{f.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                                                <td className="text-right">
                                                    <div style={{ color: f.overallPnL >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                                        {f.overallPnL >= 0 ? '+' : ''}₹{Math.abs(f.overallPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: f.overallPnL >= 0 ? '#10b981' : '#ef4444' }}>
                                                        {f.overallPnLPct.toFixed(2)}%
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                    )}
                </div>
            )}

            {/* ── TAB 3: SIPS ── */}
            {activeTab === 'sips' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h2 style={{ margin: 0 }}>{isMobile ? 'SIPs' : 'Systematic Investment Plans'}</h2>
                            {!isMobile && <p style={{ color: 'var(--text-muted)' }}>Automate your wealth creation</p>}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn ghost" onClick={runSipsManual}>{isMobile ? 'Simulate' : 'Simulate Execution'}</button>
                            <button className="btn primary" onClick={() => setShowSipForm(!showSipForm)}>
                                {isMobile ? <FiPlus /> : (showSipForm ? 'Cancel' : 'New SIP')}
                            </button>
                        </div>
                    </div>


                    {showSipForm && (
                        <div className="form-card" style={{ marginBottom: '2rem', padding: '2rem', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                            <form onSubmit={handleCreateSip}>
                                <h3>Create New SIP</h3>
                                <div className="mobile-grid-3" style={{ marginTop: '1.5rem', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Select Target Fund</label>
                                        <select 
                                            value={sipForm.investmentId} onChange={e => setSipForm({...sipForm, investmentId: e.target.value})}
                                            required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
                                        >
                                            <option value="">Choose holding...</option>
                                            {holdings.map(h => <option key={h.investmentId} value={h.investmentId}>{h.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Installment Amount (₹)</label>
                                        <input 
                                            type="number" value={sipForm.monthlyAmount} onChange={e => setSipForm({...sipForm, monthlyAmount: e.target.value})}
                                            required placeholder="e.g. 5000" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Execution Date (1-28)</label>
                                        <input 
                                            type="number" min="1" max="28" value={sipForm.executionDay} onChange={e => setSipForm({...sipForm, executionDay: e.target.value})}
                                            required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginTop: '1.5rem' }}>
                                    <button type="submit" className="btn primary">Start SIP</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="mf-sip-list">
                        {sips.length === 0 ? (
                            <div className="inv-empty" style={{ padding: '3rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>No active SIPs found.</div>
                        ) : (
                            sips.map(sip => (
                                <div key={sip.id} className="mf-sip-row">
                                    <div className="mf-sip-info">
                                        <div className="mf-sip-icon"><FiActivity /></div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{sip.investment?.name}</div>
                                            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: sip.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: sip.status === 'Active' ? '#10b981' : '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {sip.status}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="mf-sip-meta">
                                        <div className="mf-sip-meta-item">
                                            <span className="mf-sip-meta-label">Freq</span>
                                            <span className="mf-sip-meta-val">{isMobile ? 'Mnth' : 'Monthly'}</span>
                                        </div>
                                        <div className="mf-sip-meta-item">
                                            <span className="mf-sip-meta-label">{isMobile ? 'Amt' : 'Installment'}</span>
                                            <span className="mf-sip-meta-val" style={{ fontWeight: 700 }}>₹{sip.monthlyAmount?.toLocaleString()}</span>
                                        </div>
                                        <div className="mf-sip-meta-item">
                                            <span className="mf-sip-meta-label">{isMobile ? 'Date' : 'Next execution'}</span>
                                            <span className="mf-sip-meta-val">{isMobile ? '' : 'Day '}{sip.executionDay}</span>
                                        </div>

                                        
                                        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                            <button onClick={() => toggleSipStatus(sip)} className="btn-icon" style={{ background: 'var(--bg)', color: sip.status === 'Active' ? '#f59e0b' : '#10b981' }} title={sip.status === 'Active' ? 'Pause' : 'Resume'}>
                                                {sip.status === 'Active' ? <FiPause /> : <FiPlay />}
                                            </button>
                                            <button onClick={() => deleteSip(sip.id)} className="btn-icon" style={{ background: 'var(--bg)', color: '#ef4444' }} title="Delete">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* ── TAB 4: ORDERS ── */}
            {activeTab === 'orders' && (
                <div>
                    <h2 style={{ marginBottom: '2rem' }}>Order History</h2>
                    <div className="mf-orders-container">
                        {isMobile ? (
                            <div className="mf-mobile-list">
                                {orders.length === 0 ? (
                                    <div className="inv-empty">No orders found.</div>
                                ) : (
                                    orders.map(o => (
                                        <div key={o.id} className="mf-mobile-card mf-order-card">
                                            <div className="mmc-header">
                                                <div>
                                                    <div className="mmc-name">{simplifyName(o.fundName || 'SIP Installment')}</div>
                                                    <div className="mmc-meta">
                                                        {new Date(o.executedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} • SIP
                                                    </div>
                                                </div>

                                                <span className={`mmc-status-pill ${o.status === 'Success' ? 'success' : 'failed'}`}>
                                                    {o.status}
                                                </span>
                                            </div>
                                            <div className="mmc-stats">
                                                <div className="mmc-stat">
                                                    <span className="mmc-label">Amount</span>
                                                    <span className="mmc-value">₹{o.amount?.toLocaleString() || o.sipAmount?.toLocaleString()}</span>
                                                </div>
                                                <div className="mmc-stat">
                                                    <span className="mmc-label">NAV Applied</span>
                                                    <span className="mmc-value">{o.navAtExecution ? `₹${o.navAtExecution}` : '—'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <table className="mf-holdings-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Fund Name</th>
                                        <th>Type</th>
                                        <th className="text-right">Amount</th>
                                        <th className="text-right">NAV Applied</th>
                                        <th className="text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center" style={{ padding: '3rem' }}>No orders found.</td></tr>
                                    ) : (
                                        orders.map(o => (
                                            <tr key={o.id}>
                                                <td>{new Date(o.executedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                <td style={{ fontWeight: 500 }}>{o.fundName || 'Mutual Fund SIP'}</td>
                                                <td>SIP executed</td>
                                                <td className="text-right font-mono">₹{o.amount?.toLocaleString() || o.sipAmount?.toLocaleString()}</td>
                                                <td className="text-right font-mono">{o.navAtExecution ? `₹${o.navAtExecution}` : '—'}</td>
                                                <td className="text-center">
                                                    <span className={`mf-order-status ${o.status === 'Success' ? 'mf-order-success' : 'mf-order-failed'}`}>{o.status}</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                </div>
            )}

            {/* Modals */}
            {selectedFundForBuy && (
                <AddFundModal 
                    scheme={selectedFundForBuy} 
                    onClose={() => setSelectedFundForBuy(null)} 
                    onSaved={() => {
                        setSelectedFundForBuy(null);
                        fetchPortfolioData();
                        setActiveTab('dashboard');
                    }}
                />
            )}

        </div>
    );
}

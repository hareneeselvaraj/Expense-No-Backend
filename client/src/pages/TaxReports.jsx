import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    FiFileText, FiDownloadCloud, FiShield, FiTrendingUp, FiActivity,
    FiCheckCircle, FiAlertCircle, FiChevronRight, FiChevronDown, FiDollarSign, FiInfo
} from 'react-icons/fi';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import useDeviceDetect from '../hooks/useDeviceDetect';


ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

/* ── HELPERS: Formatting ── */
const fmt = (n) => {
    const v = n ?? 0;
    return Math.abs(v).toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

/* ── INDIAN TAX ENGINE: FY 2024-25 (AY 2025-26) ── */
// New Regime Slabs (Budget 2024 Revised)
const newRegimeSlabs = [
    { limit: 300000, rate: 0 },
    { limit: 700000, rate: 0.05 },
    { limit: 1000000, rate: 0.10 },
    { limit: 1200000, rate: 0.15 },
    { limit: 1500000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 }
];

// Old Regime Slabs (General < 60 years)
const oldRegimeSlabs = [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 0.05 },
    { limit: 1000000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 }
];

const calculateTaxSlabAndRebate = (taxableIncome, regime) => {
    let tax = 0;
    let prevLimit = 0;
    const slabs = regime === 'new' ? newRegimeSlabs : oldRegimeSlabs;

    const details = [];

    for (const slab of slabs) {
        if (taxableIncome > prevLimit) {
            const amountInSlab = Math.min(taxableIncome - prevLimit, slab.limit - prevLimit);
            const slabTax = amountInSlab * slab.rate;
            tax += slabTax;
            details.push({
                range: `₹${fmt(prevLimit)} - ${slab.limit === Infinity ? 'Above' : '₹' + fmt(slab.limit)}`,
                rate: `${slab.rate * 100}%`,
                amount: amountInSlab,
                tax: slabTax
            });
            prevLimit = slab.limit;
        } else {
            break;
        }
    }

    // Rebate u/s 87A
    let rebate = 0;
    if (regime === 'new' && taxableIncome <= 700000) {
        rebate = Math.min(tax, 25000); // 100% tax rebate
        tax -= rebate;
    } else if (regime === 'old' && taxableIncome <= 500000) {
        rebate = Math.min(tax, 12500); // 100% tax rebate
        tax -= rebate;
    }

    return { baseTax: Math.max(0, tax), details, rebate };
};

export default function TaxReports() {
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [isExporting, setIsExporting] = useState(false);
    const { isMobile } = useDeviceDetect(768);


    // Data State
    const [assets, setAssets] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [investments, setInvestments] = useState([]);

    // Manual Overrides State
    const [manualInputs, setManualInputs] = useState({
        salary: 0,
        otherIncome: 0,
        hraExempt: 0,
        lta: 0,
        interestHomeLoan: 0,
        other80C: 0, // Additional over auto-detected
        nps80CCD: 0,
        other80D: 0, // Additional over auto-detected
        otherSections: 0 // 80G, 80E, etc
    });

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get('/portfolioanalytics/assets/All'),
            api.get('/dashboard', { params: { scope: 'Mine' } }), // Only Mine for personal tax
            api.get('/investment', { params: { scope: 'Mine' } })
        ]).then(([assetsRes, dashRes, invRes]) => {
            setAssets(assetsRes.data || []);
            setDashboardData(dashRes.data || null);
            setInvestments(invRes.data || []);

            // Try to auto-detect salary from dashboard income sources
            const inc = (dashRes.data?.totalIncome || 0) * 12; // Annualised rough estimate for first-time load
            setManualInputs(prev => ({ ...prev, salary: inc > 0 ? inc : 1200000 }));

        }).catch(err => console.error("Failed to load tax data", err))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => {
        const val = parseInt(e.target.value.replace(/\D/g, '') || 0);
        setManualInputs({ ...manualInputs, [e.target.name]: val });
    };

    // ── DATA PREPARATION & AUTO-DETECTION ──
    const taxData = useMemo(() => {
        if (!assets && !dashboardData) return null;

        // Auto-detect 80C: ELSS mutual funds, EPF/PPF investments
        const auto80C_Investments = investments.filter(i => 
            (i.AssetType === 'Mutual Fund' || i.AssetType === 'MF') && 
            (i.Name?.toLowerCase().includes('elss') || i.Name?.toLowerCase().includes('tax saver'))
        ).reduce((sum, i) => sum + (i.InvestedAmount || 0), 0);

        const auto80C_PPF = investments.filter(i => 
            i.Name?.toLowerCase().includes('ppf') || i.Name?.toLowerCase().includes('epf')
        ).reduce((sum, i) => sum + (i.InvestedAmount || 0), 0);

        const total80C = Math.min(150000, auto80C_Investments + auto80C_PPF + manualInputs.other80C);

        // Auto-detect 80D: Medical Insurance premiums (from expense categories)
        // (Skipping deep transaction check here for performance, relying heavily on manual + basic mapped detection)
        const total80D = Math.min(75000, manualInputs.other80D); // Assuming parents+self max limit loosely

        const totalNPS = Math.min(50000, manualInputs.nps80CCD);

        // ── CAPITAL GAINS (Schedule CG) ──
        const totalLtcgEquity = assets.filter(a => a.AssetType === 'Stock' || a.AssetType === 'MF')
            .reduce((sum, a) => sum + (a.LTCG || 0), 0);
        const totalStcgEquity = assets.filter(a => a.AssetType === 'Stock' || a.AssetType === 'MF')
            .reduce((sum, a) => sum + (a.STCG || 0), 0);
        
        const totalLtcgDebt = assets.filter(a => a.AssetType !== 'Stock' && a.AssetType !== 'MF')
            .reduce((sum, a) => sum + (a.LTCG || 0), 0); // Note: Debt LTCG rules changed recently, but approximating
        const totalStcgDebt = assets.filter(a => a.AssetType !== 'Stock' && a.AssetType !== 'MF')
            .reduce((sum, a) => sum + (a.STCG || 0), 0);

        // ── NEW REGIME CALCULATION (FY 24-25) ──
        const newStandardDeduction = 75000; // Budget 2024 increased to 75k
        const newGrossIncome = manualInputs.salary + manualInputs.otherIncome + Math.max(0, totalStcgDebt + totalLtcgDebt);
        let newNetTaxable = Math.max(0, newGrossIncome - newStandardDeduction); // Only basic SD allowed
        
        const { baseTax: newBaseTax, details: newSlabDetails, rebate: newRebate } = calculateTaxSlabAndRebate(newNetTaxable, 'new');

        // Capital Gains Tax (Special Rates applied AFTER slab)
        const taxableLtcgEquity = Math.max(0, totalLtcgEquity - 125000); // 1.25L exemption (Budget 2024)
        const newCgTaxLtcg = taxableLtcgEquity * 0.125; // 12.5%
        const newCgTaxStcg = totalStcgEquity * 0.20;    // 20%
        
        let newTotalTax = newBaseTax + newCgTaxLtcg + newCgTaxStcg;
        const newCess = newTotalTax * 0.04;
        newTotalTax += newCess;

        // ── OLD REGIME CALCULATION ──
        const oldStandardDeduction = 50000;
        const totalOldDeductions = oldStandardDeduction + manualInputs.hraExempt + manualInputs.lta + manualInputs.interestHomeLoan + total80C + total80D + totalNPS + manualInputs.otherSections;
        const oldGrossIncome = manualInputs.salary + manualInputs.otherIncome + Math.max(0, totalStcgDebt + totalLtcgDebt);
        let oldNetTaxable = Math.max(0, oldGrossIncome - totalOldDeductions);

        const { baseTax: oldBaseTax, details: oldSlabDetails, rebate: oldRebate } = calculateTaxSlabAndRebate(oldNetTaxable, 'old');

        const oldCgTaxLtcg = taxableLtcgEquity * 0.125; // 12.5%
        const oldCgTaxStcg = totalStcgEquity * 0.20;    // 20%

        let oldTotalTax = oldBaseTax + oldCgTaxLtcg + oldCgTaxStcg;
        const oldCess = oldTotalTax * 0.04;
        oldTotalTax += oldCess;

        return {
            grossSalary: manualInputs.salary,
            otherIncome: manualInputs.otherIncome,
            
            auto80C_ELSS: auto80C_Investments,
            auto80C_PPF: auto80C_PPF,
            total80C, total80D, totalNPS,
            
            cg: { ltcgEq: totalLtcgEquity, stcgEq: totalStcgEquity, ltcgDebt: totalLtcgDebt, stcgDebt: totalStcgDebt },
            
            newRegime: {
                netTaxable: newNetTaxable,
                baseTax: newBaseTax,
                rebate: newRebate,
                cgTax: newCgTaxLtcg + newCgTaxStcg,
                cess: newCess,
                totalTax: newTotalTax,
                slabDetails: newSlabDetails
            },
            oldRegime: {
                netTaxable: oldNetTaxable,
                baseTax: oldBaseTax,
                rebate: oldRebate,
                cgTax: oldCgTaxLtcg + oldCgTaxStcg,
                totalDeductions: totalOldDeductions,
                cess: oldCess,
                totalTax: oldTotalTax,
                slabDetails: oldSlabDetails
            },

            bestRegime: newTotalTax <= oldTotalTax ? 'New' : 'Old',
            savings: Math.abs(newTotalTax - oldTotalTax)
        };
    }, [assets, dashboardData, investments, manualInputs]);

    if (loading) return <div className="page-loader">Initializing Tax Engine...</div>;

    // Chart logic for Old vs New visual comparison
    const chartData = {
        labels: ['New Regime', 'Old Regime'],
        datasets: [
            {
                label: 'Slab Tax',
                data: [taxData.newRegime.baseTax, taxData.oldRegime.baseTax],
                backgroundColor: '#818cf8',
            },
            {
                label: 'Capital Gains Tax',
                data: [taxData.newRegime.cgTax, taxData.oldRegime.cgTax],
                backgroundColor: '#f59e0b',
            },
            {
                label: 'Cess (4%)',
                data: [taxData.newRegime.cess, taxData.oldRegime.cess],
                backgroundColor: '#ef4444',
            }
        ]
    };

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            window.print();
            setIsExporting(false);
        }, 500);
    };

    return (
        <div className="dash-new">
            {/* Header */}
            <div className="dash-top-bar">
                <div>
                    <h1 className="dash-title">Indian Tax Assistant</h1>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>FY 2024-25 (AY 2025-26)</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button className="btn outline m-btn-icon" onClick={handleExport}>
                        <FiDownloadCloud /> <span className="m-hide-text">{isExporting ? 'Preparing...' : 'Export ITR'}</span>
                    </button>
                    <button className="btn btn-primary m-btn-icon" style={{ background: '#10b981' }}>
                        <FiCheckCircle /> <span className="m-hide-text">E-File</span>
                    </button>
                </div>
            </div>


            {/* Smart Recommendation Banner */}
            <div className="tax-recommend-banner">
                <div className="tax-recommend-content">
                    <div className="tax-recommend-icon" style={{ background: taxData.bestRegime === 'New' ? '#6366f1' : '#10b981' }}>
                        <FiShield size={isMobile ? 22 : 28} />
                    </div>
                    <div>
                        <h2 className="tax-recommend-title">
                            {isMobile ? 'Use ' : 'The '} <strong style={{ color: taxData.bestRegime === 'New' ? '#818cf8' : '#10b981' }}>{taxData.bestRegime} Regime</strong>
                        </h2>
                        <p className="tax-recommend-subtitle">
                            You save <strong>₹{fmt(taxData.savings)}</strong>
                        </p>
                    </div>
                </div>
                <div className="tax-recommend-value-box">
                    <p className="tax-recommend-label">Tax Payable</p>
                    <h1 className="tax-recommend-value" style={{ color: taxData.bestRegime === 'New' ? '#818cf8' : '#10b981' }}>
                        ₹{fmt(Math.min(taxData.newRegime.totalTax, taxData.oldRegime.totalTax))}
                    </h1>
                </div>
            </div>


            {/* Custom Tabs */}
            <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
                {['overview', 'income', 'deductions', 'capital_gains'].map(tab => (
                    <button key={tab} 
                        style={{
                            background: 'none', border: 'none', padding: '0 0 12px 0', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
                            color: activeTab === tab ? '#818cf8' : 'var(--text-muted)',
                            borderBottom: activeTab === tab ? '3px solid #818cf8' : '3px solid transparent',
                            textTransform: 'capitalize'
                        }}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="tax-overview-grid">

                    
                    {/* Regimes Comparison Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* New Regime Card */}
                        <div className="dash-panel" style={{ border: taxData.bestRegime === 'New' ? '2px solid #6366f1' : undefined, position: 'relative' }}>
                            {taxData.bestRegime === 'New' && <div style={{ position: 'absolute', top: -12, right: 24, background: '#6366f1', color: '#fff', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '12px', fontWeight: 700 }}>RECOMMENDED</div>}
                            <h3 style={{ margin: '0 0 16px 0', display: 'flex', justifyContent: 'space-between' }}>
                                New Regime 
                                <span style={{ color: '#818cf8' }}>₹{fmt(taxData.newRegime.totalTax)}</span>
                            </h3>

                            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8, fontSize: '0.9rem', marginBottom: '8px' }}>
                                <span>Gross Income:</span> <span>₹{fmt(manualInputs.salary + manualInputs.otherIncome + taxData.cg.stcgDebt + taxData.cg.ltcgDebt)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8, fontSize: '0.9rem', marginBottom: '8px' }}>
                                <span>Standard Deduction:</span> <span style={{ color: '#10b981' }}>-₹75,000</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8, fontSize: '0.9rem', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span>Other Deductions:</span> <span style={{ color: '#ef4444' }}>Not Allowed</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, margin: '12px 0 16px 0' }}>
                                <span>Net Taxable Income:</span> <span>₹{fmt(taxData.newRegime.netTaxable)}</span>
                            </div>
                            
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                                {taxData.newRegime.slabDetails.length > 0 ? taxData.newRegime.slabDetails.map((s,i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span>{s.range} ({s.rate}):</span>
                                        <span>₹{fmt(s.tax)}</span>
                                    </div>
                                )) : <div style={{ textAlign: 'center' }}>No slab tax applicable</div>}
                                {taxData.newRegime.rebate > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 600, marginTop: 8 }}>
                                        <span>Rebate u/s 87A:</span>
                                        <span>-₹{fmt(taxData.newRegime.rebate)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Old Regime Card */}
                        <div className="dash-panel" style={{ border: taxData.bestRegime === 'Old' ? '2px solid #10b981' : undefined, opacity: taxData.bestRegime === 'New' ? 0.7 : 1, position: 'relative' }}>
                            {taxData.bestRegime === 'Old' && <div style={{ position: 'absolute', top: -12, right: 24, background: '#10b981', color: '#fff', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '12px', fontWeight: 700 }}>RECOMMENDED</div>}
                            <h3 style={{ margin: '0 0 16px 0', display: 'flex', justifyContent: 'space-between' }}>
                                Old Regime 
                                <span>₹{fmt(taxData.oldRegime.totalTax)}</span>
                            </h3>

                            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8, fontSize: '0.9rem', marginBottom: '8px' }}>
                                <span>Gross Income:</span> <span>₹{fmt(manualInputs.salary + manualInputs.otherIncome + taxData.cg.stcgDebt + taxData.cg.ltcgDebt)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8, fontSize: '0.9rem', marginBottom: '8px' }}>
                                <span>Standard Deduction:</span> <span style={{ color: '#10b981' }}>-₹50,000</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8, fontSize: '0.9rem', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span>Chapter VI-A Deductions:</span> <span style={{ color: '#10b981' }}>-₹{fmt(taxData.oldRegime.totalDeductions - 50000)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, margin: '12px 0 16px 0' }}>
                                <span>Net Taxable Income:</span> <span>₹{fmt(taxData.oldRegime.netTaxable)}</span>
                            </div>

                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                                {taxData.oldRegime.slabDetails.length > 0 ? taxData.oldRegime.slabDetails.map((s,i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span>{s.range} ({s.rate}):</span>
                                        <span>₹{fmt(s.tax)}</span>
                                    </div>
                                )) : <div style={{ textAlign: 'center' }}>No slab tax applicable</div>}
                                {taxData.oldRegime.rebate > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 600, marginTop: 8 }}>
                                        <span>Rebate u/s 87A:</span>
                                        <span>-₹{fmt(taxData.oldRegime.rebate)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chart Panel */}
                    <div className="dash-panel" style={{ height: '100%' }}>
                        <div className="dash-panel-header">
                            <span className="dash-panel-title">Tax Breakdown Comparison</span>
                        </div>
                        <div style={{ height: '350px', marginTop: '16px' }}>
                            <Bar 
                                data={chartData} 
                                options={{
                                    responsive: true, maintainAspectRatio: false,
                                    scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' } } },
                                    plugins: { legend: { position: 'top', labels: { color: '#8b91b0' } } }
                                }}
                            />
                        </div>

                        <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b', fontWeight: 600, marginBottom: 8 }}>
                                <FiInfo /> Quick Tip
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                If you select the New Tax Regime, you forgo HRA, LTA, 80C, 80D, and most other deductions in exchange for lower base slab rates and a higher Standard Deduction of ₹75,000.
                            </p>
                        </div>
                    </div>

                </div>
            )}

            {/* TAB CONTENT: INCOME */}
            {activeTab === 'income' && (
                <div className="dash-panel">
                    <div className="dash-panel-header" style={{ marginBottom: '24px' }}>
                        <span className="dash-panel-title">Income Sources</span>
                    </div>
                    
                    <div className="tax-income-grid">

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                Gross Salary / Freelance Income (Annual)
                                <span style={{ float: 'right', fontSize: '0.75rem', color: '#10b981' }}>Auto-detected: ₹{fmt((dashboardData?.totalIncome || 0)*12)}</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <FiDollarSign style={{ position: 'absolute', left: 16, top: 18, color: 'var(--text-muted)' }} />
                                <input type="text" name="salary" className="form-input" 
                                    style={{ paddingLeft: '40px', fontSize: '1.2rem', fontWeight: 600 }}
                                    value={manualInputs.salary.toLocaleString()} 
                                    onChange={handleChange} 
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Other Sources (Interest, Dividends)</label>
                            <div style={{ position: 'relative' }}>
                                <FiDollarSign style={{ position: 'absolute', left: 16, top: 18, color: 'var(--text-muted)' }} />
                                <input type="text" name="otherIncome" className="form-input" 
                                    style={{ paddingLeft: '40px', fontSize: '1.2rem', fontWeight: 600 }}
                                    value={manualInputs.otherIncome.toLocaleString()} 
                                    onChange={handleChange} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: DEDUCTIONS */}
            {activeTab === 'deductions' && (
                <div className="dash-panel">
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '12px', color: '#ef4444', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <FiAlertCircle size={24} />
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>These deductions are ONLY applicable if you opt for the <strong>OLD Tax Regime</strong>.</p>
                    </div>

                    <div className="dash-panel-header" style={{ marginBottom: '24px' }}>
                        <span className="dash-panel-title">Section 80C & Others (Max ₹1,50,000)</span>
                    </div>
                    
                    <div className="tax-deductions-row">

                        {/* Auto Detected Column */}
                        <div style={{ flex: 1, background: 'rgba(0,0,0,0.15)', padding: '24px', borderRadius: '12px' }}>
                            <h4 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}><FiActivity color="#10b981" /> Auto-Detected from Portfolio</h4>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                                <span style={{ opacity: 0.8 }}>ELSS Mutual Funds</span>
                                <span style={{ fontWeight: 600 }}>₹{fmt(taxData.auto80C_ELSS)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                                <span style={{ opacity: 0.8 }}>PPF / EPF</span>
                                <span style={{ fontWeight: 600 }}>₹{fmt(taxData.auto80C_PPF)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>
                                <span>Total Detected:</span>
                                <span>₹{fmt(taxData.auto80C_ELSS + taxData.auto80C_PPF)}</span>
                            </div>
                        </div>

                        {/* Manual Overrides */}
                        <div style={{ flex: 1 }}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Missing 80C (LIC, Tuition fee, Principal on Home Loan)</label>
                                <input type="text" name="other80C" className="form-input" 
                                    value={manualInputs.other80C.toLocaleString()} onChange={handleChange} />
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: taxData.total80C >= 150000 ? '#10b981' : '#f59e0b' }}>
                                Total 80C Claimed: ₹{fmt(taxData.total80C)} / ₹1,50,000 max.
                            </p>
                        </div>
                    </div>

                    <div className="dash-panel-header" style={{ marginBottom: '24px', marginTop: '16px' }}>
                        <span className="dash-panel-title">Health, NPS & Housing</span>
                    </div>
                    <div className="tax-deductions-grid">

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>80D: Health Insurance</label>
                            <input type="text" name="other80D" className="form-input" value={manualInputs.other80D.toLocaleString()} onChange={handleChange} />
                            <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>Used self/parents limits up to ₹75k</small>
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>80CCD(1B): Additional NPS</label>
                            <input type="text" name="nps80CCD" className="form-input" value={manualInputs.nps80CCD.toLocaleString()} onChange={handleChange} />
                            <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>Max ₹50,000 allowed extra</small>
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>HRA Exemption / LTA</label>
                            <input type="text" name="hraExempt" className="form-input" value={manualInputs.hraExempt.toLocaleString()} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Sec 24: Home Loan Interest</label>
                            <input type="text" name="interestHomeLoan" className="form-input" value={manualInputs.interestHomeLoan.toLocaleString()} onChange={handleChange} />
                            <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>Max ₹2,00,000 for self-occupied</small>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: CAPITAL GAINS */}
            {activeTab === 'capital_gains' && (
                <div>
                     {/* Summary Row */}
                    <div className="tax-cg-summary-row">

                        <div className="dash-panel" style={{ border: '1px solid rgba(16,185,129,0.3)' }}>
                            <div className="dash-panel-header" style={{ marginBottom: '16px' }}>
                                <span className="dash-panel-title">Long Term Capital Gains (LTCG)</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span>Equity (+1 yr)</span> <span style={{ fontWeight: 600, color: '#10b981' }}>+₹{fmt(taxData.cg.ltcgEq)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span>Debt/Other</span> <span style={{ fontWeight: 600, color: '#10b981' }}>+₹{fmt(taxData.cg.ltcgDebt)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                <span>Exempt Amount (Budget '24)</span> <span style={{ color: '#f59e0b' }}>-₹1,25,000</span>
                            </div>
                            <h2 style={{ margin: '16px 0 0 0', color: '#10b981' }}>Tax @ 12.5%: ₹{fmt(Math.max(0, taxData.cg.ltcgEq - 125000) * 0.125)}</h2>
                        </div>

                        <div className="dash-panel" style={{ border: '1px solid rgba(245,158,11,0.3)' }}>
                            <div className="dash-panel-header" style={{ marginBottom: '16px' }}>
                                <span className="dash-panel-title">Short Term Capital Gains (STCG)</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span>Equity (-1 yr)</span> <span style={{ fontWeight: 600, color: '#f59e0b' }}>+₹{fmt(taxData.cg.stcgEq)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span>Debt/Other</span> <span style={{ fontWeight: 600, color: '#f59e0b' }}>+₹{fmt(taxData.cg.stcgDebt)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, opacity: 0.5 }}>
                                <span>Exempt Amount</span> <span>₹0</span>
                            </div>
                            <h2 style={{ margin: '16px 0 0 0', color: '#f59e0b' }}>Tax @ 20%: ₹{fmt(taxData.cg.stcgEq * 0.20)}</h2>
                        </div>
                    </div>

                    <div className="table-wrapper dash-panel" style={{ padding: 0, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                                <tr>
                                    <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600 }}>Asset Name</th>
                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Class</th>
                                    <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>LTCG Realised</th>
                                    <th style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 600 }}>STCG Realised</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assets.filter(a => a.LTCG !== 0 || a.STCG !== 0).map((a, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '16px 20px', fontWeight: 600 }}>{a.Name} <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginLeft: 8 }}>{a.Ticker}</span></td>
                                        <td style={{ padding: '16px', opacity: 0.8 }}>{a.AssetType}</td>
                                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: a.LTCG >= 0 ? '#10b981' : '#ef4444' }}>₹{fmt(a.LTCG)}</td>
                                        <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 600, color: a.STCG >= 0 ? '#f59e0b' : '#ef4444' }}>₹{fmt(a.STCG)}</td>
                                    </tr>
                                ))}
                                {assets.filter(a => a.LTCG !== 0 || a.STCG !== 0).length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '32px', textAlign: 'center', opacity: 0.5 }}>No capital gains/losses realised yet. (Must register SELL transactions).</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

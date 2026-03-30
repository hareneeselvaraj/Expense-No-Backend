import { useState, useEffect } from 'react';
import api from '../services/api';
import { FiCpu, FiShield, FiTrendingUp, FiCheckCircle, FiAlertCircle, FiInfo, FiChevronRight } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

export default function TaxAdvisor() {
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState(null);
    const { theme } = useTheme();

    useEffect(() => {
        // Fetch all transactions and investments to generate AI advice
        Promise.all([
            api.get('/transactions/all'),
            api.get('/portfolioanalytics/assets/Stock'),
            api.get('/portfolioanalytics/assets/MutualFund')
        ]).then(([txnRes, stockRes, mfRes]) => {
            const txns = txnRes.data || [];
            const stocks = stockRes.data || [];
            const mfs = mfRes.data || [];

            // Calculate mock insights based on real data
            const totalIncome = txns.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
            const elssInvestments = mfs.filter(m => m.name.toLowerCase().includes('elss') || m.name.toLowerCase().includes('tax')).reduce((sum, m) => sum + m.investedAmount, 0);
            
            const generatedInsights = {
                recommendedRegime: totalIncome > 1500000 && elssInvestments < 150000 ? 'New Regime' : 'Old Regime',
                savingsPotential: Math.max(0, 150000 - elssInvestments),
                cards: [
                    {
                        title: "Section 80C Optimization",
                        status: elssInvestments >= 150000 ? 'optimal' : 'warning',
                        description: `You have invested ₹${elssInvestments.toLocaleString('en-IN')} out of your ₹1.5L limit.`,
                        action: elssInvestments >= 150000 ? "Great job maximizing your 80C deductions!" : `Invest ₹${(150000 - elssInvestments).toLocaleString('en-IN')} more to maximize tax savings under the Old Regime. ELSS funds are highly recommended.`,
                        icon: <FiShield />
                    },
                    {
                        title: "Regime Suggestion: " + (totalIncome > 1500000 && elssInvestments < 150000 ? 'New Regime' : 'Old Regime'),
                        status: 'info',
                        description: `Based on your estimated income of ₹${totalIncome.toLocaleString('en-IN')} and current deductions.`,
                        action: totalIncome > 1500000 && elssInvestments < 150000 
                            ? "The New Regime might be more beneficial as your current deductions don't offset the lower tax slabs." 
                            : "Stick with the Old Regime and maximize 80C/80D to reduce your taxable income.",
                        icon: <FiTrendingUp />
                    },
                    {
                        title: "Capital Gains Harvesting",
                        status: stocks.some(s => s.overallPnL > 100000) ? 'warning' : 'optimal',
                        description: "Review your equity portfolio for Long Term Capital Gains (LTCG).",
                        action: stocks.some(s => s.overallPnL > 100000) 
                            ? "You have stocks with significant gains. Consider tax-loss harvesting or booking profits under the ₹1.25L tax-free LTCG limit before March 31st." 
                            : "Your equity portfolio is currently optimized for LTCG exemptions.",
                        icon: <FiAlertCircle />
                    }
                ]
            };
            
            setInsights(generatedInsights);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="page-loader">AI Advisor is analyzing your finances...</div>;

    return (
        <div className="page">
            <div className="page-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <div>
                    <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FiCpu style={{ color: '#8b5cf6' }} /> AI Tax Advisor
                    </h2>
                    <p className="inv-subtitle">Personalized, regime-specific financial advice powered by your data.</p>
                </div>
            </div>

            <div className="dash-panel tax-advisor-hero" style={{ 
                background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                padding: '32px',
                marginTop: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '24px'
            }}>
                <div>
                    <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#c084fc', fontWeight: 600, marginBottom: '8px' }}>
                        AI Recommendation
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                        {insights?.recommendedRegime}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '500px' }}>
                        After analyzing your income streams and active investments, our engine suggests the {insights?.recommendedRegime} would result in the lowest tax liability for FY 2024-25.
                    </div>
                </div>
                {insights?.savingsPotential > 0 && (
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', minWidth: '200px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '8px' }}>Actionable Savings</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981' }}>+₹{insights.savingsPotential.toLocaleString('en-IN')}</div>
                    </div>
                )}
            </div>

            <h3 style={{ marginTop: '2.5rem', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiInfo style={{ color: '#6366f1' }} /> Actionable Insights
            </h3>

            <div className="tax-insight-cards" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {insights?.cards.map((card, idx) => (
                    <div key={idx} className="dash-panel" style={{ 
                        display: 'flex', 
                        gap: '20px', 
                        padding: '24px',
                        borderLeft: card.status === 'optimal' ? '4px solid #10b981' : card.status === 'warning' ? '4px solid #f59e0b' : '4px solid #3b82f6'
                    }}>
                        <div style={{ 
                            width: '48px', height: '48px', borderRadius: '12px', 
                            background: card.status === 'optimal' ? 'rgba(16,185,129,0.1)' : card.status === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
                            color: card.status === 'optimal' ? '#10b981' : card.status === 'warning' ? '#f59e0b' : '#3b82f6',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0
                        }}>
                            {card.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{card.title}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>{card.description}</div>
                            <div style={{ 
                                background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px', 
                                border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem', color: '#e2e8f0',
                                display: 'flex', alignItems: 'flex-start', gap: '8px'
                            }}>
                                <FiChevronRight style={{ color: '#a0a0b0', marginTop: '2px', flexShrink: 0 }} />
                                {card.action}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

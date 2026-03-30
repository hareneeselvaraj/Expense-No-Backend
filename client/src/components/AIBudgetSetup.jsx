import { useState, useEffect } from 'react';
import { FiZap, FiCheck, FiLoader, FiChevronDown, FiChevronUp, FiEdit3, FiSettings } from 'react-icons/fi';
import api from '../services/api';
import { useToast } from './Toast';

export default function AIBudgetSetup({ onApplied }) {
    const toast = useToast();
    const [open, setOpen]                   = useState(false);
    const [prompt, setPrompt]               = useState('');
    const [loading, setLoading]             = useState(false);
    const [applying, setApplying]           = useState(false);
    const [result, setResult]               = useState(null);
    const [editAmounts, setEditAmounts]     = useState({});
    const [allCategories, setAllCategories] = useState([]);
    const [catError, setCatError]           = useState(false);
    const [excluded, setExcluded]           = useState(new Set());
    const [showCatPicker, setShowCatPicker] = useState(false);

    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();

    const SUGGESTIONS = [
        'I earn ₹80,000 and want to save 20% each month',
        'Monthly income ₹50,000, save at least ₹10,000',
        'I earn ₹1,20,000 and want to save 30% each month',
    ];

    // Fetch ALL categories — not just "Expense" typed ones
    // (We need them all, but only Expense will be used for the budget checklist)
    useEffect(() => {
        if (!open) return;
        setCatError(false);
        api.get('/category')
            .then(res => setAllCategories(res.data || []))
            .catch(() => setCatError(true));
    }, [open]);

    const toggleExclude = (id) => {
        setExcluded(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
        setResult(null);
    };

    // Investment categories are filtered out at fetch

    // List of categories that are eligible for budget setup (Expense only)
    const budgetCategories = allCategories.filter(c => c.type === 'Expense');
    const includedCount = budgetCategories.filter(c => !excluded.has(c.id)).length;

    const parseAmount = (raw, fallback) => {
        // Accept "0" (string) as a real value; treat ""/null/undefined as empty.
        const candidate = (raw === '' || raw === null || raw === undefined) ? fallback : raw;
        const n = typeof candidate === 'number' ? candidate : parseFloat(String(candidate).replace(/,/g, ''));
        if (!Number.isFinite(n) || n < 0) return fallback;
        return n;
    };

    const generate = async () => {
        if (!prompt.trim() || includedCount === 0) return;
        setLoading(true);
        setResult(null);
        try {
            const excludedCategoryIds = Array.from(excluded);
            const res = await api.post('/aifeatures/budget/generate', {
                prompt,
                month,
                year,
                excludedCategoryIds
            });
            setResult(res.data);
            const amounts = {};
            (res.data.suggestions || []).forEach(s => {
                amounts[s.categoryId] = s.suggestedAmount;
            });
            setEditAmounts(amounts);
        } catch {
            toast.error('Could not generate budget. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const applyAll = async () => {
        if (!result?.suggestions?.length) return;
        setApplying(true);
        try {
            const budgets = result.suggestions.map(s => ({
                ...s,
                suggestedAmount: parseAmount(editAmounts[s.categoryId], s.suggestedAmount)
            }));
            await api.post('/aifeatures/budget/apply', { budgets, month, year });
            toast.success(`${budgets.length} budgets applied for ${now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}!`);
            setResult(null);
            setPrompt('');
            setOpen(false);
            onApplied?.();
        } catch {
            toast.error('Failed to apply budgets.');
        } finally {
            setApplying(false);
        }
    };

    const fmt = v => `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
    const total = result?.suggestions?.reduce((s, x) => {
        return s + parseAmount(editAmounts[x.categoryId], x.suggestedAmount);
    }, 0) ?? 0;

    const includedCats     = budgetCategories.filter(c => !excluded.has(c.id));
    const excludedCats     = budgetCategories.filter(c => excluded.has(c.id));

    return (
        <div className="ai-budget-setup">

            {/* ── Toggle ── */}
            <button className="aibs-toggle" onClick={() => setOpen(o => !o)}>
                <div className="aibs-toggle-left">
                    <div className="aibs-toggle-icon"><FiZap /></div>
                    <div>
                        <p className="aibs-toggle-title">AI Budget Setup</p>
                        <p className="aibs-toggle-sub">Describe your income and savings goal — AI creates your budget</p>
                    </div>
                </div>
                {open ? <FiChevronUp /> : <FiChevronDown />}
            </button>

            {open && catError ? (
                <div className="aibs-body" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <p className="aibs-warn" style={{ marginBottom: 16 }}>Failed to load categories. The AI budget generator requires your category data.</p>
                    <button className="btn btn-outline" onClick={() => { setOpen(false); setTimeout(() => setOpen(true), 10); }}>Retry</button>
                </div>
            ) : open && (
                <div className="aibs-body">

                    {/* ── Category picker ── */}
                    {allCategories.length > 0 && (
                        <>
                            <div className="aibs-cat-row">
                                <button
                                    className="aibs-cat-toggle"
                                    onClick={() => setShowCatPicker(p => !p)}
                                >
                                    <FiSettings size={13} />
                                    {showCatPicker ? 'Hide' : 'Choose'} categories
                                    <span className="aibs-cat-count">
                                        {includedCount}/{budgetCategories.length} selected
                                    </span>
                                </button>
                            </div>

                            {showCatPicker && (
                                <div className="aibs-cat-picker">
                                    <p className="aibs-cat-picker-hint">
                                        ✓ = included in budget &nbsp;·&nbsp; ✕ = excluded.
                                        Investment categories are excluded by default.
                                    </p>
                                    <div className="aibs-cat-chips">
                                        {budgetCategories.map(c => {
                                            const isExcluded = excluded.has(c.id);
                                            return (
                                                <button
                                                    key={c.id}
                                                    className={`aibs-cat-chip ${isExcluded ? 'excluded' : 'included'}`}
                                                    onClick={() => toggleExclude(c.id)}
                                                >
                                                    {c.icon && <span>{c.icon}</span>}
                                                    {c.name}
                                                    <span style={{ marginLeft: 3 }}>{isExcluded ? '✕' : '✓'}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── Prompt ── */}
                    <div className="aibs-input-row">
                        <input
                            className="aibs-input"
                            placeholder='e.g. "I earn ₹80,000 and want to save 20% each month"'
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && generate()}
                            disabled={loading}
                        />
                        <button
                            className="btn btn-primary aibs-gen-btn"
                            onClick={generate}
                            disabled={!prompt.trim() || loading || includedCount === 0}
                        >
                            {loading
                                ? <><FiLoader className="spin" /> Analysing…</>
                                : <><FiZap /> Generate</>}
                        </button>
                    </div>

                    {includedCount === 0 && (
                        <p className="aibs-warn">Please include at least one category.</p>
                    )}

                    {/* ── Quick prompts ── */}
                    {!result && !loading && (
                        <div className="aibs-chips">
                            {SUGGESTIONS.map((s, i) => (
                                <button key={i} className="aibs-chip" onClick={() => setPrompt(s)}>{s}</button>
                            ))}
                        </div>
                    )}

                    {/* ── Loading ── */}
                    {loading && (
                        <div className="aibs-loading">
                            <FiLoader className="spin" size={20} />
                            <span>Generating budgets for {includedCount} categories…</span>
                        </div>
                    )}

                    {/* ── Results ── */}
                    {result && !loading && (
                        <div className="aibs-results">
                            <div className="aibs-summary">
                                <FiZap size={14} />
                                <span>{result.summary}</span>
                            </div>

                            {!result.suggestions?.length ? (
                                <p className="aibs-warn">
                                    No suggestions returned. Try including more categories or rephrasing your prompt.
                                </p>
                            ) : (
                                <>
                                    <div className="aibs-table-wrap">
                                        <table className="aibs-table">
                                            <thead>
                                                <tr>
                                                    <th>Category</th>
                                                    <th>Suggested Amount</th>
                                                    <th>Why</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {result.suggestions.map(s => (
                                                    <tr key={s.categoryId}>
                                                        <td className="aibs-cat-cell">
                                                            <span className="aibs-cat-dot" />
                                                            {s.categoryName}
                                                        </td>
                                                        <td className="aibs-amount-cell">
                                                            <div className="aibs-amount-input-wrap">
                                                                <span className="aibs-rupee">₹</span>
                                                                <input
                                                                    type="number"
                                                                    className="aibs-amount-input"
                                                                    value={editAmounts[s.categoryId] ?? s.suggestedAmount}
                                                                    onChange={e => setEditAmounts(prev => ({
                                                                        ...prev,
                                                                        [s.categoryId]: e.target.value
                                                                    }))}
                                                                />
                                                                <FiEdit3 size={11} className="aibs-edit-icon" />
                                                            </div>
                                                        </td>
                                                        <td className="aibs-reason-cell">{s.reasoning}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="aibs-footer">
                                        <div className="aibs-total">
                                            Total: <strong>{fmt(total)}</strong> / month
                                        </div>
                                        <div className="aibs-footer-actions">
                                            <button className="btn btn-outline" onClick={() => setResult(null)}>
                                                Discard
                                            </button>
                                            <button
                                                className="btn btn-primary"
                                                onClick={applyAll}
                                                disabled={applying}
                                            >
                                                {applying
                                                    ? <><FiLoader className="spin" /> Applying…</>
                                                    : <><FiCheck /> Apply {result.suggestions.length} Budgets</>}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

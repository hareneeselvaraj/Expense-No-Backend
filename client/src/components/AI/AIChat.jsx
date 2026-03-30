import { useState, useRef, useEffect } from 'react';
import { FiSend, FiCpu, FiX, FiZap, FiChevronRight, FiRefreshCw, FiCopy, FiCheck, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { BiMath, BiTrendingUp, BiHomeAlt, BiCoin, BiReceipt, BiTargetLock } from 'react-icons/bi';
import api from '../../services/api';
import './AIChat_styles.css';

const SUGGESTIONS = [
    "Why did I overspend this month?",
    "Am I on track for my savings goals?",
    "Which category should I cut back on?",
    "How is my investment portfolio performing?",
    "What's my net worth?",
    "Give me a summary of my finances this month",
];

// --- Simple Markdown Parser ---
function parseMarkdown(text) {
    if (!text) return null;
    let lines = text.split('\n');
    let elements = [];
    let inList = false;
    let listItems = [];

    const flushList = () => {
        if (inList && listItems.length > 0) {
            elements.push(<ul key={`ul-${elements.length}`} className="aic-list">{[...listItems]}</ul>);
            listItems = [];
            inList = false;
        }
    };

    const parseInline = (str, lineIndex) => {
        const parts = str.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={`${lineIndex}-${i}`}>{part.slice(2, -2)}</strong>;
            }
            return <span key={`${lineIndex}-${i}`}>{part}</span>;
        });
    };

    lines.forEach((line, i) => {
        let trimmed = line.trim();
        if (trimmed.startsWith('### ')) {
            flushList();
            elements.push(<h4 key={i} className="aic-heading">{parseInline(trimmed.substring(4), i)}</h4>);
        } else if (trimmed.startsWith('## ')) {
            flushList();
            elements.push(<h3 key={i} className="aic-heading">{parseInline(trimmed.substring(3), i)}</h3>);
        } else if (trimmed.startsWith('# ')) {
            flushList();
            elements.push(<h2 key={i} className="aic-heading">{parseInline(trimmed.substring(2), i)}</h2>);
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            inList = true;
            listItems.push(<li key={`li-${i}`}>{parseInline(trimmed.substring(2), i)}</li>);
        } else if (/^\d+\.\s/.test(trimmed)) {
            inList = true;
            listItems.push(<li key={`li-${i}`}>{parseInline(trimmed.replace(/^\d+\.\s/, ''), i)}</li>);
        } else if (trimmed === '') {
            flushList();
            elements.push(<div key={`br-${i}`} className="aic-br" />);
        } else {
            flushList();
            elements.push(<div key={i} className="aic-p">{parseInline(line, i)}</div>);
        }
    });
    flushList();
    return <div className="aic-md">{elements}</div>;
}

function TypingDots() {
    return (
        <div className="aic-typing">
            <span /><span /><span />
        </div>
    );
}

function Message({ msg }) {
    const isUser = msg.role === 'user';
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(msg.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const timestamp = new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`aic-msg-row ${isUser ? 'aic-msg-user' : 'aic-msg-ai'}`}>
            {!isUser && (
                <div className="aic-avatar aic-avatar-ai">
                    <FiCpu size={14} />
                </div>
            )}
            <div className={`aic-bubble-wrapper ${isUser ? 'aic-wrapper-user' : 'aic-wrapper-ai'}`}>
                <div className={`aic-bubble ${isUser ? 'aic-bubble-user' : 'aic-bubble-ai'}`}>
                    {isUser ? (
                        msg.content.split('\n').map((line, i) => (
                            <span key={i}>
                                {line}
                                {i < msg.content.split('\n').length - 1 && <br />}
                            </span>
                        ))
                    ) : (
                        parseMarkdown(msg.content)
                    )}
                </div>
                <div className="aic-msg-footer">
                    <span className="aic-time">{timestamp}</span>
                    {!isUser && (
                        <button className="aic-copy-btn" onClick={handleCopy} title="Copy message">
                            {copied ? <FiCheck size={12} color="#10b981" /> : <FiCopy size={12} />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

const CALCULATORS = {
    emi: { id: 'emi', name: 'EMI', icon: <BiHomeAlt />, desc: 'Calculate Loan EMI' },
    sip: { id: 'sip', name: 'SIP', icon: <BiTrendingUp />, desc: 'Systematic Inv. Plan' },
    fd: { id: 'fd', name: 'FD', icon: <BiMath />, desc: 'Fixed Deposit Returns' },
    ci: { id: 'ci', name: 'Compound', icon: <BiCoin />, desc: 'Compound Interest' },
    tax: { id: 'tax', name: 'Tax', icon: <BiReceipt />, desc: 'Income Tax Estimator' },
    goal: { id: 'goal', name: 'Goal', icon: <BiTargetLock />, desc: 'Savings Goal Planner' }
};

export default function AIChat() {
    // Determine initial state based on window size
    const isMobile = window.innerWidth <= 600;
    const [isOpen, setIsOpen] = useState(false);

    // Resize state
    const [size, setSize] = useState({ width: 400, height: 600 });
    const dragRef = useRef({ x: 0, y: 0, w: 0, h: 0 });

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Calculator state
    const [activeCalc, setActiveCalc] = useState(null);
    const [calcData, setCalcData] = useState({});
    const [calcResult, setCalcResult] = useState(null);

    // Auto-scroll on new message
    useEffect(() => {
        if (isOpen) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, loading, activeCalc, isOpen]);

    const sendMessage = async (text, hideFromUI = false) => {
        const userText = (text || input).trim();
        if (!userText || loading) return;

        setInput('');
        setError(null);

        const newMsg = { role: 'user', content: userText, timestamp: Date.now() };
        if (!hideFromUI) {
            setMessages(prev => [...prev, newMsg]);
        }
        setLoading(true);
        setActiveCalc(null);

        try {
            const historyToAI = messages.map(m => ({ role: m.role, content: m.content }));
            const res = await api.post('/aichat', { message: userText, history: historyToAI });

            const aiMsg = { role: 'assistant', content: res.data.reply, timestamp: Date.now() };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            setError('Could not reach the AI. Please try again.');
            if (!hideFromUI) {
                setMessages(prev => prev.slice(0, -1));
            }
        } finally {
            setLoading(false);
            if (!hideFromUI) inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([]);
        setError(null);
        setActiveCalc(null);
        inputRef.current?.focus();
    };

    const sendCalcToChat = () => {
        if (!calcResult) return;
        const msg = `I calculated my ${activeCalc.toUpperCase()}:\n${calcResult.summary}\nWhat does this mean for my financial health?`;
        sendMessage(msg);
    };

    const handleCalcChange = (field, val) => {
        const num = parseFloat(val) || 0;
        const newData = { ...calcData, [field]: num };
        setCalcData(newData);

        let res = null;
        if (activeCalc === 'emi' && newData.p && newData.r && newData.t) {
            const p = newData.p, r = newData.r / 12 / 100, n = newData.t * 12;
            const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            res = { val1: emi, label1: 'Monthly EMI', val2: (emi * n) - p, label2: 'Total Interest', summary: `Loan: ₹${p}\nTenure: ${newData.t}yrs @ ${newData.r}%\nEMI: ₹${Math.round(emi)}` };
        } else if (activeCalc === 'sip' && newData.inv && newData.r && newData.t) {
            const p = newData.inv, r = newData.r / 12 / 100, n = newData.t * 12;
            const fv = p * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
            res = { val1: fv, label1: 'Expected Amount', val2: fv - (p * n), label2: 'Wealth Gained', summary: `SIP: ₹${p}/mo\nDuration: ${newData.t}yrs @ ${newData.r}%\nFuture Value: ₹${Math.round(fv)}` };
        } else if (activeCalc === 'fd' && newData.p && newData.r && newData.t) {
            const p = newData.p, r = newData.r / 100, t = newData.t;
            const fv = p * Math.pow(1 + (r / 4), 4 * t);
            res = { val1: fv, label1: 'Maturity Amount', val2: fv - p, label2: 'Interest Earned', summary: `FD: ₹${p}\nDuration: ${t}yrs @ ${newData.r}%\nMaturity: ₹${Math.round(fv)}` };
        } else if (activeCalc === 'goal' && newData.target && newData.t && newData.r) {
            const fv = newData.target, r = newData.r / 12 / 100, n = newData.t * 12;
            const sip = (fv * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));
            res = { val1: Math.ceil(sip), label1: 'Monthly SIP Requires', val2: newData.target, label2: 'Target Amount', summary: `Goal: ₹${newData.target} in ${newData.t}yrs at ${newData.r}%\nMonthly SIP: ₹${Math.ceil(sip)}` };
        } else if (activeCalc === 'tax' && newData.income) {
            let income = newData.income, tax = 0;
            if (income > 700000) {
                if (income > 300000) tax += Math.min(income - 300000, 300000) * 0.05;
                if (income > 600000) tax += Math.min(income - 600000, 300000) * 0.10;
                if (income > 900000) tax += Math.min(income - 900000, 300000) * 0.15;
                if (income > 1200000) tax += Math.min(income - 1200000, 300000) * 0.20;
                if (income > 1500000) tax += (income - 1500000) * 0.30;
                tax += tax * 0.04;
            }
            res = { val1: tax, label1: 'Estimated Tax', val2: income - tax, label2: 'Net Income', summary: `Income: ₹${income}\nTax (New Regime): ₹${Math.round(tax)}` };
        }
        setCalcResult(res);
    };

    const toggleCalc = (id) => {
        if (activeCalc === id) {
            setActiveCalc(null);
        } else {
            setActiveCalc(id);
            setCalcData({});
            setCalcResult(null);
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    };

    // --- Resizing Logic ---
    const handleMouseDown = (e) => {
        e.preventDefault();
        dragRef.current = { x: e.clientX, y: e.clientY, w: size.width, h: size.height };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        // Since widget is anchored to bottom-right, dragging top-left outward (negative dx, negative dy) increases size
        const dx = e.clientX - dragRef.current.x;
        const dy = e.clientY - dragRef.current.y;

        setSize({
            width: Math.max(300, Math.min(dragRef.current.w - dx, window.innerWidth - 40)),
            height: Math.max(400, Math.min(dragRef.current.h - dy, window.innerHeight - 80))
        });
    };

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    const isEmpty = messages.length === 0;

    return (
        <div className="aic-widget-container">

            {/* FAB Trigger - Round Floating Button */}
            {!isOpen && (
                <button className="aic-fab-round" onClick={() => setIsOpen(true)} title="Ask AI">
                    <FiCpu size={26} />
                </button>
            )}

            {/* Main Chat Window */}
            <div
                className={`aic-window ${isOpen ? 'open' : ''}`}
                style={isMobile ? {} : { width: `${size.width}px`, height: `${size.height}px` }}
            >
                {/* ── Resize Handle (Top-Left) ── */}
                <div className="aic-resizer" onMouseDown={handleMouseDown} title="Drag to resize" />

                {/* Header acting as a toggle to close */}
                <div className="aic-header" onClick={() => setIsOpen(false)}>
                    <div className="aic-header-title">
                        <div className="aic-header-avatar">
                            <FiCpu size={16} />
                        </div>
                        <span>AI Assistant</span>
                    </div>
                    <div className="aic-header-actions">
                        <button className="aic-header-btn" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
                            <FiChevronDown size={20} />
                        </button>
                    </div>
                </div>

                <div className="aic-body">
                    {/* ── Empty State / Suggestions ── */}
                    {isEmpty && (
                        <div className="aic-empty">
                            <div className="aic-empty-icon"><FiCpu /></div>
                            <h3 className="aic-empty-title">Your Financial Co-pilot</h3>
                            <p className="aic-empty-sub">
                                Get insights on your spending, investments, and goals.
                            </p>
                            <div className="aic-suggestions">
                                {SUGGESTIONS.map((s, i) => (
                                    <button key={i} className="aic-suggestion-btn" onClick={() => sendMessage(s)}>
                                        <FiZap size={12} className="aic-sugg-icon" /> {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Message List ── */}
                    {!isEmpty && (
                        <div className="aic-messages">
                            {messages.map((msg, i) => (
                                <div key={i} className="aic-msg-anim">
                                    <Message msg={msg} />
                                </div>
                            ))}

                            {loading && (
                                <div className="aic-msg-row aic-msg-ai aic-msg-anim">
                                    <div className="aic-avatar aic-avatar-ai"><FiCpu size={14} /></div>
                                    <div className="aic-bubble-wrapper aic-wrapper-ai">
                                        <div className="aic-bubble aic-bubble-ai aic-bubble-typing">
                                            <TypingDots />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="aic-error">{error}</div>
                            )}

                            {/* Padding at bottom for calculators */}
                            <div style={{ height: activeCalc ? '240px' : '10px', transition: 'height 0.3s ease' }} />
                            <div ref={bottomRef} />
                        </div>
                    )}
                </div>

                {/* ── Tools & Input Bar Area ── */}
                <div className="aic-bottom-area">
                    {/* Tools Bar */}
                    <div className="aic-tools-bar">
                        {Object.values(CALCULATORS).map(calc => (
                            <button
                                key={calc.id}
                                className={`aic-tool-btn ${activeCalc === calc.id ? 'active' : ''}`}
                                onClick={() => toggleCalc(calc.id)}
                            >
                                {calc.icon} <span>{calc.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Calculator Panel */}
                    {activeCalc && (
                        <div className="aic-calc-panel">
                            <div className="aic-calc-header">
                                <h4>{CALCULATORS[activeCalc].icon} {CALCULATORS[activeCalc].name}</h4>
                                <button className="aic-close-btn" onClick={() => setActiveCalc(null)}><FiX size={16} /></button>
                            </div>

                            <div className="aic-calc-body">
                                <div className="aic-calc-inputs">
                                    {(activeCalc === 'emi' || activeCalc === 'fd') && (
                                        <div className="aic-input-group">
                                            <label>Principal (₹)</label>
                                            <input type="number" placeholder="Eg. 500000" value={calcData.p || ''} onChange={e => handleCalcChange('p', e.target.value)} />
                                        </div>
                                    )}
                                    {activeCalc === 'sip' && (
                                        <div className="aic-input-group">
                                            <label>Monthly (₹)</label>
                                            <input type="number" placeholder="Eg. 5000" value={calcData.inv || ''} onChange={e => handleCalcChange('inv', e.target.value)} />
                                        </div>
                                    )}
                                    {activeCalc === 'goal' && (
                                        <div className="aic-input-group">
                                            <label>Target (₹)</label>
                                            <input type="number" placeholder="Eg. 1000000" value={calcData.target || ''} onChange={e => handleCalcChange('target', e.target.value)} />
                                        </div>
                                    )}
                                    {activeCalc === 'tax' && (
                                        <div className="aic-input-group">
                                            <label>Income (₹)</label>
                                            <input type="number" placeholder="Eg. 1200000" value={calcData.income || ''} onChange={e => handleCalcChange('income', e.target.value)} />
                                        </div>
                                    )}
                                    {activeCalc !== 'tax' && (
                                        <>
                                            <div className="aic-input-group">
                                                <label>Rate (%)</label>
                                                <input type="number" placeholder="Eg. 12" value={calcData.r || ''} onChange={e => handleCalcChange('r', e.target.value)} />
                                            </div>
                                            <div className="aic-input-group">
                                                <label>Years</label>
                                                <input type="number" placeholder="Eg. 5" value={calcData.t || ''} onChange={e => handleCalcChange('t', e.target.value)} />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="aic-calc-results">
                                    {calcResult ? (
                                        <>
                                            <div className="aic-result-main">
                                                <span>{calcResult.label1}</span>
                                                <h3>₹{Math.round(calcResult.val1).toLocaleString('en-IN')}</h3>
                                            </div>
                                            <button className="aic-calc-send-btn" onClick={sendCalcToChat}>
                                                Ask AI <FiChevronRight />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="aic-result-empty">Enter details to calculate</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Input Bar */}
                    <div className="aic-input-bar">
                        {!isEmpty && (
                            <button className="aic-clear-btn" onClick={clearChat} title="Clear conversation">
                                <FiRefreshCw size={14} />
                            </button>
                        )}
                        <input
                            ref={inputRef}
                            className="aic-input"
                            type="text"
                            placeholder="Write a message..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />
                        <button className="aic-send-btn" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
                            <FiSend size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

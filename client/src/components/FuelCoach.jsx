import { useState } from 'react';
import { FiZap, FiLoader, FiTruck, FiRefreshCw, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import api from '../services/api';

export default function FuelCoach() {
    const [loading, setLoading] = useState(false);
    const [result, setResult]   = useState(null);
    const [open, setOpen]       = useState(false);

    const fetchCoach = async () => {
        setLoading(true);
        try {
            const res = await api.get('/aifeatures/fuel-coach');
            setResult(res.data);
            setOpen(true);
        } catch {
            setResult({
                overallSummary: 'Could not load tips right now. Please try again.',
                vehicles: []
            });
            setOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fuel-coach">
            {/* ── Header bar ── */}
            <div className="fc-header">
                <div className="fc-header-left">
                    <div className="fc-icon"><FiZap /></div>
                    <div>
                        <p className="fc-title">AI Fuel Coach</p>
                        <p className="fc-sub">Personalised efficiency tips for each vehicle</p>
                    </div>
                </div>
                <div className="fc-header-right">
                    {result && (
                        <button
                            className="fc-toggle"
                            onClick={() => setOpen(o => !o)}
                        >
                            {open ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                    )}
                    <button
                        className="btn btn-primary fc-btn"
                        onClick={fetchCoach}
                        disabled={loading}
                    >
                        {loading
                            ? <><FiLoader className="spin" /> Analysing…</>
                            : result
                                ? <><FiRefreshCw size={13} /> Refresh</>
                                : <><FiZap size={13} /> Get Tips</>}
                    </button>
                </div>
            </div>

            {/* ── Results ── */}
            {result && open && (
                <div className="fc-body">
                    {/* Overall summary */}
                    {result.overallSummary && (
                        <div className="fc-summary">
                            <FiTruck size={14} />
                            <span>{result.overallSummary}</span>
                        </div>
                    )}

                    {/* Per-vehicle cards */}
                    {result.vehicles?.length > 0 ? (
                        <div className="fc-vehicles">
                            {result.vehicles.map((v, i) => (
                                <div key={i} className="fc-vehicle-card">
                                    <div className="fc-vehicle-header">
                                        <span className="fc-vehicle-emoji">
                                            {v.vehicleType === 'Car' ? '🚗' : v.vehicleType === 'Bike' ? '🏍️' : '🚛'}
                                        </span>
                                        <div>
                                            <p className="fc-vehicle-name">{v.vehicleName}</p>
                                            {v.fuelType && (
                                                <p className="fc-vehicle-sub">{v.vehicleType} · {v.fuelType}</p>
                                            )}
                                        </div>
                                        <span className="fc-status-emoji">{v.statusEmoji}</span>
                                    </div>

                                    <ul className="fc-tips">
                                        {v.tips.map((tip, j) => (
                                            <li key={j} className="fc-tip">
                                                <span className="fc-tip-dot" />
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="fc-empty">
                            Add at least 2 fuel entries per vehicle to get personalised tips.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

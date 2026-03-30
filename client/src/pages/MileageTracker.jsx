import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import { FiTruck, FiPlus, FiTrash2, FiEdit2, FiDroplet, FiMapPin, FiDollarSign, FiTrendingUp, FiAlertTriangle, FiChevronDown, FiX, FiActivity, FiBarChart2, FiZap, FiCalendar } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import { useTheme } from '../context/ThemeContext';
import FuelCoach from '../components/FuelCoach';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export default function MileageTracker() {
    const { theme } = useTheme();
    const toast = useToast();
    const [vehicles, setVehicles] = useState([]);
    const [entries, setEntries] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeVehicle, setActiveVehicle] = useState(null);

    // Form states
    const [showVehicleForm, setShowVehicleForm] = useState(false);
    const [showEntryForm, setShowEntryForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [editingEntry, setEditingEntry] = useState(null);

    const [vehicleForm, setVehicleForm] = useState({ name: '', vehicleType: 'Car', fuelType: 'Petrol', registrationNumber: '', serviceIntervalKm: '' });
    const [entryForm, setEntryForm] = useState({ vehicleId: '', date: new Date().toISOString().slice(0, 10), odometerReading: '', fuelQuantity: '', fuelCost: '', notes: '' });

    const loadData = useCallback(async () => {
        try {
            const [vRes, eRes, sRes] = await Promise.all([
                api.get('/mileage/vehicles'),
                api.get('/mileage/fuel-entries' + (activeVehicle ? `?vehicleId=${activeVehicle}` : '')),
                api.get('/mileage/summary')
            ]);
            setVehicles(vRes.data);
            setEntries(eRes.data);
            setSummary(sRes.data);
        } catch { toast.error('Failed to load data'); }
        setLoading(false);
    }, [activeVehicle, toast]);

    useEffect(() => { loadData(); }, [loadData]);

    // ── Vehicle CRUD ──
    const openVehicleForm = (v = null) => {
        if (v) {
            setEditingVehicle(v);
            setVehicleForm({ name: v.name, vehicleType: v.vehicleType, fuelType: v.fuelType, registrationNumber: v.registrationNumber || '', serviceIntervalKm: v.serviceIntervalKm || '' });
        } else {
            setEditingVehicle(null);
            setVehicleForm({ name: '', vehicleType: 'Car', fuelType: 'Petrol', registrationNumber: '', serviceIntervalKm: '' });
        }
        setShowVehicleForm(true);
    };

    const saveVehicle = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...vehicleForm, serviceIntervalKm: vehicleForm.serviceIntervalKm ? Number(vehicleForm.serviceIntervalKm) : null, registrationNumber: vehicleForm.registrationNumber || null };
            if (editingVehicle) {
                await api.put(`/mileage/vehicles/${editingVehicle.id}`, payload);
                toast.success('Vehicle updated');
            } else {
                await api.post('/mileage/vehicles', payload);
                toast.success('Vehicle added');
            }
            setShowVehicleForm(false);
            loadData();
        } catch { toast.error('Failed to save vehicle'); }
    };

    const deleteVehicle = async (id) => {
        try {
            await api.delete(`/mileage/vehicles/${id}`);
            toast.success('Vehicle deleted');
            if (activeVehicle === id) setActiveVehicle(null);
            loadData();
        } catch { toast.error('Failed to delete'); }
    };

    // ── Fuel Entry CRUD ──
    const openEntryForm = (entry = null) => {
        if (entry) {
            setEditingEntry(entry);
            setEntryForm({ vehicleId: entry.vehicleId, date: entry.date?.slice(0, 10), odometerReading: entry.odometerReading, fuelQuantity: entry.fuelQuantity, fuelCost: entry.fuelCost, notes: entry.notes || '' });
        } else {
            setEditingEntry(null);
            setEntryForm({ vehicleId: activeVehicle || (vehicles[0]?.id ?? ''), date: new Date().toISOString().slice(0, 10), odometerReading: '', fuelQuantity: '', fuelCost: '', notes: '' });
        }
        setShowEntryForm(true);
    };

    const saveEntry = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                vehicleId: entryForm.vehicleId,
                date: entryForm.date,
                odometerReading: Number(entryForm.odometerReading),
                fuelQuantity: Number(entryForm.fuelQuantity),
                fuelCost: Number(entryForm.fuelCost),
                notes: entryForm.notes || null
            };
            if (editingEntry) {
                await api.put(`/mileage/fuel-entries/${editingEntry.id}`, payload);
                toast.success('Entry updated');
            } else {
                await api.post('/mileage/fuel-entries', payload);
                toast.success('Fuel entry added');
            }
            setShowEntryForm(false);
            loadData();
        } catch { toast.error('Failed to save entry'); }
    };

    const deleteEntry = async (id) => {
        try {
            await api.delete(`/mileage/fuel-entries/${id}`);
            toast.success('Entry deleted');
            loadData();
        } catch { toast.error('Failed to delete'); }
    };

    // ── Computed price per liter ──
    const calcPPL = entryForm.fuelQuantity > 0 && entryForm.fuelCost > 0
        ? (Number(entryForm.fuelCost) / Number(entryForm.fuelQuantity)).toFixed(2) : '—';

    if (loading) return <div className="page-loader">Loading mileage data…</div>;

    // ── Trend Chart Data ──
    const trendData = summary?.monthlyTrend?.length > 0 ? {
        labels: summary.monthlyTrend.map(m => m.label),
        datasets: [
            {
                label: 'Avg Mileage (km/L)',
                data: summary.monthlyTrend.map(m => m.avgMileage),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#6366f1',
                borderWidth: 3,
            },
            {
                label: 'Fuel Spent (₹)',
                data: summary.monthlyTrend.map(m => m.fuelSpent),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#f59e0b',
                borderWidth: 3,
                yAxisID: 'y1',
            }
        ]
    } : null;

    const isDark = theme === 'dark';
    const labelColor = isDark ? '#ffffff' : '#5a6078';
    const tickColor = isDark ? '#e8eaf0' : '#7c8298';

    const trendOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 12, weight: '600', family: "'Inter', sans-serif" },
                    color: labelColor
                }
            },
            tooltip: {
                backgroundColor: 'var(--bg-card)',
                titleColor: 'var(--text)',
                bodyColor: 'var(--text-secondary)',
                borderColor: 'var(--border)',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                titleFont: { size: 14, weight: '700' },
                bodyFont: { size: 13 }
            }
        },
        scales: {
            y: {
                position: 'left',
                grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', drawBorder: false },
                ticks: { color: tickColor, font: { size: 11, weight: '500' } }
            },
            y1: {
                position: 'right',
                grid: { display: false },
                ticks: { color: tickColor, font: { size: 11, weight: '500' } }
            },
            x: {
                grid: { display: false },
                ticks: { color: tickColor, font: { size: 11, weight: '500' } }
            }
        }
    };

    const alertIcon = { danger: '🔴', warning: '🟡', info: '🔵' };

    return (
        <div className="page mil-page">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <h1><FiTruck style={{ marginRight: 12, color: 'var(--primary)' }} /> Mileage Tracker</h1>
            </div>

            {/* ── Summary Stats (Budget Style) ── */}
            {summary && (
                <div className="budget-stat-row">
                    <div className="budget-stat-card bsc-rose">
                        <FiBarChart2 className="bsc-bg-icon" />
                        <span className="bsc-label">Total Distance</span>
                        <span className="bsc-value">{summary.totalDistanceKm.toLocaleString('en-IN')} km</span>
                    </div>
                    <div className="budget-stat-card bsc-amber">
                        <FiDroplet className="bsc-bg-icon" />
                        <span className="bsc-label">Fuel Spent</span>
                        <span className="bsc-value">₹{summary.totalFuelSpent.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="budget-stat-card bsc-emerald">
                        <FiZap className="bsc-bg-icon" />
                        <span className="bsc-label">Avg Efficiency</span>
                        <span className="bsc-value">{summary.avgMileage} km/L</span>
                    </div>
                    <div className="budget-stat-card bsc-indigo">
                        <FiDollarSign className="bsc-bg-icon" />
                        <span className="bsc-label">Cost per km</span>
                        <span className="bsc-value">₹{summary.costPerKm}</span>
                    </div>
                </div>
            )}

            <FuelCoach />

            {/* ── Alerts ── */}
            {summary?.alerts?.length > 0 && (
                <div className="mil-alerts">
                    {summary.alerts.map((a, i) => (
                        <div key={i} className={`mil-alert mil-alert-${a.severity}`}>
                            <span className="mil-alert-icon">{alertIcon[a.severity]}</span>
                            <span className="mil-alert-vehicle">{a.vehicleName}</span>
                            <span>{a.message}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Content Grid ── */}
            <div className="mil-content-grid">
                {/* Vehicles Panel */}
                <div className="mil-panel">
                    <div className="mil-panel-header">
                        <h3>Vehicles</h3>
                        <button className="btn btn-sm btn-primary" onClick={() => openVehicleForm()}><FiPlus /> Add Vehicle</button>
                    </div>
                    <button className={`mil-vehicle-chip-all ${!activeVehicle ? 'active' : ''}`} onClick={() => setActiveVehicle(null)}>
                        Show All Vehicles
                    </button>
                    {vehicles.length === 0 ? (
                        <p className="mil-empty">No vehicles tracked yet.</p>
                    ) : (
                        <div className="mil-vehicle-list">
                            {vehicles.map(v => (
                                <div key={v.id} className={`mil-vehicle-card ${activeVehicle === v.id ? 'active' : ''}`} onClick={() => setActiveVehicle(activeVehicle === v.id ? null : v.id)}>
                                    <div className="mil-vehicle-main">
                                        <div className="mil-vehicle-avatar">
                                            {v.vehicleType === 'Car' ? '🚗' : '🏍️'}
                                        </div>
                                        <div className="mil-vehicle-info">
                                            <strong>{v.name}</strong>
                                            <span className="mil-vehicle-sub">{v.registrationNumber || v.fuelType}</span>
                                        </div>
                                    </div>
                                    {summary?.vehicles?.find(sv => sv.vehicleId === v.id) && (
                                        <div className="mil-vehicle-stats">
                                            <span>{summary.vehicles.find(sv => sv.vehicleId === v.id).avgMileage} km/L</span>
                                            <span style={{ color: 'var(--text-muted)' }}>{summary.vehicles.find(sv => sv.vehicleId === v.id).entryCount} logs</span>
                                        </div>
                                    )}
                                    <div className="mil-vehicle-actions">
                                        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); openVehicleForm(v); }}><FiEdit2 /></button>
                                        <button className="btn-icon btn-icon-danger" onClick={(e) => { e.stopPropagation(); deleteVehicle(v.id); }}><FiTrash2 /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Trend Chart Panel */}
                <div className="mil-panel mil-chart-panel">
                    <div className="mil-panel-header">
                        <h3><FiActivity style={{ color: 'var(--primary)' }} /> Efficiency & Spend Trends</h3>
                    </div>
                    {trendData ? (
                        <div className="mil-chart-wrap">
                            <Line data={trendData} options={trendOptions} />
                        </div>
                    ) : (
                        <p className="mil-empty">Add fuel entries to see trends.</p>
                    )}
                </div>
            </div>

            {/* ── Fuel Entries Table ── */}
            <div className="mil-panel mil-entries-panel">
                <div className="mil-panel-header">
                    <h3><FiDroplet style={{ color: '#f59e0b' }} /> Fuel Entry Log</h3>
                    <button className="btn btn-sm btn-primary" onClick={() => openEntryForm()} disabled={vehicles.length === 0}><FiPlus /> Add Log</button>
                </div>
                {entries.length === 0 ? (
                    <p className="mil-empty">No fuel entries logged yet.</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="mil-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Vehicle</th>
                                    <th>Odometer</th>
                                    <th>Fuel (L)</th>
                                    <th>Cost (₹)</th>
                                    <th>₹/Liter</th>
                                    <th>Distance</th>
                                    <th>Mileage</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map(e => (
                                    <tr key={e.id}>
                                        <td>{new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                        <td><span style={{ fontWeight: 700 }}>{e.vehicleName}</span></td>
                                        <td>{e.odometerReading.toLocaleString('en-IN')} km</td>
                                        <td><span style={{ color: 'var(--text-secondary)' }}>{e.fuelQuantity} L</span></td>
                                        <td>₹{e.fuelCost.toLocaleString('en-IN')}</td>
                                        <td>₹{e.pricePerLiter?.toFixed(2) ?? '—'}</td>
                                        <td>{e.distanceKm != null ? `${e.distanceKm} km` : '—'}</td>
                                        <td className={e.mileage ? 'mil-mileage-cell' : ''}>
                                            {e.mileage != null ? `${e.mileage} km/L` : '—'}
                                        </td>
                                        <td className="mil-actions-cell">
                                            <button className="btn-icon" onClick={() => openEntryForm(e)}><FiEdit2 /></button>
                                            <button className="btn-icon btn-icon-danger" onClick={() => deleteEntry(e.id)}><FiTrash2 /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Per-vehicle Summary View ── */}
            {summary?.vehicles?.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <div className="mil-panel-header" style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem' }}>Vehicle Performance Breakdown</h3>
                    </div>
                    <div className="mil-vehicle-summary-grid">
                        {summary.vehicles.map(vs => (
                            <div key={vs.vehicleId} className="mil-vsummary-card">
                                <div className="mil-vsummary-header">
                                    <div className="mil-vehicle-avatar" style={{ transform: 'scale(1.1)' }}>
                                        {vs.vehicleType === 'Car' ? '🚗' : '🏍️'}
                                    </div>
                                    <strong>{vs.vehicleName}</strong>
                                    <span className="mil-vsummary-type">{vs.fuelType}</span>
                                </div>
                                <div className="mil-vsummary-stats">
                                    <div className="mil-vsummary-stat-item">
                                        <span className="mil-vsummary-stat-label">Total Distance</span>
                                        <span className="mil-vsummary-stat-value">{vs.totalDistanceKm.toLocaleString('en-IN')} km</span>
                                    </div>
                                    <div className="mil-vsummary-stat-item">
                                        <span className="mil-vsummary-stat-label">Avg Mileage</span>
                                        <span className="mil-vsummary-stat-value" style={{ color: 'var(--primary)' }}>{vs.avgMileage} km/L</span>
                                    </div>
                                    <div className="mil-vsummary-stat-item">
                                        <span className="mil-vsummary-stat-label">Fuel Spent</span>
                                        <span className="mil-vsummary-stat-value">₹{vs.totalFuelSpent.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="mil-vsummary-stat-item">
                                        <span className="mil-vsummary-stat-label">Cost / km</span>
                                        <span className="mil-vsummary-stat-value">₹{vs.costPerKm}</span>
                                    </div>
                                    <div className="mil-vsummary-stat-item">
                                        <span className="mil-vsummary-stat-label">Odometer</span>
                                        <span className="mil-vsummary-stat-value">{vs.latestOdometer.toLocaleString('en-IN')} km</span>
                                    </div>
                                    <div className="mil-vsummary-stat-item">
                                        <span className="mil-vsummary-stat-label">Logs</span>
                                        <span className="mil-vsummary-stat-value">{vs.entryCount}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Vehicle Form Modal ── */}
            {showVehicleForm && (
                <div className="mil-modal-overlay" onClick={() => setShowVehicleForm(false)}>
                    <div className="mil-modal" onClick={e => e.stopPropagation()}>
                        <div className="mil-modal-header">
                            <h3>{editingVehicle ? 'Edit Vehicle Profile' : 'Add New Vehicle'}</h3>
                            <button className="btn-icon" onClick={() => setShowVehicleForm(false)} style={{ border: 'none', background: 'var(--bg-card-hover)', borderRadius: '50%', width: 32, height: 32 }}><FiX /></button>
                        </div>
                        <form onSubmit={saveVehicle} className="mil-form">
                            <div className="mil-form-row">
                                <label>Vehicle Name</label>
                                <input required value={vehicleForm.name} onChange={e => setVehicleForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Blue Sedan" />
                            </div>
                            <div className="mil-form-row mil-form-row-2col">
                                <div>
                                    <label>Type</label>
                                    <select value={vehicleForm.vehicleType} onChange={e => setVehicleForm(f => ({ ...f, vehicleType: e.target.value }))}>
                                        <option value="Car">🚗 Passenger Car</option>
                                        <option value="Bike">🏍️ Motorbike</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Fuel Type</label>
                                    <select value={vehicleForm.fuelType} onChange={e => setVehicleForm(f => ({ ...f, fuelType: e.target.value }))}>
                                        <option value="Petrol">⛽ Petrol</option>
                                        <option value="Diesel">🛢️ Diesel</option>
                                        <option value="Electric">⚡ Electric</option>
                                        <option value="CNG">🟢 CNG</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mil-form-row mil-form-row-2col">
                                <div>
                                    <label>Reg. Number</label>
                                    <input value={vehicleForm.registrationNumber} onChange={e => setVehicleForm(f => ({ ...f, registrationNumber: e.target.value }))} placeholder="KA 01 AB 1234" />
                                </div>
                                <div>
                                    <label>Service Every (km)</label>
                                    <input type="number" value={vehicleForm.serviceIntervalKm} onChange={e => setVehicleForm(f => ({ ...f, serviceIntervalKm: e.target.value }))} placeholder="e.g. 10000" />
                                </div>
                            </div>
                            <div className="mil-form-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowVehicleForm(false)} style={{ padding: '12px 24px' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>{editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Fuel Entry Form Modal ── */}
            {showEntryForm && (
                <div className="mil-modal-overlay" onClick={() => setShowEntryForm(false)}>
                    <div className="mil-modal" onClick={e => e.stopPropagation()}>
                        <div className="mil-modal-header">
                            <h3>{editingEntry ? 'Edit Log Entry' : 'New Fuel Entry'}</h3>
                            <button className="btn-icon" onClick={() => setShowEntryForm(false)} style={{ border: 'none', background: 'var(--bg-card-hover)', borderRadius: '50%', width: 32, height: 32 }}><FiX /></button>
                        </div>
                        <form onSubmit={saveEntry} className="mil-form">
                            {!editingEntry && (
                                <div className="mil-form-row">
                                    <label>Select Vehicle</label>
                                    <select required value={entryForm.vehicleId} onChange={e => setEntryForm(f => ({ ...f, vehicleId: e.target.value }))}>
                                        <option value="">Choose vehicle...</option>
                                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="mil-form-row mil-form-row-2col">
                                <div>
                                    <label>Filling Date</label>
                                    <input type="date" required value={entryForm.date} onChange={e => setEntryForm(f => ({ ...f, date: e.target.value }))} />
                                </div>
                                <div>
                                    <label>Odometer (km)</label>
                                    <input type="number" step="0.01" required value={entryForm.odometerReading} onChange={e => setEntryForm(f => ({ ...f, odometerReading: e.target.value }))} placeholder="Current reading" />
                                </div>
                            </div>
                            <div className="mil-form-row mil-form-row-2col">
                                <div>
                                    <label>Quantity (Liters)</label>
                                    <input type="number" step="0.01" required value={entryForm.fuelQuantity} onChange={e => setEntryForm(f => ({ ...f, fuelQuantity: e.target.value }))} placeholder="e.g. 40" />
                                </div>
                                <div>
                                    <label>Total Cost (₹)</label>
                                    <input type="number" step="0.01" required value={entryForm.fuelCost} onChange={e => setEntryForm(f => ({ ...f, fuelCost: e.target.value }))} placeholder="Amount paid" />
                                </div>
                            </div>
                            {entryForm.fuelQuantity > 0 && entryForm.fuelCost > 0 && (
                                <div className="mil-form-computed">
                                    Calculated Price: <strong>₹{calcPPL} per liter</strong>
                                </div>
                            )}
                            <div className="mil-form-row">
                                <label>Notes & Location</label>
                                <input value={entryForm.notes} onChange={e => setEntryForm(f => ({ ...f, notes: e.target.value }))} placeholder="Station name, fuel type, etc." />
                            </div>
                            <div className="mil-form-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowEntryForm(false)} style={{ padding: '12px 24px' }}>Discard</button>
                                <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>{editingEntry ? 'Update Log' : 'Save Entry'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

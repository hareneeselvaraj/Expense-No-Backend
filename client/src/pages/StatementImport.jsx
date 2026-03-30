import React, { useState, useEffect } from 'react';
import { FiUploadCloud, FiTrash2, FiEdit2, FiCheck, FiX, FiCheckCircle } from 'react-icons/fi';
import { useToast } from '../components/Toast';
import api from '../services/api';

export default function StatementImport() {
    const toast = useToast();
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    
    // Preview Mode State
    const [isLoading, setIsLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null); // Array of TransactionResponseDto
    const [editingIndex, setEditingIndex] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const res = await api.get('/account');
            setAccounts(res.data);
            if (res.data.length > 0) setSelectedAccount(res.data[0].id);
        } catch (error) {
            toast.error('Failed to load accounts');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) setFile(droppedFile);
    };

    const handleProcessPreview = async () => {
        if (!file || !selectedAccount) return toast.error('Please select a file and an account');
        
        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('accountId', selectedAccount);

        try {
            const res = await api.post('/transaction/upload-preview', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPreviewData(res.data);
            toast.success(`Successfully parsed ${res.data.length} transactions!`);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to parse statement');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteRow = (index) => {
        const newData = [...previewData];
        newData.splice(index, 1);
        setPreviewData(newData);
    };

    const startEditing = (index) => {
        setEditingIndex(index);
        setEditForm({ ...previewData[index] });
    };

    const saveEdit = (index) => {
        const newData = [...previewData];
        newData[index] = editForm;
        setPreviewData(newData);
        setEditingIndex(null);
    };

    const cancelEdit = () => {
        setEditingIndex(null);
    };

    const handleCommit = async () => {
        if (!previewData || previewData.length === 0) return toast.error('No transactions to save');
        
        setIsLoading(true);
        try {
            const res = await api.post('/transaction/upload-commit', previewData);
            toast.success(res.data?.message || 'Successfully saved all transactions!');
            // Reset state
            setPreviewData(null);
            setFile(null);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save transactions');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container">
            <header className="page-header" style={{ marginBottom: '2rem' }}>
                <h1 className="page-title">Statement Import Hub</h1>
                <p className="page-subtitle">Securely parse, review, and import your ICICI and Bank statements</p>
            </header>

            {!previewData ? (
                /* ── UPLOAD ZONE ── */
                <div className="card" style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 2rem', textAlign: 'center' }}>
                    
                    <div className="form-group" style={{ textAlign: 'left', marginBottom: '2rem' }}>
                        <label className="form-label" style={{ fontWeight: 600 }}>Destination Account</label>
                        <select 
                            className="form-input" 
                            style={{ background: 'var(--bg-secondary)', padding: '0.8rem', borderRadius: 8, border: '1px solid var(--border)', fontSize: '1rem' }}
                            value={selectedAccount} 
                            onChange={e => setSelectedAccount(e.target.value)}
                        >
                            {accounts.map(a => (
                                <option key={a.id} value={a.id}>{a.name} (Balance: ₹{a.balance.toLocaleString()})</option>
                            ))}
                        </select>
                    </div>

                    <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('hub-file-upload').click()}
                        style={{
                            border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`,
                            borderRadius: 16,
                            padding: '4rem 2rem',
                            cursor: 'pointer',
                            background: isDragging ? 'rgba(99,102,241,0.05)' : 'var(--bg-secondary)',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem'
                        }}
                    >
                        <input 
                            id="hub-file-upload" 
                            type="file" 
                            accept=".xlsx,.xls,.pdf,.csv" 
                            style={{ display: 'none' }} 
                            onChange={e => setFile(e.target.files[0])} 
                        />
                        
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                            <FiUploadCloud />
                        </div>
                        
                        <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '1.2rem' }}>
                            {file ? file.name : 'Drag & Drop your bank statement here'}
                        </h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                            {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supports ICICI PDF, Excel (.xlsx, .xls, .csv)'}
                        </p>
                        
                        <div style={{ display: 'flex', gap: 8, marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20 }}>Auto-Categorization</span>
                            <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20 }}>Smart Cleanup</span>
                            <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20 }}>Duplicate Prevention</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.8rem 2.5rem', fontSize: '1rem', borderRadius: 8, fontWeight: 600 }}
                            disabled={!file || !selectedAccount || isLoading} 
                            onClick={handleProcessPreview}
                        >
                            {isLoading ? 'Parsing Statement...' : 'Preview & Parse Rows'}
                        </button>
                    </div>
                </div>

            ) : (

                /* ── PREVIEW GRID ZONE ── */
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.25rem 0', fontWeight: 600 }}>Review {previewData.length} Parsed Entries</h2>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Please verify the auto-categorized fields before saving. You can edit or delete rows.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-secondary" disabled={isLoading} onClick={() => setPreviewData(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" disabled={isLoading} onClick={() => setPreviewData([])}>
                                Clear All
                            </button>
                            <button className="btn btn-primary" disabled={isLoading || previewData.length === 0} onClick={handleCommit}>
                                <FiCheckCircle /> Confirm & Import {previewData.length} Rows
                            </button>
                        </div>
                    </div>

                    {previewData.length === 0 ? (
                        <div className="card empty-state" style={{ padding: '4rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No transactions available. Upload a file to see preview.</p>
                        </div>
                    ) : (
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                <table className="data-table">
                                    <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1, boxShadow: '0 1px 0 var(--border)' }}>
                                        <tr>
                                            <th>Date</th>
                                            <th>Description / Merchant</th>
                                            <th>Category</th>
                                            <th>Type</th>
                                            <th style={{ textAlign: 'right' }}>Amount</th>
                                            <th style={{ textAlign: 'center', width: 100 }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.map((row, index) => {
                                            const isEditing = editingIndex === index;
                                            return (
                                                <tr key={index} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s', background: isEditing ? 'var(--bg-secondary)' : 'transparent' }}>
                                                    {isEditing ? (
                                                        <>
                                                            <td>
                                                                <input type="date" className="form-input" style={{ padding: '0.4rem' }} value={new Date(editForm.date).toISOString().split('T')[0]} onChange={e => setEditForm({...editForm, date: e.target.value})} />
                                                            </td>
                                                            <td>
                                                                <input type="text" className="form-input" style={{ padding: '0.4rem', width: '100%' }} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                                                            </td>
                                                            <td style={{ color: 'var(--text-muted)' }}>
                                                                <div className="category-badge">
                                                                    <span>{editForm.categoryIcon || '🏷️'}</span> {editForm.categoryName}
                                                                </div>
                                                                {/* Full category selector omitted in preview for simplicity, but easily added if needed */}
                                                            </td>
                                                            <td>
                                                                <select className="form-input" style={{ padding: '0.4rem' }} value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})}>
                                                                    <option value="Expense">Expense</option>
                                                                    <option value="Income">Income</option>
                                                                    <option value="Investment">Investment</option>
                                                                    <option value="Withdraw">Withdraw</option>
                                                                    <option value="Transfer">Transfer</option>
                                                                </select>
                                                            </td>
                                                            <td style={{ textAlign: 'right' }}>
                                                                <input type="number" className="form-input" style={{ padding: '0.4rem', width: 100, textAlign: 'right' }} value={editForm.amount} onChange={e => setEditForm({...editForm, amount: parseFloat(e.target.value)})} />
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                                                    <button className="icon-btn" style={{ color: 'var(--success)', background: 'rgba(16,185,129,0.1)' }} onClick={() => saveEdit(index)}><FiCheck /></button>
                                                                    <button className="icon-btn" style={{ color: 'var(--text-muted)' }} onClick={cancelEdit}><FiX /></button>
                                                                </div>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td style={{ whiteSpace: 'nowrap' }}>{new Date(row.date).toLocaleDateString()}</td>
                                                            <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {row.description}
                                                            </td>
                                                            <td>
                                                                <div className="category-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: 'var(--bg-secondary)', borderRadius: 6, fontSize: '0.85rem' }}>
                                                                    <span>{row.categoryIcon || '🏷️'}</span>
                                                                    {row.categoryName}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className={`type-badge type-${row.type.toLowerCase()}`} style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                                                    {row.type}
                                                                </span>
                                                            </td>
                                                            <td style={{ textAlign: 'right', fontWeight: 600, color: row.type === 'Income' ? 'var(--success)' : (row.type === 'Expense' ? 'var(--danger)' : 'var(--text)') }}>
                                                                ₹{row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                                                    <button className="icon-btn" onClick={() => startEditing(index)} title="Edit Row"><FiEdit2 /></button>
                                                                    <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteRow(index)} title="Remove Row"><FiTrash2 /></button>
                                                                </div>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

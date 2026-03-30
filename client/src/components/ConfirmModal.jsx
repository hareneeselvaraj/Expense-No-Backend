import { useEffect, useRef } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export default function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel }) {
    const cancelRef = useRef(null);

    useEffect(() => {
        if (open && cancelRef.current) cancelRef.current.focus();
    }, [open]);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape' && open) onCancel(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-icon-wrapper">
                    <FiAlertTriangle />
                </div>
                <h3 className="modal-title">{title || 'Confirm Delete'}</h3>
                <p className="modal-message">{message || 'Are you sure? This action cannot be undone.'}</p>
                <div className="modal-actions">
                    <button className="btn btn-ghost" ref={cancelRef} onClick={onCancel}>Cancel</button>
                    <button className="btn modal-btn-danger" onClick={onConfirm}>{confirmLabel || 'Delete'}</button>
                </div>
            </div>
        </div>
    );
}

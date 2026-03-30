import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);

    const addToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = ++idRef.current;
        setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
        setTimeout(() => {
            setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 300);
        }, duration);
    }, []);


    // Make toast callable directly and also have .success/.error/.warning
    const toastFn = useCallback((msg, type) => addToast(msg, type), [addToast]);
    toastFn.success = (msg) => addToast(msg, 'success');
    toastFn.error = (msg) => addToast(msg, 'error');
    toastFn.warning = (msg) => addToast(msg, 'warning');

    return (
        <ToastContext.Provider value={toastFn}>
            {children}
            <div className="toast-container">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast toast-${t.type} ${t.exiting ? 'toast-exit' : ''}`}>
                        <span className="toast-icon">
                            {t.type === 'success' && '✓'}
                            {t.type === 'error' && '✕'}
                            {t.type === 'warning' && '⚠'}
                        </span>
                        <span>{t.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);

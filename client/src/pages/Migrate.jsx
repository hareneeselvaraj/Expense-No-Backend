import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { migrateFromJSON } from '../utils/migrateFromSQLite';

export default function Migrate() {
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState([]);
    const [migrating, setMigrating] = useState(false);
    const [done, setDone] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleMigrate = async () => {
        if (!file) return;
        setMigrating(true);
        setProgress([]);

        try {
            const text = await file.text();
            const jsonData = JSON.parse(text);

            const results = await migrateFromJSON(jsonData, (msg) => {
                setProgress(prev => [...prev, msg]);
            });

            setProgress(prev => [
                ...prev,
                `✅ Migration complete! ${results.success.length} tables migrated, ${results.failed.length} failed.`
            ]);
            setDone(true);
        } catch (err) {
            setProgress(prev => [...prev, `❌ Error: ${err.message}`]);
        } finally {
            setMigrating(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: '500px' }}>
                <div className="auth-header">
                    <span className="auth-icon">🔄</span>
                    <h1>Data Migration</h1>
                    <p>Import your data from the old SQLite database</p>
                </div>

                {!done ? (
                    <>
                        <div className="form-group">
                            <label>Upload JSON Export</label>
                            <input
                                type="file"
                                accept=".json"
                                onChange={(e) => setFile(e.target.files[0])}
                                style={{ padding: '12px' }}
                            />
                        </div>

                        <button
                            type="button"
                            className="btn btn-primary btn-full"
                            onClick={handleMigrate}
                            disabled={!file || migrating}
                        >
                            {migrating ? 'Migrating…' : 'Start Migration'}
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        className="btn btn-primary btn-full"
                        onClick={() => navigate('/')}
                    >
                        Go to Dashboard
                    </button>
                )}

                {progress.length > 0 && (
                    <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        background: 'var(--bg-card)',
                        borderRadius: '8px',
                        maxHeight: '300px',
                        overflow: 'auto',
                        fontSize: '0.85rem'
                    }}>
                        {progress.map((msg, i) => (
                            <p key={i} style={{ margin: '4px 0', opacity: 0.8 }}>{msg}</p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

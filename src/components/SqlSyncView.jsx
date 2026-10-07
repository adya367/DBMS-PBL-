import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { dbms } from '../db/dbmsService';

export default function SqlSyncView() {
  const [sqlContent, setSqlContent] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ status: 'synced', timestamp: new Date() });
  const [stats, setStats] = useState({});

  const updateState = () => {
    const dump = dbms.getSqlDump();
    setSqlContent(dump);
    setStats({
      cinemas: dbms.getCinemas().length,
      screens: dbms.getScreens().length,
      seats: dbms.getSeats().length,
      movies: dbms.getMovies().length,
      screenings: dbms.getScreenings().length,
      customers: dbms.getCustomers().length,
      bookings: dbms.getBookings().length,
      bookedSeats: dbms.getBookedSeats().length,
      tickets: dbms.getTickets().length,
      payments: dbms.getPayments().length,
      concessionItems: dbms.getConcessionItems().length,
      concessionOrders: dbms.getConcessionOrders().length,
    });
  };

  useEffect(() => {
    updateState();

    const unsubscribe = dbms.onSyncChange((status) => {
      setSyncStatus(status);
      updateState();
    });

    return unsubscribe;
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sqlContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([sqlContent], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cinema_screening_dbms.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReloadFromSql = async () => {
    try {
      await dbms.reloadFromSqlFile();
      updateState();
      alert('Successfully reloaded all frontend data directly from cinema_screening_dbms.sql!');
    } catch (err) {
      alert(`Error reloading from SQL: ${err.message}`);
    }
  };

  const handleManualSync = () => {
    dbms.syncSqlFile();
    updateState();
  };


  const formattedTime = syncStatus.timestamp
    ? new Date(syncStatus.timestamp).toLocaleTimeString()
    : 'Just now';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header Info Banner */}
      <div className="card" style={{ marginBottom: 20, borderLeft: '4px solid var(--accent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              Real-Time MySQL Synchronization
              <span className={`badge ${syncStatus.status === 'syncing' ? 'badge-pending' : 'badge-confirmed'}`}>
                {syncStatus.status === 'syncing' ? 'Syncing...' : '● Live Linked'}
              </span>
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Target File: <code style={{ background: 'var(--surface-subtle)', padding: '2px 6px', borderRadius: 4 }}>cinema_screening_dbms.sql</code> (Project Root).
              Every action in the UI (adding screenings, reserving seats, adding movies) automatically rewrites and syncs this file.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={handleReloadFromSql} title="Reload frontend directly from disk cinema_screening_dbms.sql">
              ↻ Pull from .sql File
            </button>
            <button className="btn btn-secondary" onClick={handleManualSync}>
              Push to .sql File
            </button>
            <button className="btn btn-secondary" onClick={handleCopy}>
              {copySuccess ? 'Copied to Clipboard!' : 'Copy SQL Script'}
            </button>
            <button className="btn btn-primary" onClick={handleDownload}>
              Download .sql File
            </button>
          </div>

        </div>

        {/* Live sync details */}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 24, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <span>Status: <strong>{syncStatus.status === 'synced' ? 'Synchronized with disk' : syncStatus.status}</strong></span>
          <span>Last sync: <strong>{formattedTime}</strong></span>
          <span>SQL file size: <strong>{(sqlContent.length / 1024).toFixed(1)} KB</strong></span>
        </div>
      </div>

      {/* Database Entity Row Count Statistics */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Total Screenings</div>
          <div className="stat-value">{stats.screenings || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Bookings</div>
          <div className="stat-value">{stats.bookings || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Reserved Seats</div>
          <div className="stat-value">{stats.bookedSeats || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Payments</div>
          <div className="stat-value">{stats.payments || 0}</div>
        </div>
      </div>

      {/* MySQL Workbench Instructions */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h2 className="card-title">How to Run in MySQL Workbench</h2>
        </div>
        <ol style={{ paddingLeft: 20, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <li>Open <strong>MySQL Workbench</strong> and connect to your local MySQL server instance (e.g., <code>localhost:3306</code>).</li>
          <li>Click <strong>File &gt; Open SQL Script...</strong> (or press <kbd>Ctrl+O</kbd> / <kbd>Cmd+O</kbd>).</li>
          <li>Select <code>cinema_screening_dbms.sql</code> from this project folder.</li>
          <li>Click the <strong>Execute (Yellow Lightning Bolt ⚡)</strong> icon or press <kbd>Ctrl+Shift+Enter</kbd>.</li>
          <li>The script automatically drops any old database, creates <code>cinema_screening_dbms</code>, sets up all 10 normalized 3NF tables with foreign keys and indexes, and inserts all records.</li>
          <li>Whenever you add a screening or booking in this web interface, reopen or refresh the script in Workbench to run fresh queries!</li>
        </ol>
      </div>

      {/* SQL Script Viewer */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title">Generated SQL File Content ({sqlContent.split('\n').length} lines)</h2>
          <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8125rem' }} onClick={handleCopy}>
            {copySuccess ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
        <div style={{ marginTop: 12 }}>
          <pre style={{
            background: 'var(--surface-subtle)',
            padding: 16,
            borderRadius: 6,
            maxHeight: 500,
            overflowY: 'auto',
            fontSize: '0.8125rem',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            lineHeight: 1.5,
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            whiteSpace: 'pre'
          }}>
            {sqlContent}
          </pre>
        </div>
      </div>
    </motion.div>
  );
}

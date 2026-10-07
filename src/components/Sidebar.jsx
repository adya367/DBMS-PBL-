import React from 'react';

const NAV_ITEMS = [
  { id: 'reporting', label: 'Dashboard & Reports' },
  { id: 'screenings', label: 'Show Scheduling' },
  { id: 'bookings', label: 'Booking & Tickets' },
  { id: 'movies', label: 'Movies Catalog' },
  { id: 'cinemas', label: 'Cinemas & Screens' },
  { id: 'payments', label: 'Payments' },
  { id: 'concessions', label: 'Concessions Inventory' },
  { id: 'schema', label: 'DBMS Schema Explorer' },
  { id: 'sqlsync', label: 'MySQL Workbench Sync' }
];


export default function Sidebar({ activeTab, onSelectTab, onResetDb }) {
  return (
    <aside className="sidebar">
      <div className="brand-section">
        <h1 className="brand-title">Cinema DBMS</h1>
        <p className="brand-subtitle">Relational 3NF Prototype</p>
      </div>

      <nav className="nav-menu">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onSelectTab(item.id)}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div>Relational DBMS Engine</div>
        <button 
          className="reset-db-btn"
          onClick={() => {
            if (window.confirm("Reset database to initial seed state?")) {
              onResetDb();
            }
          }}
        >
          Reset Seed Data
        </button>
      </div>
    </aside>
  );
}

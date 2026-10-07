import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ReportingView from './components/ReportingView';
import ScreeningsView from './components/ScreeningsView';
import BookingsView from './components/BookingsView';
import MoviesView from './components/MoviesView';
import CinemasView from './components/CinemasView';
import PaymentsView from './components/PaymentsView';
import ConcessionsView from './components/ConcessionsView';
import SchemaView from './components/SchemaView';
import SqlSyncView from './components/SqlSyncView';
import { dbms } from './db/dbmsService';

const TAB_METADATA = {
  reporting: {
    title: 'Reporting Module & Analytics',
    desc: 'Occupancy rates, movie performance, screen utilization, and revenue metrics.'
  },
  screenings: {
    title: 'Show Scheduling & Availability',
    desc: 'Conflict-free screen scheduling with real-time seat availability tracking.'
  },
  bookings: {
    title: 'Booking & Ticket Management',
    desc: 'Interactive seat reservation enforcing one seat per screening and cancellation policies.'
  },
  movies: {
    title: 'Movie Catalog',
    desc: 'Film titles, genres, durations, and ratings registered in the database.'
  },
  cinemas: {
    title: 'Cinemas & Screens Hierarchy',
    desc: 'Cinema locations, screen types, and physical seating configurations.'
  },
  payments: {
    title: 'Payment Processing (1:1 with Booking)',
    desc: 'Atomic payment ledger enforcing 1:1 transaction integrity and refund limits.'
  },
  concessions: {
    title: 'Concession Sales & Inventory',
    desc: 'Track concession item stock and sales linked with ticket bookings.'
  },
  schema: {
    title: 'DBMS Relational Schema Explorer',
    desc: 'Normalized 3NF relational tables and key constraints from the source specification.'
  },
  sqlsync: {
    title: 'Real-time MySQL Workbench File & Queries',
    desc: 'Direct synchronization with cinema_screening_dbms.sql. Run DDL, DML and analytical queries directly in MySQL Workbench.'
  }
};


export default function App() {
  const [activeTab, setActiveTab] = useState('reporting');
  const [bookingScreeningId, setBookingScreeningId] = useState(null);
  const [dbVersion, setDbVersion] = useState(0);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('cinema_theme') || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Reactive reload whenever data is loaded from SQL file or updated
  useEffect(() => {
    const unsub = dbms.onDataChange(() => {
      setDbVersion(v => v + 1);
    });
    return unsub;
  }, []);


  const toggleTheme = () => {
    const nextTheme = theme === 'oled' ? 'light' : 'oled';
    setTheme(nextTheme);
    try {
      localStorage.setItem('cinema_theme', nextTheme);
    } catch {
      // ignore
    }
  };

  const handleResetDb = async () => {
    await dbms.resetDatabase();
    setDbVersion(v => v + 1);
  };


  const handleSelectScreeningForBooking = (screeningId) => {
    setBookingScreeningId(screeningId);
    setActiveTab('bookings');
  };

  const meta = TAB_METADATA[activeTab] || TAB_METADATA.reporting;

  return (
    <div className="app-container" data-theme={theme} key={dbVersion}>
      <Sidebar 
        activeTab={activeTab} 
        onSelectTab={(tab) => {
          if (tab !== 'bookings') {
            setBookingScreeningId(null);
          }
          setActiveTab(tab);
        }} 
        onResetDb={handleResetDb}
      />

      <main className="main-content">
        <header className="top-bar">
          <div>
            <h2 className="page-title">{meta.title}</h2>
            <p className="page-desc">{meta.desc}</p>
          </div>
          <div>
            <button 
              className="theme-toggle-btn" 
              onClick={toggleTheme}
              title="Toggle OLED Dark Mode"
            >
              <span>OLED Dark: {theme === 'oled' ? 'Active' : 'Off'}</span>
            </button>
          </div>
        </header>

        <section className="content-body">
          {activeTab === 'reporting' && <ReportingView />}
          {activeTab === 'screenings' && (
            <ScreeningsView onSelectScreeningForBooking={handleSelectScreeningForBooking} />
          )}
          {activeTab === 'bookings' && (
            <BookingsView initialScreeningId={bookingScreeningId} />
          )}
          {activeTab === 'movies' && <MoviesView />}
          {activeTab === 'cinemas' && <CinemasView />}
          {activeTab === 'payments' && <PaymentsView />}
          {activeTab === 'concessions' && <ConcessionsView />}
          {activeTab === 'schema' && <SchemaView />}
          {activeTab === 'sqlsync' && <SqlSyncView />}
        </section>
      </main>
    </div>
  );
}


import React, { useState } from 'react';
import { motion } from 'motion/react';
import { dbms } from '../db/dbmsService';

const TABLES = [
  { name: 'Cinema', key: 'cinemas', pk: 'CinemaID', fks: [], desc: 'Cinema chain facilities & locations' },
  { name: 'Screen', key: 'screens', pk: 'ScreenID', fks: ['CinemaID -> Cinema'], desc: 'Individual auditorium screens' },
  { name: 'Seat', key: 'seats', pk: 'SeatID', fks: ['ScreenID -> Screen'], desc: 'Physical seating inventory per screen' },
  { name: 'Movie', key: 'movies', pk: 'MovieID', fks: [], desc: 'Film titles, duration & metadata' },
  { name: 'Screening', key: 'screenings', pk: 'ScreeningID', fks: ['MovieID -> Movie', 'ScreenID -> Screen'], desc: 'Scheduled showtimes and pricing' },
  { name: 'Customer', key: 'customers', pk: 'CustomerID', fks: [], desc: 'Patron profiles & membership status' },
  { name: 'Booking', key: 'bookings', pk: 'BookingID', fks: ['CustomerID -> Customer', 'ScreeningID -> Screening'], desc: 'Customer reservations' },
  { name: 'BookedSeat', key: 'bookedSeats', pk: 'BookedSeatID', fks: ['BookingID -> Booking', 'SeatID -> Seat'], desc: 'One-seat-per-screening associative entity' },
  { name: 'Ticket', key: 'tickets', pk: 'TicketID', fks: ['BookingID -> Booking'], desc: 'Issued admission passes & status' },
  { name: 'Payment', key: 'payments', pk: 'PaymentID', fks: ['BookingID -> Booking (1:1)'], desc: 'Transaction settlement records' }
];

export default function SchemaView() {
  const [selectedTable, setSelectedTable] = useState(TABLES[0]);

  let records = [];
  switch (selectedTable.key) {
    case 'cinemas': records = dbms.getCinemas(); break;
    case 'screens': records = dbms.getScreens(); break;
    case 'seats': records = dbms.getSeats().slice(0, 32); break; // sample preview
    case 'movies': records = dbms.getMovies(); break;
    case 'screenings': records = dbms.getScreenings(); break;
    case 'customers': records = dbms.getCustomers(); break;
    case 'bookings': records = dbms.getBookings(); break;
    case 'bookedSeats': records = dbms.getBookedSeats(); break;
    case 'tickets': records = dbms.getTickets(); break;
    case 'payments': records = dbms.getPayments(); break;
    default: records = [];
  }

  const columns = records.length > 0 ? Object.keys(records[0]) : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div style={{ marginBottom: 18, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Direct relational view of the 10 normalized 3NF entities referenced in the source document.
      </div>

      {/* Table selector buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {TABLES.map(table => (
          <button
            key={table.name}
            className={`btn ${selectedTable.name === table.name ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8125rem', padding: '6px 12px' }}
            onClick={() => setSelectedTable(table)}
          >
            {table.name}
          </button>
        ))}
      </div>

      {/* Selected Table Metadata */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Relational Entity: {selectedTable.name}</h3>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>{selectedTable.desc}</div>
          </div>
          <div style={{ fontSize: '0.8125rem' }}>
            <span style={{ fontWeight: 600 }}>Primary Key (PK): </span>
            <span className="badge badge-pending">{selectedTable.pk}</span>
          </div>
        </div>

        {selectedTable.fks.length > 0 && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 6 }}>
            <span style={{ fontWeight: 600 }}>Foreign Keys (FK): </span>
            {selectedTable.fks.join(' | ')}
          </div>
        )}
      </div>

      {/* Records Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Entity Records ({records.length} shown)</h2>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col}>
                    {col}
                    {col === selectedTable.pk && ' (PK)'}
                    {selectedTable.fks.some(fk => fk.startsWith(col)) && ' (FK)'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((row, idx) => (
                <tr key={idx}>
                  {columns.map(col => (
                    <td key={col}>
                      {typeof row[col] === 'number' && (col.toLowerCase().includes('price') || col.toLowerCase().includes('amount'))
                        ? `₹${row[col].toFixed(2)}` 
                        : String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

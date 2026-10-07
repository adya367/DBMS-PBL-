import React, { useState } from 'react';
import { motion } from 'motion/react';
import { dbms } from '../db/dbmsService';

export default function CinemasView() {
  const cinemas = dbms.getCinemas();
  const screens = dbms.getScreens();
  const [selectedScreenId, setSelectedScreenId] = useState(screens[0]?.ScreenID || null);

  const selectedScreenSeats = dbms.getSeats(selectedScreenId);
  const selectedScreen = screens.find(s => s.ScreenID === selectedScreenId);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Cinemas (1:M with Screens) */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h2 className="card-title">Cinema Locations</h2>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cinema ID</th>
                <th>Cinema Name</th>
                <th>Location</th>
                <th>Contact Info</th>
                <th>Screens Count</th>
              </tr>
            </thead>
            <tbody>
              {cinemas.map(c => {
                const cinemaScreens = screens.filter(s => s.CinemaID === c.CinemaID);
                return (
                  <tr key={c.CinemaID}>
                    <td><strong>{c.CinemaID}</strong></td>
                    <td><strong>{c.Name}</strong></td>
                    <td>{c.Location}</td>
                    <td>{c.ContactInfo}</td>
                    <td>{cinemaScreens.length} Screens</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screens & Seats hierarchy */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        {/* Screen List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Cinema Screens (1:M with Cinema)</h2>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Screen ID</th>
                  <th>Cinema ID</th>
                  <th>Screen Type</th>
                  <th>Capacity</th>
                  <th>Inspect Seats</th>
                </tr>
              </thead>
              <tbody>
                {screens.map(s => (
                  <tr 
                    key={s.ScreenID}
                    style={{ backgroundColor: selectedScreenId === s.ScreenID ? 'var(--accent-subtle)' : 'transparent' }}
                  >
                    <td><strong>{s.ScreenID}</strong></td>
                    <td>{s.CinemaID}</td>
                    <td>{s.ScreenType}</td>
                    <td>{s.Capacity} seats</td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedScreenId(s.ScreenID)}
                      >
                        {selectedScreenId === s.ScreenID ? 'Viewing' : 'View Seats'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Seat Layout for Selected Screen */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              Seats for Screen {selectedScreenId} ({selectedScreen?.ScreenType})
            </h2>
          </div>

          <div className="screen-indicator">Projection Display</div>

          <div className="seats-grid">
            {selectedScreenSeats.map(seat => (
              <div 
                key={seat.SeatID}
                className="seat-btn"
                style={{ cursor: 'default' }}
                title={`${seat.SeatNumber} - ${seat.SeatType}`}
              >
                <span>{seat.SeatNumber}</span>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                  {seat.SeatType === 'VIP Recliner' ? 'VIP' : seat.SeatType === 'Premium' ? 'Prem' : 'Std'}
                </span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 12 }}>
            Total Seats Configured: {selectedScreenSeats.length} (Screen ID: {selectedScreenId})
          </div>
        </div>
      </div>
    </motion.div>
  );
}

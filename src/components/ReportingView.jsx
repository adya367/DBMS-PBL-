import React from 'react';
import { motion } from 'motion/react';
import { dbms } from '../db/dbmsService';

export default function ReportingView() {
  const analytics = dbms.getReportingAnalytics();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Top Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Box Office</div>
          <div className="stat-value">₹{analytics.totalRevenue.toFixed(2)}</div>
          <div className="stat-subtext">From confirmed ticket bookings</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Concession Sales</div>
          <div className="stat-value">₹{analytics.concessionRevenue.toFixed(2)}</div>
          <div className="stat-subtext">Inventory orders linked to tickets</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Average Occupancy</div>
          <div className="stat-value">{analytics.averageOccupancy}%</div>
          <div className="stat-subtext">Across all scheduled screenings</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Active Bookings</div>
          <div className="stat-value">{analytics.confirmedBookingsCount}</div>
          <div className="stat-subtext">Total confirmed reservations</div>
        </div>
      </div>

      {/* Movie Performance Table */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h2 className="card-title">Movie Performance & Revenue</h2>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Movie Title</th>
                <th>Genre</th>
                <th>Screenings</th>
                <th>Tickets Sold</th>
                <th>Gross Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.moviePerformance.map((movie) => (
                <tr key={movie.MovieID}>
                  <td><strong>{movie.Title}</strong></td>
                  <td>{movie.Genre}</td>
                  <td>{movie.ScreeningsCount}</td>
                  <td>{movie.TicketsSold}</td>
                  <td>₹{movie.GrossRevenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screen Utilization and Screening Occupancy */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Screen Utilization</h2>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Screen</th>
                  <th>Cinema</th>
                  <th>Type</th>
                  <th>Shows</th>
                  <th>Scheduled Time</th>
                </tr>
              </thead>
              <tbody>
                {analytics.screenUtilization.map((screen) => (
                  <tr key={screen.ScreenID}>
                    <td><strong>{screen.ScreenID}</strong></td>
                    <td>{screen.CinemaName}</td>
                    <td>{screen.ScreenType}</td>
                    <td>{screen.ScreeningsCount}</td>
                    <td>{screen.UtilizationHours} hrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Screening Occupancy Rates</h2>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Screening ID</th>
                  <th>Movie</th>
                  <th>Screen</th>
                  <th>Booked / Cap</th>
                  <th>Occupancy</th>
                </tr>
              </thead>
              <tbody>
                {analytics.screeningOccupancy.map((scn) => (
                  <tr key={scn.ScreeningID}>
                    <td><strong>{scn.ScreeningID}</strong></td>
                    <td>{scn.MovieTitle}</td>
                    <td>{scn.ScreenID}</td>
                    <td>{scn.BookedSeats} / {scn.Capacity}</td>
                    <td>
                      <span className="badge badge-confirmed">
                        {scn.OccupancyRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

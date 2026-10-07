import React, { useState } from 'react';
import { motion } from 'motion/react';
import { dbms } from '../db/dbmsService';
import Modal from './Modal';

export default function ScreeningsView({ onSelectScreeningForBooking }) {
  const [screenings, setScreenings] = useState(dbms.getScreenings());
  const [movies] = useState(dbms.getMovies());
  const [screens] = useState(dbms.getScreens());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    MovieID: movies[0]?.MovieID || '',
    ScreenID: screens[0]?.ScreenID || '',
    ShowTime: '2026-10-01T14:30',
    Price: '350.00'
  });

  const [feedback, setFeedback] = useState(null);

  const refreshList = () => {
    setScreenings([...dbms.getScreenings()]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      setFeedback(null);
      const created = dbms.addScreening(formData);
      setFeedback({ type: 'success', message: `Screening ${created.ScreeningID} scheduled successfully.` });
      setIsModalOpen(false);
      refreshList();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleDelete = (screeningId) => {
    if (!window.confirm(`Delete screening ${screeningId}?`)) return;
    try {
      dbms.deleteScreening(screeningId);
      setFeedback({ type: 'success', message: `Screening ${screeningId} deleted.` });
      refreshList();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="filter-bar">
        <div>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setFeedback(null);
              setIsModalOpen(true);
            }}
          >
            Add New Screening
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`alert ${feedback.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {feedback.message}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Scheduled Screenings & Real-Time Seat Availability</h2>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Screening ID</th>
                <th>Movie Title</th>
                <th>Screen</th>
                <th>Show Time</th>
                <th>Price</th>
                <th>Seat Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {screenings.map((scn) => {
                const movie = movies.find(m => m.MovieID === scn.MovieID);
                const screen = screens.find(s => s.ScreenID === scn.ScreenID);
                const availability = dbms.getScreeningSeatAvailability(scn.ScreeningID);

                return (
                  <tr key={scn.ScreeningID}>
                    <td><strong>{scn.ScreeningID}</strong></td>
                    <td>
                      <div><strong>{movie?.Title}</strong></div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {movie?.Duration} min | {movie?.Rating}
                      </div>
                    </td>
                    <td>
                      <div>{scn.ScreenID}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{screen?.ScreenType}</div>
                    </td>
                    <td>{new Date(scn.ShowTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td>₹{scn.Price.toFixed(2)}</td>
                    <td>
                      <div>
                        <strong>{availability?.availableCount}</strong> of {availability?.totalCapacity} seats free
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {availability?.bookedCount} reserved
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {onSelectScreeningForBooking && (
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => onSelectScreeningForBooking(scn.ScreeningID)}
                          >
                            Book Seats
                          </button>
                        )}
                        <button 
                          className="btn btn-danger-outline btn-sm"
                          onClick={() => handleDelete(scn.ScreeningID)}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Screening Modal with Overlap Prevention */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Schedule Screening (Screen Overlap Check)"
      >
        <form onSubmit={handleSubmit}>
          <div className="alert alert-info" style={{ fontSize: '0.8125rem', marginBottom: 16 }}>
            Rule: Overlapping showtimes on the same screen are prevented at the DBMS level.
          </div>

          <div className="form-group">
            <label className="form-label">Select Movie</label>
            <select 
              className="form-control"
              value={formData.MovieID}
              onChange={(e) => setFormData({ ...formData, MovieID: e.target.value })}
              required
            >
              {movies.map(m => (
                <option key={m.MovieID} value={m.MovieID}>
                  {m.Title} ({m.Duration} mins, {m.Rating})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Screen</label>
            <select 
              className="form-control"
              value={formData.ScreenID}
              onChange={(e) => setFormData({ ...formData, ScreenID: e.target.value })}
              required
            >
              {screens.map(s => (
                <option key={s.ScreenID} value={s.ScreenID}>
                  {s.ScreenID} ({s.ScreenType}, Cap: {s.Capacity})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Show Date & Time</label>
              <input 
                type="datetime-local" 
                className="form-control"
                value={formData.ShowTime}
                onChange={(e) => setFormData({ ...formData, ShowTime: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ticket Price (₹)</label>
              <input 
                type="number" 
                step="0.5" 
                min="1"
                className="form-control"
                value={formData.Price}
                onChange={(e) => setFormData({ ...formData, Price: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '16px -24px -24px -24px' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Verify & Schedule
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}

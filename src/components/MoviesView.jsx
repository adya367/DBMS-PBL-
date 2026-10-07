import React, { useState } from 'react';
import { motion } from 'motion/react';
import { dbms } from '../db/dbmsService';
import Modal from './Modal';

export default function MoviesView() {
  const [movies, setMovies] = useState(dbms.getMovies());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    Title: '',
    Genre: '',
    Duration: '120',
    ReleaseDate: '2026-10-01',
    Rating: 'PG-13'
  });

  const refreshList = () => {
    setMovies([...dbms.getMovies()]);
  };

  const handleAddMovie = (e) => {
    e.preventDefault();
    try {
      setFeedback(null);
      const newMovie = dbms.addMovie(formData);
      setFeedback({ type: 'success', message: `Movie '${newMovie.Title}' (${newMovie.MovieID}) added.` });
      setIsModalOpen(false);
      setFormData({ Title: '', Genre: '', Duration: '120', ReleaseDate: '2026-10-01', Rating: 'PG-13' });
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
        <button 
          className="btn btn-primary"
          onClick={() => {
            setFeedback(null);
            setIsModalOpen(true);
          }}
        >
          Add New Movie
        </button>
      </div>

      {feedback && (
        <div className={`alert ${feedback.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {feedback.message}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Movie Catalog & Attributes</h2>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Movie ID</th>
                <th>Title</th>
                <th>Genre</th>
                <th>Duration</th>
                <th>Release Date</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.MovieID}>
                  <td><strong>{movie.MovieID}</strong></td>
                  <td><strong>{movie.Title}</strong></td>
                  <td>{movie.Genre}</td>
                  <td>{movie.Duration} minutes</td>
                  <td>{movie.ReleaseDate}</td>
                  <td>
                    <span className="badge badge-pending">{movie.Rating}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Movie"
      >
        <form onSubmit={handleAddMovie}>
          <div className="form-group">
            <label className="form-label">Movie Title</label>
            <input 
              type="text" 
              className="form-control"
              value={formData.Title}
              onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Genre</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="e.g. Action / Thriller"
              value={formData.Genre}
              onChange={(e) => setFormData({ ...formData, Genre: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Duration (Minutes)</label>
              <input 
                type="number" 
                min="1"
                className="form-control"
                value={formData.Duration}
                onChange={(e) => setFormData({ ...formData, Duration: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rating</label>
              <select 
                className="form-control"
                value={formData.Rating}
                onChange={(e) => setFormData({ ...formData, Rating: e.target.value })}
              >
                <option value="G">G</option>
                <option value="PG">PG</option>
                <option value="PG-13">PG-13</option>
                <option value="R">R</option>
                <option value="NC-17">NC-17</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Release Date</label>
            <input 
              type="date" 
              className="form-control"
              value={formData.ReleaseDate}
              onChange={(e) => setFormData({ ...formData, ReleaseDate: e.target.value })}
              required
            />
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
              Save Movie
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}

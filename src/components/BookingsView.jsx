import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { dbms } from '../db/dbmsService';
import Modal from './Modal';

export default function BookingsView({ initialScreeningId = null }) {
  const [bookings, setBookings] = useState(dbms.getBookings());
  const [customers] = useState(dbms.getCustomers());
  const [screenings] = useState(dbms.getScreenings());
  const [movies] = useState(dbms.getMovies());
  const [concessionItems] = useState(dbms.getConcessionItems());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]?.CustomerID || '');
  const [selectedScreening, setSelectedScreening] = useState(initialScreeningId || screenings[0]?.ScreeningID || '');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [selectedConcessions, setSelectedConcessions] = useState({});

  useEffect(() => {
    if (initialScreeningId) {
      setSelectedScreening(initialScreeningId);
      setIsModalOpen(true);
    }
  }, [initialScreeningId]);

  const refreshList = () => {
    setBookings([...dbms.getBookings()]);
  };

  // Availability calculation for currently selected screening in modal
  const availability = selectedScreening ? dbms.getScreeningSeatAvailability(selectedScreening) : null;
  const currentScreeningObj = screenings.find(s => s.ScreeningID === selectedScreening);
  const currentMovie = currentScreeningObj ? movies.find(m => m.MovieID === currentScreeningObj.MovieID) : null;

  const toggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleConcessionQuantity = (itemId, qty) => {
    const parsed = Math.max(0, parseInt(qty, 10) || 0);
    setSelectedConcessions(prev => ({
      ...prev,
      [itemId]: parsed
    }));
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    try {
      setFeedback(null);
      const concessionOrders = Object.entries(selectedConcessions)
        .filter(([, qty]) => qty > 0)
        .map(([itemId, qty]) => ({ itemId, quantity: qty }));

      const result = dbms.createBooking({
        customerId: selectedCustomer,
        screeningId: selectedScreening,
        seatIds: selectedSeats,
        paymentMethod,
        concessionOrders
      });

      setFeedback({
        type: 'success',
        message: `Booking created: ${result.booking.BookingID} | Ticket: ${result.ticket.TicketID} | Payment: ₹${result.payment.Amount.toFixed(2)} (${result.payment.Method})`
      });

      setIsModalOpen(false);
      setSelectedSeats([]);
      setSelectedConcessions({});
      refreshList();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleCancelBooking = (bookingId) => {
    if (!window.confirm(`Cancel booking ${bookingId}? This will invalidate tickets, release seats, and trigger refund.`)) return;
    try {
      dbms.cancelBooking(bookingId);
      setFeedback({ type: 'success', message: `Booking ${bookingId} cancelled and seats released.` });
      refreshList();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Calculations for order preview
  const ticketSubtotal = selectedSeats.length * (currentScreeningObj?.Price || 0);
  let concessionSubtotal = 0;
  Object.entries(selectedConcessions).forEach(([itemId, qty]) => {
    const item = concessionItems.find(i => i.ItemID === itemId);
    if (item && qty > 0) {
      concessionSubtotal += item.Price * qty;
    }
  });
  const totalAmount = ticketSubtotal + concessionSubtotal;

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
              setSelectedSeats([]);
              setIsModalOpen(true);
            }}
          >
            Create New Booking
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`alert ${feedback.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {feedback.message}
        </div>
      )}

      {/* Bookings List */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Bookings & Ticket Records</h2>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Screening & Movie</th>
                <th>Booked Seats</th>
                <th>Booking Date</th>
                <th>Status</th>
                <th>Ticket ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((bkg) => {
                const customer = customers.find(c => c.CustomerID === bkg.CustomerID);
                const scn = screenings.find(s => s.ScreeningID === bkg.ScreeningID);
                const movie = scn ? movies.find(m => m.MovieID === scn.MovieID) : null;
                const bkgSeats = dbms.getBookedSeats().filter(bs => bs.BookingID === bkg.BookingID);
                const ticket = dbms.getTickets().find(t => t.BookingID === bkg.BookingID);

                const seatLabels = bkgSeats.map(bs => {
                  const s = dbms.getSeats().find(seat => seat.SeatID === bs.SeatID);
                  return s ? s.SeatNumber : bs.SeatID;
                }).join(', ');

                return (
                  <tr key={bkg.BookingID}>
                    <td><strong>{bkg.BookingID}</strong></td>
                    <td>
                      <div><strong>{customer?.Name || bkg.CustomerID}</strong></div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {customer?.MembershipStatus} Member
                      </div>
                    </td>
                    <td>
                      <div>{movie?.Title || bkg.ScreeningID}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {scn?.ScreenID} | {scn?.ShowTime ? new Date(scn.ShowTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>
                    <td>
                      {seatLabels || (bkg.Status === 'Cancelled' ? 'Released' : 'None')}
                    </td>
                    <td>{new Date(bkg.BookingDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td>
                      <span className={`badge ${bkg.Status === 'Confirmed' ? 'badge-confirmed' : 'badge-cancelled'}`}>
                        {bkg.Status}
                      </span>
                    </td>
                    <td>
                      {ticket ? (
                        <div>
                          <div><strong>{ticket.TicketID}</strong></div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Status: {ticket.ValidityStatus}
                          </div>
                        </div>
                      ) : 'None'}
                    </td>
                    <td>
                      {bkg.Status === 'Confirmed' ? (
                        <button 
                          className="btn btn-danger-outline btn-sm"
                          onClick={() => handleCancelBooking(bkg.BookingID)}
                        >
                          Cancel Booking
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cancelled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Creation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Reserve Seats & Issue Ticket (One-Seat Rule)"
      >
        <form onSubmit={handleBookingSubmit}>
          <div className="form-group">
            <label className="form-label">Customer</label>
            <select 
              className="form-control"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              required
            >
              {customers.map(c => (
                <option key={c.CustomerID} value={c.CustomerID}>
                  {c.Name} ({c.MembershipStatus}) - {c.Email}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Screening</label>
            <select 
              className="form-control"
              value={selectedScreening}
              onChange={(e) => {
                setSelectedScreening(e.target.value);
                setSelectedSeats([]);
              }}
              required
            >
              {screenings.map(s => {
                const m = movies.find(mov => mov.MovieID === s.MovieID);
                return (
                  <option key={s.ScreeningID} value={s.ScreeningID}>
                    {s.ScreeningID} | {m?.Title} ({s.ScreenID}) - ₹{s.Price.toFixed(2)}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Interactive Seat Map */}
          {availability && (
            <div style={{ margin: '18px 0' }}>
              <label className="form-label">
                Select Seat(s) — Enforces One Seat Per Screening
              </label>
              
              <div className="screen-indicator">Screen Direction</div>

              <div className="seats-grid">
                {availability.seats.map(seat => {
                  const isSelected = selectedSeats.includes(seat.SeatID);
                  const isOccupied = seat.isOccupied;

                  return (
                    <button
                      key={seat.SeatID}
                      type="button"
                      disabled={isOccupied}
                      className={`seat-btn ${isSelected ? 'selected' : ''} ${isOccupied ? 'occupied' : ''}`}
                      onClick={() => toggleSeat(seat.SeatID)}
                      title={`Seat ${seat.SeatNumber} (${seat.SeatType}) - ${isOccupied ? 'Already Reserved' : 'Available'}`}
                    >
                      <span>{seat.SeatNumber}</span>
                    </button>
                  );
                })}
              </div>

              <div className="seat-legend">
                <div className="legend-item">
                  <div className="legend-box" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-strong)' }}></div>
                  <span>Available</span>
                </div>
                <div className="legend-item">
                  <div className="legend-box" style={{ backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' }}></div>
                  <span>Selected</span>
                </div>
                <div className="legend-item">
                  <div className="legend-box" style={{ backgroundColor: '#eae7e1', borderColor: '#dcd7ce' }}></div>
                  <span>Occupied</span>
                </div>
              </div>
            </div>
          )}

          {/* Concessions Selection (Requirement 4) */}
          <div style={{ margin: '18px 0', padding: 14, backgroundColor: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)' }}>
            <label className="form-label" style={{ marginBottom: 10 }}>
              Add Concessions (Optional Inventory Tracked)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {concessionItems.map(item => (
                <div key={item.ItemID} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                  <div>
                    <strong>{item.Name}</strong> (₹{item.Price.toFixed(2)})
                    <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>Stock: {item.Inventory}</span>
                  </div>
                  <input 
                    type="number" 
                    min="0" 
                    max={item.Inventory} 
                    value={selectedConcessions[item.ItemID] || 0}
                    onChange={(e) => handleConcessionQuantity(item.ItemID, e.target.value)}
                    style={{ width: 60, padding: '4px 6px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selection (1:1 with Booking) */}
          <div className="form-group">
            <label className="form-label">Payment Method (1:1 Payment Record Generated)</label>
            <select 
              className="form-control"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash at Counter</option>
            </select>
          </div>

          {/* Order Summary */}
          <div style={{ padding: '12px 16px', backgroundColor: 'var(--surface-subtle)', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <span>Seats Selected ({selectedSeats.length}):</span>
              <span>₹{ticketSubtotal.toFixed(2)}</span>
            </div>
            {concessionSubtotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginTop: 4 }}>
                <span>Concessions:</span>
                <span>₹{concessionSubtotal.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9375rem', marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 6 }}>
              <span>Total Payable:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
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
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={selectedSeats.length === 0}
            >
              Confirm Booking & Pay
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}

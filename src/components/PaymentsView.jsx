import React from 'react';
import { motion } from 'motion/react';
import { dbms } from '../db/dbmsService';

export default function PaymentsView() {
  const payments = dbms.getPayments();
  const bookings = dbms.getBookings();
  const customers = dbms.getCustomers();

  const totalCollected = payments.reduce((sum, p) => sum + p.Amount, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Transactions Logged</div>
          <div className="stat-value">{payments.length}</div>
          <div className="stat-subtext">1:1 mapped to booking records</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Gross Processed Volume</div>
          <div className="stat-value">₹{totalCollected.toFixed(2)}</div>
          <div className="stat-subtext">Includes all methods</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Payment Transactions (1:1 with Booking)</h2>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Transaction Date</th>
                <th>Booking Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(pay => {
                const bkg = bookings.find(b => b.BookingID === pay.BookingID);
                const cust = bkg ? customers.find(c => c.CustomerID === bkg.CustomerID) : null;
                const isRefunded = pay.Method.includes('(Refunded)') || bkg?.Status === 'Cancelled';

                return (
                  <tr key={pay.PaymentID}>
                    <td><strong>{pay.PaymentID}</strong></td>
                    <td>{pay.BookingID}</td>
                    <td>{cust?.Name || 'Unknown Customer'}</td>
                    <td><strong>₹{pay.Amount.toFixed(2)}</strong></td>
                    <td>
                      <span>{pay.Method}</span>
                    </td>
                    <td>{new Date(pay.TransactionDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td>
                      <span className={`badge ${isRefunded ? 'badge-cancelled' : 'badge-confirmed'}`}>
                        {isRefunded ? 'Refunded / Cancelled' : 'Captured'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

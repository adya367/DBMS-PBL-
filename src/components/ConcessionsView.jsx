import React from 'react';
import { motion } from 'motion/react';
import { dbms } from '../db/dbmsService';

export default function ConcessionsView() {
  const items = dbms.getConcessionItems();
  const orders = dbms.getConcessionOrders();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        {/* Concessions Inventory */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Concession Inventory</h2>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item ID</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Stock In Hand</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.ItemID}>
                    <td><strong>{item.ItemID}</strong></td>
                    <td><strong>{item.Name}</strong></td>
                    <td>{item.Category}</td>
                    <td>₹{item.Price.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${item.Inventory > 30 ? 'badge-confirmed' : 'badge-pending'}`}>
                        {item.Inventory} units
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Concession Orders Log */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Concession Orders Logged with Bookings</h2>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Booking ID</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(ord => {
                  const item = items.find(i => i.ItemID === ord.ItemID);
                  return (
                    <tr key={ord.OrderID}>
                      <td><strong>{ord.OrderID}</strong></td>
                      <td>{ord.BookingID}</td>
                      <td>{item?.Name || ord.ItemID}</td>
                      <td>{ord.Quantity}</td>
                      <td><strong>₹{ord.TotalPrice.toFixed(2)}</strong></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

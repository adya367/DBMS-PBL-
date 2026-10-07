/**
 * Generates clean, standard MySQL Workbench compatible SQL script
 * containing full schema definition (DDL) and transactional INSERT statements (DML).
 */

function escapeSqlString(val) {
  if (val === null || val === undefined) return 'NULL';
  const str = String(val).replace(/\\/g, '\\\\').replace(/'/g, "''");
  return `'${str}'`;
}

function formatSqlDateTime(isoStr) {
  if (!isoStr) return 'NULL';
  // Standardize 'YYYY-MM-DDTHH:mm' -> 'YYYY-MM-DD HH:mm:00'
  const cleaned = isoStr.replace('T', ' ');
  if (cleaned.length === 16) {
    return `'${cleaned}:00'`;
  }
  return `'${cleaned}'`;
}

export function generateMySQLDump(data) {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  let sql = `-- ========================================================
-- Cinema Screening and Ticket Booking System DBMS
-- Target Database: MySQL 8.0+ / MySQL Workbench Compatible
-- Generated in real-time from Cinema DBMS Application
-- Last Synchronized: ${now}
-- ========================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS cinema_screening_dbms;
CREATE DATABASE cinema_screening_dbms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cinema_screening_dbms;

-- --------------------------------------------------------
-- Table structure for table: Cinema
-- --------------------------------------------------------
DROP TABLE IF EXISTS Cinema;
CREATE TABLE Cinema (
  CinemaID VARCHAR(20) NOT NULL,
  Name VARCHAR(100) NOT NULL,
  Location VARCHAR(255) NOT NULL,
  ContactInfo VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (CinemaID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table: Screen
-- --------------------------------------------------------
DROP TABLE IF EXISTS Screen;
CREATE TABLE Screen (
  ScreenID VARCHAR(20) NOT NULL,
  CinemaID VARCHAR(20) NOT NULL,
  Capacity INT NOT NULL,
  ScreenType VARCHAR(50) NOT NULL,
  PRIMARY KEY (ScreenID),
  KEY idx_screen_cinema (CinemaID),
  CONSTRAINT fk_screen_cinema FOREIGN KEY (CinemaID) REFERENCES Cinema (CinemaID) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table: Seat
-- --------------------------------------------------------
DROP TABLE IF EXISTS Seat;
CREATE TABLE Seat (
  SeatID VARCHAR(20) NOT NULL,
  ScreenID VARCHAR(20) NOT NULL,
  SeatNumber VARCHAR(10) NOT NULL,
  SeatType VARCHAR(30) DEFAULT 'Standard',
  Status VARCHAR(20) DEFAULT 'Available',
  PRIMARY KEY (SeatID),
  KEY idx_seat_screen (ScreenID),
  CONSTRAINT fk_seat_screen FOREIGN KEY (ScreenID) REFERENCES Screen (ScreenID) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table: Movie
-- --------------------------------------------------------
DROP TABLE IF EXISTS Movie;
CREATE TABLE Movie (
  MovieID VARCHAR(20) NOT NULL,
  Title VARCHAR(150) NOT NULL,
  Genre VARCHAR(100) NOT NULL,
  Duration INT NOT NULL COMMENT 'Duration in minutes',
  ReleaseDate DATE NOT NULL,
  Rating VARCHAR(10) NOT NULL,
  PRIMARY KEY (MovieID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table: Screening
-- --------------------------------------------------------
DROP TABLE IF EXISTS Screening;
CREATE TABLE Screening (
  ScreeningID VARCHAR(20) NOT NULL,
  MovieID VARCHAR(20) NOT NULL,
  ScreenID VARCHAR(20) NOT NULL,
  ShowTime DATETIME NOT NULL,
  Price DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (ScreeningID),
  KEY idx_screening_movie (MovieID),
  KEY idx_screening_screen (ScreenID),
  CONSTRAINT fk_screening_movie FOREIGN KEY (MovieID) REFERENCES Movie (MovieID) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_screening_screen FOREIGN KEY (ScreenID) REFERENCES Screen (ScreenID) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table: Customer
-- --------------------------------------------------------
DROP TABLE IF EXISTS Customer;
CREATE TABLE Customer (
  CustomerID VARCHAR(20) NOT NULL,
  Name VARCHAR(100) NOT NULL,
  Email VARCHAR(120) NOT NULL,
  Phone VARCHAR(30) DEFAULT NULL,
  MembershipStatus VARCHAR(30) DEFAULT 'Standard',
  PRIMARY KEY (CustomerID),
  UNIQUE KEY uq_customer_email (Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table: Booking
-- --------------------------------------------------------
DROP TABLE IF EXISTS Booking;
CREATE TABLE Booking (
  BookingID VARCHAR(20) NOT NULL,
  CustomerID VARCHAR(20) NOT NULL,
  ScreeningID VARCHAR(20) NOT NULL,
  BookingDate DATETIME NOT NULL,
  Status VARCHAR(20) DEFAULT 'Confirmed',
  PRIMARY KEY (BookingID),
  KEY idx_booking_customer (CustomerID),
  KEY idx_booking_screening (ScreeningID),
  CONSTRAINT fk_booking_customer FOREIGN KEY (CustomerID) REFERENCES Customer (CustomerID) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_booking_screening FOREIGN KEY (ScreeningID) REFERENCES Screening (ScreeningID) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table: BookedSeat
-- --------------------------------------------------------
DROP TABLE IF EXISTS BookedSeat;
CREATE TABLE BookedSeat (
  BookedSeatID VARCHAR(30) NOT NULL,
  BookingID VARCHAR(20) NOT NULL,
  SeatID VARCHAR(20) NOT NULL,
  PRIMARY KEY (BookedSeatID),
  KEY idx_bookedseat_booking (BookingID),
  KEY idx_bookedseat_seat (SeatID),
  CONSTRAINT fk_bookedseat_booking FOREIGN KEY (BookingID) REFERENCES Booking (BookingID) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_bookedseat_seat FOREIGN KEY (SeatID) REFERENCES Seat (SeatID) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table: Ticket
-- --------------------------------------------------------
DROP TABLE IF EXISTS Ticket;
CREATE TABLE Ticket (
  TicketID VARCHAR(20) NOT NULL,
  BookingID VARCHAR(20) NOT NULL,
  IssueDate DATETIME NOT NULL,
  ValidityStatus VARCHAR(20) DEFAULT 'Valid',
  PRIMARY KEY (TicketID),
  KEY idx_ticket_booking (BookingID),
  CONSTRAINT fk_ticket_booking FOREIGN KEY (BookingID) REFERENCES Booking (BookingID) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table: Payment (1:1 with Booking)
-- --------------------------------------------------------
DROP TABLE IF EXISTS Payment;
CREATE TABLE Payment (
  PaymentID VARCHAR(20) NOT NULL,
  BookingID VARCHAR(20) NOT NULL,
  Amount DECIMAL(10,2) NOT NULL,
  Method VARCHAR(50) NOT NULL,
  TransactionDate DATETIME NOT NULL,
  PRIMARY KEY (PaymentID),
  UNIQUE KEY uq_payment_booking (BookingID),
  CONSTRAINT fk_payment_booking FOREIGN KEY (BookingID) REFERENCES Booking (BookingID) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table: ConcessionItem
-- --------------------------------------------------------
DROP TABLE IF EXISTS ConcessionItem;
CREATE TABLE ConcessionItem (
  ItemID VARCHAR(20) NOT NULL,
  Name VARCHAR(100) NOT NULL,
  Category VARCHAR(50) NOT NULL,
  Price DECIMAL(8,2) NOT NULL,
  Inventory INT NOT NULL DEFAULT 0,
  PRIMARY KEY (ItemID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table: ConcessionOrder
-- --------------------------------------------------------
DROP TABLE IF EXISTS ConcessionOrder;
CREATE TABLE ConcessionOrder (
  OrderID VARCHAR(30) NOT NULL,
  BookingID VARCHAR(20) NOT NULL,
  ItemID VARCHAR(20) NOT NULL,
  Quantity INT NOT NULL,
  TotalPrice DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (OrderID),
  KEY idx_concession_booking (BookingID),
  KEY idx_concession_item (ItemID),
  CONSTRAINT fk_concession_booking FOREIGN KEY (BookingID) REFERENCES Booking (BookingID) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_concession_item FOREIGN KEY (ItemID) REFERENCES ConcessionItem (ItemID) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- DATA INSERTION (DML)
-- ========================================================

`;

  // Cinema
  if (data.cinemas && data.cinemas.length > 0) {
    sql += `-- Dumping data for table Cinema\n`;
    sql += `INSERT INTO Cinema (CinemaID, Name, Location, ContactInfo) VALUES\n`;
    sql += data.cinemas.map(c => 
      `  (${escapeSqlString(c.CinemaID)}, ${escapeSqlString(c.Name)}, ${escapeSqlString(c.Location)}, ${escapeSqlString(c.ContactInfo)})`
    ).join(',\n') + ';\n\n';
  }

  // Screen
  if (data.screens && data.screens.length > 0) {
    sql += `-- Dumping data for table Screen\n`;
    sql += `INSERT INTO Screen (ScreenID, CinemaID, Capacity, ScreenType) VALUES\n`;
    sql += data.screens.map(s => 
      `  (${escapeSqlString(s.ScreenID)}, ${escapeSqlString(s.CinemaID)}, ${Number(s.Capacity)}, ${escapeSqlString(s.ScreenType)})`
    ).join(',\n') + ';\n\n';
  }

  // Seat
  if (data.seats && data.seats.length > 0) {
    sql += `-- Dumping data for table Seat\n`;
    sql += `INSERT INTO Seat (SeatID, ScreenID, SeatNumber, SeatType, Status) VALUES\n`;
    sql += data.seats.map(s => 
      `  (${escapeSqlString(s.SeatID)}, ${escapeSqlString(s.ScreenID)}, ${escapeSqlString(s.SeatNumber)}, ${escapeSqlString(s.SeatType || 'Standard')}, ${escapeSqlString(s.Status || 'Available')})`
    ).join(',\n') + ';\n\n';
  }

  // Movie
  if (data.movies && data.movies.length > 0) {
    sql += `-- Dumping data for table Movie\n`;
    sql += `INSERT INTO Movie (MovieID, Title, Genre, Duration, ReleaseDate, Rating) VALUES\n`;
    sql += data.movies.map(m => 
      `  (${escapeSqlString(m.MovieID)}, ${escapeSqlString(m.Title)}, ${escapeSqlString(m.Genre)}, ${Number(m.Duration)}, ${escapeSqlString(m.ReleaseDate)}, ${escapeSqlString(m.Rating)})`
    ).join(',\n') + ';\n\n';
  }

  // Screening
  if (data.screenings && data.screenings.length > 0) {
    sql += `-- Dumping data for table Screening\n`;
    sql += `INSERT INTO Screening (ScreeningID, MovieID, ScreenID, ShowTime, Price) VALUES\n`;
    sql += data.screenings.map(s => 
      `  (${escapeSqlString(s.ScreeningID)}, ${escapeSqlString(s.MovieID)}, ${escapeSqlString(s.ScreenID)}, ${formatSqlDateTime(s.ShowTime)}, ${parseFloat(s.Price).toFixed(2)})`
    ).join(',\n') + ';\n\n';
  }

  // Customer
  if (data.customers && data.customers.length > 0) {
    sql += `-- Dumping data for table Customer\n`;
    sql += `INSERT INTO Customer (CustomerID, Name, Email, Phone, MembershipStatus) VALUES\n`;
    sql += data.customers.map(c => 
      `  (${escapeSqlString(c.CustomerID)}, ${escapeSqlString(c.Name)}, ${escapeSqlString(c.Email)}, ${escapeSqlString(c.Phone)}, ${escapeSqlString(c.MembershipStatus || 'Standard')})`
    ).join(',\n') + ';\n\n';
  }

  // Booking
  if (data.bookings && data.bookings.length > 0) {
    sql += `-- Dumping data for table Booking\n`;
    sql += `INSERT INTO Booking (BookingID, CustomerID, ScreeningID, BookingDate, Status) VALUES\n`;
    sql += data.bookings.map(b => 
      `  (${escapeSqlString(b.BookingID)}, ${escapeSqlString(b.CustomerID)}, ${escapeSqlString(b.ScreeningID)}, ${formatSqlDateTime(b.BookingDate)}, ${escapeSqlString(b.Status || 'Confirmed')})`
    ).join(',\n') + ';\n\n';
  }

  // BookedSeat
  if (data.bookedSeats && data.bookedSeats.length > 0) {
    sql += `-- Dumping data for table BookedSeat\n`;
    sql += `INSERT INTO BookedSeat (BookedSeatID, BookingID, SeatID) VALUES\n`;
    sql += data.bookedSeats.map(bs => 
      `  (${escapeSqlString(bs.BookedSeatID)}, ${escapeSqlString(bs.BookingID)}, ${escapeSqlString(bs.SeatID)})`
    ).join(',\n') + ';\n\n';
  }

  // Ticket
  if (data.tickets && data.tickets.length > 0) {
    sql += `-- Dumping data for table Ticket\n`;
    sql += `INSERT INTO Ticket (TicketID, BookingID, IssueDate, ValidityStatus) VALUES\n`;
    sql += data.tickets.map(t => 
      `  (${escapeSqlString(t.TicketID)}, ${escapeSqlString(t.BookingID)}, ${formatSqlDateTime(t.IssueDate)}, ${escapeSqlString(t.ValidityStatus || 'Valid')})`
    ).join(',\n') + ';\n\n';
  }

  // Payment
  if (data.payments && data.payments.length > 0) {
    sql += `-- Dumping data for table Payment\n`;
    sql += `INSERT INTO Payment (PaymentID, BookingID, Amount, Method, TransactionDate) VALUES\n`;
    sql += data.payments.map(p => 
      `  (${escapeSqlString(p.PaymentID)}, ${escapeSqlString(p.BookingID)}, ${parseFloat(p.Amount).toFixed(2)}, ${escapeSqlString(p.Method)}, ${formatSqlDateTime(p.TransactionDate)})`
    ).join(',\n') + ';\n\n';
  }

  // ConcessionItem
  if (data.concessionItems && data.concessionItems.length > 0) {
    sql += `-- Dumping data for table ConcessionItem\n`;
    sql += `INSERT INTO ConcessionItem (ItemID, Name, Category, Price, Inventory) VALUES\n`;
    sql += data.concessionItems.map(item => 
      `  (${escapeSqlString(item.ItemID)}, ${escapeSqlString(item.Name)}, ${escapeSqlString(item.Category)}, ${parseFloat(item.Price).toFixed(2)}, ${Number(item.Inventory)})`
    ).join(',\n') + ';\n\n';
  }

  // ConcessionOrder
  if (data.concessionOrders && data.concessionOrders.length > 0) {
    sql += `-- Dumping data for table ConcessionOrder\n`;
    sql += `INSERT INTO ConcessionOrder (OrderID, BookingID, ItemID, Quantity, TotalPrice) VALUES\n`;
    sql += data.concessionOrders.map(ord => 
      `  (${escapeSqlString(ord.OrderID)}, ${escapeSqlString(ord.BookingID)}, ${escapeSqlString(ord.ItemID)}, ${Number(ord.Quantity)}, ${parseFloat(ord.TotalPrice).toFixed(2)})`
    ).join(',\n') + ';\n\n';
  }

  // Useful analytical query templates for MySQL Workbench
  sql += `-- ========================================================
-- READY-TO-RUN SAMPLE QUERIES FOR MYSQL WORKBENCH
-- ========================================================

-- Query 1: Screening Schedule with Movie Details and Screen Type
-- SELECT s.ScreeningID, m.Title, m.Duration, sc.ScreenID, sc.ScreenType, c.Name AS CinemaName, s.ShowTime, s.Price
-- FROM Screening s
-- JOIN Movie m ON s.MovieID = m.MovieID
-- JOIN Screen sc ON s.ScreenID = sc.ScreenID
-- JOIN Cinema c ON sc.CinemaID = c.CinemaID
-- ORDER BY s.ShowTime;

-- Query 2: Real-time Screening Occupancy and Revenue
-- SELECT s.ScreeningID, m.Title, s.ShowTime,
--   COUNT(DISTINCT bs.SeatID) AS BookedSeats,
--   sc.Capacity,
--   ROUND((COUNT(DISTINCT bs.SeatID) / sc.Capacity) * 100, 2) AS OccupancyPercentage,
--   COALESCE(SUM(p.Amount), 0) AS TotalRevenue
-- FROM Screening s
-- JOIN Movie m ON s.MovieID = m.MovieID
-- JOIN Screen sc ON s.ScreenID = sc.ScreenID
-- LEFT JOIN Booking b ON s.ScreeningID = b.ScreeningID AND b.Status = 'Confirmed'
-- LEFT JOIN BookedSeat bs ON b.BookingID = bs.BookingID
-- LEFT JOIN Payment p ON b.BookingID = p.BookingID
-- GROUP BY s.ScreeningID, m.Title, s.ShowTime, sc.Capacity
-- ORDER BY OccupancyPercentage DESC;

-- Query 3: Top Performing Movies by Gross Revenue
-- SELECT m.Title, m.Genre, COUNT(DISTINCT s.ScreeningID) AS TotalScreenings,
--   COUNT(DISTINCT bs.SeatID) AS TicketsSold,
--   COALESCE(SUM(p.Amount), 0) AS GrossRevenue
-- FROM Movie m
-- LEFT JOIN Screening s ON m.MovieID = s.MovieID
-- LEFT JOIN Booking b ON s.ScreeningID = b.ScreeningID AND b.Status = 'Confirmed'
-- LEFT JOIN BookedSeat bs ON b.BookingID = bs.BookingID
-- LEFT JOIN Payment p ON b.BookingID = p.BookingID
-- GROUP BY m.MovieID, m.Title, m.Genre
-- ORDER BY GrossRevenue DESC;
`;

  return sql;
}

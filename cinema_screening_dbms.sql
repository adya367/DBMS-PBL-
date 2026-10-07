-- ========================================================
-- Cinema Screening and Ticket Booking System DBMS
-- Target Database: MySQL 8.0+ / MySQL Workbench Compatible
-- Generated in real-time from Cinema DBMS Application
-- Last Synchronized: 2026-10-07 16:12:54
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

-- Dumping data for table Cinema
INSERT INTO Cinema (CinemaID, Name, Location, ContactInfo) VALUES
  ('CIN-01', 'Cineplex Central', 'Downtown Plaza, Sector 4', '+1 555-0192'),
  ('CIN-02', 'Metropolis Cinema', 'Grand Galleria, North Avenue', '+1 555-0144');

-- Dumping data for table Screen
INSERT INTO Screen (ScreenID, CinemaID, Capacity, ScreenType) VALUES
  ('SCR-01', 'CIN-01', 16, 'IMAX Laser'),
  ('SCR-02', 'CIN-01', 16, 'Standard Digital'),
  ('SCR-03', 'CIN-02', 16, 'Dolby Cinema'),
  ('SCR-04', 'CIN-02', 16, 'Standard Digital');

-- Dumping data for table Seat
INSERT INTO Seat (SeatID, ScreenID, SeatNumber, SeatType, Status) VALUES
  ('ST-01-A1', 'SCR-01', 'A1', 'Premium', 'Available'),
  ('ST-01-A2', 'SCR-01', 'A2', 'Premium', 'Available'),
  ('ST-01-A3', 'SCR-01', 'A3', 'Premium', 'Available'),
  ('ST-01-A4', 'SCR-01', 'A4', 'Premium', 'Available'),
  ('ST-01-A5', 'SCR-01', 'A5', 'Premium', 'Available'),
  ('ST-01-A6', 'SCR-01', 'A6', 'Premium', 'Available'),
  ('ST-01-A7', 'SCR-01', 'A7', 'Premium', 'Available'),
  ('ST-01-A8', 'SCR-01', 'A8', 'Premium', 'Available'),
  ('ST-01-B1', 'SCR-01', 'B1', 'Standard', 'Available'),
  ('ST-01-B2', 'SCR-01', 'B2', 'Standard', 'Available'),
  ('ST-01-B3', 'SCR-01', 'B3', 'Standard', 'Available'),
  ('ST-01-B4', 'SCR-01', 'B4', 'Standard', 'Available'),
  ('ST-01-B5', 'SCR-01', 'B5', 'Standard', 'Available'),
  ('ST-01-B6', 'SCR-01', 'B6', 'Standard', 'Available'),
  ('ST-01-B7', 'SCR-01', 'B7', 'Standard', 'Available'),
  ('ST-01-B8', 'SCR-01', 'B8', 'Standard', 'Available'),
  ('ST-02-A1', 'SCR-02', 'A1', 'Standard', 'Available'),
  ('ST-02-A2', 'SCR-02', 'A2', 'Standard', 'Available'),
  ('ST-02-A3', 'SCR-02', 'A3', 'Standard', 'Available'),
  ('ST-02-A4', 'SCR-02', 'A4', 'Standard', 'Available'),
  ('ST-02-A5', 'SCR-02', 'A5', 'Standard', 'Available'),
  ('ST-02-A6', 'SCR-02', 'A6', 'Standard', 'Available'),
  ('ST-02-A7', 'SCR-02', 'A7', 'Standard', 'Available'),
  ('ST-02-A8', 'SCR-02', 'A8', 'Standard', 'Available'),
  ('ST-02-B1', 'SCR-02', 'B1', 'Standard', 'Available'),
  ('ST-02-B2', 'SCR-02', 'B2', 'Standard', 'Available'),
  ('ST-02-B3', 'SCR-02', 'B3', 'Standard', 'Available'),
  ('ST-02-B4', 'SCR-02', 'B4', 'Standard', 'Available'),
  ('ST-02-B5', 'SCR-02', 'B5', 'Standard', 'Available'),
  ('ST-02-B6', 'SCR-02', 'B6', 'Standard', 'Available'),
  ('ST-02-B7', 'SCR-02', 'B7', 'Standard', 'Available'),
  ('ST-02-B8', 'SCR-02', 'B8', 'Standard', 'Available'),
  ('ST-03-A1', 'SCR-03', 'A1', 'VIP Recliner', 'Available'),
  ('ST-03-A2', 'SCR-03', 'A2', 'VIP Recliner', 'Available'),
  ('ST-03-A3', 'SCR-03', 'A3', 'VIP Recliner', 'Available'),
  ('ST-03-A4', 'SCR-03', 'A4', 'VIP Recliner', 'Available'),
  ('ST-03-A5', 'SCR-03', 'A5', 'VIP Recliner', 'Available'),
  ('ST-03-A6', 'SCR-03', 'A6', 'VIP Recliner', 'Available'),
  ('ST-03-A7', 'SCR-03', 'A7', 'VIP Recliner', 'Available'),
  ('ST-03-A8', 'SCR-03', 'A8', 'VIP Recliner', 'Available'),
  ('ST-03-B1', 'SCR-03', 'B1', 'VIP Recliner', 'Available'),
  ('ST-03-B2', 'SCR-03', 'B2', 'VIP Recliner', 'Available'),
  ('ST-03-B3', 'SCR-03', 'B3', 'VIP Recliner', 'Available'),
  ('ST-03-B4', 'SCR-03', 'B4', 'VIP Recliner', 'Available'),
  ('ST-03-B5', 'SCR-03', 'B5', 'VIP Recliner', 'Available'),
  ('ST-03-B6', 'SCR-03', 'B6', 'VIP Recliner', 'Available'),
  ('ST-03-B7', 'SCR-03', 'B7', 'VIP Recliner', 'Available'),
  ('ST-03-B8', 'SCR-03', 'B8', 'VIP Recliner', 'Available'),
  ('ST-04-A1', 'SCR-04', 'A1', 'Standard', 'Available'),
  ('ST-04-A2', 'SCR-04', 'A2', 'Standard', 'Available'),
  ('ST-04-A3', 'SCR-04', 'A3', 'Standard', 'Available'),
  ('ST-04-A4', 'SCR-04', 'A4', 'Standard', 'Available'),
  ('ST-04-A5', 'SCR-04', 'A5', 'Standard', 'Available'),
  ('ST-04-A6', 'SCR-04', 'A6', 'Standard', 'Available'),
  ('ST-04-A7', 'SCR-04', 'A7', 'Standard', 'Available'),
  ('ST-04-A8', 'SCR-04', 'A8', 'Standard', 'Available'),
  ('ST-04-B1', 'SCR-04', 'B1', 'Standard', 'Available'),
  ('ST-04-B2', 'SCR-04', 'B2', 'Standard', 'Available'),
  ('ST-04-B3', 'SCR-04', 'B3', 'Standard', 'Available'),
  ('ST-04-B4', 'SCR-04', 'B4', 'Standard', 'Available'),
  ('ST-04-B5', 'SCR-04', 'B5', 'Standard', 'Available'),
  ('ST-04-B6', 'SCR-04', 'B6', 'Standard', 'Available'),
  ('ST-04-B7', 'SCR-04', 'B7', 'Standard', 'Available'),
  ('ST-04-B8', 'SCR-04', 'B8', 'Standard', 'Available');

-- Dumping data for table Movie
INSERT INTO Movie (MovieID, Title, Genre, Duration, ReleaseDate, Rating) VALUES
  ('MOV-01', 'Interstellar', 'Sci-Fi / Adventure', 148, '2026-08-14', 'PG-13'),
  ('MOV-02', 'The Fault in Our Stars', 'Drama / Mystery', 115, '2026-09-02', 'R'),
  ('MOV-03', 'The Dark Knight', 'Action / Thriller', 130, '2026-09-20', 'PG-13'),
  ('MOV-04', 'The Conjuring', 'Horror', 102, '2026-09-25', 'R');

-- Dumping data for table Screening
INSERT INTO Screening (ScreeningID, MovieID, ScreenID, ShowTime, Price) VALUES
  ('SCN-101', 'MOV-01', 'SCR-01', '2026-10-01 14:00:00', 350.00),
  ('SCN-102', 'MOV-01', 'SCR-01', '2026-10-01 18:00:00', 420.00),
  ('SCN-103', 'MOV-02', 'SCR-02', '2026-10-01 15:30:00', 260.00),
  ('SCN-104', 'MOV-03', 'SCR-03', '2026-10-01 17:00:00', 480.00),
  ('SCN-105', 'MOV-04', 'SCR-04', '2026-10-01 20:00:00', 290.00);

-- Dumping data for table Customer
INSERT INTO Customer (CustomerID, Name, Email, Phone, MembershipStatus) VALUES
  ('CUST-01', 'Elena Vance', 'elena.vance@example.com', '+91 98765 43210', 'Gold'),
  ('CUST-02', 'Marcus Sterling', 'm.sterling@example.com', '+91 98123 45678', 'Standard'),
  ('CUST-03', 'Sarah Connor', 's.connor@example.com', '+91 97234 56789', 'Platinum'),
  ('CUST-04', 'David Kim', 'david.kim@example.com', '+91 96345 67890', 'Standard');

-- Dumping data for table Booking
INSERT INTO Booking (BookingID, CustomerID, ScreeningID, BookingDate, Status) VALUES
  ('BKG-001', 'CUST-01', 'SCN-101', '2026-09-30 10:15:00', 'Confirmed'),
  ('BKG-002', 'CUST-02', 'SCN-101', '2026-09-30 11:40:00', 'Confirmed'),
  ('BKG-003', 'CUST-03', 'SCN-104', '2026-09-30 15:20:00', 'Confirmed'),
  ('BKG-004', 'CUST-04', 'SCN-103', '2026-09-29 14:00:00', 'Cancelled');

-- Dumping data for table BookedSeat
INSERT INTO BookedSeat (BookedSeatID, BookingID, SeatID) VALUES
  ('BKS-001', 'BKG-001', 'ST-01-A3'),
  ('BKS-002', 'BKG-001', 'ST-01-A4'),
  ('BKS-003', 'BKG-002', 'ST-01-B1'),
  ('BKS-004', 'BKG-003', 'ST-03-A1'),
  ('BKS-005', 'BKG-003', 'ST-03-A2');

-- Dumping data for table Ticket
INSERT INTO Ticket (TicketID, BookingID, IssueDate, ValidityStatus) VALUES
  ('TCK-001', 'BKG-001', '2026-09-30 10:15:00', 'Valid'),
  ('TCK-002', 'BKG-002', '2026-09-30 11:40:00', 'Valid'),
  ('TCK-003', 'BKG-003', '2026-09-30 15:20:00', 'Valid'),
  ('TCK-004', 'BKG-004', '2026-09-29 14:00:00', 'Cancelled');

-- Dumping data for table Payment
INSERT INTO Payment (PaymentID, BookingID, Amount, Method, TransactionDate) VALUES
  ('PAY-001', 'BKG-001', 1200.00, 'Credit Card', '2026-09-30 10:16:00'),
  ('PAY-002', 'BKG-002', 350.00, 'UPI', '2026-09-30 11:41:00'),
  ('PAY-003', 'BKG-003', 1250.00, 'Debit Card', '2026-09-30 15:21:00'),
  ('PAY-004', 'BKG-004', 260.00, 'UPI', '2026-09-29 14:02:00');

-- Dumping data for table ConcessionItem
INSERT INTO ConcessionItem (ItemID, Name, Category, Price, Inventory) VALUES
  ('CNC-01', 'Standard Popcorn (Salted)', 'Popcorn', 250.00, 85),
  ('CNC-02', 'Gourmet Caramel Popcorn', 'Popcorn', 360.00, 40),
  ('CNC-03', 'Fountain Soda (Large)', 'Beverage', 180.00, 120),
  ('CNC-04', 'Mineral Water (500ml)', 'Beverage', 60.00, 160),
  ('CNC-05', 'Nachos with Warm Cheese', 'Snacks', 290.00, 52);

-- Dumping data for table ConcessionOrder
INSERT INTO ConcessionOrder (OrderID, BookingID, ItemID, Quantity, TotalPrice) VALUES
  ('ORD-01', 'BKG-001', 'CNC-01', 2, 500.00),
  ('ORD-02', 'BKG-003', 'CNC-05', 1, 290.00);

-- ========================================================
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

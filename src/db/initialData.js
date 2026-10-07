// Seed data strictly matching the 10 Principal Entities from the source material
// Reference: Cinema-Screening-and-Ticket-Booking-System.pdf

export const initialData = {
  cinemas: [
    {
      CinemaID: "CIN-01",
      Name: "Cineplex Central",
      Location: "Downtown Plaza, Sector 4",
      ContactInfo: "+1 555-0192"
    },
    {
      CinemaID: "CIN-02",
      Name: "Metropolis Cinema",
      Location: "Grand Galleria, North Avenue",
      ContactInfo: "+1 555-0144"
    }
  ],

  screens: [
    {
      ScreenID: "SCR-01",
      CinemaID: "CIN-01",
      Capacity: 16,
      ScreenType: "IMAX Laser"
    },
    {
      ScreenID: "SCR-02",
      CinemaID: "CIN-01",
      Capacity: 16,
      ScreenType: "Standard Digital"
    },
    {
      ScreenID: "SCR-03",
      CinemaID: "CIN-02",
      Capacity: 16,
      ScreenType: "Dolby Cinema"
    },
    {
      ScreenID: "SCR-04",
      CinemaID: "CIN-02",
      Capacity: 16,
      ScreenType: "Standard Digital"
    }
  ],

  // Seats generated for each screen (rows A & B, seats 1 to 8 each = 16 seats per screen)
  seats: [
    // SCR-01
    { SeatID: "ST-01-A1", ScreenID: "SCR-01", SeatNumber: "A1", SeatType: "Premium", Status: "Available" },
    { SeatID: "ST-01-A2", ScreenID: "SCR-01", SeatNumber: "A2", SeatType: "Premium", Status: "Available" },
    { SeatID: "ST-01-A3", ScreenID: "SCR-01", SeatNumber: "A3", SeatType: "Premium", Status: "Available" },
    { SeatID: "ST-01-A4", ScreenID: "SCR-01", SeatNumber: "A4", SeatType: "Premium", Status: "Available" },
    { SeatID: "ST-01-A5", ScreenID: "SCR-01", SeatNumber: "A5", SeatType: "Premium", Status: "Available" },
    { SeatID: "ST-01-A6", ScreenID: "SCR-01", SeatNumber: "A6", SeatType: "Premium", Status: "Available" },
    { SeatID: "ST-01-A7", ScreenID: "SCR-01", SeatNumber: "A7", SeatType: "Premium", Status: "Available" },
    { SeatID: "ST-01-A8", ScreenID: "SCR-01", SeatNumber: "A8", SeatType: "Premium", Status: "Available" },
    { SeatID: "ST-01-B1", ScreenID: "SCR-01", SeatNumber: "B1", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-01-B2", ScreenID: "SCR-01", SeatNumber: "B2", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-01-B3", ScreenID: "SCR-01", SeatNumber: "B3", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-01-B4", ScreenID: "SCR-01", SeatNumber: "B4", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-01-B5", ScreenID: "SCR-01", SeatNumber: "B5", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-01-B6", ScreenID: "SCR-01", SeatNumber: "B6", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-01-B7", ScreenID: "SCR-01", SeatNumber: "B7", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-01-B8", ScreenID: "SCR-01", SeatNumber: "B8", SeatType: "Standard", Status: "Available" },

    // SCR-02
    { SeatID: "ST-02-A1", ScreenID: "SCR-02", SeatNumber: "A1", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-02-A2", ScreenID: "SCR-02", SeatNumber: "A2", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-02-A3", ScreenID: "SCR-02", SeatNumber: "A3", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-02-A4", ScreenID: "SCR-02", SeatNumber: "A4", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-02-A5", ScreenID: "SCR-02", SeatNumber: "A5", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-02-A6", ScreenID: "SCR-02", SeatNumber: "A6", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-02-A7", ScreenID: "SCR-02", SeatNumber: "A7", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-02-A8", ScreenID: "SCR-02", SeatNumber: "A8", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-02-B1", ScreenID: "SCR-02", SeatNumber: "B1", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-02-B2", ScreenID: "SCR-02", SeatNumber: "B2", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-02-B3", ScreenID: "SCR-02", SeatNumber: "B3", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-02-B4", ScreenID: "SCR-02", SeatNumber: "B4", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-02-B5", ScreenID: "SCR-02", SeatNumber: "B5", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-02-B6", ScreenID: "SCR-02", SeatNumber: "B6", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-02-B7", ScreenID: "SCR-02", SeatNumber: "B7", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-02-B8", ScreenID: "SCR-02", SeatNumber: "B8", SeatType: "Standard", Status: "Available" },

    // SCR-03
    { SeatID: "ST-03-A1", ScreenID: "SCR-03", SeatNumber: "A1", SeatType: "VIP Recliner", Status: "Available" },
    { SeatID: "ST-03-A2", ScreenID: "SCR-03", SeatNumber: "A2", SeatType: "VIP Recliner", Status: "Available" },
    { SeatID: "ST-03-A3", ScreenID: "SCR-03", SeatNumber: "A3", SeatType: "VIP Recliner", Status: "Available" },
    { SeatID: "ST-03-A4", ScreenID: "SCR-03", SeatNumber: "A4", SeatType: "VIP Recliner", Status: "Available" },
    { SeatID: "ST-03-A5", ScreenID: "SCR-03", SeatNumber: "A5", SeatType: "VIP Recliner", Status: "Available" },
    { SeatID: "ST-03-A6", ScreenID: "SCR-03", SeatNumber: "A6", SeatType: "VIP Recliner", Status: "Available" },
    { SeatID: "ST-03-A7", ScreenID: "SCR-03", SeatNumber: "A7", SeatType: "VIP Recliner", Status: "Available" },
    { SeatID: "ST-03-A8", ScreenID: "SCR-03", SeatNumber: "A8", SeatType: "VIP Recliner", Status: "Available" },
    { SeatID: "ST-03-B1", ScreenID: "SCR-03", SeatNumber: "B1", SeatType: "VIP Recliner", Status: "Available" },
    { SeatID: "ST-03-B2", ScreenID: "SCR-03", SeatNumber: "B2", SeatType: "VIP Recliner", Status: "Available" },
    { SeatID: "ST-03-B3", ScreenID: "SCR-03", SeatNumber: "B3", SeatType: "VIP Recliner", Status: "Available" },
    { SeatID: "ST-03-B4", ScreenID: "SCR-03", SeatNumber: "B4", SeatType: "VIP Recliner", Status: "Available" },
    { SeatID: "ST-03-B5", ScreenID: "SCR-03", SeatNumber: "B5", SeatType: "VIP Recliner", Status: "Available" },
    { SeatID: "ST-03-B6", ScreenID: "SCR-03", SeatNumber: "B6", SeatType: "VIP Recliner", Status: "Available" },
    { SeatID: "ST-03-B7", ScreenID: "SCR-03", SeatNumber: "B7", SeatType: "VIP Recliner", Status: "Available" },
    { SeatID: "ST-03-B8", ScreenID: "SCR-03", SeatNumber: "B8", SeatType: "VIP Recliner", Status: "Available" },

    // SCR-04
    { SeatID: "ST-04-A1", ScreenID: "SCR-04", SeatNumber: "A1", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-04-A2", ScreenID: "SCR-04", SeatNumber: "A2", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-04-A3", ScreenID: "SCR-04", SeatNumber: "A3", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-04-A4", ScreenID: "SCR-04", SeatNumber: "A4", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-04-A5", ScreenID: "SCR-04", SeatNumber: "A5", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-04-A6", ScreenID: "SCR-04", SeatNumber: "A6", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-04-A7", ScreenID: "SCR-04", SeatNumber: "A7", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-04-A8", ScreenID: "SCR-04", SeatNumber: "A8", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-04-B1", ScreenID: "SCR-04", SeatNumber: "B1", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-04-B2", ScreenID: "SCR-04", SeatNumber: "B2", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-04-B3", ScreenID: "SCR-04", SeatNumber: "B3", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-04-B4", ScreenID: "SCR-04", SeatNumber: "B4", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-04-B5", ScreenID: "SCR-04", SeatNumber: "B5", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-04-B6", ScreenID: "SCR-04", SeatNumber: "B6", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-04-B7", ScreenID: "SCR-04", SeatNumber: "B7", SeatType: "Standard", Status: "Available" },
    { SeatID: "ST-04-B8", ScreenID: "SCR-04", SeatNumber: "B8", SeatType: "Standard", Status: "Available" }
  ],

  movies: [
    {
      MovieID: "MOV-01",
      Title: "Interstellar Odyssey",
      Genre: "Sci-Fi / Adventure",
      Duration: 148,
      ReleaseDate: "2026-08-14",
      Rating: "PG-13"
    },
    {
      MovieID: "MOV-02",
      Title: "Echoes of the Past",
      Genre: "Drama / Mystery",
      Duration: 115,
      ReleaseDate: "2026-09-02",
      Rating: "R"
    },
    {
      MovieID: "MOV-03",
      Title: "Neon Skyline",
      Genre: "Action / Thriller",
      Duration: 130,
      ReleaseDate: "2026-09-20",
      Rating: "PG-13"
    },
    {
      MovieID: "MOV-04",
      Title: "The Whispering Pines",
      Genre: "Horror",
      Duration: 102,
      ReleaseDate: "2026-09-25",
      Rating: "R"
    }
  ],

  screenings: [
    {
      ScreeningID: "SCN-101",
      MovieID: "MOV-01",
      ScreenID: "SCR-01",
      ShowTime: "2026-10-01T14:00",
      Price: 350.00
    },
    {
      ScreeningID: "SCN-102",
      MovieID: "MOV-01",
      ScreenID: "SCR-01",
      ShowTime: "2026-10-01T18:00",
      Price: 420.00
    },
    {
      ScreeningID: "SCN-103",
      MovieID: "MOV-02",
      ScreenID: "SCR-02",
      ShowTime: "2026-10-01T15:30",
      Price: 260.00
    },
    {
      ScreeningID: "SCN-104",
      MovieID: "MOV-03",
      ScreenID: "SCR-03",
      ShowTime: "2026-10-01T17:00",
      Price: 480.00
    },
    {
      ScreeningID: "SCN-105",
      MovieID: "MOV-04",
      ScreenID: "SCR-04",
      ShowTime: "2026-10-01T20:00",
      Price: 290.00
    }
  ],

  customers: [
    {
      CustomerID: "CUST-01",
      Name: "Elena Vance",
      Email: "elena.vance@example.com",
      Phone: "+91 98765 43210",
      MembershipStatus: "Gold"
    },
    {
      CustomerID: "CUST-02",
      Name: "Marcus Sterling",
      Email: "m.sterling@example.com",
      Phone: "+91 98123 45678",
      MembershipStatus: "Standard"
    },
    {
      CustomerID: "CUST-03",
      Name: "Sarah Connor",
      Email: "s.connor@example.com",
      Phone: "+91 97234 56789",
      MembershipStatus: "Platinum"
    },
    {
      CustomerID: "CUST-04",
      Name: "David Kim",
      Email: "david.kim@example.com",
      Phone: "+91 96345 67890",
      MembershipStatus: "Standard"
    }
  ],

  bookings: [
    {
      BookingID: "BKG-001",
      CustomerID: "CUST-01",
      ScreeningID: "SCN-101",
      BookingDate: "2026-09-30T10:15",
      Status: "Confirmed"
    },
    {
      BookingID: "BKG-002",
      CustomerID: "CUST-02",
      ScreeningID: "SCN-101",
      BookingDate: "2026-09-30T11:40",
      Status: "Confirmed"
    },
    {
      BookingID: "BKG-003",
      CustomerID: "CUST-03",
      ScreeningID: "SCN-104",
      BookingDate: "2026-09-30T15:20",
      Status: "Confirmed"
    },
    {
      BookingID: "BKG-004",
      CustomerID: "CUST-04",
      ScreeningID: "SCN-103",
      BookingDate: "2026-09-29T14:00",
      Status: "Cancelled"
    }
  ],

  // BookedSeat: enforces one seat per screening rule
  bookedSeats: [
    {
      BookedSeatID: "BKS-001",
      BookingID: "BKG-001",
      SeatID: "ST-01-A3"
    },
    {
      BookedSeatID: "BKS-002",
      BookingID: "BKG-001",
      SeatID: "ST-01-A4"
    },
    {
      BookedSeatID: "BKS-003",
      BookingID: "BKG-002",
      SeatID: "ST-01-B1"
    },
    {
      BookedSeatID: "BKS-004",
      BookingID: "BKG-003",
      SeatID: "ST-03-A1"
    },
    {
      BookedSeatID: "BKS-005",
      BookingID: "BKG-003",
      SeatID: "ST-03-A2"
    }
  ],

  // Tickets generated per booking
  tickets: [
    {
      TicketID: "TCK-001",
      BookingID: "BKG-001",
      IssueDate: "2026-09-30T10:15",
      ValidityStatus: "Valid"
    },
    {
      TicketID: "TCK-002",
      BookingID: "BKG-002",
      IssueDate: "2026-09-30T11:40",
      ValidityStatus: "Valid"
    },
    {
      TicketID: "TCK-003",
      BookingID: "BKG-003",
      IssueDate: "2026-09-30T15:20",
      ValidityStatus: "Valid"
    },
    {
      TicketID: "TCK-004",
      BookingID: "BKG-004",
      IssueDate: "2026-09-29T14:00",
      ValidityStatus: "Cancelled"
    }
  ],

  // Payments: 1:1 with Booking
  payments: [
    {
      PaymentID: "PAY-001",
      BookingID: "BKG-001",
      Amount: 1200.00,
      Method: "Credit Card",
      TransactionDate: "2026-09-30T10:16"
    },
    {
      PaymentID: "PAY-002",
      BookingID: "BKG-002",
      Amount: 350.00,
      Method: "UPI",
      TransactionDate: "2026-09-30T11:41"
    },
    {
      PaymentID: "PAY-003",
      BookingID: "BKG-003",
      Amount: 1250.00,
      Method: "Debit Card",
      TransactionDate: "2026-09-30T15:21"
    },
    {
      PaymentID: "PAY-004",
      BookingID: "BKG-004",
      Amount: 260.00,
      Method: "UPI",
      TransactionDate: "2026-09-29T14:02"
    }
  ],

  // Concession sales items & inventory (PDF Functional Requirement 4: Concession Sales)
  concessionItems: [
    { ItemID: "CNC-01", Name: "Standard Popcorn (Salted)", Category: "Popcorn", Price: 250.00, Inventory: 85 },
    { ItemID: "CNC-02", Name: "Gourmet Caramel Popcorn", Category: "Popcorn", Price: 360.00, Inventory: 40 },
    { ItemID: "CNC-03", Name: "Fountain Soda (Large)", Category: "Beverage", Price: 180.00, Inventory: 120 },
    { ItemID: "CNC-04", Name: "Mineral Water (500ml)", Category: "Beverage", Price: 60.00, Inventory: 160 },
    { ItemID: "CNC-05", Name: "Nachos with Warm Cheese", Category: "Snacks", Price: 290.00, Inventory: 52 }
  ],

  concessionOrders: [
    { OrderID: "ORD-01", BookingID: "BKG-001", ItemID: "CNC-01", Quantity: 2, TotalPrice: 500.00 },
    { OrderID: "ORD-02", BookingID: "BKG-003", ItemID: "CNC-05", Quantity: 1, TotalPrice: 290.00 }
  ]
};

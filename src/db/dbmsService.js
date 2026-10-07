import { initialData } from './initialData';
import { generateMySQLDump } from './sqlDumpGenerator';
import { parseSqlDump } from './sqlParser';

const STORAGE_KEY = 'cinema_screening_dbms_data_inr_v2';

class DBMSService {
  constructor() {
    this.syncListeners = new Set();
    this.dataChangeListeners = new Set();
    this.isLoadedFromSql = false;
    this.data = this.loadData();

    // Asynchronously fetch current SQL file from server to ensure 100% data fidelity with cinema_screening_dbms.sql
    this.initFromSqlFile();

    // Auto-reload when cinema_screening_dbms.sql is modified externally (e.g., in Workbench or editor)
    if (import.meta.hot) {
      import.meta.hot.on('sql-file-changed', () => {
        console.log('[DBMS] External modification to cinema_screening_dbms.sql detected. Pulling changes...');
        this.reloadFromSqlFile();
      });
    }
  }


  onDataChange(callback) {
    this.dataChangeListeners.add(callback);
    return () => this.dataChangeListeners.delete(callback);
  }

  notifyDataChange() {
    this.dataChangeListeners.forEach(cb => {
      try {
        cb(this.data);
      } catch {
        // ignore
      }
    });
  }

  onSyncChange(callback) {
    this.syncListeners.add(callback);
    return () => this.syncListeners.delete(callback);
  }

  notifySyncStatus(status) {
    this.syncListeners.forEach(cb => {
      try {
        cb(status);
      } catch {
        // ignore listener errors
      }
    });
  }

  async initFromSqlFile() {
    try {
      const res = await fetch('/api/sql');
      if (res.ok) {
        const json = await res.json();
        if (json.exists && json.content) {
          const parsed = parseSqlDump(json.content);
          if (parsed.movies && parsed.movies.length > 0) {
            this.data = parsed;
            this.isLoadedFromSql = true;
            this.notifyDataChange();
            this.notifySyncStatus({ status: 'synced', timestamp: new Date(), source: 'sql_file' });
            return;
          }
        }
      }
    } catch (err) {
      console.warn('Initial SQL fetch not available, falling back to local state:', err.message);
    }
    // If SQL file wasn't loaded from server yet, synchronize current state
    this.syncSqlFile();
  }

  async syncSqlFile() {
    try {
      const sql = generateMySQLDump(this.data);
      this.lastGeneratedSql = sql;
      this.notifySyncStatus({ status: 'syncing', timestamp: new Date() });

      const res = await fetch('/api/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql })
      });
      if (res.ok) {
        this.notifySyncStatus({ status: 'synced', timestamp: new Date(), length: sql.length });
      } else {
        this.notifySyncStatus({ status: 'error', error: `Server status: ${res.status}` });
      }
    } catch (err) {
      // In offline / preview / static mode, log warning but keep state consistent
      console.warn('Real-time SQL sync server endpoint not reachable:', err.message);
      this.notifySyncStatus({ status: 'offline', error: err.message });
    }
  }

  getSqlDump() {
    return generateMySQLDump(this.data);
  }

  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback if localStorage unavailable
    }
    return JSON.parse(JSON.stringify(initialData));
  }

  saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Handle storage quota if needed
    }
    this.notifyDataChange();
    // Real-time synchronization to cinema_screening_dbms.sql
    this.syncSqlFile();
  }

  async reloadFromSqlFile() {
    try {
      const res = await fetch('/api/sql');
      if (res.ok) {
        const json = await res.json();
        if (json.content) {
          const parsed = parseSqlDump(json.content);
          if (parsed.movies && parsed.movies.length > 0) {
            this.data = parsed;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            this.notifyDataChange();
            this.notifySyncStatus({ status: 'synced', timestamp: new Date(), source: 'reloaded_from_sql' });
            return { success: true };
          }
        }
      }
    } catch (err) {
      throw new Error(`Failed to reload from SQL: ${err.message}`);
    }
    return { success: false };
  }

  async resetDatabase() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      const res = await fetch('/api/sql');
      if (res.ok) {
        const json = await res.json();
        if (json.content) {
          const parsed = parseSqlDump(json.content);
          if (parsed.movies && parsed.movies.length > 0) {
            this.data = parsed;
            this.saveData();
            this.notifyDataChange();
            return this.data;
          }
        }
      }
    } catch (err) {
      console.warn('Could not reset strictly from /api/sql, using fallback:', err.message);
    }
    this.data = JSON.parse(JSON.stringify(initialData));
    this.saveData();
    this.notifyDataChange();
    return this.data;
  }




  // --- ENTITY GETTERS ---
  getCinemas() { return this.data.cinemas; }
  getScreens() { return this.data.screens; }
  getSeats(screenId = null) {
    if (screenId) {
      return this.data.seats.filter(s => s.ScreenID === screenId);
    }
    return this.data.seats;
  }
  getMovies() { return this.data.movies; }
  getScreenings() { return this.data.screenings; }
  getCustomers() { return this.data.customers; }
  getBookings() { return this.data.bookings; }
  getBookedSeats() { return this.data.bookedSeats; }
  getTickets() { return this.data.tickets; }
  getPayments() { return this.data.payments; }
  getConcessionItems() { return this.data.concessionItems; }
  getConcessionOrders() { return this.data.concessionOrders; }

  // --- BUSINESS RULE 1: SHOW SCHEDULING (NO SCREEN OVERLAP) ---
  // PDF Functional Requirement: "Show Scheduling: No screen overlap; real-time seat availability tracking per screening"
  validateScreeningOverlap(newScreening, excludeScreeningId = null) {
    const movie = this.data.movies.find(m => m.MovieID === newScreening.MovieID);
    if (!movie) {
      throw new Error(`Integrity Error: MovieID '${newScreening.MovieID}' does not exist.`);
    }

    const newStart = new Date(newScreening.ShowTime).getTime();
    // Duration in ms, plus 15 minutes clean-up/prep buffer
    const durationMs = (movie.Duration + 15) * 60 * 1000;
    const newEnd = newStart + durationMs;

    const screenScreenings = this.data.screenings.filter(s => 
      s.ScreenID === newScreening.ScreenID && s.ScreeningID !== excludeScreeningId
    );

    for (const existing of screenScreenings) {
      const existingMovie = this.data.movies.find(m => m.MovieID === existing.MovieID);
      const existingStart = new Date(existing.ShowTime).getTime();
      const existingEnd = existingStart + ((existingMovie?.Duration || 120) + 15) * 60 * 1000;

      // Overlap condition: startA < endB && startB < endA
      if (newStart < existingEnd && existingStart < newEnd) {
        const overlapStart = new Date(existingStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const overlapEnd = new Date(existingEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        throw new Error(
          `Schedule Overlap Conflict: Screen ${newScreening.ScreenID} is already booked by '${existingMovie?.Title}' from ${overlapStart} to ${overlapEnd}.`
        );
      }
    }

    return true;
  }

  addScreening(screeningData) {
    const newId = `SCN-${Date.now().toString().slice(-4)}`;
    const record = {
      ScreeningID: newId,
      MovieID: screeningData.MovieID,
      ScreenID: screeningData.ScreenID,
      ShowTime: screeningData.ShowTime,
      Price: parseFloat(screeningData.Price)
    };

    // Verify constraints
    this.validateScreeningOverlap(record);

    this.data.screenings.push(record);
    this.saveData();
    return record;
  }

  deleteScreening(screeningId) {
    // Check foreign key constraint in bookings
    const hasBookings = this.data.bookings.some(b => b.ScreeningID === screeningId && b.Status === 'Confirmed');
    if (hasBookings) {
      throw new Error(`Referential Integrity Violation: Cannot delete Screening '${screeningId}' because active bookings exist.`);
    }

    this.data.screenings = this.data.screenings.filter(s => s.ScreeningID !== screeningId);
    this.saveData();
    return true;
  }

  // --- REAL-TIME SEAT AVAILABILITY ---
  getScreeningSeatAvailability(screeningId) {
    const screening = this.data.screenings.find(s => s.ScreeningID === screeningId);
    if (!screening) return null;

    const screenSeats = this.data.seats.filter(s => s.ScreenID === screening.ScreenID);
    
    // Find confirmed bookings for this screening
    const confirmedBookingIds = this.data.bookings
      .filter(b => b.ScreeningID === screeningId && b.Status === 'Confirmed')
      .map(b => b.BookingID);

    // Reserved seat IDs
    const occupiedSeatIds = new Set(
      this.data.bookedSeats
        .filter(bs => confirmedBookingIds.includes(bs.BookingID))
        .map(bs => bs.SeatID)
    );

    const seatStatusList = screenSeats.map(seat => ({
      ...seat,
      isOccupied: occupiedSeatIds.has(seat.SeatID)
    }));

    return {
      screening,
      totalCapacity: screenSeats.length,
      bookedCount: occupiedSeatIds.size,
      availableCount: screenSeats.length - occupiedSeatIds.size,
      seats: seatStatusList
    };
  }

  // --- BUSINESS RULE 2: BOOKING MANAGEMENT (ONE-SEAT-PER-SCREENING) & PAYMENT 1:1 ---
  createBooking({ customerId, screeningId, seatIds, paymentMethod, concessionOrders = [] }) {
    if (!seatIds || seatIds.length === 0) {
      throw new Error("Validation Error: At least one seat must be selected.");
    }

    const screening = this.data.screenings.find(s => s.ScreeningID === screeningId);
    if (!screening) throw new Error("Integrity Error: Screening not found.");

    const customer = this.data.customers.find(c => c.CustomerID === customerId);
    if (!customer) throw new Error("Integrity Error: Customer not found.");

    // Check one-seat-per-screening rule
    const activeBookingIds = this.data.bookings
      .filter(b => b.ScreeningID === screeningId && b.Status === 'Confirmed')
      .map(b => b.BookingID);

    const alreadyBookedSeatIds = this.data.bookedSeats
      .filter(bs => activeBookingIds.includes(bs.BookingID))
      .map(bs => bs.SeatID);

    for (const seatId of seatIds) {
      if (alreadyBookedSeatIds.includes(seatId)) {
        const seatObj = this.data.seats.find(s => s.SeatID === seatId);
        throw new Error(`Double-Booking Prevented: Seat ${seatObj?.SeatNumber || seatId} is already reserved for this screening.`);
      }
    }

    // Verify Concession Inventory if ordered
    for (const ord of concessionOrders) {
      const item = this.data.concessionItems.find(i => i.ItemID === ord.itemId);
      if (!item || item.Inventory < ord.quantity) {
        throw new Error(`Inventory Constraint: Item '${item?.Name || ord.itemId}' has insufficient stock.`);
      }
    }

    // Atomic transaction execution
    const bookingId = `BKG-${Date.now().toString().slice(-4)}`;
    const nowIso = new Date().toISOString().slice(0, 16);

    // 1. Create Booking
    const newBooking = {
      BookingID: bookingId,
      CustomerID: customerId,
      ScreeningID: screeningId,
      BookingDate: nowIso,
      Status: "Confirmed"
    };

    // 2. Create BookedSeats (1:M)
    const newBookedSeats = seatIds.map((sId, idx) => ({
      BookedSeatID: `BKS-${Date.now().toString().slice(-4)}${idx}`,
      BookingID: bookingId,
      SeatID: sId
    }));

    // 3. Create Ticket (1:M / 1:1 per booking confirmation)
    const ticketId = `TCK-${Date.now().toString().slice(-4)}`;
    const newTicket = {
      TicketID: ticketId,
      BookingID: bookingId,
      IssueDate: nowIso,
      ValidityStatus: "Valid"
    };

    // Calculate total amount
    const ticketTotal = seatIds.length * screening.Price;
    let concessionTotal = 0;
    const newConcessionOrders = [];

    for (const ord of concessionOrders) {
      const item = this.data.concessionItems.find(i => i.ItemID === ord.itemId);
      item.Inventory -= ord.quantity;
      const orderTotal = ord.quantity * item.Price;
      concessionTotal += orderTotal;
      newConcessionOrders.push({
        OrderID: `ORD-${Date.now().toString().slice(-4)}${newConcessionOrders.length}`,
        BookingID: bookingId,
        ItemID: ord.itemId,
        Quantity: ord.quantity,
        TotalPrice: orderTotal
      });
    }

    const grandTotal = ticketTotal + concessionTotal;

    // 4. Create Payment (1:1 with Booking)
    const paymentId = `PAY-${Date.now().toString().slice(-4)}`;
    const newPayment = {
      PaymentID: paymentId,
      BookingID: bookingId,
      Amount: parseFloat(grandTotal.toFixed(2)),
      Method: paymentMethod || "Credit Card",
      TransactionDate: nowIso
    };

    // Commit to database
    this.data.bookings.push(newBooking);
    this.data.bookedSeats.push(...newBookedSeats);
    this.data.tickets.push(newTicket);
    this.data.payments.push(newPayment);
    if (newConcessionOrders.length > 0) {
      this.data.concessionOrders.push(...newConcessionOrders);
    }

    this.saveData();

    return {
      booking: newBooking,
      ticket: newTicket,
      payment: newPayment,
      bookedSeats: newBookedSeats
    };
  }

  // --- STRUCTURED CANCELLATION & REFUND POLICY ---
  // PDF Functional Requirement: "structured cancellation policies... refund limits enforced at DB level"
  cancelBooking(bookingId) {
    const booking = this.data.bookings.find(b => b.BookingID === bookingId);
    if (!booking) throw new Error("Integrity Error: Booking not found.");

    if (booking.Status === "Cancelled") {
      throw new Error("Business Rule: Booking is already cancelled.");
    }

    // Update Booking status
    booking.Status = "Cancelled";

    // Update Ticket validity status
    const tickets = this.data.tickets.filter(t => t.BookingID === bookingId);
    tickets.forEach(t => {
      t.ValidityStatus = "Cancelled";
    });

    // Release BookedSeats (remove from bookedSeats to allow re-booking as per seat availability rule)
    this.data.bookedSeats = this.data.bookedSeats.filter(bs => bs.BookingID !== bookingId);

    // Refund policy: Payment amount is updated or logged with refund indicator
    const payment = this.data.payments.find(p => p.BookingID === bookingId);
    if (payment) {
      payment.Method = `${payment.Method} (Refunded)`;
    }

    this.saveData();
    return { success: true, message: `Booking ${bookingId} cancelled and refund processed.` };
  }

  // --- REPORTING MODULE (PDF Functional Requirement 5) ---
  // "Occupancy rates, movie performance, screen utilization, and revenue analytics"
  getReportingAnalytics() {
    const confirmedBookings = this.data.bookings.filter(b => b.Status === 'Confirmed');
    const confirmedBookingIds = confirmedBookings.map(b => b.BookingID);

    // 1. Revenue Analytics
    const totalTicketRevenue = this.data.payments
      .filter(p => confirmedBookingIds.includes(p.BookingID))
      .reduce((sum, p) => sum + p.Amount, 0);

    const concessionRevenue = this.data.concessionOrders
      .filter(o => confirmedBookingIds.includes(o.BookingID))
      .reduce((sum, o) => sum + o.TotalPrice, 0);

    // Payment methods breakdown
    const paymentMethods = {};
    this.data.payments.forEach(p => {
      const cleanMethod = p.Method.replace(' (Refunded)', '');
      paymentMethods[cleanMethod] = (paymentMethods[cleanMethod] || 0) + p.Amount;
    });

    // 2. Occupancy Rates
    const screeningOccupancy = this.data.screenings.map(scn => {
      const movie = this.data.movies.find(m => m.MovieID === scn.MovieID);
      const screen = this.data.screens.find(s => s.ScreenID === scn.ScreenID);
      const availability = this.getScreeningSeatAvailability(scn.ScreeningID);
      const rate = availability ? ((availability.bookedCount / availability.totalCapacity) * 100).toFixed(1) : 0;
      return {
        ScreeningID: scn.ScreeningID,
        MovieTitle: movie?.Title || scn.MovieID,
        ScreenID: scn.ScreenID,
        ShowTime: scn.ShowTime,
        Capacity: availability?.totalCapacity || screen?.Capacity || 0,
        BookedSeats: availability?.bookedCount || 0,
        OccupancyRate: parseFloat(rate)
      };
    });

    const averageOccupancy = screeningOccupancy.length > 0 
      ? (screeningOccupancy.reduce((acc, curr) => acc + curr.OccupancyRate, 0) / screeningOccupancy.length).toFixed(1)
      : 0;

    // 3. Movie Performance (Tickets sold, revenue generated)
    const moviePerformance = this.data.movies.map(movie => {
      const movieScreenings = this.data.screenings.filter(s => s.MovieID === movie.MovieID);
      const movieScreeningIds = movieScreenings.map(s => s.ScreeningID);
      
      const movieBookings = confirmedBookings.filter(b => movieScreeningIds.includes(b.ScreeningID));
      const movieBookingIds = movieBookings.map(b => b.BookingID);
      
      const ticketsSold = this.data.bookedSeats.filter(bs => movieBookingIds.includes(bs.BookingID)).length;
      
      const grossRevenue = this.data.payments
        .filter(p => movieBookingIds.includes(p.BookingID))
        .reduce((sum, p) => sum + p.Amount, 0);

      return {
        MovieID: movie.MovieID,
        Title: movie.Title,
        Genre: movie.Genre,
        ScreeningsCount: movieScreenings.length,
        TicketsSold: ticketsSold,
        GrossRevenue: grossRevenue
      };
    });

    // 4. Screen Utilization
    const screenUtilization = this.data.screens.map(screen => {
      const cinema = this.data.cinemas.find(c => c.CinemaID === screen.CinemaID);
      const screenScreenings = this.data.screenings.filter(s => s.ScreenID === screen.ScreenID);
      
      let totalMinutesScheduled = 0;
      screenScreenings.forEach(scn => {
        const m = this.data.movies.find(mov => mov.MovieID === scn.MovieID);
        totalMinutesScheduled += (m?.Duration || 120);
      });

      return {
        ScreenID: screen.ScreenID,
        ScreenType: screen.ScreenType,
        CinemaName: cinema?.Name || screen.CinemaID,
        ScreeningsCount: screenScreenings.length,
        TotalMinutesScheduled: totalMinutesScheduled,
        UtilizationHours: (totalMinutesScheduled / 60).toFixed(1)
      };
    });

    return {
      totalRevenue: totalTicketRevenue,
      concessionRevenue,
      averageOccupancy: parseFloat(averageOccupancy),
      totalBookings: this.data.bookings.length,
      confirmedBookingsCount: confirmedBookings.length,
      screeningOccupancy,
      moviePerformance,
      screenUtilization,
      paymentMethods
    };
  }

  // --- CRUD HELPERS FOR OTHER ENTITIES ---
  addMovie(movieData) {
    const newId = `MOV-${Date.now().toString().slice(-4)}`;
    const record = {
      MovieID: newId,
      Title: movieData.Title,
      Genre: movieData.Genre,
      Duration: parseInt(movieData.Duration, 10),
      ReleaseDate: movieData.ReleaseDate,
      Rating: movieData.Rating
    };
    this.data.movies.push(record);
    this.saveData();
    return record;
  }

  addCustomer(customerData) {
    const newId = `CUST-${Date.now().toString().slice(-4)}`;
    const record = {
      CustomerID: newId,
      Name: customerData.Name,
      Email: customerData.Email,
      Phone: customerData.Phone,
      MembershipStatus: customerData.MembershipStatus || "Standard"
    };
    this.data.customers.push(record);
    this.saveData();
    return record;
  }
}

export const dbms = new DBMSService();

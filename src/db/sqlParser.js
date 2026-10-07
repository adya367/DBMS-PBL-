/**
 * Parses MySQL DML (INSERT INTO) statements from cinema_screening_dbms.sql
 * and reconstructs the in-memory database records.
 */

function parseSqlValuesList(valuesBlock) {
  const rows = [];
  let i = 0;
  const n = valuesBlock.length;

  while (i < n) {
    // Find opening '(' for a row tuple
    while (i < n && valuesBlock[i] !== '(') {
      i++;
    }
    if (i >= n) break;
    i++; // step inside '('

    const values = [];
    let curVal = '';
    let inQuotes = false;
    let escape = false;

    while (i < n) {
      const char = valuesBlock[i];

      if (inQuotes) {
        if (char === '\\' && !escape) {
          escape = true;
          i++;
          continue;
        }
        if (escape) {
          curVal += char;
          escape = false;
          i++;
          continue;
        }
        if (char === "'") {
          // Check for escaped single quote ''
          if (i + 1 < n && valuesBlock[i + 1] === "'") {
            curVal += "'";
            i += 2;
            continue;
          }
          inQuotes = false;
          i++;
          continue;
        }
        curVal += char;
        i++;
      } else {
        if (char === "'") {
          inQuotes = true;
          i++;
          continue;
        }
        if (char === ',') {
          values.push(cleanParsedValue(curVal));
          curVal = '';
          i++;
          continue;
        }
        if (char === ')') {
          values.push(cleanParsedValue(curVal));
          curVal = '';
          i++; // skip ')'
          break;
        }
        curVal += char;
        i++;
      }
    }

    if (values.length > 0) {
      rows.push(values);
    }
  }

  return rows;
}

function cleanParsedValue(val) {
  const trimmed = val.trim();
  if (trimmed === 'NULL') return null;
  if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);
  return trimmed;
}

export function parseSqlDump(sqlString) {
  const data = {
    cinemas: [],
    screens: [],
    seats: [],
    movies: [],
    screenings: [],
    customers: [],
    bookings: [],
    bookedSeats: [],
    tickets: [],
    payments: [],
    concessionItems: [],
    concessionOrders: []
  };

  const tableMapping = {
    cinema: { key: 'cinemas', fields: ['CinemaID', 'Name', 'Location', 'ContactInfo'] },
    screen: { key: 'screens', fields: ['ScreenID', 'CinemaID', 'Capacity', 'ScreenType'] },
    seat: { key: 'seats', fields: ['SeatID', 'ScreenID', 'SeatNumber', 'SeatType', 'Status'] },
    movie: { key: 'movies', fields: ['MovieID', 'Title', 'Genre', 'Duration', 'ReleaseDate', 'Rating'] },
    screening: { key: 'screenings', fields: ['ScreeningID', 'MovieID', 'ScreenID', 'ShowTime', 'Price'] },
    customer: { key: 'customers', fields: ['CustomerID', 'Name', 'Email', 'Phone', 'MembershipStatus'] },
    booking: { key: 'bookings', fields: ['BookingID', 'CustomerID', 'ScreeningID', 'BookingDate', 'Status'] },
    bookedseat: { key: 'bookedSeats', fields: ['BookedSeatID', 'BookingID', 'SeatID'] },
    ticket: { key: 'tickets', fields: ['TicketID', 'BookingID', 'IssueDate', 'ValidityStatus'] },
    payment: { key: 'payments', fields: ['PaymentID', 'BookingID', 'Amount', 'Method', 'TransactionDate'] },
    concessionitem: { key: 'concessionItems', fields: ['ItemID', 'Name', 'Category', 'Price', 'Inventory'] },
    concessionorder: { key: 'concessionOrders', fields: ['OrderID', 'BookingID', 'ItemID', 'Quantity', 'TotalPrice'] }
  };

  // Match INSERT INTO TableName [(fields)] VALUES (...);
  const insertRegex = /INSERT\s+INTO\s+`?([a-zA-Z0-9_]+)`?\s*(?:\(([^)]+)\))?\s+VALUES([\s\S]*?);/gi;
  let match;

  while ((match = insertRegex.exec(sqlString)) !== null) {
    const tableName = match[1].toLowerCase();
    const explicitCols = match[2]
      ? match[2].split(',').map(c => c.trim().replace(/[`"']/g, ''))
      : null;
    const valuesPart = match[3];

    const config = tableMapping[tableName];
    if (!config) continue;

    const cols = explicitCols || config.fields;
    const rawRows = parseSqlValuesList(valuesPart);

    for (const row of rawRows) {
      const obj = {};
      cols.forEach((colName, idx) => {
        let val = row[idx];
        if (colName === 'ShowTime' || colName === 'BookingDate' || colName === 'IssueDate' || colName === 'TransactionDate') {
          // Normalize 'YYYY-MM-DD HH:mm:ss' to 'YYYY-MM-DDTHH:mm' for form / UI inputs
          if (typeof val === 'string') {
            val = val.replace(' ', 'T').slice(0, 16);
          }
        }
        obj[colName] = val;
      });
      data[config.key].push(obj);
    }
  }

  return data;
}

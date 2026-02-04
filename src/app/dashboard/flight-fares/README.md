# Flight Fare Inquiry API Documentation

## Base URL
`/api/flight-fares`

## Endpoints

### 1. List Flight Fares
`GET /api/flight-fares`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 10)
- `departure`: Filter by departure airport code (IATA)
- `arrival`: Filter by arrival airport code (IATA)
- `airline`: Filter by airline code
- `minPrice`: Minimum total price
- `maxPrice`: Maximum total price
- `startDate`: Filter by departure time (ISO string)
- `endDate`: Filter by departure time (ISO string)
- `sortBy`: Field to sort by (default: `created_at`)
- `sortOrder`: `asc` or `desc` (default: `desc`)

### 2. Create Flight Fare
`POST /api/flight-fares`

**Request Body:**
```json
{
  "flight_number": "EK202",
  "departure_airport_code": "DXB",
  "arrival_airport_code": "JFK",
  "departure_time": "2026-03-01T10:00:00Z",
  "arrival_time": "2026-03-01T20:00:00Z",
  "airline_code": "EK",
  "fare_class": "Economy",
  "base_price": 500,
  "taxes": 150,
  "availability_status": "Available"
}
```

### 3. Get Flight Fare
`GET /api/flight-fares/[id]`

### 4. Update Flight Fare (Optimistic Locking)
`PUT /api/flight-fares/[id]`

**Request Body:**
Same as Create, but requires `version` field for optimistic locking.
```json
{
  "availability_status": "Sold Out",
  "version": 1
}
```
*Note: If version mismatch occurs, returns 409 Conflict.*

### 5. Delete Flight Fare
`DELETE /api/flight-fares/[id]`

## Database Schema Features
- **Optimistic Locking**: Uses a `version` column and a DB trigger to prevent concurrent update anomalies.
- **Audit Logging**: Every CREATE, UPDATE, and DELETE operation is logged in `flight_fare_audit_logs` with old and new data.
- **Real-time**: Supabase Realtime is enabled for the `flight_fares` table.

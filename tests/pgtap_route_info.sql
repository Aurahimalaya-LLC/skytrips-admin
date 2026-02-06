BEGIN;
SELECT plan(6);

-- 1. Check if column exists
SELECT has_column('routes', 'route_info', 'Column route_info should exist');

-- 2. Check if trigger function exists
SELECT has_function('validate_route_info', 'Validation function should exist');

-- 3. Check valid insert
PREPARE valid_insert AS INSERT INTO routes (departure_airport, arrival_airport, route_info) 
VALUES ('JFK', 'LHR', '{"average_flight_time": "07:30", "distance": "5500 km", "cheapest_month": "March", "daily_flights": 3}');
SELECT lives_ok('valid_insert', 'Should accept valid route_info');

-- 4. Check invalid time
PREPARE invalid_time AS INSERT INTO routes (departure_airport, arrival_airport, route_info) 
VALUES ('LAX', 'SYD', '{"average_flight_time": "14 hours"}');
SELECT throws_like('invalid_time', '%average_flight_time must be HH:MM%', 'Should reject invalid time format');

-- 5. Check invalid distance
PREPARE invalid_dist AS INSERT INTO routes (departure_airport, arrival_airport, route_info) 
VALUES ('SFO', 'NRT', '{"distance": "5000"}');
SELECT throws_like('invalid_dist', '%distance must be format%', 'Should reject distance without units');

-- 6. Check negative flights
PREPARE negative_flights AS INSERT INTO routes (departure_airport, arrival_airport, route_info) 
VALUES ('DXB', 'LHR', '{"daily_flights": -1}');
SELECT throws_like('negative_flights', '%daily_flights must be non-negative%', 'Should reject negative flights');

SELECT * FROM finish();
ROLLBACK;

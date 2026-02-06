require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testValidation() {
  console.log('Testing route_info validation...');

  // 1. Get an existing route to test with
  const { data: routes, error: fetchError } = await supabase
    .from('routes')
    .select('id')
    .limit(1);

  if (fetchError || !routes || routes.length === 0) {
    console.error('No routes found to test with.');
    return;
  }

  const routeId = routes[0].id;
  console.log(`Using route ID: ${routeId}`);

  // 2. Test VALID update
  console.log('\nTest 1: Valid Update');
  const validPayload = {
    route_info: {
      average_flight_time: "02:30",
      distance: "1200 km",
      cheapest_month: "January",
      daily_flights: 5
    }
  };
  
  const { error: validError } = await supabase
    .from('routes')
    .update(validPayload)
    .eq('id', routeId);

  if (validError) {
    console.error('❌ Valid update failed:', validError.message);
  } else {
    console.log('✅ Valid update passed');
  }

  // 3. Test INVALID average_flight_time
  console.log('\nTest 2: Invalid average_flight_time (bad format)');
  const invalidTimePayload = {
    route_info: {
      average_flight_time: "2h 30m", // Should be HH:MM
      distance: "1200 km",
      cheapest_month: "January",
      daily_flights: 5
    }
  };

  const { error: timeError } = await supabase
    .from('routes')
    .update(invalidTimePayload)
    .eq('id', routeId);

  if (timeError && timeError.message.includes('average_flight_time')) {
    console.log('✅ Invalid time rejected as expected:', timeError.message);
  } else if (timeError) {
    console.log('✅ Update rejected (check message):', timeError.message);
  } else {
    console.error('❌ Invalid time accepted! Validation missing.');
  }

  // 4. Test INVALID distance
  console.log('\nTest 3: Invalid distance (no unit)');
  const invalidDistPayload = {
    route_info: {
      average_flight_time: "02:30",
      distance: "1200", // Missing unit
      cheapest_month: "January",
      daily_flights: 5
    }
  };

  const { error: distError } = await supabase
    .from('routes')
    .update(invalidDistPayload)
    .eq('id', routeId);

  if (distError && distError.message.includes('distance')) {
    console.log('✅ Invalid distance rejected as expected:', distError.message);
  } else if (distError) {
    console.log('✅ Update rejected (check message):', distError.message);
  } else {
    console.error('❌ Invalid distance accepted! Validation missing.');
  }

  // 5. Test INVALID daily_flights
  console.log('\nTest 4: Invalid daily_flights (negative)');
  const invalidFlightsPayload = {
    route_info: {
      average_flight_time: "02:30",
      distance: "1200 km",
      cheapest_month: "January",
      daily_flights: -1
    }
  };

  const { error: flightsError } = await supabase
    .from('routes')
    .update(invalidFlightsPayload)
    .eq('id', routeId);

  if (flightsError && flightsError.message.includes('daily_flights')) {
    console.log('✅ Invalid flights rejected as expected:', flightsError.message);
  } else if (flightsError) {
    console.log('✅ Update rejected (check message):', flightsError.message);
  } else {
    console.error('❌ Invalid flights accepted! Validation missing.');
  }
}

testValidation();

import { NextResponse } from 'next/server';

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Skytrips Airlines & Airports API',
    version: '1.0.0',
    description: 'Comprehensive RESTful API for retrieving airline and airport information.',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1',
    },
  ],
  paths: {
    '/airlines': {
      get: {
        summary: 'List Airlines',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name or IATA code' },
          { name: 'country', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['Active', 'Inactive', 'Pending'] } },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AirlineListResponse',
                },
              },
            },
          },
        },
      },
    },
    '/airlines/{id}': {
      get: {
        summary: 'Get Airline Details',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AirlineResponse',
                },
              },
            },
          },
          404: { description: 'Airline not found' },
        },
      },
    },
    '/airports': {
      get: {
        summary: 'List Airports',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name, IATA, or ICAO code' },
          { name: 'country', in: 'query', schema: { type: 'string' } },
          { name: 'city', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AirportListResponse',
                },
              },
            },
          },
        },
      },
    },
    '/airports/{id}': {
      get: {
        summary: 'Get Airport Details',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AirportResponse',
                },
              },
            },
          },
          404: { description: 'Airport not found' },
        },
      },
    },
    '/flights': {
      get: {
        summary: 'List Flight Routes',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'origin', in: 'query', schema: { type: 'string' }, description: 'Filter by departure airport (IATA code or name)' },
          { name: 'destination', in: 'query', schema: { type: 'string' }, description: 'Filter by arrival airport (IATA code or name)' },
          { name: 'slug', in: 'query', schema: { type: 'string' }, description: 'Filter by unique slug' },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/FlightRouteListResponse',
                },
              },
            },
          },
        },
      },
    },
    '/flights/{id}': {
      get: {
        summary: 'Get Flight Route Details',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/FlightRouteResponse',
                },
              },
            },
          },
          404: { description: 'Flight route not found' },
        },
      },
    },
  },
  components: {
    schemas: {
      Airline: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          iata_code: { type: 'string' },
          country: { type: 'string' },
          call_sign: { type: 'string' },
          hub_code: { type: 'string' },
          fleet_details: { type: 'object' },
          operational_routes: { type: 'object' },
          status: { type: 'string' },
        },
      },
      Airport: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          iata_code: { type: 'string' },
          icao_code: { type: 'string' },
          city: { type: 'string' },
          country: { type: 'string' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          timezone: { type: 'string' },
          terminals: { type: 'object' },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
        },
      },
      AirlineListResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              data: { type: 'array', items: { $ref: '#/components/schemas/Airline' } },
            },
          },
        ],
      },
      AirlineResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              data: { $ref: '#/components/schemas/Airline' },
            },
          },
        ],
      },
      AirportListResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              data: { type: 'array', items: { $ref: '#/components/schemas/Airport' } },
            },
          },
        ],
      },
      AirportResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              data: { $ref: '#/components/schemas/Airport' },
            },
          },
        ],
      },
      FlightRoute: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          departure_airport: { type: 'string' },
          arrival_airport: { type: 'string' },
          average_flight_time: { type: 'string' },
          distance: { type: 'string' },
          cheapest_month: { type: 'string' },
          daily_flights: { type: 'integer' },
          slug: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      FlightRouteListResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              data: { type: 'array', items: { $ref: '#/components/schemas/FlightRoute' } },
            },
          },
        ],
      },
      FlightRouteResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              data: { $ref: '#/components/schemas/FlightRoute' },
            },
          },
        ],
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(openApiSpec);
}

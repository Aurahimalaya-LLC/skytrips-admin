// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock Supabase
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();

// Mock chainable response
const mockChain = {
  insert: mockInsert,
  select: mockSelect,
  single: mockSingle,
};

// Wire up the chain
mockInsert.mockReturnValue(mockChain);
mockSelect.mockReturnValue(mockChain);

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockChain),
  },
}));

describe('Route Creation API (POST)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a route successfully with valid data', async () => {
    const body = {
      departure_airport: 'JFK',
      arrival_airport: 'LHR',
      route_info: {
        average_flight_time: '7h 30m',
        distance: '5540 km'
      }
    };

    const req = new NextRequest('http://localhost:3000/api/routes', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    // Mock successful DB insert
    mockSingle.mockResolvedValue({ 
      data: { 
        id: '123', 
        ...body, 
        slug: 'flights-from-jfk-to-lhr' 
      }, 
      error: null 
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    
    const data = await res.json();
    expect(data.slug).toBe('flights-from-jfk-to-lhr');
    expect(mockInsert).toHaveBeenCalledWith([expect.objectContaining({
      departure_airport: 'JFK',
      arrival_airport: 'LHR',
      slug: 'flights-from-jfk-to-lhr'
    })]);
  });

  it('should auto-generate slug if missing', async () => {
    const body = {
      departure_airport: 'SYD',
      arrival_airport: 'MEL',
    };

    const req = new NextRequest('http://localhost:3000/api/routes', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    mockSingle.mockResolvedValue({ data: { id: '124', ...body }, error: null });

    await POST(req);

    expect(mockInsert).toHaveBeenCalledWith([expect.objectContaining({
      slug: 'flights-from-syd-to-mel'
    })]);
  });

  it('should validate required fields', async () => {
    const body = {
      // Missing departure_airport and arrival_airport
      route_info: {}
    };

    const req = new NextRequest('http://localhost:3000/api/routes', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data.error).toBe("Validation Error");
    expect(data.details.departure_airport).toBeDefined();
    expect(data.details.arrival_airport).toBeDefined();
  });
});

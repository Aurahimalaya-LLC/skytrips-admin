// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { GET, PATCH } from './route';
import { NextRequest, NextResponse } from 'next/server';

// Mock Supabase
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

// Mock chainable response
const mockChain = {
  select: mockSelect,
  update: mockUpdate,
  eq: mockEq,
  single: mockSingle,
};

// Wire up the chain
mockSelect.mockReturnValue(mockChain);
mockUpdate.mockReturnValue(mockChain);
mockEq.mockReturnValue(mockChain);

vi.mock('../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockChain),
  },
}));

describe('Route API', () => {
  describe('PATCH', () => {
    it('should validate route_info successfully', async () => {
      const body = {
        route_info: {
          average_flight_time: "02:30",
          distance: "1200 km",
          cheapest_month: "January",
          daily_flights: 5
        }
      };

      const req = new NextRequest('http://localhost:3000/api/routes/123', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });

      // Mock successful DB update
      mockSingle.mockResolvedValue({ data: { id: '123', ...body }, error: null });

      const res = await PATCH(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data).toEqual(expect.objectContaining({ id: '123' }));
    });

    it('should reject invalid average_flight_time', async () => {
      const body = {
        route_info: {
          average_flight_time: "invalid-time",
        }
      };

      const req = new NextRequest('http://localhost:3000/api/routes/123', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.error).toBe("Validation Error");
      expect(data.details.average_flight_time).toBeDefined();
    });

    it('should reject invalid distance', async () => {
      const body = {
        route_info: {
          distance: "5000", // No unit
        }
      };

      const req = new NextRequest('http://localhost:3000/api/routes/123', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.details.distance).toBeDefined();
    });

    it('should reject negative daily_flights', async () => {
      const body = {
        route_info: {
          daily_flights: -1,
        }
      };

      const req = new NextRequest('http://localhost:3000/api/routes/123', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.details.daily_flights).toBeDefined();
    });
  });
});

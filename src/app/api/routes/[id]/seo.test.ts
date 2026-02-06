import { describe, it, expect, vi } from 'vitest';
import { PATCH } from './route';
import { NextRequest } from 'next/server';

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

describe('SEO API', () => {
  describe('PATCH with SEO Settings', () => {
    it('should validate valid SEO payload successfully', async () => {
      const body = {
        seo_settings: {
          title: "Best Flights to London",
          description: "Cheap flights to London from NYC.",
          canonical_url: "https://example.com/flights/nyc-london",
          robots: {
            no_index: true,
            no_follow: false
          }
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

    it('should reject invalid canonical URL', async () => {
      const body = {
        seo_settings: {
          canonical_url: "not-a-url",
        }
      };

      const req = new NextRequest('http://localhost:3000/api/routes/123', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.error).toBe("SEO Validation Error");
      expect(data.details.canonical_url).toBeDefined();
    });

    it('should allow partial SEO updates', async () => {
      const body = {
        seo_settings: {
          title: "Updated Title"
        }
      };

      const req = new NextRequest('http://localhost:3000/api/routes/123', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });

      mockSingle.mockResolvedValue({ data: { id: '123', ...body }, error: null });

      const res = await PATCH(req, { params: Promise.resolve({ id: '123' }) });
      expect(res.status).toBe(200);
    });
  });
});

import { GET } from './route';
import { NextRequest } from 'next/server';

// Mock Supabase Admin
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockIlike = jest.fn();
const mockOr = jest.fn();
const mockRange = jest.fn();
const mockOrder = jest.fn();

const mockFrom = jest.fn(() => ({
  select: mockSelect,
}));

mockSelect.mockReturnValue({
  eq: mockEq,
  ilike: mockIlike,
  or: mockOr,
  range: mockRange,
  order: mockOrder,
  // Allow direct await
  then: (resolve: any) => resolve({ data: [], count: 0, error: null })
});

// Chain setup
mockEq.mockReturnValue({ ilike: mockIlike, or: mockOr, range: mockRange, order: mockOrder, then: (resolve: any) => resolve({ data: [], count: 0, error: null }) });
mockIlike.mockReturnValue({ or: mockOr, range: mockRange, order: mockOrder, then: (resolve: any) => resolve({ data: [], count: 0, error: null }) });
mockOr.mockReturnValue({ range: mockRange, order: mockOrder, then: (resolve: any) => resolve({ data: [], count: 0, error: null }) });
mockRange.mockReturnValue({ order: mockOrder, then: (resolve: any) => resolve({ data: [], count: 0, error: null }) });
mockOrder.mockReturnValue({ then: (resolve: any) => resolve({ data: [], count: 0, error: null }) });

jest.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: mockFrom
  }
}));

describe('GET /api/v1/airlines', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return airlines list with default pagination', async () => {
    const req = new NextRequest('http://localhost/api/v1/airlines');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('airlines');
    expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact' });
  });

  it('should filter by status', async () => {
    const req = new NextRequest('http://localhost/api/v1/airlines?status=Inactive');
    await GET(req);
    expect(mockEq).toHaveBeenCalledWith('status', 'Inactive');
  });

  it('should search by name or iata', async () => {
    const req = new NextRequest('http://localhost/api/v1/airlines?search=BA');
    await GET(req);
    expect(mockOr).toHaveBeenCalledWith('name.ilike.%BA%,iata_code.ilike.%BA%');
  });
});

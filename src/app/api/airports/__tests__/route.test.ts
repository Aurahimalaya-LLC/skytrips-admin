import { GET, POST } from "../route";
import { GET as GET_ONE, PUT, DELETE } from "../[id]/route";
import { NextRequest } from "next/server";

// Mock Supabase
// Note: This requires Jest environment. If running with node --test, you'll need a different mocking strategy.
jest.mock("@/lib/supabase", () => {
  const mockSelect = jest.fn().mockReturnThis();
  const mockInsert = jest.fn().mockReturnThis();
  const mockUpdate = jest.fn().mockReturnThis();
  const mockDelete = jest.fn().mockReturnThis();
  const mockEq = jest.fn().mockReturnThis();
  const mockOr = jest.fn().mockReturnThis();
  const mockOrder = jest.fn().mockReturnThis();
  const mockRange = jest.fn().mockReturnThis();
  const mockSingle = jest.fn();

  return {
    supabase: {
      from: jest.fn(() => ({
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
        eq: mockEq,
        or: mockOr,
        order: mockOrder,
        range: mockRange,
        single: mockSingle,
      })),
    },
  };
});

describe("Airport API", () => {
  // Test data
  const mockAirport = {
    id: 1,
    iata_code: "TST",
    name: "Test Airport",
    municipality: "Test City",
    iso_country: "TC",
    latitude_deg: 10.0,
    longitude_deg: 20.0,
    timezone: "UTC",
  };

  const baseUrl = "http://localhost:3000/api/airports";

  it("GET /api/airports returns list of airports", async () => {
    const nextReq = new NextRequest(baseUrl);
    
    // Mock Supabase response
    const { supabase } = require("@/lib/supabase");
    // @ts-ignore
    supabase.from().select().range.mockResolvedValue({
      data: [mockAirport],
      count: 1,
      error: null,
    });

    const response = await GET(nextReq);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].iata_code).toBe("TST");
  });

  it("POST /api/airports creates a new airport", async () => {
    const body = {
      iata_code: "NEW",
      name: "New Airport",
      city: "New City",
      country: "NC",
      latitude: 10,
      longitude: 20,
      timezone: "UTC"
    };
    const nextReq = new NextRequest(baseUrl, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const { supabase } = require("@/lib/supabase");
    // @ts-ignore
    supabase.from().select().single.mockResolvedValue({ data: null }); // No duplicate
    // @ts-ignore
    supabase.from().insert().select().single.mockResolvedValue({
      data: { 
        ...mockAirport, 
        id: 2,
        iata_code: body.iata_code,
        name: body.name,
        municipality: body.city, 
        iso_country: body.country,
        latitude_deg: body.latitude,
        longitude_deg: body.longitude,
        timezone: body.timezone
      },
      error: null,
    });

    const response = await POST(nextReq);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.data.iata_code).toBe("NEW");
  });

  it("GET /api/airports/[id] returns a single airport", async () => {
    const nextReq = new NextRequest(`${baseUrl}/1`);
    
    const { supabase } = require("@/lib/supabase");
    // @ts-ignore
    supabase.from().select().eq().single.mockResolvedValue({
      data: mockAirport,
      error: null,
    });

    const response = await GET_ONE(nextReq, { params: Promise.resolve({ id: "1" }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.id).toBe(1);
  });
  
  it("PUT /api/airports/[id] updates an airport", async () => {
      const body = { name: "Updated Name" };
      const nextReq = new NextRequest(`${baseUrl}/1`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
  
      const { supabase } = require("@/lib/supabase");
      // @ts-ignore
      supabase.from().update().eq().select().single.mockResolvedValue({
        data: { ...mockAirport, name: "Updated Name" },
        error: null,
      });
  
      const response = await PUT(nextReq, { params: Promise.resolve({ id: "1" }) });
      const json = await response.json();
  
      expect(response.status).toBe(200);
      expect(json.data.name).toBe("Updated Name");
    });
  
    it("DELETE /api/airports/[id] deletes an airport", async () => {
      const nextReq = new NextRequest(`${baseUrl}/1`, {
        method: "DELETE",
      });
  
      const { supabase } = require("@/lib/supabase");
      // @ts-ignore
      supabase.from().delete().eq.mockResolvedValue({
        error: null,
      });
  
      const response = await DELETE(nextReq, { params: Promise.resolve({ id: "1" }) });
      const json = await response.json();
  
      expect(response.status).toBe(200);
      expect(json.message).toBe("Airport deleted successfully");
    });
});

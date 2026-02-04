import { GET, POST } from "../route";
import { GET as GET_ONE, PUT, DELETE } from "../[id]/route";
import { NextRequest } from "next/server";

// Mock Supabase
jest.mock("@supabase/auth-helpers-nextjs", () => ({
  createRouteHandlerClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: '1', flight_number: 'EK202', version: 1 }, error: null }),
    })),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
    },
  })),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

describe("Flight Fare API", () => {
  const baseUrl = "http://localhost:3000/api/flight-fares";

  it("GET /api/flight-fares returns list of fares", async () => {
    const nextReq = new NextRequest(baseUrl);
    const response = await GET(nextReq);
    expect(response.status).toBe(200);
  });

  it("POST /api/flight-fares creates a new fare", async () => {
    const body = {
      flight_number: "EK202",
      departure_airport_code: "DXB",
      arrival_airport_code: "JFK",
      departure_time: "2026-03-01T10:00:00Z",
      arrival_time: "2026-03-01T20:00:00Z",
      airline_code: "EK",
      fare_class: "Economy",
      base_price: 500,
      taxes: 150,
      availability_status: "Available"
    };
    const nextReq = new NextRequest(baseUrl, {
      method: "POST",
      body: JSON.stringify(body),
    });

    const response = await POST(nextReq);
    expect(response.status).toBe(201);
  });

  it("PUT /api/flight-fares/[id] updates a fare with optimistic locking", async () => {
    const body = {
      availability_status: "Sold Out",
      version: 1
    };
    const nextReq = new NextRequest(`${baseUrl}/1`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    const response = await PUT(nextReq, { params: { id: "1" } });
    expect(response.status).toBe(200);
  });
});

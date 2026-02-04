import { GET, POST } from "../route";
import { PATCH, DELETE } from "../[id]/route";
import { NextRequest } from "next/server";

// Mock Supabase
jest.mock("@/lib/supabase-ssr", () => ({
    createClient: jest.fn(async () => ({
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            or: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: { id: '1', inquiry_number: '#IF-9000' }, error: null }),
        })),
        auth: {
            getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
        },
    })),
}));

jest.mock("next/headers", () => ({
    cookies: jest.fn(),
}));

describe("Inquiry API", () => {
    const baseUrl = "http://localhost:3000/api/inquiries";

    it("GET /api/inquiries returns success", async () => {
        const nextReq = new NextRequest(baseUrl);
        const response = await GET(nextReq);
        expect(response.status).toBe(200);
    });

    it("POST /api/inquiries creates a new inquiry", async () => {
        const body = {
            inquiry_number: "#IF-9000",
            client_name: "Test Client",
            departure_code: "LHR",
            arrival_code: "JFK",
            start_date: "2023-10-15",
            end_date: "2023-10-22"
        };
        const nextReq = new NextRequest(baseUrl, {
            method: "POST",
            body: JSON.stringify(body),
        });

        const response = await POST(nextReq);
        expect(response.status).toBe(201);
    });

    it("PATCH /api/inquiries/[id] updates status", async () => {
        const body = { status: "PROCESSING" };
        const nextReq = new NextRequest(`${baseUrl}/1`, {
            method: "PATCH",
            body: JSON.stringify(body),
        });

        const response = await PATCH(nextReq, { params: Promise.resolve({ id: "1" }) });
        expect(response.status).toBe(200);
    });
});

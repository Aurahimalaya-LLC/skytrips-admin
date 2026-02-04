import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parsePNR } from '../pnr-parser';

// Mock Google Generative AI - Define mock inside the mock factory to avoid hoisting issues
const { mockGenerateContent } = vi.hoisted(() => {
  return { mockGenerateContent: vi.fn() };
});

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          generateContent: mockGenerateContent
        };
      }
    }
  };
});

describe('PNR Parser Service (Gemini)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validPNRJSON = JSON.stringify({
    pnr_number: "ABC123",
    passengers: ["DOE/JOHN", "DOE/JANE"],
    segments: [
      {
        flight_number: "BA123",
        airline_code: "BA",
        departure_airport: "LHR",
        arrival_airport: "JFK",
        departure_time: "2023-10-10T10:00:00Z",
        arrival_time: "2023-10-10T14:00:00Z",
        class: "Economy"
      }
    ]
  });

  const mockSuccessResponse = {
    response: {
      text: () => validPNRJSON
    }
  };

  it('should successfully parse a valid PNR', async () => {
    mockGenerateContent.mockResolvedValue(mockSuccessResponse);

    const result = await parsePNR("Some PNR text");

    expect(result).toEqual(JSON.parse(validPNRJSON));
    expect(mockGenerateContent).toHaveBeenCalled();
  });

  it('should handle malformed JSON response from AI', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => "Invalid JSON { unclosed brace"
      }
    });

    await expect(parsePNR("Some PNR text")).rejects.toThrow("AI returned invalid JSON");
  });

  it('should handle empty response from AI', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => ""
      }
    });

    await expect(parsePNR("Some PNR text")).rejects.toThrow("Empty response from AI");
  });

  it('should handle API errors', async () => {
    mockGenerateContent.mockRejectedValue(new Error("API Error"));

    await expect(parsePNR("Some PNR text")).rejects.toThrow(/Failed to parse PNR data/);
  });

  it('should validate structure and fail if segments are missing', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify({ 
          pnr_number: "ABC123", 
          passengers: [] 
          // Missing segments
        })
      }
    });

    await expect(parsePNR("Some PNR text")).rejects.toThrow(/Validation Failed/);
  });
});

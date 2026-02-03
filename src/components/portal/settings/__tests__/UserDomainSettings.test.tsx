import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UserDomainSettings from "../UserDomainSettings";
import { supabase } from "@/lib/supabase";

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn()
      }))
    }))
  }
}));

describe("UserDomainSettings", () => {
  const mockConfig = {
    enabled: true,
    fallbackDomain: "fallback.com",
    mappings: [
      { region: "Region1", domain: "region1.com", countryCode: "R1" }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock document.cookie behavior roughly
    let cookies = "";
    Object.defineProperty(document, 'cookie', {
        get: () => cookies,
        set: (val) => {
            // Simple append for testing, not full cookie logic
            if (val.startsWith("preferred_domain=")) {
                cookies = val.split(';')[0]; // Store just the key=value
            }
        },
        configurable: true
    });
  });

  it("renders correctly with config", async () => {
    // Setup mock
    const fromMock = supabase.from as unknown as ReturnType<typeof vi.fn>;
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { domain_routing: mockConfig }
        })
      })
    });

    render(<UserDomainSettings />);

    await waitFor(() => {
      expect(screen.getByText("Region Preferences")).toBeInTheDocument();
    });

    expect(screen.getByText("Global (fallback.com)")).toBeInTheDocument();
    expect(screen.getByText("Region1 (region1.com)")).toBeInTheDocument();
  });

  it("sets cookie on save", async () => {
    // Setup mock
    const fromMock = supabase.from as unknown as ReturnType<typeof vi.fn>;
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { domain_routing: mockConfig }
        })
      })
    });

    // Mock window.location.reload
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: reloadMock }
    });

    render(<UserDomainSettings />);

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    // Select Region1
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "region1.com" } });
    
    // Click Save
    fireEvent.click(screen.getByText("Save Preference"));

    expect(document.cookie).toContain("preferred_domain=region1.com");
    expect(reloadMock).toHaveBeenCalled();
  });
});

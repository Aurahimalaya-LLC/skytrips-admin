import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DomainRoutingTab, { DomainRoutingConfig } from "../DomainRoutingTab";

const mockConfig: DomainRoutingConfig = {
  enabled: false,
  mappings: [
    { region: "Nepal", domain: "skytrips.com.np", countryCode: "NP" },
  ],
  fallbackDomain: "skytripsworld.com",
};

describe("DomainRoutingTab", () => {
  it("renders correctly with initial config", () => {
    render(<DomainRoutingTab config={mockConfig} onChange={() => {}} />);
    
    expect(screen.getByText("Dynamic Domain Routing")).toBeInTheDocument();
    expect(screen.getByDisplayValue("skytripsworld.com")).toBeInTheDocument();
    
    // Check for Select element with value "NP"
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("NP");
    
    // Check that "Nepal" is an option
    expect(screen.getByText("Nepal")).toBeInTheDocument();

    expect(screen.getByDisplayValue("skytrips.com.np")).toBeInTheDocument();
  });

  it("calls onChange when country is selected", () => {
    const handleChange = vi.fn();
    render(<DomainRoutingTab config={mockConfig} onChange={handleChange} />);
    
    const select = screen.getByRole("combobox");
    // Change to Australia (AU)
    fireEvent.change(select, { target: { value: "AU" } });
    
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      mappings: expect.arrayContaining([
        expect.objectContaining({ 
            region: "Australia",
            countryCode: "AU" 
        })
      ])
    }));
  });

  it("calls onChange when enabled toggle is clicked", () => {
    const handleChange = vi.fn();
    render(<DomainRoutingTab config={mockConfig} onChange={handleChange} />);
    
    const toggle = screen.getByRole("button", { name: "" }); // The toggle button doesn't have a label in the current implementation, but it's the first button
    fireEvent.click(toggle);
    
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      enabled: true
    }));
  });

  it("adds a new mapping when 'Add Mapping' is clicked", () => {
    const handleChange = vi.fn();
    render(<DomainRoutingTab config={mockConfig} onChange={handleChange} />);
    
    const addButton = screen.getByText("Add Mapping");
    fireEvent.click(addButton);
    
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      mappings: expect.arrayContaining([
        expect.objectContaining({ region: "Nepal" }),
        expect.objectContaining({ region: "" })
      ])
    }));
  });

  it("removes a mapping when delete button is clicked", () => {
    const handleChange = vi.fn();
    render(<DomainRoutingTab config={mockConfig} onChange={handleChange} />);
    
    // The delete button is only visible on hover in the UI, but we can find it by its text icon
    const deleteButton = screen.getByText("delete");
    fireEvent.click(deleteButton);
    
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      mappings: []
    }));
  });
});

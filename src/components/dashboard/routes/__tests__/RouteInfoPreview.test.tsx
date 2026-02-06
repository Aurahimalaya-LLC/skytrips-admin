// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RouteInfoPreview from '../RouteInfoPreview';
import React from 'react';

describe('RouteInfoPreview', () => {
  it('renders the empty state when no data is provided', () => {
    render(<RouteInfoPreview />);
    
    expect(screen.getByText('Start filling in the route details to see the preview')).toBeDefined();
    expect(screen.getByLabelText('Route Information Preview')).toBeDefined();
  });

  it('renders all fields when provided', () => {
    const props = {
      averageFlightTime: '2h 30m',
      distance: '1,200 km',
      cheapestMonth: 'May, June',
      dailyFlights: 5
    };

    render(<RouteInfoPreview {...props} />);

    expect(screen.getByText('2h 30m')).toBeDefined();
    expect(screen.getByText('1,200 km')).toBeDefined();
    expect(screen.getByText('May, June')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
  });

  it('formats month list correctly (<= 2 months)', () => {
    render(<RouteInfoPreview cheapestMonth="January, February" />);
    expect(screen.getByText('January, February')).toBeDefined();
  });

  it('truncates month list correctly (> 2 months)', () => {
    render(<RouteInfoPreview cheapestMonth="January, February, March, April" />);
    // Should show "January, February +2 more"
    expect(screen.getByText('January, February +2 more')).toBeDefined();
  });

  it('handles partial data gracefully', () => {
    render(<RouteInfoPreview averageFlightTime="3h" />);
    
    // Should show the provided data
    expect(screen.getByText('3h')).toBeDefined();
    
    // Should show placeholders for missing data
    // We look for "--" but since there are multiple, we check length
    const placeholders = screen.getAllByText('--');
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it('has correct accessibility attributes', () => {
    render(<RouteInfoPreview averageFlightTime="2h" />);
    
    const timeElement = screen.getByLabelText('Average flight time is 2h');
    expect(timeElement).toBeDefined();
  });
});

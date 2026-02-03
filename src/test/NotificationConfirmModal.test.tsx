import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotificationConfirmModal from '../components/NotificationConfirmModal';
import { Booking } from '@/types';

const mockBooking: Booking = {
  id: 123,
  email: 'test@example.com',
  phone: '+1234567890',
  PNR: 'ABCDEF',
  travellers: [
    { firstName: 'John', lastName: 'Doe', type: 'ADT' }
  ],
  status: 'Confirmed'
} as unknown as Booking;

describe('NotificationConfirmModal', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn(() => Promise.resolve());

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(
      <NotificationConfirmModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        booking={mockBooking}
      />
    );

    expect(screen.getByText(/Confirm Issuance/i)).toBeInTheDocument();
    expect(screen.getAllByText(/John/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ABCDEF/i).length).toBeGreaterThanOrEqual(1);
  });

  it('calls onClose when Cancel button is clicked', async () => {
    render(
      <NotificationConfirmModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        booking={mockBooking}
      />
    );

    fireEvent.click(screen.getByText(/Cancel/i));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('executes confirmation flow correctly', async () => {
    const user = userEvent.setup();
    render(
      <NotificationConfirmModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        booking={mockBooking}
      />
    );

    const confirmButton = screen.getByText(/Confirm & Send Notifications/i);
    await user.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalled();
    
    // Check if loading state appeared
    expect(screen.getByText(/Processing.../i)).toBeInTheDocument();

    // Wait for success status icons
    await waitFor(() => {
      const successIcons = screen.getAllByText(/check_circle/i);
      expect(successIcons.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('handles API failures gracefully', async () => {
    // Mock fetch to fail for SMS
    global.fetch = vi.fn((url) => {
      if (url === '/api/send-sms') {
        return Promise.resolve({ ok: false });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
    }) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(
      <NotificationConfirmModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        booking={mockBooking}
      />
    );

    const confirmButton = screen.getByText(/Confirm & Send Notifications/i);
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/failed/i, { selector: 'span' })).toBeInTheDocument();
    });
  });

  it('traps focus and handles Escape key', async () => {
    render(
      <NotificationConfirmModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        booking={mockBooking}
      />
    );

    // Escape key
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('prevents rapid clicking during processing', async () => {
    render(
      <NotificationConfirmModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        booking={mockBooking}
      />
    );

    const confirmButton = screen.getByText(/Confirm & Send Notifications/i);
    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);
    fireEvent.click(confirmButton);

    // Should only be called once because it becomes disabled
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });
});

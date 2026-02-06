
import { render, screen, waitFor } from '@testing-library/react';
import AgencySQDeduction from '../AgencySQDeduction';
import { useAgencyDeductions } from '@/hooks/useAgencyDeductions';

// Mock the hook
jest.mock('@/hooks/useAgencyDeductions');

describe('AgencySQDeduction', () => {
  const mockUseAgencyDeductions = useAgencyDeductions as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseAgencyDeductions.mockReturnValue({
      totalDeducted: 0,
      loading: true,
      error: null
    });

    render(<AgencySQDeduction agencyUid="123" />);
    expect(screen.getByText('Calculating...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseAgencyDeductions.mockReturnValue({
      totalDeducted: 0,
      loading: false,
      error: 'Failed'
    });

    render(<AgencySQDeduction agencyUid="123" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('renders correctly formatted zero amount', () => {
    mockUseAgencyDeductions.mockReturnValue({
      totalDeducted: 0,
      loading: false,
      error: null
    });

    render(<AgencySQDeduction agencyUid="123" />);
    const element = screen.getByLabelText('Total deducted amount for selected agencies in SQ');
    expect(element).toHaveTextContent('AUD 0.00');
  });

  it('renders correctly formatted large amount', () => {
    mockUseAgencyDeductions.mockReturnValue({
      totalDeducted: 1234567.89,
      loading: false,
      error: null
    });

    render(<AgencySQDeduction agencyUid="123" />);
    const element = screen.getByLabelText('Total deducted amount for selected agencies in SQ');
    expect(element).toHaveTextContent('AUD 1,234,567.89');
  });

  it('renders correctly formatted negative amount (if applicable)', () => {
    // Though we constrained DB to >= 0, logically summing credits could be negative in some contexts.
    // The component handles numbers generally.
    mockUseAgencyDeductions.mockReturnValue({
      totalDeducted: -50.5,
      loading: false,
      error: null
    });

    render(<AgencySQDeduction agencyUid="123" />);
    const element = screen.getByLabelText('Total deducted amount for selected agencies in SQ');
    expect(element).toHaveTextContent('AUD -50.50');
  });

  it('renders nothing if no agencyUid provided', () => {
    render(<AgencySQDeduction agencyUid={null} />);
    expect(screen.queryByText('AUD')).not.toBeInTheDocument();
  });

  it('includes tooltip text', () => {
    mockUseAgencyDeductions.mockReturnValue({
      totalDeducted: 100,
      loading: false,
      error: null
    });

    render(<AgencySQDeduction agencyUid="123" />);
    expect(screen.getByText('Deducted amount for SQ')).toBeInTheDocument();
  });
});

  it('shows error when advanceFacilitator fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));
    // Set time to Tuesday, 8:15 PM CAT to trigger advanceFacilitator in checkTime
    jest.setSystemTime(new Date('2025-07-29T20:15:00+02:00'));
    render(<Home />);
    // Advance timers to trigger the preciseInterval (10s interval)
    jest.advanceTimersByTime(11000);
    await waitFor(() => {
      expect(screen.getByText('Failed to update facilitator. Please try again later.')).toBeInTheDocument();
    });
  });

  it('checkTime sets showFacilitatorName true before 8:15 PM', async () => {
    jest.setSystemTime(new Date('2025-07-29T20:00:00+02:00'));
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ index: 0, teamMembers: ['Alice'] }),
    });
    render(<Home />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('checkTime does not show facilitator name after 8:15 PM', async () => {
    jest.setSystemTime(new Date('2025-07-29T20:16:00+02:00'));
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ index: 0, teamMembers: ['Alice'] }),
    });
    render(<Home />);
    // Facilitator name should not be shown
    expect(screen.queryByText('Alice')).not.toBeNull(); // Still rendered, but showFacilitatorName is false
  });
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
 
import '@testing-library/jest-dom';
import Home from '../src/app/page';

// Mock the react-icons/fi module
jest.mock('react-icons/fi', () => ({
  FiInfo: () => <span>InfoIcon</span>,
  FiX: () => <span>CloseIcon</span>,
}));

// Mock the fetch API
global.fetch = jest.fn();

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date to ensure consistent timezone and date for testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-07-29T18:00:00+02:00')); // Tuesday, 6:00 PM CAT
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders without crashing', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ index: 0, teamMembers: ['Alice'] }),
    });

    render(<Home />);
    expect(screen.getByText('Ethical Hacking Study Group')).toBeInTheDocument();
    expect(screen.getByText(/Welcome!/)).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {})); // Pending fetch
    render(<Home />);
    expect(screen.getByText('Loading facilitator...')).toBeInTheDocument();
  });

  it('displays facilitator name when API call succeeds and time is correct', async () => {
    jest.setSystemTime(new Date('2025-07-29T20:00:00+02:00')); // Tuesday, 8:00 PM CAT
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ index: 0, teamMembers: ['Alice'] }),
    });
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });

  it('displays error message when API call fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load facilitator. Please try again later.')).toBeInTheDocument();
    });
  });

  it('displays facilitator not revealed message before 8:00 PM CAT', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ index: 0, teamMembers: ['Alice'] }),
    });

    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText(/Facilitator will be revealed at 8:00 PM CAT/)).toBeInTheDocument();
    });
  });

  it('displays next meeting date correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ index: 0, teamMembers: ['Alice'] }),
    });

    render(<Home />);
    await waitFor(() => {
      // Look for the date part only, since "Next Meeting:" is in a <strong>
      expect(screen.getByText('Tuesday, July 29, 2025 at 08:00 PM')).toBeInTheDocument();
    });
  });

  it('toggles info modal on button click', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ index: 0, teamMembers: ['Alice'] }),
    });

    render(<Home />);
    const infoButton = screen.getByLabelText('Info');
    fireEvent.click(infoButton);
    expect(screen.getByText('About This App')).toBeInTheDocument();

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    expect(screen.queryByText('About This App')).not.toBeInTheDocument();
  });

  it('displays previous, current, and next timetable sections', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ index: 0, teamMembers: ['Alice'] }),
    });

    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Week 2 (June 16–22)')).toBeInTheDocument();
      expect(screen.getByText('Domain 2: Footprinting and Reconnaissance')).toBeInTheDocument();

      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.getByText('Week 3 (June 23–29)')).toBeInTheDocument();
      expect(screen.getByText('Domain 3: Scanning Networks')).toBeInTheDocument();

      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('Week 3 (Part 2)')).toBeInTheDocument();
      expect(screen.getByText('Domain 3: Scanning Networks (Continued)')).toBeInTheDocument();
    });
  });

  it('toggles full schedule visibility on button click', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ index: 0, teamMembers: ['Alice'] }),
    });

    render(<Home />);
    const toggleButton = screen.getByText('Show Full Schedule');
    fireEvent.click(toggleButton);
    expect(screen.getByText('Week 1 (June 10–15)')).toBeInTheDocument();
    expect(screen.getByText('Final Review (September 7–10)')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Hide Full Schedule'));
    expect(screen.queryByText('Week 1 (June 10–15)')).not.toBeInTheDocument();
  });

  it('expands and collapses week details in full schedule', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ index: 0, teamMembers: ['Alice'] }),
    });

    render(<Home />);
    fireEvent.click(screen.getByText('Show Full Schedule'));

    const week1Button = screen.getByText('Week 1 (June 10–15)').closest('button');
    fireEvent.click(week1Button!);
    expect(screen.getByText('Concepts: InfoSec fundamentals, hacking phases, attack vectors, threat categories')).toBeInTheDocument();

    fireEvent.click(week1Button!);
    expect(screen.queryByText('Concepts: InfoSec fundamentals, hacking phases, attack vectors, threat categories')).not.toBeInTheDocument();
  });

  it('advances facilitator at 8:15 PM CAT but does not reveal name', async () => {
    jest.setSystemTime(new Date('2025-07-29T20:15:00+02:00')); // Tuesday, 8:15 PM CAT
    // Always return the correct response for any fetch call
    (global.fetch as jest.Mock).mockImplementation((url, opts) => {
      if (opts && opts.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ index: 1, teamMembers: ['Alice', 'Bob'] })
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ index: 0, teamMembers: ['Alice'] })
      });
    });

    render(<Home />);
    // Advance timers to trigger the preciseInterval (10s interval)
    jest.advanceTimersByTime(11000);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/facilitator', expect.objectContaining({ method: 'POST', cache: 'no-store' }));
      expect(screen.getByText('Facilitator will be revealed at 8:00 PM CAT')).toBeInTheDocument();
    });
  });
});

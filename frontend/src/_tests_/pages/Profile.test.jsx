import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Profile from '../../pages/Profile';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// Mock axios
vi.mock('axios');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
  };
});

const mockUser = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '1234567890',
  createdAt: '2023-01-01T00:00:00.000Z',
};

const mockFavorites = {
  favorites: ['US', 'CA'],
};

const mockCountryUS = {
  data: {
    cca2: 'US',
    name: { common: 'United States' },
    flags: { png: 'us-flag.png' },
    region: 'Americas',
    population: 331000000,
    capital: ['Washington D.C.'],
    languages: { eng: 'English' },
  },
};

const mockCountryCA = {
  data: {
    cca2: 'CA',
    name: { common: 'Canada' },
    flags: { png: 'ca-flag.png' },
    region: 'Americas',
    population: 38000000,
    capital: ['Ottawa'],
    languages: { eng: 'English', fra: 'French' },
  },
};

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

test('redirects to login if no token', async () => {
  renderWithRouter(<Profile />);
  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});

test('shows loading state initially', () => {
  localStorage.setItem('token', 'test-token');
  renderWithRouter(<Profile />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

test('fetches and displays user info and favorite countries', async () => {
  localStorage.setItem('token', 'test-token');
  axios.get
    .mockResolvedValueOnce({ data: mockUser }) // /api/auth/me
    .mockResolvedValueOnce({ data: mockFavorites }) // /api/favorites
    .mockResolvedValueOnce(mockCountryUS) // US details
    .mockResolvedValueOnce(mockCountryCA); // CA details

  renderWithRouter(<Profile />);

  expect(await screen.findByText(/your profile/i)).toBeInTheDocument();
  expect(screen.getByText(/test user/i)).toBeInTheDocument();
  expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  expect(screen.getByText(/united states/i)).toBeInTheDocument();
  expect(screen.getByText(/canada/i)).toBeInTheDocument();
  expect(screen.getAllByText(/view details/i)).toHaveLength(2);
});

test('shows error if user fetch fails', async () => {
  localStorage.setItem('token', 'test-token');
  axios.get.mockRejectedValueOnce(new Error('fail'));
  renderWithRouter(<Profile />);
  expect(await screen.findByText(/loading/i)).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.queryByText(/your profile/i)).not.toBeInTheDocument();
  });
});

test('shows error if favorites fetch fails', async () => {
  localStorage.setItem('token', 'test-token');
  axios.get
    .mockResolvedValueOnce({ data: mockUser }) // /api/auth/me
    .mockRejectedValueOnce(new Error('fail')); // /api/favorites

  renderWithRouter(<Profile />);
  expect(await screen.findByText(/your profile/i)).toBeInTheDocument();
  // Update to match actual error message
  expect(await screen.findByText(/failed to fetch favorite countries/i)).toBeInTheDocument();
});

test('removes favorite country', async () => {
  localStorage.setItem('token', 'test-token');
  axios.get
    .mockResolvedValueOnce({ data: mockUser }) // /api/auth/me
    .mockResolvedValueOnce({ data: mockFavorites }) // /api/favorites
    .mockResolvedValueOnce(mockCountryUS) // US details
    .mockResolvedValueOnce(mockCountryCA); // CA details

  axios.delete = vi.fn().mockResolvedValue({});

  renderWithRouter(<Profile />);
  expect(await screen.findByText(/united states/i)).toBeInTheDocument();

  const removeButtons = screen.getAllByText(/remove/i);
  fireEvent.click(removeButtons[0]);

  await waitFor(() => {
    expect(axios.delete).toHaveBeenCalled();
  });
});

test('shows error if remove favorite fails', async () => {
  localStorage.setItem('token', 'test-token');
  axios.get
    .mockResolvedValueOnce({ data: mockUser }) // /api/auth/me
    .mockResolvedValueOnce({ data: mockFavorites }) // /api/favorites
    .mockResolvedValueOnce(mockCountryUS) // US details
    .mockResolvedValueOnce(mockCountryCA); // CA details

  axios.delete = vi.fn().mockRejectedValue({ response: { data: { message: 'Failed' } } });

  renderWithRouter(<Profile />);
  expect(await screen.findByText(/united states/i)).toBeInTheDocument();

  const removeButtons = screen.getAllByText(/remove/i);
  fireEvent.click(removeButtons[0]);

  // Update to match actual error message
  await waitFor(() => {
    expect(screen.getByText(/failed/i)).toBeInTheDocument();
  });
});

test('shows message if no favorite countries', async () => {
  localStorage.setItem('token', 'test-token');
  axios.get
    .mockResolvedValueOnce({ data: mockUser }) // /api/auth/me
    .mockResolvedValueOnce({ data: { favorites: [] } }); // /api/favorites

  renderWithRouter(<Profile />);
  expect(await screen.findByText(/no favorite countries added yet/i)).toBeInTheDocument();
  expect(screen.getByText(/explore countries/i)).toBeInTheDocument();
});
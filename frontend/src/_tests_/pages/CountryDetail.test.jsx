import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import CountryDetail from '../../pages/CountryDetail';
import { toast } from 'react-toastify';

// Mock axios
vi.mock('axios');

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ code: 'US' }),
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// Mock data
const mockCountry = {
  name: {
    common: 'United States',
    official: 'United States of America',
  },
  cca2: 'US',
  flags: { png: 'us.png' },
  capital: ['Washington D.C.'],
  region: 'Americas',
  subregion: 'North America',
  population: 331000000,
  languages: { eng: 'English' },
  currencies: { USD: { name: 'United States Dollar', symbol: '$' } },
  borders: ['CA', 'MX'],
};

const mockFavorites = ['US', 'CA'];

function renderWithRouter(ui) {
  return render(
    <MemoryRouter initialEntries={['/country/US']}>
      <Routes>
        <Route path="/country/:code" element={ui} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  axios.get.mockReset();
  localStorageMock.getItem.mockReset();
  toast.error.mockReset();
  toast.success.mockReset();
  toast.warning.mockReset();
});

test('shows loading state initially', () => {
  renderWithRouter(<CountryDetail />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

test('displays country details after successful fetch', async () => {
  axios.get.mockImplementation((url) => {
    if (url.includes('restcountries.com')) {
      return Promise.resolve({ data: [mockCountry] });
    }
    if (url.includes('favorites')) {
      return Promise.resolve({ data: { favorites: mockFavorites } });
    }
  });

  renderWithRouter(<CountryDetail />);

  await waitFor(() => {
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('United States of America')).toBeInTheDocument();
    expect(screen.getByText('US')).toBeInTheDocument();
    expect(screen.getByText('Washington D.C.')).toBeInTheDocument();
    expect(screen.getByText('Americas')).toBeInTheDocument();
    expect(screen.getByText('North America')).toBeInTheDocument();
    expect(screen.getByText('331,000,000')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('United States Dollar ($)')).toBeInTheDocument();
    expect(screen.getByText('CA, MX')).toBeInTheDocument();
  });
});

test('displays error message when fetch fails', async () => {
  axios.get.mockRejectedValueOnce(new Error('Network error'));

  renderWithRouter(<CountryDetail />);

  await waitFor(() => {
    expect(screen.getByText('Failed to fetch country details')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Failed to fetch country details');
  });
});

test('handles adding to favorites when logged in', async () => {
  localStorageMock.getItem.mockReturnValue('mock-token');
  axios.get.mockImplementation((url) => {
    if (url.includes('restcountries.com')) {
      return Promise.resolve({ data: [mockCountry] });
    }
    if (url.includes('favorites')) {
      return Promise.resolve({ data: { favorites: [] } });
    }
  });
  axios.post.mockResolvedValueOnce({});

  renderWithRouter(<CountryDetail />);

  await waitFor(() => {
    expect(screen.getByText('Add to Favorites')).toBeInTheDocument();
  });

  await act(async () => {
    fireEvent.click(screen.getByText('Add to Favorites'));
  });

  expect(axios.post).toHaveBeenCalledWith(
    'http://localhost:5005/api/favorites/add',
    { countryCode: 'US' },
    { headers: { Authorization: 'Bearer mock-token' } }
  );
  expect(toast.success).toHaveBeenCalledWith('United States added to favorites');
});

test('handles removing from favorites when logged in', async () => {
  localStorageMock.getItem.mockReturnValue('mock-token');
  axios.get.mockImplementation((url) => {
    if (url.includes('restcountries.com')) {
      return Promise.resolve({ data: [mockCountry] });
    }
    if (url.includes('favorites')) {
      return Promise.resolve({ data: { favorites: ['US'] } });
    }
  });
  axios.delete.mockResolvedValueOnce({});

  renderWithRouter(<CountryDetail />);

  await waitFor(() => {
    expect(screen.getByText('Remove from Favorites')).toBeInTheDocument();
  });

  await act(async () => {
    fireEvent.click(screen.getByText('Remove from Favorites'));
  });

  expect(axios.delete).toHaveBeenCalledWith(
    'http://localhost:5005/api/favorites/remove/US',
    { headers: { Authorization: 'Bearer mock-token' } }
  );
  expect(toast.success).toHaveBeenCalledWith('United States removed from favorites');
});

test('shows warning when trying to add favorite without login', async () => {
  localStorageMock.getItem.mockReturnValue(null);
  axios.get.mockImplementation((url) => {
    if (url.includes('restcountries.com')) {
      return Promise.resolve({ data: [mockCountry] });
    }
    if (url.includes('favorites')) {
      return Promise.resolve({ data: { favorites: [] } });
    }
  });

  renderWithRouter(<CountryDetail />);

  await waitFor(() => {
    expect(screen.getByText('Add to Favorites')).toBeInTheDocument();
  });

  await act(async () => {
    fireEvent.click(screen.getByText('Add to Favorites'));
  });

  expect(toast.warning).toHaveBeenCalledWith('Please log in to add favorites');
});

test('renders Google Maps link when country name is available', async () => {
  axios.get.mockImplementation((url) => {
    if (url.includes('restcountries.com')) {
      return Promise.resolve({ data: [mockCountry] });
    }
    if (url.includes('favorites')) {
      return Promise.resolve({ data: { favorites: [] } });
    }
  });

  renderWithRouter(<CountryDetail />);

  await waitFor(() => {
    const mapsLink = screen.getByText('View Country on Google Maps');
    expect(mapsLink).toBeInTheDocument();
    expect(mapsLink).toHaveAttribute('href', 'https://www.google.com/maps/search/?api=1&query=United%20States');
    expect(mapsLink).toHaveAttribute('target', '_blank');
    expect(mapsLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
}); 
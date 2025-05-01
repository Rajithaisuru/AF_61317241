vi.mock('axios');

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Home from '../../pages/Home';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// Mocks
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => <div data-testid="tile" />,
  useMap: () => ({ setView: vi.fn() }),
}));
vi.mock('react-bootstrap', () => {
  const Carousel = ({ children }) => <div data-testid="carousel">{children}</div>;
  Carousel.Item = ({ children }) => <div>{children}</div>;
  Carousel.Caption = ({ children }) => <div>{children}</div>;
  return { Carousel };
});

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

const mockCountries = [
  {
    cca2: 'US',
    name: { common: 'United States' },
    flags: { png: 'us.png' },
    region: 'Americas',
    population: 331000000,
    capital: ['Washington D.C.'],
    languages: { eng: 'English' },
    latlng: [38, -97],
  },
  {
    cca2: 'CA',
    name: { common: 'Canada' },
    flags: { png: 'ca.png' },
    region: 'Americas',
    population: 38000000,
    capital: ['Ottawa'],
    languages: { eng: 'English', fra: 'French' },
    latlng: [56, -106],
  },
  {
    cca2: 'FR',
    name: { common: 'France' },
    flags: { png: 'fr.png' },
    region: 'Europe',
    population: 67000000,
    capital: ['Paris'],
    languages: { fra: 'French' },
    latlng: [46, 2],
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  axios.get = vi.fn();    // <-- add this line
  axios.post = vi.fn();
  axios.delete = vi.fn();
});

test('renders loading and then country cards', async () => {
  axios.get
    .mockResolvedValueOnce({ data: mockCountries }) // countries
    .mockResolvedValueOnce({ data: { favorites: ['US'] } }); // favorites

  renderWithRouter(<Home />);
  expect(await screen.findByText(/let's explore the world/i)).toBeInTheDocument();
  expect(await screen.findByText(/united states/i)).toBeInTheDocument();
  expect(screen.getByText(/canada/i)).toBeInTheDocument();
  expect(screen.getByText(/france/i)).toBeInTheDocument();
  expect(screen.getAllByText(/view details/i)).toHaveLength(3);
});

test('shows error if countries fetch fails', async () => {
  axios.get.mockRejectedValueOnce(new Error('fail'));
  renderWithRouter(<Home />);
  expect(await screen.findByText(/failed to fetch countries/i)).toBeInTheDocument();
});

test('shows "No countries found" if filter returns nothing', async () => {
  axios.get
    .mockResolvedValueOnce({ data: mockCountries })
    .mockResolvedValueOnce({ data: { favorites: [] } });

  renderWithRouter(<Home />);
  const input = screen.getByPlaceholderText(/search countries/i);
  fireEvent.change(input, { target: { value: 'xyznotacountry' } });
  await waitFor(() => {
    expect(screen.getByText(/no countries found/i)).toBeInTheDocument();
  });
});

test('can add and remove favorites', async () => {
  axios.get
    .mockResolvedValueOnce({ data: mockCountries }) // countries
    .mockResolvedValueOnce({ data: { favorites: [] } }) // initial favorites
    .mockResolvedValueOnce({ data: { favorites: [] } }); // favorites after removal
  axios.post = vi.fn().mockResolvedValueOnce({ data: { favorites: ['US'] } });
  axios.delete = vi.fn().mockResolvedValueOnce({ data: { favorites: [] } });

  localStorage.setItem('token', 'testtoken');
  renderWithRouter(<Home />);
  const addBtns = await screen.findAllByText(/add to favorites/i);
  fireEvent.click(addBtns[0]);
  await waitFor(() => {
    expect(axios.post).toHaveBeenCalled();
    expect(screen.getByText(/remove from favorites/i)).toBeInTheDocument();
  });

  const removeBtn = screen.getByText(/remove from favorites/i);
  fireEvent.click(removeBtn);
  await waitFor(async () => {
    expect(axios.delete).toHaveBeenCalled();
    await expect(screen.findAllByText(/add to favorites/i)).resolves.toBeTruthy();
  });
});

test('shows warning if not logged in and tries to add favorite', async () => {
  axios.get
    .mockResolvedValueOnce({ data: mockCountries })
    .mockResolvedValueOnce({ data: { favorites: [] } });

  renderWithRouter(<Home />);
  const addBtns = await screen.findAllByText(/add to favorites/i);
  fireEvent.click(addBtns[0]);
  await waitFor(() => {
    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
  });
});

test('pagination works', async () => {
  const manyCountries = Array.from({ length: 12 }, (_, i) => ({
    cca2: `C${i}`,
    name: { common: `Country${i}` },
    flags: { png: `country${i}.png` },
    region: i % 2 === 0 ? 'Americas' : 'Europe',
    population: 1000000 + i,
    capital: [`Capital${i}`],
    languages: { eng: `Language${i}` },
    latlng: [0, 0],
  }));

  axios.get.mockImplementation((url) => {
    if (url.includes('favorites')) return Promise.resolve({ data: { favorites: [] } });
    return Promise.resolve({ data: manyCountries });
  });

  renderWithRouter(<Home />);
  // Only Country0 should be on the first page
  await waitFor(() => {
    expect(screen.getByText('Country0')).toBeInTheDocument();
  });
  expect(screen.queryByText('Country8')).not.toBeInTheDocument();
  expect(screen.queryByText('Country9')).not.toBeInTheDocument();

  // Go to next page
  fireEvent.click(screen.getByRole('button', { name: /next/i }));
  await waitFor(() => {
    expect(screen.getByText('Country8')).toBeInTheDocument();
    expect(screen.getByText('Country9')).toBeInTheDocument();
  });
});

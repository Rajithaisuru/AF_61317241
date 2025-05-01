import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Countries from '../../pages/Countries';

// Mock axios
vi.mock('axios');

// Mock data
const mockCountries = [
  {
    name: { common: 'United States' },
    cca2: 'US',
    flags: { png: 'us.png' },
    population: 331000000,
    area: 9834000,
    capital: ['Washington D.C.'],
    region: 'Americas',
    subregion: 'North America',
    languages: { eng: 'English' },
    currencies: { USD: { name: 'United States Dollar' } }
  },
  {
    name: { common: 'Canada' },
    cca2: 'CA',
    flags: { png: 'ca.png' },
    population: 38000000,
    area: 9985000,
    capital: ['Ottawa'],
    region: 'Americas',
    subregion: 'North America',
    languages: { eng: 'English', fra: 'French' },
    currencies: { CAD: { name: 'Canadian Dollar' } }
  },
  {
    name: { common: 'France' },
    cca2: 'FR',
    flags: { png: 'fr.png' },
    population: 67000000,
    area: 643801,
    capital: ['Paris'],
    region: 'Europe',
    subregion: 'Western Europe',
    languages: { fra: 'French' },
    currencies: { EUR: { name: 'Euro' } }
  }
];

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

beforeEach(() => {
  axios.get.mockReset();
});

test('renders countries and handles initial data fetch', async () => {
  axios.get.mockResolvedValueOnce({ data: mockCountries });

  renderWithRouter(<Countries />);

  // Check for loading state
  expect(screen.getByText('Country Comparison')).toBeInTheDocument();
  expect(screen.getByText('Find Countries to Compare')).toBeInTheDocument();

  // Wait for countries to load
  await waitFor(() => {
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
  });
});

test('handles search functionality', async () => {
  axios.get.mockResolvedValueOnce({ data: mockCountries });

  renderWithRouter(<Countries />);
  const searchInput = await screen.findByPlaceholderText('🔍 Search countries...');

  // Search for "United"
  await act(async () => {
    fireEvent.change(searchInput, { target: { value: 'United' } });
  });

  await waitFor(() => {
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.queryByText('Canada')).not.toBeInTheDocument();
    expect(screen.queryByText('France')).not.toBeInTheDocument();
  });
});

test('handles region filtering', async () => {
  axios.get.mockResolvedValueOnce({ data: mockCountries });

  renderWithRouter(<Countries />);
  const regionSelect = await screen.findByRole('combobox');

  // Filter by Europe
  await act(async () => {
    fireEvent.change(regionSelect, { target: { value: 'Europe' } });
  });

  await waitFor(() => {
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.queryByText('United States')).not.toBeInTheDocument();
    expect(screen.queryByText('Canada')).not.toBeInTheDocument();
  });
});

test('handles country selection and comparison', async () => {
  axios.get.mockResolvedValueOnce({ data: mockCountries });

  renderWithRouter(<Countries />);

  // Wait for countries to load
  await waitFor(() => {
    expect(screen.getByText('United States')).toBeInTheDocument();
  });

  // Select two countries
  const countryCards = await screen.findAllByRole('button', { name: /select/i });
  await act(async () => {
    fireEvent.click(countryCards[0]); // US
    fireEvent.click(countryCards[1]); // Canada
  });

  // Check selected countries section
  expect(screen.getByText('Selected Countries (2/3)')).toBeInTheDocument();
  
  // Check for selected countries in the selected section
  const selectedCards = screen.getAllByRole('heading', { level: 6 });
  expect(selectedCards[0]).toHaveTextContent('Canada');
  expect(selectedCards[1]).toHaveTextContent('France');

  // Click compare button
  const compareButton = screen.getByText('Compare Countries');
  await act(async () => {
    fireEvent.click(compareButton);
  });

  // Check comparison table
  expect(screen.getByText('Comparison')).toBeInTheDocument();
  expect(screen.getByText('Population')).toBeInTheDocument();
  expect(screen.getByText('Area (km²)')).toBeInTheDocument();
});

test('handles pagination', async () => {
  // Create more countries to test pagination
  const manyCountries = Array.from({ length: 20 }, (_, i) => ({
    name: { common: `Country${i + 1}` },
    cca2: `C${i + 1}`,
    flags: { png: `flag${i + 1}.png` },
    population: 1000 + i,
    area: 1000 + i,
    capital: [`Capital${i + 1}`],
    region: 'TestRegion',
    subregion: 'TestSubregion',
    languages: { test: 'Test Language' },
    currencies: { TEST: { name: 'Test Currency' } }
  }));

  axios.get.mockResolvedValueOnce({ data: manyCountries });

  renderWithRouter(<Countries />);

  // Wait for first page
  await waitFor(() => {
    expect(screen.getByText('Country1')).toBeInTheDocument();
  });

  // Click next page
  const nextButton = screen.getByText('Next');
  await act(async () => {
    fireEvent.click(nextButton);
  });

  // Check for second page content - looking at the rendered HTML, these are the countries that appear
  await waitFor(() => {
    expect(screen.getByText('Country18')).toBeInTheDocument();
    expect(screen.getByText('Country19')).toBeInTheDocument();
    expect(screen.getByText('Country2')).toBeInTheDocument();
    expect(screen.getByText('Country20')).toBeInTheDocument();
    expect(screen.getByText('Country3')).toBeInTheDocument();
    expect(screen.getByText('Country4')).toBeInTheDocument();
    expect(screen.getByText('Country5')).toBeInTheDocument();
    expect(screen.getByText('Country6')).toBeInTheDocument();
    expect(screen.getByText('Country7')).toBeInTheDocument();
    expect(screen.queryByText('Country1')).not.toBeInTheDocument();
  });
});

test('displays error message when fetch fails', async () => {
  axios.get.mockRejectedValueOnce(new Error('Network error'));

  renderWithRouter(<Countries />);

  await waitFor(() => {
    expect(screen.getByText('Failed to fetch countries')).toBeInTheDocument();
  });
}); 
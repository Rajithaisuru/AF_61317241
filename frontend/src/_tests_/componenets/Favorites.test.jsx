import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Favorites from '../../components/Favorites';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../AuthContext';

// Mock react-toastify
vi.mock('react-toastify', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
        warning: vi.fn(),
    },
    ToastContainer: () => <div data-testid="toast-container" />,
}));

// Mock axios
vi.mock('axios');

const mockFavorites = ['US', 'CA'];
const mockCountryDetails = [
    {
        name: { common: 'United States' },
        flags: { png: 'us.png' },
        population: 331000000,
        region: 'Americas',
        capital: ['Washington D.C.'],
        cca2: 'US',
    },
    {
        name: { common: 'Canada' },
        flags: { png: 'ca.png' },
        population: 38000000,
        region: 'Americas',
        capital: ['Ottawa'],
        cca2: 'CA',
    },
];

const mockAllCountries = [
    {
        name: { common: 'France' },
        flags: { png: 'fr.png' },
        population: 67000000,
        region: 'Europe',
        capital: ['Paris'],
        cca2: 'FR',
    },
    ...mockCountryDetails,
];

// Helper to wrap with AuthContext and Router
function renderWithRouter(ui, authValue = { isLoggedIn: true }) {
    return render(
        <AuthContext.Provider value={authValue}>
            <BrowserRouter>{ui}</BrowserRouter>
        </AuthContext.Provider>
    );
}

beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    axios.get.mockReset();
    axios.post.mockReset();
    axios.delete.mockReset();
});

afterEach(() => {
    localStorage.clear();
});

test('renders favorites and all countries', async () => {
    axios.get
        .mockResolvedValueOnce({ data: { favorites: mockFavorites } }) // fetchFavorites
        .mockResolvedValueOnce({ data: [mockCountryDetails[0]] }) // US details
        .mockResolvedValueOnce({ data: [mockCountryDetails[1]] }) // CA details
        .mockResolvedValueOnce({ data: mockAllCountries }); // all countries

    renderWithRouter(<Favorites />);

    expect(await screen.findByText('My Favorite Countries')).toBeInTheDocument();
    expect(await screen.findByText('United States')).toBeInTheDocument();
    expect(await screen.findByText('Canada')).toBeInTheDocument();
    expect(await screen.findByText('All Countries')).toBeInTheDocument();

    await waitFor(() => {
        const franceTitle = screen.getByText('France');
        expect(franceTitle).toBeInTheDocument();
    }, { timeout: 3000 });
});

test('shows login warning if no token', () => {
    localStorage.removeItem('token');
    renderWithRouter(<Favorites />);
    expect(screen.getByText(/Please log in to view favorites/i)).toBeInTheDocument();
});

test('can add a country to favorites', async () => {
    axios.get
        .mockResolvedValueOnce({ data: { favorites: [] } }) // fetchFavorites
        .mockResolvedValueOnce({ data: mockAllCountries }); // all countries

    axios.get.mockResolvedValueOnce({ data: [mockCountryDetails[0]] }); // fetchCountryDetails by name
    axios.post.mockResolvedValueOnce({ data: { favorites: ['US'] } }); // add to favorites

    renderWithRouter(<Favorites />);
    const input = await screen.findByPlaceholderText(/Search or add country by name or code/i);
    fireEvent.change(input, { target: { value: 'United States' } });
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
        expect(axios.post).toHaveBeenCalled();
    });
});

test('can remove a country from favorites', async () => {
    axios.get
        .mockResolvedValueOnce({ data: { favorites: mockFavorites } }) // fetchFavorites
        .mockResolvedValueOnce({ data: [mockCountryDetails[0]] }) // US details
        .mockResolvedValueOnce({ data: [mockCountryDetails[1]] }) // CA details
        .mockResolvedValueOnce({ data: mockAllCountries }); // all countries

    axios.delete.mockResolvedValueOnce({ data: { favorites: ['CA'] } });

    renderWithRouter(<Favorites />);
    const removeButtons = await screen.findAllByText(/Remove/i);
    fireEvent.click(removeButtons[0]);
    await waitFor(() => {
        expect(axios.delete).toHaveBeenCalled();
    });
});

// Additional tests

test('displays error if fetching favorites fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'));
    renderWithRouter(<Favorites />);
    expect(await screen.findByText(/Failed to fetch favorites/i)).toBeInTheDocument();
});

test('displays error if fetching country details fails', async () => {
    axios.get
        .mockResolvedValueOnce({ data: { favorites: mockFavorites } }) // fetchFavorites
        .mockRejectedValueOnce(new Error('Country details error')); // country details
    renderWithRouter(<Favorites />);
    expect(await screen.findByText(/Failed to fetch country details/i)).toBeInTheDocument();
});

test('displays error if adding favorite fails', async () => {
    axios.get
        .mockResolvedValueOnce({ data: { favorites: [] } }) // fetchFavorites
        .mockResolvedValueOnce({ data: mockAllCountries }); // all countries

    axios.get.mockResolvedValueOnce({ data: [mockCountryDetails[0]] }); // fetchCountryDetails by name
    axios.post.mockRejectedValueOnce({ response: { data: { message: 'Already exists' } } });

    renderWithRouter(<Favorites />);
    const input = await screen.findByPlaceholderText(/Search or add country by name or code/i);
    fireEvent.change(input, { target: { value: 'United States' } });
    fireEvent.click(screen.getByText('Add'));

    expect(await screen.findByText(/Already exists/i)).toBeInTheDocument();
});

test('displays error if removing favorite fails', async () => {
    axios.get
        .mockResolvedValueOnce({ data: { favorites: mockFavorites } }) // fetchFavorites
        .mockResolvedValueOnce({ data: [mockCountryDetails[0]] }) // US details
        .mockResolvedValueOnce({ data: [mockCountryDetails[1]] }) // CA details
        .mockResolvedValueOnce({ data: mockAllCountries }); // all countries

    axios.delete.mockRejectedValueOnce({ response: { data: { message: 'Remove failed' } } });

    renderWithRouter(<Favorites />);
    const removeButtons = await screen.findAllByText(/Remove/i);
    fireEvent.click(removeButtons[0]);
    expect(await screen.findByText(/Remove failed/i)).toBeInTheDocument();
});

test('pagination controls work for all countries', async () => {
    const manyCountries = Array.from({ length: 20 }, (_, i) => ({
        name: { common: `Country${i + 1}` },
        flags: { png: `flag${i + 1}.png` },
        population: 1000 + i,
        region: 'TestRegion',
        capital: [`Capital${i + 1}`],
        cca2: `C${i + 1}`,
    }));

    axios.get
        .mockResolvedValueOnce({ data: { favorites: [] } }) // fetchFavorites
        .mockResolvedValueOnce({ data: manyCountries }); // all countries

    renderWithRouter(<Favorites />);
    expect(await screen.findByText('Country1')).toBeInTheDocument();

    const nextBtn = await screen.findByText('Next');
    fireEvent.click(nextBtn);

    expect(await screen.findByText('Country18')).toBeInTheDocument();
});

test('Add button uppercases input value for country code', async () => {
    axios.get
        .mockResolvedValueOnce({ data: { favorites: [] } })
        .mockResolvedValueOnce({ data: [] });

    renderWithRouter(<Favorites />);
    const input = await screen.findByPlaceholderText(/Search or add country by name or code/i);
    fireEvent.change(input, { target: { value: 'ca' } });
    expect(input.value).toBe('CA');
});

test('Add button does not submit if input is empty', async () => {
    axios.get
        .mockResolvedValueOnce({ data: { favorites: [] } })
        .mockResolvedValueOnce({ data: [] });

    renderWithRouter(<Favorites />);
    const input = await screen.findByPlaceholderText(/Search or add country by name or code/i);
    await act(async () => {
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.click(screen.getByText('Add'));
    });
    expect(axios.post).not.toHaveBeenCalled();
});

test('shows loading state for Add to Favorites button if needed', async () => {
    const countries = [
        {
            name: { common: 'Country4' },
            flags: { png: 'flag4.png' },
            population: 1003,
            region: 'TestRegion',
            capital: ['Capital4'],
            cca2: 'C4',
        },
    ];
    axios.get
        .mockResolvedValueOnce({ data: { favorites: [] } })
        .mockResolvedValueOnce({ data: countries });
    let resolvePost;
    axios.post.mockImplementationOnce(() => new Promise(resolve => { resolvePost = resolve; }));

    renderWithRouter(<Favorites />);
    const addBtn = await screen.findByText('Add to Favorites');
    await act(async () => {
        fireEvent.click(addBtn);
    });
    await act(async () => {
        resolvePost({ data: { favorites: ['C4'] } });
    });
});

test('renders correct details for a country card in All Countries', async () => {
    const countries = [
        {
            name: { common: 'Country4' },
            flags: { png: 'flag4.png' },
            population: 1003,
            region: 'TestRegion',
            capital: ['Capital4'],
            cca2: 'C4',
        },
    ];
    axios.get
        .mockResolvedValueOnce({ data: { favorites: [] } })
        .mockResolvedValueOnce({ data: countries });

    renderWithRouter(<Favorites />);
    const card = await screen.findByText('Country4');
    const cardNode = card.closest('.card');
    expect(cardNode).toHaveTextContent('C4');
    expect(cardNode).toHaveTextContent('1,003');
    expect(cardNode).toHaveTextContent('TestRegion');
    expect(cardNode).toHaveTextContent('Capital4');
});

test('View Details link in All Countries card navigates to correct route', async () => {
    const countries = [
        {
            name: { common: 'Country4' },
            flags: { png: 'flag4.png' },
            population: 1003,
            region: 'TestRegion',
            capital: ['Capital4'],
            cca2: 'C4',
        },
    ];
    axios.get
        .mockResolvedValueOnce({ data: { favorites: [] } })
        .mockResolvedValueOnce({ data: countries });

    renderWithRouter(<Favorites />);
    const detailsLink = await screen.findByRole('link', { name: /View Details/i });
    expect(detailsLink.getAttribute('href')).toBe('/country/C4');
});

test('Add to Favorites button calls API and disables while loading', async () => {
    const countries = [
        {
            name: { common: 'Country4' },
            flags: { png: 'flag4.png' },
            population: 1003,
            region: 'TestRegion',
            capital: ['Capital4'],
            cca2: 'C4',
        },
    ];
    axios.get
        .mockResolvedValueOnce({ data: { favorites: [] } })
        .mockResolvedValueOnce({ data: countries });
    axios.post.mockResolvedValueOnce({ data: { favorites: ['C4'] } });

    renderWithRouter(<Favorites />);
    const addBtn = await screen.findByText('Add to Favorites');
    fireEvent.click(addBtn);
    await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
            'http://localhost:5005/api/favorites/add',
            { countryCode: 'C4' },
            expect.any(Object)
        );
    });
});

test('shows error toast if Add to Favorites fails from All Countries', async () => {
    const countries = [
        {
            name: { common: 'Country4' },
            flags: { png: 'flag4.png' },
            population: 1003,
            region: 'TestRegion',
            capital: ['Capital4'],
            cca2: 'C4',
        },
    ];
    axios.get
        .mockResolvedValueOnce({ data: { favorites: [] } })
        .mockResolvedValueOnce({ data: countries });
    axios.post.mockRejectedValueOnce({ response: { data: { message: 'Add failed' } } });

    renderWithRouter(<Favorites />);
    const addBtn = await screen.findByText('Add to Favorites');
    fireEvent.click(addBtn);
    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Add failed');
    });
});

test('pagination: clicking page number navigates to correct page', async () => {
    const manyCountries = Array.from({ length: 20 }, (_, i) => ({
        name: { common: `Country${i + 1}` },
        flags: { png: `flag${i + 1}.png` },
        population: 1000 + i,
        region: 'TestRegion',
        capital: [`Capital${i + 1}`],
        cca2: `C${i + 1}`,
    }));

    axios.get
        .mockResolvedValueOnce({ data: { favorites: [] } })
        .mockResolvedValueOnce({ data: manyCountries });

    renderWithRouter(<Favorites />);
    expect(await screen.findByText('Country1')).toBeInTheDocument();
    const page2Btn = await screen.findByRole('button', { name: '2' });
    fireEvent.click(page2Btn);
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
    }, { timeout: 3000 });
});

test('pagination: Previous/Next buttons are disabled on first/last page', async () => {
    const manyCountries = Array.from({ length: 15 }, (_, i) => ({
        name: { common: `Country${i + 1}` },
        flags: { png: `flag${i + 1}.png` },
        population: 1000 + i,
        region: 'TestRegion',
        capital: [`Capital${i + 1}`],
        cca2: `C${i + 1}`,
    }));

    axios.get
        .mockResolvedValueOnce({ data: { favorites: [] } })
        .mockResolvedValueOnce({ data: manyCountries });

    renderWithRouter(<Favorites />);
    const prevBtn = await screen.findByRole('button', { name: 'Previous' });
    expect(prevBtn.closest('li')).toHaveClass('disabled');
    const page2Btn = await screen.findByRole('button', { name: '2' });
    fireEvent.click(page2Btn);
    const nextBtn = await screen.findByRole('button', { name: 'Next' });
    expect(nextBtn.closest('li')).toHaveClass('disabled');
});

// --- NEW TESTS BELOW ---

test('filters countries by region', async () => {
    axios.get
        .mockResolvedValueOnce({ data: { favorites: [] } })
        .mockResolvedValueOnce({ data: mockAllCountries });

    renderWithRouter(<Favorites />);
    const select = await screen.findByRole('combobox');
    fireEvent.change(select, { target: { value: 'Europe' } });
    expect(await screen.findByText('France')).toBeInTheDocument();
    expect(screen.queryByText('United States')).not.toBeInTheDocument();
});

test('search filters countries by name', async () => {
    axios.get
        .mockResolvedValueOnce({ data: { favorites: [] } })
        .mockResolvedValueOnce({ data: mockAllCountries });

    renderWithRouter(<Favorites />);
    const input = await screen.findByPlaceholderText(/Search or add country by name or code/i);
    fireEvent.change(input, { target: { value: 'fran' } });
    expect(await screen.findByText('France')).toBeInTheDocument();
    expect(screen.queryByText('Canada')).not.toBeInTheDocument();
});

test('search filters countries by code', async () => {
    axios.get
        .mockResolvedValueOnce({ data: { favorites: [] } })
        .mockResolvedValueOnce({ data: mockAllCountries });

    renderWithRouter(<Favorites />);
    const input = await screen.findByPlaceholderText(/Search or add country by name or code/i);
    fireEvent.change(input, { target: { value: 'CA' } });
    expect(await screen.findByText('Canada')).toBeInTheDocument();
    expect(screen.queryByText('France')).not.toBeInTheDocument();
});

test('shows "No countries found" if search yields no results', async () => {
    axios.get
        .mockResolvedValueOnce({ data: { favorites: [] } })
        .mockResolvedValueOnce({ data: mockAllCountries });

    renderWithRouter(<Favorites />);
    const input = await screen.findByPlaceholderText(/Search or add country by name or code/i);
    fireEvent.change(input, { target: { value: 'ZZZ' } });
    expect(await screen.findByText('No countries found.')).toBeInTheDocument();
});

test('shows "No favorite countries added yet." if favorites is empty', async () => {
    axios.get
        .mockResolvedValueOnce({ data: { favorites: [] } })
        .mockResolvedValueOnce({ data: mockAllCountries });

    renderWithRouter(<Favorites />);
    expect(await screen.findByText('No favorite countries added yet.')).toBeInTheDocument();
});

test('Add to Favorites button is not shown for countries already in favorites', async () => {
    axios.get
        .mockResolvedValueOnce({ data: { favorites: ['CA'] } })
        .mockResolvedValueOnce({ data: [mockCountryDetails[1], mockCountryDetails[0]] }) // CA, US details
        .mockResolvedValueOnce({ data: [mockCountryDetails[0]] }) // US details
        .mockResolvedValueOnce({ data: mockAllCountries });

    renderWithRouter(<Favorites />);
    expect(await screen.findByText('Canada')).toBeInTheDocument();
    const removeBtn = await screen.findAllByText('Remove from Favorites');
    expect(removeBtn.length).toBeGreaterThan(0);
    expect(screen.queryByText('Add to Favorites')).toBeInTheDocument();
});

test('handles missing capital gracefully', async () => {
    const countries = [
        {
            name: { common: 'NowhereLand' },
            flags: { png: 'nowhere.png' },
            population: 0,
            region: 'Nowhere',
            capital: undefined,
            cca2: 'NW',
        },
    ];
    axios.get
        .mockResolvedValueOnce({ data: { favorites: [] } })
        .mockResolvedValueOnce({ data: countries });

    renderWithRouter(<Favorites />);
    expect(await screen.findByText('NowhereLand')).toBeInTheDocument();
    // Look for the capital line containing N/A
    const capitalLines = screen.getAllByText((content, node) =>
        node.textContent.includes('Capital:') && node.textContent.includes('N/A')
    );
    expect(capitalLines.length).toBeGreaterThan(0);
});

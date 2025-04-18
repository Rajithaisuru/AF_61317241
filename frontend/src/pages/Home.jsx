import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';

function MapController({ searchTerm, region, countries }) {
  const map = useMap();

  const regionCoordinates = {
    Africa: [1.0, 21.0, 3],
    Americas: [15.0, -80.0, 3],
    Asia: [30.0, 100.0, 3],
    Europe: [50.0, 15.0, 4],
    Oceania: [-25.0, 135.0, 4],
    Antarctica: [-80.0, 0.0, 2],
  };

  useEffect(() => {
    if (!map) return;

    if (searchTerm) {
      const matchedCountry = countries.find((country) =>
        country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (matchedCountry && matchedCountry.latlng) {
        const [lat, lng] = matchedCountry.latlng;
        map.setView([lat, lng], 5);
      } else {
        map.setView([0, 0], 2);
      }
    } else if (region && regionCoordinates[region]) {
      const [lat, lng, zoom] = regionCoordinates[region];
      map.setView([lat, lng], zoom);
    } else {
      map.setView([0, 0], 2);
    }
  }, [searchTerm, region, countries, map]);

  return null;
}

function Home() {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [region, setRegion] = useState('');
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState([]);
  const token = localStorage.getItem('token');

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleSearch = debounce((value) => {
    setSearchTerm(value);
  }, 300);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(
          'https://restcountries.com/v3.1/all?fields=name,cca2,flags,region,population,capital,languages,latlng'
        );
        const sortedCountries = response.data.sort((a, b) =>
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sortedCountries);
        setFilteredCountries(sortedCountries);
      } catch (err) {
        setError('Failed to fetch countries');
        toast.error('Failed to fetch countries');
      }
    };

    const fetchFavorites = async () => {
      if (token) {
        try {
          const response = await axios.get('http://localhost:5005/api/favorites', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFavorites(response.data.favorites);
        } catch (err) {
          toast.error('Failed to fetch favorites');
        }
      }
    };

    fetchCountries();
    fetchFavorites();
  }, [token]);

  useEffect(() => {
    let filtered = countries;
    if (region || searchTerm) {
      filtered = countries.filter((country) => {
        const matchesRegion = region ? country.region === region : true;
        const matchesSearch = searchTerm
          ? country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
          : true;
        return matchesRegion && matchesSearch;
      });
    }
    setFilteredCountries(filtered);
  }, [searchTerm, region, countries]);

  const handleAddFavorite = async (countryCode, countryName) => {
    if (!token) {
      toast.warning('Please log in to add favorites');
      return;
    }
    try {
      const response = await axios.post(
        'http://localhost:5005/api/favorites/add',
        { countryCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFavorites(response.data.favorites);
      toast.success(`${countryName} added to favorites`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add favorite');
      toast.error(err.response?.data?.message || 'Failed to add favorite');
    }
  };

  const handleRemoveFavorite = async (countryCode, countryName) => {
    try {
      const response = await axios.delete(`http://localhost:5005/api/favorites/remove/${countryCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(response.data.favorites);
      toast.success(`${countryName} removed from favorites`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove favorite');
      toast.error(err.response?.data?.message || 'Failed to remove favorite');
    }
  };

  const regions = [...new Set(countries.map((country) => country.region))].filter(Boolean).sort();

  return (
    <div className="container py-4">
      <h1 className="display-4 text-center mb-4">Let's Explore the World!</h1>

      <div className="mb-4">
        <MapContainer
          center={[0, 0]}
          zoom={2}
          style={{ height: '400px', width: '100%', borderRadius: '8px' }}
          className="leaflet-container"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapController searchTerm={searchTerm} region={region} countries={countries} />
        </MapContainer>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search countries..."
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="col-md-6 mb-3">
          <select
            className="form-select"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="">All Regions</option>
            {regions.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {filteredCountries.length === 0 ? (
          <p>No countries found.</p>
        ) : (
          filteredCountries.map((country) => (
            <div key={country.cca2} className="col-md-4 mb-4">
              <div className="card h-100">
                <img
                  src={country.flags.png}
                  alt={`${country.name.common} flag`}
                  className="card-img-top"
                  style={{ height: '150px', objectFit: 'cover' }}
                />
                <div className="card-body">
                  <h5 className="card-title">{country.name.common}</h5>
                  <p className="card-text">
                    <strong>Code:</strong> {country.cca2}
                    <br />
                    <strong>Capital:</strong> {country.capital?.[0] || 'N/A'}
                    <br />
                    <strong>Region:</strong> {country.region}
                    <br />
                    <strong>Population:</strong> {country.population.toLocaleString()}
                    <br />
                    <strong>Languages:</strong>{' '}
                    {Object.values(country.languages || {}).join(', ') || 'N/A'}
                  </p>
                  <div className="d-flex gap-2">
                    {favorites.includes(country.cca2) ? (
                      <button
                        onClick={() => handleRemoveFavorite(country.cca2, country.name.common)}
                        className="btn btn-danger"
                      >
                        Remove from Favorites
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddFavorite(country.cca2, country.name.common)}
                        className="btn btn-primary"
                      >
                        Add to Favorites
                      </button>
                    )}
                    <Link to={`/country/${country.cca2}`} className="btn btn-primary">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default Home;
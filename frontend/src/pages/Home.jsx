import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function Home() {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [region, setRegion] = useState('');
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,cca2,flags,region,population,capital,languages');
        const sortedCountries = response.data.sort((a, b) => a.name.common.localeCompare(b.name.common));
        setCountries(sortedCountries);
        setFilteredCountries(sortedCountries);
      } catch (err) {
        setError('Failed to fetch countries');
        console.error('Fetch countries error:', err);
      }
    };

    const fetchFavorites = async () => {
      if (token) {
        try {
          const response = await axios.get('http://localhost:5005/api/favorites', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFavorites(response.data.map(fav => fav.countryCode));
        } catch (err) {
          console.error('Fetch favorites error:', err);
        }
      }
    };

    fetchCountries();
    fetchFavorites();
  }, [token]);

  useEffect(() => {
    let filtered = countries;
    if (searchTerm) {
      filtered = filtered.filter(country =>
        country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (region) {
      filtered = filtered.filter(country => country.region === region);
    }
    setFilteredCountries(filtered);
  }, [searchTerm, region, countries]);

  const handleAddFavorite = async (countryCode) => {
    if (!token) {
      alert('Please log in to add favorites');
      return;
    }
    try {
      await axios.post(
        'http://localhost:5005/api/favorites/add',
        { countryCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFavorites([...favorites, countryCode]);
      alert(`${countryCode} added to favorites`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add favorite');
      console.error('Add favorite error:', err);
    }
  };

  const handleRemoveFavorite = async (countryCode) => {
    try {
      await axios.delete('http://localhost:5005/api/favorites/remove', {
        headers: { Authorization: `Bearer ${token}` },
        data: { countryCode },
      });
      setFavorites(favorites.filter(code => code !== countryCode));
      alert(`${countryCode} removed from favorites`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove favorite');
      console.error('Remove favorite error:', err);
    }
  };

  const regions = [...new Set(countries.map(country => country.region))].filter(Boolean).sort();

  return (
    <div className="container py-4">
      <h1 className="display-4 text-center mb-4">Country Explorer</h1>
      
      {/* Interactive Map */}
      <div className="mb-4">
        <MapContainer
          center={[0, 0]}
          zoom={2}
          style={{ height: '400px', width: '100%', borderRadius: '8px' }}
          className="leaflet-container"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </MapContainer>
      </div>

      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              <option key={reg} value={reg}>{reg}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Country Cards */}
      <div className="row">
        {filteredCountries.map((country) => (
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
                  <strong>Code:</strong> {country.cca2}<br />
                  <strong>Capital:</strong> {country.capital?.[0] || 'N/A'}<br />
                  <strong>Region:</strong> {country.region}<br />
                  <strong>Population:</strong> {country.population.toLocaleString()}<br />
                  <strong>Languages:</strong> {Object.values(country.languages || {}).join(', ') || 'N/A'}
                </p>
                <div className="d-flex gap-2">
                  {favorites.includes(country.cca2) ? (
                    <button
                      onClick={() => handleRemoveFavorite(country.cca2)}
                      className="btn btn-danger"
                    >
                      Remove from Favorites
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddFavorite(country.cca2)}
                      className="btn btn-primary"
                    >
                      Add to Favorites
                    </button>
                  )}
                  <Link to={`/country/${country.cca2}`} className="btn btn-outline-secondary">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
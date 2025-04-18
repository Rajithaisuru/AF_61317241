import { useState, useEffect } from 'react';
import axios from 'axios';

function Countries() {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const regions = ['All', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,cca2,flags,region,population,capital,languages');
        const sortedCountries = response.data.sort((a, b) => a.name.common.localeCompare(b.name.common));
        setCountries(sortedCountries);
        setFilteredCountries(sortedCountries);
      } catch (err) {
        setError('Failed to fetch countries');
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const filterCountries = async () => {
      try {
        let result = countries;
        if (search) {
          const response = await axios.get(`https://restcountries.com/v3.1/name/${search}?fields=name,cca2,flags,region,population,capital,languages`);
          result = response.data;
        } else if (region && region !== 'All') {
          const response = await axios.get(`https://restcountries.com/v3.1/region/${region}?fields=name,cca2,flags,region,population,capital,languages`);
          result = response.data.sort((a, b) => a.name.common.localeCompare(b.name.common));
        }
        setFilteredCountries(result);
      } catch (err) {
        setError('Invalid search term or no countries found');
      }
    };
    filterCountries();
  }, [search, region, countries]);

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
      alert(`${countryCode} added to favorites`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add favorite');
    }
  };

  return (
    <div className="container py-4">
      <h2 className="h2 mb-4">All Countries</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by country name"
              className="form-control"
            />
          </div>
          <div className="col-md-6">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="form-select"
            >
              <option value="">Select Region</option>
              {regions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
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
                <button
                  onClick={() => handleAddFavorite(country.cca2)}
                  className="btn btn-primary"
                >
                  Add to Favorites
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Countries;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_ENDPOINTS } from '../config';

function CountryDetail() {
  const { code } = useParams();
  const [country, setCountry] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await axios.get(`https://restcountries.com/v3.1/alpha/${code}`);
        setCountry(response.data[0]);
      } catch (err) {
        setError('Failed to fetch country details');
        toast.error('Failed to fetch country details');
      }
    };

    const fetchFavorites = async () => {
      if (!token) return; // Don't fetch favorites if not logged in
      try {
        const response = await axios.get(API_ENDPOINTS.FAVORITES.LIST, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFavorites(response.data.favorites || []);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchCountry();
    fetchFavorites();

    // Check for dark mode
    setIsDarkMode(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, [code, token]);

  const handleAddFavorite = async () => {
    if (!token) {
      toast.warning('Please log in to add favorites');
      return;
    }
    try {
      const response = await axios.post(
        API_ENDPOINTS.FAVORITES.ADD,
        { countryCode: code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFavorites(response.data.favorites || []);
      toast.success(`${country.name.common} added to favorites`);
    } catch (err) {
      console.error('Error adding favorite:', err);
      setError(err.response?.data?.message || 'Failed to add favorite');
      toast.error(err.response?.data?.message || 'Failed to add favorite');
    }
  };

  const handleRemoveFavorite = async () => {
    if (!token) {
      toast.warning('Please log in to remove favorites');
      return;
    }
    try {
      const response = await axios.delete(API_ENDPOINTS.FAVORITES.REMOVE(code), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(response.data.favorites || []);
      toast.success(`${country.name.common} removed from favorites`);
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError(err.response?.data?.message || 'Failed to remove favorite');
      toast.error(err.response?.data?.message || 'Failed to remove favorite');
    }
  };

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!country) {
    return <div className="container py-4">Loading...</div>;
  }

  const isFavorite = favorites.includes(code);
  const googleMapsUrl = country.name?.common
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(country.name.common)}`
    : null;

  return (
    <div className={`container py-4 ${isDarkMode ? 'dark-mode' : ''}`}>
      <h1 className={`h2 mb-4 ${isDarkMode ? 'text-light' : ''}`}>{country.name.common}</h1>
      <div className="row">
        <div className="col-md-6">
          <img
            src={country.flags.png}
            alt={`${country.name.common} flag`}
            className="img-fluid mb-3"
            style={{ maxHeight: '300px', objectFit: 'contain' }}
          />
          {token && (
            <div className="mb-3">
              {isFavorite ? (
                <button
                  onClick={handleRemoveFavorite}
                  className="btn btn-danger me-2"
                >
                  Remove from Favorites
                </button>
              ) : (
                <button
                  onClick={handleAddFavorite}
                  className="btn btn-success me-2"
                >
                  Add to Favorites
                </button>
              )}
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  View on Google Maps
                </a>
              )}
            </div>
          )}
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Country Details</h5>
              <p className="card-text">
                <strong>Official Name:</strong> {country.name.official}
                <br />
                <strong>Capital:</strong> {country.capital?.[0] || 'N/A'}
                <br />
                <strong>Region:</strong> {country.region}
                <br />
                <strong>Subregion:</strong> {country.subregion || 'N/A'}
                <br />
                <strong>Population:</strong> {country.population.toLocaleString()}
                <br />
                <strong>Area:</strong> {country.area.toLocaleString()} km²
                <br />
                <strong>Languages:</strong>{' '}
                {Object.values(country.languages || {}).join(', ') || 'N/A'}
                <br />
                <strong>Currencies:</strong>{' '}
                {Object.values(country.currencies || {})
                  .map((curr) => `${curr.name} (${curr.symbol})`)
                  .join(', ') || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default CountryDetail;

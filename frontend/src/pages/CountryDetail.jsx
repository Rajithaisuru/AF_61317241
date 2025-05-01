import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      if (token) {
        try {
          const response = await axios.get('http://localhost:5005/api/favorites', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFavorites(response.data.favorites);
        } catch (err) {
          console.error('Failed to fetch favorites:', err);
          toast.error('Failed to fetch favorites');
        }
      }
    };

    fetchCountry();
    fetchFavorites();

    // Check for dark mode (you can customize this as needed)
    setIsDarkMode(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, [code, token]);

  const handleAddFavorite = async () => {
    if (!token) {
      toast.warning('Please log in to add favorites');
      return;
    }
    try {
      await axios.post(
        'http://localhost:5005/api/favorites/add',
        { countryCode: code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFavorites((prev) => [...prev, code]);
      toast.success(`${country.name.common} added to favorites`);
    } catch (err) {
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
      await axios.delete(`http://localhost:5005/api/favorites/remove/${code}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites((prev) => prev.filter((fav) => fav !== code));
      toast.success(`${country.name.common} removed from favorites`);
    } catch (err) {
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
            style={{ maxHeight: '200px' }}
          />
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <p><strong>Official Name:</strong> {country.name.official}</p>
              <p><strong>Code:</strong> {country.cca2}</p>
              <p><strong>Capital:</strong> {country.capital?.[0] || 'N/A'}</p>
              <p><strong>Region:</strong> {country.region}</p>
              <p><strong>Subregion:</strong> {country.subregion || 'N/A'}</p>
              <p><strong>Population:</strong> {country.population.toLocaleString()}</p>
              <p><strong>Languages:</strong> {Object.values(country.languages || {}).join(', ') || 'N/A'}</p>
              <p><strong>Currencies:</strong> {Object.values(country.currencies || {})
                .map(c => `${c.name} (${c.symbol})`).join(', ') || 'N/A'}</p>
              <p><strong>Borders:</strong> {country.borders?.join(', ') || 'None'}</p>
              <div className="d-flex gap-2">
                {isFavorite ? (
                  <button onClick={handleRemoveFavorite} className="btn btn-danger">
                    Remove from Favorites
                  </button>
                ) : (
                  <button onClick={handleAddFavorite} className="btn btn-primary">
                    Add to Favorites
                  </button>
                )}
                {googleMapsUrl && (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-info"
                  >
                    View Country on Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default CountryDetail;

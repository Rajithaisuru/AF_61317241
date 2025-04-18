import { useState, useEffect } from 'react';
import axios from 'axios';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [countryDetails, setCountryDetails] = useState({});
  const [countryCode, setCountryCode] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axios.get('http://localhost:5005/api/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(response.data.favorites);
      } catch (err) {
        setError('Failed to fetch favorites');
      }
    };
    if (token) fetchFavorites();
  }, [token]);

  useEffect(() => {
    const fetchCountryDetails = async () => {
      try {
        const details = {};
        for (const code of favorites) {
          const response = await axios.get(`https://restcountries.com/v3.1/alpha/${code}`);
          const country = response.data[0];
          details[code] = {
            name: country.name.common,
            flag: country.flags.png,
          };
        }
        setCountryDetails(details);
      } catch (err) {
        setError('Failed to fetch country details');
      }
    };
    if (favorites.length > 0) fetchCountryDetails();
  }, [favorites]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5005/api/favorites/add',
        { countryCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFavorites(response.data.favorites);
      setCountryCode('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add favorite');
    }
  };

  const handleRemove = async (code) => {
    try {
      const response = await axios.delete(`http://localhost:5005/api/favorites/remove/${code}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(response.data.favorites);
      setError('');
    } catch (err) {
      setError('Failed to remove favorite');
    }
  };

  if (!token) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">Please log in to view favorites.</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="h2 mb-4">My Favorite Countries</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleAdd} className="mb-4 d-flex gap-2">
        <input
          type="text"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
          placeholder="Enter country code (e.g., CA)"
          className="form-control"
        />
        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </form>
      <ul className="list-group">
        {favorites.map((code) => (
          <li key={code} className="list-group-item d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              {countryDetails[code] && (
                <>
                  <img
                    src={countryDetails[code].flag}
                    alt={`${countryDetails[code].name} flag`}
                    style={{ width: '32px', height: '24px' }}
                  />
                  <span>{countryDetails[code].name} ({code})</span>
                </>
              )}
            </div>
            <button
              onClick={() => handleRemove(code)}
              className="btn btn-danger btn-sm"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Favorites;
import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      toast.error('You must be logged in to access your profile.');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:5005/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        toast.success('User data loaded successfully!');
      } catch (err) {
        setError('Failed to fetch user data');
        toast.error('Failed to load user data.');
      }
    };

    const fetchFavorites = async () => {
      try {
        const response = await axios.get('http://localhost:5005/api/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const favoritesData = response.data.favorites || [];
        const countryDetails = await Promise.all(
          favoritesData.map((code) =>
            axios
              .get(
                `https://restcountries.com/v3.1/alpha/${code}?fields=name,cca2,flags,region,population,capital,languages`
              )
              .catch((err) => {
                console.error(`Failed to fetch country ${code}:`, err);
                return null;
              })
          )
        );
        const validCountries = countryDetails
          .filter((res) => res && res.data)
          .map((res) => res.data)
          .sort((a, b) => a.name.common.localeCompare(b.name.common));
        setFavorites(validCountries);
      } catch (err) {
        setError('Failed to fetch favorite countries');
        toast.error('Failed to load favorite countries.');
      }
    };

    fetchUser();
    fetchFavorites();
  }, [token, navigate]);

  const handleRemoveFavorite = async (countryCode, countryName) => {
    try {
      await axios.delete(`http://localhost:5005/api/favorites/remove/${countryCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(favorites.filter((fav) => fav.cca2 !== countryCode));
      toast.success(`${countryName} removed from favorites!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove favorite');
      toast.error('Failed to remove favorite country.');
    }
  };

  if (!user) {
    return <div className="container py-4 text-center">Loading...</div>;
  }

  return (
    <div className="container py-4">
      <h1 className="display-4 text-center mb-5 profile-title">Your Profile</h1>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card user-card mb-5">
            <div className="card-body">
              <h5 className="card-title mb-4">User Information</h5>
              <div className="user-info">
                <p className="card-text">
                  <strong>Name:</strong> {user.name || 'N/A'}
                  <br />
                  <strong>Email:</strong> {user.email}
                  <br />
                  <strong>Phone:</strong> {user.phone || 'N/A'}
                  <br />
                  <strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <h2 className="h4 mb-4 favorite-title">Favorite Countries</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {favorites.length === 0 ? (
        <p className="text-center">
          No favorite countries added yet.
          <Link to="/" className="btn btn-primary btn-glow mt-3">
            Explore Countries
          </Link>
        </p>
      ) : (
        <div className="row">
          {favorites.map((country, index) => (
            <div key={country.cca2} className="col-md-4 mb-4">
              <div className="card country-card h-100" style={{ animationDelay: `${index * 0.1}s` }}>
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
                    <button
                      onClick={() => handleRemoveFavorite(country.cca2, country.name.common)}
                      className="btn btn-danger btn-glow"
                    >
                      Remove
                    </button>
                    <Link to={`/country/${country.cca2}`} className="btn btn-primary">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default Profile;

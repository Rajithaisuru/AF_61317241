import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:5005/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('User data:', response.data);
        setUser(response.data);
      } catch (err) {
        setError('Failed to fetch user data');
        console.error('User fetch error:', err);
      }
    };

    const fetchFavorites = async () => {
      try {
        const response = await axios.get('http://localhost:5005/api/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Favorites response:', response.data);
        const favoritesData = response.data.favorites || [];
        if (!favoritesData.length) {
          setFavorites([]);
          return;
        }
        const countryCodes = favoritesData.filter(code => code);
        console.log('Country codes:', countryCodes);
        if (!countryCodes.length) {
          setFavorites([]);
          return;
        }
        const countryDetails = await Promise.all(
          countryCodes.map(code =>
            axios.get(`https://restcountries.com/v3.1/alpha/${code}?fields=name,cca2,flags,region,population,capital,languages`).catch(err => {
              console.error(`Failed to fetch country ${code}:`, err);
              return null;
            })
          )
        );
        const validCountries = countryDetails
          .filter(res => res && res.data)
          .map(res => res.data)
          .sort((a, b) => a.name.common.localeCompare(b.name.common));
        console.log('Fetched countries:', validCountries);
        setFavorites(validCountries);
      } catch (err) {
        setError('Failed to fetch favorite countries');
        console.error('Favorites fetch error:', err);
      }
    };

    fetchUser();
    fetchFavorites();
  }, [token, navigate]);

  const handleRemoveFavorite = async (countryCode) => {
    try {
      await axios.delete('http://localhost:5005/api/favorites/remove', {
        headers: { Authorization: `Bearer ${token}` },
        data: { countryCode },
      });
      setFavorites(favorites.filter(fav => fav.cca2 !== countryCode));
      alert(`${countryCode} removed from favorites`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove favorite');
      console.error('Remove favorite error:', err);
    }
  };

  if (!user) {
    return <div className="container py-4 text-center">Loading...</div>;
  }

  console.log('Rendering Favorite Countries title'); // Debug log

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
                  <strong>Name:</strong> {user.name || 'N/A'}<br />
                  <strong>Email:</strong> {user.email}<br />
                  <strong>Phone:</strong> {user.phone || 'N/A'}<br />
                  <strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <h2
        className="h4 mb-4 favorite-title"
        style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '1.75rem' }}
      >
        Favorite Countries
      </h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {favorites.length === 0 ? (
        <p className="text-center">No favorite countries added yet. <Link to="/">Explore countries</Link> to add some!</p>
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
                    <strong>Code:</strong> {country.cca2}<br />
                    <strong>Capital:</strong> {country.capital?.[0] || 'N/A'}<br />
                    <strong>Region:</strong> {country.region}<br />
                    <strong>Population:</strong> {country.population.toLocaleString()}<br />
                    <strong>Languages:</strong> {Object.values(country.languages || {}).join(', ') || 'N/A'}
                  </p>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => handleRemoveFavorite(country.cca2)}
                      className="btn btn-danger btn-glow"
                    >
                      Remove
                    </button>
                    <Link to={`/country/${country.cca2}`} className="btn btn-outline-secondary btn-glow">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Profile;
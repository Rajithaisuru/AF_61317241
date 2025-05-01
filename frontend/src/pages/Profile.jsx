import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_ENDPOINTS } from '../config';

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
        const response = await axios.get(API_ENDPOINTS.AUTH.ME, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        toast.success('User data loaded successfully!');
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to fetch user data');
        toast.error('Failed to load user data.');
      }
    };

    const fetchFavorites = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.FAVORITES.LIST, {
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
        console.error('Error fetching favorites:', err);
        setError('Failed to fetch favorite countries');
        toast.error('Failed to load favorite countries.');
      }
    };

    fetchUser();
    fetchFavorites();
  }, [token, navigate]);

  const handleRemoveFavorite = async (countryCode, countryName) => {
    try {
      await axios.delete(API_ENDPOINTS.FAVORITES.REMOVE(countryCode), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(favorites.filter((fav) => fav.cca2 !== countryCode));
      toast.success(`${countryName} removed from favorites!`);
    } catch (err) {
      console.error('Error removing favorite:', err);
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
                </p>
              </div>
            </div>
          </div>

          <div className="card favorites-card">
            <div className="card-body">
              <h5 className="card-title mb-4">Favorite Countries</h5>
              {favorites.length === 0 ? (
                <p className="text-center">No favorite countries yet.</p>
              ) : (
                <div className="row">
                  {favorites.map((country) => (
                    <div key={country.cca2} className="col-md-4 mb-4">
                      <div className="card h-100">
                        <img
                          src={country.flags.png}
                          className="card-img-top"
                          alt={`${country.name.common} flag`}
                        />
                        <div className="card-body">
                          <h5 className="card-title">{country.name.common}</h5>
                          <p className="card-text">
                            <strong>Region:</strong> {country.region}
                            <br />
                            <strong>Population:</strong>{' '}
                            {country.population.toLocaleString()}
                            <br />
                            <strong>Capital:</strong>{' '}
                            {country.capital ? country.capital[0] : 'N/A'}
                          </p>
                          <button
                            className="btn btn-danger"
                            onClick={() =>
                              handleRemoveFavorite(
                                country.cca2,
                                country.name.common
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Profile;

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [countryDetails, setCountryDetails] = useState({});
  const [countryCode, setCountryCode] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  // Fetch favorite countries
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axios.get('http://localhost:5005/api/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(response.data.favorites);
      } catch (err) {
        setError('Failed to fetch favorites');
        toast.error('Failed to fetch favorites');
      }
    };
    if (token) fetchFavorites();
  }, [token]);

  // Fetch country details (flags, names)
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
            population: country.population,
            region: country.region,
            capital: country.capital ? country.capital[0] : 'N/A',
          };
        }
        setCountryDetails(details);
      } catch (err) {
        setError('Failed to fetch country details');
        toast.error('Failed to fetch country details');
      }
    };
    if (favorites.length > 0) fetchCountryDetails();
  }, [favorites]);

  // Add country to favorites
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      // Fetch country details by common name
      const countryResponse = await axios.get(
        `https://restcountries.com/v3.1/name/${countryCode}`
      );
      const country = countryResponse.data[0];
      const countryAlphaCode = country.cca2; // Get the alpha-2 code of the country

      // Add the country to favorites using its alpha-2 code
      const response = await axios.post(
        'http://localhost:5005/api/favorites/add',
        { countryCode: countryAlphaCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFavorites(response.data.favorites);
      setCountryCode('');
      setError('');
      toast.success(`Country (${country.name.common}) added successfully!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add favorite');
      toast.error(err.response?.data?.message || 'Failed to add favorite');
    }
  };

  // Remove country from favorites
  const handleRemove = async (countryCode) => {
    try {
      const response = await axios.delete(`http://localhost:5005/api/favorites/remove/${countryCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(response.data.favorites);
      toast.success(`Country (${countryCode}) removed successfully!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove favorite');
      toast.error(err.response?.data?.message || 'Failed to remove favorite');
    }
  };

  if (!token) {
    toast.warning('Please log in to view favorites.');
    return (
      <div className="container py-4">
        <div className="alert alert-warning">Please log in to view favorites.</div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="display-4 text-center mb-5">My Favorite Countries</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <h3 className="text-center mb-3">Add Your Favorite Country Below!</h3> {/* Attractive heading */}
      
      <form onSubmit={handleAdd} className="mb-4 d-flex gap-2">
        <input
          type="text"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
          placeholder="Enter country code (e.g., CA) or common name"
          className="form-control"
        />
        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </form>
      {favorites.length === 0 ? (
        <p className="text-center">
          No favorite countries added yet.
        </p>
      ) : (
        <div className="row">
          {favorites.map((code, index) => (
            <div key={code} className="col-md-4 mb-4">
              <div className="card country-card h-100 shadow-sm" style={{ animationDelay: `${index * 0.1}s` }}>
                {countryDetails[code] && (
                  <>
                    <img
                      src={countryDetails[code].flag}
                      alt={`${countryDetails[code].name} flag`}
                      className="card-img-top"
                      style={{ height: '150px', objectFit: 'cover' }}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{countryDetails[code].name}</h5>
                      <p className="card-text">
                        <strong>Code:</strong> {code}
                        <br />
                        <strong>Population:</strong> {countryDetails[code].population.toLocaleString()}
                        <br />
                        <strong>Region:</strong> {countryDetails[code].region}
                        <br />
                        <strong>Capital:</strong> {countryDetails[code].capital}
                      </p>
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => handleRemove(code)}
                          className="btn btn-danger"
                        >
                          Remove
                        </button>
                        <Link to={`/country/${code}`} className="btn btn-primary">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default Favorites;

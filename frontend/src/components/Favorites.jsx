import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { API_ENDPOINTS } from '../config';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [countryDetails, setCountryDetails] = useState({});
  const [countryCode, setCountryCode] = useState('');
  const [error, setError] = useState('');
  const [allCountries, setAllCountries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const countriesPerPage = 9;
  const token = localStorage.getItem('token');

  // Fetch favorite countries
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.FAVORITES.LIST, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(response.data.favorites);
      } catch (err) {
        console.error('Error fetching favorites:', err);
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
        console.error('Error fetching country details:', err);
        setError('Failed to fetch country details');
        toast.error('Failed to fetch country details');
      }
    };
    if (favorites.length > 0) fetchCountryDetails();
  }, [favorites]);

  // Fetch all countries for the list below favorites
  useEffect(() => {
    const fetchAllCountries = async () => {
      try {
        const response = await axios.get(
          'https://restcountries.com/v3.1/all?fields=name,cca2,region,population,capital,flags'
        );
        const sorted = response.data.sort((a, b) =>
          a.name.common.localeCompare(b.name.common)
        );
        setAllCountries(sorted);
      } catch (err) {
        console.error('Error fetching all countries:', err);
        toast.error('Failed to fetch all countries');
      }
    };
    fetchAllCountries();
  }, []);

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
        API_ENDPOINTS.FAVORITES.ADD,
        { countryCode: countryAlphaCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFavorites(response.data.favorites);
      setCountryCode('');
      setError('');
      toast.success(`Country (${country.name.common}) added successfully!`);
    } catch (err) {
      console.error('Error adding favorite:', err);
      setError(err.response?.data?.message || 'Failed to add favorite');
      toast.error(err.response?.data?.message || 'Failed to add favorite');
    }
  };

  // Remove country from favorites
  const handleRemove = async (countryCode) => {
    try {
      const response = await axios.delete(API_ENDPOINTS.FAVORITES.REMOVE(countryCode), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(response.data.favorites);
      toast.success(`Country (${countryCode}) removed successfully!`);
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError(err.response?.data?.message || 'Failed to remove favorite');
      toast.error(err.response?.data?.message || 'Failed to remove favorite');
    }
  };

  // Calculate pagination
  const indexOfLastCountry = currentPage * countriesPerPage;
  const indexOfFirstCountry = indexOfLastCountry - countriesPerPage;
  const currentCountries = allCountries.slice(indexOfFirstCountry, indexOfLastCountry);
  const totalPages = Math.ceil(allCountries.length / countriesPerPage);

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
      <h2 className="text-center my-5">All Countries</h2>
      <div className="row">
        {currentCountries.length === 0 ? (
          <p className="text-center">No countries found.</p>
        ) : (
          currentCountries.map((country) => (
            <div key={country.cca2} className="col-md-4 mb-4">
              <div className="card h-100">
                {country.flags && (
                  <img
                    src={country.flags.png}
                    alt={`${country.name.common} flag`}
                    className="card-img-top"
                    style={{ height: '150px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{country.name.common}</h5>
                  <p className="card-text">
                    <strong>Code:</strong> {country.cca2}
                    <br />
                    <strong>Population:</strong> {country.population?.toLocaleString()}
                    <br />
                    <strong>Region:</strong> {country.region}
                    <br />
                    <strong>Capital:</strong> {country.capital?.[0] || 'N/A'}
                  </p>
                  <div className="d-flex gap-2 flex-wrap">
                    {favorites.includes(country.cca2) ? (
                      <button
                        className="btn btn-danger"
                        onClick={() => handleRemove(country.cca2)}
                      >
                        Remove from Favorites
                      </button>
                    ) : (
                      <button
                        className="btn btn-success"
                        onClick={async () => {
                          try {
                            const response = await axios.post(
                              API_ENDPOINTS.FAVORITES.ADD,
                              { countryCode: country.cca2 },
                              { headers: { Authorization: `Bearer ${token}` } }
                            );
                            setFavorites(response.data.favorites);
                            toast.success(`Country (${country.name.common}) added to favorites!`);
                          } catch (err) {
                            console.error('Error adding favorite:', err);
                            toast.error(err.response?.data?.message || 'Failed to add favorite');
                          }
                        }}
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
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                  Previous
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, index) => (
                <li
                  key={index}
                  className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                >
                  <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                    {index + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default Favorites;

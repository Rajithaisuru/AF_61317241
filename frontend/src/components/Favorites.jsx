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
          headers: { Authorization: `Bearer ${token}` }
        });
        setFavorites(response.data.favorites || []);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast.error('Failed to fetch favorite countries');
      }
    };

    fetchFavorites();
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
      const countryAlphaCode = country.cca2;

      // Add the country to favorites using its alpha-2 code
      const response = await axios.post(
        API_ENDPOINTS.FAVORITES.ADD,
        { countryCode: countryAlphaCode },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setFavorites(response.data.favorites || []);
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
      await axios.delete(API_ENDPOINTS.FAVORITES.REMOVE(countryCode), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(favorites.filter(code => code !== countryCode));
      toast.success('Country removed from favorites!');
    } catch (err) {
      console.error('Error removing favorite:', err);
      toast.error('Failed to remove favorite');
    }
  };

  // Pagination
  const indexOfLastCountry = currentPage * countriesPerPage;
  const indexOfFirstCountry = indexOfLastCountry - countriesPerPage;
  const currentCountries = allCountries.slice(indexOfFirstCountry, indexOfLastCountry);
  const totalPages = Math.ceil(allCountries.length / countriesPerPage);

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Favorite Countries</h1>
      
      {/* Favorites Section */}
      <div className="row mb-4">
        {favorites.map((code) => (
          <div key={code} className="col-md-4 mb-4">
            <div className="card h-100">
              <img
                src={countryDetails[code]?.flag}
                className="card-img-top"
                alt={`${countryDetails[code]?.name} flag`}
              />
              <div className="card-body">
                <h5 className="card-title">{countryDetails[code]?.name}</h5>
                <p className="card-text">
                  <strong>Region:</strong> {countryDetails[code]?.region}
                  <br />
                  <strong>Population:</strong> {countryDetails[code]?.population?.toLocaleString()}
                  <br />
                  <strong>Capital:</strong> {countryDetails[code]?.capital}
                </p>
                <button
                  className="btn btn-danger"
                  onClick={() => handleRemove(code)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Country Form */}
      <div className="row mb-4">
        <div className="col-md-6 mx-auto">
          <form onSubmit={handleAdd} className="card">
            <div className="card-body">
              <h5 className="card-title">Add Country to Favorites</h5>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter country name"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  Add
                </button>
              </div>
              {error && <div className="alert alert-danger mt-2">{error}</div>}
            </div>
          </form>
        </div>
      </div>

      {/* All Countries List */}
      <div className="row">
        {currentCountries.map((country) => (
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
                  <strong>Population:</strong> {country.population.toLocaleString()}
                  <br />
                  <strong>Capital:</strong> {country.capital ? country.capital[0] : 'N/A'}
                </p>
                <Link to={`/country/${country.cca2}`} className="btn btn-primary">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li
                key={page}
                className={`page-item ${currentPage === page ? 'active' : ''}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <ToastContainer />
    </div>
  );
}

export default Favorites;

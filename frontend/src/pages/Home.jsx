import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
import { Carousel } from 'react-bootstrap'; // Import Bootstrap Carousel
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { API_ENDPOINTS } from '../config';

function MapController({ searchTerm, region, countries }) {
  const map = useMap();

  const regionCoordinates = {
    Africa: [1.0, 21.0, 3],
    Americas: [15.0, -80.0, 3],
    Asia: [30.0, 100.0, 3],
    Europe: [50.0, 15.0, 4],
    Oceania: [-25.0, 135.0, 4],
    Antarctica: [-80.0, 0.0, 2],
  };

  useEffect(() => {
    if (!map) return;

    if (searchTerm) {
      const matchedCountry = countries.find((country) =>
        country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (matchedCountry && matchedCountry.latlng) {
        const [lat, lng] = matchedCountry.latlng;
        map.setView([lat, lng], 5);
      } else {
        map.setView([0, 0], 2);
      }
    } else if (region && regionCoordinates[region]) {
      const [lat, lng, zoom] = regionCoordinates[region];
      map.setView([lat, lng], zoom);
    } else {
      map.setView([0, 0], 2);
    }
  }, [searchTerm, region, countries, map]);

  return null;
}

const Home = () => {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [region, setRegion] = useState('');
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const countriesPerPage = 9;
  const token = localStorage.getItem('token');

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleSearch = debounce((value) => {
    setSearchTerm(value);
  }, 300);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(
          'https://restcountries.com/v3.1/all?fields=name,cca2,flags,region,population,capital,languages,latlng'
        );
        const sortedCountries = response.data.sort((a, b) =>
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sortedCountries);
        setFilteredCountries(sortedCountries);
      } catch (err) {
        setError('Failed to fetch countries');
        toast.error('Failed to fetch countries');
      }
    };

    const fetchFavorites = async () => {
      if (token) {
        try {
          const response = await axios.get(API_ENDPOINTS.FAVORITES.LIST, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFavorites(response.data.favorites || []);
        } catch (err) {
          console.error('Error fetching favorites:', err);
          toast.error('Failed to fetch favorites');
        }
      }
    };

    fetchCountries();
    fetchFavorites();
  }, [token]);

  useEffect(() => {
    let filtered = countries;
    if (region || searchTerm) {
      filtered = countries.filter((country) => {
        const matchesRegion = region ? country.region === region : true;
        const matchesSearch = searchTerm
          ? country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
          : true;
        return matchesRegion && matchesSearch;
      });
    }
    setFilteredCountries(filtered);
  }, [searchTerm, region, countries]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, region]);

  const indexOfLastCountry = currentPage * countriesPerPage;
  const indexOfFirstCountry = indexOfLastCountry - countriesPerPage;
  const currentCountries = filteredCountries.slice(indexOfFirstCountry, indexOfLastCountry);
  const totalPages = Math.ceil(filteredCountries.length / countriesPerPage);

  const handleAddFavorite = async (countryCode, countryName) => {
    if (!token) {
      toast.warning('Please log in to add favorites');
      return;
    }
    try {
      const response = await axios.post(
        API_ENDPOINTS.FAVORITES.ADD,
        { countryCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFavorites(response.data.favorites);
      toast.success(`${countryName} added to favorites`);
    } catch (err) {
      console.error('Error adding favorite:', err);
      toast.error(err.response?.data?.message || 'Failed to add favorite');
    }
  };

  const handleRemoveFavorite = async (countryCode, countryName) => {
    if (!token) {
      toast.warning('Please log in to remove favorites');
      return;
    }
    try {
      const response = await axios.delete(API_ENDPOINTS.FAVORITES.REMOVE(countryCode), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(response.data.favorites);
      toast.success(`${countryName} removed from favorites`);
    } catch (err) {
      console.error('Error removing favorite:', err);
      toast.error(err.response?.data?.message || 'Failed to remove favorite');
    }
  };

  const regions = [...new Set(countries.map((country) => country.region))].filter(Boolean).sort();

  return (
    <div className="container py-4">
      <h1 className="display-4 text-center mb-4">Let's Explore the World!</h1>
      
      {/* Attractive Sentences */}
      <p className="text-center fs-5 mb-4">
        Discover the beauty of our planet, one country at a time. <br />
        From breathtaking landscapes to vibrant cultures, the world is waiting for you to explore. <br />
        Start your journey now and uncover the hidden gems of every corner of the Earth!
      </p>

      {/* Sliding Pictures */}
      <div className="mb-4">
        <Carousel>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDF8fG1vdW50YWluc3xlbnwwfHx8fDE2ODIwMzYwNzA&ixlib=rb-1.2.1&q=80&w=800"
              alt="Explore Mountains"
              style={{ borderRadius: '8px', maxHeight: '400px', objectFit: 'cover' }}
            />
            <Carousel.Caption>
              <h3>Majestic Mountains</h3>
              <p>Experience the serenity of towering peaks and lush valleys.</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGJlYWNoZXN8ZW58MHx8fHwxNjgyMDM2MDcw&ixlib=rb-1.2.1&q=80&w=800"
              alt="Discover Beaches"
              style={{ borderRadius: '8px', maxHeight: '400px', objectFit: 'cover' }}
            />
            <Carousel.Caption>
              <h3>Pristine Beaches</h3>
              <p>Relax on golden sands and dive into crystal-clear waters.</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGNpdGllc3xlbnwwfHx8fDE2ODIwMzYwNzA&ixlib=rb-1.2.1&q=80&w=800"
              alt="Explore Cities"
              style={{ borderRadius: '8px', maxHeight: '400px', objectFit: 'cover' }}
            />
            <Carousel.Caption>
              <h3>Vibrant Cities</h3>
              <p>Immerse yourself in the culture and energy of bustling metropolises.</p>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>
      </div>

      {/* Map Section */}
      <h2 className="text-center mb-3">Explore the World on the Map</h2>
      <p className="text-center mb-4">
        Zoom in, pan around, and discover the beauty of every region. The world is at your fingertips!
      </p>
      <div className="mb-4">
        <MapContainer
          center={[0, 0]}
          zoom={2}
          style={{ height: '400px', width: '100%', borderRadius: '8px' }}
          className="leaflet-container"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapController searchTerm={searchTerm} region={region} countries={countries} />
        </MapContainer>
      </div>

      {/* Search and Filter Section */}
      <h2 className="text-center mb-3">Find Your Next Destination</h2>
      <p className="text-center mb-4">
        Search for your favorite countries or filter by region to start your journey of discovery!
      </p>
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <input
            type="text"
            className="form-control search-bar"
            placeholder="🔍 Search countries..."
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="col-md-6 mb-3">
          <select
            className="form-select filter-dropdown"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="">🌍 All Regions</option>
            {regions.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Country Cards */}
      <div className="row">
        {currentCountries.length === 0 ? (
          <p>No countries found.</p>
        ) : (
          currentCountries.map((country) => (
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
                  <div className="d-flex gap-2 flex-wrap">
                    {favorites.includes(country.cca2) ? (
                      <button
                        onClick={() => handleRemoveFavorite(country.cca2, country.name.common)}
                        className="btn btn-danger"
                      >
                        Remove from Favorites
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (!token) {
                            toast.warning('Please log in to add favorites');
                            return;
                          }
                          handleAddFavorite(country.cca2, country.name.common);
                        }}
                        className="btn btn-success"
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
        <div className="d-flex justify-content-center align-items-center mt-4 flex-wrap">
          <nav className="w-100">
            <ul className="pagination pagination-sm pagination-md pagination-lg flex-wrap justify-content-center mb-0" 
                style={{ 
                  maxWidth: '100%',
                  overflowX: 'auto',
                  flexWrap: 'wrap',
                  gap: '4px'
                }}>
              {/* Previous Button */}
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </li>

              {/* Page Numbers */}
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

              {/* Next Button */}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
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
};

export default Home;

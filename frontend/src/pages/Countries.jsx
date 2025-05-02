import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Countries = () => {
  const [countries, setCountries] = useState([]);
  const [error, setError] = useState('');
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [isComparing, setIsComparing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [region, setRegion] = useState('');
  const countriesPerPage = 9;

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(
          'https://restcountries.com/v3.1/all?fields=name,cca2,flags,population,area,capital,region,subregion,languages,currencies'
        );
        setCountries(
          response.data.sort((a, b) =>
            a.name.common.localeCompare(b.name.common)
          )
        );
      } catch (err) {
        setError('Failed to fetch countries');
      }
    })();
  }, []);
  

  // Memoize regions
  const regions = useMemo(
    () =>
      [...new Set(countries.map((country) => country.region))]
        .filter(Boolean)
        .sort(),
    [countries]
  );

  // Memoize filtered countries
  const filteredCountries = useMemo(() => {
    return countries.filter((country) => {
      const matchesSearch = country.name.common
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesRegion = !region || country.region === region;
      return matchesSearch && matchesRegion;
    });
  }, [countries, searchTerm, region]);

  // Pagination
  const indexOfLastCountry = currentPage * countriesPerPage;
  const indexOfFirstCountry = indexOfLastCountry - countriesPerPage;
  const currentCountries = useMemo(
    () => filteredCountries.slice(indexOfFirstCountry, indexOfLastCountry),
    [filteredCountries, indexOfFirstCountry, indexOfLastCountry]
  );
  const totalPages = Math.ceil(filteredCountries.length / countriesPerPage);

  // Handlers
  const handleCountrySelect = useCallback(
    (country) => {
      if (
        selectedCountries.length < 3 &&
        !selectedCountries.find((c) => c.cca2 === country.cca2)
      ) {
        setSelectedCountries((prev) => [...prev, country]);
      }
    },
    [selectedCountries]
  );

  const handleRemoveCountry = useCallback((cca2) => {
    setSelectedCountries((prev) =>
      prev.filter((country) => country.cca2 !== cca2)
    );
  }, []);

  const handleCompare = useCallback(() => {
    if (selectedCountries.length >= 2) {
      setIsComparing(true);
      setComparisonData(selectedCountries);
    }
  }, [selectedCountries]);

  const handleReset = useCallback(() => {
    setSelectedCountries([]);
    setComparisonData([]);
    setIsComparing(false);
  }, []);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleRegionChange = useCallback((value) => {
    setRegion(value);
    setCurrentPage(1);
  }, []);

  const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), []);

  return (
    <div className="container py-4">
      <h2 className="text-center mb-3">Country Comparison</h2>
      <p className="text-center mb-4">
        Discover the world through data! Compare up to three countries side by side, exploring their unique characteristics, 
        demographics, and cultural aspects. Whether you're planning a trip, doing research, or just curious about different 
        nations, our comparison tool helps you make informed decisions and gain valuable insights about our diverse world.
      </p>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Search and Filter Section */}
      <h2 className="text-center mb-3">Find Countries to Compare</h2>
      <p className="text-center mb-4">
        Search for countries or filter by region to start your comparison journey!
      </p>
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <input
            type="text"
            className="form-control search-bar"
            placeholder="🔍 Search countries..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="col-md-6 mb-3">
          <select
            className="form-select filter-dropdown"
            value={region}
            onChange={(e) => handleRegionChange(e.target.value)}
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

      {/* Selected Countries Section */}
      {selectedCountries.length > 0 && (
        <div className="mb-4">
          <h3>Selected Countries ({selectedCountries.length}/3)</h3>
          <div className="d-flex gap-2 mb-3">
            {selectedCountries.map(country => (
              <div key={country.cca2} className="card" style={{ width: '200px' }}>
                <img src={country.flags.png} alt={`${country.name.common} flag`} className="card-img-top" style={{ height: '100px', objectFit: 'cover' }} />
                <div className="card-body p-2">
                  <h6 className="card-title">{country.name.common}</h6>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleRemoveCountry(country.cca2)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-primary"
              onClick={handleCompare}
              disabled={selectedCountries.length < 2}
            >
              Compare Countries
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {isComparing && (
        <div className="mb-4">
          <h3>Comparison</h3>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Property</th>
                  {comparisonData.map(country => (
                    <th key={country.cca2}>{country.name.common}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Population</td>
                  {comparisonData.map(country => (
                    <td key={country.cca2}>{country.population.toLocaleString()}</td>
                  ))}
                </tr>
                <tr>
                  <td>Area (km²)</td>
                  {comparisonData.map(country => (
                    <td key={country.cca2}>{country.area.toLocaleString()}</td>
                  ))}
                </tr>
                <tr>
                  <td>Capital</td>
                  {comparisonData.map(country => (
                    <td key={country.cca2}>{country.capital?.[0] || 'N/A'}</td>
                  ))}
                </tr>
                <tr>
                  <td>Region</td>
                  {comparisonData.map(country => (
                    <td key={country.cca2}>{country.region}</td>
                  ))}
                </tr>
                <tr>
                  <td>Subregion</td>
                  {comparisonData.map(country => (
                    <td key={country.cca2}>{country.subregion || 'N/A'}</td>
                  ))}
                </tr>
                <tr>
                  <td>Languages</td>
                  {comparisonData.map(country => (
                    <td key={country.cca2}>
                      {country.languages ? Object.values(country.languages).join(', ') : 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Currencies</td>
                  {comparisonData.map(country => (
                    <td key={country.cca2}>
                      {country.currencies ? Object.values(country.currencies).map(c => c.name).join(', ') : 'N/A'}
                    </td>
                  ))}
                </tr>
                {/* Add View Details row */}
                <tr>
                  <td>View Details</td>
                  {comparisonData.map(country => (
                    <td key={country.cca2}>
                      <Link to={`/country/${country.cca2}`} className="btn btn-secondary btn-sm">
                        View Details
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Country List */}
      <div className="row">
        {currentCountries.length === 0 ? (
          <div className="col-12 text-center">
            <p className="text-muted">No countries found matching your search criteria.</p>
          </div>
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
                  <p className="card-text"><strong>Code:</strong> {country.cca2}</p>
                  <div className="d-flex gap-2">
                    <Link to={`/country/${country.cca2}`} className="btn btn-secondary">
                      View Details
                    </Link>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleCountrySelect(country)}
                      disabled={selectedCountries.length >= 3 || selectedCountries.find(c => c.cca2 === country.cca2)}
                    >
                      Select for Comparison
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Page navigation" className="mt-4">
          {/* Large screens: show all page numbers */}
          <ul className="pagination justify-content-center d-none d-sm-flex">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => paginate(number)}
                >
                  {number}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
          {/* Small screens: compact pagination */}
          <ul className="pagination justify-content-center d-flex d-sm-none">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>
            <li className="page-item active">
              <span className="page-link">
                {currentPage} / {totalPages}
              </span>
            </li>
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export default Countries;
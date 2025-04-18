import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Countries() {
  const [countries, setCountries] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,cca2,flags');
        setCountries(response.data.sort((a, b) => a.name.common.localeCompare(b.name.common)));
      } catch (err) {
        setError('Failed to fetch countries');
      }
    };
    fetchCountries();
  }, []);

  return (
    <div className="container py-4">
      <h2 className="h2 mb-4">Country List</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row">
        {countries.map((country) => (
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
                <Link to={`/country/${country.cca2}`} className="btn btn-outline-secondary">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Countries;
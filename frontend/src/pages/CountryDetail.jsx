import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

function CountryDetail() {
  const { code } = useParams();
  const [country, setCountry] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await axios.get(`https://restcountries.com/v3.1/alpha/${code}`);
        setCountry(response.data[0]);
      } catch (err) {
        setError('Failed to fetch country details');
      }
    };
    fetchCountry();
  }, [code]);

  const handleAddFavorite = async () => {
    if (!token) {
      alert('Please log in to add favorites');
      return;
    }
    try {
      await axios.post(
        'http://localhost:5005/api/favorites/add',
        { countryCode: code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`${code} added to favorites`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add favorite');
    }
  };

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
        <Link to="/" className="btn btn-secondary">Back to Home</Link>
      </div>
    );
  }

  if (!country) {
    return <div className="container py-4">Loading...</div>;
  }

  return (
    <div className="container py-4">
      <h1 className="h2 mb-4">{country.name.common}</h1>
      <div className="row">
        <div className="col-md-6">
          <img
            src={country.flags.png}
            alt={`${country.name.common} flag`}
            className="img-fluid mb-3"
            style={{ maxHeight: '200px' }}
          />
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <p><strong>Official Name:</strong> {country.name.official}</p>
              <p><strong>Code:</strong> {country.cca2}</p>
              <p><strong>Capital:</strong> {country.capital?.[0] || 'N/A'}</p>
              <p><strong>Region:</strong> {country.region}</p>
              <p><strong>Subregion:</strong> {country.subregion || 'N/A'}</p>
              <p><strong>Population:</strong> {country.population.toLocaleString()}</p>
              <p><strong>Languages:</strong> {Object.values(country.languages || {}).join(', ') || 'N/A'}</p>
              <p><strong>Currencies:</strong> {Object.values(country.currencies || {})
                .map(c => `${c.name} (${c.symbol})`).join(', ') || 'N/A'}</p>
              <p><strong>Borders:</strong> {country.borders?.join(', ') || 'None'}</p>
              <div className="d-flex gap-2">
                <button onClick={handleAddFavorite} className="btn btn-primary">
                  Add to Favorites
                </button>
                <Link to="/" className="btn btn-secondary">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CountryDetail;
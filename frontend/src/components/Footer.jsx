// src/components/Footer.jsx
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';

function Footer() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [geoFact, setGeoFact] = useState('');
  const [locationName, setLocationName] = useState('Loading...');

  const facts = [
    "Earth is the only planet not named after a god.",
    "The Amazon rainforest produces 20% of the world's oxygen.",
    "The Dead Sea is 9.6 times saltier than the ocean.",
    "Mount Everest grows about 4mm every year.",
    "There are more trees on Earth than stars in the Milky Way."
  ];

  useEffect(() => {
    // Random geo fact
    const randomFact = facts[Math.floor(Math.random() * facts.length)];
    setGeoFact(randomFact);

    // Get location using a simple API
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        setLocationName(data.city ? `${data.city}, ${data.country_name}` : "Unknown Location");
      })
      .catch(() => {
        setLocationName('Location Unavailable');
      });
  }, []);

  return (
    <footer className={`text-center p-4 ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`} style={{ marginTop: 'auto' }}>
      <div className="container">
        <p className="mb-1">🌍 You are browsing from: <strong>{locationName}</strong></p>
        
        <p className="mb-2 fst-italic" style={{ fontSize: '0.9rem' }}>
          Geo Fact: "{geoFact}"
        </p>

        <div className="d-flex justify-content-center gap-3 mb-3">
          <Link to="/" className="text-decoration-none">Home</Link>
          <Link to="/favorites" className="text-decoration-none">Favorites</Link>
          <Link to="/profile" className="text-decoration-none">Profile</Link>
        </div>

        <button
          onClick={toggleTheme}
          className="btn btn-sm btn-outline-secondary"
        >
          {theme === 'light' ? '🌙 Switch to Dark' : '🌞 Switch to Light'}
        </button>

        <p className="mt-3" style={{ fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} GeoExplorer. Explore the world, one click at a time!
        </p>
      </div>
    </footer>
  );
}

export default Footer;

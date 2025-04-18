import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeContext } from '../ThemeContext';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) {
      const fetchUser = async () => {
        try {
          const response = await axios.get('http://localhost:5005/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
        } catch (err) {
          console.error('Failed to fetch user:', err);
        }
      };
      fetchUser();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Country Explorer</Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-controls="navbarNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={isOpen ? 'collapse navbar-collapse show' : 'collapse navbar-collapse'} id="navbarNav">
          <ul className="navbar-nav center-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={() => setIsOpen(false)}>Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/favorites" onClick={() => setIsOpen(false)}>Favorites</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/profile" onClick={() => setIsOpen(false)}>Profile</Link>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <button className="nav-link btn btn-link" onClick={() => { toggleTheme(); setIsOpen(false); }}>
                {theme === 'light' ? '🌙 Dark' : '🌞 Light'}
              </button>
            </li>
            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <span className="nav-link">Welcome, {user?.email.split('@')[0]}!</span>
                </li>
                <li className="nav-item">
                  <button className="nav-link btn btn-link" onClick={() => { handleLogout(); setIsOpen(false); }}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/register" onClick={() => setIsOpen(false)}>Register</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login" onClick={() => setIsOpen(false)}>Login</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
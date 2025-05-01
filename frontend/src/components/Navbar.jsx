import React from 'react';
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { ThemeContext } from '../ThemeContext';
import geoIcon from '../assets/geo.png'; // Import the geo.png icon

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoggedIn, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Fix toggler icon visibility in light mode */}
      <style>
        {`
          .navbar-light .navbar-toggler-icon {
            background-image: url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(0,0,0,0.7)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E");
          }
        `}
      </style>
      <nav className={`navbar navbar-expand-lg fixed-top ${theme === 'light' ? 'navbar-light bg-light' : 'navbar-dark bg-dark'}`}>
        <div className="container-fluid">
          {/* Brand Logo and Name */}
          <div className="d-flex align-items-center">
            <Link to="/" className="d-flex align-items-center">
              <img
                src={geoIcon}
                alt="Geo Explorer Logo"
                style={{
                  height: '40px',
                  width: '40px',
                  marginRight: '10px',
                  cursor: 'pointer',
                }}
              />
            </Link>
            <Link className="navbar-brand" to="/">GeoExplorer</Link>
          </div>
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
              {isLoggedIn && (
                <li className="nav-item">
                  <Link className="nav-link" to="/favorites" onClick={() => setIsOpen(false)}>Favorites</Link>
                </li>
              )}
              <li className="nav-item">
                <Link className="nav-link" to="/countries" onClick={() => setIsOpen(false)}>Comparison</Link>
              </li>
              {isLoggedIn && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/profile" onClick={() => setIsOpen(false)}>Profile</Link>
                  </li>
                </>
              )}
            </ul>
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link theme-toggle"
                  onClick={() => { toggleTheme(); setIsOpen(false); }}
                  title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
                >
                  {theme === 'light' ? '🌙' : '🌞'}
                </button>
              </li>
              {isLoggedIn ? (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/profile" onClick={() => setIsOpen(false)}>
                      Welcome, {user?.email.split('@')[0]}!
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button
                      className="nav-link btn btn-link"
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                    >
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

      {/* Add padding to the main content */}
      <div style={{ paddingTop: '56px' }}>
        {/* Your main content goes here */}
      </div>
    </>
  );
}

export default Navbar;
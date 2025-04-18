// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './components/Register';
import Login from './components/Login';
import Favorites from './components/Favorites';
import CountryDetail from './pages/CountryDetail';
import Profile from './pages/Profile';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './AuthContext'; // <<=== Import AuthProvider

function App() {
  return (
    <ThemeProvider>
      <AuthProvider> {/* Wrap everything inside AuthProvider */}
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/country/:code" element={<CountryDetail />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

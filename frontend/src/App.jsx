// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './components/Register';
import Login from './components/Login';
import Favorites from './components/Favorites';
import CountryDetail from './pages/CountryDetail';
import Profile from './pages/Profile';
import Countries from './pages/Countries';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './AuthContext'; 
import Footer from './components/Footer'; // Import Footer

function App() {
  return (
    <ThemeProvider>
      <AuthProvider> {/* Wrap everything inside AuthProvider */}
        <Router>
          <div className="d-flex flex-column min-vh-100">
            <Navbar /> {/* Render Navbar */}
            <div className="flex-grow-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/country/:code" element={<CountryDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/countries" element={<Countries />} />
              </Routes>
            </div>
            <Footer /> {/* Render Footer */}
          </div>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

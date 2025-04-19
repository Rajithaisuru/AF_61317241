import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import { ThemeContext } from '../../ThemeContext';
import Navbar from '../../components/Navbar';

describe('Navbar Component', () => {
  it('renders the Navbar with links and logo', () => {
    const mockToggleTheme = vi.fn();
    const mockLogout = vi.fn();
    const mockNavigate = vi.fn();

    render(
      <AuthContext.Provider value={{ user: { email: 'test@example.com' }, isLoggedIn: true, logout: mockLogout }}>
        <ThemeContext.Provider value={{ theme: 'light', toggleTheme: mockToggleTheme }}>
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        </ThemeContext.Provider>
      </AuthContext.Provider>
    );

    // Check if the logo is rendered
    expect(screen.getByAltText(/Geo Explorer Logo/i)).toBeInTheDocument();

    // Check if the "GeoExplorer" link is rendered
    expect(screen.getByText(/GeoExplorer/i)).toBeInTheDocument();

    // Check if the "Home" link is rendered
    expect(screen.getByText(/Home/i)).toBeInTheDocument();

    // Check if the "Favorites" and "Profile" links are rendered for logged-in users
    expect(screen.getByText(/Favorites/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();

    // Check if the "Welcome" message is displayed
    expect(screen.getByText(/Welcome, test!/i)).toBeInTheDocument();

    // Check if the "Logout" button is rendered
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  it('calls toggleTheme when the theme button is clicked', () => {
    const mockToggleTheme = vi.fn();
    const mockLogout = vi.fn();

    render(
      <AuthContext.Provider value={{ user: { email: 'test@example.com' }, isLoggedIn: true, logout: mockLogout }}>
        <ThemeContext.Provider value={{ theme: 'light', toggleTheme: mockToggleTheme }}>
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        </ThemeContext.Provider>
      </AuthContext.Provider>
    );

    const themeButton = screen.getByTitle('Switch to Dark Theme'); // Use title to locate the button
    fireEvent.click(themeButton);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('calls logout and navigates to login when the Logout button is clicked', () => {
    const mockToggleTheme = vi.fn();
    const mockLogout = vi.fn();

    render(
      <AuthContext.Provider value={{ user: { email: 'test@example.com' }, isLoggedIn: true, logout: mockLogout }}>
        <ThemeContext.Provider value={{ theme: 'light', toggleTheme: mockToggleTheme }}>
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        </ThemeContext.Provider>
      </AuthContext.Provider>
    );

    const logoutButton = screen.getByText(/Logout/i);
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('renders Register and Login links for logged-out users', () => {
    const mockToggleTheme = vi.fn();
    const mockLogout = vi.fn();

    render(
      <AuthContext.Provider value={{ user: null, isLoggedIn: false, logout: mockLogout }}>
        <ThemeContext.Provider value={{ theme: 'light', toggleTheme: mockToggleTheme }}>
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        </ThemeContext.Provider>
      </AuthContext.Provider>
    );

    // Check if the "Register" and "Login" links are rendered
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });
});
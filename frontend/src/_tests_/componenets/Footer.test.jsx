import React from 'react'; // Import React
import { describe, it, expect, vi } from 'vitest'; // Import `vi` for mocking
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeContext } from '../../ThemeContext';
import { AuthContext } from '../../AuthContext'; // <-- import AuthContext
import Footer from '../../components/Footer';

describe('Footer Component', () => {
  it('renders the footer with location and geo fact', () => {
    const mockToggleTheme = vi.fn(); // Use `vi.fn()` instead of `jest.fn()`
    const mockTheme = 'light';

    render(
      <AuthContext.Provider value={{ isLoggedIn: false }}>
        <ThemeContext.Provider value={{ theme: mockTheme, toggleTheme: mockToggleTheme }}>
          <BrowserRouter>
            <Footer />
          </BrowserRouter>
        </ThemeContext.Provider>
      </AuthContext.Provider>
    );

    expect(screen.getByText(/GeoExplorer/i)).toBeInTheDocument();
  });
});
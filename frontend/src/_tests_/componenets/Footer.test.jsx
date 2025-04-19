import React from 'react'; // Import React
import { describe, it, expect, vi } from 'vitest'; // Import `vi` for mocking
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeContext } from '../../ThemeContext';
import Footer from '../../components/Footer';

describe('Footer Component', () => {
  it('renders the footer with location and geo fact', () => {
    const mockToggleTheme = vi.fn(); // Use `vi.fn()` instead of `jest.fn()`
    const mockTheme = 'light';

    render(
      <ThemeContext.Provider value={{ theme: mockTheme, toggleTheme: mockToggleTheme }}>
        <BrowserRouter>
          <Footer />
        </BrowserRouter>
      </ThemeContext.Provider>
    );

    expect(screen.getByText(/GeoExplorer/i)).toBeInTheDocument();
  });
});
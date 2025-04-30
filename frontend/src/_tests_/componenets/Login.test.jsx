import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../../components/Login';
import { AuthContext } from '../../AuthContext';
import { BrowserRouter } from 'react-router-dom';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('Login Component', () => {
  const mockLogin = vi.fn();

  const renderLogin = () =>
    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthContext.Provider>
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows error message on failed login', async () => {
    mockLogin.mockRejectedValueOnce({ response: { data: { message: 'Invalid credentials' } } });
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('calls login and navigates on successful login', async () => {
    mockLogin.mockResolvedValueOnce({ email: 'test@example.com' });
    window.alert = vi.fn();
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'correctpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ email: 'test@example.com', password: 'correctpass' });
      expect(window.alert).toHaveBeenCalledWith('Login successful!');
      expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('has a link to register page', () => {
    renderLogin();
    expect(screen.getByText(/register here/i)).toHaveAttribute('href', '/register');
  });
});
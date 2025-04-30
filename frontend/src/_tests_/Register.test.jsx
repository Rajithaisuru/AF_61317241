import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../components/Register';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

vi.mock('axios');

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRegister = () =>
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

  it('renders registration form', () => {
    renderRegister();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('shows error if passwords do not match', async () => {
    renderRegister();
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'pass1' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'pass2' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('shows error on failed registration', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { message: 'Email already exists' } } });
    renderRegister();
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'pass123' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();
  });

  it('calls axios and navigates on successful registration', async () => {
    axios.post.mockResolvedValueOnce({});
    window.alert = vi.fn();
    renderRegister();
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'pass123' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5005/api/auth/register',
        {
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890',
          password: 'pass123',
        }
      );
      expect(window.alert).toHaveBeenCalledWith('Registration successful! Please log in.');
      expect(mockedNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
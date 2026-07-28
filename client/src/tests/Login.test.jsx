import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import Login from '../Pages/Auth/Login';
import { describe, it, expect, vi } from 'vitest';

const renderWithProviders = (ui) => {
  return render(
    <AuthContext.Provider value={{ login: vi.fn(), loading: false }}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('Login Component', () => {
  it('renders login form correctly', () => {
    renderWithProviders(<Login />);
    
    // Check if the Email input exists
    expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
    
    // Check if the Password input exists
    expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
    
    // Check if the login button exists
    expect(screen.getByRole('button', { name: 'Login Now' })).toBeInTheDocument();
  });
});

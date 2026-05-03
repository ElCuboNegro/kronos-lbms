import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Login from '../Login';
import * as authContext from '../../contexts/AuthContext';

// Mock the API client
vi.mock('../../api/client', async () => {
  const actual = await vi.importActual('../../api/client');
  return {
    ...actual,
    getBaseUrl: vi.fn(() => 'http://test-server.local'),
  };
});

// Polyfill localStorage for jsdom
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: function (key) {
      return store[key] || null;
    },
    setItem: function (key, value) {
      store[key] = value.toString();
    },
    removeItem: function (key) {
      delete store[key];
    },
    clear: function () {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Login Component', () => {
  let mockLogin;

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    mockLogin = vi.fn();

    // Mock the useAuth hook to return our mockLogin function
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      login: mockLogin
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the login form by default', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('Correo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /configurar servidor/i })).toBeInTheDocument();
  });

  it('toggles the server configuration view when clicking the configure button', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Switch to server config
    fireEvent.click(screen.getByRole('button', { name: /configurar servidor/i }));

    // Verify server config UI is present
    expect(screen.getByText('URL del Servidor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://api.ejemplo.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();

    // Switch back to login form
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(screen.getByPlaceholderText('Correo')).toBeInTheDocument();
  });

  it('handles login failure and displays the error message', async () => {
    mockLogin.mockRejectedValue(new Error('Credenciales incorrectas'));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'wrongpass' } });

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'wrongpass');
      expect(screen.getByText('Credenciales incorrectas')).toBeInTheDocument();
    });
  });
});

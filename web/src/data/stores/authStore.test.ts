import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from './authStore';
import { authApiRepository } from '../repositories/AuthApiRepository';

// Mock the repository
mock.module('../repositories/AuthApiRepository', () => ({
  authApiRepository: {
    login: mock(async () => ({
      user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' },
      token: 'fake-jwt-token',
    })),
    register: mock(async () => {}),
  }
}));

// Mock jwt-decode
mock.module('jwt-decode', () => ({
    jwtDecode: mock(() => ({ exp: Date.now() / 1000 + 3600 }))
}));


// Mock localStorage for the test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();
global.localStorage = localStorageMock;

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    authApiRepository.login.mockClear();
  });

  it('initializes with no user or token', () => {
    const auth = useAuthStore();
    expect(auth.user).toBeNull();
    expect(auth.token).toBeNull();
    expect(auth.isLoggedIn).toBe(false);
  });

  it('login action fetches and stores token and user', async () => {
    const auth = useAuthStore();
    const credentials = { email: 'test@example.com', password: 'password' };
    
    await auth.login(credentials);

    expect(authApiRepository.login).toHaveBeenCalledWith(credentials);
    expect(auth.token).toBe('fake-jwt-token');
    expect(auth.user.name).toBe('Test User');
    expect(auth.isLoggedIn).toBe(true);
    expect(localStorage.getItem('token')).toBe('fake-jwt-token');
  });

  it('logout action clears token and user', async () => {
    const auth = useAuthStore();
    // First, log in
    await auth.login({ email: 'test@example.com', password: 'password' });
    expect(auth.isLoggedIn).toBe(true);

    // Then, log out
    auth.logout();

    expect(auth.user).toBeNull();
    expect(auth.token).toBeNull();
    expect(auth.isLoggedIn).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('isAdmin computed property works correctly', async () => {
    const auth = useAuthStore();
    expect(auth.isAdmin).toBe(false);

    // Log in as a normal user
    await auth.login({ email: 'test@example.com', password: 'password' });
    expect(auth.isAdmin).toBe(false);

    // Log in as an admin
    authApiRepository.login.mockResolvedValueOnce({
        user: { id: 2, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
        token: 'fake-admin-token',
    });
    await auth.login({ email: 'admin@example.com', password: 'password' });
    expect(auth.isAdmin).toBe(true);
  });
});

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { setActivePinia, createPinia } from 'pinia';
import { useUserAdminStore } from './userAdminStore';
import { useAuthStore } from './authStore';

// Mock the API repository
mock.module('../repositories/UserAdminApiRepository', () => ({
  userAdminApiRepository: {
    getAll: mock(async () => ({ items: [{ id: 1, name: 'Test', email: 'a', role: 'user', createdAt: 'a' }], total: 1 })),
    update: mock(async () => {}),
    remove: mock(async () => {}),
  },
}));
const { userAdminApiRepository } = await import('../repositories/UserAdminApiRepository');

// Mock dependencies from authStore
mock.module('jwt-decode', () => ({
    jwtDecode: mock(() => ({ exp: Date.now() / 1000 + 3600 }))
}));
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) { return store[key] || null; },
    setItem(key: string, value: string) { store[key] = value.toString(); },
    removeItem(key: string) { delete store[key]; },
    clear() { store = {}; },
  };
})();
global.localStorage = localStorageMock;


describe('UserAdmin Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    userAdminApiRepository.getAll.mockClear();
    userAdminApiRepository.update.mockClear();
    userAdminApiRepository.remove.mockClear();
  });

  const setupAuth = () => {
    const authStore = useAuthStore();
    authStore.token = 'fake-admin-token';
    return authStore;
  };

  it('fetchUsers fetches and updates state', async () => {
    setupAuth();
    const store = useUserAdminStore();
    await store.fetchUsers();
    
    expect(store.users).toHaveLength(1);
    expect(store.total).toBe(1);
    expect(userAdminApiRepository.getAll).toHaveBeenCalledWith('fake-admin-token', 1, 10);
  });

  it('updateUserRole calls the api and updates state', async () => {
    setupAuth();
    const store = useUserAdminStore();
    store.users = [{ id: 1, name: 'Test', email: 'a', role: 'user', createdAt: 'a' }];
    
    await store.updateUserRole(1, 'admin');

    expect(userAdminApiRepository.update).toHaveBeenCalledWith(1, { role: 'admin' }, 'fake-admin-token');
    expect(store.users[0].role).toBe('admin');
  });

  it('deleteUser calls the api and updates state', async () => {
    setupAuth();
    const store = useUserAdminStore();
    store.users = [{ id: 1, name: 'Test', email: 'a', role: 'user', createdAt: 'a' }];
    store.total = 1;

    await store.deleteUser(1);
    
    expect(userAdminApiRepository.remove).toHaveBeenCalledWith(1, 'fake-admin-token');
    expect(store.users).toHaveLength(0);
    expect(store.total).toBe(0);
  });
});

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { setActivePinia, createPinia } from 'pinia';
import { useBadWordStore, type BadWord } from './badWordStore';
import { useAuthStore } from './authStore';

// Mock the API repository
mock.module('../repositories/BadWordApiRepository', () => ({
  badWordApiRepository: {
    getAll: mock(async () => [{ id: 1, word: 'test', createdAt: '2023-01-01' }]),
    add: mock(async (word) => ({ id: 2, word, createdAt: '2023-01-01' })),
    update: mock(async () => {}),
    remove: mock(async () => {}),
  },
}));
const { badWordApiRepository } = await import('../repositories/BadWordApiRepository');

// Mock jwt-decode, because authStore uses it
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


describe('BadWord Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    // Clear mocks
    badWordApiRepository.getAll.mockClear();
    badWordApiRepository.add.mockClear();
    badWordApiRepository.update.mockClear();
    badWordApiRepository.remove.mockClear();
  });

  const setupAuth = () => {
    const authStore = useAuthStore();
    authStore.token = 'fake-token';
    authStore.user = { role: 'admin', name: 'Admin' };
    return authStore;
  };

  it('initializes with correct default values', () => {
    const store = useBadWordStore();
    expect(store.words).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.error).toBe(null);
  });

  it('fetchWords fetches and updates state', async () => {
    setupAuth();
    const store = useBadWordStore();
    await store.fetchWords();
    expect(store.words).toHaveLength(1);
    expect(store.words[0].word).toBe('test');
    expect(badWordApiRepository.getAll).toHaveBeenCalledWith('fake-token');
    expect(store.loading).toBe(false);
  });

  it('addWord adds a word and updates state', async () => {
    setupAuth();
    const store = useBadWordStore();
    const newWord = 'new';
    await store.addWord(newWord);
    expect(store.words).toHaveLength(1);
    expect(store.words[0].word).toBe(newWord);
    expect(badWordApiRepository.add).toHaveBeenCalledWith(newWord, 'fake-token');
  });

  it('updateWord updates a word in the state', async () => {
    setupAuth();
    const store = useBadWordStore();
    store.words = [{ id: 1, word: 'old', createdAt: '2023-01-01' }];
    const updatedWord = 'updated';
    await store.updateWord(1, updatedWord);
    expect(store.words[0].word).toBe(updatedWord);
    expect(badWordApiRepository.update).toHaveBeenCalledWith(1, updatedWord, 'fake-token');
  });

  it('deleteWord removes a word from the state', async () => {
    setupAuth();
    const store = useBadWordStore();
    store.words = [{ id: 1, word: 'test', createdAt: '2023-01-01' }];
    await store.deleteWord(1);
    expect(store.words).toHaveLength(0);
    expect(badWordApiRepository.remove).toHaveBeenCalledWith(1, 'fake-token');
  });

  it('actions do nothing if not authenticated', async () => {
    const store = useBadWordStore();
    await store.fetchWords();
    expect(badWordApiRepository.getAll).not.toHaveBeenCalled();
  });
});

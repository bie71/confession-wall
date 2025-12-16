import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { createPinia, setActivePinia } from 'pinia';
import { useWallStore } from './wallStore';
import { confessionApiRepository } from '../repositories/ConfessionApiRepository';

const createMock = mock(async (data) => ({ ...data, id: 99, status: 'APPROVED' }));
// Mock the entire repository module
mock.module('../repositories/ConfessionApiRepository', () => ({
  confessionApiRepository: {
    list: mock(async () => ({
      items: [{ id: 1, message: 'Test Confession', name: null, likes: 0, dislikes: 0, createdAt: 0, ipHash: null, status: 'APPROVED' }],
      total: 1,
      page: 1,
      limit: 10
    })),
    create: createMock,
  }
}));


describe('Wall Store', () => {
  beforeEach(() => {
    // Create a new Pinia instance for each test
    setActivePinia(createPinia());
    // Reset mocks
    (confessionApiRepository.list as any).mockClear();
    createMock.mockClear();
    createMock.mockResolvedValue({ id: 99, status: 'APPROVED' });
  });

  it('initializes with correct default values', () => {
    const wall = useWallStore();
    expect(wall.items).toEqual([]);
    expect(wall.loading).toBe(false);
    expect(wall.total).toBe(0);
    expect(wall.page).toBe(1);
    expect(wall.submissionLoading).toBe(false);
    expect(wall.submissionError).toBeNull();
    expect(wall.submissionSuccess).toBeNull();
  });

  it('`loadMore` action fetches confessions and updates state', async () => {
    const wall = useWallStore();
    await wall.loadMore();

    expect(confessionApiRepository.list).toHaveBeenCalledTimes(1);
    expect(wall.items.length).toBe(1);
    expect(wall.items[0].message).toBe('Test Confession');
    expect(wall.total).toBe(1);
    expect(wall.page).toBe(2); // It increments after fetching
    expect(wall.loading).toBe(false);
  });
  
  it('`refresh` action resets state and fetches first page', async () => {
    const wall = useWallStore();
    // dirty the state
    wall.page = 3;
    wall.items = [ { id: 2, message: 'Old item', name: null, likes: 0, dislikes: 0, createdAt: 0, ipHash: null, status: 'APPROVED' } ];

    await wall.refresh();

    expect(wall.page).toBe(2); // Resets to 1, then loadMore increments to 2
    expect(wall.items.length).toBe(1);
    expect(wall.items[0].id).toBe(1);
    expect(confessionApiRepository.list).toHaveBeenCalledWith({
        q: '',
        page: 1,
        limit: 10,
        status: 'APPROVED'
    });
  });

  it('`hasMore` getter works correctly', async () => {
    const wall = useWallStore();
    expect(wall.hasMore).toBe(false);
    
    await wall.loadMore(); // total becomes 1, items.length becomes 1

    expect(wall.hasMore).toBe(false);

    wall.total = 5; // Manually set total higher
    expect(wall.hasMore).toBe(true);
  });

  it('`setStatus` action updates status and refreshes', async () => {
    const wall = useWallStore();
    expect(wall.status).toBe('APPROVED'); // Default
    
    await wall.setStatus('PENDING');

    expect(wall.status).toBe('PENDING');
    expect(confessionApiRepository.list).toHaveBeenCalledWith({
        q: '',
        page: 1,
        limit: 10,
        status: 'PENDING'
    });
    // refresh calls loadMore, so it's called once
    expect(confessionApiRepository.list).toHaveBeenCalledTimes(1);
  });

  describe('createConfession Action', () => {
    it('handles successful submission', async () => {
      const wall = useWallStore();
      const newConfession = { name: 'Author', message: 'A new hope', website: '' };
      
      const result = await wall.createConfession(newConfession);

      expect(result).toBe(true);
      expect(wall.submissionLoading).toBe(false);
      expect(wall.submissionError).toBeNull();
      expect(wall.submissionSuccess).not.toBeNull();
      expect(createMock).toHaveBeenCalledWith(newConfession);
    });

    it('handles failed submission', async () => {
      const wall = useWallStore();
      const errorMessage = 'Contains bad words';
      createMock.mockRejectedValueOnce(new Error(errorMessage));
      const newConfession = { name: 'Author', message: 'A bad message', website: '' };

      const result = await wall.createConfession(newConfession);

      expect(result).toBe(false);
      expect(wall.submissionLoading).toBe(false);
      expect(wall.submissionSuccess).toBeNull();
      expect(wall.submissionError).toBe(errorMessage);
    });

    it('`clearSubmissionStatus` clears success and error messages', () => {
        const wall = useWallStore();
        wall.submissionError = 'An error';
        wall.submissionSuccess = 'A success';

        wall.clearSubmissionStatus();

        expect(wall.submissionError).toBeNull();
        expect(wall.submissionSuccess).toBeNull();
    });
  });
});

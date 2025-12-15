import { describe, it, expect, mock } from 'bun:test';
import { CreateConfession } from './CreateConfession';
import { IConfessionRepository } from '../../domain/repositories/ConfessionRepository';
import { Confession } from '../../domain/entities/Confession';

// Mock the repository
const mockConfessionRepository: IConfessionRepository = {
  create: mock(async (data: Omit<Confession, 'id' | 'likes' | 'dislikes' | 'createdAt'>): Promise<Confession> => ({
    id: 1,
    likes: 0,
    dislikes: 0,
    createdAt: Date.now(),
    ...data,
  })),
  update: mock(async () => null),
  delete: mock(async () => {}),
  findById: mock(async () => null),
  findAll: mock(async () => ({ items: [], total: 0, page: 1, limit: 10 })),
  export: mock(async () => []),
};

// Mock the broadcast function
mock.module('../../infrastructure/websocket', () => ({
    broadcast: mock(() => {})
}));

describe('CreateConfession Use Case', () => {
  const createConfession = new CreateConfession(mockConfessionRepository);

  it('should create a confession with APPROVED status', async () => {
    const input = {
      name: 'Test User',
      message: 'This is a test message.',
      ipHash: '12345',
    };

    const result = await createConfession.execute(input);

    expect(result).toBeDefined();
    expect(result.id).toBe(1);
    expect(result.message).toBe(input.message);
    expect(result.status).toBe('APPROVED');
    expect(mockConfessionRepository.create).toHaveBeenCalledWith(expect.objectContaining(input));
  });

  it('should create a confession with PENDING status if it contains a link', async () => {
    const input = {
      name: 'Link User',
      message: 'Check out my website www.example.com',
      ipHash: '67890',
    };

    const result = await createConfession.execute(input);

    expect(result.status).toBe('PENDING');
  });

  it('should throw an error if the message is too short', async () => {
    const input = { name: 'Shorty', message: 'hi', ipHash: 'abc' };
    
    expect(createConfession.execute(input)).rejects.toThrow('Message too short');
  });

  it('should throw an error if the message contains a bad word', async () => {
    const input = { name: 'Rude User', message: 'This is a goblok message', ipHash: 'def' };

    expect(createConfession.execute(input)).rejects.toThrow('Message contains prohibited words');
  });
});

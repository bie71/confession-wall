import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { CreateConfession } from './CreateConfession';
import { IConfessionRepository } from '../../domain/repositories/ConfessionRepository';
import { Confession } from '../../domain/entities/Confession';
import { BadWordRepository } from '../../domain/repositories/BadWordRepository';
import { BadWord } from '../../domain/entities/BadWord';

// Mock the repositories
const mockConfessionRepository: IConfessionRepository = {
  create: mock(async (data) => ({
    id: 1,
    likes: 0,
    dislikes: 0,
    createdAt: new Date(),
    ...data,
  } as Confession)),
  update: mock(async () => null),
  delete: mock(async () => {}),
  findById: mock(async () => null),
  findAll: mock(async () => ({ items: [], total: 0, page: 1, limit: 10 })),
  export: mock(async () => []),
  findSimilarByEmbedding: mock(async (embedding: number[]) => null),
};

const mockBadWordRepository: BadWordRepository = {
  getAll: mock(async () => [
    new BadWord(1, 'goblok', new Date()),
    new BadWord(2, 'bangsat', new Date()),
  ]),
  add: mock(async (word) => new BadWord(3, word, new Date())),
  findById: mock(async () => null),
  findByWord: mock(async () => null),
  update: mock(async () => {}),
  delete: mock(async () => {}),
};

// Mock the broadcast and embedding functions
mock.module('../../infrastructure/websocket', () => ({
    broadcast: mock(() => {})
}));
mock.module('../../infrastructure/ai/embedding', () => ({
    generateEmbedding: mock(async () => [0.1, 0.2, 0.3])
}));


describe('CreateConfession Use Case', () => {
  const createConfession = new CreateConfession(mockConfessionRepository, mockBadWordRepository);

  beforeEach(() => {
    mockConfessionRepository.create.mockClear();
    mockConfessionRepository.findSimilarByEmbedding.mockClear();
    mockBadWordRepository.getAll.mockClear();
  });

  it('should create a confession with APPROVED status', async () => {
    mockConfessionRepository.findSimilarByEmbedding.mockResolvedValueOnce(null);
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
    expect(mockConfessionRepository.create).toHaveBeenCalled();
  });

  it('should create a confession with PENDING status if it contains a link', async () => {
    mockConfessionRepository.findSimilarByEmbedding.mockResolvedValueOnce(null);
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
    
    await expect(createConfession.execute(input)).rejects.toThrow('Message too short');
  });

  it('should throw an error if the message contains a bad word', async () => {
    const input = { name: 'Rude User', message: 'This is a goblok message', ipHash: 'def' };

    await expect(createConfession.execute(input)).rejects.toThrow('Pesan mengandung kata-kata yang dilarang.');
    expect(mockBadWordRepository.getAll).toHaveBeenCalledTimes(1);
  });

  it('should throw an error for a similar post', async () => {
    const similarPost: Confession = { 
        id: 99, 
        message: 'a very similar message', 
        name: 'Similar', 
        status: 'APPROVED', 
        createdAt: new Date(),
        dislikes: 0,
        likes: 0,
        ipHash: 'xyz',
        userId: null,
        embedding: [0.1, 0.2, 0.3]
    };
    mockConfessionRepository.findSimilarByEmbedding.mockResolvedValueOnce(similarPost);
    
    const input = {
      name: 'Copycat',
      message: 'a very similar message!!',
      ipHash: '123',
    };

    await expect(createConfession.execute(input)).rejects.toThrow('This confession is too similar to a recent post.');
  });
});

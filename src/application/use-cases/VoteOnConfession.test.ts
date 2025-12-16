import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { VoteOnConfession } from './VoteOnConfession';
import { IConfessionRepository } from '../../domain/repositories/ConfessionRepository';
import { IVoteRepository } from '../../domain/repositories/VoteRepository';
import { Confession } from '../../domain/entities/Confession';
import { BusinessError } from '../../domain/errors/AppError';
import { Vote } from '../../domain/entities/Vote';

// Mocks
const mockConfessionRepository: IConfessionRepository = {
  update: mock(async (id, data) => ({
    id,
    likes: (data.likes || 0),
    dislikes: (data.dislikes || 0),
    message: 'Test Confession',
    // ... other fields
  } as unknown as Confession)),
  findById: mock(async (id) => ({ id } as Confession)),
  // ... other methods
  create: mock(),
  delete: mock(),
  findAll: mock(),
  export: mock(),
  findSimilarByEmbedding: mock(),
};

const mockVoteRepository: IVoteRepository = {
  findByConfessionAndIp: mock(async (confessionId, ipHash) => null),
  create: mock(async (data) => ({ id: 1, ...data } as Vote)),
};

mock.module('../../infrastructure/websocket', () => ({
    broadcast: mock(() => {})
}));

describe('VoteOnConfession Use Case', () => {
  const voteOnConfession = new VoteOnConfession(mockConfessionRepository, mockVoteRepository);

  beforeEach(() => {
    mockVoteRepository.findByConfessionAndIp.mockClear().mockResolvedValue(null);
    mockConfessionRepository.update.mockClear();
  });

  it('should successfully record a vote and update the confession', async () => {
    const input = { confessionId: 1, value: 1 as const, ipHash: 'ip1' };

    await voteOnConfession.execute(input);

    expect(mockVoteRepository.findByConfessionAndIp).toHaveBeenCalledWith(input.confessionId, input.ipHash);
    expect(mockVoteRepository.create).toHaveBeenCalledWith(input);
    expect(mockConfessionRepository.update).toHaveBeenCalledWith(input.confessionId, { likes: 1 });
  });

  it('should throw a BusinessError if the user has already voted', async () => {
    const existingVote = { id: 1, confessionId: 1, ipHash: 'ip1', value: 1 } as Vote;
    mockVoteRepository.findByConfessionAndIp.mockResolvedValueOnce(existingVote);

    const input = { confessionId: 1, value: -1 as const, ipHash: 'ip1' };

    await expect(voteOnConfession.execute(input)).rejects.toThrow(new BusinessError('You already voted'));
  });

  it('should throw a BusinessError if the confession is not found', async () => {
    mockConfessionRepository.update.mockResolvedValueOnce(null);
    
    const input = { confessionId: 999, value: 1 as const, ipHash: 'ip2' };

    await expect(voteOnConfession.execute(input)).rejects.toThrow(new BusinessError('Confession not found'));
  });
});

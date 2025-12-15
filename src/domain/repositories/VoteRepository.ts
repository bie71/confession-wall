import { Vote } from "../entities/Vote";

export interface IVoteRepository {
  create(data: Omit<Vote, 'id' | 'createdAt'>): Promise<Vote>;
  findByConfessionAndIp(confessionId: number, ipHash: string): Promise<Vote | null>;
}

import { eq, and } from "drizzle-orm";
import { IVoteRepository } from "../../domain/repositories/VoteRepository";
import { Vote } from "../../domain/entities/Vote";
import { db, schema } from "./index";

export class DrizzleVoteRepository implements IVoteRepository {
  async create(data: Omit<Vote, 'id' | 'createdAt'>): Promise<Vote> {
    const result = await db.insert(schema.votes).values(data).returning();
    return result[0];
  }

  async findByConfessionAndIp(confessionId: number, ipHash: string): Promise<Vote | null> {
    const result = await db.select()
      .from(schema.votes)
      .where(and(eq(schema.votes.confessionId, confessionId), eq(schema.votes.ipHash, ipHash)));
      
    return result[0] || null;
  }
}

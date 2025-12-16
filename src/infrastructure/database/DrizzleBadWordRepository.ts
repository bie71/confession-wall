import { eq } from "drizzle-orm";
import { db } from ".";
import { badWords } from "./schema";
import { BadWord } from "../../domain/entities/BadWord";
import { BadWordRepository } from "../../domain/repositories/BadWordRepository";

export class DrizzleBadWordRepository implements BadWordRepository {
  async add(word: string): Promise<BadWord> {
    const [newBadWord] = await db.insert(badWords).values({ word }).returning();
    return new BadWord(newBadWord.id, newBadWord.word, newBadWord.createdAt);
  }

  async findById(id: number): Promise<BadWord | null> {
    const [found] = await db.select().from(badWords).where(eq(badWords.id, id));
    if (!found) {
      return null;
    }
    return new BadWord(found.id, found.word, found.createdAt);
  }

  async findByWord(word: string): Promise<BadWord | null> {
    const [found] = await db.select().from(badWords).where(eq(badWords.word, word));
    if (!found) {
      return null;
    }
    return new BadWord(found.id, found.word, found.createdAt);
  }

  async getAll(): Promise<BadWord[]> {
    const all = await db.select().from(badWords);
    return all.map(bw => new BadWord(bw.id, bw.word, bw.createdAt));
  }

  async update(id: number, newWord: string): Promise<void> {
    await db.update(badWords).set({ word: newWord }).where(eq(badWords.id, id));
  }

  async delete(id: number): Promise<void> {
    await db.delete(badWords).where(eq(badWords.id, id));
  }
}

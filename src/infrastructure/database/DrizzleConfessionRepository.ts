import { eq, and, or, sql, desc, count } from "drizzle-orm";
import {
  IConfessionRepository,
  FindAllConfessionsOptions,
  PaginatedConfessions,
} from "../../domain/repositories/ConfessionRepository";
import { Confession } from "../../domain/entities/Confession";
import { db, schema } from "./index";

export class DrizzleConfessionRepository implements IConfessionRepository {
  async create(data: Omit<Confession, 'id' | 'likes' | 'dislikes' | 'createdAt'> & { embedding: number[], userId?: number | null }): Promise<Confession> {
    const result = await db.insert(schema.confessions).values(data).returning();
    return result[0];
  }

  async update(id: number, data: Partial<Pick<Confession, 'status' | 'likes' | 'dislikes'>>): Promise<Confession | null> {
    let updatedConfession: Confession[] = [];
    if (data.likes) {
      updatedConfession = await db.update(schema.confessions)
        .set({ likes: sql`${schema.confessions.likes} + 1` })
        .where(eq(schema.confessions.id, id))
        .returning();
    } else if (data.dislikes) {
      updatedConfession = await db.update(schema.confessions)
        .set({ dislikes: sql`${schema.confessions.dislikes} + 1` })
        .where(eq(schema.confessions.id, id))
        .returning();
    } else {
      updatedConfession = await db.update(schema.confessions).set(data).where(eq(schema.confessions.id, id)).returning();
    }
    return updatedConfession[0] || null;
  }

  async delete(id: number): Promise<void> {
    await db.delete(schema.confessions).where(eq(schema.confessions.id, id));
  }

  async findById(id: number): Promise<Confession | null> {
    const result = await db.select().from(schema.confessions).where(eq(schema.confessions.id, id));
    return result[0] || null;
  }

  async findAll(options: FindAllConfessionsOptions): Promise<PaginatedConfessions> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;

    const whereConditions = [];
    if (options.query) {
        whereConditions.push(or(
            sql`message ILIKE ${'%' + options.query + '%'}`,
            sql`name ILIKE ${'%' + options.query + '%'}`
        ));
    }
    if (options.status) {
        whereConditions.push(eq(schema.confessions.status, options.status));
    }
    
    const where = and(...whereConditions);

    const totalResult = await db.select({ value: count() }).from(schema.confessions).where(where);
    const total = totalResult[0].value;

    const items = await db.select()
      .from(schema.confessions)
      .where(where)
      .orderBy(desc(schema.confessions.createdAt), desc(schema.confessions.id))
      .limit(limit)
      .offset(offset);

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async export(options: Omit<FindAllConfessionsOptions, 'page' | 'limit'>): Promise<Confession[]> {
    const whereConditions = [];
    if (options.query) {
        whereConditions.push(or(
            sql`message ILIKE ${'%' + options.query + '%'}`,
            sql`name ILIKE ${'%' + options.query + '%'}`
        ));
    }
    if (options.status) {
        whereConditions.push(eq(schema.confessions.status, options.status));
    }

    const where = and(...whereConditions);
    
    return db.select().from(schema.confessions).where(where).orderBy(desc(schema.confessions.createdAt), desc(schema.confessions.id));
  }

  async findSimilarByEmbedding(embedding: number[]): Promise<Confession | null> {
    const similarityThreshold = 0.1; // Lower is more similar (closer to 0)
    // Use the pgvector <=> operator directly for cosine distance
    const result = await db.select()
        .from(schema.confessions)
        .where(sql`${schema.confessions.embedding} <=> ${sql.raw(`'${JSON.stringify(embedding)}'`)} < ${similarityThreshold}`)
        .limit(1);
    
    return result[0] || null;
  }
}

import { eq, and } from "drizzle-orm";
import {
  IConfessionRepository,
  FindAllConfessionsOptions,
  PaginatedConfessions,
} from "../../domain/repositories/ConfessionRepository";
import { Confession } from "../../domain/entities/Confession";
import { db, schema } from "./index";

export class DrizzleConfessionRepository implements IConfessionRepository {
  async create(data: Omit<Confession, 'id' | 'likes' | 'dislikes' | 'createdAt'>): Promise<Confession> {
    const result = await db.insert(schema.confessions).values(data).returning().get();
    return result as Confession;
  }

  async update(id: number, data: Partial<Pick<Confession, 'status' | 'likes' | 'dislikes'>>): Promise<Confession | null> {
    if (data.likes) {
      await db.execute({ sql: `UPDATE confessions SET likes = likes + ? WHERE id = ?`, params: [data.likes, id] });
    } else if (data.dislikes) {
      await db.execute({ sql: `UPDATE confessions SET dislikes = dislikes + ? WHERE id = ?`, params: [data.dislikes, id] });
    } else {
      await db.update(schema.confessions).set(data).where(eq(schema.confessions.id, id)).run();
    }
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await db.delete(schema.confessions).where(eq(schema.confessions.id, id)).run();
  }

  async findById(id: number): Promise<Confession | null> {
    const result = await db.select().from(schema.confessions).where(eq(schema.confessions.id, id)).get();
    return result as Confession || null;
  }

  async findAll(options: FindAllConfessionsOptions): Promise<PaginatedConfessions> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;

    const params: any[] = [];
    const wh: string[] = [];

    if (options.query) {
      wh.push("(message LIKE ? OR IFNULL(name,'') LIKE ?)");
      params.push(`%${options.query}%`, `%${options.query}%`);
    }
    if (options.status) {
      wh.push("status = ?");
      params.push(options.status);
    }
    const where = wh.length ? ("WHERE " + wh.join(" AND ")) : "";

    const countResult = await db.execute({ sql: `SELECT COUNT(*) as c FROM confessions ${where}`, params });
    const total = Number(countResult.rows?.[0]?.c || 0);

    const itemsResult = await db.execute({
      sql: `SELECT * FROM confessions ${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
      params: [...params, limit, offset],
    });

    return {
      items: itemsResult.rows as Confession[] ?? [],
      total,
      page,
      limit,
    };
  }

  async export(options: Omit<FindAllConfessionsOptions, 'page' | 'limit'>): Promise<Confession[]> {
    const params:any[] = [];
    const wh: string[] = [];
    if (options.query) {
      wh.push("(message LIKE ? OR IFNULL(name,'') LIKE ?)");
      params.push(`%${options.query}%`, `%${options.query}%`);
    }
    if (options.status) {
      wh.push("status = ?");
      params.push(options.status);
    }
    const where = wh.length ? ("WHERE " + wh.join(" AND ")) : "";

    const result = await db.execute({
      sql: `SELECT id, name, message, likes, dislikes, created_at, status FROM confessions ${where} ORDER BY created_at DESC, id DESC`,
      params
    });
    return result.rows as Confession[];
  }
}

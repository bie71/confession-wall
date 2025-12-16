import { eq, count } from 'drizzle-orm';
import { IUserRepository, UserCreationData } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';
import { db, schema } from './index';

export class DrizzleUserRepository implements IUserRepository {
  async create(data: UserCreationData & { password: string }): Promise<Omit<User, 'password'>> {
    const [newUser] = await db.insert(schema.users).values(data).returning({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        role: schema.users.role,
        createdAt: schema.users.createdAt,
    });
    return newUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user[0] || null;
  }

  async findById(id: number): Promise<Omit<User, 'password'> | null> {
    const [user] = await db.select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        role: schema.users.role,
        createdAt: schema.users.createdAt,
    }).from(schema.users).where(eq(schema.users.id, id));
    return user || null;
  }

  async findAll(params: { page: number, limit: number }): Promise<{ items: Omit<User, 'password'>[], total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const items = await db.select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        role: schema.users.role,
        createdAt: schema.users.createdAt,
    }).from(schema.users).limit(limit).offset(offset);

    const [totalResult] = await db.select({ total: count() }).from(schema.users);
    
    return { items, total: totalResult.total };
  }

  async update(id: number, data: Partial<Omit<User, 'id' | 'createdAt' | 'password'>>): Promise<void> {
    await db.update(schema.users).set(data).where(eq(schema.users.id, id));
  }

  async delete(id: number): Promise<void> {
    // Be careful with cascading deletes if relations are added
    await db.delete(schema.users).where(eq(schema.users.id, id));
  }
}

import { eq } from 'drizzle-orm';
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
}

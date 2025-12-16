import { User } from '../entities/User';

export type UserCreationData = Omit<User, 'id' | 'createdAt' | 'role'>;

export interface IUserRepository {
  create(data: UserCreationData & { password: string }): Promise<Omit<User, 'password'>>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<Omit<User, 'password'> | null>;
  findAll(params: { page: number, limit: number }): Promise<{ items: Omit<User, 'password'>[], total: number }>;
  update(id: number, data: Partial<Omit<User, 'id' | 'createdAt' | 'password'>>): Promise<void>;
  delete(id: number): Promise<void>;
}

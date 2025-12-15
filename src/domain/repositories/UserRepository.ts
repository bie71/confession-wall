import { User } from '../entities/User';

export type UserCreationData = Omit<User, 'id' | 'createdAt' | 'role'>;

export interface IUserRepository {
  create(data: UserCreationData & { password: string }): Promise<Omit<User, 'password'>>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<Omit<User, 'password'> | null>;
}

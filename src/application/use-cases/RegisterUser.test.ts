import { describe, it, expect, mock } from 'bun:test';
import { RegisterUser } from './RegisterUser';
import { IUserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';

const mockUserRepository: IUserRepository = {
  create: mock(async (data) => ({
    id: 1,
    name: data.name,
    email: data.email,
    role: 'user',
    createdAt: new Date(),
  })),
  findByEmail: mock(async (email: string) => null),
  findById: mock(async (id: number) => null),
};

describe('RegisterUser Use Case', () => {
  const registerUser = new RegisterUser(mockUserRepository);

  it('should create a new user successfully', async () => {
    const input = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
    };
    
    mockUserRepository.findByEmail.mockResolvedValueOnce(null);

    const result = await registerUser.execute(input);

    expect(result).toBeDefined();
    expect(result.email).toBe(input.email);
    expect(mockUserRepository.create).toHaveBeenCalled();
  });

  it('should throw an error if passwords do not match', async () => {
    const input = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      passwordConfirmation: 'password456',
    };
    
    await expect(registerUser.execute(input)).rejects.toThrow('Password and confirmation do not match.');
  });

  it('should throw an error if email already exists', async () => {
    const input = {
      name: 'Test User',
      email: 'exists@example.com',
      password: 'password123',
      passwordConfirmation: 'password123',
    };

    mockUserRepository.findByEmail.mockResolvedValueOnce({
        id: 2, name: 'Existing', email: 'exists@example.com', role: 'user', createdAt: new Date()
    });

    await expect(registerUser.execute(input)).rejects.toThrow('An account with this email already exists.');
  });
});

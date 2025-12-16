import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { ListUsers } from './ListUsers';
import { UpdateUser } from './UpdateUser';
import { DeleteUser } from './DeleteUser';
import { IUserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';

const mockUser: Omit<User, 'password'> = { id: 1, name: 'Test', email: 'test@test.com', role: 'user', createdAt: new Date() };

const mockUserRepository: IUserRepository = {
  findAll: mock(async () => ({ items: [mockUser], total: 1 })),
  findById: mock(async (id) => (id === 1 ? mockUser : null)),
  findByEmail: mock(async (email) => (email === 'exists@test.com' ? { ...mockUser, id: 2, email } as User : null)),
  update: mock(async () => {}),
  delete: mock(async () => {}),
  create: mock(async () => mockUser),
};

describe('User Management Use Cases', () => {
    const listUsers = new ListUsers(mockUserRepository);
    const updateUser = new UpdateUser(mockUserRepository);
    const deleteUser = new DeleteUser(mockUserRepository);

    beforeEach(() => {
        mockUserRepository.findAll.mockClear();
        mockUserRepository.findById.mockClear();
        mockUserRepository.findByEmail.mockClear();
        mockUserRepository.update.mockClear();
        mockUserRepository.delete.mockClear();
    });

    // ListUsers
    it('List: should return users', async () => {
        const result = await listUsers.execute({ page: 1, limit: 10 });
        expect(result.items).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(mockUserRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    // UpdateUser
    it('Update: should update a user', async () => {
        await updateUser.execute(1, { name: 'New Name' });
        expect(mockUserRepository.update).toHaveBeenCalledWith(1, { name: 'New Name' });
    });

    it('Update: should throw if user not found', async () => {
        mockUserRepository.findById.mockResolvedValueOnce(null);
        await expect(updateUser.execute(99, {})).rejects.toThrow('User not found');
    });

    it('Update: should throw if email is already taken', async () => {
        await expect(updateUser.execute(1, { email: 'exists@test.com' })).rejects.toThrow('Email already in use');
    });

    // DeleteUser
    it('Delete: should delete a user', async () => {
        await deleteUser.execute(1);
        expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });

    it('Delete: should throw if user not found', async () => {
        mockUserRepository.findById.mockResolvedValueOnce(null);
        await expect(deleteUser.execute(99)).rejects.toThrow('User not found');
    });
});

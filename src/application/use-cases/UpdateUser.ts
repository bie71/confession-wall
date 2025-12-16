import { IUserRepository } from "../../domain/repositories/UserRepository";
import { BusinessError } from "../../domain/errors/AppError";

type UpdateData = {
    name?: string;
    email?: string;
    role?: 'user' | 'admin';
}
export class UpdateUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: number, data: UpdateData) {
    const user = await this.userRepository.findById(id);
    if (!user) {
        throw new BusinessError('User not found');
    }

    if (data.email && data.email !== user.email) {
        const existing = await this.userRepository.findByEmail(data.email);
        if (existing) {
            throw new BusinessError('Email already in use');
        }
    }

    return this.userRepository.update(id, data);
  }
}

import { IUserRepository } from "../../domain/repositories/UserRepository";

export class DeleteUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
        throw new Error('User not found');
    }
    // TODO: Maybe add a check to prevent deleting the last admin
    return this.userRepository.delete(id);
  }
}

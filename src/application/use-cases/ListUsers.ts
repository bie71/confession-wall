import { IUserRepository } from "../../domain/repositories/UserRepository";

export class ListUsers {
  constructor(private userRepository: IUserRepository) {}

  async execute(params: { page: number, limit: number }) {
    return this.userRepository.findAll(params);
  }
}

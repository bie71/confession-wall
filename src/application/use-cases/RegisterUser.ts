import { IUserRepository, UserCreationData } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';
import logger from '../../infrastructure/logger';

export class RegisterUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: UserCreationData & { passwordConfirmation: string }): Promise<Omit<User, 'password'>> {
    const { email, password, passwordConfirmation } = data;

    if (password !== passwordConfirmation) {
      throw new Error('Password and confirmation do not match.');
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('An account with this email already exists.');
    }

    const hashedPassword = await Bun.password.hash(password, {
      algorithm: 'bcrypt',
      cost: 10,
    });

    logger.info({ email }, 'Registering new user');
    const newUser = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    return newUser;
  }
}

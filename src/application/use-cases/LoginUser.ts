import { sign } from 'hono/jwt';
import { IUserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';
import logger from '../../infrastructure/logger';
import { BusinessError, TechnicalError } from '../../domain/errors/AppError';

export class LoginUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(credentials: Pick<User, 'email' | 'password'>): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new BusinessError('Email and password are required.');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.password) {
      throw new BusinessError('Invalid email or password.');
    }

    const isPasswordValid = await Bun.password.verify(password, user.password);
    if (!isPasswordValid) {
      throw new BusinessError('Invalid email or password.');
    }
    
    logger.info({ email }, 'User logged in successfully');
    
    const payload = {
      sub: user.id,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
    };
    
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        const err = new Error('JWT_SECRET is not set in environment variables.');
        throw new TechnicalError('Server configuration error.', err);
    }

    const token = await sign(payload, secret);
    
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }
}

import { describe, it, expect, mock, spyOn } from "bun:test";
import { LoginUser } from "./LoginUser";
import { IUserRepository } from "../../domain/repositories/UserRepository";
import { User } from "../../domain/entities/User";
import { BusinessError } from "../../domain/errors/AppError";

describe("LoginUser Use Case", () => {
  it("should throw BusinessError for invalid credentials", async () => {
    const mockUserRepository: IUserRepository = {
      findByEmail: mock(async (email: string) => {
        if (email === "test@example.com") {
          return { id: 1, email, password: "hashed_password", role: 'USER' } as User;
        }
        return null;
      }),
      findById: mock(),
      save: mock(),
      delete: mock(),
      findAll: mock(),
      update: mock(),
    };

    // Mock Bun.password.verify to return false
    const verifySpy = spyOn(Bun.password, "verify").mockResolvedValue(false);

    const loginUser = new LoginUser(mockUserRepository);

    const credentials = {
      email: "test@example.com",
      password: "wrong_password",
    };

    const loginPromise = loginUser.execute(credentials);

    expect(loginPromise).rejects.toThrow(new BusinessError("Invalid email or password."));

    // Restore the original function
    verifySpy.mockRestore();
  });

  it("should throw BusinessError if user is not found", async () => {
    const mockUserRepository: IUserRepository = {
      findByEmail: mock(async (email: string) => null),
      findById: mock(),
      save: mock(),
      delete: mock(),
      findAll: mock(),
      update: mock(),
    };

    const loginUser = new LoginUser(mockUserRepository);

    const credentials = {
      email: "notfound@example.com",
      password: "any_password",
    };

    const loginPromise = loginUser.execute(credentials);

    expect(loginPromise).rejects.toThrow(new BusinessError("Invalid email or password."));
  });

  it('should throw BusinessError if email or password are not provided', async () => {
    const mockUserRepository: IUserRepository = {
      findByEmail: mock(),
      findById: mock(),
      save: mock(),
      delete: mock(),
      findAll: mock(),
      update: mock(),
    };

    const loginUser = new LoginUser(mockUserRepository);

    await expect(loginUser.execute({ email: '', password: 'password' })).rejects.toThrow(new BusinessError('Email and password are required.'));
    await expect(loginUser.execute({ email: 'email@test.com', password: '' })).rejects.toThrow(new BusinessError('Email and password are required.'));
  });
});

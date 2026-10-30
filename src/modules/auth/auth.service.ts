import bcrypt from "bcryptjs";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../config/tokens";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../shared/errors";
import { signToken } from "../../shared/jwt";
import type { LoginInput, RegisterInput } from "./auth.schemas";
import type { IUser } from "./user.model";
import type { IUserRepository } from "./user.repository";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
}

export interface AuthResult {
  user: UserDTO;
  token: string;
}

const toUserDTO = (user: IUser): UserDTO => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
});

@injectable()
export class AuthService {
  constructor(
    @inject(TOKENS.UserRepository) private readonly users: IUserRepository,
  ) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const userAlreadyExist = await this.users.findByEmail(input.email);
    if (userAlreadyExist) {
      throw new ConflictError("An account with this email already exists");
    }
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.users.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const signedToken = signToken(user._id.toString());

    return { user: toUserDTO(user), token: signedToken };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.users.findByEmail(input.email, true);
    // Same message for unknown email and wrong password to avoid account enumeration.
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new UnauthorizedError("Invalid email or password");
    }
    const signedToken = signToken(user._id.toString());

    return { user: toUserDTO(user), token: signedToken };
  }

  async getProfile(userId: string): Promise<UserDTO> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return toUserDTO(user);
  }
}

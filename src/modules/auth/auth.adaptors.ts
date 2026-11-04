import type { LoginInput, RegisterInput } from "./auth.schemas";
import { ObjectID } from "../../types/types";
import { IUser } from "./user.model";



export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export interface IUserRepository {
  findById(id: string): Promise<IUser | null>;
  /** Returns the password hash only when `withPassword` is true. */
  findByEmail(email: string, withPassword?: boolean): Promise<IUser | null>;
  create(data: CreateUserData): Promise<IUser>;
}


export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, currentPassword: string): Promise<boolean>;

}


export interface UserDTO {
  id: string;
  name: string;
  email: string;
}

export interface AuthResult {
  user: UserDTO;
  token: string;
}


export interface IAuthService {

  register(input: RegisterInput): Promise<AuthResult>;

  login(input: LoginInput): Promise<AuthResult>;

  getProfile(userId: string): Promise<UserDTO>;
}

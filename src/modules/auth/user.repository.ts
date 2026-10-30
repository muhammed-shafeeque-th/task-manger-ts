import { injectable } from 'tsyringe';
import { UserModel, type IUser } from './user.model';

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

@injectable()
export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).lean<IUser>();
  }

  async findByEmail(email: string, withPassword = false): Promise<IUser | null> {
    const query = UserModel.findOne({ email: email.toLowerCase() });
    if (withPassword) query.select('+passwordHash');
    return query.lean<IUser>();
  }

  async create(data: CreateUserData): Promise<IUser> {
    const doc = await UserModel.create(data);
    return doc.toObject() as IUser;
  }
}

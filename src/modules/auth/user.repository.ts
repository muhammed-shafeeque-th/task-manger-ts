import { injectable } from "tsyringe";
import { IUser, UserModel } from "./user.model";
import type { CreateUserData, IUserRepository } from "./auth.adaptors";

@injectable()
export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).lean<IUser>();
  }

  async findByEmail(
    email: string,
    withPassword = false,
  ): Promise<IUser | null> {
    const query = UserModel.findOne({ email: email.toLowerCase() });
    if (withPassword) query.select("+passwordHash");
    return query.lean<IUser>();
  }

  async create(data: CreateUserData): Promise<IUser> {
    const doc = await UserModel.create(data);
    return doc.toObject() as IUser;
  }
}

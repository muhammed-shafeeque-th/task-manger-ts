import { injectable } from "tsyringe";
import { IPasswordHasher } from "./auth.adaptors";
import bcrypt from "bcryptjs";

@injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  public async verify(
    password: string,
    currentPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, currentPassword);
  }
}

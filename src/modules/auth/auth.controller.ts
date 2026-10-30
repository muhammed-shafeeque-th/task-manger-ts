import { inject, injectable } from "tsyringe";
import { asyncHandler } from "../../shared/async-handler";
import { AuthService } from "./auth.service";

@injectable()
export class AuthController {
  constructor(@inject(AuthService) private readonly auth: AuthService) {}

  register = asyncHandler(async (req, res) => {
    const registeredUser = await this.auth.register(req.body);

    res.status(201).json(registeredUser);
  });

  login = asyncHandler(async (req, res) => {
    const loggedUser = await this.auth.login(req.body);
    res.json(loggedUser);
  });

  me = asyncHandler(async (req, res) => {
    const userProfile = await this.auth.getProfile(req.userId!);
    res.json({ user: userProfile });
  });
}

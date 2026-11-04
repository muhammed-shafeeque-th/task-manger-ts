import { inject, injectable } from "tsyringe";
import { asyncHandler } from "../../shared/async-handler";
import { TOKENS } from "../../config/tokens";
import { IAuthService } from "./auth.adaptors";

@injectable()
export class AuthController {
  constructor(
    @inject(TOKENS.AuthService) private readonly authService: IAuthService,
  ) {}

  register = asyncHandler(async (req, res) => {
    const registeredUser = await this.authService.register(req.body);

    res.status(201).json(registeredUser);
  });

  login = asyncHandler(async (req, res) => {
    const loggedUser = await this.authService.login(req.body);
    res.json(loggedUser);
  });

  me = asyncHandler(async (req, res) => {
    const userProfile = await this.authService.getProfile(req.userId!);
    res.json({ user: userProfile });
  });
}

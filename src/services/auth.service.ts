import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { ApiError } from "../errors/api-error.js";
import { authRepository } from "../repositories/auth.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import {
  createRefreshToken,
  hashToken,
  signAccessToken,
} from "../utils/tokens.js";
import type {
  LoginInput,
  RegisterInput,
} from "../validators/auth.validator.js";

function issueRefreshExpiry(): Date {
  return new Date(Date.now() + env.REFRESH_TOKEN_DAYS * 86_400_000);
}

export const authService = {
  async register(input: RegisterInput) {
    if (await userRepository.findByEmail(input.email))
      throw new ApiError(
        409,
        "An account with this email already exists",
        "EMAIL_EXISTS",
      );

    const hash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);
    const user = await userRepository.create(input.fullName, input.email, hash);
    const refreshToken = createRefreshToken();
    await authRepository.saveRefreshToken(
      user.id,
      hashToken(refreshToken),
      issueRefreshExpiry(),
    );
    return { user, accessToken: signAccessToken(user.id), refreshToken };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash)))
      throw new ApiError(
        401,
        "Invalid email or password",
        "INVALID_CREDENTIALS",
      );

    const refreshToken = createRefreshToken();
    await authRepository.saveRefreshToken(
      user.id,
      hashToken(refreshToken),
      issueRefreshExpiry(),
    );

    const { passwordHash: _passwordHash, ...safeUser } = user;
    return {
      user: safeUser,
      accessToken: signAccessToken(user.id),
      refreshToken,
    };
  },

  async refresh(token: string) {
    const refreshToken = createRefreshToken();
    const userId = await authRepository.rotateRefreshToken(
      hashToken(token),
      hashToken(refreshToken),
      issueRefreshExpiry(),
    );

    if (!userId)
      throw new ApiError(
        401,
        "Refresh token is invalid, expired, or already used",
        "INVALID_REFRESH_TOKEN",
      );
    return { accessToken: signAccessToken(userId), refreshToken };
  },

  async logout(token: string): Promise<void> {
    await authRepository.deleteRefreshToken(hashToken(token));
  },
};

import type { RequestHandler } from "express";
import { authService } from "../services/auth.service.js";
import {
  loginSchema,
  refreshSchema,
  registerSchema,
} from "../validators/auth.validator.js";
import { ApiError } from "../errors/api-error.js";
import { userRepository } from "../repositories/user.repository.js";

export const register: RequestHandler = async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    return res.status(201).json({
      success: true,
      message: "Account created",
      data: result,
    });
  } catch (e) {
    return next(e);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    return res.status(200).json({ success: true, data: result });
  } catch (e) {
    return next(e);
  }
};

export const refresh: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const data = await authService.refresh(refreshToken);
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return next(e);
  }
};

export const logout: RequestHandler = async (req, res, next) => {
  try {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success)
      throw new ApiError(
        400,
        "A valid refreshToken is required",
        "VALIDATION_ERROR",
      );
    await authService.logout(parsed.data.refreshToken);
    return res.status(204).send();
  } catch (e) {
    return next(e);
  }
};

export const me: RequestHandler = async (req, res, next) => {
  try {
    const user = await userRepository.findById(req.user!.userId);
    if (!user) throw new ApiError(404, "User not found", "USER_NOT_FOUND");
    return res.status(200).json({ success: true, data: user });
  } catch (e) {
    return next(e);
  }
};

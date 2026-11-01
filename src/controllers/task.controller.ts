import type { RequestHandler } from "express";
import { ApiError } from "../errors/api-error.js";
import { taskService } from "../services/task.service.js";
import {
  createTaskSchema,
  taskQuerySchema,
  updateTaskSchema,
} from "../validators/task.validator.js";

const userId = (req: Express.Request): string => {
  if (!req.user)
    throw new ApiError(401, "Authentication required", "AUTH_REQUIRED");

  return req.user.userId;
};

const idSchema = (value: string): string => {
  if (!/^[1-9]\d*$/.test(value))
    throw new ApiError(400, "Task id must be a positive integer", "INVALID_ID");
  return value;
};

export const create: RequestHandler = async (req, res, next) => {
  try {
    const input = createTaskSchema.parse(req.body);
    const task = await taskService.create(userId(req), input);
    return res.status(201).json({ success: true, data: task });
  } catch (e) {
    return next(e);
  }
};

export const list: RequestHandler = async (req, res, next) => {
  try {
    const query = taskQuerySchema.parse(req.query);
    const result = await taskService.list(userId(req), query);
    const totalPages = Math.ceil(result.total / query.limit);

    return res.status(200).json({
      success: true,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1,
      },
      results: result.tasks.length,
      data: result.tasks,
    });
  } catch (e) {
    return next(e);
  }
};

export const getOne: RequestHandler<{ id: string }> = async (
  req,
  res,
  next,
) => {
  try {
    return res.status(200).json({
      success: true,
      data: await taskService.get(userId(req), idSchema(req.params.id)),
    });
  } catch (e) {
    return next(e);
  }
};

export const update: RequestHandler<{ id: string }> = async (
  req,
  res,
  next,
) => {
  try {
    const input = updateTaskSchema.parse(req.body);
    return res.status(200).json({
      success: true,
      data: await taskService.update(
        userId(req),
        idSchema(req.params.id),
        input,
      ),
    });
  } catch (e) {
    return next(e);
  }
};

export const remove: RequestHandler<{ id: string }> = async (
  req,
  res,
  next,
) => {
  try {
    await taskService.remove(userId(req), idSchema(req.params.id));
    return res.status(204).send();
  } catch (e) {
    return next(e);
  }
};

export const stats: RequestHandler = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: await taskService.stats(userId(req)),
    });
  } catch (e) {
    return next(e);
  }
};

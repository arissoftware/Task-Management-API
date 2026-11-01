import { ApiError } from "../errors/api-error.js";
import { taskRepository } from "../repositories/task.repository.js";
import type {
  CreateTaskInput,
  TaskQuery,
  UpdateTaskInput,
} from "../validators/task.validator.js";

export const taskService = {
  create(userId: string, input: CreateTaskInput) {
    return taskRepository.create(userId, input);
  },

  list(userId: string, query: TaskQuery) {
    return taskRepository.list(userId, query);
  },

  async get(userId: string, id: string) {
    const task = await taskRepository.findById(userId, id);
    if (!task) throw new ApiError(404, "Task not found", "TASK_NOT_FOUND");
    return task;
  },

  async update(userId: string, id: string, input: UpdateTaskInput) {
    const task = await taskRepository.update(userId, id, input);
    if (!task) throw new ApiError(404, "Task not found", "TASK_NOT_FOUND");
    return task;
  },

  async remove(userId: string, id: string) {
    if (!(await taskRepository.softDelete(userId, id)))
      throw new ApiError(404, "Task not found", "TASK_NOT_FOUND");
  },

  stats(userId: string) {
    return taskRepository.stats(userId);
  },
};
